'use client';

import type { IconComponentType } from '@/icons';
import { IconGlobe } from '@/icons';
import * as FlagIcons from '../../../../icons/flags';

import styles from './LanguagesDropdown.module.scss';

interface CountryFlagProps {
    countryCode: string;
    countryName: string;
}

/**
 * Renders a country flag SVG. Falls back to a globe icon if the flag is not found.
 */
export function CountryFlag({ countryCode, countryName }: CountryFlagProps) {
    if (countryCode.toLowerCase() === 'europe' || countryCode === '') {
        return (
            <span className={styles.flagWrapper} aria-hidden>
                <IconGlobe className={styles.flag} aria-label={`${countryName} icon`} />
            </span>
        );
    }

    const flagKey = `Flag${countryCode.toUpperCase()}` as keyof typeof FlagIcons;
    const FlagIcon = FlagIcons[flagKey] as IconComponentType | undefined;

    if (!FlagIcon) {
        return null;
    }

    return (
        <span className={styles.flagWrapper} aria-hidden>
            <FlagIcon className={styles.flag} aria-label={`${countryName} flag`} />
        </span>
    );
}
