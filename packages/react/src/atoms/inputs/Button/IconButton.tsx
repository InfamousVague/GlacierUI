import { motion, useReducedMotion } from 'motion/react';
import { Speed, Ease, transition, pressTap } from '@glacier/motion';
import type { ComponentProps, ReactNode } from 'react';
import { cx } from '../../../internal/cx.ts';
import { Skeleton } from '../../feedback/Skeleton/Skeleton.tsx';
import type { ButtonVariant, ControlSize } from './Button.tsx';
import styles from './Button.module.css';

export interface IconButtonProps extends Omit<ComponentProps<typeof motion.button>, 'children'> {
  /** Required: icon-only controls have no visible text. */
  'aria-label': string;
  variant?: ButtonVariant;
  size?: ControlSize;
  /** Renders a placeholder with the control's exact geometry. */
  skeleton?: boolean;
  children?: ReactNode;
}

export function IconButton({
  variant = 'ghost',
  size = 'md',
  skeleton = false,
  disabled,
  className,
  children,
  ...rest
}: IconButtonProps) {
  const reduce = useReducedMotion();
  if (skeleton) {
    return (
      <Skeleton
        width={`var(--glacier-control-height-${size})`}
        height={`var(--glacier-control-height-${size})`}
        radius="var(--glacier-control-radius)"
        className={className}
      />
    );
  }
  return (
    <motion.button
      type="button"
      className={cx(styles.button, styles.icon, styles[variant], styles[size], className)}
      disabled={disabled}
      whileTap={pressTap('compact', reduce || disabled)}
      transition={transition(Speed.Fast, Ease.Out)}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
