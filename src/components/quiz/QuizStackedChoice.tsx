'use client';

import { motion } from 'framer-motion';
import type { QuizOption } from '@/types';
import NoteIcon from '@/components/icons/NoteIcon';
import { useI18n } from '@/lib/i18n/context';

const spring = { type: 'spring' as const, stiffness: 380, damping: 28 };

interface QuizStackedChoiceProps {
    options: QuizOption[];
    value: unknown;
    onSelect: (id: string) => void;
    /** i18n keys like quiz.optionHint.female → pass full key per option id */
    hintKeyByOptionId?: Record<string, string>;
    /** `season-grid` — two rows of three compact tiles (season step) */
    layout?: 'stack' | 'season-grid';
}

export default function QuizStackedChoice({
    options,
    value,
    onSelect,
    hintKeyByOptionId,
    layout = 'stack',
}: QuizStackedChoiceProps) {
    const { locale, t } = useI18n();

    if (layout === 'season-grid') {
        return (
            <div className="grid w-full grid-cols-3 gap-2 sm:gap-2.5">
                {options.map((option, index) => {
                    const selected = value === option.id;
                    const label = locale === 'ar' ? option.labelAr : option.label;
                    const hintKey = hintKeyByOptionId?.[option.id];
                    const hint = hintKey ? t(hintKey) : option.description;

                    return (
                        <motion.button
                            key={option.id}
                            type="button"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ ...spring, delay: index * 0.04 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onSelect(option.id)}
                            className={
                                'relative flex min-h-[112px] w-full min-w-0 flex-col items-center justify-center gap-1.5 border px-2 py-3 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6A1B9A] focus-visible:ring-offset-1 sm:min-h-[120px] sm:px-2.5 sm:py-3.5 rounded-sm ' +
                                (selected
                                    ? 'border-[#6A1B9A] bg-[#6A1B9A]/[0.05]'
                                    : 'border-[#e0e0e0] bg-white hover:border-[#6A1B9A]/40')
                            }
                        >
                            <div
                                className={
                                    'absolute end-2 top-2 flex h-5 w-5 items-center justify-center rounded-full border transition-colors sm:h-6 sm:w-6 ' +
                                    (selected ? 'border-[#6A1B9A] bg-[#6A1B9A]' : 'border-[#d0d0d0] bg-white')
                                }
                                aria-hidden
                            >
                                {selected && (
                                    <svg
                                        className="h-2.5 w-2.5 text-white sm:h-3 sm:w-3"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={3}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                            <div
                                className={
                                    'mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border transition-colors sm:h-11 sm:w-11 ' +
                                    (selected
                                        ? 'border-[#6A1B9A] bg-[#6A1B9A] text-white'
                                        : 'border-[#e0e0e0] bg-[#fafafa] text-[#1a1a1a]')
                                }
                            >
                                <NoteIcon name={option.icon} size={22} />
                            </div>
                            <div
                                className={
                                    'line-clamp-2 max-w-full px-0.5 text-[13px] font-medium leading-tight sm:text-sm ' +
                                    (selected ? 'text-[#6A1B9A]' : 'text-[#121212]')
                                }
                            >
                                {label}
                            </div>
                            {hint ? (
                                <p className="line-clamp-2 max-w-full px-0.5 text-[10px] leading-snug text-[#5c5c5c] sm:text-[11px]">
                                    {hint}
                                </p>
                            ) : null}
                        </motion.button>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="flex w-full flex-col gap-2.5">
            {options.map((option, index) => {
                const selected = value === option.id;
                const label = locale === 'ar' ? option.labelAr : option.label;
                const hintKey = hintKeyByOptionId?.[option.id];
                const hint = hintKey ? t(hintKey) : option.description;

                return (
                    <motion.button
                        key={option.id}
                        type="button"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...spring, delay: index * 0.05 }}
                        whileTap={{ scale: 0.995 }}
                        onClick={() => onSelect(option.id)}
                        className={
                            'flex w-full min-w-0 items-center gap-3 border p-4 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6A1B9A] focus-visible:ring-offset-1 rounded-sm ' +
                            (selected
                                ? 'border-[#6A1B9A] bg-[#6A1B9A]/[0.05]'
                                : 'border-[#e0e0e0] bg-white hover:border-[#6A1B9A]/40')
                        }
                    >
                        <div
                            className={
                                'flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border transition-colors ' +
                                (selected
                                    ? 'border-[#6A1B9A] bg-[#6A1B9A] text-white'
                                    : 'border-[#e0e0e0] bg-[#fafafa] text-[#1a1a1a]')
                            }
                        >
                            <NoteIcon name={option.icon} size={24} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div
                                className={
                                    'text-base font-medium leading-snug tracking-tight sm:text-lg ' +
                                    (selected ? 'text-[#6A1B9A]' : 'text-[#121212]')
                                }
                            >
                                {label}
                            </div>
                            {hint ? (
                                <p className="mt-1 text-xs leading-snug text-[#5c5c5c] sm:text-sm">{hint}</p>
                            ) : null}
                        </div>
                        <div
                            className={
                                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ' +
                                (selected ? 'border-[#6A1B9A] bg-[#6A1B9A]' : 'border-[#d0d0d0] bg-white')
                            }
                            aria-hidden
                        >
                            {selected && (
                                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                    </motion.button>
                );
            })}
        </div>
    );
}
