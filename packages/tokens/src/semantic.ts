/**
 * Semantic alias layer — what components actually consume. Because ramp step
 * numbers play the same role in both themes, most aliases are defined once;
 * only true surfaces need per-theme overrides.
 */

import { WHITE, BLACK_TEXT, type Theme } from './color.ts';

const g = (n: number) => `var(--perfect-gray-${n})`;
const a = (n: number) => `var(--perfect-accent-${n})`;

export const semantic: Record<string, string> = {
  // surfaces
  bg: g(1),
  surface: WHITE, // overridden per theme below
  'surface-raised': WHITE,
  'surface-sunken': g(3),
  overlay: 'oklch(0.2 0.01 260 / 0.45)',

  // interaction washes
  hover: g(3),
  active: g(4),
  selection: a(5),

  // borders
  'border-subtle': g(4),
  border: g(6),
  'border-strong': g(8),

  // text
  text: g(12),
  'text-muted': g(11),
  'text-subtle': g(9),
  'text-disabled': g(8),

  // accent
  'accent-solid': a(9),
  'accent-solid-hover': a(10),
  'accent-soft': a(3),
  'accent-soft-hover': a(4),
  'accent-border': a(7),
  'accent-text': a(11),
  'accent-contrast': WHITE,
  'focus-ring': a(8),

  // segmented control
  'segment-track': 'oklch(0.93 0.005 260 / 0.65)',
  'segment-thumb': 'oklch(0.995 0 0)',
};

export const themeOverrides: Record<'light' | 'dark', Record<string, string>> = {
  light: {},
  dark: {
    surface: g(2),
    'surface-raised': g(3),
    'surface-sunken': 'oklch(0.115 0.008 260)',
    overlay: 'oklch(0.07 0.01 260 / 0.65)',
    'segment-track': 'oklch(0.26 0.008 260 / 0.55)',
    'segment-thumb': 'oklch(0.58 0.014 260)',
  },
};

/** Status aliases: role → source ramp + on-solid text color. */
export const statuses: Record<string, { ramp: string; contrast: string }> = {
  danger: { ramp: 'red', contrast: WHITE },
  success: { ramp: 'green', contrast: WHITE },
  warning: { ramp: 'amber', contrast: BLACK_TEXT },
  info: { ramp: 'blue', contrast: WHITE },
};

export function statusTokens(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [role, { ramp, contrast }] of Object.entries(statuses)) {
    out[`${role}-solid`] = `var(--perfect-${ramp}-9)`;
    out[`${role}-solid-hover`] = `var(--perfect-${ramp}-10)`;
    out[`${role}-soft`] = `var(--perfect-${ramp}-3)`;
    out[`${role}-border`] = `var(--perfect-${ramp}-7)`;
    out[`${role}-text`] = `var(--perfect-${ramp}-11)`;
    out[`${role}-contrast`] = contrast;
  }
  return out;
}

// ---- CSS emission ----------------------------------------------------------

/** The theme-agnostic semantic aliases components consume. */
export function semanticDecls(): Array<[string, string]> {
  return Object.entries(semantic);
}

/** The status aliases (danger / success / warning / info) derived from ramps. */
export function statusDecls(): Array<[string, string]> {
  return Object.entries(statusTokens());
}

/** Per-theme surface overrides, layered on top of the semantic aliases. */
export function themeOverrideDecls(theme: Theme): Array<[string, string]> {
  return Object.entries(themeOverrides[theme]);
}
