import { describe, expect, it } from 'vitest';
import {
  fanBow,
  fanLean,
  fanMagnify,
  fanPlacements,
  fanSlinky,
  focusFromTrack,
  restFocus,
  slinkyOffsets,
} from '../src/card-fan.ts';

describe('slinkyOffsets', () => {
  it('spreads evenly when nothing is focused', () => {
    expect(slinkyOffsets(5, null)).toEqual([0, 0.25, 0.5, 0.75, 1]);
  });

  it('handles the degenerate counts', () => {
    expect(slinkyOffsets(0, null)).toEqual([]);
    expect(slinkyOffsets(-3, null)).toEqual([]);
    // A lone item has no track to sit along, so it sits in the middle of it.
    expect(slinkyOffsets(1, null)).toEqual([0.5]);
    expect(slinkyOffsets(1, 0)).toEqual([0.5]);
  });

  it('pins both ends whatever is focused', () => {
    // The property the whole thing exists for: the fan cannot overflow because
    // its silhouette never moves.
    for (const focus of [0, 1, 3.5, 7, 9]) {
      const offsets = slinkyOffsets(10, focus);
      expect(offsets[0]).toBeCloseTo(0, 10);
      expect(offsets[9]).toBeCloseTo(1, 10);
    }
  });

  it('never leaves the track', () => {
    for (const focus of [0, 2.5, 6]) {
      for (const offset of slinkyOffsets(7, focus)) {
        expect(offset).toBeGreaterThanOrEqual(0);
        expect(offset).toBeLessThanOrEqual(1);
      }
    }
  });

  it('keeps the order it was given', () => {
    const offsets = slinkyOffsets(12, 4);
    for (let i = 1; i < offsets.length; i += 1) {
      expect(offsets[i]!).toBeGreaterThan(offsets[i - 1]!);
    }
  });

  it('gives the focused item more room than its distant neighbours', () => {
    const offsets = slinkyOffsets(9, 4);
    const atFocus = offsets[5]! - offsets[3]!; // the span around the bulge
    const atEnd = offsets[8]! - offsets[6]!; // the same width of fan, far away
    expect(atFocus).toBeGreaterThan(atEnd);
  });

  it('moves the bulge continuously, not item by item', () => {
    // A fractional focus must land between the two integer cases, or the fan
    // would snap as the pointer crossed each item.
    const a = slinkyOffsets(9, 3)[4]!;
    const b = slinkyOffsets(9, 3.5)[4]!;
    const c = slinkyOffsets(9, 4)[4]!;
    expect(b).toBeGreaterThan(Math.min(a, c));
    expect(b).toBeLessThan(Math.max(a, c));
  });

  it('collapses to the even spread at zero gain', () => {
    // Exact in arithmetic, not in binary floating point — the pin divides by a
    // span that is only approximately 0.8.
    const offsets = slinkyOffsets(5, 2, { gain: 0 });
    [0, 0.25, 0.5, 0.75, 1].forEach((expected, i) => expect(offsets[i]!).toBeCloseTo(expected, 10));
  });

  it('bulges harder as gain rises', () => {
    const gentle = slinkyOffsets(9, 4, { gain: 1 });
    const strong = slinkyOffsets(9, 4, { gain: 4 });
    expect(strong[5]! - strong[3]!).toBeGreaterThan(gentle[5]! - gentle[3]!);
  });

  it('treats a non-finite focus as rest', () => {
    expect(slinkyOffsets(5, Number.NaN)).toEqual(slinkyOffsets(5, null));
    expect(slinkyOffsets(5, Number.POSITIVE_INFINITY)).toEqual(slinkyOffsets(5, null));
  });

  it('is symmetric about a centred focus', () => {
    const offsets = slinkyOffsets(9, 4);
    for (let i = 0; i < 4; i += 1) {
      expect(offsets[i]!).toBeCloseTo(1 - offsets[8 - i]!, 10);
    }
  });
});

describe('restFocus', () => {
  it('is the fan’s middle', () => {
    expect(restFocus(7)).toBe(3);
    expect(restFocus(8)).toBe(3.5);
    expect(restFocus(1)).toBe(0);
  });

  it('puts the density at the ends, which is the resting look', () => {
    // Centre items claim the room; the outer ones tuck in behind each other.
    const offsets = slinkyOffsets(9, restFocus(9));
    expect(offsets[5]! - offsets[4]!).toBeGreaterThan(offsets[1]! - offsets[0]!);
  });
});

