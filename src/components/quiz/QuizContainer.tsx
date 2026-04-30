'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuiz } from '@/hooks/useQuiz';
import { quizSteps } from '@/config/quizSteps';
import StoreFooter from '@/components/site/StoreFooter';
import QuizTopBar from '@/components/quiz/QuizTopBar';
import QuizProgress from './QuizProgress';
import QuizQuestion from './QuizQuestion';
import QuizNavigation from './QuizNavigation';
import NotesSelectedSummary from './NotesSelectedSummary';
import QuizResults from './QuizResults';
import { useI18n } from '@/lib/i18n/context';

const elegantSpring = { type: 'spring' as const, stiffness: 350, damping: 28 };

/** Premium full-screen loader shown while matches are computed. */
function QuizLoadingScreen() {
    const { t } = useI18n();
    const [phase, setPhase] = useState(0);

    useEffect(() => {
        const id = window.setInterval(() => setPhase((p) => (p + 1) % 3), 900);
        return () => window.clearInterval(id);
    }, []);

    const stages = [
        t('quiz.step.favoriteNotes.eyebrow'),
        t('quiz.step.season.eyebrow'),
        t('quiz.step.intensity.eyebrow'),
    ];

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#faf9fc] text-[#121212]">
            <div
                className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-8%,rgba(106,27,154,0.11),transparent_55%)]"
                aria-hidden
            />
            <div
                className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_80%_90%,rgba(201,168,76,0.06),transparent_40%)]"
                aria-hidden
            />

            <QuizTopBar />

            <div className="relative mx-auto flex min-h-[calc(100vh-7rem)] max-w-lg items-center justify-center px-4 py-14 sm:max-w-xl">
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={elegantSpring}
                    className="relative w-full"
                >
                    <div
                        className="absolute -inset-px rounded-sm bg-gradient-to-br from-[#6A1B9A]/15 via-transparent to-[#C9A84C]/10 opacity-90"
                        aria-hidden
                    />
                    <div className="relative overflow-hidden rounded-sm border border-[#e6e2eb] bg-white/95 px-8 py-11 text-center shadow-[0_22px_55px_-18px_rgba(106,27,154,0.18)] backdrop-blur-[2px] sm:px-12 sm:py-14">
                        <motion.div
                            className="absolute inset-x-0 bottom-0 h-px overflow-hidden"
                            aria-hidden
                        >
                            <motion.div
                                className="h-full w-1/2 bg-gradient-to-r from-transparent via-[#6A1B9A]/70 to-transparent"
                                animate={{ x: ['-80%', '280%'] }}
                                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                            />
                        </motion.div>

                        <div className="relative mx-auto h-[4.75rem] w-[4.75rem]">
                            <motion.div
                                className="absolute inset-0 rounded-full border-2 border-[#e8e0f0] border-t-[#6A1B9A] border-r-[#6A1B9A]/40"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1.15, repeat: Infinity, ease: 'linear' }}
                                aria-hidden
                            />
                            <motion.div
                                className="absolute inset-2 rounded-full border-2 border-transparent border-b-[#9575cd] border-l-[#b39ddb]/60"
                                animate={{ rotate: -360 }}
                                transition={{ duration: 1.65, repeat: Infinity, ease: 'linear' }}
                                aria-hidden
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <motion.span
                                    className="h-2 w-2 rounded-full bg-[#6A1B9A] shadow-[0_0_12px_rgba(106,27,154,0.55)]"
                                    animate={{ scale: [1, 1.4, 1], opacity: [0.85, 1, 0.85] }}
                                    transition={{ duration: 1.35, repeat: Infinity, ease: 'easeInOut' }}
                                    aria-hidden
                                />
                            </div>
                        </div>

                        <motion.p
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ ...elegantSpring, delay: 0.08 }}
                            className="site-eyebrow mt-8"
                        >
                            {t('quiz.loading.eyebrow')}
                        </motion.p>
                        <motion.h2
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ ...elegantSpring, delay: 0.14 }}
                            className="mt-3 font-serif text-[1.35rem] font-medium leading-snug text-[#121212] sm:text-[1.55rem]"
                        >
                            {t('quiz.loading.title')}
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ ...elegantSpring, delay: 0.2 }}
                            className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[#5a5a5a] sm:text-[0.9375rem]"
                        >
                            {t('quiz.loading.desc')}
                        </motion.p>

                        <div className="mt-9 flex flex-wrap items-center justify-center gap-2">
                            {stages.map((label, i) => (
                                <motion.span
                                    key={`loading-stage-${i}`}
                                    animate={{
                                        scale: phase === i ? 1.04 : 1,
                                        opacity: phase === i ? 1 : 0.5,
                                    }}
                                    transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                                    className={
                                        'rounded-full border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] ' +
                                        (phase === i
                                            ? 'border-[#6A1B9A]/45 bg-[#f3eafc] text-[#5a1578]'
                                            : 'border-[#e8e8e8] bg-[#fafafa] text-[#757575]')
                                    }
                                >
                                    {label}
                                </motion.span>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>

            <StoreFooter />
        </div>
    );
}

export default function QuizContainer() {
    const { t } = useI18n();
    const {
        currentStep,
        totalSteps,
        answers,
        setAnswer,
        nextStep,
        prevStep,
        skipStep,
        submitQuiz,
        resetQuiz,
        isComplete,
        isLoading,
        recommendations,
        browsableCollection,
        usedFallback,
        confidenceLevel,
        safetyNetTriggered,
        canProceed,
    } = useQuiz();

    if (isComplete && recommendations) {
        return <QuizResults recommendations={recommendations} browsableCollection={browsableCollection} answers={answers} onRetake={resetQuiz} usedFallback={usedFallback} confidenceLevel={confidenceLevel} safetyNetTriggered={safetyNetTriggered} />;
    }

    if (isLoading) {
        return <QuizLoadingScreen />;
    }

    const step = quizSteps[currentStep];
    const isLastStep = currentStep === totalSteps - 1;
    const isNotesStep = step.name === 'favoriteNotes' || step.name === 'avoidedNotes';

    return (
        <div className="min-h-screen bg-white text-[#121212]">
            <QuizTopBar />

            <main className="px-4 py-6 sm:py-8">
                <div className="mx-auto max-w-lg sm:max-w-xl">
                    <QuizProgress current={currentStep + 1} total={totalSteps} />

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                            className={isNotesStep ? 'mt-6' : 'mt-8 rounded-sm border border-[#eee] bg-white p-4 sm:p-6'}
                        >
                            <QuizQuestion
                                step={step}
                                value={answers[step.name]}
                                onChange={(value) => setAnswer(step.name, value)}
                                otherAnswers={{
                                    favoriteNotes: answers.favoriteNotes,
                                    avoidedNotes: answers.avoidedNotes,
                                }}
                            />
                        </motion.div>
                    </AnimatePresence>

                    <QuizNavigation
                        onBack={prevStep}
                        onNext={isLastStep ? submitQuiz : nextStep}
                        onSkip={step.skippable ? skipStep : undefined}
                        canGoBack={currentStep > 0}
                        canGoNext={canProceed}
                        isLastStep={isLastStep}
                    />

                    {(step.name === 'favoriteNotes' || step.name === 'avoidedNotes') && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={elegantSpring}
                            className="mt-6"
                        >
                            <NotesSelectedSummary
                                mode={step.name === 'favoriteNotes' ? 'love' : 'avoid'}
                                value={
                                    step.name === 'favoriteNotes'
                                        ? answers.favoriteNotes
                                        : answers.avoidedNotes
                                }
                                onChange={(ids) =>
                                    setAnswer(
                                        step.name === 'favoriteNotes' ? 'favoriteNotes' : 'avoidedNotes',
                                        ids
                                    )
                                }
                                disabledNotes={
                                    step.name === 'favoriteNotes'
                                        ? answers.avoidedNotes
                                        : answers.favoriteNotes
                                }
                            />
                        </motion.div>
                    )}
                </div>
            </main>

            <StoreFooter />
        </div>
    );
}
