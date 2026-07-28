import { describe, expect, it } from 'vitest';
import {
  CONNECTION_BARS,
  callControlGlyph,
  callControlState,
  connectionBarHeights,
  connectionBarsFilled,
  connectionQualityTone,
  micRing,
  micRingGeometry,
  recordingState,
  shouldPulse,
  toConnectionQualityLevel,
} from '../src/call-controls.ts';

/**
 * These hold the decisions a call control makes that are NOT pixels. Every one
 * of them is a place the DOM and native bindings would otherwise each guess, and
 * the first — what a mute button's engaged state means — is the one that decides
 * whether the user can tell they are being heard.
 */

describe('callControlState', () => {
  it('leaves an untouched control idle whatever it means', () => {
    expect(callControlState(false, 'enables')).toBe('idle');
    expect(callControlState(false, 'suppresses')).toBe('idle');
  });

  it('paints an enabled feature as engaged: reassuring', () => {
    expect(callControlState(true, 'enables')).toBe('engaged');
  });

  it('paints a SUPPRESSING toggle as danger when it is on', () => {
    // The inverse of every other toggle in the kit, and the whole point of the
    // component: muted is the alarming state, not the "off" one.
    expect(callControlState(true, 'suppresses')).toBe('danger');
  });

  it('defaults to the enabling sense, so a plain toggle behaves normally', () => {
    expect(callControlState(true)).toBe('engaged');
  });
});

describe('callControlGlyph', () => {
  it('reads the glyph size out of the spec rather than restating it', () => {
    expect(callControlGlyph('md')).toBe(20);
    expect(callControlGlyph('lg')).toBe(24);
  });
});

describe('micRingGeometry', () => {
  it('rests at the disc edge in silence', () => {
    expect(micRingGeometry(0)).toEqual({ scale: micRing.minScale, opacity: micRing.minOpacity });
  });

  it('reaches its full swell at full level', () => {
    expect(micRingGeometry(1)).toEqual({ scale: micRing.maxScale, opacity: micRing.maxOpacity });
  });

  it('grows monotonically, so a louder voice is never a smaller ring', () => {
    const steps = [0, 0.25, 0.5, 0.75, 1].map((l) => micRingGeometry(l).scale);
    for (let i = 1; i < steps.length; i += 1) expect(steps[i]!).toBeGreaterThan(steps[i - 1]!);
  });

  it('settles at rest for out-of-range and non-finite levels', () => {
    expect(micRingGeometry(-1).scale).toBe(micRing.minScale);
    expect(micRingGeometry(4).scale).toBe(micRing.maxScale);
    expect(micRingGeometry(Number.NaN).scale).toBe(micRing.minScale);
  });
});

describe('connectionQualityTone', () => {
  it('grades a failing link as danger at one bar, not just at zero', () => {
    expect(connectionQualityTone(0)).toBe('danger');
    expect(connectionQualityTone(1)).toBe('danger');
  });

  it('warns at two and calls three and four healthy', () => {
    expect(connectionQualityTone(2)).toBe('warning');
    expect(connectionQualityTone(3)).toBe('success');
    expect(connectionQualityTone(4)).toBe('success');
  });

  it('keeps unknown neutral rather than grading it as bad', () => {
    // "Not measured" and "about to drop" lead to opposite decisions.
    expect(connectionQualityTone('unknown')).toBe('neutral');
  });
});

describe('connectionBarsFilled', () => {
  it('fills one bar per level', () => {
    expect([0, 1, 2, 3, 4].map((l) => connectionBarsFilled(l as 0))).toEqual([0, 1, 2, 3, 4]);
  });

  it('fills none for unknown, which is not the same as level zero', () => {
    expect(connectionBarsFilled('unknown')).toBe(0);
    expect(connectionQualityTone('unknown')).not.toBe(connectionQualityTone(0));
  });

  it('has one bar per step of the ramp', () => {
    expect(connectionBarHeights).toHaveLength(CONNECTION_BARS);
  });

  it('steps the bar heights upward, so it cannot be mistaken for a Meter', () => {
    for (let i = 1; i < connectionBarHeights.length; i += 1)
      expect(connectionBarHeights[i]!).toBeGreaterThan(connectionBarHeights[i - 1]!);
  });
});

describe('toConnectionQualityLevel', () => {
  it('passes a real measurement through', () => {
    expect(toConnectionQualityLevel(3)).toBe(3);
  });

  it('reads a missing or unmeasurable value as unknown, never as zero', () => {
    expect(toConnectionQualityLevel(null)).toBe('unknown');
    expect(toConnectionQualityLevel(undefined)).toBe('unknown');
    expect(toConnectionQualityLevel(Number.NaN)).toBe('unknown');
    expect(toConnectionQualityLevel('unknown')).toBe('unknown');
  });

  it('clamps a host that hands in nonsense rather than drawing a fifth bar', () => {
    expect(toConnectionQualityLevel(9)).toBe(4);
    expect(toConnectionQualityLevel(-2)).toBe(0);
    expect(toConnectionQualityLevel(2.4)).toBe(2);
  });
});

describe('recordingState', () => {
  it('resolves the two booleans a host holds into one state', () => {
    expect(recordingState(true, false)).toBe('recording');
    expect(recordingState(true, true)).toBe('paused');
    expect(recordingState(false, false)).toBe('stopped');
  });

  it('reads a paused-but-stopped recording as stopped', () => {
    expect(recordingState(false, true)).toBe('stopped');
  });
});

describe('shouldPulse', () => {
  it('pulses only while actually capturing', () => {
    expect(shouldPulse('recording', false)).toBe(true);
    expect(shouldPulse('paused', false)).toBe(false);
    expect(shouldPulse('stopped', false)).toBe(false);
  });

  it('holds still when the user has asked for less motion', () => {
    // A halo looping for the length of a meeting is exactly what that setting
    // exists to stop; the label still carries the state.
    expect(shouldPulse('recording', true)).toBe(false);
  });
});
