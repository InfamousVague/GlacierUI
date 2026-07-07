import type { ComponentProps } from 'react';
import type { ControlSize } from '../Button/Button.tsx';
import { cx } from '../../internal/cx.ts';
import { useControlled } from '../../internal/useControlled.ts';
import { useField } from '../../internal/FieldContext.ts';
import { Skeleton } from '../Skeleton/Skeleton.tsx';
import styles from './NumberInput.module.css';

export interface NumberInputProps
  extends Omit<ComponentProps<'input'>, 'type' | 'value' | 'defaultValue' | 'onChange' | 'size'> {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number) => void;
  size?: ControlSize;
  disabled?: boolean;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  'aria-label'?: string;
}

/**
 * A numeric stepper: a minus button, a centered native number input with
 * tabular figures, and a plus button, wrapped in a bordered group at control
 * height. Results clamp to min and max, and the step buttons disable at the
 * bounds.
 */
export function NumberInput({
  value,
  defaultValue,
  min,
  max,
  step = 1,
  onValueChange,
  size = 'md',
  disabled = false,
  skeleton = false,
  className,
  id,
  'aria-label': ariaLabel,
  ...rest
}: NumberInputProps) {
  const field = useField();
  const [current, setCurrent] = useControlled(value, defaultValue ?? 0);

  if (skeleton) {
    return (
      <Skeleton
        width="8rem"
        height={`var(--perfect-control-height-${size})`}
        radius="var(--perfect-radius-lg)"
        className={className}
      />
    );
  }

  const clamp = (next: number): number => {
    let out = next;
    if (min !== undefined && out < min) out = min;
    if (max !== undefined && out > max) out = max;
    return out;
  };

  const commit = (next: number): void => {
    const clamped = clamp(next);
    setCurrent(clamped);
    onValueChange?.(clamped);
  };

  const atMin = min !== undefined && current <= min;
  const atMax = max !== undefined && current >= max;

  return (
    <div className={cx(styles.group, styles[size], disabled && styles.disabled, className)}>
      <button
        type="button"
        aria-label="Decrease"
        className={styles.step}
        disabled={disabled || atMin}
        onClick={() => commit(current - step)}
      >
        <span aria-hidden="true">-</span>
      </button>
      <input
        type="number"
        inputMode="numeric"
        id={id ?? field?.id}
        aria-label={ariaLabel}
        aria-describedby={field?.describedBy}
        aria-invalid={field?.invalid || undefined}
        className={styles.input}
        value={current}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={(event) => commit(Number(event.target.value))}
        {...rest}
      />
      <button
        type="button"
        aria-label="Increase"
        className={styles.step}
        disabled={disabled || atMax}
        onClick={() => commit(current + step)}
      >
        <span aria-hidden="true">+</span>
      </button>
    </div>
  );
}
