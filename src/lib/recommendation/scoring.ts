/**
 * Scoring Module
 *
 * Individual scoring functions for each factor in the recommendation system.
 * Each function returns a score from 0 to its max points, plus match reasons.
 */

import { Perfume, QuizAnswers } from '@/types';
import { RECOMMENDATION_CONFIG } from './config';
import { fuzzyMatch } from './fuzzyMatch';
import { getUserCategories, getPerfumeCategories, setIntersection, CATEGORY_DISPLAY_NAMES, NoteCategory } from './noteCategories';

// --- Note Position-Weighted Scoring ---

/**
 * Represents a note within a specific tier at a specific position.
 * Used internally to track where a match occurs for weighting.
 */
interface NoteLocation {
  tier: 'top' | 'middle' | 'base';
  indexInTier: number;  // 0-based position within the tier
  noteName: string;
}

/**
 * Build a flat list of all perfume notes with their tier and position metadata.
 * Notes are ordered: top[0], top[1], ..., middle[0], middle[1], ..., base[0], ...
 */
function buildNoteLocations(perfume: Perfume): NoteLocation[] {
  // Use mainNotes (flat ordered array) for position-weighted scoring.
  // mainNotes is ORDERED from most important to least important.
  // Fallback to tiered notes if mainNotes is empty (backward compat).
  const notes = perfume.mainNotes.length > 0
    ? perfume.mainNotes
    : [
      ...perfume.notes.top.map((n, i) => ({ note: n, tier: 'top' as const, idx: i })),
      ...perfume.notes.middle.map((n, i) => ({ note: n, tier: 'middle' as const, idx: i })),
      ...perfume.notes.base.map((n, i) => ({ note: n, tier: 'base' as const, idx: i })),
    ].map(x => x.note);

  return notes.map((noteName, index) => ({
    tier: 'top' as const,  // All treated equally in flat model
    indexInTier: index,    // Position in the ordered list drives weighting
    noteName,
  }));
}

/**
 * Compute the combined weight for a perfume note based on its tier and position.
 *
 * Formula: tierWeight × positionWeight
 *   where tierWeight = TIER_WEIGHTS[tier] (top=1.0, middle=0.6, base=0.3)
 *   and   positionWeight = 1 / (indexInTier + 1)  (harmonic decay)
 *
 * Example: 1st top note = 1.0 × 1.0 = 1.0
 *          2nd top note = 1.0 × 0.5 = 0.5
 *          1st base note = 0.3 × 1.0 = 0.3
 */
function computePerfumeNoteWeight(location: NoteLocation): number {
  // In the flat mainNotes model, position alone drives the weight.
  // 1st note = 1.0, 2nd = 0.5, 3rd = 0.333, etc. (harmonic decay)
  // This matches the spec: perfumeWeight = 1 / (perfumeNoteIndex + 1)
  const positionWeight = 1 / (location.indexInTier + 1);
  return positionWeight;
}

/**
 * Compute the user's pick weight based on selection order.
 *
 * Formula: 1 / (userPickIndex + 1)  (harmonic decay)
 *
 * 1st pick = 1.0, 2nd = 0.5, 3rd = 0.333, etc.
 */
function computeUserWeight(userPickIndex: number): number {
  return 1 / (userPickIndex + 1);
}

/**
 * Compute the maximum possible score for a given number of matched notes.
 *
 * Uses the actual matched count as the ceiling instead of the total user pick count.
 * This prevents the theoretical max from being unreachable — e.g., when a user
 * picks 5 notes and 4 match, the max should be based on 4 matches, not 5.
 *
 * maxPossible = SUM of (userWeight_i × perfumeWeight_i) for i in [0, matchedCount)
 * This means: "if every matched note had been at position i vs position i, score is 100%"
 */
function computeMaxPossibleScore(
  matchedCount: number
): number {
  let maxScore = 0;

  for (let i = 0; i < matchedCount; i++) {
    const userW = computeUserWeight(i);
    const perfumeW = computePerfumeNoteWeight({ tier: 'top', indexInTier: i, noteName: '' });
    maxScore += userW * perfumeW;
  }

  return maxScore;
}

