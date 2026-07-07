import { meterTones } from '@perfect/spec';
import type { ComponentProps } from 'react';
import { cx } from '../../internal/cx.ts';
import { Skeleton } from '../Skeleton/Skeleton.tsx';
import styles from './Meter.module.css';

// Derived from the spec so the tone union cannot drift.
export type MeterTone = (typeof meterTones)[number];

/** Segment heights per size, mirroring .sm .segment and .md .segment in the CSS. */
const SKELETON_SEGMENT_HEIGHTS = { sm: '0.25rem', md: '0.375rem' } as const;

export interface MeterProps extends ComponentProps<'div'> {
  /** Current level, 0 to max. */
  value: number;
  /** Upper bound. Defaults to the segment count, so value maps 1:1 to segments. */
  max?: number;
  /** Number of discrete segments. */
  segments?: number;
  /**
   * Fill color. 'auto' grades by level: the bottom third reads danger, the
   * middle third warning, the top success. Suits strength and health meters.
   */
  tone?: MeterTone;
  size?: 'sm' | 'md';
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Accessible name for the meter. */
  'aria-label'?: string;
}

function autoTone(ratio: number): 'danger' | 'warning' | 'success' {
  if (ratio <= 1 / 3) return 'danger';
  if (ratio <= 2 / 3) return 'warning';
  return 'success';
}

/**
 * A segmented level indicator (health bar): discrete pips that fill from the
 * left. Use ProgressBar for task progress; Meter is for how good or full
 * something currently is, like password strength or remaining quota.
 */
export function Meter({
  value,
  max,
  segments = 4,
  tone = 'auto',
  size = 'md',
  skeleton = false,
  className,
  ...rest
}: MeterProps) {
  if (skeleton) {
    return (
      <div className={cx(styles.meter, className)}>
        {Array.from({ length: segments }, (_, i) => (
          <Skeleton
            key={i}
            height={SKELETON_SEGMENT_HEIGHTS[size]}
            radius="var(--perfect-radius-full)"
            style={{ flex: 1 }}
          />
        ))}
      </div>
    );
  }
  const bound = max ?? segments;
  const clamped = Math.min(Math.max(value, 0), bound);
  const filled = Math.round((clamped / bound) * segments);
  const resolvedTone = tone === 'auto' ? autoTone(clamped / bound) : tone;

  return (
    <div
      role="meter"
      aria-valuemin={0}
      aria-valuemax={bound}
      aria-valuenow={clamped}
      className={cx(
        styles.meter,
        styles[size],
        resolvedTone !== 'accent' && styles[resolvedTone],
        className,
      )}
      {...rest}
    >
      {Array.from({ length: segments }, (_, i) => (
        <span key={i} className={styles.segment} data-filled={i < filled || undefined} />
      ))}
    </div>
  );
}
