import {
  useCallback,
  useId,
  useRef,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx.ts';
import { useControlled } from '../../internal/useControlled.ts';
import styles from './ResizableSplitPane.module.css';

export type SplitOrientation = 'horizontal' | 'vertical';

export interface ResizableSplitPaneProps {
  /** Exactly two children: the start pane and the end pane. */
  children: [ReactNode, ReactNode];
  /**
   * Split direction. `horizontal` places the panes side by side with a vertical
   * divider; `vertical` stacks them with a horizontal divider.
   */
  orientation?: SplitOrientation;
  /** Controlled size of the start pane as a fraction of the container, 0–1. */
  ratio?: number;
  /** Initial start-pane fraction when uncontrolled. */
  defaultRatio?: number;
  /** Called with the next ratio on drag, keyboard step, or reset. */
  onRatioChange?: (ratio: number) => void;
  /** Smallest start-pane fraction the divider can reach. */
  min?: number;
  /** Largest start-pane fraction the divider can reach. */
  max?: number;
  /** Fraction the divider snaps back to on double-click. Defaults to `defaultRatio`. */
  resetRatio?: number;
  /** Fraction the divider moves per arrow-key press. */
  step?: number;
  /** Accessible name for the divider. */
  'aria-label'?: string;
  className?: string;
}

const clamp = (value: number, low: number, high: number): number =>
  Math.min(high, Math.max(low, value));

const round = (value: number): number => Math.round(value * 1e4) / 1e4;

/**
 * A container that splits into two panes with a draggable divider. It hosts
 * exactly two children - a start pane and an end pane - and sizes the start pane
 * by a ratio of the container. The divider is a `role="separator"` handle:
 * drag it with a pointer, nudge it with the arrow keys, or double-click to reset.
 * The ratio is controlled-or-uncontrolled, so a consumer can persist it.
 */
export function ResizableSplitPane({
  children,
  orientation = 'horizontal',
  ratio,
  defaultRatio = 0.5,
  onRatioChange,
  min = 0.1,
  max = 0.9,
  resetRatio,
  step = 0.02,
  className,
  ...rest
}: ResizableSplitPaneProps) {
  const labelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useControlled(ratio, defaultRatio);
  const isHorizontal = orientation === 'horizontal';
  const [start, end] = children;

  const commit = useCallback(
    (next: number) => {
      const clamped = round(clamp(next, min, max));
      setCurrent(clamped);
      onRatioChange?.(clamped);
    },
    [min, max, setCurrent, onRatioChange],
  );

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    // ignore secondary buttons; only drive the drag from the primary pointer
    if (event.button !== 0) return;
    const root = rootRef.current;
    if (!root) return;
    event.preventDefault();
    const handle = event.currentTarget;
    handle.setPointerCapture(event.pointerId);

    const move = (e: globalThis.PointerEvent) => {
      const rect = root.getBoundingClientRect();
      const size = isHorizontal ? rect.width : rect.height;
      if (size <= 0) return;
      const offset = isHorizontal ? e.clientX - rect.left : e.clientY - rect.top;
      commit(offset / size);
    };
    const up = () => {
      handle.releasePointerCapture?.(event.pointerId);
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', up);
      handle.removeEventListener('pointercancel', up);
    };
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', up);
    handle.addEventListener('pointercancel', up);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    // decrease keys move the divider toward the start; increase toward the end
    const decrease = isHorizontal ? 'ArrowLeft' : 'ArrowUp';
    const increase = isHorizontal ? 'ArrowRight' : 'ArrowDown';
    switch (event.key) {
      case decrease:
        event.preventDefault();
        commit(current - step);
        break;
      case increase:
        event.preventDefault();
        commit(current + step);
        break;
      case 'Home':
        event.preventDefault();
        commit(min);
        break;
      case 'End':
        event.preventDefault();
        commit(max);
        break;
    }
  }

  function reset() {
    commit(resetRatio ?? defaultRatio);
  }

  const percent = round(current * 100);

  return (
    <div
      ref={rootRef}
      className={cx(styles.root, className)}
      data-orientation={orientation}
      style={{ '--split-start': `${percent}%` } as React.CSSProperties}
    >
      <span id={labelId} hidden>
        {rest['aria-label'] ?? 'Resize panes'}
      </span>
      <div className={styles.pane} data-pane="start">
        {start}
      </div>
      <div
        role="separator"
        tabIndex={0}
        aria-orientation={isHorizontal ? 'vertical' : 'horizontal'}
        aria-labelledby={labelId}
        aria-valuemin={round(min * 100)}
        aria-valuemax={round(max * 100)}
        aria-valuenow={percent}
        className={styles.divider}
        onPointerDown={onPointerDown}
        onKeyDown={onKeyDown}
        onDoubleClick={reset}
      >
        <span className={styles.grip} aria-hidden="true" />
      </div>
      <div className={styles.pane} data-pane="end">
        {end}
      </div>
    </div>
  );
}
