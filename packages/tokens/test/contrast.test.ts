import { describe, expect, it } from 'vitest';
import {
  parseOklch,
  relativeLuminance,
  contrastRatio,
  contrastAudit,
  resolveTokenColor,
  REQUIRED_TEXT,
  REQUIRED_GLYPH,
} from '../src/index.ts';

describe('oklch parsing', () => {
  it('parses the shapes the kit emits', () => {
    expect(parseOklch('oklch(0.627 0.19 25)')).toEqual({ l: 0.627, c: 0.19, h: 25, alpha: 1 });
    expect(parseOklch('oklch(0.2 0.01 260 / 0.45)')).toEqual({ l: 0.2, c: 0.01, h: 260, alpha: 0.45 });
    expect(parseOklch('oklch(62.7% 0.19 25deg / 45%)')).toEqual({ l: 0.627, c: 0.19, h: 25, alpha: 0.45 });
  });

  it('rejects non-oklch input', () => {
    expect(() => parseOklch('rgb(0 0 0)')).toThrow(/not a parseable oklch/);
    expect(() => parseOklch('#ffffff')).toThrow(/not a parseable oklch/);
  });
});

describe('WCAG contrast math', () => {
  it('anchors white on black at 21:1 in both notations', () => {
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 5);
    expect(contrastRatio('oklch(1 0 0)', 'oklch(0 0 0)')).toBeCloseTo(21, 5);
  });

  it('anchors identical colors at 1:1 and stays order-independent', () => {
    expect(contrastRatio('#777777', '#777777')).toBeCloseTo(1, 5);
    expect(contrastRatio('#777777', '#ffffff')).toBeCloseTo(contrastRatio('#ffffff', '#777777'), 10);
  });

  it('matches the canonical #777-on-white ratio of about 4.48', () => {
    expect(contrastRatio('#777777', '#ffffff')).toBeCloseTo(4.48, 2);
  });

  it('agrees between hex and the oklch equivalent of pure sRGB red', () => {
    // oklch(0.62796 0.25768 29.2338) is the OKLCH form of #ff0000.
    const fromHex = relativeLuminance('#ff0000');
    const fromOklch = relativeLuminance('oklch(0.62796 0.25768 29.2338)');
    expect(fromHex).toBeCloseTo(0.2126, 4);
    expect(fromOklch).toBeCloseTo(fromHex, 3);
  });

  it('clamps out-of-gamut oklch to the displayable range instead of exploding', () => {
    // Far more chroma than sRGB can hold; must still land in [0, 21].
    const ratio = contrastRatio('oklch(0.7 0.4 150)', '#000000');
    expect(ratio).toBeGreaterThan(1);
    expect(ratio).toBeLessThanOrEqual(21);
  });
});

describe('token resolution', () => {
  it('resolves ramp-backed tokens per theme and literals as-is', () => {
    expect(resolveTokenColor('bg', 'light')).toMatch(/^oklch\(0\.993 /);
    expect(resolveTokenColor('bg', 'dark')).toMatch(/^oklch\(0\.14 /);
    expect(resolveTokenColor('surface', 'light')).toBe('oklch(0.995 0 0)');
    expect(resolveTokenColor('danger-solid', 'light')).toMatch(/^oklch\(0\.627 /);
    expect(() => resolveTokenColor('nope', 'light')).toThrow(/unknown color token/);
  });
});

/**
 * Pairs that genuinely fail WCAG AA today, kept as data rather than silently
 * recolored: light-theme text-subtle (gray-9, a solid-fill step doing text
 * duty) only reaches about 3.2-3.5:1 on the app surfaces, short of the 4.5:1
 * normal-text requirement. A palette decision for the design owner, not the
 * test suite.
 */
// Empty: every audited pair passes. If a palette change makes a pair fail,
// list it here deliberately rather than recoloring in a panic.
const KNOWN_EXCEPTIONS: ReadonlyArray<{ pair: string; theme: string }> = [];

const isKnownException = (row: { pair: string; theme: string }): boolean =>
  KNOWN_EXCEPTIONS.some((e) => e.pair === row.pair && e.theme === row.theme);

describe('kit contrast audit', () => {
  const rows = contrastAudit();

  it('covers every pairing group in both themes', () => {
    // 5 solids + 12 text-on-surface + 4 status soft + 1 accent soft, per theme.
    expect(rows).toHaveLength(44);
    for (const theme of ['light', 'dark']) {
      expect(rows.filter((r) => r.theme === theme)).toHaveLength(22);
    }
    expect(rows.filter((r) => r.required === REQUIRED_GLYPH)).toHaveLength(10);
    expect(rows.filter((r) => r.required === REQUIRED_TEXT)).toHaveLength(34);
  });

  it('passes every real pairing except the known exceptions', () => {
    const unexpectedFailures = rows.filter((r) => !r.passes && !isKnownException(r));
    expect(
      unexpectedFailures.map((r) => `${r.theme} ${r.pair}: ${r.ratio} < ${r.required}`),
    ).toEqual([]);
  });

  it('keeps the known-exceptions list honest: each entry still fails', () => {
    for (const exception of KNOWN_EXCEPTIONS) {
      const match = rows.find((r) => r.pair === exception.pair && r.theme === exception.theme);
      expect(match, `${exception.theme} ${exception.pair} missing from audit`).toBeDefined();
      expect(match!.passes, `${exception.theme} ${exception.pair} now passes; remove it`).toBe(false);
    }
  });

  it('reports plausible ratios on every row', () => {
    for (const r of rows) {
      expect(r.ratio).toBeGreaterThanOrEqual(1);
      expect(r.ratio).toBeLessThanOrEqual(21);
      expect(r.passes).toBe(r.ratio >= r.required);
      expect(r.foreground).toMatch(/^oklch\(/);
      expect(r.background).toMatch(/^oklch\(/);
    }
  });
});