/**
 * Score the note match between user's favorite notes and a perfume's notes,
 * applying tier + position weighting.
 *
 * Algorithm:
 * 1. For each user pick, find the best-matching perfume note (highest weight)
 * 2. Compute per-note score = userWeight × perfumeWeight
 * 3. Sum all per-note scores → rawScore
 * 4. Normalize: (rawScore / maxPossibleScore) × maxPoints
 *
 * @returns Object with score (0–maxPoints) and match reasons
 */
export function scoreNoteMatch(
  answers: QuizAnswers,
  perfume: Perfume,
  maxPoints: number
): { score: number; reasons: string[]; matchedNotes: string[]; sharedCategories: NoteCategory[] } {
  const favoriteNotes = answers.favoriteNotes || [];

  // If no favorite notes selected, give a neutral base score
  if (favoriteNotes.length === 0 || favoriteNotes.includes('none')) {
    return { score: maxPoints * 0.4, reasons: [], matchedNotes: [], sharedCategories: [] };
  }

  const noteLocations = buildNoteLocations(perfume);
  const reasons: string[] = [];
  const matchedNotes: string[] = [];
  const sharedCategories: NoteCategory[] = [];

  // Track which perfume note locations have already been matched
  // (to avoid double-matching the same perfume note to multiple user picks)
  const usedPerfumeIndices = new Set<number>();

  let rawScore = 0;

  // For each user pick (in selection order), find the best unmatched perfume note
  for (let userIdx = 0; userIdx < favoriteNotes.length; userIdx++) {
    const userNote = favoriteNotes[userIdx];
    const userWeight = computeUserWeight(userIdx);

    // Find all perfume notes that fuzzy-match this user note
    let bestPerfIdx = -1;
    let bestPerfWeight = -1;

    for (let pIdx = 0; pIdx < noteLocations.length; pIdx++) {
      if (usedPerfumeIndices.has(pIdx)) continue;

      if (fuzzyMatch(userNote, noteLocations[pIdx].noteName)) {
        const weight = computePerfumeNoteWeight(noteLocations[pIdx]);
        if (weight > bestPerfWeight) {
          bestPerfWeight = weight;
          bestPerfIdx = pIdx;
        }
      }
    }

    if (bestPerfIdx !== -1) {
      usedPerfumeIndices.add(bestPerfIdx);
      const noteScore = userWeight * bestPerfWeight;
      rawScore += noteScore;
      matchedNotes.push(noteLocations[bestPerfIdx].noteName);
    } else {
      // No direct match — check if this user note shares a category with any perfume note
      const userCat = getUserCategories([userNote]);
      const perfumeAllNotes = perfume.mainNotes.length > 0
        ? perfume.mainNotes
        : [...perfume.notes.top, ...perfume.notes.middle, ...perfume.notes.base];
      const perfCats = getPerfumeCategories(perfumeAllNotes);
      const overlap = setIntersection(userCat, perfCats);
      for (const cat of overlap) {
        if (!sharedCategories.includes(cat)) sharedCategories.push(cat);
      }
    }
  }

  // Compute max possible score for normalization (based on actual matches, not theoretical)
  const maxPossible = computeMaxPossibleScore(matchedNotes.length);

  // Normalize to maxPoints scale
  let normalizedScore = maxPossible > 0
    ? (rawScore / maxPossible) * maxPoints
    : 0;

  // Match ratio bonus: when ≥60% of user notes match, boost the note score
  // This ensures high-match perfumes score ≥90% overall
  const matchRatio = matchedNotes.length / favoriteNotes.length;
  if (matchRatio >= 0.6 && normalizedScore > 0) {
    const boost = 1 + (matchRatio - 0.6); // up to +40% at 100% match
    normalizedScore = Math.min(maxPoints * 1.4, normalizedScore * boost);
  }

  // Build reasons from matched notes
  if (matchedNotes.length > 0) {
    const displayNotes = matchedNotes.slice(0, 3).join(', ');
    reasons.push(`Contains ${displayNotes}`);
  }

  return { score: normalizedScore, reasons, matchedNotes, sharedCategories };
}

