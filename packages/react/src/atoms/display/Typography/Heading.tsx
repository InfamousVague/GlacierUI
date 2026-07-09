import type { ComponentProps, ElementType, ReactNode } from 'react';
import { SkeletonVariant } from '@glacier/spec';
import { cx } from '../../../internal/cx.ts';
import { Skeleton } from '../../feedback/Skeleton/Skeleton.tsx';
import styles from './Typography.module.css';

const HEADING_FONT_SIZES: Record<1 | 2 | 3 | 4 | 5 | 6, string> = {
  1: 'var(--glacier-font-size-3xl)',
  2: 'var(--glacier-font-size-2xl)',
  3: 'var(--glacier-font-size-xl)',
  4: 'var(--glacier-font-size-lg)',
  5: 'var(--glacier-font-size-md)',
  6: 'var(--glacier-font-size-sm)',
};

export interface HeadingProps extends Omit<ComponentProps<'h2'>, 'children'> {
  /** Semantic heading level, h1 through h6. Also sets the visual size. */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Visual size override when semantics and looks need to differ. */
  visualLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Text alignment; inherits when unset. */
  align?: 'start' | 'center' | 'end' | 'justify';
  /** Removes the heading's outer margin so it can fit inside compact layouts. */
  noMargin?: boolean;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  children?: ReactNode;
}

export function Heading({
  level = 2,
  visualLevel,
  align,
  noMargin = false,
  skeleton = false,
  className,
  children,
  ...rest
}: HeadingProps) {
  if (skeleton) {
    return (
      <Skeleton
        variant={SkeletonVariant.Text}
        width="10ch"
        className={className}
        style={{ fontSize: HEADING_FONT_SIZES[visualLevel ?? level] }}
      />
    );
  }
  const Component: ElementType = `h${level}`;
  return (
    <Component
      className={cx(
        styles.heading,
        styles[`h${visualLevel ?? level}`],
        align && styles[`align-${align}`],
        noMargin && styles.noMargin,
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}
