import { counterBadgeTones } from '@perfect/spec';
import type { ComponentProps } from 'react';
import { cx } from '../../internal/cx.ts';
import { Skeleton } from '../Skeleton/Skeleton.tsx';
import styles from './CounterBadge.module.css';

// Derived from the spec so the tone union cannot drift.
export type CounterBadgeTone = (typeof counterBadgeTones)[number];

export interface CounterBadgeProps extends Omit<ComponentProps<'span'>, 'children'> {
  count: number;
  /** Render `${max}+` when count is greater than max. */
  max?: number;
  tone?: CounterBadgeTone;
  /** Render a small dot with no number, for presence or attention. */
  dot?: boolean;
  size?: 'sm' | 'md';
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  'aria-label'?: string;
}

/**
 * A small numeric badge for unread or attention counts on nav icons and tabs.
 * Solid tone fill with contrast text, pill-shaped so single digits stay
 * circular, tabular figures so the width does not jitter as the count changes.
 */
export function CounterBadge({
  count,
  max = 99,
  tone = 'danger',
  dot = false,
  size = 'md',
  skeleton = false,
  className,
  'aria-label': ariaLabel,
  ...rest
}: CounterBadgeProps) {
  if (skeleton) {
    return <Skeleton variant="circle" width="1.25rem" className={className} />;
  }

  if (dot) {
    return (
      <span
        role="status"
        aria-label={ariaLabel ?? 'New activity'}
        className={cx(styles.badge, styles.dot, styles[tone], styles[size], className)}
        {...rest}
      />
    );
  }

  if (count <= 0) return null;

  const label = count > max ? `${max}+` : String(count);

  return (
    <span
      role="status"
      aria-label={ariaLabel ?? `${count} items`}
      className={cx(styles.badge, styles[tone], styles[size], className)}
      {...rest}
    >
      <span aria-hidden="true">{label}</span>
    </span>
  );
}
