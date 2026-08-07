import { describe, expect, it } from 'vitest';
import {
  formatGain,
  formatRemaining,
  transportPlaySize,
  volumeAmplitude,
  volumeGain,
  VOLUME_FLOOR_DB,
} from '../src/player-bar.ts';
import { playerMetrics } from '../src/player.ts';

describe('volumeGain', () => {
  it('puts unity at the top of the travel and the floor just above the bottom', () => {
    expect(volumeGain(100)).toBe(0);
    expect(volumeGain(1)).toBeCloseTo(VOLUME_FLOOR_DB * 0.99, 10);
  });

  it('is linear in decibels, so the same nudge does the same thing anywhere on the rail', () => {
    // ten percent of the travel is a tenth of the range wherever it is taken
    const step = VOLUME_FLOOR_DB / 10;
    expect(volumeGain(80) - volumeGain(90)).toBeCloseTo(step, 10);
    expect(volumeGain(20) - volumeGain(30)).toBeCloseTo(step, 10);
  });

  it('reads the bottom of the rail as off rather than as the floor', () => {
    // a fader pulled all the way down is silent, not quiet
    expect(volumeGain(0)).toBe(-Infinity);
    expect(volumeAmplitude(0)).toBe(0);
  });

  it('holds anything out of range, or not a number at all, to the rail', () => {
    expect(volumeGain(140)).toBe(0);
    expect(volumeGain(-20)).toBe(-Infinity);
    expect(volumeGain(Number.NaN)).toBe(-Infinity);
  });
});

describe('volumeAmplitude', () => {
  it('is the same number the gain is, read as a multiplier', () => {
    expect(volumeAmplitude(100)).toBeCloseTo(1, 10);
    // -6 dB is half the amplitude, by definition
    expect(volumeAmplitude(90)).toBeCloseTo(10 ** (volumeGain(90) / 20), 10);
    expect(volumeAmplitude(50)).toBeCloseTo(10 ** (VOLUME_FLOOR_DB / 40), 10);
  });

  it('stays inside the range an audio element will take', () => {
    for (const v of [0, 1, 33, 70, 99, 100]) {
      expect(volumeAmplitude(v)).toBeGreaterThanOrEqual(0);
      expect(volumeAmplitude(v)).toBeLessThanOrEqual(1);
    }
  });
});

describe('formatGain', () => {
  it('prints whole decibels, the way a mixer does', () => {
    expect(formatGain(0)).toBe('0dB');
    expect(formatGain(-18)).toBe('-18dB');
    expect(formatGain(-17.6)).toBe('-18dB');
  });

  it('never prints a signed zero', () => {
    // Math.round(-0.4) is -0, which would otherwise reach the string
    expect(formatGain(-0.4)).toBe('0dB');
  });

  it('names silence rather than printing a number for it', () => {
    expect(formatGain(-Infinity)).toBe('-∞dB');
    expect(formatGain(volumeGain(0))).toBe('-∞dB');
  });

  it('reads seventy percent of the travel as -18dB', () => {
    // the reading in the reference strip this component was drawn from
    expect(formatGain(volumeGain(70))).toBe('-18dB');
  });
});

describe('formatRemaining', () => {
  it('counts down rather than up', () => {
    expect(formatRemaining(19, 301)).toBe('-4:42');
  });

  it('keeps the sign at the end, since it names the mode and not the number', () => {
    // dropping it would read as the total appearing where the remainder was
    expect(formatRemaining(301, 301)).toBe('-0:00');
  });

  it('never runs past either end of the track', () => {
    expect(formatRemaining(-40, 301)).toBe('-5:01');
    expect(formatRemaining(9999, 301)).toBe('-0:00');
    expect(formatRemaining(Number.NaN, Number.NaN)).toBe('-0:00');
  });

  it("takes the caller's formatter, so a card and its strip read one clock", () => {
    expect(formatRemaining(19, 301, (s) => `${s}s`)).toBe('-282s');
  });
});

describe('transportPlaySize', () => {
  it('marks a solid play control once, by its fill rather than also by its size', () => {
    for (const density of ['compact', 'comfortable', 'spacious'] as const) {
      expect(transportPlaySize(density, 'solid')).toBe(playerMetrics(density).controlSize);
    }
  });

  it('gives a quiet one the bigger step, since size is all it has to say it with', () => {
    for (const density of ['compact', 'comfortable', 'spacious'] as const) {
      expect(transportPlaySize(density, 'quiet')).toBe(playerMetrics(density).playSize);
    }
  });
});
