import { motion, useReducedMotion } from 'motion/react';
import { SkeletonVariant } from '@glacier/spec';
import { Speed, Ease, transition } from '@glacier/motion';
import { useEffect, useRef, type ComponentProps, type ReactNode } from 'react';
import { cx } from '../../../internal/cx.ts';
import { useControlled } from '../../../internal/useControlled.ts';
import { Skeleton } from '../../feedback/Skeleton/Skeleton.tsx';
import styles from './Selection.module.css';

export interface CheckboxProps
  extends Omit<ComponentProps<'input'>, 'type' | 'onChange' | 'checked' | 'defaultChecked'> {
  label?: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Mixed state: shows a dash and reports aria-checked="mixed" while unchecked. */
  indeterminate?: boolean;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Renders the frosted glass material instead of a solid surface. */
  glass?: boolean;
}

export function Checkbox({
  label,
  checked,
  defaultChecked = false,
  onCheckedChange,
  indeterminate = false,
  disabled,
  skeleton = false,
  glass = false,
  className,
  ...rest
}: CheckboxProps) {
  const [isChecked, setChecked] = useControlled(checked, defaultChecked);
  const reduce = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const showDash = indeterminate && !isChecked;
  // The native `indeterminate` visual state only exists as a DOM property.
  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = showDash;
  }, [showDash]);
  if (skeleton) {
    return (
      <span className={cx(styles.control, className)}>
        <Skeleton width="1.375rem" height="1.375rem" radius="var(--glacier-radius-sm)" />
        {label && <Skeleton variant={SkeletonVariant.Text} width="6rem" />}
      </span>
    );
  }
  return (
    <label className={cx(styles.control, disabled && styles.disabled, className)}>
      <input
        ref={inputRef}
        type="checkbox"
        className={styles.nativeInput}
        checked={isChecked}
        disabled={disabled}
        data-haptic="selection"
        onChange={(e) => {
          setChecked(e.target.checked);
          onCheckedChange?.(e.target.checked);
        }}
        {...rest}
      />
      <span
        className={cx(styles.box, glass && styles.glass)}
        data-checked={isChecked || showDash || undefined}
        aria-hidden="true"
      >
        <svg viewBox="0 0 12 12" fill="none">
          <motion.path
            d="M2.5 6.5 L5 8.75 L9.5 3.5"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={false}
            animate={{ pathLength: isChecked ? 1 : 0, opacity: isChecked ? 1 : 0 }}
            transition={reduce ? { duration: 0 } : transition(Speed.Fast, Ease.Out)}
          />
          <motion.path
            d="M3 6 H9"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            initial={false}
            animate={{ pathLength: showDash ? 1 : 0, opacity: showDash ? 1 : 0 }}
            transition={reduce ? { duration: 0 } : transition(Speed.Fast, Ease.Out)}
          />
        </svg>
      </span>
      {label && <span>{label}</span>}
    </label>
  );
}
