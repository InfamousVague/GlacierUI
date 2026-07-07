/**
 * Glass materials and blur, in the style of Apple's translucent layers.
 * Three material weights per theme: thin sits over busy content, regular is
 * the default chrome material, thick is close to opaque. Pair the background
 * with backdrop-filter blur + saturation, a hairline border, and an inner top
 * highlight so the surface reads as glass.
 */

import type { Theme } from './color.ts';

export const blurs = {
  sm: '10px',
  md: '20px',
  lg: '32px',
} as const;

/**
 * The thinnest visible line: every 1px border in the kit resolves through
 * this token, so hairlines stay adjustable in one place.
 */
export const HAIRLINE = '1px';

/** backdrop-filter saturation applied alongside blur */
export const GLASS_SATURATE = '1.8';

export const glassTokens: Record<Theme, Record<string, string>> = {
  light: {
    'glass-thin': 'oklch(0.985 0.004 260 / 0.45)',
    'glass-regular': 'oklch(0.985 0.004 260 / 0.65)',
    'glass-thick': 'oklch(0.985 0.004 260 / 0.82)',
    'glass-border': 'oklch(0.3 0.01 260 / 0.1)',
    'glass-highlight': 'oklch(1 0 0 / 0.75)',
  },
  dark: {
    'glass-thin': 'oklch(0.23 0.008 260 / 0.4)',
    'glass-regular': 'oklch(0.23 0.008 260 / 0.6)',
    'glass-thick': 'oklch(0.2 0.008 260 / 0.85)',
    'glass-border': 'oklch(1 0 0 / 0.09)',
    'glass-highlight': 'oklch(1 0 0 / 0.1)',
  },
};
