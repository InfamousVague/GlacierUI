import { describe, expect, it } from 'vitest';
import { didReorder, dropTarget, moveItem, nextSortableIndex, shiftFor } from '../src/sortable.ts';

const list = ['a', 'b', 'c', 'd'];

describe('moveItem', () => {
  it('moves an item down', () => {
    expect(moveItem(list, 0, 2)).toEqual(['b', 'c', 'a', 'd']);
  });

  it('moves an item up', () => {
    expect(moveItem(list, 3, 1)).toEqual(['a', 'd', 'b', 'c']);
  });

  it('moves to the end', () => {
    expect(moveItem(list, 0, 3)).toEqual(['b', 'c', 'd', 'a']);
  });

  it('moves to the start', () => {
    expect(moveItem(list, 2, 0)).toEqual(['c', 'a', 'b', 'd']);
  });

  it('returns the same array for a no-op move', () => {
    // Identity, not a copy: a no-op should not look like a change to anything
    // watching the reference.
    expect(moveItem(list, 1, 1)).toBe(list);
  });

  it('does not mutate the input', () => {
    const original = [...list];
    moveItem(list, 0, 3);
    expect(list).toEqual(original);
  });

  it('ignores an out-of-range source rather than inserting undefined', () => {
    // A stale index from an interrupted drag must not corrupt the list.
    expect(moveItem(list, 9, 0)).toBe(list);
    expect(moveItem(list, -1, 0)).toBe(list);
  });

  it('ignores an out-of-range target', () => {
    expect(moveItem(list, 0, 9)).toBe(list);
    expect(moveItem(list, 0, -1)).toBe(list);
  });

  it('handles a single-item list', () => {
    expect(moveItem(['only'], 0, 0)).toEqual(['only']);
  });

  it('handles an empty list', () => {
    expect(moveItem([], 0, 0)).toEqual([]);
  });
});

describe('nextSortableIndex', () => {
  it('steps down', () => {
    expect(nextSortableIndex(1, 1, 4)).toBe(2);
  });

  it('steps up', () => {
    expect(nextSortableIndex(2, -1, 4)).toBe(1);
  });

  it('clamps at the top rather than wrapping', () => {
    // Wrapping would teleport an item to the bottom, which is never what a
    // one-place nudge meant.
    expect(nextSortableIndex(0, -1, 4)).toBe(0);
  });

  it('clamps at the bottom rather than wrapping', () => {
    expect(nextSortableIndex(3, 1, 4)).toBe(3);
  });

  it('clamps a large jump', () => {
    expect(nextSortableIndex(0, 99, 4)).toBe(3);
  });

  it('survives an empty list', () => {
    expect(nextSortableIndex(0, 1, 0)).toBe(0);
  });
});

describe('dropTarget', () => {
  // Four 40px rows starting at 0: midpoints at 20, 60, 100, 140.
  const centers = [20, 60, 100, 140];

  it('lands on the first slot above every midpoint', () => {
    expect(dropTarget(centers, 0)).toBe(0);
    expect(dropTarget(centers, 19)).toBe(0);
  });

  it('takes the next slot once past a midpoint', () => {
    expect(dropTarget(centers, 21)).toBe(1);
    expect(dropTarget(centers, 61)).toBe(2);
  });

  it('sits exactly on a midpoint without advancing', () => {
    // The comparison is strict, so the boundary belongs to the row above it and
    // the result does not flicker while the pointer rests on the line.
    expect(dropTarget(centers, 20)).toBe(0);
  });

  it('clamps past the last row', () => {
    expect(dropTarget(centers, 9999)).toBe(3);
  });

  it('clamps before the first row', () => {
    expect(dropTarget(centers, -50)).toBe(0);
  });

  it('returns 0 for an empty list', () => {
    expect(dropTarget([], 100)).toBe(0);
  });
});

describe('shiftFor', () => {
  it('does not move the dragged row itself', () => {
    expect(shiftFor(1, 1, 3)).toBe(0);
  });

  it('lifts the rows a downward drag passes', () => {
    // Dragging row 1 to row 3: rows 2 and 3 close the gap upward.
    expect(shiftFor(2, 1, 3)).toBe(-1);
    expect(shiftFor(3, 1, 3)).toBe(-1);
  });

  it('leaves rows outside a downward drag alone', () => {
    expect(shiftFor(0, 1, 3)).toBe(0);
    expect(shiftFor(4, 1, 3)).toBe(0);
  });

  it('pushes the rows an upward drag passes', () => {
    // Dragging row 3 to row 1: rows 1 and 2 move down.
    expect(shiftFor(1, 3, 1)).toBe(1);
    expect(shiftFor(2, 3, 1)).toBe(1);
  });

  it('leaves rows outside an upward drag alone', () => {
    expect(shiftFor(0, 3, 1)).toBe(0);
    expect(shiftFor(3, 3, 1)).toBe(0);
  });

  it('shifts nothing when the target is the origin', () => {
    for (const i of [0, 1, 2, 3]) expect(shiftFor(i, 2, 2)).toBe(0);
  });

  it('accounts for every row exactly once', () => {
    // The shifted rows plus the dragged one must equal the span covered, or
    // the list would show a gap or a doubled row mid-drag.
    const shifted = [0, 1, 2, 3, 4].filter((i) => shiftFor(i, 1, 3) !== 0);
    expect(shifted).toEqual([2, 3]);
  });
});

describe('didReorder', () => {
  it('is true for a real move', () => {
    expect(didReorder(0, 2)).toBe(true);
  });

  it('is false when an item returns to where it started', () => {
    // Firing a change here would mark a form dirty for a gesture the user
    // visibly undid.
    expect(didReorder(2, 2)).toBe(false);
  });

  it('is false for an unstarted drag', () => {
    expect(didReorder(-1, 2)).toBe(false);
  });
});
