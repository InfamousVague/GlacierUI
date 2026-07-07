import { motion, useReducedMotion } from 'motion/react';
import { Spring, springTransition } from '@perfect/motion';
import { useId, type ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { useControlled } from '../../internal/useControlled.ts';
import type { ControlSize } from '../../atoms/Button/Button.tsx';
import { Skeleton } from '../../atoms/Skeleton/Skeleton.tsx';
import styles from './Segmented.module.css';

export interface SegmentedOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps {
  options: SegmentedOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  size?: ControlSize;
  fullWidth?: boolean;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Spring preset for the thumb. Defaults to Spring.Snappy. */
  spring?: Spring;
  disabled?: boolean;
  /** Accessible name for the group. */
  'aria-label'?: string;
  className?: string;
}

/**
 * A segmented toggle in the style of the iOS segmented control. The selected
 * thumb is a shared framer-motion layout element, so it springs between
 * segments instead of jumping. Arrow keys move the selection (native radio
 * behavior), and the thumb follows.
 */
export function SegmentedControl({
  options,
  value,
  defaultValue,
  onValueChange,
  size = 'md',
  fullWidth = false,
  skeleton = false,
  spring = Spring.Snappy,
  disabled = false,
  className,
  ...rest
}: SegmentedControlProps) {
  const id = useId();
  const reduce = useReducedMotion();
  const fallback = defaultValue ?? options.find((o) => !o.disabled)?.value ?? '';
  const [selected, setSelected] = useControlled(value, fallback);

  if (skeleton) {
    return (
      <Skeleton
        width={fullWidth ? '100%' : '16rem'}
        height={`var(--perfect-control-height-${size})`}
        radius="var(--perfect-control-radius)"
        className={className}
      />
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label={rest['aria-label']}
      className={cx(styles.root, styles[size], fullWidth && styles.fullWidth, className)}
    >
      {options.map((option) => {
        const isSelected = option.value === selected;
        const isDisabled = disabled || option.disabled;
        return (
          <label
            key={option.value}
            className={cx(styles.segment, isDisabled && styles.disabled)}
            data-selected={isSelected || undefined}
          >
            <input
              type="radio"
              className={styles.nativeInput}
              name={id}
              value={option.value}
              checked={isSelected}
              disabled={isDisabled}
              onChange={() => {
                setSelected(option.value);
                onValueChange?.(option.value);
              }}
            />
            {isSelected && (
              <motion.span
                className={styles.thumb}
                layoutId={`${id}-thumb`}
                transition={reduce ? { duration: 0 } : springTransition(spring)}
                aria-hidden="true"
              />
            )}
            <span className={styles.label}>{option.label}</span>
          </label>
        );
      })}
    </div>
  );
}
