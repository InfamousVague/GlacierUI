/**
 * Level recorder - builds a SeekBar's `levels` array from audio as it plays,
 * instead of measuring the file up front.
 *
 * The model is simple: the track is divided into a fixed number of buckets, and
 * whatever the player is hearing right now is written into the bucket the
 * playhead is in. So the waveform draws itself as the track plays, and a bucket
 * only ever claims to know about audio that has actually been heard.
 *
 * This is renderer- and platform-agnostic on purpose: it takes a loudness
 * number and a position, nothing more. Each binding supplies its own meter -
 * a Web Audio `AnalyserNode` on the web, a native player's metering on a
 * device - and neither has to re-derive the bookkeeping.
 */

import { useEffect, useRef, useState } from 'react';

/** Loudness of a block of samples, as RMS in 0..1. */
export function rms(samples: ArrayLike<number>): number {
  if (samples.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < samples.length; i += 1) {
    const sample = samples[i] ?? 0;
    sum += sample * sample;
  }
  return Math.sqrt(sum / samples.length);
}

export interface LevelRecorderOptions {
  /** How many buckets span the track. A few dozen is all a bar can resolve. */
  buckets?: number;
  /**
   * Scales the recorded loudness so a normal mix fills the bar. RMS of music
   * sits well below 1.0, so painting it raw leaves a nearly flat waveform.
   */
  gain?: number;
}

export interface LevelRecorder {
  /** The levels so far; unplayed buckets read 0. Safe to hand straight to SeekBar. */
  readonly levels: number[];
  /**
   * Records a loudness reading at a position (0..1 of the duration). Keeps the
   * loudest reading a bucket has seen, so a bucket settles on its peak rather
   * than flickering with whatever the last frame happened to catch.
   *
   * Returns true when the value changed, so a caller can skip re-rendering on
   * the many frames that tell it nothing new.
   */
  record(progress: number, loudness: number): boolean;
  /** Clears every bucket, for when the source changes. */
  reset(): void;
}

/** Reads the current loudness of whatever is playing, as 0..1. */
export type LoudnessMeter = () => number;

export interface UseLiveLevelsOptions extends LevelRecorderOptions {
  /** Where the loudness readings come from. Null while nothing is playing. */
  meter: LoudnessMeter | null;
  /** Current playhead position as 0..1 of the duration. */
  progress: number;
  /** Only sample while this is true, so a paused player costs nothing. */
  active: boolean;
  /**
   * Milliseconds between readings. Buckets move far slower than the frame
   * rate, so a timer at ~20Hz is both plenty and cheaper than a render loop.
   */
  intervalMs?: number;
}

/** Clamps into 0..1; anything non-finite reads as 0 rather than poisoning a bucket. */
const clamp01 = (n: number): number => (Number.isFinite(n) ? (n < 0 ? 0 : n > 1 ? 1 : n) : 0);

export function createLevelRecorder({
  buckets = 64,
  gain = 2.5,
}: LevelRecorderOptions = {}): LevelRecorder {
  const levels = new Array<number>(Math.max(1, Math.floor(buckets))).fill(0);
  return {
    levels,
    record(progress, loudness) {
      const index = Math.min(levels.length - 1, Math.floor(clamp01(progress) * levels.length));
      const value = clamp01(loudness * gain);
      if (value <= (levels[index] ?? 0)) return false;
      levels[index] = value;
      return true;
    },
    reset() {
      levels.fill(0);
    },
  };
}

/**
 * Records levels from a playing source and re-renders as they fill in.
 *
 * Pure React and timers only - no DOM, no React Native - so the same hook backs
 * both bindings. All either platform supplies is a `meter`: an `AnalyserNode`
 * on the web, a player's metering on a device.
 *
 * `progress` is read through a ref rather than a dependency, so the sampling
 * timer survives playback instead of being torn down and rebuilt every tick.
 */
export function useLiveLevels({
  meter,
  progress,
  active,
  buckets = 64,
  gain = 2.5,
  intervalMs = 50,
}: UseLiveLevelsOptions): number[] {
  // one recorder for the life of the component, created lazily so the bucket
  // count is read once rather than on every render
  const recorderRef = useRef<LevelRecorder>(undefined as unknown as LevelRecorder);
  if (recorderRef.current === undefined) {
    recorderRef.current = createLevelRecorder({ buckets, gain });
  }
  const recorder = recorderRef.current;

  const progressRef = useRef(progress);
  progressRef.current = progress;

  const [levels, setLevels] = useState<number[]>(() => [...recorder.levels]);

  useEffect(() => {
    if (!meter || !active) return;
    const id = setInterval(() => {
      // only publish a new array when a bucket actually grew, so a quiet
      // passage does not re-render the bar every tick
      if (recorder.record(progressRef.current, meter())) setLevels([...recorder.levels]);
    }, intervalMs);
    return () => clearInterval(id);
  }, [recorder, meter, active, intervalMs]);

  return levels;
}