// --- Category Affinity Scoring ---

/**
 * Score the overlap between user's note categories and perfume's note categories.
 * Formula: (sharedCategories / userCategories) * maxPoints
 * Neutral fallback (no user categories): maxPoints * 0.3
 */
export function scoreCategoryAffinity(
  answers: QuizAnswers,
  perfume: Perfume,
  maxPoints: number
): { score: number; reasons: string[]; sharedCategories: NoteCategory[] } {
  const favoriteNotes = answers.favoriteNotes || [];
  if (favoriteNotes.length === 0 || favoriteNotes.includes('none')) {
    return { score: maxPoints * 0.3, reasons: [], sharedCategories: [] };
  }

  const userCats = getUserCategories(favoriteNotes);
  if (userCats.size === 0) {
    return { score: maxPoints * 0.3, reasons: [], sharedCategories: [] };
  }

  const perfumeAllNotes = perfume.mainNotes.length > 0
    ? perfume.mainNotes
    : [...perfume.notes.top, ...perfume.notes.middle, ...perfume.notes.base];
  const perfumeCats = getPerfumeCategories(perfumeAllNotes);

  const shared = setIntersection(userCats, perfumeCats);
  const overlapRatio = shared.size / userCats.size;
  const score = Math.round(overlapRatio * maxPoints);

  const reasons: string[] = [];
  const sharedArr = Array.from(shared);
  if (sharedArr.length > 0) {
    const catNames = sharedArr.slice(0, 2).map(c => CATEGORY_DISPLAY_NAMES[c] || c).join(' & ');
    reasons.push(`In the ${catNames} family`);
  }

  return { score, reasons, sharedCategories: sharedArr };
}

// --- Season Scoring ---

/**
 * Infer a season suitability score (1–10) from a perfume's notes.
 * Uses boost/penalty keyword lists for each season.
 */
function inferSeasonScore(perfume: Perfume, season: string): number {
  const allNotes = [
    ...perfume.notes.top,
    ...perfume.notes.middle,
    ...perfume.notes.base
  ].map(n => n.toLowerCase());

  const seasonIndicators: Record<string, { boost: string[]; penalty: string[] }> = {
    spring: {
      boost: ['floral', 'rose', 'jasmine', 'lily', 'violet', 'peony', 'green', 'fresh'],
      penalty: ['oud', 'leather', 'tobacco', 'heavy']
    },
    summer: {
      boost: ['citrus', 'bergamot', 'lemon', 'aquatic', 'marine', 'fresh', 'mint', 'cucumber', 'water'],
      penalty: ['oud', 'amber', 'tobacco', 'leather', 'heavy', 'spicy']
    },
    fall: {
      boost: ['amber', 'vanilla', 'cinnamon', 'spice', 'wood', 'cedar', 'sandalwood'],
      penalty: ['aquatic', 'marine', 'cucumber']
    },
    winter: {
      boost: ['oud', 'leather', 'tobacco', 'amber', 'vanilla', 'spice', 'incense', 'tonka'],
      penalty: ['aquatic', 'marine', 'citrus', 'fresh']
    }
  };

  const indicators = seasonIndicators[season] || { boost: [], penalty: [] };
  let score = 5; // Base score

  for (const note of allNotes) {
    if (indicators.boost.some(b => note.includes(b))) score += 1;
    if (indicators.penalty.some(p => note.includes(p))) score -= 1;
  }

  return Math.max(1, Math.min(10, score));
}

/**
 * Score season match between user preference and perfume.
 * Scales the 1–10 season score to 0–maxPoints.
 */
