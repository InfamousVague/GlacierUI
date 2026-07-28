import { describe, expect, it } from 'vitest';
import { scrollOffsetForIndex, virtualWindow, windowIndices } from '../src/virtual-list.ts';

// 1000 rows of 40px in a 400px viewport: exactly 10 rows visible.
const base = { count: 1000, itemSize: 40, viewportSize: 400, scrollOffset: 0 };

describe('virtualWindow', () => {
  it('renders the visible rows plus the overscan', () => {
    const w = virtualWindow({ ...base, overscan: 3 });
    expect(w.start).toBe(0);
    // 10 visible (0-9) plus 3 either side; there is nothing above 0 to add.
    expect(w.end).toBe(12);
  });

  it('reports the full scrollable height, not the rendered height', () => {
    // Otherwise the scrollbar would describe the window rather than the list.
    expect(virtualWindow(base).totalSize).toBe(40_000);
  });

  it('offsets the rendered slice to where it belongs', () => {
    const w = virtualWindow({ ...base, scrollOffset: 4000, overscan: 0 });
    expect(w.start).toBe(100);
    expect(w.offset).toBe(4000);
  });

  it('moves the window as the list scrolls', () => {
    const w = virtualWindow({ ...base, scrollOffset: 2000, overscan: 0 });
    expect(w.start).toBe(50);
    expect(w.end).toBe(59);
  });

  it('includes the row a partial scroll cuts through', () => {
    // Scrolled half a row: the row at the top edge is still partly visible and
    // must render, and so must the one now peeking in at the bottom.
    const w = virtualWindow({ ...base, scrollOffset: 20, overscan: 0 });
    expect(w.start).toBe(0);
    expect(w.end).toBe(10);
  });

  it('does not overscan past the start of the list', () => {
    expect(virtualWindow({ ...base, scrollOffset: 0, overscan: 10 }).start).toBe(0);
  });

  it('does not overscan past the end of the list', () => {
    const w = virtualWindow({ ...base, scrollOffset: 39_600, overscan: 10 });
    expect(w.end).toBe(999);
  });

  it('clamps a scroll offset beyond the end', () => {
    // A momentum scroll can overshoot; the window must not run off the array.
    const w = virtualWindow({ ...base, scrollOffset: 999_999, overscan: 0 });
    expect(w.end).toBe(999);
    expect(w.start).toBeLessThanOrEqual(999);
  });

  it('clamps a negative scroll offset', () => {
    // Rubber-band scrolling reports negative offsets at the top.
    const w = virtualWindow({ ...base, scrollOffset: -500, overscan: 0 });
    expect(w.start).toBe(0);
    expect(w.offset).toBe(0);
  });

  it('renders an empty window for an empty list', () => {
    const w = virtualWindow({ ...base, count: 0 });
    expect(w.end).toBeLessThan(w.start);
    expect(w.totalSize).toBe(0);
  });

  it('renders an empty window rather than NaN for a zero row height', () => {
    const w = virtualWindow({ ...base, itemSize: 0 });
    expect(w).toEqual({ start: 0, end: -1, totalSize: 0, offset: 0 });
  });

  it('survives non-finite inputs', () => {
    expect(virtualWindow({ ...base, itemSize: Number.NaN }).totalSize).toBe(0);
    expect(Number.isFinite(virtualWindow({ ...base, scrollOffset: Number.NaN }).offset)).toBe(true);
    expect(virtualWindow({ ...base, count: Number.NaN }).end).toBe(-1);
  });

  it('renders every row when the list is shorter than the viewport', () => {
    const w = virtualWindow({ count: 3, itemSize: 40, viewportSize: 400, scrollOffset: 0 });
    expect(w.start).toBe(0);
    expect(w.end).toBe(2);
  });

  it('renders a bounded number of rows however long the list is', () => {
    // The whole point: a million rows must not cost a million elements.
    const w = virtualWindow({ ...base, count: 1_000_000, scrollOffset: 20_000_000 });
    expect(windowIndices(w).length).toBeLessThan(25);
  });

  it('never leaves a visible gap at any scroll position', () => {
    // Sweep the list and assert the window always covers the whole viewport.
    for (let scroll = 0; scroll <= 39_600; scroll += 137) {
      const w = virtualWindow({ ...base, scrollOffset: scroll, overscan: 0 });
      expect(w.start * 40).toBeLessThanOrEqual(scroll);
      expect((w.end + 1) * 40).toBeGreaterThanOrEqual(scroll + 400);
    }
  });
});

describe('scrollOffsetForIndex', () => {
  const args = { itemSize: 40, viewportSize: 400, count: 1000, scrollOffset: 0 };

  it('returns null when the row is already fully visible', () => {
    // Distinguishable from "scroll to 0", so a caller does not yank a list that
    // was already showing the row.
    expect(scrollOffsetForIndex({ ...args, index: 5 })).toBeNull();
  });

  it('scrolls up to a row above the viewport', () => {
    expect(scrollOffsetForIndex({ ...args, index: 10, scrollOffset: 2000 })).toBe(400);
  });

  it('scrolls down just far enough to reveal a row below', () => {
    // auto moves as little as possible: the row lands at the bottom edge.
    expect(scrollOffsetForIndex({ ...args, index: 20 })).toBe(440);
  });

  it('pins a row to the top with align start', () => {
    expect(scrollOffsetForIndex({ ...args, index: 20, align: 'start' })).toBe(800);
  });

  it('pins a row to the bottom with align end', () => {
    expect(scrollOffsetForIndex({ ...args, index: 20, align: 'end' })).toBe(440);
  });

  it('centres a row, so its context is visible on both sides', () => {
    expect(scrollOffsetForIndex({ ...args, index: 20, align: 'center' })).toBe(620);
  });

  it('clamps at the top', () => {
    expect(scrollOffsetForIndex({ ...args, index: 0, align: 'center' })).toBe(0);
  });

  it('clamps at the bottom', () => {
    expect(scrollOffsetForIndex({ ...args, index: 999, align: 'center' })).toBe(39_600);
  });

  it('returns null for an index outside the list', () => {
    expect(scrollOffsetForIndex({ ...args, index: 5000 })).toBeNull();
    expect(scrollOffsetForIndex({ ...args, index: -1 })).toBeNull();
  });
});

describe('windowIndices', () => {
  it('lists every index in the window, inclusive at both ends', () => {
    expect(windowIndices({ start: 2, end: 5, totalSize: 0, offset: 0 })).toEqual([2, 3, 4, 5]);
  });

  it('yields nothing for an empty window', () => {
    // Never a negative-length array, which would throw.
    expect(windowIndices({ start: 0, end: -1, totalSize: 0, offset: 0 })).toEqual([]);
  });

  it('yields a single index when start equals end', () => {
    expect(windowIndices({ start: 7, end: 7, totalSize: 0, offset: 0 })).toEqual([7]);
  });
});
