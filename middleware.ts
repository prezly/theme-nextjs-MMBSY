import { Locale } from '@prezly/theme-kit-nextjs';
import { IntlMiddleware } from '@prezly/theme-kit-nextjs/middleware';
import { type NextRequest, NextResponse } from 'next/server';

import { configureAppRouter, initPrezlyClient } from '@/adapters/server';

function parseNewsroomLocalesFromHeaders(headers: Headers): Locale.Code[] | undefined {
    const header = headers.get('X-Newsroom-Locales');

    if (!header) {
        return undefined;
    }

    const locales = header
        .split(',')
        .filter(Boolean)
        .map((code) => code.trim())
        .map((code) => Locale.from(code).code);

    if (locales.length === 0) {
        return undefined;
    }

    return locales;
}

async function retrieveNewsroomLocalesFromApi(headers: Headers) {
    const { contentDelivery } = initPrezlyClient(headers);

    const languages = await contentDelivery.languages();
    const prioritizedLanguages = [...languages].sort(
        (a, b) =>
            -cmp(a.is_default, b.is_default) || // prefer default
            -cmp(a.public_stories_count, b.public_stories_count) || // prefer more used languages
            cmp(a.code, b.code), // order by code afterward
    );

    return prioritizedLanguages.map((lang) => lang.code);
}

/**
 * Find a configured locale whose country code matches the visitor's IP country.
 * E.g. country="NL" matches locale "nl"; country="BE" matches locale "nl-BE".
 */
function findLocaleForCountry(country: string, locales: Locale.Code[]): Locale.Code | null {
    const lc = country.toLowerCase();
    return (
        locales.find((code) => {
            const normalized = code.toLowerCase().replace('_', '-');
            const parts = normalized.split('-');
            // Multi-part (e.g. nl-be) → match on region (last segment)
            // Single-part (e.g. nl) → match on language code (same as country for BE/NL)
            const region = parts.length > 1 ? parts[parts.length - 1] : parts[0];
            return region === lc;
        }) ?? null
    );
}

/**
 * Build a geo-based redirect response if:
 *  - No locale-choice cookie is set (user hasn't chosen manually)
 *  - Vercel provides an IP country header
 *  - That country maps to a configured locale
 *
 * Sets a 30-day cookie to prevent re-redirecting on future visits.
 */
function getGeoRedirect(
    request: NextRequest,
    locales: Locale.Code[],
): NextResponse | null {
    // Skip if user already chose or was already geo-redirected
    if (
        request.cookies.has('mmbsy_locale_chosen') ||
        request.cookies.has('mmbsy_geo_redirected')
    ) {
        return null;
    }

    const country =
        request.headers.get('x-vercel-ip-country') ??
        request.headers.get('cf-ipcountry'); // Cloudflare fallback

    if (!country || country === 'XX') return null; // XX = unknown

    const matchingLocale = findLocaleForCountry(country, locales);
    if (!matchingLocale) return null;

    const url = request.nextUrl.clone();
    url.pathname = `/${matchingLocale}`;

    const response = NextResponse.redirect(url);
    response.cookies.set('mmbsy_geo_redirected', '1', {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: 'lax',
        path: '/',
    });

    return response;
}

export async function middleware(request: NextRequest) {
    const locales =
        parseNewsroomLocalesFromHeaders(request.headers) ??
        (await retrieveNewsroomLocalesFromApi(request.headers));

    const [defaultLocale] = locales; // default is expected to always be the first in the list

    // Geo-redirect: send visitors to their market locale on first visit
    const geoRedirect = getGeoRedirect(request, locales);
    if (geoRedirect) return geoRedirect;

    return IntlMiddleware.handle(request, {
        router: configureAppRouter(),
        locales,
        defaultLocale,
    });
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - robots.txt
         * - sitemap.xml
         * - favicon.ico
         */
        '/((?!api|_next/static|_next/image|favicon\\.ico$|sitemap\\.xml$|robots\\.txt$).*)',
    ],
};

function cmp(a: boolean, b: boolean): number;
function cmp(a: number, b: number): number;
function cmp(a: string, b: string): number;
function cmp<T extends number | boolean>(a: T, b: T): number {
    if (a === b) return 0;
    return a < b ? -1 : 1;
}
