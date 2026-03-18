'use client';

import { useMediaQuery } from '@react-hookz/web';

const BREAKPOINT_TABLET = 767;
const BREAKPOINT_DESKTOP = 1023;

export function useDevice() {
    const isMobile = useMediaQuery(`(max-width: ${BREAKPOINT_TABLET}px)`, false);
    const isTablet = useMediaQuery(`(max-width: ${BREAKPOINT_DESKTOP}px)`, false);

    return {
        isMobile,
        isTablet,
    };
}
