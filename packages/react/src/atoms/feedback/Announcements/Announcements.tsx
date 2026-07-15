import { announcementTones } from '@glacier/spec';
import { useEffect, useId, useState, type ComponentProps, type ReactNode } from 'react';
import { cx } from '../../../internal/cx.ts';
import styles from './Announcements.module.css';

export type AnnouncementTone = (typeof announcementTones)[number];

export interface AnnouncementItem {
  /** Stable identity for the update, used for the slide transition and indicator. */
  id: string;
  /** Optional short category shown before the update text. */
  label?: ReactNode;
  /** The announcement message. */
  content: ReactNode;
}

export interface AnnouncementsProps extends Omit<ComponentProps<'section'>, 'children'> {
  /** Updates to rotate through. At least one item is required. */
  items: readonly AnnouncementItem[];
  /** Semantic color family for the strip. */
  tone?: AnnouncementTone;
  /** Controlled index of the current update. */
  index?: number;
  /** Initially visible update in uncontrolled use. */
  defaultIndex?: number;
  /** Called whenever a user action or auto-rotation selects a new update. */
  onIndexChange?: (index: number) => void;
  /** Whether updates should rotate until the user pauses or interacts. */
  autoPlay?: boolean;
  /** Delay in milliseconds between automatic updates. */
  interval?: number;
  /** Accessible name for the announcements region. */
  'aria-label'?: string;
}

const PreviousIcon = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="m8.5 3-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const NextIcon = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="m5.5 3 4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PauseIcon = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M4.5 3.5v7M9.5 3.5v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const PlayIcon = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="m5 3.5 5 3.5-5 3.5v-7Z" fill="currentColor" stroke="currentColor" strokeLinejoin="round" />
  </svg>
);

function clampIndex(index: number, length: number) {
  return Math.max(0, Math.min(index, length - 1));
}

/**
 * A compact application-chrome ticker for short, rotating updates. Auto-rotation
 * stops while the region is hovered or focused, and a persistent pause control
 * lets people keep the current update in view.
 */
export function Announcements({
  items,
  tone = 'info',
  index,
  defaultIndex = 0,
  onIndexChange,
  autoPlay = true,
  interval = 7000,
  className,
  'aria-label': ariaLabel = 'Announcements',
  onMouseEnter,
  onMouseLeave,
  onFocusCapture,
  onBlurCapture,
  ...rest
}: AnnouncementsProps) {
  const [uncontrolledIndex, setUncontrolledIndex] = useState(defaultIndex);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const labelId = useId();
  const currentIndex = clampIndex(index ?? uncontrolledIndex, items.length);
  const current = items[currentIndex];
  const canRotate = items.length > 1;

  function select(nextIndex: number) {
    const next = ((nextIndex % items.length) + items.length) % items.length;
    if (index == null) setUncontrolledIndex(next);
    onIndexChange?.(next);
  }

  useEffect(() => {
    if (!autoPlay || paused || interacting || !canRotate) return;
    const timer = setInterval(() => select(currentIndex + 1), interval);
    return () => clearInterval(timer);
  }, [autoPlay, paused, interacting, canRotate, currentIndex, interval]);

  if (!current) return null;

  function pauseForInteraction() {
    setInteracting(true);
  }

  function resumeAfterInteraction(event: React.FocusEvent<HTMLElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false);
  }

  return (
    <section
      {...rest}
      role="region"
      aria-label={ariaLabel}
      className={cx(styles.root, styles[tone], className)}
      onMouseEnter={(event) => {
        pauseForInteraction();
        onMouseEnter?.(event);
      }}
      onMouseLeave={(event) => {
        setInteracting(false);
        onMouseLeave?.(event);
      }}
      onFocusCapture={(event) => {
        pauseForInteraction();
        onFocusCapture?.(event);
      }}
      onBlurCapture={(event) => {
        resumeAfterInteraction(event);
        onBlurCapture?.(event);
      }}
    >
      <span id={labelId} className={styles.srOnly}>Updates</span>
      <div className={styles.viewport} aria-labelledby={labelId} aria-live="off">
        <div className={styles.message} key={current.id}>
          {current.label != null && <span className={styles.label}>{current.label}</span>}
          <span className={styles.content}>{current.content}</span>
        </div>
      </div>
      {canRotate && (
        <div className={styles.controls} aria-label="Announcement controls">
          <button type="button" className={styles.control} aria-label="Previous announcement" onClick={() => select(currentIndex - 1)}>
            {PreviousIcon}
          </button>
          <span className={styles.position} aria-live="polite" aria-atomic="true">
            {currentIndex + 1} of {items.length}
          </span>
          <button
            type="button"
            className={styles.control}
            aria-label={paused ? 'Resume announcements' : 'Pause announcements'}
            aria-pressed={paused}
            onClick={() => {
              setInteracting(false);
              setPaused((value) => !value);
            }}
          >
            {paused ? PlayIcon : PauseIcon}
          </button>
          <button type="button" className={styles.control} aria-label="Next announcement" onClick={() => select(currentIndex + 1)}>
            {NextIcon}
          </button>
        </div>
      )}
    </section>
  );
}