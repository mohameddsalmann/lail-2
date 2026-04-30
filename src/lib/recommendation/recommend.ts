/**
 * Recommendation Orchestrator
 *
 * Main entry point for the perfume recommendation system.
 * Applies hard filters → minimum match gate → scoring → confidence tiers → top N results.
 *
 * Uses a 3-stage fallback: strict → relaxed match ratio → lower score floor.
 * ALWAYS guarantees at least 3 recommendations — never shows "no match found".
 */

import { Perfume, QuizAnswers, RecommendationResult, RecommendationOutput, ConfidenceLevel } from '@/types';
import { RECOMMENDATION_CONFIG } from './config';
import { anyMatch, countMatches, resolveSynonym } from './fuzzyMatch';
import { getUserCategories, getPerfumeCategories, setIntersection, NoteCategory } from './noteCategories';
import {
  scoreNoteMatch,
  scoreCategoryAffinity,
  scoreSeason,
  scoreIntensity,
  scoreGender,
  scoreInspiredBonus,
  scoreRichProfile,
  scoreCrowdFavorite,
  generateMatchReason,
} from './scoring';

// --- User Input Normalization (BUG 3 + BUG 4 fix) ---

/**
 * Normalize user input notes before they enter the pipeline.
 * - Deduplicates (fixes BUG 4: duplicate notes inflating scores)
 * - Lowercases and trims
 * - Resolves synonyms (fixes BUG 3: misspellings failing at gate)
 */
function normalizeUserNotes(notes: string[]): string[] {
  return [...new Set(
    notes
      .map(n => n.toLowerCase().trim())
      .map(n => resolveSynonym(n))
  )];
}

// --- Hard Filters ---

function passesGenderFilter(perfume: Perfume, answers: QuizAnswers): boolean {
  if (!answers.gender || answers.gender === 'unisex') return true;
  if (answers.gender === 'male') {
    return perfume.gender === 'male' || perfume.gender === 'unisex';
  }
  if (answers.gender === 'female') {
    return perfume.gender === 'female' || perfume.gender === 'unisex';
  }
  return true;
}

function passesAvoidedNotesFilter(perfume: Perfume, answers: QuizAnswers): boolean {
  if (!answers.avoidedNotes || answers.avoidedNotes.length === 0) return true;
  if (answers.avoidedNotes.includes('none')) return true;

  const allPerfumeNotes = perfume.mainNotes && perfume.mainNotes.length > 0
    ? perfume.mainNotes
    : [...perfume.notes.top, ...perfume.notes.middle, ...perfume.notes.base];

  for (const avoidedNote of answers.avoidedNotes) {
    if (avoidedNote === 'none') continue;
    if (anyMatch(avoidedNote, allPerfumeNotes)) {
      return false;
    }
  }

  return true;
}

function passesStockFilter(perfume: Perfume): boolean {
  return perfume.inStock;
}

// --- Minimum Match Gate (updated: min 1 + category overlap pass) ---

/**
 * Dynamic match gate with category overlap fallback.
 *
 * Passes if EITHER:
 * 1. Direct note matches >= minimumRequired (Math.max(1, ceil(noteCount * ratio)))
 * 2. User and perfume share >= 2 note categories (even with 0 direct matches)
 */
function passesDynamicMatchGate(
  perfume: Perfume,
  answers: QuizAnswers,
  ratio: number
): boolean {
  const favoriteNotes = answers.favoriteNotes || [];
  if (favoriteNotes.length === 0 || favoriteNotes.includes('none')) return true;

  const allPerfumeNotes = perfume.mainNotes && perfume.mainNotes.length > 0
    ? perfume.mainNotes
    : [...perfume.notes.top, ...perfume.notes.middle, ...perfume.notes.base];

  // Direct note match count
  const matchedUserIndices = countMatches(favoriteNotes, allPerfumeNotes);
  const directMatchCount = matchedUserIndices.size;

  const minimumRequired = Math.max(1, Math.ceil(allPerfumeNotes.length * ratio));

  if (directMatchCount >= minimumRequired) return true;

  // Category overlap fallback: if user and perfume share ≥2 categories, pass anyway
  const userCats = getUserCategories(favoriteNotes);
  const perfumeCats = getPerfumeCategories(allPerfumeNotes);
  const sharedCategories = setIntersection(userCats, perfumeCats);

  if (sharedCategories.size >= 2) return true;

  return false;
}

