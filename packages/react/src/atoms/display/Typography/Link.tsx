import type { ComponentProps, ReactNode } from 'react';
import { SkeletonVariant } from '@glacier/spec';
import { cx } from '../../../internal/cx.ts';
import { Skeleton } from '../../feedback/Skeleton/Skeleton.tsx';
import styles from './Typography.module.css';

export interface LinkProps extends Omit<ComponentProps<'a'>, 'children'> {
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  children?: ReactNode;
}

export function Link({ skeleton = false, className, children, ...rest }: LinkProps) {
  if (skeleton) {
    return <Skeleton variant={SkeletonVariant.Text} width="8ch" className={className} />;
  }
  return (
    <a className={cx(styles.link, className)} {...rest}>
      {children}
    </a>
  );
}
