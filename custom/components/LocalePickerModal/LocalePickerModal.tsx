'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import type { IconComponentType } from '@/icons';
import * as FlagIcons from '@/icons/flags';

import styles from './LocalePickerModal.module.scss';

export interface LocaleOption {
    code: string;
    href: string;
    name: string;
    countryCode: string | null;
}

interface Props {
    options: LocaleOption[];
    logoUrl?: string | null;
}

const STORAGE_KEY = 'mmbsy_locale_chosen';
const COOKIE_NAME = 'mmbsy_locale_chosen';

function setCookie(name: string, value: string, days: number) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

function CountryFlagIcon({ countryCode, countryName }: { countryCode: string; countryName: string }) {
    const flagKey = `Flag${countryCode.toUpperCase()}` as keyof typeof FlagIcons;
    const FlagIcon = FlagIcons[flagKey] as IconComponentType | undefined;

    if (!FlagIcon) return null;

    return (
        <span className={styles.flagWrapper} aria-hidden>
            <FlagIcon className={styles.flagIcon} aria-label={`${countryName} flag`} />
        </span>
    );
}

export function LocalePickerModal({ options, logoUrl }: Props) {
    const [visible, setVisible] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const chosen = localStorage.getItem(STORAGE_KEY);
        if (!chosen) {
            setVisible(true);
        }
    }, []);

    function handleChoose(option: LocaleOption) {
        localStorage.setItem(STORAGE_KEY, option.code);
        setCookie(COOKIE_NAME, option.code, 365);
        setVisible(false);
        router.push(option.href);
    }

    if (!visible) return null;

    return (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Choose your market">
            <div className={styles.modal}>
                <p className={styles.subtitle}>Welcome to</p>
                {logoUrl && (
                    <img src={logoUrl} alt="MMBSY" className={styles.logo} />
                )}
                <p className={styles.newsroomLabel}>Newsroom</p>
                <p className={styles.prompt}>Choose location</p>
                <div className={styles.options}>
                    {options.map((option) => (
                        <button
                            key={option.code}
                            type="button"
                            className={styles.optionButton}
                            onClick={() => handleChoose(option)}
                        >
                            {option.countryCode && (
                                <CountryFlagIcon
                                    countryCode={option.countryCode}
                                    countryName={option.name}
                                />
                            )}
                            <span className={styles.name}>{option.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
