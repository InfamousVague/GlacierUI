import { motion, useReducedMotion } from 'motion/react';
import { Speed, Ease, transition } from '@glacier/motion';
import type { ComponentProps, ReactNode } from 'react';
import { cx } from '../../../internal/cx.ts';
import { useControlled } from '../../../internal/useControlled.ts';
import type { ControlSize } from '../Button/Button.tsx';
import { Skeleton } from '../../feedback/Skeleton/Skeleton.tsx';
import styles from './Toggle.module.css';

const SKELETON_WIDTHS: Record<ControlSize, string> = { sm: '4.5rem', md: '5.5rem', lg: '6.5rem' };

export interface ToggleProps extends Omit<ComponentProps<typeof motion.button>, 'children'> {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  size?: ControlSize;
  /** Square icon-only layout, like IconButton. */
  iconOnly?: boolean;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Renders the frosted glass material instead of a solid surface. */
  glass?: boolean;
  /** Required when the content is icon-only. */
  'aria-label'?: string;
  children?: ReactNode;
}

/**
 * A press-state button (aria-pressed) for stateful actions: password reveal,
 * view modes, formatting toolbars. Pressed renders in the accent soft tint.
 * For on/off settings, use Switch instead.
 */
export function Toggle({
  pressed,
  defaultPressed = false,
  onPressedChange,
  size = 'md',
  iconOnly = false,
  skeleton = false,
  glass = false,
  disabled,
  className,
  children,
  onClick,
  ...rest
}: ToggleProps) {
  const [isPressed, setPressed] = useControlled(pressed, defaultPressed);
  const reduce = useReducedMotion();
  if (skeleton) {
    return (
      <Skeleton
        width={iconOnly ? `var(--glacier-control-height-${size})` : SKELETON_WIDTHS[size]}
        height={`var(--glacier-control-height-${size})`}
        radius="var(--glacier-control-radius)"
        className={className}
      />
    );
  }
  return (
    <motion.button
      type="button"
      aria-pressed={isPressed}
      className={cx(styles.toggle, styles[size], iconOnly && styles.iconOnly, glass && styles.glass, className)}
      disabled={disabled}
      whileTap={reduce || disabled ? undefined : { scale: 0.94 }}
      transition={transition(Speed.Fast, Ease.Out)}
      onClick={(event) => {
        setPressed(!isPressed);
        onPressedChange?.(!isPressed);
        onClick?.(event);
      }}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
