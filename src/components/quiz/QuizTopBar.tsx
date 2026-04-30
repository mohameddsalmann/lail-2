'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n/context';
import LangToggle from '@/components/icons/LangToggle';

/**
 * Mobile-first quiz header: LAIL + "Find Your Scent" + language (reference layout).
 */
export default function QuizTopBar() {
    const { t } = useI18n();

    return (
        <header className="sticky top-0 z-40 border-b border-[#e0e0e0] bg-white">
            <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3 sm:max-w-xl">
                <Link
                    href="/"
                    className="relative shrink-0 h-10 w-24 sm:h-12 sm:w-32 transition-opacity hover:opacity-90"
                >
                    <Image
                        src="/logo.svg"
                        alt="LAIL"
                        fill
                        className="object-contain"
                        priority
                    />
                </Link>
                <Link
                    href="/quiz"
                    className="min-w-0 truncate text-sm font-medium text-[#6A1B9A] transition hover:text-[#4A148C] sm:text-base"
                >
                    {t('nav.quiz')}
                </Link>
                <div className="shrink-0">
                    <LangToggle />
                </div>
            </div>
        </header>
    );
}
