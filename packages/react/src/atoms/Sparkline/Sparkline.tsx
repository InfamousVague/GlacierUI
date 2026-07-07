import type { ComponentProps } from 'react';
import { cx } from '../../internal/cx.ts';
import { Skeleton } from '../Skeleton/Skeleton.tsx';
import styles from './Sparkline.module.css';

export interface SparklineProps extends ComponentProps<'svg'> {
  /** The series to plot. Empty or single-point data renders gracefully. */
  data: number[];
  /** line draws a polyline; bar draws evenly spaced columns. */
  variant?: 'line' | 'bar';
  width?: number;
  height?: number;
  tone?: 'accent' | 'success' | 'warning' | 'danger';
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Accessible name for the chart. */
  'aria-label'?: string;
}

/** Inset so a 2px line's round caps are not clipped at the edges. */
const LINE_INSET = 1;

/**
 * A minimal inline chart: a compact trend line or bar series with no axes,
 * labels, or grid. Use it to show shape at a glance beside a number, such as a
 * metric's recent history. The series carries no text, so give it an aria-label.
 */
export function Sparkline({
  data,
  variant = 'line',
  width = 120,
  height = 32,
  tone = 'accent',
  skeleton = false,
  className,
  'aria-label': ariaLabel = 'Sparkline',
  ...rest
}: SparklineProps) {
  if (skeleton) {
    return <Skeleton width={width} height={height} className={className} />;
  }

  const min = data.length > 0 ? Math.min(...data) : 0;
  const max = data.length > 0 ? Math.max(...data) : 0;
  const span = max - min;

  /** Map a value to a y coordinate, flat-lining at mid-height when span is 0. */
  const toY = (value: number): number => {
    if (span === 0) return height / 2;
    return height - ((value - min) / span) * height;
  };

  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cx(styles.svg, className)}
      {...rest}
    >
      {variant === 'line'
        ? renderLine(data, width, height, toY, tone)
        : renderBars(data, width, height, toY, tone)}
    </svg>
  );
}

function renderLine(
  data: number[],
  width: number,
  height: number,
  toY: (value: number) => number,
  tone: SparklineProps['tone'],
) {
  if (data.length === 0) return null;
  const usable = Math.max(width - LINE_INSET * 2, 0);
  const step = data.length > 1 ? usable / (data.length - 1) : 0;
  const points = data
    .map((value, i) => {
      const x = data.length > 1 ? LINE_INSET + i * step : width / 2;
      return `${x},${toY(value)}`;
    })
    .join(' ');
  return <polyline className={cx(styles.line, tone !== 'accent' && tone && styles[tone])} points={points} />;
}

function renderBars(
  data: number[],
  width: number,
  height: number,
  toY: (value: number) => number,
  tone: SparklineProps['tone'],
) {
  if (data.length === 0) return null;
  const gap = data.length > 1 ? 2 : 0;
  const barWidth = Math.max((width - gap * (data.length - 1)) / data.length, 0);
  return data.map((value, i) => {
    const x = i * (barWidth + gap);
    const y = toY(value);
    const barHeight = Math.max(height - y, 1);
    return (
      <rect
        key={i}
        className={cx(styles.bar, tone !== 'accent' && tone && styles[tone])}
        x={x}
        y={height - barHeight}
        width={barWidth}
        height={barHeight}
      />
    );
  });
}
