import { motion, useReducedMotion } from 'motion/react';
import { Spring, springTransition } from '@perfect/motion';
import type { ComponentProps, ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { useControlled } from '../../internal/useControlled.ts';
import { Skeleton } from '../Skeleton/Skeleton.tsx';
import styles from './Selection.module.css';

export interface SwitchProps
  extends Omit<ComponentProps<'input'>, 'type' | 'onChange' | 'checked' | 'defaultChecked' | 'size'> {
  label?: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  size?: 'sm' | 'md';
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Renders the frosted glass material instead of a solid surface. */
  glass?: boolean;
}

/** Thumb travel in px per size: track width - thumb - both padding edges. */
const TRAVEL = { sm: 16, md: 18 } as const;

/** Track outer dims per size, mirroring .track and .trackSm in the CSS. */
const TRACK_WIDTH = { sm: '2.25rem', md: '2.75rem' } as const;
const TRACK_HEIGHT = { sm: '1.25rem', md: '1.625rem' } as const;

export function Switch({
  label,
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled,
  size = 'md',
  skeleton = false,
  glass = false,
  className,
  ...rest
}: SwitchProps) {
  const [isChecked, setChecked] = useControlled(checked, defaultChecked);
  const reduce = useReducedMotion();
  if (skeleton) {
    return (
      <span className={cx(styles.control, className)}>
        <Skeleton
          width={TRACK_WIDTH[size]}
          height={TRACK_HEIGHT[size]}
          radius="var(--perfect-radius-full)"
        />
        {label && <Skeleton variant="text" width="6rem" />}
      </span>
    );
  }
  return (
    <label className={cx(styles.control, disabled && styles.disabled, className)}>
      <input
        type="checkbox"
        role="switch"
        className={styles.nativeInput}
        checked={isChecked}
        disabled={disabled}
        onChange={(e) => {
          setChecked(e.target.checked);
          onCheckedChange?.(e.target.checked);
        }}
        {...rest}
      />
      <span
        className={cx(styles.track, size === 'sm' && styles.trackSm, glass && styles.glass)}
        data-checked={isChecked || undefined}
        aria-hidden="true"
      >
        <motion.span
          className={cx(styles.thumb, size === 'sm' && styles.thumbSm)}
          initial={false}
          animate={{ x: isChecked ? TRAVEL[size] : 0 }}
          transition={reduce ? { duration: 0 } : springTransition(Spring.Snappy)}
        />
      </span>
      {label && <span>{label}</span>}
    </label>
  );
}
