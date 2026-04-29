'use client';

import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n/context';

interface QuizProgressProps {
    current: number;
    total: number;
}

export default function QuizProgress({ current, total }: QuizProgressProps) {
    const { t } = useI18n();
    const percentage = (current / total) * 100;

    return (
        <div className="w-full">
            <div className="mb-2 flex justify-between text-[11px] font-medium uppercase tracking-[0.2em] text-[#5c5c5c] sm:text-xs">
                <span className="text-[#121212]">
                    {t('quiz.progress.step')} {current} {t('quiz.progress.of')} {total}
                </span>
                <span className="tabular-nums text-[#6A1B9A]">
                    {Math.round(percentage)}% {t('quiz.progress.complete')}
                </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#e8e8e8]">
                <motion.div
                    className="h-full rounded-full bg-[#6A1B9A]"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                />
            </div>
        </div>
    );
}
