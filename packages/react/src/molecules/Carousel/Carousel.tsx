import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
  type WheelEvent,
} from 'react';
import { Variant } from '@glacier/spec';
import { cx } from '../../internal/cx.ts';
import { useT } from '../../i18n/LocaleProvider.tsx';
import { kitMessages } from '../../i18n/messages.ts';
import { IconButton } from '../../atoms/inputs/Button/IconButton.tsx';
import styles from './Carousel.module.css';

const chevronLeft = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10 3.5 5.5 8l4.5 4.5" />
  </svg>
);
const chevronRight = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 3.5 10.5 8 6 12.5" />
  </svg>
);

export interface CarouselProps extends ComponentProps<'div'> {
  /** The card children laid out in a horizontal snap-scroll strip. */
  children?: ReactNode;
  /** Shows prev/next controls that appear when the strip overflows. */
  showControls?: boolean;
  /** Space between cards; any CSS length or a `var(--glacier-space-*)`. */
  gap?: string;
  /** Accessible label for the scrollable region. */
  'aria-label'?: string;
  className?: string;
}

/**
 * A horizontal snap-scroll strip that hosts arbitrary card children. It uses
 * CSS scroll-snap for tidy per-card stops, converts vertical wheel gestures to
 * horizontal scroll, and - when `showControls` is set - renders prev/next
 * IconButtons that appear only while the strip overflows, disabling at each end.
 */
export function Carousel({
  children,
  showControls = false,
  gap = 'var(--glacier-space-4)',
  className,
  style,
  'aria-label': ariaLabel,
  ...rest
}: CarouselProps) {
  const t = useT();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setOverflowing(max > 1);
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(el.scrollLeft >= max - 1);
  }, []);

  // Track overflow and edges as the content, size, or scroll position change.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    sync();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    for (const child of Array.from(el.children)) observer.observe(child);
    return () => observer.disconnect();
  }, [sync, children]);

  // Map vertical wheel intent onto horizontal scroll for trackpad/mouse users.
  function onWheel(event: WheelEvent<HTMLDivElement>) {
    const el = scrollerRef.current;
    if (!el) return;
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    const max = el.scrollWidth - el.clientWidth;
    if (max <= 0) return;
    const next = el.scrollLeft + event.deltaY;
    // Only claim the gesture while there is room to scroll in that direction.
    if ((event.deltaY < 0 && el.scrollLeft > 0) || (event.deltaY > 0 && el.scrollLeft < max)) {
      event.preventDefault();
      el.scrollLeft = next;
    }
  }

  function page(direction: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' });
  }

  const rootStyle = { '--carousel-gap': gap, ...style } as CSSProperties;

  return (
    <div {...rest} className={cx(styles.root, className)} style={rootStyle}>
      {showControls && (
        <span className={cx(styles.controlSlot, styles.prev)} data-hidden={!overflowing || undefined}>
          <IconButton
            variant={Variant.Soft}
            aria-label={t(kitMessages.previous)}
            className={styles.control}
            disabled={atStart}
            tabIndex={-1}
            onClick={() => page(-1)}
          >
            {chevronLeft}
          </IconButton>
        </span>
      )}
      <div
        ref={scrollerRef}
        role="group"
        aria-label={ariaLabel}
        className={styles.scroller}
        tabIndex={0}
        onWheel={onWheel}
        onScroll={sync}
      >
        {children}
      </div>
      {showControls && (
        <span className={cx(styles.controlSlot, styles.next)} data-hidden={!overflowing || undefined}>
          <IconButton
            variant={Variant.Soft}
            aria-label={t(kitMessages.next)}
            className={styles.control}
            disabled={atEnd}
            tabIndex={-1}
            onClick={() => page(1)}
          >
            {chevronRight}
          </IconButton>
        </span>
      )}
    </div>
  );
}
