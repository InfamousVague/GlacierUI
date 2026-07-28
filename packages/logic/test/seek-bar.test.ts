import { describe, expect, it } from 'vitest';
import {
  seekBarGeometry,
  seekBarHasThumb,
  seekBarPaint,
  seekBarSkeleton,
  seekBarStroke,
  SEEK_VIEW_HEIGHT,
  SEEK_VIEW_WIDTH,
} from '../src/index.ts';
import type { SeekBarShape } from '../src/index.ts';

/**
 * The geometry is the one place the wave math lives, so these hold the
 * invariants both bindings depend on: the split at the playhead, the paint
 * order, and the bounds the paths stay inside.
 */

const SHAPES: SeekBarShape[] = ['line', 'wave', 'waveform', 'swell', 'zigzag', 'spikes', 'bars', 'mirror'];
const MID = SEEK_VIEW_HEIGHT / 2;

/** Pulls every "x y" pair out of a path string. */
function points(path: string): { x: number; y: number }[] {
  return [...path.matchAll(/(-?[\d.]+) (-?[\d.]+)/g)].map((m) => ({
    x: Number(m[1]),
    y: Number(m[2]),
  }));
}

describe('seekBarGeometry', () => {
  it.each(SHAPES)('%s splits the track at the playhead', (shape) => {
    const { playedPath, aheadPath } = seekBarGeometry({ shape, progress: 0.5 });
    expect(playedPath).not.toBe('');
    expect(aheadPath).not.toBe('');
    // nothing painted as "played" may sit past the playhead, and nothing
    // painted as "ahead" may sit before it
    const cut = 0.5 * SEEK_VIEW_WIDTH;
    expect(Math.max(...points(playedPath).map((p) => p.x))).toBeLessThanOrEqual(cut + 0.01);
    expect(Math.min(...points(aheadPath).map((p) => p.x))).toBeGreaterThanOrEqual(cut - 0.01);
  });

  it.each(SHAPES)('%s leaves the played run empty at the start', (shape) => {
    expect(seekBarGeometry({ shape, progress: 0 }).playedPath).toBe('');
  });

  it.each(SHAPES)('%s leaves the ahead run empty at the end', (shape) => {
    expect(seekBarGeometry({ shape, progress: 1 }).aheadPath).toBe('');
  });

  it.each(SHAPES)('%s stays inside the viewBox', (shape) => {
    const levels = [0, 0.5, 1, 0.25, 1];
    const g = seekBarGeometry({ shape, progress: 0.6, levels });
    for (const { x, y } of [...points(g.playedPath), ...points(g.aheadPath)]) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(SEEK_VIEW_WIDTH);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(SEEK_VIEW_HEIGHT);
    }
  });

  it.each(SHAPES)('%s still paints when handed a non-finite progress', (shape) => {
    // A host platform that reports a bad pointer coordinate (react-native-web's
    // press event carries no locationX) used to divide its way to NaN, which
    // flowed into the path strings and blanked the whole control. Progress that
    // is not a number must read as "no progress", never as "no painting".
    for (const bad of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      const g = seekBarGeometry({ shape, progress: bad, levels: [0.5, 1] });
      expect(`${g.playedPath}${g.aheadPath}`).not.toContain('NaN');
      // the bar is still drawn: everything is still ahead of the playhead
      expect(g.aheadPath).not.toBe('');
    }
  });

  it('clamps progress outside 0..1', () => {
    expect(seekBarGeometry({ shape: 'wave', progress: -2 }).playedPath).toBe('');
    expect(seekBarGeometry({ shape: 'wave', progress: 5 }).aheadPath).toBe('');
  });

  it('keeps the line shape flat on the centerline', () => {
    const g = seekBarGeometry({ shape: 'line', progress: 0.4 });
    for (const p of [...points(g.playedPath), ...points(g.aheadPath)]) {
      expect(p.y).toBe(MID);
    }
  });

  it('makes the wave deflect off the centerline but settle flat ahead', () => {
    const { playedPath, aheadPath } = seekBarGeometry({ shape: 'wave', progress: 0.5 });
    // the squiggle is what has been heard...
    expect(points(playedPath).some((p) => Math.abs(p.y - MID) > 1)).toBe(true);
    // ...and the rail ahead of the playhead is flat
    expect(points(aheadPath).every((p) => p.y === MID)).toBe(true);
  });

  it('keeps drawing levels ahead of the playhead for the waveform shape', () => {
    const { aheadPath } = seekBarGeometry({
      shape: 'waveform',
      progress: 0.5,
      levels: [1, 1, 1, 1, 1],
    });
    expect(points(aheadPath).some((p) => Math.abs(p.y - MID) > 1)).toBe(true);
  });

  it('swells the waveform with louder levels', () => {
    const spread = (levels: number[]): number => {
      const ys = points(seekBarGeometry({ shape: 'waveform', progress: 1, levels }).playedPath).map(
        (p) => p.y,
      );
      return Math.max(...ys) - Math.min(...ys);
    };
    expect(spread([1, 1, 1])).toBeGreaterThan(spread([0.2, 0.2, 0.2]));
  });

  it('falls back to an even wave when the waveform has no levels', () => {
    expect(seekBarGeometry({ shape: 'waveform', progress: 1 }).playedPath).toBe(
      seekBarGeometry({ shape: 'wave', progress: 1 }).playedPath,
    );
  });

  it('draws one bar per level, split across the playhead', () => {
    const levels = [0.2, 0.4, 0.6, 0.8];
    const g = seekBarGeometry({ shape: 'bars', progress: 0.5, levels });
    // each bar is one M/L pair, so two points per bar
    expect(points(g.playedPath)).toHaveLength(4);
    expect(points(g.aheadPath)).toHaveLength(4);
  });

  it('stands bars on the baseline and centers mirrored bars', () => {
    const levels = [1];
    const bars = points(seekBarGeometry({ shape: 'bars', progress: 1, levels }).playedPath);
    const mirror = points(seekBarGeometry({ shape: 'mirror', progress: 1, levels }).playedPath);
    expect(Math.max(...bars.map((p) => p.y))).toBe(SEEK_VIEW_HEIGHT);
    // a full-height mirrored bar is symmetric about the centerline
    expect(Math.min(...mirror.map((p) => p.y)) + Math.max(...mirror.map((p) => p.y))).toBe(
      SEEK_VIEW_HEIGHT,
    );
  });

  it('still marks silence with a minimum bar', () => {
    const g = seekBarGeometry({ shape: 'bars', progress: 1, levels: [0], minBarHeight: 4 });
    const ys = points(g.playedPath).map((p) => p.y);
    expect(Math.max(...ys) - Math.min(...ys)).toBe(4);
  });

  it('is pure: the same inputs give the same paths', () => {
    const options = { shape: 'waveform' as const, progress: 0.33, levels: [0.1, 0.9, 0.5] };
    expect(seekBarGeometry(options)).toEqual(seekBarGeometry(options));
  });

  it('draws the sharp shapes from corners, not dense samples', () => {
    const cut = 0.5;
    const smooth = points(seekBarGeometry({ shape: 'wave', progress: cut }).playedPath).length;
    const sharp = points(seekBarGeometry({ shape: 'zigzag', progress: cut }).playedPath).length;
    // the triangle is a handful of vertices where the sine is ~100 samples
    expect(sharp).toBeLessThan(smooth / 4);
  });

  it('reaches full amplitude at the zigzag corners', () => {
    const amplitude = 18;
    const ys = points(seekBarGeometry({ shape: 'zigzag', progress: 1, amplitude }).playedPath).map(
      (p) => p.y,
    );
    // the corners sit exactly on the peaks, so the extremes are the amplitude
    expect(Math.min(...ys)).toBeCloseTo(MID - amplitude, 5);
    expect(Math.max(...ys)).toBeCloseTo(MID + amplitude, 5);
  });

  it('spikes follow the levels where zigzag stays even', () => {
    const levels = [1, 0.15, 1];
    // every zigzag corner reaches the same height; a spike's corner is only as
    // tall as the passage under it, so the set of corner heights has more than
    // one member (comparing overall spread would not tell them apart — loud
    // levels at both ends reach full amplitude either way)
    const cornerHeights = (shape: SeekBarShape): Set<number> =>
      new Set(
        points(seekBarGeometry({ shape, progress: 1, levels }).playedPath)
          .map((p) => Math.round(Math.abs(p.y - MID)))
          .filter((d) => d > 0),
      );
    expect(cornerHeights('zigzag').size).toBe(1);
    expect(cornerHeights('spikes').size).toBeGreaterThan(1);
    // ...and a uniformly quiet passage pulls the spikes toward the centerline
    const quiet = seekBarGeometry({ shape: 'spikes', progress: 1, levels: [0.05] });
    expect(Math.max(...points(quiet.playedPath).map((p) => Math.abs(p.y - MID)))).toBeLessThan(3);
  });

  it('builds the swell from flat to full height at the playhead', () => {
    const amplitude = 18;
    const progress = 0.6;
    const { playedPath, aheadPath } = seekBarGeometry({ shape: 'swell', progress, amplitude });
    const played = points(playedPath);
    const deflection = (p: { x: number; y: number }) => Math.abs(p.y - MID);

    // it starts flat...
    expect(deflection(played[0]!)).toBeLessThan(0.5);
    // ...and reaches full height by the playhead
    const cut = progress * SEEK_VIEW_WIDTH;
    const nearCut = played.filter((p) => p.x > cut * 0.9);
    expect(Math.max(...nearCut.map(deflection))).toBeGreaterThan(amplitude * 0.85);
    // never past it
    expect(Math.max(...played.map(deflection))).toBeLessThanOrEqual(amplitude + 0.01);

    // and the run ahead of the playhead is a flat bar
    expect(points(aheadPath).every((p) => p.y === MID)).toBe(true);
  });

  it('grows the swell monotonically, so it reads as a build', () => {
    const played = points(seekBarGeometry({ shape: 'swell', progress: 1 }).playedPath);
    // compare the peak deflection of the first and last thirds
    const peak = (from: number, to: number) =>
      Math.max(
        ...played
          .filter((p) => p.x >= from && p.x <= to)
          .map((p) => Math.abs(p.y - MID)),
      );
    expect(peak(0, 33)).toBeLessThan(peak(34, 66));
    expect(peak(34, 66)).toBeLessThan(peak(67, 100));
  });

  it('falls back to an even zigzag when spikes have no levels', () => {
    expect(seekBarGeometry({ shape: 'spikes', progress: 1 }).playedPath).toBe(
      seekBarGeometry({ shape: 'zigzag', progress: 1 }).playedPath,
    );
  });
});

