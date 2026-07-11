import {
  useCallback,
  useId,
  useRef,
  type ComponentProps,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx.ts';
import { resolveDirection } from '../../internal/direction.ts';
import { useControlled } from '../../internal/useControlled.ts';
import { useHaptics } from '../../haptics/HapticsProvider.tsx';
import styles from './ResizableSplitPane.module.css';

export type SplitOrientation = 'horizontal' | 'vertical';

export interface ResizableSplitPaneProps extends Omit<ComponentProps<'div'>, 'children'> {
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
  style,
  'aria-label': ariaLabel,
  ...rest
}: ResizableSplitPaneProps) {
  const labelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useControlled(ratio, defaultRatio);
  const isHorizontal = orientation === 'horizontal';
  const [start, end] = children;
  const fireHaptic = useHaptics();
  const hapticsOff = (rest as Record<string, unknown>)['data-haptic'] === 'none';
  // Which clamp the drag last rested on. One medium tick fires per arrival at
  // a bound; moving off the bound resets this and re-arms the tick.
  const clampEdgeRef = useRef<'min' | 'max' | null>(null);

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
    // Arm the clamp tick from where the drag starts, so a divider already
    // resting on a bound stays silent until it leaves and comes back.
    clampEdgeRef.current = current <= min ? 'min' : current >= max ? 'max' : null;

    const move = (e: globalThis.PointerEvent) => {
      const rect = root.getBoundingClientRect();
      const size = isHorizontal ? rect.width : rect.height;
      if (size <= 0) return;
      // The start pane hugs the inline-start edge, which is the right edge in
      // RTL, so measure the pointer's offset from there.
      const offset = isHorizontal
        ? resolveDirection(root) === 'rtl'
          ? rect.right - e.clientX
          : e.clientX - rect.left
        : e.clientY - rect.top;
      const next = offset / size;
      const edge = next <= min ? 'min' : next >= max ? 'max' : null;
      if (edge !== clampEdgeRef.current) {
        clampEdgeRef.current = edge;
        if (edge && !hapticsOff) fireHaptic('medium');
      }
      commit(next);
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
    // decrease keys move the divider toward the start; increase toward the
    // end. APG: the horizontal arrows invert in RTL, where the start pane is
    // on the right, so ArrowLeft grows it (moves the divider away from it).
    const rtl = isHorizontal && resolveDirection(event.currentTarget) === 'rtl';
    const decrease = isHorizontal ? (rtl ? 'ArrowRight' : 'ArrowLeft') : 'ArrowUp';
    const increase = isHorizontal ? (rtl ? 'ArrowLeft' : 'ArrowRight') : 'ArrowDown';
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
      {...rest}
      ref={rootRef}
      className={cx(styles.root, className)}
      data-orientation={orientation}
      style={{ '--split-start': `${percent}%`, ...style } as CSSProperties}
    >
      <span id={labelId} hidden>
        {ariaLabel ?? 'Resize panes'}
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
