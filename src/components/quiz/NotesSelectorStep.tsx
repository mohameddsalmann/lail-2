'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { fragranceNotes, noteCategories, quickPickNoteIds, uniqueAllNotes } from '@/config/quizSteps';
import type { QuizOption } from '@/types';
import LucideIcon from '@/components/ui/LucideIcon';
import NoteIcon from '@/components/icons/NoteIcon';
import NotesSelectedSummary from './NotesSelectedSummary';
import { useI18n } from '@/lib/i18n/context';

const MAX_LOVE_SELECTIONS = 10;
const MAX_AVOID_SELECTIONS = 20;

const categoriesWithCounts = noteCategories.map((cat) => ({
    ...cat,
    count: (fragranceNotes as Record<string, QuizOption[]>)[cat.id]?.length ?? 0,
}));

interface NotesSelectorStepProps {
    mode: 'love' | 'avoid';
    value: string[];
    onChange: (ids: string[]) => void;
    disabledNotes?: string[];
    /** When `none`, omit the Selected notes panel — render it separately (e.g. below quiz nav). */
    selectedPanel?: 'inline' | 'none';
}

const elegantSpring = { type: 'spring' as const, stiffness: 350, damping: 28 };

const shellClass = 'rounded-sm border border-[#eee] bg-white';

function AvoidCheckIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5" />
        </svg>
    );
}

