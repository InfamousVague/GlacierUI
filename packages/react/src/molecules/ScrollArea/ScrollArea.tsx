import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { ScrollbarAppearance, type scrollbarAppearances } from '@glacier/spec';
import { cx } from '../../internal/cx.ts';
import styles from './ScrollArea.module.css';

/** Which axis the content overflows and scrolls along. */
export type ScrollAreaOrientation = 'vertical' | 'horizontal';
export type ScrollbarAppearanceName = (typeof scrollbarAppearances)[number];

export interface ScrollAreaProps extends Omit<ComponentProps<'div'>, 'children'> {
  /**
   * Caps the viewport along the scroll axis: a CSS length or number of pixels.
   * For a vertical area this is a max-height; for a horizontal one, a max-width.
   */
  maxHeight?: number | string;
  /** Scroll axis. Vertical (the default) shows top/bottom fades; horizontal shows left/right. */
  orientation?: ScrollAreaOrientation;
  /** Visual treatment for the visible scrollbar. */
  scrollbarAppearance?: ScrollbarAppearanceName;
  /** Shows the half-opaque track behind the scrollbar thumb. */
  showScrollbarTrack?: boolean;
  /** Hides the scrollbar entirely; wheel, drag, keyboard, and touch scrolling all still work. */
  hideScrollbar?: boolean;
  /** The overflowing content. */
  children?: ReactNode;
}

type Edges = { start: boolean; end: boolean };
type ScrollbarMetrics = { visible: boolean; thumbSize: number; thumbOffset: number };

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
  scrollbarAppearance = ScrollbarAppearance.Default,
  showScrollbarTrack = true,
  hideScrollbar = false,
  className,
  style,
  children,
  ...rest
}: ScrollAreaProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState<Edges>({ start: false, end: false });
  const [scrollbar, setScrollbar] = useState<ScrollbarMetrics>({ visible: false, thumbSize: 100, thumbOffset: 0 });

  const measure = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const horizontal = orientation === 'horizontal';
    const scrollSize = horizontal ? el.scrollWidth : el.scrollHeight;
    const clientSize = horizontal ? el.clientWidth : el.clientHeight;
    const max = Math.max(scrollSize - clientSize, 0);
    const pos = horizontal
      // scrollLeft runs 0..-max in RTL, so its absolute value is the distance
      // from the inline start either way; clamp against sub-pixel rounding so
      // the end fade fully clears
      ? Math.min(Math.abs(el.scrollLeft), max)
      : Math.min(Math.max(el.scrollTop, 0), max);
    const thumbSize = Math.min(100, Math.max(12, (clientSize / Math.max(scrollSize, 1)) * 100));
    setEdges({ start: pos > 1, end: max - pos > 1 });
    setScrollbar({
      visible: max > 1,
      thumbSize,
      thumbOffset: max > 0 ? (pos / max) * (100 - thumbSize) : 0,
    });
  }, [orientation]);

  const scrollFromPointer = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const el = viewportRef.current;
    if (!el) return;
    const horizontal = orientation === 'horizontal';
    const bounds = event.currentTarget.getBoundingClientRect();
    const trackSize = horizontal ? bounds.width : bounds.height;
    const trackPosition = horizontal ? event.clientX - bounds.left : event.clientY - bounds.top;
    const scrollSize = horizontal ? el.scrollWidth : el.scrollHeight;
    const clientSize = horizontal ? el.clientWidth : el.clientHeight;
    const max = Math.max(scrollSize - clientSize, 0);
    const ratio = clientSize / Math.max(scrollSize, 1);
    const next = Math.max(0, Math.min(1, trackPosition / trackSize - ratio / 2)) * max;

    if (horizontal) {
      el.scrollLeft = getComputedStyle(el).direction === 'rtl' ? -next : next;
    } else {
      el.scrollTop = next;
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
  const scrollbarStyle = {
    '--scrollbar-thumb-size': `${scrollbar.thumbSize}%`,
    '--scrollbar-thumb-offset': `${scrollbar.thumbOffset}%`,
  } as CSSProperties;

  return (
    <div
      className={cx(
        styles.root,
        orientation === 'horizontal' ? styles.horizontal : styles.vertical,
        hideScrollbar && styles.hideScrollbar,
        className,
      )}
      data-orientation={orientation}
      data-fade-start={edges.start || undefined}
      data-fade-end={edges.end || undefined}
      style={style}
      {...rest}
    >
      {/* the cap belongs on the viewport: it is the overflow container, so
          constraining anything else leaves it content-sized and scroll-less */}
      <div
        ref={viewportRef}
        className={styles.viewport}
        style={sizeStyle}
        data-scrollbar-appearance={scrollbarAppearance}
        tabIndex={0}
        role="group"
        onScroll={measure}
      >
        {children}
      </div>
      {!hideScrollbar && scrollbar.visible && (
        <div
          className={styles.scrollbar}
          data-orientation={orientation}
          data-scrollbar-appearance={scrollbarAppearance}
          data-track-visible={showScrollbarTrack || undefined}
          style={scrollbarStyle}
          aria-hidden="true"
          onPointerDown={(event) => {
            event.preventDefault();
            event.currentTarget.setPointerCapture(event.pointerId);
            scrollFromPointer(event);
          }}
          onPointerMove={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) scrollFromPointer(event);
          }}
        >
          <span className={styles.thumb} />
        </div>
      )}
    </div>
  );
}
