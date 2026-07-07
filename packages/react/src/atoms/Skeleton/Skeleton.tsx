import type { ComponentProps, CSSProperties } from 'react';
import { cx } from '../../internal/cx.ts';
import styles from './Skeleton.module.css';

export interface SkeletonProps extends ComponentProps<'span'> {
  /** text is a 1em line, rect a rounded block, circle a disc. */
  variant?: 'text' | 'rect' | 'circle';
  width?: string | number;
  height?: string | number;
  /** Corner radius override, e.g. var(--perfect-control-radius). */
  radius?: string;
}

/**
 * The kit's one skeleton primitive. Every component's `skeleton` prop renders
 * through this, passing the same tokens the live component consumes, so
 * placeholders always match the real geometry and content never shifts on
 * arrival. Skeletons are decorative (aria-hidden); mark the loading region
 * itself with aria-busy at the app level. Shimmer becomes an opacity pulse
 * under prefers-reduced-motion.
 */
export function Skeleton({
  variant = 'rect',
  width,
  height,
  radius,
  className,
  style,
  ...rest
}: SkeletonProps) {
  const geometry: CSSProperties = {
    width,
    height: height ?? (variant === 'circle' ? width : undefined),
    borderRadius: radius,
  };
  return (
    <span
      aria-hidden="true"
      data-skeleton="true"
      className={cx(styles.skeleton, styles[variant], className)}
      style={{ ...geometry, ...style }}
      {...rest}
    />
  );
}
