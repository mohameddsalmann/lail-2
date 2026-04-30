'use client';

import { motion } from 'framer-motion';
import { QuizStep } from '@/types';
import NotesSelectorStep from './NotesSelectorStep';
import QuizStackedChoice from './QuizStackedChoice';
import { useI18n } from '@/lib/i18n/context';

interface QuizQuestionProps {
    step: QuizStep;
    value: unknown;
    onChange: (value: unknown) => void;
    otherAnswers?: {
        favoriteNotes?: string[];
        avoidedNotes?: string[];
    };
}

const elegantSpring = { type: 'spring' as const, stiffness: 350, damping: 28 };
const INTENSITY_EFFECTS: Record<string, 'moderate' | 'strong' | 'enormous'> = {
    light: 'moderate',
    moderate: 'strong',
    strong: 'enormous',
};

const stepCopy: Record<string, { eyebrow: string; title: string; description: string }> = {
    gender: {
        eyebrow: 'Direction',
        title: 'Who are we curating this bottle for?',
        description: 'This sets the first filter before notes and season take over.',
    },
    season: {
        eyebrow: 'Season',
        title: 'When should this fragrance perform best?',
        description: 'Pick the weather window you actually care about testing.',
    },
    intensity: {
        eyebrow: 'Projection',
        title: 'How much presence should it leave behind?',
        description: 'Go lighter for easy daily wear or stronger for room-filling performance.',
    },
};

const GENDER_HINT_KEYS: Record<string, string> = {
    female: 'quiz.optionHint.female',
    male: 'quiz.optionHint.male',
    unisex: 'quiz.optionHint.unisex',
};


export default function QuizQuestion({ step, value, onChange, otherAnswers }: QuizQuestionProps) {
    const { t } = useI18n();

    if (step.name === 'favoriteNotes') {
        const ids = Array.isArray(value) ? (value as string[]).filter((id) => id !== 'none') : [];
        const avoidedNoteIds = otherAnswers?.avoidedNotes ?? [];
        return (
            <motion.div>
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...elegantSpring, delay: 0 }}
                    className="site-eyebrow"
                >
                    {t('quiz.step.favoriteNotes.eyebrow')}
                </motion.p>
                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...elegantSpring, delay: 0.05 }}
                    className="mt-3 font-serif text-3xl font-medium leading-tight text-[#121212] sm:text-[2rem]"
                >
                    {t('quiz.step.favoriteNotes.title')}
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...elegantSpring, delay: 0.1 }}
                    className="mt-3 max-w-xl text-sm leading-relaxed text-[#5c5c5c] sm:text-base"
                >
                    {t('quiz.step.favoriteNotes.desc')}
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, scaleX: 0.6 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{ ...elegantSpring, delay: 0.12 }}
                    className="mt-5 h-0.5 w-14 origin-start rounded-none bg-gradient-to-r from-[#C9A84C] to-[#6A1B9A]"
                    aria-hidden
                />
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...elegantSpring, delay: 0.14 }}
                    className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#6A1B9A] px-3 py-1.5"
                >
                    <svg className="h-4 w-4 text-[#6A1B9A]" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    <span className="text-xs font-medium text-[#6A1B9A]">{t('notes.badgeBoost')}</span>
                </motion.div>
                <div className="mt-8">
                    <NotesSelectorStep
                        mode="love"
                        value={ids}
                        onChange={(ids) => onChange(ids)}
                        disabledNotes={avoidedNoteIds}
                        selectedPanel="none"
                    />
                </div>
            </motion.div>
        );
    }

    if (step.name === 'avoidedNotes') {
        const ids = Array.isArray(value) ? (value as string[]).filter((id) => id !== 'none') : [];
        const favoriteNoteIds = otherAnswers?.favoriteNotes ?? [];
        return (
            <motion.div>
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...elegantSpring, delay: 0 }}
                    className="site-eyebrow"
                >
                    {t('quiz.step.avoidedNotes.eyebrow')}
                </motion.p>
                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...elegantSpring, delay: 0.05 }}
                    className="mt-3 font-serif text-3xl font-medium leading-tight text-[#121212] sm:text-[2rem]"
                >
                    {t('quiz.step.avoidedNotes.title')}
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...elegantSpring, delay: 0.1 }}
                    className="mt-3 max-w-xl text-sm leading-relaxed text-[#5c5c5c] sm:text-base"
                >
                    {t('quiz.step.avoidedNotes.desc')}
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, scaleX: 0.6 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{ ...elegantSpring, delay: 0.12 }}
                    className="mt-5 h-0.5 w-14 origin-start rounded-none bg-gradient-to-r from-[#C9A84C] to-[#6A1B9A]"
                    aria-hidden
                />
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...elegantSpring, delay: 0.14 }}
                    className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#e53935] px-3 py-1.5"
                >
                    <svg className="h-4 w-4 text-[#e53935]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
                    </svg>
                    <span className="text-xs font-medium text-[#e53935]">{t('notes.badgeFilter')}</span>
                </motion.div>
                <div className="mt-8">
                    <NotesSelectorStep
                        mode="avoid"
                        value={ids}
                        onChange={(ids) => onChange(ids)}
                        disabledNotes={favoriteNoteIds}
                        selectedPanel="none"
                    />
                </div>
            </motion.div>
        );
    }

    const copy = stepCopy[step.name] ?? {
        eyebrow: t('quiz.step.default.eyebrow'),
        title: step.question,
        description: t('quiz.step.default.desc'),
    };

    const i18nCopy: Record<string, { eyebrow: string; title: string; description: string }> = {
        gender: {
            eyebrow: t('quiz.step.gender.eyebrow'),
            title: t('quiz.step.gender.title'),
            description: t('quiz.step.gender.desc'),
        },
        season: {
            eyebrow: t('quiz.step.season.eyebrow'),
            title: t('quiz.step.season.title'),
            description: t('quiz.step.season.desc'),
        },
        intensity: {
            eyebrow: t('quiz.step.intensity.eyebrow'),
            title: t('quiz.step.intensity.title'),
            description: t('quiz.step.intensity.desc'),
        },
    };

    const finalCopy = i18nCopy[step.name] ?? copy;

    if (step.type === 'single') {
        return (
            <motion.div>
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...elegantSpring, delay: 0 }}
                    className="site-eyebrow"
                >
                    {finalCopy.eyebrow}
                </motion.p>
                <motion.h2
                    key={finalCopy.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...elegantSpring, delay: 0.05 }}
                    className="mt-3 font-serif text-3xl font-medium leading-tight text-[#121212] sm:text-[2rem]"
                >
                    {finalCopy.title}
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...elegantSpring, delay: 0.1 }}
                    className="mt-3 max-w-xl text-sm leading-relaxed text-[#5c5c5c] sm:text-base"
                >
                    {finalCopy.description}
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, scaleX: 0.6 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{ ...elegantSpring, delay: 0.12 }}
                    className="mt-5 h-0.5 w-14 origin-start rounded-none bg-gradient-to-r from-[#C9A84C] to-[#6A1B9A]"
                    aria-hidden
                />
                <div className="mt-8">
                    <QuizStackedChoice
                        options={step.options}
                        value={value}
                        onSelect={(id) => onChange(id)}
                        hintKeyByOptionId={step.name === 'gender' ? GENDER_HINT_KEYS : undefined}
                        layout={step.name === 'season' ? 'season-grid' : 'stack'}
                        selectionFxByOptionId={step.name === 'intensity' ? INTENSITY_EFFECTS : undefined}
                    />
                </div>
            </motion.div>
        );
    }

    return null;
}
