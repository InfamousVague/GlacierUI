/**
 * Call control logic — the decisions an in-call control row makes that are not
 * pixels: what a toggle's engaged state MEANS, how an input level becomes a
 * ring, how a link measurement grades to a tone, and how the call clock ticks.
 *
 * All of it is shared, because every one of these is a place the DOM and native
 * bindings would otherwise each make their own guess — and a mic that reads
 * "muted" as reassuring on one platform and alarming on the other is not a
 * styling drift, it is a different product.
 */

import { useEffect, useRef, useState } from 'react';
import { createLevelRecorder, type LevelRecorder, type LoudnessMeter } from './level-recorder.ts';
import { sizeFor } from './spec.ts';
// TODO(integration): switch to '@glacier/spec' once the call-controls specs are
// registered in packages/spec/src/index.ts.
import { callControlButtonSpec } from '../../spec/src/components/call-control-button.ts';

/**
 * The three-way visual state of a call control.
 *
 * - `idle` — available, nothing unusual.
 * - `engaged` — a feature the user turned ON is running. Reassuring.
 * - `danger` — the user has CUT something OFF, or this control ends the call.
 *   Alarming.
 */
export type CallControlState = 'idle' | 'engaged' | 'danger';

/** The touch-first size steps a call control comes in. */
export type CallControlSize = 'md' | 'lg';

/**
 * What engaging a call toggle actually MEANS, which decides whether the engaged
 * state is reassuring or alarming.
 *
 * - `enables` — pressing it turns a feature on (speaker, screen share, raised
 *   hand). Engaged is good news: `engaged`.
 * - `suppresses` — pressing it cuts something off (mute, camera off). Engaged is
 *   bad news: `danger`.
 *
 * This is the whole reason `pressed` and `state` are separate props. A mute
 * button that painted itself "engaged" when muted would say *the microphone is
 * working* at exactly the moment it is not, which is the single most common
 * failure mode in a video call. Both bindings call this rather than each
 * deciding for themselves.
 */
export type CallToggleSense = 'enables' | 'suppresses';

/** Maps a toggle's on/off plus its sense to the paint it should carry. */
export function callControlState(engaged: boolean, sense: CallToggleSense = 'enables'): CallControlState {
  if (!engaged) return 'idle';
  return sense === 'suppresses' ? 'danger' : 'engaged';
}

/**
 * The glyph size, in pixels, for a control size step.
 *
 * Read out of the spec rather than restated, so there is exactly one place the
 * number lives. Icon components take a plain pixel number (both lucide on the
 * web and the native proxy), which is why this is not a token: it is a raw
 * length in the spec's `iconSize` and parsed back to a number here.
 */
export function callControlGlyph(size: CallControlSize): number {
  const declared = sizeFor(callControlButtonSpec, size).iconSize;
  const parsed = Number.parseFloat(declared ?? '');
  return Number.isFinite(parsed) ? parsed : 20;
}

// ---- mic level ring --------------------------------------------------------

/**
 * How the ring behind a live mic maps an input level to geometry. Plain numbers,
 * not a motion runtime, so each platform animates them with its own engine —
 * the same arrangement as `press`.
 */
export const micRing = {
  /** Ring scale at silence and at full level, as a multiple of the disc. */
  minScale: 1,
  maxScale: 1.34,
  /** Ring opacity at silence and at full level. */
  minOpacity: 0.18,
  maxOpacity: 0.7,
} as const;

/** The ring's geometry for a level in 0..1. Out-of-range levels settle at rest. */
export function micRingGeometry(level: number): { scale: number; opacity: number } {
  const l = Number.isFinite(level) ? Math.min(1, Math.max(0, level)) : 0;
  return {
    scale: micRing.minScale + (micRing.maxScale - micRing.minScale) * l,
    opacity: micRing.minOpacity + (micRing.maxOpacity - micRing.minOpacity) * l,
  };
}

