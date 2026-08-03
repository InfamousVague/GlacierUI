import { describe, expect, it } from 'vitest';
import { halftoneDataUri, halftoneDots, halftoneRamp, halftoneSvg } from '../src/halftone.ts';

/** Every dot's radius, largest first, for a field with nothing dissolved. */
function radii(options: Parameters<typeof halftoneDots>[0]) {
  return halftoneDots({ dissolve: 0, ...options })
    .map((dot) => dot.r)
    .sort((a, b) => b - a);
}

describe('halftoneRamp', () => {
  it('runs 0 at the dense end to 1 at the thin one, for every origin', () => {
    const ends: Record<string, [[number, number], [number, number]]> = {
      'top-left': [[0, 0], [1, 1]],
      'top-right': [[1, 0], [0, 1]],
      'bottom-left': [[0, 1], [1, 0]],
      'bottom-right': [[1, 1], [0, 0]],
      top: [[0.5, 0], [0.5, 1]],
      bottom: [[0.5, 1], [0.5, 0]],
      left: [[0, 0.5], [1, 0.5]],
      right: [[1, 0.5], [0, 0.5]],
    };
    for (const [origin, [dense, thin]] of Object.entries(ends)) {
      expect(halftoneRamp(dense[0], dense[1], origin as never), origin).toBeCloseTo(0, 5);
      expect(halftoneRamp(thin[0], thin[1], origin as never), origin).toBeCloseTo(1, 5);
    }
  });

  it('centre is dense in the middle and thin at the edges', () => {
    expect(halftoneRamp(0.5, 0.5, 'center')).toBeCloseTo(0, 5);
    expect(halftoneRamp(0.5, 0, 'center')).toBeCloseTo(1, 5);
    expect(halftoneRamp(0, 0.5, 'center')).toBeCloseTo(1, 5);
  });

  it('edges is the exact complement: dense at the border, thin in the middle', () => {
    expect(halftoneRamp(0.5, 0, 'edges')).toBeCloseTo(0, 5);
    expect(halftoneRamp(0, 0.5, 'edges')).toBeCloseTo(0, 5);
    expect(halftoneRamp(0.5, 0.5, 'edges')).toBeCloseTo(1, 5);
  });

  it('never leaves 0..1 anywhere in the box', () => {
    const origins = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center', 'edges', 'top', 'bottom', 'left', 'right'] as const;
    for (const origin of origins) {
      for (let i = 0; i <= 10; i += 1) {
        for (let j = 0; j <= 10; j += 1) {
          const t = halftoneRamp(i / 10, j / 10, origin);
          expect(t, `${origin} at ${i / 10},${j / 10}`).toBeGreaterThanOrEqual(0);
          expect(t, `${origin} at ${i / 10},${j / 10}`).toBeLessThanOrEqual(1);
        }
      }
    }
  });
});

