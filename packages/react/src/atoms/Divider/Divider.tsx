import { dividerOrientations } from '@perfect/spec';
import type { ComponentProps, ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { Skeleton } from '../Skeleton/Skeleton.tsx';
import styles from './Divider.module.css';

// Derived from the spec so the orientation union cannot drift.
export type DividerOrientation = (typeof dividerOrientations)[number];

export interface DividerProps extends Omit<ComponentProps<'hr'>, 'children'> {
  orientation?: DividerOrientation;
  /** Optional centered label; renders a div separator instead of an hr. */
  label?: ReactNode;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
}

export function Divider({
  orientation = 'horizontal',
  label,
  skeleton = false,
  className,
  ...rest
}: DividerProps) {
  if (skeleton) {
    return orientation === 'vertical' ? (
      <Skeleton width="var(--perfect-hairline)" height="1.5rem" className={className} />
    ) : (
      <Skeleton width="100%" height="var(--perfect-hairline)" className={className} />
    );
  }
  if (label) {
    return (
      <div role="separator" className={cx(styles.labeled, className)}>
        {label}
      </div>
    );
  }
  if (orientation === 'vertical') {
    return <div role="separator" aria-orientation="vertical" className={cx(styles.vertical, className)} />;
  }
  return <hr className={cx(styles.horizontal, className)} {...rest} />;
}
