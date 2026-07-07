import { motion, useReducedMotion } from 'motion/react';
import { Speed, Ease, transition } from '@perfect/motion';
import type { ComponentProps, ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { Spinner } from '../Progress/Spinner.tsx';
import { Skeleton } from '../Skeleton/Skeleton.tsx';
import styles from './Button.module.css';

export type ButtonVariant = 'solid' | 'soft' | 'outline' | 'ghost' | 'glass' | 'danger';
export type ControlSize = 'sm' | 'md' | 'lg';

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
        height={`var(--perfect-control-height-${size})`}
        radius="var(--perfect-control-radius)"
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
      {loading && <Spinner size="sm" tone="inherit" aria-label="" />}
      {children}
    </motion.button>
  );
}
