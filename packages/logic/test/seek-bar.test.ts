import { describe, expect, it } from 'vitest';
import {
  seekBarGeometry,
  seekBarHasThumb,
  seekBarPaint,
  seekBarSkeleton,
  seekBarStroke,
  SEEK_DEFAULT_INTENSITY,
  SEEK_MAX_INTENSITY,
  SEEK_VIEW_HEIGHT,
  SEEK_VIEW_WIDTH,
} from '../src/index.ts';
import type { SeekBarBeat, SeekBarShape } from '../src/index.ts';

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
    // one member (comparing overall spread would not tell them apart - loud
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

describe('seekBarGeometry with a beat', () => {
  /** Peak deflection off the centerline over a run, optionally within a window. */
  const peak = (path: string, from = 0, to = SEEK_VIEW_WIDTH): number =>
    Math.max(
      0,
      ...points(path)
        .filter((p) => p.x >= from && p.x <= to)
        .map((p) => Math.abs(p.y - MID)),
    );

  const swell = (beat?: SeekBarBeat) =>
    seekBarGeometry({ shape: 'swell', progress: 1, beat }).playedPath;

  it('changes nothing when the beat is at rest', () => {
    expect(swell({ pulse: 0, ripples: [] })).toBe(swell());
  });

  it('swells the whole run with the pulse', () => {
    expect(peak(swell({ pulse: 1, ripples: [] }))).toBeGreaterThan(peak(swell()));
  });

  it('lifts the run where a beat landed, and leaves the rest of it alone', () => {
    const beat: SeekBarBeat = { pulse: 0, ripples: [{ at: 0.5, age: 0, strength: 1 }] };
    const path = swell(beat);
    // the crest starts on the spot the beat was heard...
    expect(peak(path, 45, 55)).toBeGreaterThan(peak(swell(), 45, 55));
    // ...and a bar-width away nothing has moved yet
    expect(peak(path, 0, 10)).toBeCloseTo(peak(swell(), 0, 10), 5);
  });

  it('travels the crest outward as the beat ages', () => {
    const rested = points(swell());
    /** How far from where it landed the beat has lifted the run furthest. */
    const crestDistance = (age: number) => {
      const path = points(swell({ pulse: 0, ripples: [{ at: 0.5, age, strength: 1 }] }));
      return path.reduce(
        (best, p, i) => {
          const lift = Math.abs(p.y - MID) - Math.abs(rested[i]!.y - MID);
          return lift > best.lift ? { at: Math.abs(p.x - 50), lift } : best;
        },
        { at: 0, lift: 0 },
      ).at;
    };
    expect(crestDistance(0.6)).toBeGreaterThan(crestDistance(0.1));
  });

  it('keeps the beat inside the viewBox, however hard it hits', () => {
    const hammered: SeekBarBeat = {
      pulse: 1,
      ripples: Array.from({ length: 8 }, (_unused, i) => ({ at: i / 8, age: 0, strength: 1 })),
    };
    for (const shape of SHAPES) {
      const g = seekBarGeometry({ shape, progress: 0.6, levels: [1, 1, 1, 1], beat: hammered });
      for (const { y } of [...points(g.playedPath), ...points(g.aheadPath)]) {
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y).toBeLessThanOrEqual(SEEK_VIEW_HEIGHT);
      }
    }
  });

  it('leaves the plain rail plain', () => {
    const beat: SeekBarBeat = { pulse: 1, ripples: [{ at: 0.5, age: 0.2, strength: 1 }] };
    const g = seekBarGeometry({ shape: 'line', progress: 0.5, beat });
    expect(points(g.playedPath).every((p) => p.y === MID)).toBe(true);
  });

  it('grows the level marks with the pulse too', () => {
    const levels = [0.3, 0.3, 0.3, 0.3];
    const height = (beat?: SeekBarBeat) =>
      peak(seekBarGeometry({ shape: 'mirror', progress: 1, levels, beat }).playedPath);
    expect(height({ pulse: 1, ripples: [] })).toBeGreaterThan(height());
  });

  it('ignores a beat whose numbers are nonsense rather than blanking the bar', () => {
    const rubbish: SeekBarBeat = {
      pulse: Number.NaN,
      ripples: [{ at: Number.NaN, age: Number.POSITIVE_INFINITY, strength: Number.NaN }],
    };
    const path = swell(rubbish);
    expect(path).not.toContain('NaN');
  });
});