describe('seekBarStroke', () => {
  it('butts the level marks so an equalizer reads flat-topped', () => {
    expect(seekBarStroke('bars')).toEqual({ cap: 'butt', weight: 'bar' });
    expect(seekBarStroke('mirror')).toEqual({ cap: 'butt', weight: 'bar' });
  });

  it('rounds the wave runs', () => {
    for (const shape of ['line', 'wave', 'waveform', 'swell', 'zigzag', 'spikes'] as SeekBarShape[]) {
      expect(seekBarStroke(shape)).toEqual({ cap: 'round', weight: 'rail' });
    }
  });

});

describe('seekBarHasThumb', () => {
  it('drops the thumb on the mark shapes, whose comb already breaks at the playhead', () => {
    for (const shape of ['bars', 'mirror'] as SeekBarShape[]) {
      expect(seekBarHasThumb(shape)).toBe(false);
    }
  });

  it('keeps the thumb on the continuous shapes, which have no such break', () => {
    for (const shape of ['line', 'wave', 'waveform', 'swell', 'zigzag', 'spikes'] as SeekBarShape[]) {
      expect(seekBarHasThumb(shape)).toBe(true);
    }
  });

  it('covers every shape', () => {
    expect(SHAPES.filter(seekBarHasThumb)).toHaveLength(6);
  });
});

