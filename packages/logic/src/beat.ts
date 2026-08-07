/**
 * Beat tracking - turns a stream of loudness readings into the small amount of
 * state a seek bar needs to move with the music: a `pulse` that jumps when the
 * track hits and falls back between hits, and the beats still travelling
 * outward along the bar as ripples.
 *
 * Two decisions are worth stating, because both are what keeps this honest on
 * real music rather than only on a metronome:
 *
 * 1. **The threshold adapts.** A beat is a reading louder than the recent
 *    running average, never louder than some constant - so a quiet intro and a
 *    loud chorus both produce beats, and a loud passage does not read as one
 *    continuous hit.
 * 2. **Strength is measured against the recent peak**, not against 1.0. RMS of
 *    a normal mix sits well below full scale, so scoring hits absolutely would
 *    make every beat a whisper.
 *
 * Renderer- and platform-agnostic on purpose, exactly like the level recorder
 * beside it: it takes a loudness number and a timestamp, nothing more. Each
 * binding supplies its own meter - a Web Audio analyser on the web, a player's
 * metering on a device.
 */

import { useEffect, useRef, useState } from 'react';
import type { LoudnessMeter } from './level-recorder.ts';
import type { SeekBarBeat } from './seek-bar.ts';

/** Clamps into 0..1; anything non-finite reads as 0 rather than poisoning the state. */
const clamp01 = (n: number): number => (Number.isFinite(n) ? (n < 0 ? 0 : n > 1 ? 1 : n) : 0);

/** Below this a reading is silence, not a quiet beat, so nothing fires on noise. */
const SILENCE = 0.01;

/**
 * How long the recent peak takes to halve. Long, so strength is judged against
 * the loudest of the last few seconds rather than the loudest of this instant.
 */
const PEAK_HALF_LIFE_MS = 4000;

/**
 * Readings taken before the running average means anything. Without it the
 * first sample - compared against an average of zero - is always a beat.
 */
const WARMUP_SAMPLES = 8;

export interface BeatTrackerOptions {
  /**
   * How fast the running average follows the music, 0..1 per reading. Higher
   * forgets sooner, so only the sharpest hits clear the bar.
   */
  adaptation?: number;
  /** How far above the running average a reading must sit to count as a beat. */
  threshold?: number;
  /** Shortest gap between beats in ms; ~180ms caps it around 330bpm. */
  minGapMs?: number;
  /** How long the pulse takes to fall halfway back to rest, in ms. */
  halfLifeMs?: number;
}

export interface BeatTracker {
  /**
   * Feeds one loudness reading taken at `now` (any monotonic ms clock).
   * Returns the beat's strength in 0..1, or 0 when the reading was not a beat.
   */
  sample(loudness: number, now: number): number;
  /** The current pulse in 0..1: jumps to a beat's strength, then decays. */
  readonly pulse: number;
  /** Forgets everything, for when the source changes. */
  reset(): void;
}

export function createBeatTracker({
  adaptation = 0.2,
  threshold = 1.3,
  minGapMs = 180,
  halfLifeMs = 240,
}: BeatTrackerOptions = {}): BeatTracker {
  let average = 0;
  let peak = 0;
  let pulse = 0;
  let seen = 0;
  let sampledAt: number | null = null;
  let beatAt = -Infinity;

  /** Half-life decay over an elapsed span, so a fall is the same at any sample rate. */
  const decay = (value: number, elapsed: number, halfLife: number): number =>
    value * 2 ** (-Math.max(elapsed, 0) / halfLife);

  return {
    get pulse() {
      return pulse;
    },
    sample(loudness, now) {
      const level = clamp01(loudness);
      const elapsed = sampledAt === null ? 0 : now - sampledAt;
      sampledAt = now;

      // Decayed by elapsed time rather than per call, so a 20Hz sampler and a
      // 60Hz one produce the same fall - only a smoother or coarser one.
      pulse = decay(pulse, elapsed, halfLifeMs);
      peak = Math.max(level, decay(peak, elapsed, PEAK_HALF_LIFE_MS));

      const warm = seen >= WARMUP_SAMPLES;
      seen += 1;
      const beat =
        warm && level > SILENCE && level > average * threshold && now - beatAt >= minGapMs;

      // Updated after the comparison, so a hit is measured against the music
      // before it rather than against itself.
      average += (level - average) * adaptation;

      if (!beat) return 0;
      beatAt = now;
      const strength = peak > 0 ? clamp01(level / peak) : 0;
      // Rises instantly and only ever upward: a soft hit landing while a hard
      // one is still ringing must not cut the loud one short.
      pulse = Math.max(pulse, strength);
      return strength;
    },
    reset() {
      average = 0;
      peak = 0;
      pulse = 0;
      seen = 0;
      sampledAt = null;
      beatAt = -Infinity;
    },
  };
}

/** A beat at rest: no swell, nothing travelling. Shared so an idle bar keeps one identity. */
const AT_REST: SeekBarBeat = { pulse: 0, ripples: [] };

/**
 * How long the bar takes to let go of the music once it stops.
 *
 * A stop is not a quiet passage, and waiting for the pulse to decay on its own
 * cannot tell the two apart: the fall would have to be slow enough to survive
 * the gap between beats on a slow track, which makes stopping take a second and
 * a half of nothing happening. The player already knows it paused, so this eases
 * out on that instead - deliberate, the same length every time, and short
 * enough that a paused bar is at rest about when the eye expects it to be.
 */
