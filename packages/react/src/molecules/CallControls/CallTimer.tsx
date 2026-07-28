import { formatDuration } from '@glacier/logic';
import type { ComponentProps } from 'react';
import { cx } from '../../internal/cx.ts';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import { useCallElapsed } from '@glacier/logic';
// TODO(integration): switch to '@glacier/spec' once the call-controls specs are
// registered in packages/spec/src/index.ts.
import { callTimerTones } from '../../../../spec/src/components/call-timer.ts';
import styles from './CallTimer.module.css';

// Derived from the spec so the union cannot drift from the contract.
export type CallTimerTone = (typeof callTimerTones)[number];
export { callTimerTones };

export interface CallTimerProps extends Omit<ComponentProps<'span'>, 'children'> {
  /** Controlled elapsed seconds. Wins over `startedAt`. */
  seconds?: number;
  /** Epoch milliseconds the call connected; the timer then ticks its own clock. */
  startedAt?: number;
  /** Stops the clock — a held call freezes rather than keeps counting. */
  running?: boolean;
  tone?: CallTimerTone;
  size?: 'sm' | 'md';
  /** Accessible name for the readout. */
  label?: string;
  /** Formats the seconds. Defaults to the kit-wide m:ss / h:mm:ss. */
  format?: (seconds: number) => string;
  /** Renders a placeholder the width of a settled readout. */
  skeleton?: boolean;
}

/**
 * How long the call has been running.
 *
 * The formatting is `formatDuration` from @glacier/logic — the same function
 * the player's clock reads, so a duration is written one way across the kit
 * rather than each surface inventing its own m:ss.
 *
 * It is `role="timer"` with `aria-live="off"` on purpose. A live region that
 * announced itself every second would make a screen reader unusable for the
 * length of the call; the duration is there to be asked for, not to interrupt.
 * (RecordingIndicator takes the opposite decision, and for the opposite reason:
 * a recording starting IS worth interrupting for.)
 */
export function CallTimer({
  seconds,
  startedAt,
  running = true,
  tone = 'default',
  size = 'md',
  label = 'Call duration',
  format = formatDuration,
  skeleton = false,
  className,
  ...rest
}: CallTimerProps) {
  const elapsed = useCallElapsed({ seconds, startedAt, running });

  if (skeleton) {
    // A settled readout is about five mono characters wide, so the header does
    // not reflow when the call connects.
    return <Skeleton variant="text" width="5ch" className={cx(styles.timer, styles[size], className)} />;
  }

  return (
    <span
      role="timer"
      aria-live="off"
      aria-label={label}
      className={cx(styles.timer, styles[size], styles[tone], className)}
      data-tone={tone}
      {...rest}
    >
      {format(elapsed)}
    </span>
  );
}
