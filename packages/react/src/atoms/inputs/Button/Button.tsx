import { motion, useReducedMotion } from 'motion/react';
import { Speed, Ease, transition, pressTap } from '@glacier/motion';
import { buttonVariants, controlSizes, Size, Tone } from '@glacier/spec';
import type { ComponentProps, ReactNode } from 'react';
import { cx } from '../../../internal/cx.ts';
import { ShapeLayer, shapeHostProps, type ShapeName } from '../../../internal/shape/ShapeLayer.tsx';
import { Spinner } from '../../feedback/Progress/Spinner.tsx';
import { Skeleton } from '../../feedback/Skeleton/Skeleton.tsx';
import styles from './Button.module.css';

// The allowed values come from the spec, so the type cannot drift from the
// contract. See @glacier/spec/components/button.
export type ButtonVariant = (typeof buttonVariants)[number];
export type ControlSize = (typeof controlSizes)[number];

const SKELETON_WIDTHS: Record<ControlSize, string> = { sm: '5rem', md: '6.5rem', lg: '8rem' };

export interface ButtonProps extends Omit<ComponentProps<typeof motion.button>, 'children'> {
  variant?: ButtonVariant;
  size?: ControlSize;
  /**
   * Plate silhouette. `rect` is the untouched default; the gamified shapes ride
   * the shape layer, which keeps the focus ring and the hit area on the full
   * upright box and swaps the elevation shadows for the shape drop/glow pair.
   */
  shape?: ShapeName;
  /** Paints the accent leading-edge stripe, widening on hover and focus. */
  edgeAccent?: boolean;
  /** Slides the accent sweep in from the leading edge on hover and focus. */
  sweep?: boolean;
  loading?: boolean;
  /** Renders a placeholder with the button's exact geometry. */
  skeleton?: boolean;
  fullWidth?: boolean;
  children?: ReactNode;
}

export function Button({
  variant = 'solid',
  size = 'md',
  shape = 'rect',
  edgeAccent = false,
  sweep = false,
  loading = false,
  skeleton = false,
  fullWidth = false,
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  const reduce = useReducedMotion();
  const inert = disabled || loading;
  // Empty for a plain rectangle, so a default Button renders exactly the DOM it
  // rendered before shapes existed.
  // A button always lifts: the hover depth, the widening accent edge and the
  // sweep are honest affordances here.
  const host = shapeHostProps({ shape, edgeAccent, sweep, lift: true });
  if (skeleton) {
    return (
      <Skeleton
        width={fullWidth ? '100%' : SKELETON_WIDTHS[size]}
        height={`var(--glacier-control-height-${size})`}
        radius="var(--glacier-control-radius)"
        className={className}
      />
    );
  }
  return (
    <motion.button
      type="button"
      className={cx(styles.button, styles[variant], styles[size], fullWidth && styles.fullWidth, host.className, className)}
      disabled={inert}
      data-loading={loading || undefined}
      data-shape={host['data-shape']}
      data-shape-lift={host['data-shape-lift']}
      whileTap={pressTap('control', reduce || inert)}
      transition={transition(Speed.Fast, Ease.Out)}
      {...rest}
    >
      <ShapeLayer shape={shape} edgeAccent={edgeAccent} sweep={sweep} />
      {loading && <Spinner size={Size.Small} tone={Tone.Inherit} aria-label="" />}
      {children}
    </motion.button>
  );
}
