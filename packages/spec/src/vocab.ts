/**
 * Shared design vocabulary.
 *
 * These are the names and conventions that repeat across components: the size
 * steps, the semantic tones, and the fixed mapping from a control size to its
 * height and font size. They live here, once, so both the specs and the React
 * kit consume the same source instead of each component redeclaring the same
 * `'sm' | 'md' | 'lg'` union and the same tone list.
 */

import type { Measure, SizeSpec, StyleSpec, TokenRef } from './schema.ts';

/** Write a token reference from its bare name: `token('space-4') === '$space-4'`. */
export function token(name: string): TokenRef {
  return `$${name}`;
}

/** Resolve a measure to a `var(--glacier-*)` expression, or pass a raw value through. */
export function cssValue(measure: Measure): string {
  return measure.startsWith('$') ? `var(--glacier-${measure.slice(1)})` : measure;
}

// ---- sizes -----------------------------------------------------------------

/** The three-step control size, used by buttons, inputs, selects, and friends. */
export const controlSizes = ['sm', 'md', 'lg'] as const;
export type ControlSize = (typeof controlSizes)[number];

/** The two-step size for badges, dots, pills, and other small ornaments. */
export const compactSizes = ['sm', 'md'] as const;
export type CompactSize = (typeof compactSizes)[number];

/** Kit-wide convention: a control size fixes its height and font size. */
export const controlHeightToken: Record<ControlSize, TokenRef> = {
  sm: token('control-height-sm'),
  md: token('control-height-md'),
  lg: token('control-height-lg'),
};

export const controlFontToken: Record<ControlSize, TokenRef> = {
  sm: token('font-size-xs'),
  md: token('font-size-sm'),
  lg: token('font-size-md'),
};

/**
 * Build a control-size spec. Height and font size come from the shared
 * convention; the component supplies only what differs - its inline padding
 * and optional gap.
 */
export function controlSize(
  name: ControlSize,
  metrics: { paddingInline?: Measure; gap?: Measure; radius?: Measure } = {},
): SizeSpec {
  return {
    name,
    height: controlHeightToken[name],
    fontSize: controlFontToken[name],
    ...metrics,
  };
}

// ---- tones -----------------------------------------------------------------

/** The semantic color families shared by pills, badges, dots, callouts, meters. */
export const tones = ['neutral', 'accent', 'success', 'warning', 'danger', 'info'] as const;
// The `Tone` enum lives in enums.ts; this local union still backs the spec helpers below.
type Tone = (typeof tones)[number];

const TONE_DESCRIPTION: Record<Tone, string> = {
  neutral: 'The default, low-emphasis gray family.',
  accent: 'The brand accent family, for primary emphasis.',
  success: 'Positive or complete states.',
  warning: 'Caution states that still let the user proceed.',
  danger: 'Errors and destructive states.',
  info: 'Neutral-informational callouts.',
};

/** The tones as reusable StyleSpec entries for a spec's `tones` field. */
export function toneSpecs(names: readonly Tone[] = tones): StyleSpec[] {
  return names.map((name) => ({ name, description: TONE_DESCRIPTION[name] }));
}
