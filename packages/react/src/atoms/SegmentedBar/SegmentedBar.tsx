import type { ComponentProps } from 'react';
import { cx } from '../../internal/cx.ts';
import { Skeleton } from '../Skeleton/Skeleton.tsx';
import styles from './SegmentedBar.module.css';

export type SegmentedBarTone = 'accent' | 'success' | 'warning' | 'danger' | 'neutral';

export interface SegmentedBarSegment {
  value: number;
  tone?: SegmentedBarTone;
  label?: string;
}

export interface SegmentedBarProps extends ComponentProps<'div'> {
  /** Slices sized by proportion of the total. Zero-value slices are omitted. */
  data: SegmentedBarSegment[];
  /** Bar thickness: sm 0.375rem, md 0.625rem. */
  size?: 'sm' | 'md';
  /** Round the bar ends with a full radius. */
  rounded?: boolean;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Accessible name for the bar. Falls back to a generated breakdown. */
  'aria-label'?: string;
}

function summarize(data: SegmentedBarSegment[]): string {
  const total = data.reduce((sum, seg) => sum + Math.max(seg.value, 0), 0);
  if (total <= 0) return 'Segmented bar';
  const parts = data
    .filter((seg) => seg.value > 0)
    .map((seg) => {
      const percent = Math.round((seg.value / total) * 100);
      return seg.label ? `${seg.label} ${percent}%` : `${percent}%`;
    });
  return parts.join(', ');
}

/**
 * A single proportional bar split into slices sized by share of the total.
 * Unlike Meter, which is discrete equal pips for a level, SegmentedBar shows a
 * continuous breakdown of parts, such as a storage or budget split.
 */
export function SegmentedBar({
  data,
  size = 'md',
  rounded = true,
  skeleton = false,
  className,
  'aria-label': ariaLabel,
  ...rest
}: SegmentedBarProps) {
  if (skeleton) {
    return (
      <Skeleton
        width="100%"
        height={size === 'sm' ? '0.375rem' : '0.625rem'}
        radius="var(--perfect-radius-full)"
        className={className}
      />
    );
  }

  const total = data.reduce((sum, seg) => sum + Math.max(seg.value, 0), 0);

  return (
    <div
      role="img"
      aria-label={ariaLabel ?? summarize(data)}
      className={cx(styles.bar, styles[size], rounded && styles.rounded, className)}
      {...rest}
    >
      {total > 0 &&
        data
          .filter((seg) => seg.value > 0)
          .map((seg, i) => (
            <div
              key={i}
              className={cx(styles.slice, styles[seg.tone ?? 'accent'])}
              style={{ width: `${(seg.value / total) * 100}%` }}
            />
          ))}
    </div>
  );
}
