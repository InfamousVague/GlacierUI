/**
 * Token access for the native kit.
 *
 * On web (react-native-web) a style value of `var(--glacier-accent-solid)` is
 * written to the element's inline style and resolved by the browser, so the
 * native components inherit the exact same `--glacier-*` values the DOM kit
 * uses and follow `data-theme` / `data-accent` switches live. That is what
 * makes the docs Web/Native toggle a true side-by-side.
 *
 * On a real device react-native cannot resolve `var()`; the token map has to be
 * resolved to concrete values (the contrast engine already parses oklch, so a
 * `tokens.native.ts` variant is the follow-up that emits hex/rgb + a JS theme).
 * Everything else in this package is written against `t()` so only this file
 * changes when that lands.
 */

/** A `--glacier-*` token as a CSS custom-property reference. */
export const t = (name: string): string => `var(--glacier-${name})`;
