'use client';

import type { ComponentType } from 'react';
import * as LucideIcons from 'lucide-react';

interface LucideIconProps {
    name: string;
    className?: string;
    size?: number;
    'aria-hidden'?: boolean | 'true' | 'false';
}

/**
 * Matches `perfume_leaked-main`: dynamic Lucide icons by PascalCase export name (e.g. Citrus, Cookie, Trees).
 * @see perfume_leaked-main/ICON_MAPPING.md
 */
export default function LucideIcon({
    name,
    className = '',
    size = 20,
    ...props
}: LucideIconProps) {
    const IconComponent = (LucideIcons as unknown as Record<string, ComponentType<Record<string, unknown>>>)[name];

    if (!IconComponent) {
        if (process.env.NODE_ENV === 'development') {
            console.warn(`Lucide icon "${name}" not found`);
        }
        return null;
    }

    return <IconComponent className={className} size={size} {...props} />;
}
