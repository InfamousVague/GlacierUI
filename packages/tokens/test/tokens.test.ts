import { describe, expect, it } from 'vitest';
import {
  space,
  SPACE_STEPS,
  fluid,
  typeScale,
  ramps,
  rampSteps,
  RAMP_SIZE,
  radii,
  durations,
  accentOptions,
  accentSteps,
} from '../src/index.ts';

describe('accent options', () => {
  it('has unique names and produces full ramps in both themes', () => {
    const names = accentOptions.map((o) => o.name);
    expect(new Set(names).size).toBe(names.length);
    for (const option of accentOptions) {
      for (const theme of ['light', 'dark'] as const) {
        const steps = accentSteps(option, theme);
        expect(steps).toHaveLength(RAMP_SIZE);
        for (const step of steps) expect(step).toMatch(/^oklch\(/);
      }
    }
  });

  it('keeps the first option as the built-in default matching the accent ramp', () => {
    const first = accentOptions[0]!;
    expect(first.name).toBe('blue');
    const accentRamp = ramps.find((r) => r.name === 'accent')!;
    expect(first.hue).toBe(accentRamp.hue);
    expect(first.chroma).toBe(accentRamp.chroma);
  });
});

describe('space scale', () => {
  it('is monotonically increasing at both viewport extremes', () => {
    for (let i = 1; i < SPACE_STEPS.length; i++) {
      const prev = space[SPACE_STEPS[i - 1]!]!;
      const curr = space[SPACE_STEPS[i]!]!;
      expect(curr.min).toBeGreaterThan(prev.min);
      expect(curr.max).toBeGreaterThan(prev.max);
    }
  });

  it('emits clamp() for fluid steps and a plain value for step 0', () => {
    expect(space[0]!.clamp).toBe('0rem');
    expect(space[4]!.clamp).toMatch(/^clamp\(1rem, .+vw, 1\.25rem\)$/);
  });

  it('never exceeds its own bounds', () => {
    const v = fluid(1, 1.25);
    expect(v.min).toBeLessThan(v.max);
  });
});

describe('type scale', () => {
  it('has 9 ascending steps with md as the 1rem base', () => {
    expect(typeScale).toHaveLength(9);
    const md = typeScale.find((s) => s.name === 'md')!;
    expect(md.size.min).toBe(1);
    for (let i = 1; i < typeScale.length; i++) {
      expect(typeScale[i]!.size.min).toBeGreaterThan(typeScale[i - 1]!.size.min);
    }
  });

  it('tightens line-height and tracking as sizes grow', () => {
    const xs = typeScale.find((s) => s.name === 'xs')!;
    const xl5 = typeScale.find((s) => s.name === '5xl')!;
    expect(xs.lineHeight).toBeGreaterThan(xl5.lineHeight);
    expect(xl5.tracking).toBe('-0.02em');
  });
});

describe('color ramps', () => {
  it('produces 12 oklch() steps for every ramp in both themes', () => {
    for (const ramp of ramps) {
      for (const theme of ['light', 'dark'] as const) {
        const steps = rampSteps(ramp, theme);
        expect(steps).toHaveLength(RAMP_SIZE);
        for (const step of steps) expect(step).toMatch(/^oklch\([\d.]+ [\d.]+ [\d.]+\)$/);
      }
    }
  });

  it('light ramps darken and dark ramps lighten as steps increase', () => {
    const parseL = (s: string) => Number(s.slice('oklch('.length).split(' ')[0]);
    const gray = ramps.find((r) => r.name === 'gray')!;
    const light = rampSteps(gray, 'light').map(parseL);
    const dark = rampSteps(gray, 'dark').map(parseL);
    for (let i = 1; i < RAMP_SIZE; i++) {
      expect(light[i]!).toBeLessThan(light[i - 1]!);
      expect(dark[i]!).toBeGreaterThan(dark[i - 1]!);
    }
  });
});

describe('shape and motion', () => {
  it('radius ramp ascends from none to full', () => {
    expect(radii.none).toBe('0px');
    expect(radii.full).toBe('9999px');
  });

  it('duration roles ascend', () => {
    expect(durations.instant).toBeLessThan(durations.fast);
    expect(durations.fast).toBeLessThan(durations.normal);
    expect(durations.normal).toBeLessThan(durations.slow);
    expect(durations.slow).toBeLessThan(durations.slower);
  });
});
