import { describe, expect, it } from 'vitest';
import { createLevelRecorder, rms } from '../src/index.ts';

/**
 * The recorder is what turns a playing track into a SeekBar's `levels`, so
 * these hold the properties the bar depends on: buckets only ever describe
 * audio that has been heard, and a bucket settles on its peak.
 */

describe('rms', () => {
  it('is zero for silence and one for a full-scale square', () => {
    expect(rms([0, 0, 0])).toBe(0);
    expect(rms([1, -1, 1, -1])).toBe(1);
  });

  it('ignores sign, since loudness is not polarity', () => {
    expect(rms([0.5, -0.5])).toBeCloseTo(0.5, 10);
  });

  it('sits below the peak for a signal that is not square', () => {
    expect(rms([1, 0, -1, 0])).toBeLessThan(1);
  });

  it('handles an empty block rather than dividing by zero', () => {
    expect(rms([])).toBe(0);
  });
});

describe('createLevelRecorder', () => {
  it('starts silent, so nothing claims to know about unplayed audio', () => {
    const recorder = createLevelRecorder({ buckets: 8 });
    expect(recorder.levels).toEqual(new Array(8).fill(0));
  });

  it('writes a reading into the bucket under the playhead', () => {
    const recorder = createLevelRecorder({ buckets: 4, gain: 1 });
    recorder.record(0.6, 0.5);
    // 0.6 of 4 buckets lands in the third
    expect(recorder.levels).toEqual([0, 0, 0.5, 0]);
  });

  it('keeps the loudest reading a bucket has seen', () => {
    const recorder = createLevelRecorder({ buckets: 2, gain: 1 });
    expect(recorder.record(0, 0.4)).toBe(true);
    expect(recorder.record(0, 0.9)).toBe(true);
    // a quieter frame must not pull an established peak back down
    expect(recorder.record(0, 0.2)).toBe(false);
    expect(recorder.levels[0]).toBe(0.9);
  });

  it('reports whether anything changed, so callers can skip re-renders', () => {
    const recorder = createLevelRecorder({ buckets: 2, gain: 1 });
    expect(recorder.record(0, 0.5)).toBe(true);
    expect(recorder.record(0, 0.5)).toBe(false);
  });

  it('applies gain so a normal mix fills the bar', () => {
    const recorder = createLevelRecorder({ buckets: 1, gain: 4 });
    recorder.record(0, 0.2);
    expect(recorder.levels[0]).toBeCloseTo(0.8, 10);
  });

  it('never exceeds one, however hot the signal or the gain', () => {
    const recorder = createLevelRecorder({ buckets: 1, gain: 50 });
    recorder.record(0, 1);
    expect(recorder.levels[0]).toBe(1);
  });

  it('keeps the playhead inside the array at either end', () => {
    const recorder = createLevelRecorder({ buckets: 4, gain: 1 });
    recorder.record(1, 0.5); // exactly at the end must not fall off it
    recorder.record(-3, 0.7);
    recorder.record(9, 0.3);
    expect(recorder.levels).toHaveLength(4);
    expect(recorder.levels[0]).toBe(0.7);
    expect(recorder.levels[3]).toBe(0.5);
  });

  it('ignores a non-finite reading rather than poisoning a bucket', () => {
    const recorder = createLevelRecorder({ buckets: 2, gain: 1 });
    recorder.record(Number.NaN, 0.8);
    recorder.record(0, Number.NaN);
    expect(recorder.levels.every(Number.isFinite)).toBe(true);
  });

  it('clears every bucket on reset, for a new source', () => {
    const recorder = createLevelRecorder({ buckets: 3, gain: 1 });
    recorder.record(0.5, 0.8);
    recorder.reset();
    expect(recorder.levels).toEqual([0, 0, 0]);
  });

  it('always has at least one bucket to write into', () => {
    expect(createLevelRecorder({ buckets: 0 }).levels).toHaveLength(1);
  });
});
