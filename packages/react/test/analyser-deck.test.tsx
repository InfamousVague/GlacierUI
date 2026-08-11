/**
 * The deck's arithmetic: the lag a speed glide has to build.
 *
 * A stream is slowed by reading it through a delay line that lengthens - the
 * output plays at 1 - D'(t) - so these two functions are the whole effect, and
 * the audio graph only interpolates between the points they give it.
 */

import { describe, expect, it } from 'vitest';
import { fadeShape, speedGlideDelay, speedGlideSpeed } from '../src/audio/analyserMeter.ts';

/**
 * The slope of the lag across a small step, which is what the ear reads. The
 * window is kept inside the glide: the delay clamps at both ends, so a step
 * that reached past one would measure half a slope and say so.
 */
const slopeAt = (from: number, to: number, seconds: number, at: number) => {
  const h = seconds / 2000;
  const lo = Math.min(Math.max(at - h, 0), seconds - h);
  const hi = lo + h;
  const a = speedGlideDelay(from, to, seconds, 0, lo);
  const b = speedGlideDelay(from, to, seconds, 0, hi);
  return (b - a) / h;
};

describe('deck speed glide', () => {
  it('starts at the lag it was handed, so a new glide never steps the line', () => {
    expect(speedGlideDelay(1, 0.5, 0.32, 0.08, 0)).toBeCloseTo(0.08, 6);
    expect(speedGlideDelay(0.5, 1, 0.38, 0, 0)).toBeCloseTo(0, 6);
  });

  it('lengthens the line by exactly the time the source did not advance', () => {
    // Held at half speed for a second, the source falls a half second behind.
    expect(speedGlideDelay(0.5, 0.5, 1, 0, 1)).toBeCloseTo(0.5, 6);
    // At full speed it never falls behind at all.
    expect(speedGlideDelay(1, 1, 1, 0, 1)).toBeCloseTo(0, 6);
  });

  it('plays back at the speed asked for, which is one minus the slope', () => {
    for (const at of [0, 0.08, 0.16, 0.24, 0.32]) {
      const heard = 1 - slopeAt(1, 0.5, 0.32, at);
      expect(heard).toBeCloseTo(speedGlideSpeed(1, 0.5, 0.32, at), 3);
    }
  });

  it('lands on its target speed, in both directions', () => {
    expect(1 - slopeAt(1, 0.5, 0.32, 0.32)).toBeCloseTo(0.5, 3);
    expect(1 - slopeAt(0.5, 1, 0.38, 0.38)).toBeCloseTo(1, 3);
  });

  it('travels the same number of semitones in every part of the glide', () => {
    // The point of a geometric glide: an even sweep rather than a lurch and
    // then nothing. Each quarter of the stop drops the same interval.
    const st = (speed: number) => 12 * Math.log2(speed);
    const steps = [0, 0.25, 0.5, 0.75, 1].map((f) => st(speedGlideSpeed(1, 0.5, 0.32, f * 0.32)));
    const drops = steps.slice(1).map((v, i) => v - steps[i]!);
    for (const drop of drops) expect(drop).toBeCloseTo(-3, 6);
  });

  it('never shortens the line, so the signal is only ever read forwards', () => {
    let previous = -Infinity;
    for (let i = 0; i <= 64; i += 1) {
      const value = speedGlideDelay(1, 0.5, 0.32, 0, (i / 64) * 0.32);
      expect(value).toBeGreaterThanOrEqual(previous);
      previous = value;
    }
  });

  it('holds still at full speed, so a glide that goes nowhere costs no lag', () => {
    expect(speedGlideDelay(1, 1, 0.4, 0.02, 0.4)).toBeCloseTo(0.02, 6);
  });

  it('never reads before its own start: a glide from zero lag cannot outgrow elapsed time', () => {
    // The line's read position is (elapsed - delay); with delay(t) <= t the
    // deck can only slow what played AFTER the flush, never resurrect what
    // played before it - the invariant that makes a flush at a seek final.
    for (const [from, to, span] of [[0.5, 1, 0.38], [1, 0.5, 0.32], [0.05, 1, 0.5]]) {
      for (let i = 0; i <= 32; i += 1) {
        const t = (i / 32) * span!;
        expect(speedGlideDelay(from!, to!, span!, 0, t)).toBeLessThanOrEqual(t + 1e-9);
      }
    }
  });

  it('clamps to the ends of the glide rather than extrapolating past them', () => {
    const end = speedGlideDelay(1, 0.5, 0.32, 0, 0.32);
    expect(speedGlideDelay(1, 0.5, 0.32, 0, 5)).toBeCloseTo(end, 6);
    expect(speedGlideDelay(1, 0.5, 0.32, 0, -5)).toBeCloseTo(0, 6);
    expect(speedGlideSpeed(1, 0.5, 0.32, 5)).toBeCloseTo(0.5, 6);
  });
});

/**
 * The crossfade's curve: the level a mix-seat fade has reached, part-way
 * through. The one property that matters is the pair identity - a rise and a
 * fall through the same instant must sum to constant power, or the middle of
 * every crossfade dips.
 */
describe('mix seat fade shape', () => {
  it('starts where it was and lands where it was asked', () => {
    expect(fadeShape(0, 1, 0)).toBeCloseTo(0, 6);
    expect(fadeShape(0, 1, 1)).toBeCloseTo(1, 6);
    expect(fadeShape(1, 0, 0)).toBeCloseTo(1, 6);
    expect(fadeShape(1, 0, 1)).toBeCloseTo(0, 6);
  });

  it('holds a symmetric pair to constant power the whole way across', () => {
    for (let i = 0; i <= 32; i += 1) {
      const u = i / 32;
      const rising = fadeShape(0, 1, u);
      const falling = fadeShape(1, 0, u);
      expect(rising * rising + falling * falling).toBeCloseTo(1, 6);
    }
  });

  it('moves monotonically, in both directions', () => {
    let up = -Infinity;
    let down = Infinity;
    for (let i = 0; i <= 32; i += 1) {
      const u = i / 32;
      const rising = fadeShape(0, 1, u);
      const falling = fadeShape(1, 0, u);
      expect(rising).toBeGreaterThanOrEqual(up);
      expect(falling).toBeLessThanOrEqual(down);
      up = rising;
      down = falling;
    }
  });

  it('is a flat line when told to go nowhere', () => {
    for (const u of [0, 0.3, 0.7, 1]) expect(fadeShape(0.6, 0.6, u)).toBe(0.6);
  });

  it('clamps its progress rather than overshooting the ends', () => {
    expect(fadeShape(0, 1, -2)).toBeCloseTo(0, 6);
    expect(fadeShape(0, 1, 3)).toBeCloseTo(1, 6);
  });

  it('interpolates between arbitrary levels, not just full and silent', () => {
    // A crossfade under a half-open fader still meets in the middle.
    expect(fadeShape(0.5, 0, 1)).toBeCloseTo(0, 6);
    expect(fadeShape(0.2, 0.8, 0)).toBeCloseTo(0.2, 6);
    expect(fadeShape(0.2, 0.8, 1)).toBeCloseTo(0.8, 6);
  });
});
