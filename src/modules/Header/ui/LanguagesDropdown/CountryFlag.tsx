'use client';

import type { IconComponentType } from '@/icons';
import { IconGlobe } from '@/icons';
import * as FlagIcons from '../../../../icons/flags';

import styles from './LanguagesDropdown.module.scss';

interface CountryFlagProps {
    countryCode: string;
    countryName: string;
}

/** Special-case overrides: locale/country code → flag country code */
const FLAG_CODE_OVERRIDES: Record<string, string> = {
    en: 'gb',
};

/**
 * Renders a country flag SVG. Falls back to a globe icon if the flag is not found.
 */
export function CountryFlag({ countryCode, countryName }: CountryFlagProps) {
    const resolved = FLAG_CODE_OVERRIDES[countryCode.toLowerCase()] ?? countryCode;

    if (resolved.toLowerCase() === 'europe' || resolved === '') {
        return (
            <span className={styles.flagWrapper} aria-hidden>
                <IconGlobe className={styles.flag} aria-label={`${countryName} icon`} />
            </span>
        );
    }

    const flagKey = `Flag${resolved.toUpperCase()}` as keyof typeof FlagIcons;
    const FlagIcon = FlagIcons[flagKey] as IconComponentType | undefined;

    return (
        <span className={styles.flagWrapper} aria-hidden>
            {FlagIcon ? (
                <FlagIcon className={styles.flag} aria-label={`${countryName} flag`} />
            ) : (
                <IconGlobe className={styles.flag} aria-label={`${countryName} icon`} />
            )}
        </span>
    );
}