export function scoreSeason(
  answers: QuizAnswers,
  perfume: Perfume,
  maxPoints: number
): { score: number; reasons: string[] } {
  const reasons: string[] = [];

  if (!answers.season || answers.season === 'all') {
    // Neutral score for "all seasons"
    return { score: maxPoints * 0.75, reasons };
  }


  // Use perfume's explicit seasons field if available
  if (perfume.seasons && perfume.seasons.length > 0) {
    const perfumeSeasons = perfume.seasons.map(s => s.toLowerCase().trim());
    const userSeason = answers.season.toLowerCase();

    if (perfumeSeasons.includes('all')) {
      // Perfume is for all seasons — partial match
      return { score: maxPoints * 0.75, reasons };
    }

    if (perfumeSeasons.includes(userSeason)) {
      // Direct season match
      const seasonNames: Record<string, string> = {
        spring: 'Spring', summer: 'Summer', fall: 'Fall', winter: 'Winter'
      };
      reasons.push(`Perfect for ${seasonNames[answers.season]}`);
      return { score: maxPoints, reasons };
    }

    // No season match — low score
    return { score: maxPoints * 0.2, reasons };
  }

  // Fallback: infer season from notes (legacy behavior)
  const seasonScore = inferSeasonScore(perfume, answers.season);
  const scaledScore = (seasonScore / 10) * maxPoints;

  if (seasonScore >= 7) {
    const seasonNames: Record<string, string> = {
      spring: 'Spring', summer: 'Summer', fall: 'Fall', winter: 'Winter'
    };
    reasons.push(`Perfect for ${seasonNames[answers.season]}`);
  }

  return { score: scaledScore, reasons };
}

// --- Intensity Scoring ---

/**
 * Infer a perfume's intensity from its notes.
 * Strong notes (oud, leather, tobacco) → 'strong'
 * Light notes (citrus, bergamot, aquatic) → 'light'
 * Mixed → 'moderate'
 */
function inferIntensity(perfume: Perfume): 'light' | 'moderate' | 'strong' {
  const allNotes = [
    ...perfume.notes.top,
    ...perfume.notes.middle,
    ...perfume.notes.base
  ].map(n => n.toLowerCase());

  const strongNotes = ['oud', 'leather', 'tobacco', 'saffron', 'patchouli', 'amber', 'incense'];
  const lightNotes = ['citrus', 'bergamot', 'lemon', 'lime', 'grapefruit', 'green tea', 'water', 'aquatic', 'marine'];

  const hasStrong = strongNotes.some(n => allNotes.some(note => note.includes(n)));
  const hasLight = lightNotes.some(n => allNotes.some(note => note.includes(n)));

  if (hasStrong && !hasLight) return 'strong';
  if (hasLight && !hasStrong) return 'light';
  return 'moderate';
}

/**
 * Score intensity/longevity match.
 * Exact match = maxPoints, off-by-one = 60%, off-by-two = 20%.
 */
export function scoreIntensity(
  answers: QuizAnswers,
  perfume: Perfume,
  maxPoints: number
): { score: number; reasons: string[]; intensityDiff: number } {
  const reasons: string[] = [];

  // Map perfume longevity to intensity levels on 4-point scale
  // [light=0, moderate=1, strong=2, enormous=3]
  const longevityToIntensity: Record<string, number> = {
    'moderate': 1,
    'strong': 2,
    'enormous': 3,
  };

  let perfumeIdx: number;
  if (perfume.longevity && longevityToIntensity[perfume.longevity] !== undefined) {
    perfumeIdx = longevityToIntensity[perfume.longevity];
  } else {
    const inferred = inferIntensity(perfume);
    const inferredMap: Record<string, number> = { light: 0, moderate: 1, strong: 2 };
    perfumeIdx = inferredMap[inferred] ?? 1;
  }

  const preferredIntensity = answers.intensity || 'moderate';
  const preferredMap: Record<string, number> = { light: 0, moderate: 1, strong: 2, enormous: 3 };
  const preferredIdx = preferredMap[preferredIntensity] ?? 1;

  const diff = Math.abs(perfumeIdx - preferredIdx);

  let score: number;
  if (diff === 0) {
    score = maxPoints;
    reasons.push('Matches your intensity preference');
  } else if (diff === 1) {
    score = maxPoints * 0.6;
  } else if (diff === 2) {
    score = maxPoints * 0.2;
  } else {
    score = maxPoints * 0.1;
  }

  return { score, reasons, intensityDiff: diff };
}

// --- Gender Scoring ---

/**
 * Score gender match.
 * Exact match = maxPoints, unisex = 50%.
 */
