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

function getRegionDisplayName(locale: string, regionCode: string): string {
    const upper = regionCode.toUpperCase();
    for (const tryLocale of [locale, 'en']) {
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
    for (const tryLocale of [locale, 'en']) {
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

function reformatDisplayName(nativeName: string, code: string): string {
    const normalized = normalizeLocaleCode(code);
    const parts = normalized.split('-').filter(Boolean);

    if (parts.length === 1) {
        const mapped = LANGUAGE_TO_REGION[parts[0]];
        const regionCode = mapped ?? (parts[0].length === 2 ? parts[0] : null);
        if (regionCode) {
            const displayLocale = mapped ? 'en' : code;
            return getRegionDisplayName(displayLocale, regionCode);
        }
    }

    if (parts.length === 2 && parts[0].length === 2 && parts[1].length === 2) {
        const [lang, region] = parts;
        const regionName = getRegionDisplayName(code, region);
        if (lang === region || COUNTRY_ONLY_REGIONS.has(region)) return regionName;
        const languageName = getLanguageDisplayName(code, lang);
        return `${regionName} - ${languageName}`;
    }

    return nativeName;
}

/**
 * Format locale display — returns display text and country code for flag rendering.
 */
export function formatLocaleDisplay(
    code: string,
    nativeName: string,
): {
    displayText: string;
    countryCode: string | null;
} {
    const countryCode = parseLocaleCode(code);
    const displayText = reformatDisplayName(nativeName, code);
    return { displayText, countryCode };
}