const SETTLE_MS = 800;

/** Smoothstep: eases in and out, so the settle neither starts nor lands abruptly. */
const smooth = (t: number): number => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};

export interface UseBeatOptions extends BeatTrackerOptions {
  /** Where the loudness readings come from. Null while nothing is playing. */
  meter: LoudnessMeter | null;
  /**
   * Only sample while this is true. Turning it off does not cut the bar's
   * movement off with it - the beat eases away over `SETTLE_MS` first, and only
   * then does the frame loop stop, so a paused player still costs nothing.
   */
  active: boolean;
  /**
   * Where a beat lands on the bar, 0..1 of its width - normally the playhead,
   * so hits ripple out from the position they were heard at.
   */
  at?: number;
  /** How long a ripple takes to travel and fade, in ms. */
  rippleMs?: number;
  /** The most ripples alive at once; the oldest is dropped past this. */
  maxRipples?: number;
}

/**
 * Samples a meter every frame and hands back what the seek bar draws with: the
 * current pulse, and the beats still travelling.
 *
 * Every frame, because the whole point is a deformation the eye reads as being
 * in time with the music - `useLiveLevels` beside it can afford a 20Hz timer
 * because a waveform bucket settles slowly, but a beat that arrives a frame or
 * two late reads as sloppy rather than as tight.
 *
 * Returns one shared at-rest value while nothing is playing, so an idle bar
 * does not re-render on a new-but-identical object.
 */
export function useBeat({
  meter,
  active,
  at = 0,
  rippleMs = 900,
  maxRipples = 6,
  ...tracker
}: UseBeatOptions): SeekBarBeat {
  const [beat, setBeat] = useState<SeekBarBeat>(AT_REST);

  // Read through refs rather than listed as dependencies: the playhead moves
  // constantly, and rebuilding the frame loop under it would reset the tracker
  // several times a second and lose the running average that finds the beats.
  const atRef = useRef(at);
  atRef.current = at;
  const optionsRef = useRef(tracker);
  optionsRef.current = tracker;

  // Kept across pauses rather than rebuilt with the effect. Pausing is not the
  // same event as changing track: the tracker holding its running average is
  // what lets a resumed player find the beat immediately instead of spending a
  // warmup deciding what loud means, and the ripples outliving the pause is
  // what lets the bar settle out of its last hit instead of losing it.
  const detectorRef = useRef<BeatTracker | null>(null);
  const liveRef = useRef<{ at: number; born: number; strength: number }[]>([]);
  const sourceRef = useRef<LoudnessMeter | null>(null);

  useEffect(() => {
    const playing = Boolean(meter) && active;
    // Never played, not playing now: no loop, and nothing to settle out of.
    if (!playing && !detectorRef.current) return;
    if (meter && sourceRef.current !== meter) {
      // A new source is a new piece of music - that one does start over.
      sourceRef.current = meter;
      detectorRef.current?.reset();
      liveRef.current = [];
    }
    const detector = (detectorRef.current ??= createBeatTracker(optionsRef.current));
    let frame = 0;
    let resting = false;
    let stoppedAt: number | null = null;

    const tick = (now: number) => {
      if (!playing && stoppedAt === null) stoppedAt = now;
      // Everything the bar draws with is scaled by this, so stopping takes the
      // swell, the hits still travelling and the shadow down together on one
      // curve rather than each expiring on its own schedule.
      const ease = playing ? 1 : 1 - smooth((now - stoppedAt!) / SETTLE_MS);
      // Paused, the meter is not read at all: silence keeps the tracker's clock
      // running so the pulse decays by elapsed time, without a stopped player's
      // last reading being mistaken for a beat.
      const strength = detector.sample(playing && meter ? meter() : 0, now);
      if (strength > 0) {
        liveRef.current.push({ at: atRef.current, born: now, strength });
        if (liveRef.current.length > maxRipples) liveRef.current.shift();
      }
      liveRef.current = liveRef.current.filter((r) => now - r.born < rippleMs);

      const pulse = detector.pulse * ease;
      if (ease <= 0 || (pulse <= 0.001 && liveRef.current.length === 0)) {
        // Nothing to draw. Publishing the shared at-rest value once, then
        // going quiet, keeps a silent passage from re-rendering the bar 60
        // times a second to say the same nothing.
        if (!resting) {
          resting = true;
          setBeat(AT_REST);
        }
        // Settled and paused: nothing left to draw and nothing to listen to,
        // so stop asking for frames until play resumes.
        if (!playing) {
          frame = 0;
          return;
        }
      } else {
        resting = false;
        setBeat({
          // 2dp is below what a stroke can show, and rounding keeps React from
          // re-rendering on a difference nobody can see.
          pulse: Math.round(pulse * 100) / 100,
          ripples: liveRef.current.map((r) => ({
            at: r.at,
            age: (now - r.born) / rippleMs,
            strength: r.strength * ease,
          })),
        });
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      if (frame) cancelAnimationFrame(frame);
    };
  }, [meter, active, rippleMs, maxRipples]);

  return beat;
}
