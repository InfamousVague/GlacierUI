import { describe, expect, it } from 'vitest';
import { createBeatTracker } from '../src/index.ts';

/**
 * The tracker is the one place the "was that a beat?" decision lives, so these
 * hold what both bindings depend on: it fires on hits rather than on loudness,
 * it does not fire twice on one hit, and it settles back to rest on its own.
 */

/** Feeds a run of readings at a fixed rate, returning the beats that landed. */
function play(
  tracker: ReturnType<typeof createBeatTracker>,
  levels: number[],
  { stepMs = 16, from = 0 }: { stepMs?: number; from?: number } = {},
): { at: number; strength: number }[] {
  const beats: { at: number; strength: number }[] = [];
  levels.forEach((level, i) => {
    const at = from + i * stepMs;
    const strength = tracker.sample(level, at);
    if (strength > 0) beats.push({ at, strength });
  });
  return beats;
}

/** A run of quiet readings with a hit every `every` samples. */
function pattern(count: number, every: number, quiet = 0.1, hit = 0.6): number[] {
  return Array.from({ length: count }, (_unused, i) => (i % every === 0 ? hit : quiet));
}
describe('createBeatTracker', () => {
  it('finds the hits in a steady pattern', () => {
    const tracker = createBeatTracker();
    // 16ms apart with a hit every 16 samples is a 256ms pulse, ~234bpm - inside
    // the default minimum gap, so nothing is being suppressed for being early
    const beats = play(tracker, pattern(320, 16));
    expect(beats.length).toBeGreaterThan(15);
    // and every one of them landed on a hit, not between them
    for (const beat of beats) expect((beat.at / 16) % 16).toBe(0);
  });

  it('stays quiet through a level passage, however loud it is', () => {
    // A constant tone is not a beat: the threshold is the running average, so
    // loudness alone never fires. This is the whole reason it adapts.
    expect(play(createBeatTracker(), Array<number>(200).fill(0.8))).toHaveLength(0);
  });

  it('stays quiet through silence', () => {
    expect(play(createBeatTracker(), Array<number>(200).fill(0))).toHaveLength(0);
  });

  it('does not fire twice on one hit', () => {
    const tracker = createBeatTracker({ minGapMs: 200 });
    // a hit smeared over several readings, as a real attack is
    const beats = play(tracker, [...Array<number>(40).fill(0.1), 0.7, 0.7, 0.7, 0.7]);
    expect(beats).toHaveLength(1);
  });

  it('scores a soft hit below a hard one', () => {
    const tracker = createBeatTracker({ minGapMs: 0 });
    play(tracker, Array<number>(40).fill(0.1));
    // strength is measured against the recent peak, so the same tracker rates
    // the quieter of two hits lower without either being discarded
    const hard = tracker.sample(1, 1000);
    const soft = tracker.sample(0.5, 2000);
    expect(hard).toBeGreaterThan(soft);
    expect(soft).toBeGreaterThan(0);
  });

  it('jumps the pulse on a beat and decays it back to rest', () => {
    const tracker = createBeatTracker({ halfLifeMs: 200 });
    play(tracker, Array<number>(40).fill(0.1));
    tracker.sample(0.9, 1000);
    const struck = tracker.pulse;
    expect(struck).toBeGreaterThan(0.5);

    // one half-life later it should be about halfway back
    tracker.sample(0.1, 1200);
    expect(tracker.pulse).toBeCloseTo(struck / 2, 1);
    // and well on its way to nothing after a second
    tracker.sample(0.1, 2200);
    expect(tracker.pulse).toBeLessThan(0.05);
  });

  it('decays by elapsed time, so the sample rate does not change the fall', () => {
    const fall = (stepMs: number) => {
      const tracker = createBeatTracker({ halfLifeMs: 200 });
      play(tracker, Array<number>(40).fill(0.1), { stepMs });
      tracker.sample(0.9, 1000);
      const struck = tracker.pulse;
      // sample out to the same wall-clock moment, at different rates
      for (let at = 1000 + stepMs; at <= 1400; at += stepMs) tracker.sample(0.1, at);
      return tracker.pulse / struck;
    };
    expect(fall(8)).toBeCloseTo(fall(50), 2);
  });

  it('never fires on the first reading, which has no average to beat', () => {
    expect(createBeatTracker().sample(1, 0)).toBe(0);
  });

  it('forgets everything on reset', () => {
    const tracker = createBeatTracker();
    play(tracker, pattern(100, 8));
    tracker.reset();
    expect(tracker.pulse).toBe(0);
    expect(createBeatTracker().sample(1, 0)).toBe(0);
  });

  it('reads a non-finite loudness as silence rather than as a hit', () => {
    const tracker = createBeatTracker();
    play(tracker, Array<number>(40).fill(0.1));
    expect(tracker.sample(Number.NaN, 1000)).toBe(0);
    expect(tracker.pulse).toBeGreaterThanOrEqual(0);
  });
});
