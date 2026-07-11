import { sparklineShapes, sparklineTones } from '@glacier/spec';
import type { ComponentProps } from 'react';
import { cx } from '../../../internal/cx.ts';
import { Skeleton } from '../../feedback/Skeleton/Skeleton.tsx';
import styles from './Sparkline.module.css';

// Derived from the spec so the unions cannot drift.
export type SparklineShape = (typeof sparklineShapes)[number];
export type SparklineTone = (typeof sparklineTones)[number];

/** Box heights per size, mirroring .sm/.md/.lg in the CSS. */
const SKELETON_HEIGHTS = { sm: '1rem', md: '1.5rem', lg: '2.25rem' } as const;

export interface SparklineProps extends ComponentProps<'span'> {
  /** The series, oldest first. The sparkline renders whatever slice it is given. */
  data: number[];
  /** Fixed lower bound of the value domain. Defaults to the data minimum. */
  min?: number;
  /** Fixed upper bound of the value domain. Defaults to the data maximum. */
  max?: number;
  /** Draws a dashed reference line at this value when it sits inside the domain. */
  baseline?: number;
  /** How the series is marked: a thin line, a line over a soft fill, or micro bars. */
  shape?: SparklineShape;
  /** Ink family for the mark. */
  tone?: SparklineTone;
  /** Height step; the width is fluid and follows the container. */
  size?: 'sm' | 'md' | 'lg';
  /** Marks the newest sample with an emphasis dot. */
  endPoint?: boolean;
  /** Renders a placeholder with the exact geometry. */
  skeleton?: boolean;
  /** Accessible name; describe the trend, not the pixels. */
  'aria-label': string;
}

/** Map samples into the 0-100 viewBox, y inverted so larger values sit higher. */
function project(data: number[], min: number, max: number): { x: number; y: number }[] {
  const span = max - min || 1;
  const lastIndex = Math.max(data.length - 1, 1);
  return data.map((v, i) => ({
    x: (i / lastIndex) * 100,
    y: 100 - ((Math.min(Math.max(v, min), max) - min) / span) * 100,
  }));
}

/**
 * A word-sized trend graphic: a single series as a thin line, a soft-filled
 * area, or micro bars, for table cells, stat tiles, and dense monitoring rows.
 * It carries no axes or labels - the surrounding text does the naming - and it
 * is an impression, not a reading: pair it with a text value that carries the
 * actual figure. Pin min/max (e.g. 0-100 for percentages) so rows in a column
 * share one scale.
 */
export function Sparkline({
  data,
  min,
  max,
  baseline,
  shape = 'line',
  tone = 'accent',
  size = 'md',
  endPoint = false,
  skeleton = false,
  className,
  'aria-label': ariaLabel,
  ...rest
}: SparklineProps) {
  if (skeleton) {
    return (
      <span className={cx(styles.root, styles[size], className)} {...rest}>
        <Skeleton height={SKELETON_HEIGHTS[size]} width="100%" radius="var(--glacier-radius-sm)" />
      </span>
    );
  }

  const lo = min ?? (data.length ? Math.min(...data) : 0);
  const hi = max ?? (data.length ? Math.max(...data) : 1);
  const points = project(data, lo, hi);
  const hasMark = data.length >= 2;
  const span = hi - lo || 1;
  const baselineY =
    baseline !== undefined && baseline >= lo && baseline <= hi
      ? 100 - ((baseline - lo) / span) * 100
      : undefined;
  const last = points[points.length - 1];

  const linePath = hasMark ? `M ${points.map((p) => `${p.x} ${p.y}`).join(' L ')}` : '';
  const areaPath = hasMark ? `${linePath} L 100 100 L 0 100 Z` : '';

  return (
    <span
      role="img"
      aria-label={ariaLabel}
      className={cx(styles.root, styles[size], styles[tone], className)}
      {...rest}
    >
      {hasMark && shape !== 'bars' && (
        <svg className={styles.plot} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {shape === 'area' && <path className={styles.fill} d={areaPath} />}
          <path className={styles.line} d={linePath} vectorEffect="non-scaling-stroke" fill="none" />
        </svg>
      )}
      {hasMark && shape === 'bars' && (
        <span className={styles.bars} aria-hidden="true">
          {points.map((p, i) => (
            <span key={i} className={styles.bar} style={{ height: `${Math.max(100 - p.y, 4)}%` }} />
          ))}
        </span>
      )}
      {baselineY !== undefined && <span className={styles.baseline} style={{ top: `${baselineY}%` }} />}
      {hasMark && endPoint && shape !== 'bars' && last && (
        <span className={styles.point} style={{ left: `${last.x}%`, top: `${last.y}%` }} />
      )}
    </span>
  );
}
