/**
 * Virtual list windowing — deciding which slice of a long list is worth
 * rendering. Pure arithmetic, so both bindings render the same rows for the
 * same scroll position.
 */

/** The slice to render, and where to put it. */
export interface VirtualWindow {
  /** First row index to render, inclusive. */
  start: number;
  /** Last row index to render, inclusive. */
  end: number;
  /** Total scrollable height, so the scrollbar reflects the whole list. */
  totalSize: number;
  /** Offset of the first rendered row from the top of the scroller. */
  offset: number;
}

export interface VirtualWindowOptions {
  /** How many rows there are in total. */
  count: number;
  /** Height of one row. Every row is the same height. */
  itemSize: number;
  /** Height of the visible area. */
  viewportSize: number;
  /** How far the scroller has been scrolled. */
  scrollOffset: number;
  /**
   * Extra rows to render beyond each edge of the viewport.
   *
   * Without it, a row is created at the exact moment it becomes visible, and
   * any work it does on mount — measuring, decoding an image, a first paint —
   * happens inside the frame that is already trying to scroll. A small buffer
   * moves that work off the visible edge. Three is enough to cover a fast
   * flick without rendering a screenful of rows nobody sees.
   */
  overscan?: number;
}

const clamp = (n: number, min: number, max: number): number => (n < min ? min : n > max ? max : n);

/**
 * Which rows to render for a given scroll position.
 *
 * Fixed row heights only, deliberately: variable heights require measuring
 * every row and correcting the scroll offset as estimates are replaced, which
 * is a different and much larger component. A list with uniform rows is the
 * common case and it is exactly computable — no measurement, no estimation, no
 * drift.
 *
 * Non-finite or negative inputs settle at an empty window rather than
 * producing NaN offsets that would blank the list.
 */
export function virtualWindow(options: VirtualWindowOptions): VirtualWindow {
  const { count, itemSize, viewportSize, scrollOffset, overscan = 3 } = options;

  const safeCount = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  const safeSize = Number.isFinite(itemSize) && itemSize > 0 ? itemSize : 0;
  const totalSize = safeCount * safeSize;

  if (safeCount === 0 || safeSize === 0) return { start: 0, end: -1, totalSize: 0, offset: 0 };

  const safeViewport = Number.isFinite(viewportSize) ? Math.max(0, viewportSize) : 0;
  const safeScroll = Number.isFinite(scrollOffset) ? clamp(scrollOffset, 0, Math.max(0, totalSize - safeViewport)) : 0;
  const safeOverscan = Number.isFinite(overscan) ? Math.max(0, Math.floor(overscan)) : 0;

  const firstVisible = Math.floor(safeScroll / safeSize);
  // The viewport almost never lands on a row boundary, so the last visible row
  // is the one containing its bottom edge — hence the ceil rather than a
  // division of the height alone.
  const lastVisible = Math.ceil((safeScroll + safeViewport) / safeSize) - 1;

  const start = clamp(firstVisible - safeOverscan, 0, safeCount - 1);
  const end = clamp(lastVisible + safeOverscan, 0, safeCount - 1);

  return { start, end, totalSize, offset: start * safeSize };
}

/**
 * The scroll offset that brings a row into view, or null when it is already
 * fully visible and nothing should move.
 *
 * Returning null rather than the current offset matters: a caller can tell "no
 * scroll needed" from "scroll to 0", and scrolling a list that was already
 * showing the row would yank it under the user for no reason.
 *
 * `align` chooses where a row that must be scrolled to ends up:
 * - `auto` — the nearest edge, so the list moves as little as possible.
 * - `start` / `end` — pinned to that edge.
 * - `center` — centred, which is what a search result wants so its context is
 *   visible on both sides.
 */
export function scrollOffsetForIndex(options: {
  index: number;
  itemSize: number;
  viewportSize: number;
  scrollOffset: number;
  count: number;
  align?: 'auto' | 'start' | 'center' | 'end';
}): number | null {
  const { index, itemSize, viewportSize, scrollOffset, count, align = 'auto' } = options;
  if (!Number.isFinite(index) || index < 0 || index >= count || itemSize <= 0) return null;

  const max = Math.max(0, count * itemSize - viewportSize);
  const top = index * itemSize;
  const bottom = top + itemSize;

  if (align === 'start') return clamp(top, 0, max);
  if (align === 'end') return clamp(bottom - viewportSize, 0, max);
  if (align === 'center') return clamp(top - (viewportSize - itemSize) / 2, 0, max);

  // auto: only move if the row is not already fully in view.
  if (top < scrollOffset) return clamp(top, 0, max);
  if (bottom > scrollOffset + viewportSize) return clamp(bottom - viewportSize, 0, max);
  return null;
}

/**
 * The indices in a window, as an array to map over.
 *
 * An empty window (`end < start`) yields nothing rather than a negative-length
 * array, so a list with no rows renders no rows instead of throwing.
 */
export function windowIndices(window: VirtualWindow): number[] {
  if (window.end < window.start) return [];
  return Array.from({ length: window.end - window.start + 1 }, (_, i) => window.start + i);
}
