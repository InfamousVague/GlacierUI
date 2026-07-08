import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx.ts';
import styles from './ScrollArea.module.css';

/** Which axis the content overflows and scrolls along. */
export type ScrollAreaOrientation = 'vertical' | 'horizontal';

export interface ScrollAreaProps extends Omit<ComponentProps<'div'>, 'children'> {
  /**
   * Caps the viewport along the scroll axis: a CSS length or number of pixels.
   * For a vertical area this is a max-height; for a horizontal one, a max-width.
   */
  maxHeight?: number | string;
  /** Scroll axis. Vertical (the default) shows top/bottom fades; horizontal shows left/right. */
  orientation?: ScrollAreaOrientation;
  /** The overflowing content. */
  children?: ReactNode;
}

type Edges = { start: boolean; end: boolean };

/**
 * A styled overflow container. It caps its viewport along one axis, paints a
 * thin themed scrollbar, and fades the content at each edge only when there is
 * more to scroll in that direction. A scroll listener plus a ResizeObserver
 * keep the fade masks in sync as the content or viewport changes, so the top
 * fade appears once you scroll down and the bottom fade disappears at the end.
 * The viewport itself is focusable and keyboard-scrollable.
 */
export function ScrollArea({
  maxHeight,
  orientation = 'vertical',
  className,
  style,
  children,
  ...rest
}: ScrollAreaProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState<Edges>({ start: false, end: false });

  const measure = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    if (orientation === 'horizontal') {
      const max = el.scrollWidth - el.clientWidth;
      // clamp against sub-pixel rounding so the end fade fully clears
      const pos = Math.min(Math.max(el.scrollLeft, 0), max);
      setEdges({ start: pos > 1, end: max - pos > 1 });
    } else {
      const max = el.scrollHeight - el.clientHeight;
      const pos = Math.min(Math.max(el.scrollTop, 0), max);
      setEdges({ start: pos > 1, end: max - pos > 1 });
    }
  }, [orientation]);

  // Measure before paint on mount and whenever orientation/content changes, so
  // the initial fades are correct without a flash.
  useLayoutEffect(() => {
    measure();
  }, [measure, children]);

  // Track viewport and content size changes (fonts loading, responsive reflow).
  useEffect(() => {
    const el = viewportRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(el);
    for (const child of Array.from(el.children)) observer.observe(child);
    return () => observer.disconnect();
  }, [measure]);

  const sizeStyle: CSSProperties =
    maxHeight === undefined
      ? {}
      : orientation === 'horizontal'
        ? { maxWidth: maxHeight }
        : { maxHeight };

  return (
    <div
      className={cx(styles.root, orientation === 'horizontal' ? styles.horizontal : styles.vertical, className)}
      data-orientation={orientation}
      data-fade-start={edges.start || undefined}
      data-fade-end={edges.end || undefined}
      style={{ ...sizeStyle, ...style }}
      {...rest}
    >
      <div
        ref={viewportRef}
        className={styles.viewport}
        tabIndex={0}
        role="group"
        onScroll={measure}
      >
        {children}
      </div>
    </div>
  );
}
