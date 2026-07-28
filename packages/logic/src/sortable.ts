/**
 * Sortable list logic — the reordering arithmetic behind drag-and-drop and its
 * keyboard equivalent. Pure array and geometry work, so both bindings drop an
 * item in the same place from the same gesture.
 */

/** Where a keyboard reorder is currently holding an item. */
export interface SortableLift {
  /** Where the item started, so Escape can put it back. */
  origin: number;
  /** Where it is now, as the arrows move it. */
  index: number;
}

/**
 * Moves one item, returning a new array.
 *
 * Out-of-range indices return the original array untouched rather than
 * inserting `undefined`, so a stale index from an interrupted drag cannot
 * corrupt the list.
 */
export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from === to) return items;
  if (from < 0 || from >= items.length) return items;
  if (to < 0 || to >= items.length) return items;

  const next = items.slice();
  const [moved] = next.splice(from, 1);
  // `moved` is always defined given the bounds check above; the guard is for
  // the type, not for a case that can happen.
  if (moved === undefined) return items;
  next.splice(to, 0, moved);
  return next;
}

/**
 * Where a keyboard reorder lands after one step.
 *
 * Clamped, not wrapping: an item at the top of a list should stay there when
 * you press up again. Wrapping would silently teleport it to the bottom, which
 * is never what someone nudging an item one place meant.
 */
export function nextSortableIndex(from: number, delta: number, count: number): number {
  const target = from + delta;
  if (count <= 0) return 0;
  return target < 0 ? 0 : target > count - 1 ? count - 1 : target;
}

/**
 * Which slot a pointer is over, given the midpoint of every row.
 *
 * Midpoints rather than edges: an item takes a slot once the pointer is past
 * the halfway mark of the row there, which is what makes a drag feel like it
 * commits at the moment the rows visibly swap instead of at the moment the
 * pointer crosses a boundary the user cannot see.
 *
 * `centers` are the row midpoints along the drag axis, in list order.
 */
export function dropTarget(centers: number[], pointer: number): number {
  if (centers.length === 0) return 0;
  // Rows are in order, so the target is the count of midpoints the pointer has
  // already passed.
  let index = 0;
  for (const center of centers) {
    if (pointer > center) index += 1;
    else break;
  }
  return index > centers.length - 1 ? centers.length - 1 : index;
}

/**
 * How far each row shifts while an item is being dragged over the list.
 *
 * The dragged row leaves a gap and the rows between its origin and the current
 * target close it up: everything below a downward drag moves up one slot, and
 * everything above an upward drag moves down one. Returned as a count of slots
 * so each binding multiplies by its own row height.
 *
 * Rows outside the affected span, and the dragged row itself, return 0.
 */
export function shiftFor(index: number, from: number, to: number): number {
  if (index === from) return 0;
  if (from < to) return index > from && index <= to ? -1 : 0;
  if (from > to) return index >= to && index < from ? 1 : 0;
  return 0;
}

/**
 * Whether a reorder actually changed anything — used to decide whether to
 * report a change at the end of a drag. A drag that returns an item to where it
 * started is not a change, and firing one would mark a form dirty for a gesture
 * the user visibly undid.
 */
export function didReorder(from: number, to: number): boolean {
  return from !== to && from >= 0 && to >= 0;
}