export interface UseMicLevelOptions {
  /** Where the loudness readings come from. Null while nothing is being captured. */
  meter: LoudnessMeter | null;
  /** Only sample while this is true, so a muted or disabled control costs nothing. */
  active: boolean;
  /** Milliseconds between readings; the ring resolves far below the frame rate. */
  intervalMs?: number;
  /**
   * How long a peak is held before it can fall. Speech is spiky: sampled raw,
   * the ring flickers between syllables. Held for about this long it swells with
   * a sentence and settles when the room goes quiet.
   */
  windowMs?: number;
  /** Scales raw RMS so a normal speaking voice fills the ring. */
  gain?: number;
}

/**
 * The current input level as one 0..1 number, as a rolling peak-hold.
 *
 * Built on `createLevelRecorder` rather than beside it: the recorder already
 * owns the clamping, the gain, and the keep-the-loudest-per-bucket rule, and
 * that arithmetic must not exist twice. Here its buckets are a time window
 * instead of a track — the cursor sweeps them once per `windowMs`, and when it
 * wraps, the finished sweep's peak is retired to a holding value and the
 * buckets are cleared. The reported level is the higher of the sweep so far and
 * the retired peak, so it rises instantly with a voice and decays over roughly
 * one to two windows of silence, never on a single quiet frame between words.
 *
 * Pure React and timers, no DOM and no react-native: the web feeds it from
 * `createAnalyserMeter`, a device from its own recorder's metering.
 */
export function useMicLevel({
  meter,
  active,
  intervalMs = 50,
  windowMs = 600,
  gain = 2.5,
}: UseMicLevelOptions): number {
  const buckets = Math.max(2, Math.round(windowMs / intervalMs));

  // one recorder for the life of the component, created lazily so the bucket
  // count is read once rather than on every render
  const recorderRef = useRef<LevelRecorder>(undefined as unknown as LevelRecorder);
  if (recorderRef.current === undefined) {
    recorderRef.current = createLevelRecorder({ buckets, gain });
  }
  const recorder = recorderRef.current;

  const tickRef = useRef(0);
  const heldRef = useRef(0);
  const [level, setLevel] = useState(0);

  useEffect(() => {
    if (!meter || !active) {
      // Nothing is being captured, so the ring must not keep showing a level
      // from before the mute — a halo around a muted mic is a lie.
      recorder.reset();
      tickRef.current = 0;
      heldRef.current = 0;
      setLevel((current) => (current === 0 ? current : 0));
      return;
    }
    const id = setInterval(() => {
      const tick = tickRef.current;
      if (tick > 0 && tick % buckets === 0) {
        heldRef.current = peak(recorder.levels);
        recorder.reset();
      }
      tickRef.current = tick + 1;
      recorder.record((tick % buckets) / buckets, meter());
      const next = Math.max(peak(recorder.levels), heldRef.current);
      // Quantized so a breath does not re-render the ring twenty times a
      // second; a 1/32 step is well under what the eye resolves on a 48px disc.
      setLevel((current) => (Math.abs(next - current) < LEVEL_STEP ? current : next));
    }, intervalMs);
    return () => clearInterval(id);
  }, [recorder, meter, active, intervalMs, buckets]);

  return level;
}

/** The smallest level change worth a re-render. */
const LEVEL_STEP = 1 / 32;

function peak(levels: readonly number[]): number {
  let max = 0;
  for (const value of levels) if (value > max) max = value;
  return max;
}

// ---- connection quality ----------------------------------------------------

/** How good the link is, or that nothing has been measured yet. */
export type ConnectionQualityLevel = 0 | 1 | 2 | 3 | 4 | 'unknown';

/** How many bars the indicator draws. */
export const CONNECTION_BARS = 4;

/**
 * Bar heights as a fraction of the box, shortest first. Shared because a
 * stepped ramp is the whole visual idea: equal-height bars would be a Meter,
 * and the two must not be confused at a glance.
 */
export const connectionBarHeights = [0.4, 0.6, 0.8, 1] as const;

/** The tone family a level grades to. */
export type ConnectionQualityTone = 'neutral' | 'danger' | 'warning' | 'success';