// --- Full Scoring Pipeline ---

interface ScoringDetail {
  result: RecommendationResult;
  matchedNotes: string[];
  sharedCategories: NoteCategory[];
  seasonMatch: 'direct' | 'allSeasons' | 'inferred' | 'none';
  intensityDiff: number;
}

function scorePerfume(
  answers: QuizAnswers,
  perfume: Perfume
): ScoringDetail {
  const weights = RECOMMENDATION_CONFIG.SCORE_WEIGHTS;
  let totalScore = 0;
  const allReasons: string[] = [];

  // Note match + position weighting (35 pts max)
  const noteResult = scoreNoteMatch(answers, perfume, weights.notePosition);
  totalScore += noteResult.score;
  allReasons.push(...noteResult.reasons);

  // Category affinity (15 pts max) — NEW
  const categoryResult = scoreCategoryAffinity(answers, perfume, weights.categoryAffinity);
  totalScore += categoryResult.score;
  allReasons.push(...categoryResult.reasons);

  // Season match (15 pts max)
  const seasonResult = scoreSeason(answers, perfume, weights.season);
  totalScore += seasonResult.score;
  allReasons.push(...seasonResult.reasons);

  // Determine season match type for match reason
  let seasonMatch: 'direct' | 'allSeasons' | 'inferred' | 'none' = 'none';
  if (answers.season && answers.season !== 'all') {
    if (perfume.seasons?.map(s => s.toLowerCase()).includes(answers.season.toLowerCase())) {
      seasonMatch = 'direct';
    } else if (perfume.seasons?.map(s => s.toLowerCase()).includes('all')) {
      seasonMatch = 'allSeasons';
    } else if (seasonResult.score >= weights.season * 0.7) {
      seasonMatch = 'inferred';
    }
  } else if (answers.season === 'all' || !answers.season) {
    if (perfume.seasons?.map(s => s.toLowerCase()).includes('all')) {
      seasonMatch = 'allSeasons';
    }
  }

  // Intensity match (10 pts max)
  const intensityResult = scoreIntensity(answers, perfume, weights.intensity);
  totalScore += intensityResult.score;
  allReasons.push(...intensityResult.reasons);

  // Gender match (10 pts max)
  const genderResult = scoreGender(answers, perfume, weights.genderMatch);
  totalScore += genderResult.score;
  allReasons.push(...genderResult.reasons);

  // Inspired-by bonus (5 pts max)
  const inspiredResult = scoreInspiredBonus(perfume, weights.inspiredBonus);
  totalScore += inspiredResult.score;
  allReasons.push(...inspiredResult.reasons);

  // Rich profile bonus (5 pts max)
  const richResult = scoreRichProfile(perfume, weights.richProfile);
  totalScore += richResult.score;
  allReasons.push(...richResult.reasons);

  // Crowd favorite bonus (5 pts max) — NEW
  const crowdResult = scoreCrowdFavorite(perfume, weights.crowdFavorite);
  totalScore += crowdResult.score;
  allReasons.push(...crowdResult.reasons);

  // Cap total score at 99
  const normalizedScore = Math.min(Math.round(totalScore), 99);

  // Generate human-readable match reason
  const matchReason = generateMatchReason(answers, perfume, {
    matchedNotes: noteResult.matchedNotes,
    sharedCategories: categoryResult.sharedCategories,
    seasonMatch,
    intensityDiff: intensityResult.intensityDiff,
  });

  return {
    result: {
      perfume,
      matchScore: normalizedScore,
      matchReasons: allReasons.slice(0, 4),
      matchReason,
    },
    matchedNotes: noteResult.matchedNotes,
    sharedCategories: categoryResult.sharedCategories,
    seasonMatch,
    intensityDiff: intensityResult.intensityDiff,
  };
}

