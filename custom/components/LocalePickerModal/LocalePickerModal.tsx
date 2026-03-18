'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import styles from './LocalePickerModal.module.scss';

export interface LocaleOption {
    code: string;
    href: string;
    name: string;
    flagEmoji: string;
}

interface Props {
    options: LocaleOption[];
}

const STORAGE_KEY = 'mmbsy_locale_chosen';
const COOKIE_NAME = 'mmbsy_locale_chosen';

function setCookie(name: string, value: string, days: number) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

export function LocalePickerModal({ options }: Props) {
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
                <p className={styles.subtitle}>Welcome to the</p>
                <h2 className={styles.title}>MMBSY Newsroom</h2>
                <p className={styles.prompt}>Please choose your location</p>
                <div className={styles.options}>
                    {options.map((option) => (
                        <button
                            key={option.code}
                            type="button"
                            className={styles.optionButton}
                            onClick={() => handleChoose(option)}
                        >
                            <span className={styles.flag}>{option.flagEmoji}</span>
                            <span className={styles.name}>{option.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
