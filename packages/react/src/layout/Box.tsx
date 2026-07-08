import type { ComponentProps, ElementType, ReactNode } from 'react';
import { cx } from '../internal/cx.ts';
import { asPolymorphic } from '../internal/poly.ts';
import { resolveBox, splitBoxProps } from './resolve.ts';
import type { BoxStyleProps } from './types.ts';
import styles from './Layout.module.css';

export interface BoxProps extends BoxStyleProps, Omit<ComponentProps<'div'>, 'color'> {
  /** Rendered element. Defaults to a div. */
  as?: ElementType;
  children?: ReactNode;
}

/**
 * The base layout primitive: a block with token-locked padding, surface, and
 * sizing. Compose it, or reach for Stack, Row, and Grid for flow. min-width is
 * zero so it never overflows a flex or grid parent.
 */
export function Box({ as, className, style, children, ...props }: BoxProps) {
  const { box, rest } = splitBoxProps(props);
  const resolved = resolveBox(box);
  const Component = asPolymorphic(as, 'div');
  return (
    <Component
      className={cx(styles.box, className)}
      style={{ ...resolved.style, ...style }}
      {...resolved.attrs}
      {...rest}
    >
      {children}
    </Component>
  );
}
