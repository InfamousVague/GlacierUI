import { announcementMotions, announcementTones } from '@glacier/spec';
import { useEffect, useId, useState, type ComponentProps, type CSSProperties, type ReactNode } from 'react';
import { cx } from '../../../internal/cx.ts';
import { useT } from '../../../i18n/LocaleProvider.tsx';
import { kitMessages } from '../../../i18n/messages.ts';
import styles from './Announcements.module.css';

export type AnnouncementTone = (typeof announcementTones)[number];

/** How the strip moves through its updates. */
export type AnnouncementMotion = (typeof announcementMotions)[number];

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
  /**
   * Fixed content pinned at the leading edge, before the viewport.
   *
   * Unlike an item's own `label`, this belongs to the STRIP rather than to any
   * one update, so it does not travel with them - it names what the strip is
   * ("New", "Status", "Live") and stays put while the news moves past it. A
   * Pill or Badge is the usual thing to put here.
   */
  tag?: ReactNode;
  /** Semantic color family for the strip. */
  tone?: AnnouncementTone;
  /**
   * `step` shows one update at a time and swaps them on the interval.
   * `marquee` scrolls the whole list past continuously, so every update is on
   * its way through rather than waiting its turn.
   */
  motion?: AnnouncementMotion;
  /** Controlled index of the current update. Step motion only. */
  index?: number;
  /** Initially visible update in uncontrolled use. Step motion only. */
  defaultIndex?: number;
  /** Called whenever a user action or auto-rotation selects a new update. */
  onIndexChange?: (index: number) => void;
  /**
   * Makes each update activatable - clicked, or reached by keyboard and
   * entered. Supply it when an update opens something: the fuller note, a
   * release page, a modal. Without it the strip is read-only text.
   */
  onItemSelect?: (item: AnnouncementItem, index: number) => void;
  /** Whether updates should move until the user pauses or interacts. */
  autoPlay?: boolean;
  /** Step motion: delay in milliseconds between automatic updates. */
  interval?: number;
  /**
   * Marquee motion: seconds each update takes to cross the strip. Travel time
   * is this times the number of updates, so adding an update lengthens the
   * loop rather than speeding every update up.
   */
  secondsPerItem?: number;
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
 * A compact application-chrome ticker for short updates. It either steps
 * through them one at a time or scrolls the whole list past continuously;
 * either way movement stops while the region is hovered or focused, and a
 * persistent pause control lets people hold an update still to read - or to
 * click, when the updates open something.
 */
export function Announcements({
  items,
  tag,
  tone = 'info',
  motion = 'step',
  index,
  defaultIndex = 0,
  onIndexChange,
  onItemSelect,
  autoPlay = true,
  interval = 7000,
  secondsPerItem = 7,
  className,
  style,
  'aria-label': ariaLabel,
  onMouseEnter,
  onMouseLeave,
  onFocusCapture,
  onBlurCapture,
  ...rest
}: AnnouncementsProps) {
  const t = useT();
  const [uncontrolledIndex, setUncontrolledIndex] = useState(defaultIndex);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const labelId = useId();
  const marquee = motion === 'marquee';
  const currentIndex = clampIndex(index ?? uncontrolledIndex, items.length);
  const current = items[currentIndex];
  const many = items.length > 1;

  function select(nextIndex: number) {
    const next = ((nextIndex % items.length) + items.length) % items.length;
    if (index == null) setUncontrolledIndex(next);
    onIndexChange?.(next);
  }

  useEffect(() => {
    if (marquee || !autoPlay || paused || interacting || !many) return;
    const timer = setInterval(() => select(currentIndex + 1), interval);
    return () => clearInterval(timer);
  }, [marquee, autoPlay, paused, interacting, many, currentIndex, interval]);

  if (!current) return null;

  function pauseForInteraction() {
    setInteracting(true);
  }

  function resumeAfterInteraction(event: React.FocusEvent<HTMLElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false);
  }

  /** One update's label and text, as a button when it opens something. */
  function renderItem(item: AnnouncementItem, itemIndex: number) {
    const body = (
      <>
        {item.label != null && <span className={styles.label}>{item.label}</span>}
        <span className={styles.content}>{item.content}</span>
      </>
    );
    if (!onItemSelect) return body;
    return (
      <button type="button" className={styles.itemButton} onClick={() => onItemSelect(item, itemIndex)}>
        {body}
      </button>
    );
  }

  /** The marquee's updates laid end to end - one full lap of the news. */
  const run = (
    <div className={styles.run}>
      {items.map((item, itemIndex) => (
        <span className={styles.item} key={item.id}>
          {renderItem(item, itemIndex)}
        </span>
      ))}
    </div>
  );

  // Marquee motion is worth running for a single update, because there the
  // point is the travel; stepping needs somewhere to step to.
  const showControls = marquee || many;

  return (
    <section
      {...rest}
      role="region"
      aria-label={ariaLabel ?? t(kitMessages.announcements)}
      className={cx(styles.root, styles[tone], marquee && styles.marqueeRoot, className)}
      data-paused={(marquee && paused) || undefined}
      style={
        marquee
          ? ({ ...style, '--glacier-announcements-travel': `${Math.max(1, items.length) * secondsPerItem}s` } as CSSProperties)
          : style
      }
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
      <span id={labelId} className={styles.srOnly}>{t(kitMessages.announcementsUpdates)}</span>
      {/* Outside the viewport on purpose: inside it the tag would be clipped by
          the overflow, faded by the marquee's edge mask, and - worst - would
          scroll away with the first update, which is the one thing a strip
          label must never do. */}
      {tag != null && <span className={styles.tag}>{tag}</span>}
      <div className={styles.viewport} aria-labelledby={labelId} aria-live="off">
        {marquee ? (
          // Two identical runs travelling exactly one run's width before
          // resetting: at the moment it snaps back, run two sits precisely
          // where run one started, so there is no seam to see and no
          // measurement to keep in sync with the content.
          <div className={styles.track}>
            {run}
            {/* The second run is scenery. `inert` keeps its copy of every
                update out of the accessibility tree AND out of the tab order,
                so the news is announced once and Tab visits each update once,
                while run one stays a real, focusable, clickable copy. */}
            <div className={styles.clone} aria-hidden="true" inert>
              {run}
            </div>
          </div>
        ) : (
          <div className={styles.message} key={current.id}>
            {renderItem(current, currentIndex)}
          </div>
        )}
      </div>
      {showControls && (
        <div className={styles.controls}>
          {!marquee && (
            <button type="button" className={styles.control} aria-label={t(kitMessages.announcementsPrevious)} onClick={() => select(currentIndex - 1)}>
              {PreviousIcon}
            </button>
          )}
          {!marquee && (
            <span className={styles.position} aria-live="polite" aria-atomic="true">
              {t(kitMessages.announcementsPosition, { current: currentIndex + 1, total: items.length })}
            </span>
          )}
          <button
            type="button"
            className={styles.control}
            aria-label={paused ? t(kitMessages.announcementsResume) : t(kitMessages.announcementsPause)}
            aria-pressed={paused}
            onClick={() => {
              setInteracting(false);
              setPaused((value) => !value);
            }}
          >
            {paused ? PlayIcon : PauseIcon}
          </button>
          {!marquee && (
            <button type="button" className={styles.control} aria-label={t(kitMessages.announcementsNext)} onClick={() => select(currentIndex + 1)}>
              {NextIcon}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