describe('halftoneDots', () => {
  it('lays a full grid when nothing dissolves', () => {
    expect(halftoneDots({ cells: 10, dissolve: 0 })).toHaveLength(100);
  });

  it('keeps the grid pitch constant - only the radius rides the ramp', () => {
    const dots = halftoneDots({ cells: 8, dissolve: 0 });
    const xs = [...new Set(dots.map((dot) => Number(dot.cx.toFixed(6))))].sort((a, b) => a - b);
    const gaps = xs.slice(1).map((x, i) => x - (xs[i] as number));
    // Every column is the same distance from the next. This is the property an
    // image generator cannot hold, and the reason this module exists.
    for (const gap of gaps) expect(gap).toBeCloseTo(1 / 8, 9);
  });

  it('is inset by half a cell, so no dot is clipped by the viewBox', () => {
    const dots = halftoneDots({ cells: 12, dissolve: 0, maxRadius: 0.5 });
    for (const dot of dots) {
      expect(dot.cx - dot.r).toBeGreaterThanOrEqual(0);
      expect(dot.cy - dot.r).toBeGreaterThanOrEqual(0);
      expect(dot.cx + dot.r).toBeLessThanOrEqual(1);
      expect(dot.cy + dot.r).toBeLessThanOrEqual(1);
    }
  });

  it('shrinks from maxRadius to minRadius across the ramp', () => {
    const cells = 16;
    const step = 1 / cells;
    const all = radii({ cells, origin: 'top-left', maxRadius: 0.5, minRadius: 0.05 });
    const max = 0.5 * step;
    const min = 0.05 * step;

    // Bounded by the two limits, never equal to them: cell CENTRES are inset
    // half a cell, so no dot sits exactly at either corner and the ramp reaches
    // neither 0 nor 1. Asserting equality would be asserting the grid is
    // misaligned by half a cell, which is the bug this inset exists to avoid.
    for (const r of all) {
      expect(r).toBeLessThanOrEqual(max);
      expect(r).toBeGreaterThanOrEqual(min);
    }
    // ...and it spans most of the range rather than hovering in the middle,
    // which is what "shrinks across the ramp" actually means.
    expect(all[0]).toBeGreaterThan(min + (max - min) * 0.9);
    expect(all[all.length - 1]).toBeLessThan(min + (max - min) * 0.1);
    // Monotonic: radius is a function of the ramp alone, so sorting by radius
    // and sorting by ramp position must agree.
    const byRamp = halftoneDots({ cells, origin: 'top-left', maxRadius: 0.5, minRadius: 0.05, dissolve: 0 })
      .slice()
      .sort((a, b) => halftoneRamp(a.cx, a.cy, 'top-left') - halftoneRamp(b.cx, b.cy, 'top-left'));
    byRamp.slice(1).forEach((dot, i) => {
      expect(dot.r).toBeLessThanOrEqual((byRamp[i] as { r: number }).r + 1e-12);
    });
  });

  it('dissolves the thin end and leaves the dense end whole', () => {
    const dots = halftoneDots({ cells: 24, origin: 'top-left', dissolve: 1 });
    const dense = dots.filter((dot) => halftoneRamp(dot.cx, dot.cy, 'top-left') < 0.2);
    const thin = dots.filter((dot) => halftoneRamp(dot.cx, dot.cy, 'top-left') > 0.8);
    // The dense fifth of the ramp is a full grid; the thin fifth is nearly bare.
    expect(dense.length).toBeGreaterThan(thin.length * 5);
  });

  it('drops nothing at all when dissolve is 0, however far along the ramp', () => {
    expect(halftoneDots({ cells: 20, dissolve: 0 })).toHaveLength(400);
  });

  it('is deterministic - same options, same field', () => {
    const a = halftoneDots({ cells: 20, seed: 7 });
    const b = halftoneDots({ cells: 20, seed: 7 });
    expect(a).toEqual(b);
  });

  it('reshuffles on a new seed without changing the count much', () => {
    const a = halftoneDots({ cells: 32, seed: 1 });
    const b = halftoneDots({ cells: 32, seed: 2 });
    expect(a).not.toEqual(b);
    // Same ramp, so the same rough number survive - only WHICH ones changes.
    expect(Math.abs(a.length - b.length) / a.length).toBeLessThan(0.15);
  });

  it('mirrors: a corner field is its opposite corner reflected', () => {
    const tl = halftoneDots({ cells: 16, origin: 'top-left', dissolve: 0 });
    const tr = halftoneDots({ cells: 16, origin: 'top-right', dissolve: 0 });
    const flipped = tr.map((dot) => ({ ...dot, cx: 1 - dot.cx })).sort((a, b) => a.cy - b.cy || a.cx - b.cx);
    const sorted = tl.slice().sort((a, b) => a.cy - b.cy || a.cx - b.cx);
    sorted.forEach((dot, i) => {
      expect(dot.r).toBeCloseTo((flipped[i] as { r: number }).r, 9);
    });
  });
});

describe('halftoneSvg', () => {
  it('is a well-formed square document with a background and the dots', () => {
    const svg = halftoneSvg({ cells: 6, size: 100, dissolve: 0 });
    expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"')).toBe(true);
    expect(svg.endsWith('</svg>')).toBe(true);
    expect(svg).toContain('<rect width="100" height="100" fill="#000"/>');
    expect((svg.match(/<circle /g) ?? []).length).toBe(36);
  });

  it('defaults to the polarity a luminance mask reads: white on black', () => {
    const svg = halftoneSvg({ cells: 4 });
    expect(svg).toContain('fill="#000"');
    expect(svg).toContain('<g fill="#fff">');
  });

  it('emits nothing for dissolved dots rather than zero-radius circles', () => {
    const kept = halftoneDots({ cells: 30, seed: 3 }).length;
    const svg = halftoneSvg({ cells: 30, seed: 3 });
    expect((svg.match(/<circle /g) ?? []).length).toBe(kept);
    expect(svg).not.toContain('r="0"');
  });
});

describe('halftoneDataUri', () => {
  it('encodes the hash, or the colour would end the URL', () => {
    const uri = halftoneDataUri({ cells: 4 });
    expect(uri.startsWith('url("data:image/svg+xml,')).toBe(true);
    expect(uri.endsWith('")')).toBe(true);
    // A bare # inside a data URI is a fragment marker: everything after it is
    // dropped, so the mask would be a background rect and no dots.
    expect(uri.slice('url("data:image/svg+xml,'.length)).not.toContain('#');
    expect(uri).toContain('%23fff');
  });

  it('round-trips back to the SVG it was made from', () => {
    const options = { cells: 8, seed: 5 };
    expect(decodeURIComponent(halftoneDataUri(options).slice('url("data:image/svg+xml,'.length, -2))).toBe(
      halftoneSvg(options),
    );
  });
});
