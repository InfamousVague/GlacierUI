import type { ComponentProps, ElementType, ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { Skeleton } from '../Skeleton/Skeleton.tsx';
import styles from './Typography.module.css';

const HEADING_FONT_SIZES: Record<1 | 2 | 3 | 4 | 5 | 6, string> = {
  1: 'var(--perfect-font-size-3xl)',
  2: 'var(--perfect-font-size-2xl)',
  3: 'var(--perfect-font-size-xl)',
  4: 'var(--perfect-font-size-lg)',
  5: 'var(--perfect-font-size-md)',
  6: 'var(--perfect-font-size-sm)',
};

export interface HeadingProps extends Omit<ComponentProps<'h2'>, 'children'> {
  /** Semantic heading level, h1 through h6. Also sets the visual size. */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Visual size override when semantics and looks need to differ. */
  visualLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  children?: ReactNode;
}

export function Heading({
  level = 2,
  visualLevel,
  skeleton = false,
  className,
  children,
  ...rest
}: HeadingProps) {
  if (skeleton) {
    return (
      <Skeleton
        variant="text"
        width="10ch"
        className={className}
        style={{ fontSize: HEADING_FONT_SIZES[visualLevel ?? level] }}
      />
    );
  }
  const Component: ElementType = `h${level}`;
  return (
    <Component
      className={cx(styles.heading, styles[`h${visualLevel ?? level}`], className)}
      {...rest}
    >
      {children}
    </Component>
  );
}
