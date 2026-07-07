import { textareaSizes } from '@perfect/spec';
import type { ComponentProps } from 'react';
import { cx } from '../../internal/cx.ts';
import { useField } from '../../internal/FieldContext.ts';
import { Skeleton } from '../Skeleton/Skeleton.tsx';
import styles from './Textarea.module.css';

// Derived from the spec so the size union cannot drift.
export type TextareaSize = (typeof textareaSizes)[number];

export interface TextareaProps extends Omit<ComponentProps<'textarea'>, 'size'> {
  size?: TextareaSize;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
}

export function Textarea({
  size = 'md',
  skeleton = false,
  className,
  id,
  ...rest
}: TextareaProps) {
  const field = useField();
  if (skeleton) {
    return (
      <Skeleton
        width="100%"
        height="5.5rem"
        radius="var(--perfect-radius-lg)"
        className={className}
      />
    );
  }
  return (
    <textarea
      id={id ?? field?.id}
      aria-describedby={field?.describedBy}
      aria-invalid={field?.invalid || undefined}
      className={cx(styles.textarea, styles[size], className)}
      {...rest}
    />
  );
}