describe('seekBarGeometry intensity', () => {
  const HIT: SeekBarBeat = { pulse: 0.8, ripples: [{ at: 0.5, age: 0.2, strength: 1 }] };

  /** Peak deflection off the centerline of a swell struck by the same beat. */
  const struck = (intensity?: number): number =>
    Math.max(
      0,
      ...points(seekBarGeometry({ shape: 'swell', progress: 1, beat: HIT, intensity }).playedPath).map(
        (p) => Math.abs(p.y - MID),
      ),
    );

  const rested = () =>
    seekBarGeometry({ shape: 'swell', progress: 1, intensity: 2 }).playedPath;

  it('defaults to SEEK_DEFAULT_INTENSITY, the tuned baseline', () => {
    expect(struck(SEEK_DEFAULT_INTENSITY)).toBe(struck());
    expect(SEEK_DEFAULT_INTENSITY).toBeGreaterThan(0);
    expect(SEEK_DEFAULT_INTENSITY).toBeLessThan(SEEK_MAX_INTENSITY);
  });

  it('holds the bar still at zero, without the caller stopping the beat', () => {
    expect(seekBarGeometry({ shape: 'swell', progress: 1, beat: HIT, intensity: 0 }).playedPath).toBe(
      seekBarGeometry({ shape: 'swell', progress: 1 }).playedPath,
    );
  });

  it('deforms further the higher it is set', () => {
    expect(struck(2)).toBeGreaterThan(struck(1));
    expect(struck(1)).toBeGreaterThan(struck(0.5));
    expect(struck(0.5)).toBeGreaterThan(struck(0));
  });

  it('does nothing at all without a beat to scale', () => {
    expect(rested()).toBe(seekBarGeometry({ shape: 'swell', progress: 1 }).playedPath);
  });

  it('scales the level marks by the same knob', () => {
    const levels = [0.3, 0.3, 0.3, 0.3];
    const height = (intensity?: number) =>
      Math.max(
        0,
        ...points(
          seekBarGeometry({ shape: 'mirror', progress: 1, levels, beat: HIT, intensity }).playedPath,
        ).map((p) => Math.abs(p.y - MID)),
      );
    expect(height(2)).toBeGreaterThan(height(1));
    expect(height(0)).toBeLessThan(height(1));
  });

  it('clamps a runaway or nonsense setting instead of painting outside the box', () => {
    for (const intensity of [1e6, -5, Number.NaN, Number.POSITIVE_INFINITY]) {
      for (const shape of SHAPES) {
        const g = seekBarGeometry({ shape, progress: 0.6, levels: [1, 1, 1, 1], beat: HIT, intensity });
        for (const { y } of [...points(g.playedPath), ...points(g.aheadPath)]) {
          expect(y).toBeGreaterThanOrEqual(0);
          expect(y).toBeLessThanOrEqual(SEEK_VIEW_HEIGHT);
        }
      }
    }
  });

  /**
   * The stroke is drawn at a fixed pixel weight however short the bar is, so a
   * wave that peaks exactly at the frame loses half its width to the clip. The
   * ceiling is what keeps it off the edge - and because it eases rather than
   * clamps, a louder hit still draws taller than a quieter one right up to it.
   */
  it('keeps the wave off the frame, and still louder for being louder', () => {
    const hammered = (strength: number): number => {
      const beat: SeekBarBeat = {
        pulse: 1,
        ripples: Array.from({ length: 6 }, (_unused, i) => ({ at: i / 5, age: 0, strength })),
      };
      return Math.max(
        0,
        ...points(
          seekBarGeometry({
            shape: 'wave',
            progress: 1,
            beat,
            intensity: SEEK_MAX_INTENSITY,
          }).playedPath,
        ).map((p) => Math.abs(p.y - MID)),
      );
    };
    expect(hammered(1)).toBeLessThan(MID - 5);
    expect(hammered(1)).toBeGreaterThan(hammered(0.5));
  });

  it('stops climbing past the ceiling, so a huge number is the same bar as the maximum', () => {
    expect(struck(1e6)).toBe(struck(SEEK_MAX_INTENSITY));
  });

  /**
   * The same hit is worth more the further along the bar it lands - the tail is
   * where the playhead ends up - but the very edge pulls back, because a crest
   * still growing when it runs out of bar gets sheared off by the frame.
   */
  describe('along the bar', () => {
    /** How far a hit at this point lifts the run above where it rests. */
    const liftAt = (at: number): number => {
      const beat: SeekBarBeat = { pulse: 0, ripples: [{ at, age: 0, strength: 1 }] };
      const window: [number, number] = [at * SEEK_VIEW_WIDTH - 4, at * SEEK_VIEW_WIDTH + 4];
      const of = (b?: SeekBarBeat) =>
        Math.max(
          0,
          ...points(seekBarGeometry({ shape: 'swell', progress: 1, beat: b }).playedPath)
            .filter((p) => p.x >= window[0] && p.x <= window[1])
            .map((p) => Math.abs(p.y - MID)),
        );
      return of(beat) - of();
    };

    it('holds an even hand over the first stretch', () => {
      // not exact: the run is sampled on a fixed grid, so which part of the
      // crest a point lands on wobbles a little from place to place. What
      // matters is that nothing is being amplified yet.
      expect(Math.abs(liftAt(0.5) - liftAt(0.2)) / liftAt(0.2)).toBeLessThan(0.1);
    });

    it('builds through the tail', () => {
      expect(liftAt(0.75)).toBeGreaterThan(liftAt(0.5) * 1.2);
    });

    it('tops out well short of the edge, so the crest has room to resolve', () => {
      expect(liftAt(0.78)).toBeGreaterThan(liftAt(0.9));
      expect(liftAt(0.9)).toBeGreaterThan(liftAt(1));
    });

    it('settles into the edge rather than being sheared off by it', () => {
      expect(liftAt(1)).toBeLessThan(liftAt(0.9));
      // and lands under the baseline, so the last crest resolves inside the frame
      expect(liftAt(1)).toBeLessThan(liftAt(0.5));
    });
  });
});