describe('seekBarPaint', () => {
  it('resolves a tone to token names, never to colour values', () => {
    // bare names: the DOM kit wraps them in var(), native in its own t()
    expect(seekBarPaint('accent')).toEqual({ from: 'accent-solid', to: 'accent-text' });
    expect(seekBarPaint('success')).toEqual({ from: 'success-solid', to: 'success-text' });
    expect(seekBarPaint('danger')).toEqual({ from: 'danger-solid', to: 'danger-text' });
  });

  it('borrows the text greys for neutral, which has no solid ramp', () => {
    expect(seekBarPaint('neutral')).toEqual({ from: 'text-subtle', to: 'text-muted' });
  });

  it('gives every tone two distinct tokens to ramp between', () => {
    for (const tone of ['accent', 'success', 'warning', 'danger', 'info', 'neutral'] as const) {
      const { from, to } = seekBarPaint(tone);
      expect(from).not.toBe(to);
      expect(from).not.toMatch(/^(var|#|rgb|oklch)/);
    }
  });
});

describe('seekBarSkeleton', () => {
  const MID_Y = SEEK_VIEW_HEIGHT / 2;

  it('gives the flat rail a squiggle, so a placeholder never reads as an empty bar', () => {
    const bone = seekBarSkeleton('line');
    expect(bone.shape).toBe('wave');
    // the placeholder draws the full run, which actually deflects off the
    // centerline — the ahead run of a wave is a flat rail by design
    const { playedPath } = seekBarGeometry({ shape: bone.shape, progress: 1, levels: bone.levels });
    expect(points(playedPath).some((p) => Math.abs(p.y - MID_Y) > 1)).toBe(true);
  });

  it('leaves every other shape its own silhouette', () => {
    for (const shape of ['wave', 'waveform', 'swell', 'zigzag', 'spikes', 'bars', 'mirror'] as SeekBarShape[]) {
      expect(seekBarSkeleton(shape).shape).toBe(shape);
    }
  });

  it('carries stand-in levels, so the level shapes are not a uniform fence', () => {
    const { levels } = seekBarSkeleton('bars');
    expect(levels.length).toBeGreaterThan(8);
    expect(new Set(levels).size).toBeGreaterThan(4);
    for (const level of levels) {
      expect(level).toBeGreaterThan(0);
      expect(level).toBeLessThanOrEqual(1);
    }
  });

  it('is deterministic, so a placeholder does not flicker between renders', () => {
    expect(seekBarSkeleton('bars')).toEqual(seekBarSkeleton('bars'));
  });

  it('sits at half progress, so both runs of the real control are shown', () => {
    const bone = seekBarSkeleton('line');
    expect(bone.progress).toBe(0.5);
    const g = seekBarGeometry({ shape: bone.shape, progress: bone.progress, levels: bone.levels });
    // textured behind the playhead...
    expect(points(g.playedPath).some((p) => Math.abs(p.y - MID_Y) > 1)).toBe(true);
    // ...flat ahead of it
    expect(points(g.aheadPath).every((p) => p.y === MID_Y)).toBe(true);
  });
});