/**
 * Grades a level to its tone. 0 and 1 are danger because a call at one bar is
 * already breaking up rather than merely unimpressive; 2 warns; 3 and 4 are
 * healthy; unknown is neutral, never zero — "not measured" and "about to drop"
 * must not look the same.
 */
export function connectionQualityTone(level: ConnectionQualityLevel): ConnectionQualityTone {
  if (level === 'unknown') return 'neutral';
  if (level <= 1) return 'danger';
  if (level === 2) return 'warning';
  return 'success';
}

/** How many bars are filled. Unknown fills none, but is not level 0. */
export function connectionBarsFilled(level: ConnectionQualityLevel): number {
  if (level === 'unknown') return 0;
  return Math.min(CONNECTION_BARS, Math.max(0, Math.round(level)));
}

/** Normalizes anything a host might hand in — including null and out-of-range numbers — to a level. */
export function toConnectionQualityLevel(value: number | 'unknown' | null | undefined): ConnectionQualityLevel {
  if (value === 'unknown' || value == null || !Number.isFinite(value)) return 'unknown';
  const rounded = Math.min(CONNECTION_BARS, Math.max(0, Math.round(value)));
  return rounded as ConnectionQualityLevel;
}

// ---- the call clock --------------------------------------------------------

/** A call clock ticks once a second; anything faster shows the same digits. */
export const CALL_TICK_MS = 1000;

export interface UseCallElapsedOptions {
  /** Controlled elapsed seconds. Wins over `startedAt` for a host that owns the clock. */
  seconds?: number;
  /** Epoch milliseconds the call (or recording) started. */
  startedAt?: number;
  /** Stops the clock when false — a held call freezes rather than keeps counting. */
  running?: boolean;
  /** Clock source, injectable so tests do not have to wait in real time. */
  now?: () => number;
}

/**
 * Elapsed whole seconds, ticking once a second while running.
 *
 * Shared because "how long has this call been up" is one answer, and a timer
 * that rounded differently per platform would show two durations for one call.
 * Whole seconds only: the readout renders m:ss, so a sub-second value would
 * re-render for nothing.
 */
export function useCallElapsed({
  seconds,
  startedAt,
  running = true,
  now = Date.now,
}: UseCallElapsedOptions): number {
  const controlled = seconds !== undefined;
  const nowRef = useRef(now);
  nowRef.current = now;

  const elapsedFrom = (start: number) => Math.max(0, Math.floor((nowRef.current() - start) / 1000));

  const [ticked, setTicked] = useState(() => (startedAt === undefined ? 0 : elapsedFrom(startedAt)));

  useEffect(() => {
    if (controlled || startedAt === undefined) return;
    // Re-sync immediately: mounting mid-call, or resuming from hold, must not
    // wait a whole second to show the right time.
    setTicked(elapsedFrom(startedAt));
    if (!running) return;
    const id = setInterval(() => setTicked(elapsedFrom(startedAt)), CALL_TICK_MS);
    return () => clearInterval(id);
    // elapsedFrom closes over nowRef, which is a ref: stable across renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlled, startedAt, running]);

  if (controlled) return Math.max(0, Math.floor(seconds));
  return ticked;
}

// ---- recording -------------------------------------------------------------

/** What a recording indicator is doing right now. */
export type RecordingState = 'recording' | 'paused' | 'stopped';

/** Resolves the two booleans a host holds into the one state both bindings paint from. */
export function recordingState(recording: boolean, paused: boolean): RecordingState {
  if (!recording) return 'stopped';
  return paused ? 'paused' : 'recording';
}

/**
 * Whether the dot should pulse. Only a live recording pulses, and only when the
 * user has not asked for less motion — a halo looping for the length of a
 * meeting is exactly what that setting exists to stop. The label carries the
 * state either way, so nothing is lost when the motion is.
 */
export function shouldPulse(state: RecordingState, reduceMotion: boolean): boolean {
  return state === 'recording' && !reduceMotion;
}
