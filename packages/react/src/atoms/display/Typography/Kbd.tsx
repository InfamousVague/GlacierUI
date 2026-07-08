import type { ComponentProps, ReactNode } from 'react';
import { cx } from '../../../internal/cx.ts';
import { Skeleton } from '../../feedback/Skeleton/Skeleton.tsx';
import styles from './Typography.module.css';

export interface KbdProps extends Omit<ComponentProps<'kbd'>, 'children'> {
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Renders the frosted glass material instead of a solid surface. */
  glass?: boolean;
  children?: ReactNode;
}

export function Kbd({ skeleton = false, glass = false, className, children, ...rest }: KbdProps) {
  if (skeleton) {
    return (
      <Skeleton
        width="2.25rem"
        height="1.375rem"
        radius="var(--glacier-radius-sm)"
        className={className}
      />
    );
  }
  return (
    <kbd className={cx(styles.kbd, glass && styles.glass, className)} {...rest}>
      {children}
    </kbd>
  );
}
