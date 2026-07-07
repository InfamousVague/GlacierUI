import { motion, useReducedMotion } from 'motion/react';
import { Speed, Ease, transition } from '@perfect/motion';
import type { ComponentProps, ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { Skeleton } from '../Skeleton/Skeleton.tsx';
import styles from './Selection.module.css';

export interface RadioProps extends Omit<ComponentProps<'input'>, 'type'> {
  label?: ReactNode;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Renders the frosted glass material instead of a solid surface. */
  glass?: boolean;
}

/** Uncontrolled-friendly: group radios by `name` as usual. */
export function Radio({
  label,
  disabled = false,
  skeleton = false,
  glass = false,
  className,
  ...rest
}: RadioProps) {
  if (skeleton) {
    return (
      <span className={cx(styles.control, className)}>
        <Skeleton variant="circle" width="1.375rem" />
        {label && <Skeleton variant="text" width="6rem" />}
      </span>
    );
  }
  return (
    <label className={cx(styles.control, disabled && styles.disabled, className)}>
      <input type="radio" className={styles.nativeInput} disabled={disabled} {...rest} />
      <RadioIndicator checked={rest.checked ?? undefined} glass={glass} />
      {label && <span>{label}</span>}
    </label>
  );
}

function RadioIndicator({ checked, glass }: { checked?: boolean; glass?: boolean }) {
  const reduce = useReducedMotion();
  // When uncontrolled, the dot is driven purely by the sibling input's state
  // via CSS; when controlled, framer animates the pop.
  if (checked === undefined) {
    return (
      <span className={cx(styles.dot, glass && styles.glass)} aria-hidden="true">
        <span className={cx(styles.dotInner, styles.dotCss)} />
      </span>
    );
  }
  return (
    <span
      className={cx(styles.dot, glass && styles.glass)}
      data-checked={checked || undefined}
      aria-hidden="true"
    >
      <motion.span
        className={styles.dotInner}
        initial={false}
        animate={{ scale: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
        transition={reduce ? { duration: 0 } : transition(Speed.Fast, Ease.Spring)}
      />
    </span>
  );
}
