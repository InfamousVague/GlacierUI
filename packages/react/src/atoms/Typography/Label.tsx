import type { ComponentProps, ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { Skeleton } from '../Skeleton/Skeleton.tsx';
import styles from './Typography.module.css';

export interface LabelProps extends Omit<ComponentProps<'label'>, 'children'> {
  /** Appends a required marker after the label text. */
  required?: boolean;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  children?: ReactNode;
}

export function Label({ required = false, skeleton = false, className, children, ...rest }: LabelProps) {
  if (skeleton) {
    return (
      <Skeleton
        variant="text"
        width="6ch"
        className={className}
        style={{ fontSize: 'var(--perfect-font-size-sm)' }}
      />
    );
  }
  return (
    <label className={cx(styles.label, className)} {...rest}>
      {children}
      {required && (
        <span className={styles.labelRequired} aria-hidden="true">
          {' '}
          *
        </span>
      )}
    </label>
  );
}
