import { stepsSizes, stepsTones } from '@perfect/spec';
import type { ComponentProps } from 'react';
import { cx } from '../../internal/cx.ts';
import { Skeleton } from '../Skeleton/Skeleton.tsx';
import styles from './Steps.module.css';

// Derived from the spec so the tone and size unions cannot drift.
export type StepsTone = (typeof stepsTones)[number];
export type StepsSize = (typeof stepsSizes)[number];

/** Dot diameter per size, mirroring the .sm/.md rules in the CSS. */
const DIAMETER_REM: Record<StepsSize, string> = {
  sm: '0.375rem',
  md: '0.5rem',
};

export interface StepsProps extends Omit<ComponentProps<'div'>, 'children'> {
  /** Total number of steps; renders this many dots. */
  count: number;
  /** Zero-based index of the current step. Earlier dots read completed, later ones upcoming. */
  active?: number;
  /** Semantic color family for completed and current dots. */
  tone?: StepsTone;
  /** Compact size step; sets dot diameter and gap. */
  size?: 'sm' | 'md';
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
}

/**
 * A row of progress dots marking position through a tour, wizard, or quiz.
 * Dots before the active index read as completed and fill solid in the tone;
 * the active dot is enlarged to mark the current step; later dots are hollow
 * with a hairline border. Position is announced by the group label, not color.
 */
export function Steps({
  count,
  active = 0,
  tone = 'accent',
  size = 'md',
  skeleton = false,
  className,
  ...rest
}: StepsProps) {
  const diameter = DIAMETER_REM[size];
  const dots = Math.max(0, Math.floor(count));

  if (skeleton) {
    return (
      <div className={cx(styles.track, styles[size], className)} aria-hidden="true">
        {Array.from({ length: dots }, (_, i) => (
          <Skeleton key={i} variant="circle" width={diameter} />
        ))}
      </div>
    );
  }

  const current = Math.min(Math.max(active, 0), Math.max(dots - 1, 0));

  return (
    <div
      role="group"
      aria-label={`Step ${Math.min(current + 1, dots)} of ${dots}`}
      className={cx(styles.track, styles[size], className)}
      {...rest}
    >
      {Array.from({ length: dots }, (_, i) => {
        const state =
          i < current ? styles.completed : i === current ? styles.current : styles.upcoming;
        return <span key={i} className={cx(styles.dot, styles[tone], state)} aria-hidden="true" />;
      })}
    </div>
  );
}
