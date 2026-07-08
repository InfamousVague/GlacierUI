import type { ComponentProps, CSSProperties } from 'react';
import { cx } from '../../internal/cx.ts';
import { useControlled } from '../../internal/useControlled.ts';
import { useField } from '../../internal/FieldContext.ts';
import { Skeleton } from '../Skeleton/Skeleton.tsx';
import styles from './Slider.module.css';

export interface SliderProps
  extends Omit<ComponentProps<'input'>, 'type' | 'value' | 'defaultValue' | 'onChange' | 'size'> {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number) => void;
  /**
   * Lay the rail vertically, filling from the bottom (min) up — for volume and
   * the like. Set the track length with the `--slider-length` custom property.
   */
  orientation?: 'horizontal' | 'vertical';
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  'aria-label'?: string;
}

/**
 * A styled native range input with a filled leading track and an iOS-style
 * thumb. Native semantics come free: arrow keys nudge by step, Home and End
 * jump to the ends, and screen readers read the value. Pass
 * orientation="vertical" to stand the rail up for volume-style controls.
 */
export function Slider({
  value,
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  orientation = 'horizontal',
  skeleton = false,
  disabled,
  className,
  style,
  id,
  ...rest
}: SliderProps) {
  const field = useField();
  const [current, setCurrent] = useControlled(value, defaultValue ?? min);
  const fill = max === min ? 0 : ((current - min) / (max - min)) * 100;
  const vertical = orientation === 'vertical';

  if (skeleton) {
    return vertical ? (
      <Skeleton
        width="1.375rem"
        height="var(--slider-length, 8rem)"
        radius="var(--perfect-radius-full)"
        className={className}
        style={style}
      />
    ) : (
      <Skeleton
        width="100%"
        height="0.375rem"
        radius="var(--perfect-radius-full)"
        className={className}
        style={style}
      />
    );
  }

  const input = (
    <input
      type="range"
      id={id ?? field?.id}
      aria-describedby={field?.describedBy}
      aria-orientation={vertical ? 'vertical' : undefined}
      min={min}
      max={max}
      step={step}
      value={current}
      disabled={disabled}
      onChange={(event) => {
        const next = Number(event.target.value);
        setCurrent(next);
        onValueChange?.(next);
      }}
      className={cx(styles.slider, !vertical && className)}
      style={{ '--slider-fill': `${fill}%`, ...(vertical ? undefined : style) } as CSSProperties}
      {...rest}
    />
  );

  if (!vertical) return input;

  // A wrapper establishes the vertical footprint; the input is rotated inside it
  // (see the CSS) so the rail, fill, and thumb styles carry over untouched.
  return (
    <span className={cx(styles.vertical, className)} style={style}>
      {input}
    </span>
  );
}
