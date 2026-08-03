import {
  didReorder,
  dropTarget,
  moveItem,
  nextSortableIndex,
  shiftFor,
  type SortableLift,
} from '@glacier/logic';
import { useRef, useState, type ComponentProps, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { useT } from '../../i18n/LocaleProvider.tsx';
import { kitMessages } from '../../i18n/messages.ts';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import styles from './SortableList.module.css';

/** The minimum a row must provide: something stable to key and track it by. */
export interface SortableItemLike {
  id: string;
}

export interface SortableListProps<T extends SortableItemLike>
  extends Omit<ComponentProps<'ul'>, 'children' | 'onDrop'> {
  /** The rows in their current order. Controlled. */
  items: T[];
  /** Called with the reordered array once a move is committed. */
  onReorder: (items: T[]) => void;
  /** Renders one row's content; the handle and row chrome are the list's. */
  renderItem: (item: T, index: number) => ReactNode;
  /** The name announced as a row moves. Defaults to the id. */
  getLabel?: (item: T) => string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  skeleton?: boolean;
  /** How many placeholder rows to draw while loading. */
  skeletonRows?: number;
}

const GripIcon = (
  <svg width="12" height="16" viewBox="0 0 12 16" fill="none" aria-hidden="true">
    {[4, 8, 12].map((y) =>
      [3, 9].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.25" fill="currentColor" />),
    )}
  </svg>
);

/**
 * A list whose rows can be reordered by dragging a handle - or entirely from
 * the keyboard, which is the part most drag-and-drop implementations skip.
 *
 * Two gestures, one model. A pointer drag tracks the handle and drops on
 * release; a keyboard reorder *lifts* a row with Space, moves it with the
 * arrows, and drops it with Space again, with Escape restoring the original
 * order. Both resolve through the same `moveItem` in @glacier/logic, so a row
 * dropped in the fourth slot lands in the fourth slot either way.
 *
 * Controlled by design: the list never reorders itself. It reports the array it
 * would like and the caller decides, which is what lets a reorder be rejected,
 * persisted, or undone.
 */
export function SortableList<T extends SortableItemLike>({
  items,
  onReorder,
  renderItem,
  getLabel,
  size = 'md',
  disabled = false,
  skeleton = false,
  skeletonRows = 4,
  className,
  ...rest
}: SortableListProps<T>) {
  const t = useT();
  const listRef = useRef<HTMLUListElement>(null);

  // Pointer drag: where the row came from, where it would land, and how far the
  // pointer has travelled so the lifted row can follow it.
  const [drag, setDrag] = useState<{ from: number; to: number; offset: number } | null>(null);
  const dragStartY = useRef(0);
  // Row midpoints, measured once at drag start. Measuring per-move would read
  // the rows mid-transform and chase its own tail.
  const centers = useRef<number[]>([]);

  // Keyboard lift, kept separate from the pointer drag: they are different
  // gestures and only one can be in flight.
  const [lift, setLift] = useState<SortableLift | null>(null);

  // What the live region is currently saying. The only feedback a non-sighted
  // user gets that a move did anything.
  const [announcement, setAnnouncement] = useState('');

  const label = (item: T) => getLabel?.(item) ?? item.id;

  const announce = (item: T, position: number) =>
    setAnnouncement(t(kitMessages.sortableMoved, { item: label(item), position: position + 1, total: items.length }));

  const commit = (from: number, to: number) => {
    if (!didReorder(from, to)) return;
    onReorder(moveItem(items, from, to));
  };

  // ---- pointer drag -------------------------------------------------------

  const onHandlePointerDown = (event: PointerEvent<HTMLButtonElement>, index: number) => {
    if (disabled) return;
    // Only the primary button drags; a right-click should open a menu, not
    // silently start a reorder.
    if (event.button !== 0) return;

    event.preventDefault();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);

    const rows = Array.from(listRef.current?.querySelectorAll<HTMLElement>('[data-sortable-row]') ?? []);
    centers.current = rows.map((row) => {
      const rect = row.getBoundingClientRect();
      return rect.top + rect.height / 2;
    });
    dragStartY.current = event.clientY;
    setDrag({ from: index, to: index, offset: 0 });
  };

  const onHandlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (!drag) return;
    setDrag({
      ...drag,
      to: dropTarget(centers.current, event.clientY),
      offset: event.clientY - dragStartY.current,
    });
  };

  const endDrag = () => {
    if (!drag) return;
    commit(drag.from, drag.to);
    setDrag(null);
  };

  // ---- keyboard reorder ---------------------------------------------------

  const onHandleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (disabled) return;

    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      if (!lift) {
        setLift({ origin: index, index });
        setAnnouncement(t(kitMessages.sortableLifted, { item: label(items[index]!), position: index + 1 }));
      } else {
        commit(lift.origin, lift.index);
        setAnnouncement(t(kitMessages.sortableDropped, { item: label(items[lift.origin]!), position: lift.index + 1 }));
        setLift(null);
      }
      return;
    }

    if (!lift) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      // Restore rather than commit: an accidental lift should be recoverable
      // without having to count the moves back.
      setLift(null);
      setAnnouncement(t(kitMessages.sortableCancelled, { item: label(items[lift.origin]!) }));
      return;
    }

    const moves: Record<string, number> = { ArrowUp: -1, ArrowDown: 1 };
    const delta = moves[event.key];
    if (delta !== undefined) {
      event.preventDefault();
      const next = nextSortableIndex(lift.index, delta, items.length);
      setLift({ ...lift, index: next });
      announce(items[lift.origin]!, next);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : items.length - 1;
      setLift({ ...lift, index: next });
      announce(items[lift.origin]!, next);
    }
  };

  // ---- rendering ----------------------------------------------------------

  if (skeleton) {
    return (
      <ul className={cx(styles.list, styles[size], className)} data-skeleton {...rest}>
        {Array.from({ length: skeletonRows }, (_, i) => (
          <li key={i} className={styles.item}>
            <span className={styles.handle} aria-hidden="true">
              {GripIcon}
            </span>
            <Skeleton width="60%" height="1rem" />
          </li>
        ))}
      </ul>
    );
  }

  // The active gesture, whichever it is, drives every row's shift.
  const active = drag ?? (lift ? { from: lift.origin, to: lift.index, offset: 0 } : null);

  return (
    <>
      <ul
        ref={listRef}
        className={cx(styles.list, styles[size], className)}
        data-disabled={disabled || undefined}
        {...rest}
      >
        {items.map((item, index) => {
          const isActive = active?.from === index;
          const shift = active ? shiftFor(index, active.from, active.to) : 0;

          return (
            <li
              key={item.id}
              data-sortable-row=""
              className={styles.item}
              data-dragging={drag && isActive ? '' : undefined}
              data-lifted={lift && isActive ? '' : undefined}
              style={{
                // The dragged row follows the pointer; the rows it passes slide
                // one slot. `--row-shift` is multiplied by the row height in CSS
                // so the two bindings agree on slots, not pixels.
                '--row-offset': drag && isActive ? `${drag.offset}px` : undefined,
                '--row-shift': shift,
              } as React.CSSProperties}
            >
              <button
                type="button"
                className={styles.handle}
                // A dedicated grip, so a row can hold text the user still needs
                // to be able to select.
                aria-label={t(kitMessages.sortableHandle, { item: label(item) })}
                aria-pressed={lift && isActive ? true : undefined}
                disabled={disabled}
                onPointerDown={(event) => onHandlePointerDown(event, index)}
                onPointerMove={onHandlePointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onKeyDown={(event) => onHandleKeyDown(event, index)}
              >
                {GripIcon}
              </button>
              <div className={styles.content}>{renderItem(item, index)}</div>
            </li>
          );
        })}
      </ul>
      {/* Polite, not assertive: a reorder is a running commentary, and
          interrupting the user on every arrow press would be unusable. */}
      <div className={styles.live} role="status" aria-live="polite">
        {announcement}
      </div>
    </>
  );
}
