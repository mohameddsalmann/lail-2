'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n/context';
import LangToggle from '@/components/icons/LangToggle';

interface StoreHeaderProps {
    active?: 'home' | 'quiz' | 'concierge';
}

export default function StoreHeader({ active }: StoreHeaderProps) {
    const { t } = useI18n();

    return (
        <header className="bg-white border-b border-[#e0e0e0]">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <Link href="/" className="relative h-12 w-32 sm:h-16 sm:w-44 transition-opacity hover:opacity-90">
                    <Image
                        src="/logo.svg"
                        alt="LAIL"
                        fill
                        className="object-contain object-left"
                        priority
                    />
                </Link>
                <nav className="hidden md:flex items-center gap-8 text-sm text-[#4a4a4a]">
                    <Link
                        href="/"
                        className={`hover:text-[#6A1B9A] transition ${active === 'home' ? 'text-[#6A1B9A] font-medium' : ''}`}
                    >
                        {t('nav.home')}
                    </Link>
                    <Link
                        href="/quiz"
                        className={`hover:text-[#6A1B9A] transition ${active === 'quiz' ? 'text-[#6A1B9A] font-medium' : ''}`}
                    >
                        {t('nav.quiz')}
                    </Link>
                    <a
                        href="https://lailfragrances.com/collections/all"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-[#6A1B9A] transition"
                    >
                        {t('nav.shop')}
                    </a>
                    <LangToggle />
                </nav>
                {/* Mobile nav */}
                <div className="md:hidden flex items-center gap-4 text-sm text-[#4a4a4a]">
                    <Link
                        href="/quiz"
                        className={`hover:text-[#6A1B9A] transition ${active === 'quiz' ? 'text-[#6A1B9A] font-medium' : ''}`}
                    >
                        {t('nav.quiz')}
                    </Link>
                    <LangToggle />
                </div>
            </div>
        </header>
    );
}
