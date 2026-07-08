import type { ComponentProps, ReactNode } from 'react';
import { cx } from '../../../internal/cx.ts';
import type { ControlSize } from '../Button/Button.tsx';
import { useField } from '../../../internal/FieldContext.ts';
import { Skeleton } from '../../feedback/Skeleton/Skeleton.tsx';
import styles from './Input.module.css';

export interface InputProps extends Omit<ComponentProps<'input'>, 'size'> {
  size?: ControlSize;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Renders the frosted glass material instead of a solid surface. */
  glass?: boolean;
  /** Icon or adornment pinned to the leading edge; the text pads clear of it. */
  leadingIcon?: ReactNode;
  /** Icon or adornment pinned to the trailing edge, such as a clear button. */
  trailingIcon?: ReactNode;
}

export function Input({
  size = 'md',
  skeleton = false,
  glass = false,
  leadingIcon,
  trailingIcon,
  className,
  id,
  ...rest
}: InputProps) {
  const field = useField();
  if (skeleton) {
    return (
      <Skeleton
        width="100%"
        height={`var(--glacier-control-height-${size})`}
        radius="var(--glacier-radius-lg)"
        className={className}
      />
    );
  }
  const input = (
    <input
      id={id ?? field?.id}
      aria-describedby={field?.describedBy}
      aria-invalid={field?.invalid || undefined}
      className={cx(styles.input, styles[size], glass && styles.glass, className)}
      data-leading={leadingIcon ? '' : undefined}
      data-trailing={trailingIcon ? '' : undefined}
      {...rest}
    />
  );
  // No wrapper when there is nothing to pin, so the bare input case is unchanged.
  if (!leadingIcon && !trailingIcon) return input;
  return (
    <div className={styles.wrap}>
      {leadingIcon && <span className={styles.leadingIcon}>{leadingIcon}</span>}
      {input}
      {trailingIcon && <span className={styles.trailingIcon}>{trailingIcon}</span>}
    </div>
  );
}
