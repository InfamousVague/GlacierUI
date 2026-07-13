/**
 * The native side of the spec seam.
 *
 * @glacier/commons reads a ComponentSpec and returns bare token names; this
 * turns those names into React Native style values by wrapping each in
 * `var(--glacier-*)` (which react-native-web resolves on the DOM, and a device
 * build will swap for a concrete token map). Components call these instead of
 * hand-writing paint and size objects, so they cannot drift from the web kit.
 */

import { paintFor, sizeFor, dimensionsFor, type StyleGroup } from '@glacier/commons';
import type { ComponentSpec } from '@glacier/spec';
import { t } from './tokens.ts';

/** Wrap a bare token name (or list of names) in its CSS custom property. */
export function tv(name: string): string {
  return t(name);
}

/** An RN style object; values are `var(--glacier-*)` strings or numbers. */
export type NativeStyle = Record<string, string | number>;

/**
 * The base paint for a variant/tone/state as a React Native style: `background`
 * to `backgroundColor`, `text` to `color`, and `border` to `borderColor` plus a
 * hairline `borderWidth`, matching how the DOM kit paints the same roles. A
 * component that needs the free-form roles (a Pill's solid/outline tokens) reads
 * `paintFor` directly and maps them itself.
 */
export function paintStyle(spec: ComponentSpec, style: StyleGroup, name: string): NativeStyle {
  const paint = paintFor(spec, style, name);
  const out: NativeStyle = {};
  if (paint.background) out.backgroundColor = t(paint.background);
  if (paint.text) out.color = t(paint.text);
  if (paint.border) {
    out.borderColor = t(paint.border);
    out.borderWidth = t('hairline');
    out.borderStyle = 'solid';
  }
  return out;
}

// Re-export the raw resolvers so components can read token names directly when
// the convenience helpers do not fit.
export { paintFor, sizeFor, dimensionsFor };