export default function NotesSelectorStep({
    mode,
    value,
    onChange,
    disabledNotes = [],
    selectedPanel = 'inline',
}: NotesSelectorStepProps) {
    const { t, locale } = useI18n();
    const [search, setSearch] = useState('');
    const [showAllCatalog, setShowAllCatalog] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => new Set());
    const catalogRef = useRef<HTMLDivElement | null>(null);

    const totalCatalogCount = uniqueAllNotes.length;

    const quickPickNotes = useMemo(() => {
        const byId = new Map(uniqueAllNotes.map((n) => [n.id, n]));
        return quickPickNoteIds.map((id) => byId.get(id)).filter(Boolean) as QuizOption[];
    }, []);

    const selectedIds = useMemo(() => {
        const arr = Array.isArray(value) ? value : [];
        return arr.filter((id) => id !== 'none');
    }, [value]);
    const disabledNoteIds = useMemo(
        () => new Set(disabledNotes.filter((id) => id !== 'none')),
        [disabledNotes]
    );

    const maxSelections = mode === 'love' ? MAX_LOVE_SELECTIONS : MAX_AVOID_SELECTIONS;
    const atLimit = selectedIds.length >= maxSelections;

    useEffect(() => {
        if (!showAllCatalog) return;
        const frameId = window.requestAnimationFrame(() => {
            catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        return () => window.cancelAnimationFrame(frameId);
    }, [showAllCatalog]);

    useEffect(() => {
        if (disabledNoteIds.size === 0) return;

        const safeIds = selectedIds.filter((id) => !disabledNoteIds.has(id));
        if (safeIds.length !== selectedIds.length) {
            onChange(safeIds);
        }
    }, [disabledNoteIds, onChange, selectedIds]);

    const handleToggle = (noteId: string) => {
        if (disabledNoteIds.has(noteId)) return;

        if (selectedIds.includes(noteId)) {
            onChange(selectedIds.filter((id) => id !== noteId));
            return;
        }

        if (atLimit) return;
        onChange([...selectedIds, noteId]);
    };

    const filterNotes = (notes: QuizOption[]) => {
        const q = search.trim().toLowerCase();
        const visibleNotes = disabledNoteIds.size > 0 ? notes.filter((note) => !disabledNoteIds.has(note.id)) : notes;

        if (!q) return visibleNotes;
        return visibleNotes.filter(
            (note) =>
                note.label.toLowerCase().includes(q) ||
                (note.labelAr && note.labelAr.toLowerCase().includes(q))
        );
    };

    const toggleCategory = (catId: string) => {
        setExpandedCategories((prev) => {
            const next = new Set(prev);
            if (next.has(catId)) next.delete(catId);
            else next.add(catId);
            return next;
        });
    };

    const isLove = mode === 'love';

    return (
        <div className="space-y-5">
            {/* Quick picks — 2×3 grid of scent tiles */}
            <div>
                <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#888]">
                    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h10" />
                    </svg>
                    {t('notes.quickPicks')}
                </div>
                <div className="grid w-full grid-cols-3 gap-2 sm:gap-2.5">
                    {quickPickNotes.map((note, index) => {
                        const selected = selectedIds.includes(note.id);
                        const blockedByOtherStep = disabledNoteIds.has(note.id);
                        const cappedOut = !selected && atLimit && !blockedByOtherStep;
                        const disabled = blockedByOtherStep || cappedOut;
                        const label = locale === 'ar' ? note.labelAr : note.label;

                        const tileClass =
                            'relative flex min-h-[118px] w-full min-w-0 flex-col items-center justify-between gap-1 border px-1.5 pb-2.5 pt-2 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 sm:min-h-[128px] sm:px-2 sm:pb-3 sm:pt-2.5 rounded-sm ' +
                            (isLove ? 'focus-visible:ring-[#6A1B9A]' : 'focus-visible:ring-[#e53935]');

                        const pickStyle = blockedByOtherStep
                            ? ' border-dashed border-[#b0b0b0] bg-[#f0f0f0] cursor-not-allowed'
                            : selected
                              ? isLove
                                  ? ' border-[#6A1B9A] bg-[#6A1B9A]/[0.1] shadow-sm ring-2 ring-[#6A1B9A]/30'
                                  : ' border-[#e53935] bg-[#e53935]/[0.08] ring-2 ring-[#e53935]/25'
                              : isLove
                                ? ' border-[#e0e0e0] bg-white hover:border-[#6A1B9A]/40'
                                : ' border-[#e0e0e0] bg-white hover:border-[#e53935]/40';

                        const dim = cappedOut ? ' cursor-not-allowed opacity-40' : '';

                        return (
                            <motion.button
                                key={note.id}
                                type="button"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ ...elegantSpring, delay: index * 0.04 }}
                                whileTap={{ scale: disabled ? 1 : 0.98 }}
                                onClick={() => !disabled && handleToggle(note.id)}
                                disabled={disabled}
                                aria-pressed={selected}
                                aria-label={
                                    blockedByOtherStep
                                        ? `${label} — ${isLove ? t('notes.blockedByAvoid') : t('notes.blockedByLove')}`
                                        : undefined
                                }
                                className={tileClass + pickStyle + dim}
                            >
                                <div
                                    className={
                                        'absolute end-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full border transition-colors sm:end-2 sm:top-2 sm:h-6 sm:w-6 ' +
                                        (blockedByOtherStep
                                            ? 'border-[#b0b0b0] bg-[#e8e8e8]'
                                            : selected
                                              ? isLove
                                                  ? 'border-[#6A1B9A] bg-[#6A1B9A]'
                                                  : 'border-[#e53935] bg-[#e53935]'
                                              : 'border-[#d0d0d0] bg-white')
                                    }
                                    aria-hidden
                                >
                                    {blockedByOtherStep && (
                                        <svg
                                            className="h-2.5 w-2.5 text-[#666] sm:h-3 sm:w-3"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <rect x="6" y="10" width="12" height="10" rx="1.5" />
                                            <path strokeLinecap="round" d="M9 10V8a3 3 0 016 0v2" />
                                        </svg>
                                    )}
                                    {!blockedByOtherStep && selected && isLove && (
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
                                    {!blockedByOtherStep && selected && !isLove && (
                                        <AvoidCheckIcon className="h-3 w-3 shrink-0 text-white sm:h-3.5 sm:w-3.5" />
                                    )}
                                </div>
                                <div className="relative mt-1 flex min-h-[3.25rem] w-full flex-1 flex-col items-center justify-center px-1 sm:min-h-[3.75rem]">
                                    <div className="flex h-full w-full flex-col items-center justify-center [&_svg]:stroke-[currentColor]">
                                        {note.iconImage ? (
                                            <Image
                                                src={note.iconImage}
                                                alt=""
                                                width={128}
                                                height={128}
                                                sizes="(max-width: 640px) 76px, 84px"
                                                className={
                                                    'h-[4.75rem] w-[4.75rem] select-none object-contain object-center transition duration-200 sm:h-[5.25rem] sm:w-[5.25rem] ' +
                                                    (blockedByOtherStep
                                                        ? 'opacity-50 saturate-[0.72]'
                                                        : selected
                                                          ? isLove
                                                              ? 'scale-[1.04] drop-shadow-[0_4px_16px_rgba(106,27,154,0.22)]'
                                                              : 'scale-[1.04] drop-shadow-[0_4px_14px_rgba(229,57,53,0.2)]'
                                                          : 'drop-shadow-[0_2px_10px_rgba(15,23,42,0.07)] hover:scale-[1.02] hover:drop-shadow-[0_4px_14px_rgba(15,23,42,0.1)]')
                                                }
                                                priority={index < 3}
                                            />
                                        ) : note.lucideIcon ? (
                                            <span
                                                className={
                                                    'flex h-11 w-11 items-center justify-center rounded-full sm:h-12 sm:w-12 ' +
                                                    (blockedByOtherStep
                                                        ? 'bg-neutral-100/90 text-neutral-500'
                                                        : selected
                                                          ? isLove
                                                              ? 'bg-[#f3eafc] text-[#6A1B9A]'
                                                              : 'bg-[#ffebee] text-[#e53935]'
                                                          : 'bg-neutral-50/95 text-neutral-800')
                                                }
                                            >
                                                <LucideIcon name={note.lucideIcon} size={24} aria-hidden />
                                            </span>
                                        ) : (
                                            <span
                                                className={
                                                    'flex h-10 w-10 items-center justify-center rounded-full sm:h-11 sm:w-11 ' +
                                                    (blockedByOtherStep
                                                        ? 'bg-neutral-100/90'
                                                        : selected
                                                          ? isLove
                                                              ? 'bg-[#f3eafc]'
                                                              : 'bg-[#ffebee]'
                                                          : 'bg-neutral-50/95')
                                                }
                                            >
                                                <NoteIcon name={note.icon} size={22} />
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <span
                                    className={
                                        'line-clamp-2 max-w-full px-1 pt-1 text-center text-[12px] font-semibold leading-snug tracking-tight sm:text-[13px] ' +
                                        (blockedByOtherStep
                                            ? 'text-[#8a8a8a]'
                                            : selected
                                              ? isLove
                                                  ? 'text-[#5a1578]'
                                                  : 'text-[#c62828]'
                                              : 'text-[#222]')
                                    }
                                >
                                    {label}
                                </span>
                                {blockedByOtherStep && (
                                    <span className="line-clamp-2 max-w-full px-0.5 text-[9px] font-medium leading-snug text-[#9a9a9a] sm:text-[10px]">
                                        {isLove ? t('notes.blockedShort') : t('notes.blockedShortAvoid')}
                                    </span>
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* See all — expands full catalog */}
            <motion.button
                type="button"
                onClick={() => {
                    if (showAllCatalog) {
                        setSearch('');
                        setExpandedCategories(new Set());
                    }
                    setShowAllCatalog((v) => !v);
                }}
                whileTap={{ scale: 0.99 }}
                animate={{
                    scale: showAllCatalog ? 1.005 : 1,
                }}
                transition={{ ...elegantSpring, duration: 0.32 }}
                className={
                    'flex w-full items-center gap-3 rounded-sm px-4 py-3 text-left text-sm text-[#1a1a1a] transition ' +
                    (isLove
                        ? 'border-[#d9c6ea] bg-[#f7f0fd] hover:border-[#6A1B9A]/45 hover:bg-[#f4e9fc]'
                        : 'border-[#efc2c0] bg-[#fff3f3] hover:border-[#e53935]/45 hover:bg-[#ffeded]')
                }
            >
                <motion.span
                    animate={{
                        backgroundColor: showAllCatalog
                            ? isLove
                                ? '#7B1FA2'
                                : '#d32f2f'
                            : isLove
                              ? '#6A1B9A'
                              : '#e53935',
                        rotate: showAllCatalog ? 90 : 0,
                        scale: showAllCatalog ? 1.04 : 1,
                        y: 0,
                        opacity: 1,
                    }}
                    transition={{ ...elegantSpring, stiffness: 380 }}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white"
                    aria-hidden
                >
                    <motion.svg
                        animate={{
                            scale: showAllCatalog ? [1.06, 1.12, 1.06] : [1, 1.1, 1],
                            rotate: showAllCatalog ? [0, -6, 0, 6, 0] : [0, 8, 0, -8, 0],
                            opacity: 1,
                        }}
                        transition={{ duration: showAllCatalog ? 1.05 : 1.2, repeat: Infinity, ease: 'easeInOut' }}
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M12 6v12M6 12h12" />
                    </motion.svg>
                </motion.span>
                <span className="min-w-0 flex-1">
                    <span className="block text-[19px] font-semibold leading-tight text-[#2a2a2a] sm:text-[20px]">
                        {showAllCatalog ? t('notes.hideCatalog') : `${t('notes.seeAll')} (${totalCatalogCount})`}
                    </span>
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                            key={showAllCatalog ? 'hintHide' : 'hintSee'}
                            initial={{ opacity: 0, y: 3 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -3 }}
                            transition={{ duration: 0.18 }}
                            className="mt-0.5 block text-xs text-[#8a8a8a]"
                        >
                            {showAllCatalog ? t('notes.tapToCollapseCatalog') : t('notes.tapToBrowseCatalog')}
                        </motion.span>
                    </AnimatePresence>
                </span>
                <motion.svg
                    animate={{
                        rotate: showAllCatalog ? 180 : 0,
                        y: showAllCatalog ? 1 : [0, 2, 0],
                        scale: showAllCatalog ? 1.02 : [1, 1.06, 1],
                    }}
                    transition={
                        showAllCatalog
                            ? { ...elegantSpring, stiffness: 420 }
                            : { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
                    }
                    className="h-5 w-5 shrink-0 text-[#5f5f5f]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
            </motion.button>

            <AnimatePresence initial={false}>
                {showAllCatalog && (
                    <motion.div
                        ref={catalogRef}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1, y: 0 }}
                        exit={{ height: 0, opacity: 0, y: -4 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 32, mass: 0.7 }}
                        className="space-y-5 overflow-hidden"
                    >
                        <div className={`${shellClass} p-4`}>
                            <div className="relative">
                                <svg
                                    className="pointer-events-none absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#666]"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder={t('notes.search')}
                                    className={
                                        'w-full rounded-sm border border-[#dcdcdc] bg-white py-3 pl-12 pr-4 text-[15px] text-[#111] outline-none transition placeholder:text-[#6d6d6d] placeholder:opacity-100 ' +
                                        (isLove ? 'focus:border-[#6A1B9A]/50' : 'focus:border-[#e53935]/45')
                                    }
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <AnimatePresence>
                                {categoriesWithCounts.map((cat, catIndex) => {
                                    const notes = (fragranceNotes as Record<string, QuizOption[]>)[cat.id] ?? [];
                                    const filtered = filterNotes(notes);
                                    const isExpanded = expandedCategories.has(cat.id);

                                    if (search && filtered.length === 0) return null;

                                    return (
                                        <motion.div
                                            key={cat.id}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ ...elegantSpring, delay: catIndex * 0.02 }}
                                            layout
                                            className={`${shellClass} overflow-hidden`}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => toggleCategory(cat.id)}
                                                aria-expanded={isExpanded}
                                                className="flex w-full items-center gap-3 px-3 py-3.5 text-left sm:gap-4 sm:px-4"
                                            >
                                                <LucideIcon
                                                    name={cat.lucideIcon}
                                                    size={24}
                                                    className="shrink-0 text-[#1a1a1a]"
                                                    aria-hidden
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-semibold leading-tight text-[#121212]">
                                                        {locale === 'ar' ? cat.labelAr : cat.label}
                                                    </p>
                                                    <p className="mt-0.5 text-sm text-[#6b6b6b]">
                                                        {filtered.length}{' '}
                                                        {filtered.length === 1 ? t('notes.count') : t('notes.count_plural')}
                                                    </p>
                                                </div>
                                                <span className="hidden shrink-0 rounded-full bg-[#e8e8e8] px-2.5 py-1 text-xs font-semibold tabular-nums text-[#333] sm:inline-block">
                                                    {filtered.length}
                                                </span>
                                                <motion.svg
                                                    animate={{ rotate: isExpanded ? 180 : 0 }}
                                                    transition={elegantSpring}
                                                    className="h-5 w-5 shrink-0 text-[#555]"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    aria-hidden
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </motion.svg>
                                            </button>

                                            <AnimatePresence initial={false}>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                                                        className="overflow-hidden border-t border-[#e5e5e5] bg-[#f5f5f5]"
                                                    >
                                                        <div className="flex flex-wrap gap-2 p-3 sm:p-4">
                                                            {filtered.map((note, noteIndex) => {
                                                                const selected = selectedIds.includes(note.id);
                                                                const blockedByOtherStep = disabledNoteIds.has(note.id);
                                                                const disabled = blockedByOtherStep || (!selected && atLimit);
                                                                const label = locale === 'ar' ? note.labelAr : note.label;

                                                                return (
                                                                    <motion.button
                                                                        key={note.id}
                                                                        initial={{ opacity: 0 }}
                                                                        animate={{ opacity: 1 }}
                                                                        transition={{ delay: Math.min(noteIndex * 0.02, 0.35) }}
                                                                        type="button"
                                                                        onClick={() => !disabled && handleToggle(note.id)}
                                                                        disabled={disabled}
                                                                        whileTap={!disabled ? { scale: 0.98 } : {}}
                                                                        className={
                                                                            'inline-flex items-center gap-1.5 rounded-sm border px-3 py-2 text-sm font-medium transition ' +
                                                                            (selected
                                                                                ? isLove
                                                                                    ? 'border-[#121212] bg-[#121212] text-white'
                                                                                    : 'border-[#e53935] bg-[#e53935] text-white'
                                                                                : 'border-[#cfcfcf] bg-white text-[#121212] ' +
                                                                                  (isLove ? 'hover:border-[#9a9a9a]' : 'hover:border-[#e53935]/50')) +
                                                                            (disabled ? ' cursor-not-allowed opacity-45' : '')
                                                                        }
                                                                        >
                                                                            {selected && !isLove && (
                                                                                <AvoidCheckIcon className="h-3.5 w-3.5 shrink-0 text-white" />
                                                                            )}
                                                                            {label}
                                                                        </motion.button>
                                                                );
                                                            })}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {selectedPanel === 'inline' && (
                <NotesSelectedSummary
                    mode={mode}
                    value={Array.isArray(value) ? value : []}
                    onChange={onChange}
                    disabledNotes={disabledNotes}
                />
            )}

            {atLimit && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-sm text-[#121212]">
                    {t('notes.maxReached')}
                </motion.p>
            )}
        </div>
    );
}
