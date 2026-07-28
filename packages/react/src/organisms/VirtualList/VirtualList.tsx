import { virtualWindow, windowIndices, scrollOffsetForIndex } from '@glacier/logic';
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
  type Ref,
} from 'react';
import { cx } from '../../internal/cx.ts';
import { Text } from '../../atoms/display/Typography/Text.tsx';
import { Size, TextTone } from '@glacier/spec';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import styles from './VirtualList.module.css';

/** The imperative surface, for scrolling to a row the user has not scrolled to. */
export interface VirtualListHandle {
  /** Scrolls the row at `index` into view. Does nothing if it already is. */
  scrollToIndex: (index: number, align?: 'auto' | 'start' | 'center' | 'end') => void;
}

// `ref` is omitted from the inherited div props deliberately: this component's
// ref is its imperative scroll handle, not the viewport element, and leaving
// the div's own ref in the type would make the two collide.
export interface VirtualListProps extends Omit<ComponentProps<'div'>, 'children' | 'ref'> {
  /** How many rows there are in total. */
  count: number;
  /** Height of one row in pixels. Every row is this tall. */
  itemSize: number;
  /** Renders the row at an index. Called only for rows inside the window. */
  renderItem: (index: number) => ReactNode;
  /** Viewport height. Defaults to filling its parent. */
  height?: string | number;
  /** Extra rows rendered beyond each edge of the viewport. */
  overscan?: number;
  /** Called with the first and last rendered index whenever the window moves. */
  onVisibleChange?: (start: number, end: number) => void;
  /** A stable key for the row at an index. Defaults to the index. */
  getKey?: (index: number) => string | number;
  emptyLabel?: ReactNode;
  skeleton?: boolean;
  ref?: Ref<VirtualListHandle>;
}

/**
 * Renders only the rows the scroller can actually show.
 *
 * A tall spacer holds the true scroll height so the scrollbar describes the
 * data, and a small absolutely-positioned window holds the rows that are
 * currently on screen. The arithmetic — which rows, how tall, how far down —
 * all comes from @glacier/logic, so the native list renders the same slice
 * for the same scroll position.
 *
 * Fixed row heights only, on purpose. Variable heights need every row measured
 * and the scroll offset corrected as estimates are replaced; that is a
 * different component, and pretending otherwise produces a list that jitters
 * while you scroll it.
 *
 * The rows carry `aria-setsize` and `aria-posinset` describing the whole list
 * rather than the window, because a screen reader announcing "3 of 12" while
 * the user is at item 40,000 is worse than no announcement.
 */
export function VirtualList({
  count,
  itemSize,
  renderItem,
  height,
  overscan = 3,
  onVisibleChange,
  getKey,
  emptyLabel,
  skeleton = false,
  className,
  ref,
  ...rest
}: VirtualListProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [viewportSize, setViewportSize] = useState(0);

  // Measure the viewport, and keep measuring it: a list that sized itself once
  // renders the wrong number of rows the moment the window is resized or a
  // sibling collapses.
  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const measure = () => setViewportSize(el.clientHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const onScroll = useCallback(() => {
    const el = viewportRef.current;
    if (el) setScrollOffset(el.scrollTop);
  }, []);

  const window_ = virtualWindow({ count, itemSize, viewportSize, scrollOffset, overscan });

  useImperativeHandle(
    ref,
    () => ({
      scrollToIndex: (index, align = 'auto') => {
        const el = viewportRef.current;
        if (!el) return;
        const next = scrollOffsetForIndex({
          index,
          itemSize,
          viewportSize,
          scrollOffset: el.scrollTop,
          count,
          align,
        });
        // null means the row is already fully visible; scrolling anyway would
        // yank the list under the user for no reason.
        if (next !== null) el.scrollTop = next;
      },
    }),
    [count, itemSize, viewportSize],
  );

  // Report the window after paint, not during render, so a caller that pages in
  // more data cannot set state mid-render.
  useEffect(() => {
    if (count > 0) onVisibleChange?.(window_.start, window_.end);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the window bounds are the signal
  }, [window_.start, window_.end, count]);

  if (count === 0 && !skeleton) {
    return (
      <div className={cx(styles.viewport, className)} style={{ height }} {...rest}>
        <div className={styles.empty}>
          <Text tone={TextTone.Subtle} size={Size.Small}>
            {emptyLabel}
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={viewportRef}
      className={cx(styles.viewport, className)}
      style={{ height }}
      onScroll={onScroll}
      // The scroller takes focus so the keyboard can drive it without every row
      // being tabbable.
      tabIndex={0}
      role="listbox"
      aria-label={rest['aria-label']}
      {...rest}
    >
      {/* As tall as the whole list, so the scrollbar describes the data rather
          than the handful of rows currently rendered. */}
      <div className={styles.canvas} style={{ height: window_.totalSize }} aria-hidden={skeleton || undefined}>
        <div className={styles.window} style={{ transform: `translateY(${window_.offset}px)` }}>
          {windowIndices(window_).map((index) => (
            <div
              key={getKey?.(index) ?? index}
              className={styles.row}
              style={{ height: itemSize }}
              role="option"
              aria-selected={false}
              // The position in the WHOLE list, not the window.
              aria-setsize={count}
              aria-posinset={index + 1}
            >
              {skeleton ? <Skeleton width="70%" height="1rem" /> : renderItem(index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
