import type { ComponentProps } from 'react';
import { cx } from '../../../internal/cx.ts';
import { Skeleton } from '../../feedback/Skeleton/Skeleton.tsx';
import styles from './Surface.module.css';

export type SurfaceLevel = 0 | 1 | 2 | 'sunken';

export interface SurfaceProps extends ComponentProps<'div'> {
  /** 0 = app background, 1 = surface, 2 = raised, 'sunken' = inset wells. */
  level?: SurfaceLevel;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Renders the frosted glass material instead of a solid surface. */
  glass?: boolean;
}

export function Surface({ level = 1, skeleton = false, glass = false, className, children, ...rest }: SurfaceProps) {
  if (skeleton) {
    return (
      <Skeleton width="100%" height="6rem" radius="var(--glacier-radius-lg)" className={className} />
    );
  }
  return (
    <div className={cx(styles.surface, glass && styles.glass, className)} data-level={level} {...rest}>
      {children}
    </div>
  );
}
