/**
 * Utilities for parsing locale codes and reformatting display names.
 */

/**
 * Normalize locale code for parsing: trim, lowercase, underscore and hyphen-like chars → ASCII dash.
 */
function normalizeLocaleCode(code: string): string {
    return code
        .trim()
        .toLowerCase()
        .replace(/[_\u2010\u2011]/g, '-');
}

/**
 * Language codes that map to a different region (language code ≠ country code).
 */
const LANGUAGE_TO_REGION: Record<string, string> = {
    lb: 'lu',
    sq: 'al',
    cnr: 'me',
    ca: 'ad',
    bs: 'ba',
};

/**
 * Extract country code from locale code.
 *
 * Examples:
 *   - "fr-BE" or "nl-BE" → "be"
 *   - "nl" → "nl"
 *   - "lb" → "lu"
 */
export function parseLocaleCode(code: string): string | null {
    const normalized = normalizeLocaleCode(code);
    const parts = normalized.split('-').filter(Boolean);

    if (parts.length === 1) {
        const segment = parts[0];
        const mapped = LANGUAGE_TO_REGION[segment];
        if (mapped) return mapped;
        if (segment.length === 2) return segment;
        if (segment.length === 4) return segment.slice(-2);
        return null;
    }

    const lastPart = parts[parts.length - 1];
    if (lastPart.length === 2) return lastPart;

    return null;
}

/** Normalize to BCP 47 (hyphens) so Intl.DisplayNames accepts it — Prezly may use underscores */
function toBcp47(locale: string): string {
    return locale.replace(/_/g, '-');
}

/** Capitalize the first character of a string */
function capitalize(str: string): string {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getRegionDisplayName(locale: string, regionCode: string): string {
    const upper = regionCode.toUpperCase();
    for (const tryLocale of [toBcp47(locale), 'en']) {
        try {
            const name = new Intl.DisplayNames([tryLocale], { type: 'region' }).of(upper);
            if (name && name !== upper) return name;
        } catch {
            // try next locale
        }
    }
    return upper;
}

function getLanguageDisplayName(locale: string, languageCode: string): string {
    for (const tryLocale of [toBcp47(locale), 'en']) {
        try {
            const name = new Intl.DisplayNames([tryLocale], { type: 'language' }).of(languageCode);
            if (name && name !== languageCode) return name;
        } catch {
            // try next locale
        }
    }
    return languageCode;
}

const COUNTRY_ONLY_REGIONS = new Set([
    'ad', 'ba', 'gb', 'at', 'cz', 'dk', 'ee', 'gr', 'ie', 'li', 'lv', 'lu', 'mc', 'me', 'no', 'rs', 'se', 'si', 'sm',
]);

function reformatDisplayName(nativeName: string, code: string, displayLocale: string): string {
    const normalized = normalizeLocaleCode(code);
    const parts = normalized.split('-').filter(Boolean);

    if (parts.length === 1) {
        const segment = parts[0];
        const mapped = LANGUAGE_TO_REGION[segment];
        if (mapped) {
            // Known language-to-region mapping (e.g. lb → lu): always show region name in English
            return getRegionDisplayName('en', mapped);
        }
        if (segment.length === 2) {
            // Could be a language code (en, nl, fr) or a country code (be, nl...)
            // Try region first; if it returns the code unchanged it means it's not a valid region
            const regionName = getRegionDisplayName(displayLocale, segment);
            if (regionName.toUpperCase() !== segment.toUpperCase()) return regionName;
            // Fall back to language name (e.g. "en" → "English", "nl" → "Dutch")
            return getLanguageDisplayName(displayLocale, segment);
        }
        if (segment.length === 4) {
            return getRegionDisplayName(displayLocale, segment.slice(-2));
        }
    }

    if (parts.length === 2 && parts[0].length === 2 && parts[1].length === 2) {
        const [lang, region] = parts;
        const regionName = getRegionDisplayName(displayLocale, region);
        if (lang === region || COUNTRY_ONLY_REGIONS.has(region)) return regionName;
        const languageName = getLanguageDisplayName(displayLocale, lang);
        return `${capitalize(regionName)} - ${capitalize(languageName)}`;
    }

    return nativeName;
}

/**
 * Format locale display — returns display text and country code for flag rendering.
 * @param displayLocale - The locale to use for display names (e.g. current active locale).
 *                        Defaults to the option's own code (native name).
 */
export function formatLocaleDisplay(
    code: string,
    nativeName: string,
    displayLocale?: string,
): {
    displayText: string;
    countryCode: string | null;
} {
    const countryCode = parseLocaleCode(code);
    const displayText = capitalize(reformatDisplayName(nativeName, code, displayLocale ?? code));
    return { displayText, countryCode };
}
