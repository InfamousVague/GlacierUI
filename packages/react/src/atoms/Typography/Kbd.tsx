import type { ComponentProps, ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { Skeleton } from '../Skeleton/Skeleton.tsx';
import styles from './Typography.module.css';

export interface KbdProps extends Omit<ComponentProps<'kbd'>, 'children'> {
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  children?: ReactNode;
}

export function Kbd({ skeleton = false, className, children, ...rest }: KbdProps) {
  if (skeleton) {
    return (
      <Skeleton
        width="2.25rem"
        height="1.375rem"
        radius="var(--perfect-radius-sm)"
        className={className}
      />
    );
  }
  return (
    <kbd className={cx(styles.kbd, className)} {...rest}>
      {children}
    </kbd>
  );
}
