import { timelineScrubberMarkerTones } from '@glacier/spec';
import { useCallback, useRef, useState, type ComponentProps, type KeyboardEvent, type PointerEvent } from 'react';
import { cx } from '../../internal/cx.ts';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import styles from './TimelineScrubber.module.css';

// Derived from the spec so the tone union cannot drift.
export type TimelineScrubberMarkerTone = (typeof timelineScrubberMarkerTones)[number];

export interface TimelineScrubberMarker {
  /** Epoch milliseconds; clamped into the window. */
  time: number;
  /** Tick color family. Defaults to neutral. */
  tone?: TimelineScrubberMarkerTone;
  /** Accessible description of the event, surfaced as the tick tooltip. */
  label?: string;
}

export interface TimelineScrubberProps extends Omit<ComponentProps<'div'>, 'onChange'> {
  /** Window start, epoch milliseconds. */
  start: number;
  /** Window end, epoch milliseconds. While live this is "now" and advances as new samples arrive. */
  end: number;
  /** The inspected time. Omit to pin the playhead to the live edge. */
  value?: number;
  /** Called with the scrubbed time as the playhead moves, or null when the user returns to live. */
  onChange?: (time: number | null) => void;
  /** Optional normalized 0-1 context series rendered as the track backdrop. */
  activity?: number[];
  /** Flagged instants drawn as thin ticks over the track. */
  markers?: TimelineScrubberMarker[];
  /** Arrow-key step in milliseconds; PageUp/PageDown move by ten steps. */
  step?: number;
  /** Formats a timestamp for the readout, the ticks, and aria-valuetext. */
  formatTime?: (time: number) => string;
  /** Track height step. The handle adds its overhang above the track. */
  size?: 'sm' | 'md';
  /** Renders the track on the frosted glass material. */
  glass?: boolean;
  /** Blocks scrubbing and dims the control. */
  disabled?: boolean;
  /** Renders a placeholder with the exact geometry. */
  skeleton?: boolean;
  /** Accessible name for the scrubber. */
  'aria-label': string;
}

const defaultFormat = (time: number) => new Date(time).toLocaleTimeString();

/** Scrubbing within this fraction of the trailing edge snaps back to live. */
const LIVE_SNAP = 0.995;

/**
 * A flight-recorder control: a horizontal band over a recorded time window
 * with an activity backdrop, event markers, and a draggable playhead. Scrub
 * to inspect any recorded moment, or pin the playhead to the live edge and
 * let new time stream in. Controlled: `value` is the inspected time (omit for
 * live) and `onChange` reports scrubs, with null meaning "back to live".
 */
export function TimelineScrubber({
  start,
  end,
  value,
  onChange,
  activity,
  markers,
  step = 1000,
  formatTime = defaultFormat,
  size = 'md',
  glass = false,
  disabled = false,
  skeleton = false,
  className,
  'aria-label': ariaLabel,
  ...rest
}: TimelineScrubberProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrubbing, setScrubbing] = useState(false);

  const live = value === undefined;
  const windowSpan = Math.max(end - start, 1);
  const clamped = live ? end : Math.min(Math.max(value, start), end);
  const fraction = (clamped - start) / windowSpan;

  const timeFromPointer = useCallback(
    (event: PointerEvent<HTMLDivElement>): number | null => {
      const track = trackRef.current;
      if (!track) return null;
      const rect = track.getBoundingClientRect();
      const f = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
      return f >= LIVE_SNAP ? null : start + f * windowSpan;
    },
    [start, windowSpan],
  );

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // jsdom and some synthetic events have no active pointer to capture
    }
    setScrubbing(true);
    onChange?.(timeFromPointer(event));
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled || !scrubbing) return;
    onChange?.(timeFromPointer(event));
  };

  const endScrub = () => setScrubbing(false);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const moves: Record<string, number | null> = {
      ArrowLeft: clamped - step,
      ArrowRight: clamped + step >= end ? null : clamped + step,
      PageDown: clamped - step * 10,
      PageUp: clamped + step * 10 >= end ? null : clamped + step * 10,
      Home: start,
      End: null,
    };
    const next = moves[event.key];
    if (next === undefined) return;
    event.preventDefault();
    onChange?.(next === null ? null : Math.min(Math.max(next, start), end));
  };

  if (skeleton) {
    return (
      <div className={cx(styles.root, styles[size], className)} {...rest}>
        <Skeleton height={size === 'sm' ? '2.5rem' : '3.5rem'} width="100%" radius="var(--glacier-radius-md)" />
      </div>
    );
  }

  const activityPath =
    activity && activity.length >= 2
      ? `M ${activity
          .map((v, i) => `${(i / (activity.length - 1)) * 100} ${100 - Math.min(Math.max(v, 0), 1) * 100}`)
          .join(' L ')} L 100 100 L 0 100 Z`
      : undefined;

  return (
    <div
      className={cx(styles.root, styles[size], glass && styles.glass, className)}
      data-live={live || undefined}
      data-disabled={disabled || undefined}
      {...rest}
    >
      <div
        ref={trackRef}
        className={styles.track}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endScrub}
        onPointerCancel={endScrub}
      >
        {/* everything painted on the track clips to its rounding; the playhead
            lives outside this layer so its handle rides above the edge */}
        <div className={styles.clip} aria-hidden="true">
          {activityPath && (
            <svg className={styles.activity} viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d={activityPath} />
            </svg>
          )}
          {markers?.map((marker, i) => {
            const f = Math.min(Math.max((marker.time - start) / windowSpan, 0), 1);
            return (
              <span
                key={i}
                className={styles.marker}
                data-tone={marker.tone ?? 'neutral'}
                style={{ left: `${f * 100}%` }}
                title={marker.label}
              />
            );
          })}
        </div>
        <div
          className={styles.playhead}
          style={{ left: `${fraction * 100}%` }}
          data-scrubbing={scrubbing || undefined}
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-label={ariaLabel}
          aria-valuemin={start}
          aria-valuemax={end}
          aria-valuenow={clamped}
          aria-valuetext={formatTime(clamped)}
          aria-disabled={disabled || undefined}
          onKeyDown={handleKeyDown}
        >
          <span className={styles.handle} />
          {scrubbing && !live && <span className={styles.readout}>{formatTime(clamped)}</span>}
        </div>
      </div>
      {markers && markers.length > 0 && (
        <div className={styles.markerLabels} aria-hidden="true">
          {markers.map((marker, i) => {
            const f = Math.min(Math.max((marker.time - start) / windowSpan, 0), 1);
            const edge = f === 0 ? 'start' : f === 1 ? 'end' : undefined;
            return (
              <span key={i} className={styles.markerLabel} style={{ left: `${f * 100}%` }} data-edge={edge} data-row={i % 2}>
                {formatTime(marker.time)}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
