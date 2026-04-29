'use client';

import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n/context';

interface QuizNavigationProps {
    onBack: () => void;
    onNext: () => void;
    onSkip?: () => void;
    canGoBack: boolean;
    canGoNext: boolean;
    isLastStep: boolean;
}

export default function QuizNavigation({
    onBack,
    onNext,
    onSkip,
    canGoBack,
    canGoNext,
    isLastStep,
}: QuizNavigationProps) {
    const { t, locale } = useI18n();
    const isRtl = locale === 'ar';

    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-8 pb-2">
            {onSkip && (
                <div className="mb-3 text-center">
                    <button
                        type="button"
                        onClick={onSkip}
                        className="text-sm text-[#888888] underline underline-offset-4 transition hover:text-[#4a4a4a]"
                    >
                        {t('quiz.nav.skip')}
                    </button>
                </div>
            )}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={onBack}
                    disabled={!canGoBack}
                    className={
                        'flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-[#e0e0e0] bg-white text-[#1a1a1a] transition ' +
                        (canGoBack
                            ? 'hover:border-[#6A1B9A]/40 hover:bg-[#6A1B9A]/[0.04] active:scale-[0.98]'
                            : 'cursor-not-allowed opacity-35')
                    }
                    aria-label={t('quiz.nav.back')}
                >
                    <svg
                        className={'h-5 w-5 ' + (isRtl ? 'rotate-180' : '')}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <motion.button
                    type="button"
                    whileHover={{ scale: canGoNext ? 1.01 : 1 }}
                    whileTap={{ scale: canGoNext ? 0.99 : 1 }}
                    onClick={onNext}
                    disabled={!canGoNext}
                    className={
                        'flex h-12 min-h-[48px] flex-1 items-center justify-center gap-2 rounded-sm text-sm font-semibold uppercase tracking-wider transition ' +
                        (canGoNext
                            ? 'bg-[#6A1B9A] text-white hover:bg-[#9C27B0]'
                            : 'cursor-not-allowed bg-[#e0e0e0] text-[#a8a8a8]')
                    }
                >
                    <span>{isLastStep ? t('quiz.nav.submit') : t('quiz.nav.next')}</span>
                    <svg
                        className={'h-5 w-5 ' + (isRtl ? 'rotate-180' : '')}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </motion.button>
            </div>
        </motion.div>
    );
}
