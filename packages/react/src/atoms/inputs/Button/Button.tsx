import { motion, useReducedMotion } from 'motion/react';
import { Speed, Ease, transition } from '@glacier/motion';
import { buttonVariants, controlSizes, Size, Tone } from '@glacier/spec';
import type { ComponentProps, ReactNode } from 'react';
import { cx } from '../../../internal/cx.ts';
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
  loading?: boolean;
  /** Renders a placeholder with the button's exact geometry. */
  skeleton?: boolean;
  fullWidth?: boolean;
  children?: ReactNode;
}

export function Button({
  variant = 'solid',
  size = 'md',
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
      className={cx(styles.button, styles[variant], styles[size], fullWidth && styles.fullWidth, className)}
      disabled={inert}
      data-loading={loading || undefined}
      whileTap={reduce || inert ? undefined : { scale: 0.97 }}
      transition={transition(Speed.Fast, Ease.Out)}
      {...rest}
    >
      {loading && <Spinner size={Size.Small} tone={Tone.Inherit} aria-label="" />}
      {children}
    </motion.button>
  );
}