export function scoreGender(
  answers: QuizAnswers,
  perfume: Perfume,
  maxPoints: number
): { score: number; reasons: string[] } {
  if (perfume.gender === answers.gender) {
    return { score: maxPoints, reasons: [] };
  }
  if (perfume.gender === 'unisex') {
    return { score: maxPoints * 0.5, reasons: [] };
  }
  return { score: 0, reasons: [] };
}

// --- Inspired-by Bonus ---

/**
 * Bonus for perfumes inspired by known luxury brands.
 */
export function scoreInspiredBonus(
  perfume: Perfume,
  maxPoints: number
): { score: number; reasons: string[] } {
  if (perfume.inspiredBy && perfume.inspiredBy !== 'nspired beauty') {
    return {
      score: maxPoints,
      reasons: [`Inspired by ${perfume.inspiredBy}`]
    };
  }
  return { score: 0, reasons: [] };
}

// --- Rich Profile Bonus ---

/**
 * Bonus for perfumes with a rich note profile (≥ threshold notes).
 */
export function scoreRichProfile(
  perfume: Perfume,
  maxPoints: number
): { score: number; reasons: string[] } {
  const totalNotes =
    perfume.notes.top.length +
    perfume.notes.middle.length +
    perfume.notes.base.length;

  if (totalNotes >= RECOMMENDATION_CONFIG.RICH_PROFILE_THRESHOLD) {
    return { score: maxPoints, reasons: [] };
  }
  return { score: 0, reasons: [] };
}

// --- Crowd Favorite Bonus ---

/**
 * Bonus for bestseller / crowd favorite perfumes.
 * If no bestseller data exists yet, gives all perfumes a neutral 2 pts.
 */
export function scoreCrowdFavorite(
  perfume: Perfume,
  maxPoints: number
): { score: number; reasons: string[] } {
  const bestsellerIds = RECOMMENDATION_CONFIG.BESTSELLER_IDS;

  if (bestsellerIds.length === 0) {
    // Neutral until data exists — don't waste the weight
    return { score: 2, reasons: [] };
  }

  if (bestsellerIds.includes(perfume.id)) {
    return { score: maxPoints, reasons: ['Customer favorite'] };
  }

  return { score: 0, reasons: [] };
}

// --- Match Reason Generation ---

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Generate a human-readable "why this matched" explanation string.
 * Combines matched notes, category affinity, season, and intensity into
 * a concise reason displayed below the perfume name.
 */
export function generateMatchReason(
  answers: QuizAnswers,
  perfume: Perfume,
  matchDetails: {
    matchedNotes: string[];
    sharedCategories: NoteCategory[];
    seasonMatch: 'direct' | 'allSeasons' | 'inferred' | 'none';
    intensityDiff: number;
  }
): string {
  const reasons: string[] = [];

  // Matched notes
  const matchedNotes = matchDetails.matchedNotes || [];
  if (matchedNotes.length > 0) {
    const noteList = matchedNotes.slice(0, 3).join(' & ');
    reasons.push(`Matches your love of ${noteList}`);
  }

  // Category match (no direct note match but same family)
  const sharedCats = matchDetails.sharedCategories || [];
  if (matchedNotes.length === 0 && sharedCats.length > 0) {
    const familyList = sharedCats.slice(0, 2).map(c => CATEGORY_DISPLAY_NAMES[c] || c).join(' and ');
    reasons.push(`In the ${familyList} family you enjoy`);
  }

  // Season
  if (matchDetails.seasonMatch === 'direct') {
    const seasonNames: Record<string, string> = {
      spring: 'Spring', summer: 'Summer', fall: 'Fall', winter: 'Winter'
    };
    reasons.push(`Perfect for ${seasonNames[answers.season || ''] || answers.season}`);
  } else if (matchDetails.seasonMatch === 'allSeasons') {
    reasons.push('Versatile for any season');
  }

  // Intensity
  if (matchDetails.intensityDiff === 0 && perfume.longevity) {
    reasons.push(`${capitalize(perfume.longevity)} projection, just how you like it`);
  }

  if (reasons.length === 0) {
    return 'A great fragrance worth exploring';
  }

  return reasons.slice(0, 2).join(' · ');
}
