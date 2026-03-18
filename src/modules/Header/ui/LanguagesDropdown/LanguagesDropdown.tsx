'use client';

import { ACTIONS } from '@prezly/analytics-nextjs';
import type { Locale } from '@prezly/theme-kit-nextjs';
import classNames from 'classnames';

import { Dropdown, DropdownItem } from '@/components/Dropdown';
import { analytics } from '@/utils';

import { CountryFlag } from './CountryFlag';
import styles from './LanguagesDropdown.module.scss';

export function LanguagesDropdown({
    selected,
    options,
    buttonClassName,
    navigationItemClassName,
}: LanguagesDropdown.Props) {
    const selectedOption = options.find((option) => option.code === selected);
    const displayedOptions = [...options].sort((a, b) => a.title.localeCompare(b.title));

    const triggerLabel = (
        <span className={styles.triggerContent}>
            {selectedOption?.countryCode && (
                <CountryFlag
                    countryCode={selectedOption.countryCode}
                    countryName={selectedOption.title}
                />
            )}
            <span>{selectedOption?.title}</span>
        </span>
    );

    return (
        <li className={navigationItemClassName}>
            <Dropdown
                label={triggerLabel}
                menuClassName={styles.menu}
                buttonClassName={classNames(buttonClassName, styles.button)}
                withMobileDisplay
            >
                {displayedOptions.map(({ code, href, title, countryCode }) => (
                    <DropdownItem
                        key={code}
                        href={href}
                        withMobileDisplay
                        className={classNames(styles.languageItem, {
                            [styles.disabled]: code === selected,
                        })}
                        linkClassName={styles.languageLink}
                        onClick={() => analytics.track(ACTIONS.SWITCH_LANGUAGE, { code })}
                    >
                        {countryCode && (
                            <CountryFlag countryCode={countryCode} countryName={title} />
                        )}
                        <span className={styles.languageLabel}>{title}</span>
                    </DropdownItem>
                ))}
            </Dropdown>
        </li>
    );
}

export namespace LanguagesDropdown {
    export interface Option {
        code: Locale.Code;
        title: string;
        href: string;
        countryCode: string | null;
    }

    export interface Props {
        selected?: Option['code'];
        options: Option[];
        buttonClassName?: string;
        navigationItemClassName?: string;
    }
}
