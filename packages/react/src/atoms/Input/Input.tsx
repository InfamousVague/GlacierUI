import type { ComponentProps } from 'react';
import { cx } from '../../internal/cx.ts';
import type { ControlSize } from '../Button/Button.tsx';
import { useField } from '../../internal/FieldContext.ts';
import { Skeleton } from '../Skeleton/Skeleton.tsx';
import styles from './Input.module.css';

export interface InputProps extends Omit<ComponentProps<'input'>, 'size'> {
  size?: ControlSize;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Renders the frosted glass material instead of a solid surface. */
  glass?: boolean;
}

export function Input({ size = 'md', skeleton = false, glass = false, className, id, ...rest }: InputProps) {
  const field = useField();
  if (skeleton) {
    return (
      <Skeleton
        width="100%"
        height={`var(--perfect-control-height-${size})`}
        radius="var(--perfect-radius-lg)"
        className={className}
      />
    );
  }
  return (
    <input
      id={id ?? field?.id}
      aria-describedby={field?.describedBy}
      aria-invalid={field?.invalid || undefined}
      className={cx(styles.input, styles[size], glass && styles.glass, className)}
      {...rest}
    />
  );
}
