import { progressRingTones } from '@perfect/spec';
import type { ComponentProps, ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { Skeleton } from '../Skeleton/Skeleton.tsx';
import styles from './ProgressRing.module.css';

// Derived from the spec so the tone union cannot drift.
export type ProgressRingTone = (typeof progressRingTones)[number];

export interface ProgressRingProps extends ComponentProps<'div'> {
  /** 0 to max. Clamped into range. */
  value: number;
  max?: number;
  /** Pixel diameter of the ring. */
  size?: number;
  /** Stroke width of the track and arc in pixels. */
  thickness?: number;
  tone?: ProgressRingTone;
  /** Centered content. Takes priority over showValue. */
  label?: ReactNode;
  /** With no label, render the rounded percentage in the center. */
  showValue?: boolean;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Accessible name for the ring. */
  'aria-label'?: string;
}

export function ProgressRing({
  value,
  max = 100,
  size = 48,
  thickness = 4,
  tone = 'accent',
  label,
  showValue = false,
  skeleton = false,
  className,
  ...rest
}: ProgressRingProps) {
  if (skeleton) {
    return <Skeleton variant="circle" width={size} className={className} />;
  }

  const clamped = Math.min(Math.max(value, 0), max);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference * (1 - clamped / max);
  const center = size / 2;
  const percent = Math.round((clamped / max) * 100);

  const hasLabel = label !== undefined && label !== null;
  const showsPercent = !hasLabel && showValue;

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={clamped}
      className={cx(styles.root, className)}
      {...rest}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={styles.svg}>
        <circle
          className={styles.track}
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={thickness}
        />
        <circle
          className={cx(styles.arc, tone !== 'accent' && styles[tone])}
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={thickness}
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
        />
      </svg>
      {hasLabel ? (
        <span className={styles.center}>{label}</span>
      ) : showsPercent ? (
        <span className={styles.center} aria-hidden="true">
          <span className={styles.value}>{percent}%</span>
        </span>
      ) : null}
    </div>
  );
}
