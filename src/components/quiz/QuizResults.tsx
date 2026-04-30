'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { RecommendationResult, QuizAnswers, ConfidenceLevel } from '@/types';
import PerfumeCard from './PerfumeCard';
import { useI18n } from '@/lib/i18n/context';

interface QuizResultsProps {
    recommendations: RecommendationResult[];
    browsableCollection: RecommendationResult[];
    answers: QuizAnswers;
    onRetake: () => void;
    usedFallback?: boolean;
    confidenceLevel: ConfidenceLevel;
    safetyNetTriggered?: boolean;
}

type BrowseFilter = 'all' | 'female' | 'male' | 'unisex' | 'summer' | 'all-seasons';

export default function QuizResults({ recommendations, browsableCollection, onRetake, usedFallback, confidenceLevel, safetyNetTriggered }: QuizResultsProps) {
    const { t } = useI18n();
    const [browseFilter, setBrowseFilter] = useState<BrowseFilter>('all');

    const hasTopMatches = recommendations.length > 0;

    // Confidence-based header text
    const confidenceHeader = (() => {
        switch (confidenceLevel) {
            case 'high': return { title1: t('quiz.results.confidence.high.title1'), title2: t('quiz.results.confidence.high.title2'), subtitle: t('quiz.results.confidence.high.subtitle') };
            case 'medium': return { title1: t('quiz.results.confidence.medium.title1'), title2: t('quiz.results.confidence.medium.title2'), subtitle: t('quiz.results.confidence.medium.subtitle') };
            case 'low': return { title1: t('quiz.results.confidence.low.title1'), title2: t('quiz.results.confidence.low.title2'), subtitle: t('quiz.results.confidence.low.subtitle') };
        }
    })();

    // Filter browsable collection based on selected chip
    const filteredBrowsable = browsableCollection.filter((result) => {
        const p = result.perfume;
        switch (browseFilter) {
            case 'female': return p.gender === 'female';
            case 'male': return p.gender === 'male';
            case 'unisex': return p.gender === 'unisex';
            case 'summer': return p.seasons?.some(s => s.toLowerCase() === 'summer') ?? false;
            case 'all-seasons': return p.seasons?.some(s => s.toLowerCase() === 'all') ?? false;
            default: return true;
        }
    });

    // Remove perfumes already shown in top matches from browse section
    const topMatchIds = new Set(recommendations.map(r => r.perfume.id));
    const browseResults = filteredBrowsable.filter(r => !topMatchIds.has(r.perfume.id));

    const filterChips: { id: BrowseFilter; label: string }[] = [
        { id: 'all', label: t('quiz.results.browse.filterAll') },
        { id: 'female', label: t('home.gender.women') },
        { id: 'male', label: t('home.gender.men') },
        { id: 'unisex', label: t('home.gender.unisex') },
        { id: 'summer', label: t('quiz.results.browse.filterSummer') },
        { id: 'all-seasons', label: t('quiz.results.browse.filterAllSeasons') },
    ];

    return (
        <div className="min-h-screen bg-[#f5f5f5]">
            {/* Header */}
            <header className="bg-white border-b border-[#e0e0e0]">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link
                        href="/"
                        className="relative h-10 w-24 shrink-0 transition-opacity hover:opacity-90 sm:h-12 sm:w-32"
                    >
                        <Image
                            src="/logo.svg"
                            alt="LAIL"
                            fill
                            className="object-contain object-left"
                            priority
                        />
                    </Link>
                    <Link
                        href="/"
                        className="text-sm text-[#4a4a4a] hover:text-[#6A1B9A] transition flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        {t('nav.home')}
                    </Link>
                </div>
            </header>

            <div className="py-8 px-4">
                <div className="max-w-6xl mx-auto">
                    {/* Results Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-10"
                    >
                        <p className="text-[#6A1B9A] text-sm uppercase tracking-widest mb-2 font-medium">
                            {t('quiz.results.complete')}
                        </p>
                        <h2 className="text-3xl md:text-4xl font-light text-[#1a1a1a] mb-3">
                            {confidenceHeader.title1} <span className="font-semibold">{confidenceHeader.title2}</span>
                        </h2>
                        <p className="text-[#4a4a4a]">
                            {confidenceHeader.subtitle}
                        </p>
                    </motion.div>

                    {/* Safety Net Banner */}
                    {safetyNetTriggered && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#FFF3E0] border border-[#FF9800] p-4 mb-8 text-center"
                        >
                            <p className="text-[#4a4a4a] text-sm">
                                {t('quiz.results.safetyNet.message')}
                            </p>
                        </motion.div>
                    )}

                    {/* Fallback Banner */}
                    {usedFallback && hasTopMatches && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#FFF8E1] border border-[#F5C518] p-4 mb-8 text-center"
                        >
                            <p className="text-[#4a4a4a] text-sm mb-4">
                                {t('quiz.results.fallback.banner')}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button
                                    onClick={() => window.open('https://lailfragrances.com/', '_blank')}
                                    className="bg-[#6A1B9A] text-white px-6 py-3 text-sm uppercase tracking-wider font-medium hover:bg-[#4A148C] transition"
                                >
                                    {t('quiz.results.fallback.explore')}
                                </button>
                                <button
                                    onClick={onRetake}
                                    className="border border-[#1a1a1a] text-[#1a1a1a] px-6 py-3 text-sm uppercase tracking-wider font-medium hover:bg-[#1a1a1a] hover:text-white transition"
                                >
                                    {t('quiz.results.fallback.retake')}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Top Matches Grid */}
                    {hasTopMatches && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recommendations.map((result, index) => (
                                <motion.div
                                    key={result.perfume.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <PerfumeCard
                                        perfume={result.perfume}
                                        matchScore={result.matchScore}
                                        matchReasons={result.matchReasons}
                                        matchReason={result.matchReason}
                                        rank={index + 1}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Browse Full Collection Section — ALWAYS rendered */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: hasTopMatches ? 0.4 : 0.2 }}
                        className="mt-16 pt-10 border-t border-[#e0e0e0]"
                    >
                        {/* Section Header */}
                        <div className="text-center mb-8">
                            <div className="w-16 h-[2px] bg-[#C9A84C] mx-auto mb-4" />
                            <h3 className="text-2xl md:text-3xl font-light text-[#1a1a1a] mb-2 font-serif">
                                {t('quiz.results.browse.title')}
                            </h3>
                            <p className="text-[#4a4a4a] text-sm">
                                {t('quiz.results.browse.subtitle')}
                            </p>
                        </div>

                        {/* Filter Chips */}
                        <div className="flex flex-wrap justify-center gap-2 mb-8">
                            {filterChips.map((chip) => (
                                <button
                                    key={chip.id}
                                    onClick={() => setBrowseFilter(chip.id)}
                                    className={`px-4 py-2 text-xs uppercase tracking-wider font-medium border transition ${browseFilter === chip.id
                                        ? 'bg-[#6A1B9A] text-white border-[#6A1B9A]'
                                        : 'bg-white text-[#4a4a4a] border-[#dcdcdc] hover:border-[#6A1B9A] hover:text-[#6A1B9A]'
                                        }`}
                                >
                                    {chip.label}
                                </button>
                            ))}
                        </div>

                        {/* Browse Grid */}
                        {browseResults.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {browseResults.map((result, index) => (
                                    <motion.a
                                        key={result.perfume.id}
                                        href={result.perfume.sourceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: Math.min(index * 0.05, 0.3) }}
                                        className="bg-white group cursor-pointer hover:shadow-[0_4px_16px_rgba(106,27,154,0.12)] transition-all duration-300"
                                    >
                                        <div className="relative">
                                            <span className={`absolute top-2 left-2 z-10 text-[10px] font-medium px-1.5 py-0.5 text-white ${result.perfume.gender === 'female' ? 'bg-[#6A1B9A]' :
                                                result.perfume.gender === 'male' ? 'bg-[#1a1a1a]' : 'bg-[#666666]'
                                                }`}>
                                                {result.perfume.gender === 'female' ? t('home.gender.women') :
                                                    result.perfume.gender === 'male' ? t('home.gender.men') : t('home.gender.unisex')}
                                            </span>
                                            <div className="aspect-square bg-[#f5f5f5] relative overflow-hidden">
                                                <Image
                                                    src={result.perfume.imageUrl}
                                                    alt={result.perfume.name}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                    sizes="(max-width: 768px) 50vw, 25vw"
                                                />
                                            </div>
                                            <div className="absolute bottom-2 right-2 bg-[#6A1B9A]/90 text-white text-[10px] font-semibold px-2 py-1">
                                                {result.matchScore}%
                                            </div>
                                        </div>
                                        <div className="p-3">
                                            <h4 className="font-medium text-[#1a1a1a] text-sm truncate">{result.perfume.name}</h4>
                                            {result.matchReason && (
                                                <p className="text-[10px] text-[#6A1B9A] mt-0.5 truncate">{result.matchReason}</p>
                                            )}
                                            <p className="text-xs text-[#4a4a4a] mt-1">
                                                {t('home.popular.from')} {result.perfume.sizes?.[0]?.price ?? result.perfume.price} {result.perfume.currency}
                                                {result.perfume.sizes && result.perfume.sizes.length > 1 && (
                                                    <span className="text-[10px] text-[#888888]"> · {result.perfume.sizes.map(s => `${s.size}ml`).join(' / ')}</span>
                                                )}
                                            </p>
                                            {result.perfume.inspiredBy && result.perfume.inspiredBy !== 'nspired beauty' && (
                                                <p className="text-[10px] text-[#C9A84C] mt-1 truncate">
                                                    {t('home.popular.inspiredBy')} {result.perfume.inspiredBy}
                                                </p>
                                            )}
                                        </div>
                                    </motion.a>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-[#888888] text-sm py-8">
                                {t('quiz.results.browse.noResults')}
                            </p>
                        )}
                    </motion.div>

                    {/* Actions */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-col sm:flex-row justify-center gap-4 mt-12"
                    >
                        <button
                            onClick={onRetake}
                            className="px-8 py-3 border border-[#1a1a1a] text-[#1a1a1a] text-sm uppercase tracking-wider font-medium hover:bg-[#1a1a1a] hover:text-white transition"
                        >
                            {t('quiz.results.retake')}
                        </button>
                        <Link
                            href="/"
                            className="px-8 py-3 bg-[#6A1B9A] text-white text-sm uppercase tracking-wider font-medium hover:bg-[#4A148C] transition text-center"
                        >
                            {t('quiz.results.browse')}
                        </Link>
                    </motion.div>

                    {/* Footer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="text-center mt-16 pt-8 border-t border-[#e0e0e0]"
                    >
                        <p className="text-[#888888] text-sm">
                            {t('quiz.results.footer')}{' '}
                            <a
                                href="https://lailfragrances.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#6A1B9A] hover:underline"
                            >
                                {t('quiz.results.brand')}
                            </a>
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