// --- Scoring Loop ---

interface ScoringOptions {
  matchRatio: number;
  minScore: number;
}

function runScoring(
  answers: QuizAnswers,
  perfumeList: Perfume[],
  options: ScoringOptions
): RecommendationResult[] {
  const results: RecommendationResult[] = [];

  for (const perfume of perfumeList) {
    if (!passesGenderFilter(perfume, answers)) continue;
    if (!passesAvoidedNotesFilter(perfume, answers)) continue;
    if (!passesStockFilter(perfume)) continue;
    if (!passesDynamicMatchGate(perfume, answers, options.matchRatio)) continue;

    const detail = scorePerfume(answers, perfume);

    if (detail.result.matchScore >= options.minScore) {
      results.push(detail.result);
    }
  }

  return results
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, RECOMMENDATION_CONFIG.MAX_RESULTS);
}

// --- Confidence Tiers & Guaranteed Minimum ---

/**
 * Determine confidence level and guarantee at least MIN_GUARANTEED_RESULTS recommendations.
 * NEVER returns an empty list — always provides at least 3 results.
 */
function getRecommendations(
  scoredPerfumes: RecommendationResult[],
  allScored: RecommendationResult[]
): { recommendations: RecommendationResult[]; confidenceLevel: ConfidenceLevel } {
  const sorted = [...scoredPerfumes].sort((a, b) => b.matchScore - a.matchScore);

  const highThreshold = RECOMMENDATION_CONFIG.CONFIDENCE_HIGH_THRESHOLD;
  const mediumThreshold = RECOMMENDATION_CONFIG.CONFIDENCE_MEDIUM_THRESHOLD;
  const minResults = RECOMMENDATION_CONFIG.MIN_GUARANTEED_RESULTS;
  const maxResults = RECOMMENDATION_CONFIG.MAX_RESULTS;

  const strongMatches = sorted.filter(p => p.matchScore >= highThreshold);
  const decentMatches = sorted.filter(p => p.matchScore >= mediumThreshold);

  let recommendations: RecommendationResult[];
  let confidenceLevel: ConfidenceLevel;

  if (strongMatches.length >= minResults) {
    recommendations = strongMatches.slice(0, maxResults);
    confidenceLevel = 'high';
  } else if (decentMatches.length >= minResults) {
    recommendations = decentMatches.slice(0, maxResults);
    confidenceLevel = 'medium';
  } else {
    // ALWAYS show at least minResults — take top scored perfumes no matter what
    const fallback = sorted.length >= minResults
      ? sorted.slice(0, maxResults)
      : [...allScored].sort((a, b) => b.matchScore - a.matchScore).slice(0, maxResults);
    recommendations = fallback;
    confidenceLevel = 'low';
  }

  return { recommendations, confidenceLevel };
}

// --- Browsable Collection ---

function buildBrowsableCollection(
  answers: QuizAnswers,
  perfumeList: Perfume[]
): RecommendationResult[] {
  const results: RecommendationResult[] = [];

  for (const perfume of perfumeList) {
    if (!passesStockFilter(perfume)) continue;
    if (!passesGenderFilter(perfume, answers)) continue;
    if (!passesAvoidedNotesFilter(perfume, answers)) continue;

    const detail = scorePerfume(answers, perfume);
    results.push(detail.result);
  }

  return results.sort((a, b) => b.matchScore - a.matchScore);
}

// --- Main Recommendation Function ---

