import { describe, expect, it } from 'vitest';
import {
  accentDecls,
  accentOptions,
  cssEase,
  densityDecls,
  effectsDecls,
  elevationOverlayDecls,
  glassDecls,
  layoutDecls,
  monoFontDecls,
  monoFonts,
  motionDecls,
  radiusDecls,
  rampDecls,
  reducedMotionDecls,
  sansFontDecls,
  sansFonts,
  semanticDecls,
  shadowDecls,
  spacingDecls,
  statusDecls,
  themeOverrideDecls,
  typographyDecls,
  type MonoFont,
  type SansFont,
} from '../src/index.ts';
import { sizeDecls, sizes } from '../src/size.ts';

type Decl = [string, string];
const THEMES = ['light', 'dark'] as const;

/** Every emitter must produce kebab-case names and non-empty values. */
function expectWellFormed(decls: Decl[]) {
  expect(decls.length).toBeGreaterThan(0);
  for (const [name, value] of decls) {
    expect(name).toMatch(/^[a-z0-9-]+$/);
    expect(String(value).length).toBeGreaterThan(0);
  }
}

describe('CSS declaration emitters', () => {
  it('emits the fixed size scale, one decl per step', () => {
    const decls = sizeDecls();
    expectWellFormed(decls);
    expect(decls.length).toBe(Object.keys(sizes).length);
    expect(decls.every(([name]) => name.startsWith('size-'))).toBe(true);
    expect(Object.fromEntries(decls)['size-md']).toBe(sizes.md);
  });

  it('emits durations in ms and cubic-bezier easings for motion', () => {
    const decls = motionDecls();
    expectWellFormed(decls);
    const durations = decls.filter(([name]) => name.startsWith('duration-'));
    const eases = decls.filter(([name]) => name.startsWith('ease-'));
    expect(durations.length).toBeGreaterThan(0);
    expect(eases.length).toBeGreaterThan(0);
    for (const [, value] of durations) expect(value).toMatch(/^\d+(\.\d+)?ms$/);
    for (const [name, value] of eases) {
      expect(value).toMatch(/^cubic-bezier\(/);
      expect(value).toBe(cssEase(name.replace('ease-', '') as Parameters<typeof cssEase>[0]));
    }
  });

  it('collapses every duration to near-zero under reduced motion', () => {
    const reduced = reducedMotionDecls();
    expectWellFormed(reduced);
    const durationCount = motionDecls().filter(([name]) => name.startsWith('duration-')).length;
    expect(reduced.length).toBe(durationCount);
    for (const [, value] of reduced) expect(value).toBe('0.01ms');
  });

  it('emits control heights plus the density scale for both density modes', () => {
    const comfortable = Object.fromEntries(densityDecls('comfortable'));
    const compact = Object.fromEntries(densityDecls('compact'));
    for (const decls of [comfortable, compact]) {
      expect(decls['density-scale']).toBeDefined();
      expect(decls['control-height-md']).toBeDefined();
    }
    expect(comfortable).not.toEqual(compact);
  });

  it('rides scaled radius steps on the radius-scale knob', () => {
    const decls = radiusDecls();
    expectWellFormed(decls);
    const byName = Object.fromEntries(decls);
    expect(byName['radius-scale']).toBe('1');
    expect(byName['control-radius']).toBeDefined();
    const scaled = decls.filter(([, value]) => value.includes('var(--glacier-radius-scale)'));
    expect(scaled.length).toBeGreaterThan(0);
  });

  it('emits container widths and pixel breakpoints for layout', () => {
    const decls = layoutDecls();
    expectWellFormed(decls);
    expect(decls.some(([name]) => name.startsWith('container-'))).toBe(true);
    const breakpoints = decls.filter(([name]) => name.startsWith('breakpoint-'));
    expect(breakpoints.length).toBeGreaterThan(0);
    for (const [, value] of breakpoints) expect(value).toMatch(/px$/);
  });

  it('emits the hairline, the blur ramp on the glass knob, and glass materials', () => {
    const decls = effectsDecls();
    expectWellFormed(decls);
    const byName = Object.fromEntries(decls);
    expect(byName['hairline']).toBeDefined();
    expect(byName['glass-blur-scale']).toBe('1');
    const blurs = decls.filter(([name]) => name.startsWith('blur-'));
    expect(blurs.length).toBeGreaterThan(0);
    for (const [, value] of blurs) expect(value).toContain('var(--glacier-glass-blur-scale)');
    for (const theme of THEMES) expectWellFormed(glassDecls(theme));
  });

  it('emits the full spacing and typography scales', () => {
    expectWellFormed(spacingDecls());
    expectWellFormed(typographyDecls());
  });

  it('emits font family overrides for every pickable sans and mono family', () => {
    for (const name of Object.keys(sansFonts) as SansFont[]) expectWellFormed(sansFontDecls(name));
    for (const name of Object.keys(monoFonts) as MonoFont[]) expectWellFormed(monoFontDecls(name));
  });

  it('emits color ramps, shadows, and overlays for both themes', () => {
    for (const theme of THEMES) {
      expectWellFormed(rampDecls(theme));
      expectWellFormed(shadowDecls(theme));
      expectWellFormed(elevationOverlayDecls(theme));
    }
    expect(rampDecls('light').map(([name]) => name)).toEqual(rampDecls('dark').map(([name]) => name));
    // light surfaces are mostly the :root defaults; the one exception is the
    // text-subtle contrast override, which lifts subtle text to pass WCAG AA.
    expect(themeOverrideDecls('light').map(([name]) => name)).toEqual(['text-subtle']);
    expectWellFormed(themeOverrideDecls('light'));
    expectWellFormed(themeOverrideDecls('dark'));
  });

  it('emits accent override ramps for every pickable accent in both themes', () => {
    expect(accentOptions.length).toBeGreaterThan(1);
    for (const option of accentOptions) {
      for (const theme of THEMES) expectWellFormed(accentDecls(option, theme));
    }
  });

  it('emits semantic and status aliases', () => {
    expectWellFormed(semanticDecls());
    expectWellFormed(statusDecls());
  });
});
