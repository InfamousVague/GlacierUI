import { useEffect, useRef, type ComponentProps, type KeyboardEvent } from 'react';
import { cx } from '../../internal/cx.ts';
import { Text } from '../../atoms/display/Typography/Text.tsx';
import styles from './Lyrics.module.css';

/** One synced line: when it starts, and what it says. */
export interface LyricLine {
  /** Seconds from the top of the track. */
  time: number;
  text: string;
}

export interface LyricsProps extends Omit<ComponentProps<'div'>, 'onSelect'> {
  /** The synced lines, in time order. Empty renders the empty message. */
  lines: readonly LyricLine[];
  /**
   * Playback position in seconds; the last line at or before it is active.
   * Omit for unsynced text - no line lights and nothing follows.
   */
  position?: number;
  /**
   * Called with the pressed line - seek the player to `line.time`. Without
   * it the lines render as plain text rather than buttons.
   */
  onLineSelect?: (line: LyricLine) => void;
  /** The empty message, replaceable for localization. */
  emptyLabel?: string;
}

/** How long the scroll stays the user's after they take it. */
const BROWSE_HOLD_MS = 2500;

/**
 * Time-synced lyrics: the song's timeline made legible. The active line is
 * lit and kept centred while playback moves; every line is a seek target when
 * the host can seek; and the moment the user takes the scroll, the follow
 * yields - a surface that fought the hand would be worse than one that never
 * followed at all.
 *
 * The component is deliberately stateless about time: the host owns playback
 * and hands in `position`, so the same component follows an `<audio>`, a
 * stream, or a test's bare number.
 */
export function Lyrics({
  lines,
  position,
  onLineSelect,
  emptyLabel = 'No lyrics for this track',
  className,
  ...rest
}: LyricsProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  // When the user last took the scroll; the follow stands aside until a beat
  // after. A timestamp rather than a boolean so no timer needs clearing.
  const browsingUntil = useRef(0);
  // Set while the component scrolls itself, so its own smooth scroll's
  // events are not mistaken for the user browsing.
  const following = useRef(false);
  // False until the first centring. The first one is a jump, not a flight: a
  // popover opened mid-song must OPEN on the active line, and a smooth scroll
  // across the whole sheet would outlast the following latch - its tail read
  // as the user browsing, parking the follow right after it arrives.
  const centred = useRef(false);

  const active =
    position === undefined
      ? -1
      : lines.reduce((found, line, index) => (line.time <= position ? index : found), -1);

  // Follow the active line: centre it whenever it changes, unless the user
  // holds the scroll. Keyed on the index, not the position - the scroll moves
  // when the song reaches a new line, not sixty times a second.
  useEffect(() => {
    if (active < 0) return;
    const scroller = scrollerRef.current;
    const line = scroller?.querySelector<HTMLElement>(`[data-index='${active}']`);
    if (!scroller || !line) return;
    if (performance.now() < browsingUntil.current) return;
    const target = line.offsetTop - scroller.clientHeight / 2 + line.offsetHeight / 2;
    following.current = true;
    // Smooth only between neighbours and where motion is welcome; the first
    // centring jumps. jsdom has no scrollTo at all.
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const smooth = centred.current && !reduce;
    centred.current = true;
    scroller.scrollTo?.({ top: Math.max(0, target), behavior: smooth ? 'smooth' : 'auto' });
    // The follow's own scroll events drain within the smooth scroll's run.
    const done = window.setTimeout(() => {
      following.current = false;
    }, 400);
    return () => window.clearTimeout(done);
  }, [active]);

  // The user taking the scroll - by wheel, touch, or grabbing the bar - parks
  // the follow. Scroll events alone cannot be trusted: the follow fires them
  // too, which is what the `following` latch is for.
  const takeScroll = () => {
    browsingUntil.current = performance.now() + BROWSE_HOLD_MS;
  };
  const onScroll = () => {
    if (!following.current) takeScroll();
  };

  // Home/End are the scroller's own; arrows walk lines naturally via Tab
  // order. Nothing to intercept - listed here so the intent is legible.
  const onKeyDown = (_event: KeyboardEvent<HTMLDivElement>) => {};

  if (lines.length === 0) {
    return (
      <div className={cx(styles.lyrics, styles.empty, className)} {...rest}>
        <Text size="sm" tone="subtle">
          {emptyLabel}
        </Text>
      </div>
    );
  }

  return (
    <div
      ref={scrollerRef}
      className={cx(styles.lyrics, className)}
      onWheel={takeScroll}
      onTouchMove={takeScroll}
      onPointerDown={takeScroll}
      onScroll={onScroll}
      onKeyDown={onKeyDown}
      {...rest}
    >
      {lines.map((line, index) =>
        onLineSelect ? (
          <button
            key={`${line.time}-${index}`}
            type="button"
            className={styles.line}
            data-index={index}
            data-active={index === active || undefined}
            aria-current={index === active || undefined}
            onClick={() => {
              // The press's own pointerdown just parked the follow - but a
              // seek is the one gesture that MEANS "take me there", so the
              // hold is lifted and the sought line gets its centring.
              browsingUntil.current = 0;
              onLineSelect(line);
            }}
          >
            {line.text || '…'}
          </button>
        ) : (
          <span
            key={`${line.time}-${index}`}
            className={styles.line}
            data-index={index}
            data-active={index === active || undefined}
            aria-current={index === active || undefined}
          >
            {line.text || '…'}
          </span>
        ),
      )}
    </div>
  );
}
