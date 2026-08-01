import { describe, expect, it } from 'vitest';
import {
  gradientDecls,
  gradientWashRamps,
  scrimSteps,
  SHAPE_GLOW,
  shapeDecls,
  shapeGeometry,
  shapeShadowDecls,
  shapeShadows,
  statuses,
} from '../src/index.ts';

type Decl = [string, string];
const THEMES = ['light', 'dark'] as const;

function expectWellFormed(decls: Decl[]) {
  expect(decls.length).toBeGreaterThan(0);
  for (const [name, value] of decls) {
    expect(name).toMatch(/^[a-z0-9-]+$/);
    expect(String(value).length).toBeGreaterThan(0);
  }
}

describe('shape tokens', () => {
  it('emits every geometry knob, theme-agnostic, under the shape- prefix', () => {
    const decls = shapeDecls();
    expectWellFormed(decls);
    expect(decls.map(([name]) => name)).toEqual(Object.keys(shapeGeometry));
    const byName = Object.fromEntries(decls);
    expect(byName['shape-slant-angle']).toMatch(/deg$/);
    for (const knob of ['shape-notch', 'shape-edge-cut', 'shape-accent-edge', 'shape-accent-edge-active'])
      expect(byName[knob]).toMatch(/px$/);
    expect(byName['shape-slant-pad']).toMatch(/rem$/);
  });

  it('emits the drop + glow depth pair per theme, with a theme-agnostic accent glow', () => {
    for (const theme of THEMES) {
      const decls = shapeShadowDecls(theme);
      expectWellFormed(decls);
      const byName = Object.fromEntries(decls);
      expect(byName['shape-shadow']).toBe(shapeShadows[theme]);
      // the glow rides accent-solid so it follows the data-accent picker
      expect(byName['shape-glow']).toBe(SHAPE_GLOW);
      expect(byName['shape-glow']).toContain('var(--glacier-accent-solid)');
    }
    // the drop half is genuinely themed - dark ink must differ from light
    expect(shapeShadows.light).not.toBe(shapeShadows.dark);
  });
});

describe('gradient tokens', () => {
  const byName = Object.fromEntries(gradientDecls());

  it('is well-formed and every gradient is a linear-gradient', () => {
    expectWellFormed(gradientDecls());
    for (const value of Object.values(byName)) expect(value).toMatch(/^linear-gradient\(/);
  });

  it('builds the accent fill and sweep on accent custom properties', () => {
    expect(byName['gradient-accent']).toContain('var(--glacier-accent-8)');
    expect(byName['gradient-accent']).toContain('var(--glacier-accent-10)');
    expect(byName['gradient-sweep']).toContain('var(--glacier-accent-solid)');
  });

  it('emits one wash per tone from the semantic status ramps plus neutral and accent', () => {
    expect(Object.keys(gradientWashRamps)).toEqual(['neutral', 'accent', ...Object.keys(statuses)]);
    for (const [tone, ramp] of Object.entries(gradientWashRamps)) {
      const wash = byName[`gradient-wash-${tone}`];
      expect(wash).toContain(`var(--glacier-${ramp}-3)`);
      expect(wash).toContain(`var(--glacier-${ramp}-1)`);
    }
  });

  it('keeps the sheen theme-aware and the scrim ladder theme-invariant', () => {
    expect(byName['gradient-sheen']).toContain('var(--glacier-glass-highlight)');
    // scrims protect text over media identically in both themes: literal ink,
    // no custom-property stops, one step per ladder rung
    for (const [i, [alpha, stop]] of scrimSteps.entries()) {
      const scrim = byName[`gradient-scrim-${i + 1}`];
      expect(scrim).not.toContain('var(');
      expect(scrim).toContain(`/ ${alpha})`);
      expect(scrim).toContain(`transparent ${stop}`);
    }
  });
});