describe('focusFromTrack', () => {
  it('maps a position to a fractional index', () => {
    expect(focusFromTrack(0, 100, 5)).toBe(0);
    expect(focusFromTrack(100, 100, 5)).toBe(4);
    expect(focusFromTrack(50, 100, 5)).toBe(2);
  });

  it('clamps outside the track rather than running off the ends', () => {
    expect(focusFromTrack(-40, 100, 5)).toBe(0);
    expect(focusFromTrack(400, 100, 5)).toBe(4);
  });

  it('declines a track it cannot divide', () => {
    expect(focusFromTrack(10, 0, 5)).toBeNull();
    expect(focusFromTrack(10, 100, 1)).toBeNull();
    expect(focusFromTrack(Number.NaN, 100, 5)).toBeNull();
  });
});

describe('fan geometry', () => {
  it('leans further as the fan grows, up to a cap', () => {
    expect(fanLean(2)).toBeLessThan(fanLean(6));
    expect(fanLean(40)).toBe(13);
  });

  it('bows further as the fan grows, up to a cap', () => {
    expect(fanBow(2, 132)).toBeLessThan(fanBow(6, 132));
    expect(fanBow(40, 132)).toBe(22);
  });

  it('scales the bow with the item, so the arc keeps its shape', () => {
    expect(fanBow(40, 264)).toBe(44);
    expect(fanBow(40, 66)).toBe(11);
  });

  it('widens the bulge as the fan grows', () => {
    // Forty items want the bulge over eight, not two.
    expect(fanSlinky(40).reach).toBeGreaterThan(fanSlinky(7).reach!);
  });
});

describe('fanPlacements', () => {
  it('places every item once, in order', () => {
    const placements = fanPlacements(6, null, 132);
    expect(placements).toHaveLength(6);
    for (let i = 1; i < placements.length; i += 1) {
      expect(placements[i]!.offset).toBeGreaterThan(placements[i - 1]!.offset);
    }
  });

  it('turns the ends outward and leaves the middle upright', () => {
    const placements = fanPlacements(7, null, 132);
    expect(placements[0]!.rotate).toBeLessThan(0);
    expect(placements[6]!.rotate).toBeGreaterThan(0);
    expect(placements[3]!.rotate).toBeCloseTo(0, 6);
  });

  it('drops the ends below the middle, which is the arc', () => {
    const placements = fanPlacements(7, null, 132);
    expect(placements[0]!.lift).toBeGreaterThan(placements[3]!.lift);
    expect(placements[6]!.lift).toBeGreaterThan(placements[3]!.lift);
    expect(placements[3]!.lift).toBeCloseTo(0, 6);
  });

  it('raises the focused item clear of the whole fan, not just its neighbours', () => {
    const placements = fanPlacements(40, 20, 132);
    const top = Math.max(...placements.map((p) => p.z));
    expect(placements[20]!.z).toBe(top);
    // Clear of the far end too, or a card at index 39 would paint over it.
    expect(placements[20]!.z).toBeGreaterThan(placements[39]!.z);
  });

  it('overlaps in order at rest, rather than leaving paint order to decide', () => {
    // Every item carrying a z is what stops cards popping over one another as
    // the bulge passes.
    const placements = fanPlacements(9, null, 132);
    expect(placements.map((p) => p.z)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('is empty for an empty fan', () => {
    expect(fanPlacements(0, null, 132)).toEqual([]);
  });
});

describe('fanMagnify', () => {
  it('is 1 at rest', () => {
    expect(fanMagnify(3, null)).toBe(1);
  });

  it('peaks on the focused item', () => {
    expect(fanMagnify(4, 4)).toBeGreaterThan(fanMagnify(5, 4));
    expect(fanMagnify(5, 4)).toBeGreaterThan(fanMagnify(7, 4));
  });

  it('tapers to nothing a couple of items away', () => {
    expect(fanMagnify(9, 4)).toBeCloseTo(1, 3);
  });

  it('grows the item that also claims the most track', () => {
    // Two effects fighting would read as a bug; both peak at the focus.
    const placements = fanPlacements(9, 4, 132);
    const widest = placements
      .map((p, i) => ({ i, span: (placements[i + 1]?.offset ?? 1) - p.offset }))
      .sort((a, b) => b.span - a.span)[0]!.i;
    expect(Math.abs(widest - 4)).toBeLessThanOrEqual(1);
  });
});
