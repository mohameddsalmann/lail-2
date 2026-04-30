'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import type { QuizOption } from '@/types';
import NoteIcon from '@/components/icons/NoteIcon';
import { useI18n } from '@/lib/i18n/context';

const spring = { type: 'spring' as const, stiffness: 380, damping: 28 };

/** Soft, slow scent diffusion — "Moderate / Soft landing". */
function IntensityModerateFx() {
    const wisps = [
        { left: '14%', sway: 4, delay: 0 },
        { left: '24%', sway: -3, delay: 1.5 },
    ];
    const particles = [
        { left: '18%', delay: 0.4 },
        { left: '28%', delay: 1.6 },
    ];
    return (
        <span className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-sm" aria-hidden>
            <motion.span
                className="absolute -left-3 top-1/2 h-28 w-28 -translate-y-1/2 rounded-full bg-[#9575cd]/15 blur-3xl"
                animate={{ opacity: [0.3, 0.55, 0.3], scale: [0.92, 1.06, 0.92] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            />
            {wisps.map((w, i) => (
                <motion.span
                    key={`wisp-${i}`}
                    className="absolute bottom-0 w-[3px] rounded-full blur-[1.5px]"
                    style={{
                        left: w.left,
                        height: '78%',
                        background:
                            'linear-gradient(to top, rgba(149,117,205,0) 0%, rgba(149,117,205,0.65) 38%, rgba(179,157,219,0) 100%)',
                    }}
                    initial={{ opacity: 0, y: 10, scaleY: 0.5 }}
                    animate={{
                        opacity: [0, 0.85, 0],
                        y: [10, -8, -28],
                        scaleY: [0.5, 1, 1.25],
                        x: [0, w.sway, w.sway * 0.4],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeOut',
                        delay: w.delay,
                    }}
                />
            ))}
            {particles.map((p, i) => (
                <motion.span
                    key={`p-${i}`}
                    className="absolute bottom-3 h-1 w-1 rounded-full bg-[#b39ddb]/80 blur-[0.5px]"
                    style={{ left: p.left }}
                    animate={{
                        y: [0, -22, -36],
                        x: [0, i % 2 === 0 ? 4 : -4, 0],
                        opacity: [0, 0.75, 0],
                        scale: [0.5, 1, 0.4],
                    }}
                    transition={{
                        duration: 2.6,
                        repeat: Infinity,
                        ease: 'easeOut',
                        delay: p.delay,
                    }}
                />
            ))}
        </span>
    );
}

/** Pulsing aura with rising trails — "Strong / Noticeable". */
function IntensityStrongFx() {
    const wisps = [
        { left: '14%', sway: 6, delay: 0, duration: 2.4 },
        { left: '26%', sway: -5, delay: 0.7, duration: 2.6 },
        { left: '40%', sway: 4, delay: 1.4, duration: 2.5 },
    ];
    const particles = [0, 1, 2, 3];
    return (
        <span className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-sm" aria-hidden>
            <motion.span
                className="absolute -left-2 top-1/2 h-36 w-36 -translate-y-1/2 rounded-full bg-[#7e57c2]/22 blur-3xl"
                animate={{ opacity: [0.4, 0.7, 0.4], scale: [0.95, 1.12, 0.95] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            />
            {[0, 1].map((i) => (
                <motion.span
                    key={`ring-${i}`}
                    className="absolute left-[14%] top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#7e57c2]/45"
                    initial={{ scale: 0.35, opacity: 0.6 }}
                    animate={{ scale: [0.35, 1.6], opacity: [0.55, 0] }}
                    transition={{
                        duration: 2.2,
                        repeat: Infinity,
                        ease: 'easeOut',
                        delay: i * 1.1,
                    }}
                />
            ))}
            {wisps.map((w, i) => (
                <motion.span
                    key={`wisp-${i}`}
                    className="absolute bottom-0 w-[3.5px] rounded-full blur-[1.5px]"
                    style={{
                        left: w.left,
                        height: '92%',
                        background:
                            'linear-gradient(to top, rgba(126,87,194,0) 0%, rgba(126,87,194,0.75) 35%, rgba(149,117,205,0) 100%)',
                    }}
                    initial={{ opacity: 0, y: 12, scaleY: 0.5 }}
                    animate={{
                        opacity: [0, 0.9, 0],
                        y: [12, -16, -40],
                        scaleY: [0.5, 1.05, 1.4],
                        x: [0, w.sway, w.sway * 0.5],
                    }}
                    transition={{
                        duration: w.duration,
                        repeat: Infinity,
                        ease: 'easeOut',
                        delay: w.delay,
                    }}
                />
            ))}
            {particles.map((i) => (
                <motion.span
                    key={`p-${i}`}
                    className="absolute h-1 w-1 rounded-full bg-[#9575cd]"
                    style={{
                        left: `${14 + i * 8}%`,
                        bottom: `${10 + (i % 2) * 8}%`,
                    }}
                    animate={{
                        y: [0, -26 - i * 4, -46 - i * 4],
                        x: [0, i % 2 === 0 ? 6 : -6, 0],
                        opacity: [0, 0.85, 0],
                        scale: [0.5, 1.1, 0.4],
                    }}
                    transition={{
                        duration: 2.0 + i * 0.15,
                        repeat: Infinity,
                        ease: 'easeOut',
                        delay: i * 0.4,
                    }}
                />
            ))}
        </span>
    );
}

/** Saturated cloud with radiating burst — "Enormous / Fills the room". */
function IntensityEnormousFx() {
    const wisps = [
        { left: '12%', sway: 7, delay: 0, duration: 2.2 },
        { left: '22%', sway: -6, delay: 0.5, duration: 2.4 },
        { left: '34%', sway: 5, delay: 1.0, duration: 2.3 },
        { left: '48%', sway: -7, delay: 0.3, duration: 2.5 },
        { left: '62%', sway: 5, delay: 1.4, duration: 2.2 },
    ];
    const burstCount = 8;
    return (
        <span className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-sm" aria-hidden>
            <motion.span
                className="absolute inset-0 bg-gradient-to-r from-[#7e57c2]/18 via-[#9575cd]/10 to-transparent"
                animate={{ opacity: [0.5, 0.85, 0.5] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.span
                className="absolute -left-4 top-1/2 h-44 w-44 -translate-y-1/2 rounded-full bg-[#7e57c2]/25 blur-3xl"
                animate={{ opacity: [0.55, 0.85, 0.55], scale: [1, 1.18, 1] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            />
            {[0, 1, 2].map((i) => (
                <motion.span
                    key={`ring-${i}`}
                    className="absolute left-[14%] top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#6A1B9A]/45"
                    initial={{ scale: 0.3, opacity: 0.7 }}
                    animate={{ scale: [0.3, 2.0], opacity: [0.65, 0] }}
                    transition={{
                        duration: 2.4,
                        repeat: Infinity,
                        ease: 'easeOut',
                        delay: i * 0.8,
                    }}
                />
            ))}
            {wisps.map((w, i) => (
                <motion.span
                    key={`wisp-${i}`}
                    className="absolute bottom-0 w-[3.5px] rounded-full blur-[1.5px]"
                    style={{
                        left: w.left,
                        height: '105%',
                        background:
                            'linear-gradient(to top, rgba(106,27,154,0) 0%, rgba(106,27,154,0.78) 32%, rgba(149,117,205,0) 100%)',
                    }}
                    initial={{ opacity: 0, y: 14, scaleY: 0.5 }}
                    animate={{
                        opacity: [0, 0.92, 0],
                        y: [14, -22, -50],
                        scaleY: [0.5, 1.1, 1.55],
                        x: [0, w.sway, w.sway * 0.4],
                    }}
                    transition={{
                        duration: w.duration,
                        repeat: Infinity,
                        ease: 'easeOut',
                        delay: w.delay,
                    }}
                />
            ))}
            {Array.from({ length: burstCount }).map((_, i) => {
                const angle = (i / burstCount) * Math.PI * 2;
                const dx = Math.cos(angle) * 64;
                const dy = Math.sin(angle) * 30;
                return (
                    <motion.span
                        key={`burst-${i}`}
                        className="absolute left-[16%] top-1/2 h-1.5 w-1.5 rounded-full bg-[#9575cd]"
                        animate={{
                            x: [0, dx, dx * 1.4],
                            y: [0, dy, dy * 1.4],
                            opacity: [0, 0.85, 0],
                            scale: [0.4, 1.1, 0.3],
                        }}
                        transition={{
                            duration: 1.8 + (i % 3) * 0.18,
                            repeat: Infinity,
                            ease: 'easeOut',
                            delay: i * 0.18,
                        }}
                    />
                );
            })}
        </span>
    );
}

interface QuizStackedChoiceProps {
    options: QuizOption[];
    value: unknown;
    onSelect: (id: string) => void;
    /** i18n keys like quiz.optionHint.female → pass full key per option id */
    hintKeyByOptionId?: Record<string, string>;
    /** `season-grid` — two rows of three compact tiles (season step) */
    layout?: 'stack' | 'season-grid';
    /** Optional per-option animation style on selection (used by intensity step). */
    selectionFxByOptionId?: Record<string, 'moderate' | 'strong' | 'enormous'>;
}

export default function QuizStackedChoice({
    options,
    value,
    onSelect,
    hintKeyByOptionId,
    layout = 'stack',
    selectionFxByOptionId,
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
                                    'mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border transition-all sm:h-11 sm:w-11 ' +
                                    (selected
                                        ? 'border-[#6A1B9A]/35 bg-[#f3eafc] text-[#6A1B9A] shadow-[0_3px_10px_rgba(106,27,154,0.16)]'
                                        : 'border-[#e0e0e0] bg-[#fafafa] text-[#1a1a1a]')
                                }
                            >
                                {option.iconImage ? (
                                    <Image
                                        src={option.iconImage}
                                        alt=""
                                        width={44}
                                        height={44}
                                        className={
                                            'h-[22px] w-[22px] object-contain transition-transform duration-200 sm:h-6 sm:w-6 ' +
                                            (selected ? 'scale-105 drop-shadow-[0_2px_6px_rgba(106,27,154,0.18)]' : '')
                                        }
                                    />
                                ) : (
                                    <NoteIcon name={option.icon} size={22} />
                                )}
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
                            'relative isolate flex w-full min-w-0 items-center gap-3 overflow-hidden border p-4 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6A1B9A] focus-visible:ring-offset-1 rounded-sm ' +
                            (selected
                                ? 'border-[#6A1B9A] bg-[#6A1B9A]/[0.05]'
                                : 'border-[#e0e0e0] bg-white hover:border-[#6A1B9A]/40')
                        }
                    >
                        {selected && selectionFxByOptionId?.[option.id] === 'moderate' && <IntensityModerateFx />}
                        {selected && selectionFxByOptionId?.[option.id] === 'strong' && <IntensityStrongFx />}
                        {selected && selectionFxByOptionId?.[option.id] === 'enormous' && <IntensityEnormousFx />}
                        <div
                            className={
                                'relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border transition-all ' +
                                (selected
                                    ? 'border-[#6A1B9A]/35 bg-[#f3eafc] text-[#6A1B9A] shadow-[0_3px_10px_rgba(106,27,154,0.16)]'
                                    : 'border-[#e0e0e0] bg-[#fafafa] text-[#1a1a1a]')
                            }
                        >
                            {option.iconImage ? (
                                <Image
                                    src={option.iconImage}
                                    alt=""
                                    width={48}
                                    height={48}
                                    className={
                                        'h-[26px] w-[26px] object-contain transition-transform duration-200 ' +
                                        (selected ? 'scale-105 drop-shadow-[0_2px_6px_rgba(106,27,154,0.18)]' : '')
                                    }
                                />
                            ) : (
                                <NoteIcon name={option.icon} size={24} />
                            )}
                        </div>
                        <div className="relative z-10 min-w-0 flex-1">
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
                                'relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ' +
                                (selected ? 'border-[#6A1B9A] bg-[#6A1B9A]' : 'border-[#d0d0d0] bg-white')
                            }
                            aria-hidden
                        >
                            {selected && (
                                <motion.svg
                                    initial={{ scale: 0.75, rotate: -18 }}
                                    animate={{ scale: [0.9, 1.08, 1], rotate: [-18, 4, 0] }}
                                    transition={{ duration: 0.38, ease: 'easeOut' }}
                                    className="h-3 w-3 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={3}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </motion.svg>
                            )}
                        </div>
                    </motion.button>
                );
            })}
        </div>
    );
}
