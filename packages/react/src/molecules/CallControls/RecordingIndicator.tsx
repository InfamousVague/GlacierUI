import { formatDuration } from '@glacier/logic';
import { useReducedMotion } from 'motion/react';
import type { ComponentProps, ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import { StatusDot } from '../../atoms/display/StatusDot/StatusDot.tsx';
import {
  recordingState,
  shouldPulse,
  useCallElapsed,
  type RecordingState,
} from '@glacier/logic';
import styles from './RecordingIndicator.module.css';

export type { RecordingState };

/** Every word the indicator can say, so it can be spoken in any language. */
export interface RecordingIndicatorLabels {
  recording: string;
  paused: string;
  stopped: string;
}

const DEFAULT_LABELS: RecordingIndicatorLabels = {
  recording: 'Recording',
  paused: 'Recording paused',
  stopped: 'Not recording',
};

/** The dot tone per state; danger only while actually capturing. */
const DOT_TONE: Record<RecordingState, 'danger' | 'neutral'> = {
  recording: 'danger',
  paused: 'neutral',
  stopped: 'neutral',
};

export interface RecordingIndicatorProps extends Omit<ComponentProps<'div'>, 'children' | 'label'> {
  /** Whether a recording is running. */
  recording?: boolean;
  /** Running but paused: the dot holds still and the label says so. */
  paused?: boolean;
  /** What is happening. Defaults to the state's own wording. */
  label?: ReactNode;
  /** Controlled elapsed seconds for the readout. */
  seconds?: number;
  /** Epoch milliseconds the recording started; the indicator then ticks its own clock. */
  startedAt?: number;
  size?: 'sm' | 'md';
  /** Overrides the wording; merged over the English defaults. */
  labels?: Partial<RecordingIndicatorLabels>;
  /** Renders a placeholder with the exact geometry. */
  skeleton?: boolean;
}

/**
 * A pulsing dot and a label, so nobody in the call can miss that it is being
 * recorded.
 *
 * The dot is a StatusDot rather than a new circle — it already owns the
 * expanding-ring pulse and drops it under reduced motion — and the elapsed
 * readout is `formatDuration`, the same clock the player and CallTimer read.
 *
 * It is `role="status"` with `aria-live="polite"`, the opposite of CallTimer and
 * for the opposite reason: a recording starting or stopping is worth
 * interrupting for, and polite lands it at the next pause rather than cutting
 * across speech. The elapsed readout is aria-hidden so the live region announces
 * once instead of every second.
 *
 * Stopping does not unmount the row: the dot and label go quiet in place, so a
 * header does not reflow the moment a recording ends. And the state is carried
 * by the words, never only by the pulse — so it survives reduced motion, and
 * greyscale, alike.
 */
export function RecordingIndicator({
  recording = true,
  paused = false,
  label,
  seconds,
  startedAt,
  size = 'md',
  labels,
  skeleton = false,
  className,
  ...rest
}: RecordingIndicatorProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const reduce = useReducedMotion();
  const state = recordingState(recording, paused);
  // A paused recording freezes its readout rather than counting on.
  const elapsed = useCallElapsed({ seconds, startedAt, running: state === 'recording' });
  const hasElapsed = seconds !== undefined || startedAt !== undefined;

  if (skeleton) {
    return (
      <div className={cx(styles.indicator, styles[size], className)} aria-hidden="true">
        <StatusDot size="sm" skeleton />
        <Skeleton variant="text" width="7ch" />
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cx(styles.indicator, styles[size], styles[state], className)}
      data-state={state}
      {...rest}
    >
      <StatusDot size={size === 'sm' ? 'sm' : 'md'} tone={DOT_TONE[state]} pulse={shouldPulse(state, !!reduce)} />
      <span className={styles.label}>{label ?? text[state]}</span>
      {/* The live region says what is happening; the clock is decoration, and
          announcing it would re-fire the region every second. */}
      {hasElapsed && (
        <span className={styles.elapsed} aria-hidden="true">
          {formatDuration(elapsed)}
        </span>
      )}
    </div>
  );
}
