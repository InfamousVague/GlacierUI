import { motion, useReducedMotion } from 'motion/react';
import { Speed, Ease, transition } from '@glacier/motion';
import { cardElevations, cardVariants, SkeletonVariant } from '@glacier/spec';
import type { ComponentProps, ReactNode } from 'react';
import { cx } from '../../../internal/cx.ts';
import { Skeleton } from '../../feedback/Skeleton/Skeleton.tsx';
import styles from './Surface.module.css';

// Derived from the spec so the union cannot drift from the contract.
export type Elevation = (typeof cardElevations)[number];

export type CardVariant = (typeof cardVariants)[number];

export interface CardProps extends Omit<ComponentProps<typeof motion.div>, 'children'> {
  elevation?: Elevation;
  /** Adds hover lift + shadow bump for clickable cards. */
  interactive?: boolean;
  /** 'glass' renders a translucent blurred material. */
  variant?: CardVariant;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  children?: ReactNode;
}

export function Card({
  elevation = 1,
  interactive = false,
  variant = 'solid',
  skeleton = false,
  className,
  children,
  ...rest
}: CardProps) {
  const reduce = useReducedMotion();
  if (skeleton) {
    return (
      <div
        className={cx(styles.card, variant === 'glass' && styles.glass, className)}
        data-elevation={elevation}
      >
        <span style={{ display: 'grid', gap: 'var(--glacier-space-2)' }}>
          <Skeleton variant={SkeletonVariant.Text} width="40%" />
          <Skeleton variant={SkeletonVariant.Text} width="100%" />
          <Skeleton variant={SkeletonVariant.Text} width="85%" />
        </span>
      </div>
    );
  }
  return (
    <motion.div
      className={cx(styles.card, variant === 'glass' && styles.glass, interactive && styles.interactive, className)}
      data-elevation={elevation}
      whileHover={interactive && !reduce ? { y: -2 } : undefined}
      whileTap={interactive && !reduce ? { scale: 0.99 } : undefined}
      transition={transition(Speed.Fast, Ease.Out)}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
