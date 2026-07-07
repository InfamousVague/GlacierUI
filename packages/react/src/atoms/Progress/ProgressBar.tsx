import type { ComponentProps } from 'react';
import { cx } from '../../internal/cx.ts';
import { Skeleton } from '../Skeleton/Skeleton.tsx';
import styles from './Progress.module.css';

export interface ProgressBarProps extends ComponentProps<'div'> {
  /** 0 to max. Omit (or set indeterminate) for an unknown duration. */
  value?: number;
  max?: number;
  indeterminate?: boolean;
  size?: 'sm' | 'md';
  tone?: 'accent' | 'success' | 'warning' | 'danger';
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Accessible name for the bar. */
  'aria-label'?: string;
}

const TRACK_SIZE = { sm: 'trackSm', md: 'trackMd' } as const;

const SKELETON_HEIGHTS: Record<'sm' | 'md', string> = { sm: '0.375rem', md: '0.625rem' };

export function ProgressBar({
  value,
  max = 100,
  indeterminate = false,
  size = 'md',
  tone = 'accent',
  skeleton = false,
  className,
  ...rest
}: ProgressBarProps) {
  const unknown = indeterminate || value === undefined;
  const clamped = unknown ? 0 : Math.min(Math.max(value, 0), max);
  if (skeleton) {
    return (
      <Skeleton
        width="100%"
        height={SKELETON_HEIGHTS[size]}
        radius="var(--perfect-radius-full)"
        className={className}
      />
    );
  }
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={unknown ? undefined : clamped}
      className={cx(styles.track, styles[TRACK_SIZE[size]], unknown && styles.indeterminate, className)}
      {...rest}
    >
      <div
        className={cx(styles.fill, tone !== 'accent' && styles[tone])}
        style={unknown ? undefined : { width: `${(clamped / max) * 100}%` }}
      />
    </div>
  );
}
