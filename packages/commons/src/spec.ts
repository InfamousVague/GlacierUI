/**
 * Spec-derived style resolvers: the DRY seam between the DOM and React Native
 * bindings.
 *
 * A ComponentSpec already declares every paint token (per variant/tone/state)
 * and every measurement (per size, plus size-independent dimensions) as
 * `$token` references against the shared token scale. These helpers read that
 * one contract and hand back bare token names, so a binding never re-transcribes
 * the spec by hand (which is how @glacier/native's Button size font drifted from
 * the web kit). @glacier/native wraps each name in `var(--glacier-*)`; a future
 * device build swaps in a concrete token map. Pure data in, pure data out: no
 * DOM, no React Native, no `var()`.
 */

import type { ComponentSpec, StyleSpec } from '@glacier/spec';

/** A map of style role or metric name to a bare token name (or raw CSS value). */
export type TokenMap = Record<string, string>;

/** The three groups of painted style families a spec can declare. */
export type StyleGroup = 'variants' | 'tones' | 'states';

/** Strip the leading `$` from a token ref; pass raw CSS values through. */
function bare(value: string | undefined): string | undefined {
  if (value == null) return undefined;
  return value.startsWith('$') ? value.slice(1) : value;
}

function group(spec: ComponentSpec, name: StyleGroup): readonly StyleSpec[] {
  return (spec[name] ?? []) as readonly StyleSpec[];
}

/**
 * The paint for one named variant/tone/state as bare token names, merging the
 * structured `paint` (background/text/border) with the free-form `tokens` map
 * (hover, solid-background, outline-border, ...). A binding picks the roles it
 * needs; missing roles are simply absent.
 */
export function paintFor(spec: ComponentSpec, style: StyleGroup, name: string): TokenMap {
  const entry = group(spec, style).find((s) => s.name === name);
  const out: TokenMap = {};
  if (!entry) return out;
  for (const [role, value] of Object.entries(entry.paint ?? {})) {
    const token = bare(value as string | undefined);
    if (token) out[role] = token;
  }
  for (const [role, value] of Object.entries(entry.tokens ?? {})) {
    const token = bare(value as string | undefined);
    if (token) out[role] = token;
  }
  return out;
}

/**
 * Every measurement a spec declares for a named size step (height, fontSize,
 * paddingInline, diameter, ...), as bare token names keyed by the spec metric
 * name. Returns an empty map when the size or the spec's `sizes` is absent.
 */
export function sizeFor(spec: ComponentSpec, name: string | undefined): TokenMap {
  const size = (spec.sizes ?? []).find((s) => s.name === name);
  const out: TokenMap = {};
  if (!size) return out;
  for (const [metric, value] of Object.entries(size)) {
    if (metric === 'name' || typeof value !== 'string') continue;
    const token = bare(value);
    if (token) out[metric] = token;
  }
  return out;
}

/** The size-independent dimensions (radius, gap, border, ...) as bare tokens. */
export function dimensionsFor(spec: ComponentSpec): TokenMap {
  const out: TokenMap = {};
  for (const [metric, value] of Object.entries(spec.dimensions ?? {})) {
    if (typeof value !== 'string') continue;
    const token = bare(value);
    if (token) out[metric] = token;
  }
  return out;
}
