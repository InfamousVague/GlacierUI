import { badgeTones, badgeVariants } from '@perfect/spec';
import type { ComponentProps, ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import styles from './Badge.module.css';

// Tone, variant, and size unions are derived from the spec arrays so they
// cannot drift from the contract.
export type BadgeTone = (typeof badgeTones)[number];
export type BadgeVariant = (typeof badgeVariants)[number];

export interface BadgeProps extends Omit<ComponentProps<'span'>, 'children'> {
  tone?: BadgeTone;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  children?: ReactNode;
}

/**
 * A small labeled status badge: an inline-flex text pill carrying a short
 * status word in a semantic tone. Pick a soft tint or a solid fill, in one of
 * two compact sizes. For counts, reach for CounterBadge instead.
 */
export function Badge({ tone = 'neutral', variant = 'soft', size = 'md', className, children, ...rest }: BadgeProps) {
  return (
    <span className={cx(styles.badge, styles[variant], styles[tone], styles[size], className)} {...rest}>
      {children}
    </span>
  );
}
