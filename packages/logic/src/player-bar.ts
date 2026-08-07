/**
 * Inline-player logic - the parts of a docked transport strip that are
 * arithmetic rather than pixels, shared so both bindings agree.
 *
 * The player transport itself (time formatting, the repeat cycle, the density
 * scale) already lives in `./player.ts` and is reused as-is; what a strip adds
 * is a countdown readout and a fader that has to be honest about level.
 */

import { formatDuration, playerMetrics, type PlayerDensity } from './player.ts';

/**
 * The size step the play control takes in a transport row.
 *
 * A filled disc is already read as the primary - the fill is what says so - and
 * marking one control twice makes it the loudest thing on a strip it is not the
 * subject of, so a solid play button takes the same footprint as the buttons
 * beside it. A quiet row has nothing but size to say it with, so there the play
 * control takes the bigger step.
 */
export function transportPlaySize(density: PlayerDensity, emphasis: 'solid' | 'quiet') {
  const metrics = playerMetrics(density);
  return emphasis === 'solid' ? metrics.controlSize : metrics.playSize;
}

/**
 * The density a docked strip draws its transport at, which is a step tighter
 * than the room around it.
 *
 * A strip's buttons are chrome running under the bar rather than the subject of
 * the surface they sit on, so they take the smaller step of the scale. The gaps
 * between the strip's three regions keep the density the caller asked for,
 * because that is what decides whether the strip reads as tight or as roomy -
 * the size of the buttons is not the same question.
 */
export function stripTransportDensity(density: PlayerDensity): PlayerDensity {
  return density === 'spacious' ? 'comfortable' : 'compact';
}

/**
 * The quietest the fader goes before it is simply off, in decibels.
 *
 * -60 dB is the usual floor for a listening control: it is about a thousandth
 * of full amplitude, which is inaudible over any room, and it leaves the
 * useful part of the travel - the top 20 dB, where every real adjustment
 * happens - spread across the top third of the rail rather than crammed into
 * the last few pixels.
 */
export const VOLUME_FLOOR_DB = -60;

/**
 * The gain a fader position asks for, in decibels.
 *
 * The rail is linear in decibels rather than in amplitude, because decibels are
 * what the ear is linear in: halving the number on the readout halves the
 * perceived loudness, so the same nudge of the thumb does the same thing at
 * either end of the travel. An amplitude-linear rail spends its whole lower
 * half between silence and barely-there.
 *
 * Zero is not the floor but off: a fader pulled all the way down is silent, not
 * quiet, so it returns -Infinity rather than -60. `formatGain` and
 * `volumeAmplitude` both read that as the off state.
 */
export function volumeGain(volume: number): number {
  const level = clampVolume(volume);
  if (level === 0) return -Infinity;
  const db = VOLUME_FLOOR_DB * (1 - level / 100);
  // At the top of the travel the arithmetic lands on -0, which is unity with a
  // sign on it: true of the float, false of the fader.
  return db === 0 ? 0 : db;
}

/**
 * The 0-1 multiplier a fader position asks for - what an `<audio>` element's
 * `volume`, or a Web Audio gain node, actually takes.
 *
 * Amplitude is the inverse of the decibel definition, so this and `volumeGain`
 * are two readings of one number rather than two scales that could drift.
 */
export function volumeAmplitude(volume: number): number {
  const db = volumeGain(volume);
  if (!Number.isFinite(db)) return 0;
  return 10 ** (db / 20);
}

/**
 * A gain reading, the way a mixer prints it: `0dB` at unity, `-18dB` below it,
 * and `-∞dB` when the fader is off.
 *
 * Whole decibels, because the readout is there to be glanced at - a tenth of a
 * decibel is below what anyone can hear and above what anyone can aim at.
 */
export function formatGain(db: number): string {
  if (!Number.isFinite(db)) return db > 0 ? '0dB' : '-∞dB';
  // Math.round leaves -0 for anything just under unity, which would print as
  // "0dB" with the sign silently dropped - the honest reading either way.
  const whole = Math.round(db) === 0 ? 0 : Math.round(db);
  return `${whole}dB`;
}

/**
 * What is left of a track, as a countdown: `-4:42`.
 *
 * The sign is the mode rather than the number, so it stays on through the last
 * second - a readout that dropped its minus at `0:00` would read as the total
 * suddenly appearing in the place the remainder used to be.
 */
export function formatRemaining(
  position: number,
  duration: number,
  format: (seconds: number) => string = formatDuration,
): string {
  const span = Number.isFinite(duration) ? Math.max(0, duration) : 0;
  const at = Number.isFinite(position) ? Math.min(Math.max(position, 0), span) : 0;
  return `-${format(span - at)}`;
}

function clampVolume(volume: number): number {
  if (!Number.isFinite(volume)) return 0;
  return Math.min(Math.max(volume, 0), 100);
}
