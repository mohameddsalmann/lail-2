'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fragranceNotes, noteCategories } from '@/config/quizSteps';
import type { QuizOption } from '@/types';
import { useI18n } from '@/lib/i18n/context';

const bouncySpring = { type: 'spring' as const, stiffness: 500, damping: 20 };
const shellClass = 'rounded-sm border border-[#eee] bg-white';

const categoriesWithCounts = noteCategories.map((cat) => ({
    ...cat,
    count: (fragranceNotes as Record<string, QuizOption[]>)[cat.id]?.length ?? 0,
}));

interface NotesSelectedSummaryProps {
    mode: 'love' | 'avoid';
    value: string[];
    onChange: (ids: string[]) => void;
    disabledNotes?: string[];
}

/**
 * Selected-notes panel (chips, clear, “already in…” block). Shared with `NotesSelectorStep`
 * and rendered below nav on the “love notes” step when `selectedPanel="none"`.
 */
export default function NotesSelectedSummary({ mode, value, onChange, disabledNotes = [] }: NotesSelectedSummaryProps) {
    const { t, locale } = useI18n();
    const isLove = mode === 'love';

    const selectedIds = useMemo(() => {
        const arr = Array.isArray(value) ? value : [];
        return arr.filter((id) => id !== 'none');
    }, [value]);

    const disabledNoteIds = useMemo(
        () => new Set(disabledNotes.filter((id) => id !== 'none')),
        [disabledNotes]
    );

    const selectedNotes = useMemo(() => {
        const notes: { id: string; label: string; icon: string }[] = [];
        for (const cat of categoriesWithCounts) {
            const items = (fragranceNotes as Record<string, QuizOption[]>)[cat.id] ?? [];
            for (const note of items) {
                if (selectedIds.includes(note.id) && !notes.some((item) => item.id === note.id)) {
                    notes.push({ id: note.id, label: locale === 'ar' ? note.labelAr : note.label, icon: note.icon });
                }
            }
        }
        return notes.sort((a, b) => selectedIds.indexOf(a.id) - selectedIds.indexOf(b.id));
    }, [selectedIds, locale]);

    const disabledSelectedNotes = useMemo(() => {
        if (disabledNoteIds.size === 0) return [];
        const notes: { id: string; label: string; icon: string }[] = [];
        for (const cat of categoriesWithCounts) {
            const items = (fragranceNotes as Record<string, QuizOption[]>)[cat.id] ?? [];
            for (const note of items) {
                if (disabledNoteIds.has(note.id) && !notes.some((item) => item.id === note.id)) {
                    notes.push({ id: note.id, label: locale === 'ar' ? note.labelAr : note.label, icon: note.icon });
                }
            }
        }
        return notes;
    }, [disabledNoteIds, locale]);

    const removeSelected = (noteId: string) => {
        onChange(selectedIds.filter((id) => id !== noteId));
    };

    return (
        <div className={`${shellClass} p-4 sm:p-5`}>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                    <p className="site-eyebrow">{t('notes.selected')}</p>
                    <p className="mt-3 text-sm leading-7 text-[#4d4d4d]">
                        {selectedNotes.length > 0
                            ? isLove
                                ? t('notes.selected.love')
                                : t('notes.selected.avoid')
                            : isLove
                              ? t('notes.empty.love')
                              : t('notes.empty.avoid')}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => onChange([])}
                    className="shrink-0 text-xs uppercase tracking-[0.22em] text-[#5c5c5c] transition hover:text-[#121212]"
                >
                    {t('notes.clearList')}
                </button>
            </div>

            <AnimatePresence mode="popLayout">
                {selectedNotes.length > 0 && (
                    <motion.div className="mt-5 flex flex-wrap gap-2">
                        {selectedNotes.map((note) => (
                            <motion.button
                                key={note.id}
                                layout
                                initial={{ opacity: 0, scale: 0.8, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, y: -10 }}
                                transition={bouncySpring}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => removeSelected(note.id)}
                                className={
                                    'inline-flex items-center gap-2 border px-3 py-1.5 text-sm transition ' +
                                    (isLove
                                        ? 'border-[#121212] bg-[#121212] text-white'
                                        : 'border-[#e53935] bg-[#e53935] text-white')
                                }
                            >
                                <span>{note.label}</span>
                                <span aria-hidden>×</span>
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {disabledSelectedNotes.length > 0 && (
                <div className="mt-5 border-t border-[#dcdcdc] pt-5">
                    <p className="site-eyebrow">{isLove ? t('notes.alreadyLove') : t('notes.alreadyAvoid')}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {disabledSelectedNotes.map((note) => (
                            <span
                                key={note.id}
                                className="inline-flex items-center gap-2 border border-[#dcdcdc] bg-[#f3f3f3] px-3 py-1.5 text-sm text-[#5c5c5c]"
                            >
                                <span>{note.label}</span>
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
