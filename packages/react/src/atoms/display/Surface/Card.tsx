import { motion, useReducedMotion } from 'motion/react';
import { Speed, Ease, transition, pressTap } from '@glacier/motion';
import { cardElevations, cardVariants, SkeletonVariant } from '@glacier/spec';
import type { ComponentProps, ReactNode } from 'react';
import { cx } from '../../../internal/cx.ts';
import { ShapeLayer, shapeHostProps, type ShapeName } from '../../../internal/shape/ShapeLayer.tsx';
import { Skeleton } from '../../feedback/Skeleton/Skeleton.tsx';
import styles from './Surface.module.css';

// Derived from the spec so the union cannot drift from the contract.
export type Elevation = (typeof cardElevations)[number];

export type CardVariant = (typeof cardVariants)[number];

export interface CardProps extends Omit<ComponentProps<typeof motion.div>, 'children'> {
  elevation?: Elevation;
  /** Adds hover lift + shadow bump for clickable cards. */
  interactive?: boolean;
  /** 'glass' renders a translucent blurred material, 'wash' a quiet accent gradient. */
  variant?: CardVariant;
  /**
   * Plate silhouette. 'rect' is the untouched default; the gamified plates
   * carry their depth on the shape drop/glow pair instead of the elevation
   * shadow ladder, and mirror themselves under [dir='rtl'].
   */
  shape?: ShapeName;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  children?: ReactNode;
}

export function Card({
  elevation = 1,
  interactive = false,
  variant = 'solid',
  shape = 'rect',
  skeleton = false,
  className,
  children,
  ...rest
}: CardProps) {
  const reduce = useReducedMotion();
  // {} and null for a plain rect card, so the default markup is untouched.
  // Only a clickable card lifts under the cursor; a static panel with a
  // silhouette is still a static panel.
  const host = shapeHostProps({ shape, lift: interactive });
  if (skeleton) {
    return (
      <div
        {...host}
        className={cx(styles.card, variant !== 'solid' && styles[variant], host.className, className)}
        data-elevation={elevation}
      >
        <ShapeLayer shape={shape} />
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
      {...host}
      className={cx(
        styles.card,
        variant !== 'solid' && styles[variant],
        interactive && styles.interactive,
        host.className,
        className,
      )}
      data-elevation={elevation}
      whileHover={interactive && !reduce ? { y: -2 } : undefined}
      whileTap={pressTap('surface', reduce || !interactive)}
      transition={transition(Speed.Fast, Ease.Out)}
      {...rest}
    >
      <ShapeLayer shape={shape} />
      {children}
    </motion.div>
  );
}