describe('seekBarGeometry tracer', () => {
  const BEAT: SeekBarBeat = { pulse: 0.9, ripples: [{ at: 0.4, age: 0.5, strength: 1 }] };

  it('is off unless asked for', () => {
    expect(seekBarGeometry({ shape: 'swell', progress: 1, beat: BEAT }).tracerPath).toBeUndefined();
  });

  it('trails the played run instead of repeating it', () => {
    const g = seekBarGeometry({ shape: 'swell', progress: 1, beat: BEAT, tracer: true });
    expect(g.tracerPath).toBeTruthy();
    expect(g.tracerPath).not.toBe(g.playedPath);
  });

  it('lags the beat, so its crest sits behind the bar it shadows', () => {
    const g = seekBarGeometry({ shape: 'swell', progress: 1, beat: BEAT, tracer: true });
    const rested = points(seekBarGeometry({ shape: 'swell', progress: 1 }).playedPath);
    /** Distance from the hit to where a run has been lifted furthest. */
    const crest = (path: string) =>
      points(path).reduce(
        (best, p, i) => {
          const lift = Math.abs(p.y - MID) - Math.abs(rested[i]!.y - MID);
          return lift > best.lift ? { at: Math.abs(p.x - 40), lift } : best;
        },
        { at: 0, lift: 0 },
      ).at;
    expect(crest(g.tracerPath!)).toBeLessThan(crest(g.playedPath));
  });

  it('has nothing to shadow without a beat, or on the plain rail', () => {
    expect(seekBarGeometry({ shape: 'swell', progress: 1, tracer: true }).tracerPath).toBeUndefined();
    expect(
      seekBarGeometry({ shape: 'line', progress: 0.5, beat: BEAT, tracer: true }).tracerPath,
    ).toBeUndefined();
    expect(
      seekBarGeometry({ shape: 'swell', progress: 1, beat: BEAT, tracer: true, intensity: 0 })
        .tracerPath,
    ).toBeUndefined();
  });

  it('drops a hit too new to have happened yet, rather than drawing it early', () => {
    const shadow = (beat: SeekBarBeat): string | undefined =>
      seekBarGeometry({ shape: 'swell', progress: 1, beat, tracer: true }).tracerPath;
    // the hit throws the shadow out to full body at once, but a moment ago it
    // had not landed - so the shadow carries the swell and none of the crest,
    // drawing exactly what a beat with nothing travelling would
    expect(shadow({ pulse: 0, ripples: [{ at: 0.4, age: 0, strength: 1 }] })).toBe(
      shadow({ pulse: 1, ripples: [] }),
    );
  });

  it('lets go of its shape as the beat it trails fades', () => {
    const under = (beat: SeekBarBeat, path: 'tracerPath' | 'playedPath' = 'tracerPath'): number =>
      Math.max(
        0,
        ...points(seekBarGeometry({ shape: 'swell', progress: 1, beat, tracer: true })[path]!).map(
          (p) => Math.abs(p.y - MID),
        ),
      );
    /** Peak deflection of the shadow under a hit with this much life left. */
    const held = (age: number): number => under({ pulse: 0, ripples: [{ at: 0.4, age, strength: 1 }] });
    // just landed as far as the shadow is concerned, through to nearly spent
    expect(held(0.5)).toBeGreaterThan(held(0.7));
    expect(held(0.7)).toBeGreaterThan(held(0.9));
    // the bar it shadows never lets go of its own shape, whatever the beat does
    const spent: SeekBarBeat = { pulse: 0, ripples: [{ at: 0.4, age: 0.99, strength: 1 }] };
    expect(under(spent, 'playedPath')).toBeGreaterThan(held(0.99));
  });

  it('takes a hit at once and lets go of it late', () => {
    const spread = (beat: SeekBarBeat, path: 'tracerPath' | 'playedPath'): number =>
      Math.max(
        0,
        ...points(seekBarGeometry({ shape: 'swell', progress: 1, beat, tracer: true })[path]!).map(
          (p) => Math.abs(p.y - MID),
        ),
      );
    /** One hit, this far through its life, with the pulse already spent. */
    const hit = (age: number): SeekBarBeat => ({ pulse: 0, ripples: [{ at: 0.4, age, strength: 1 }] });
    // struck: full body on the first frame, never seen climbing into place
    expect(spread(hit(0), 'tracerPath')).toBeGreaterThan(spread(hit(0), 'playedPath'));
    // a moment on: the bar has let the hit go and the shadow is still holding it
    expect(spread(hit(0.25), 'tracerPath')).toBeGreaterThan(spread(hit(0.25), 'playedPath'));
    // and it does let go in the end, rather than standing out under a still bar
    expect(spread(hit(0.95), 'tracerPath')).toBeLessThan(spread(hit(0.95), 'playedPath'));
  });

  it('goes entirely when the music does, rather than lying under a stopped bar', () => {
    const fade = (beat: SeekBarBeat): number =>
      seekBarGeometry({ shape: 'swell', progress: 1, beat, tracer: true }).tracerFade!;
    // anything still playing keeps the shadow fully present
    expect(fade(BEAT)).toBe(1);
    expect(fade({ pulse: 0.1, ripples: [] })).toBe(1);
    // stopped: pulse eased away, last hit aged out, nothing left to shadow
    expect(fade({ pulse: 0, ripples: [] })).toBe(0);
    // and it eases off rather than cutting, so the leaving is watchable
    const dying = [0.05, 0.03, 0.015, 0.004].map((pulse) => fade({ pulse, ripples: [] }));
    for (let i = 1; i < dying.length; i += 1) expect(dying[i]!).toBeLessThan(dying[i - 1]!);
  });

  it('shadows the mark shapes too, and stays inside the viewBox', () => {
    for (const shape of SHAPES) {
      const g = seekBarGeometry({
        shape,
        progress: 0.7,
        levels: [1, 1, 1, 1],
        beat: { pulse: 1, ripples: [{ at: 0.5, age: 0.4, strength: 1 }] },
        tracer: true,
        intensity: SEEK_MAX_INTENSITY,
      });
      for (const { y } of points(g.tracerPath ?? '')) {
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y).toBeLessThanOrEqual(SEEK_VIEW_HEIGHT);
      }
    }
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
    // centerline - the ahead run of a wave is a flat rail by design
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
