import type { ComponentProps, ReactNode } from 'react';
import { SkeletonVariant } from '@glacier/spec';
import { cx } from '../../../internal/cx.ts';
import { Skeleton } from '../../feedback/Skeleton/Skeleton.tsx';
import styles from './StatTile.module.css';

export interface StatTileProps extends ComponentProps<'div'> {
  /** Optional leading glyph rendered in a muted disc. Decorative. */
  icon?: ReactNode;
  /** The prominent value - a number, currency, or short string. */
  value: ReactNode;
  /** The muted label naming what the value measures. */
  label: ReactNode;
  /** Optional trailing delta or hint, e.g. a change chip or timeframe. */
  hint?: ReactNode;
  /** Renders the frosted glass material instead of a solid card. */
  glass?: boolean;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
}

/**
 * A compact stat micro-card: an optional leading icon, a prominent value, and a
 * muted label, with an optional trailing delta or hint. Built on the card
 * surface tokens so a row or grid of tiles reads as one consistent panel.
 */
export function StatTile({
  icon,
  value,
  label,
  hint,
  glass = false,
  skeleton = false,
  className,
  ...rest
}: StatTileProps) {
  if (skeleton) {
    return (
      <div className={cx(styles.tile, glass && styles.glass, className)} {...rest}>
        <div className={styles.body}>
          <Skeleton variant={SkeletonVariant.Text} width="6ch" style={{ fontSize: 'var(--glacier-font-size-2xl)' }} />
          <Skeleton variant={SkeletonVariant.Text} width="10ch" style={{ fontSize: 'var(--glacier-font-size-sm)' }} />
        </div>
      </div>
    );
  }
  return (
    <div className={cx(styles.tile, glass && styles.glass, className)} {...rest}>
      {icon != null && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      <div className={styles.body}>
        <div className={styles.valueRow}>
          <span className={styles.value}>{value}</span>
          {hint != null && <span className={styles.hint}>{hint}</span>}
        </div>
        <span className={styles.label}>{label}</span>
      </div>
    </div>
  );
}
