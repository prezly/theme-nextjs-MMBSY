'use client';

import type { Locale } from '@prezly/theme-kit-nextjs';
import { useMemo } from 'react';

import { formatLocaleDisplay } from '@/utils';

import { useBroadcastedTranslations } from '../../Broadcast';

import { LanguagesDropdown } from './LanguagesDropdown';

export function Languages({ selected, options, ...rest }: Languages.Props) {
    const broadcasted = useBroadcastedTranslations();

    // biome-ignore lint/correctness/useExhaustiveDependencies: <these deps are likely to be recreated with each render, so we compare serialized values>
    const dropdownOptions = useMemo(() => {
        const displayedOptions = options.filter(
            (option) => option.code === selected || broadcasted[option.code] || option.stories > 0,
        );
        return withHrefOverrides(withDisplayNames(displayedOptions, selected), broadcasted);
    }, [JSON.stringify(options), JSON.stringify(selected), JSON.stringify(broadcasted)]);

    // Always render even with a single locale (Feature 1: show selector for single-country newsrooms)
    if (dropdownOptions.length === 0) {
        return null;
    }

    return <LanguagesDropdown {...rest} options={dropdownOptions} selected={selected} />;
}

export namespace Languages {
    export interface Option {
        code: Locale.Code;
        title: string;
        href: string;
        stories: number;
    }
    export interface Props {
        selected?: Locale.Code;
        options: Option[];
        buttonClassName?: string;
        navigationItemClassName?: string;
    }
}

function withDisplayNames(options: Languages.Option[], currentLocale?: string): LanguagesDropdown.Option[] {
    return options.map((option): LanguagesDropdown.Option => {
        const { displayText, countryCode } = formatLocaleDisplay(option.code, option.title, currentLocale);
        return {
            code: option.code,
            href: option.href,
            title: displayText,
            countryCode,
        };
    });
}

function withHrefOverrides(
    options: LanguagesDropdown.Option[],
    overrides: Record<Locale.Code, string | undefined>,
): LanguagesDropdown.Option[] {
    return options.map((option) => ({
        ...option,
        href: overrides[option.code] ?? option.href,
    }));
}