/**
 * Recommend perfumes based on quiz answers.
 *
 * Pipeline (3-stage fallback):
 * 1. Strict: ratio 0.6, minScore 20
 * 2. Relaxed ratio: ratio 0.4, minScore 20
 * 3. Lower floor: ratio 0.4, minScore 15
 *
 * IMPORTANT: Season is NEVER used as a hard filter or match gate.
 * Season only affects the scoring stage (15 pts max). A season mismatch
 * simply reduces the score (15 × 0.2 = 3 pts), never eliminates a perfume.
 *
 * ALWAYS guarantees at least 3 recommendations — never shows "no match found".
 */
export function recommendPerfumes(
  answers: QuizAnswers,
  perfumeList: Perfume[]
): RecommendationOutput {
  const excludedSlugs = new Set<string>([...RECOMMENDATION_CONFIG.EXCLUDED_PERFUME_SLUGS]);
  const catalog = perfumeList.filter((p) => !excludedSlugs.has(p.slug));

  // BUG 3+4: Normalize user input notes (dedup + synonym resolution)
  const normalizedAnswers: QuizAnswers = {
    ...answers,
    favoriteNotes: normalizeUserNotes(answers.favoriteNotes || []),
    avoidedNotes: normalizeUserNotes(answers.avoidedNotes || []),
  };

  // Stage 1: Strict thresholds
  let results = runScoring(normalizedAnswers, catalog, {
    matchRatio: RECOMMENDATION_CONFIG.MIN_MATCH_RATIO,
    minScore: RECOMMENDATION_CONFIG.MIN_TOTAL_SCORE,
  });

  const usedFallback = results.length < RECOMMENDATION_CONFIG.MIN_GUARANTEED_RESULTS;

  // Stage 2: Relax match ratio
  if (usedFallback) {
    results = runScoring(normalizedAnswers, catalog, {
      matchRatio: RECOMMENDATION_CONFIG.MIN_MATCH_RATIO_FALLBACK,
      minScore: RECOMMENDATION_CONFIG.MIN_TOTAL_SCORE,
    });
  }

  // Stage 3: Lower score floor as last resort
  if (results.length < RECOMMENDATION_CONFIG.MIN_GUARANTEED_RESULTS) {
    results = runScoring(normalizedAnswers, catalog, {
      matchRatio: RECOMMENDATION_CONFIG.MIN_MATCH_RATIO_FALLBACK,
      minScore: 15,
    });
  }

  // Build full scored list for confidence tier fallback
  let allScored = buildBrowsableCollection(normalizedAnswers, catalog);

  // Apply confidence tiers and guarantee minimum results
  let { recommendations, confidenceLevel } = getRecommendations(results, allScored);

  // BUG 2: Safety net — when avoid list eliminates ALL perfumes,
  // bypass the avoid filter entirely to guarantee at least 3 results
  let safetyNetTriggered = false;
  if (recommendations.length === 0) {
    safetyNetTriggered = true;
    const safetyNet = catalog
      .filter(p => passesGenderFilter(p, normalizedAnswers))
      .filter(p => passesStockFilter(p))
      .map(p => scorePerfume(normalizedAnswers, p))
      .sort((a, b) => b.result.matchScore - a.result.matchScore)
      .slice(0, RECOMMENDATION_CONFIG.MIN_GUARANTEED_RESULTS)
      .map(d => d.result);

    recommendations = safetyNet;
    confidenceLevel = 'low';

    // Also rebuild browsable collection without avoid filter
    allScored = catalog
      .filter(p => passesGenderFilter(p, normalizedAnswers))
      .filter(p => passesStockFilter(p))
      .map(p => scorePerfume(normalizedAnswers, p))
      .map(d => d.result)
      .sort((a, b) => b.matchScore - a.matchScore);
  }

  // Build browsable collection (always available, never filtered by season)
  const browsableCollection = allScored;

  return {
    results: recommendations,
    usedFallback,
    confidenceLevel,
    safetyNetTriggered,
    browsableCollection,
  };
}
