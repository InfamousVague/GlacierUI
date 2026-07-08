import type { ComponentProps, ElementType, ReactNode } from 'react';
import { cx } from '../internal/cx.ts';
import { asPolymorphic } from '../internal/poly.ts';
import { resolveBox, splitBoxProps } from './resolve.ts';
import type { BoxStyleProps } from './types.ts';
import styles from './Layout.module.css';

export interface CenterProps extends BoxStyleProps, Omit<ComponentProps<'div'>, 'color'> {
  as?: ElementType;
  children?: ReactNode;
}

/**
 * Centers its children on both axes. Pair with height="screen" for a
 * full-viewport centered layout, or a fixed height for a panel.
 */
export function Center({ as, className, style, children, ...props }: CenterProps) {
  const { box, rest } = splitBoxProps(props);
  const resolved = resolveBox(box);
  const Component = asPolymorphic(as, 'div');
  return (
    <Component
      className={cx(styles.box, styles.center, className)}
      style={{ ...resolved.style, ...style }}
      {...resolved.attrs}
      {...rest}
    >
      {children}
    </Component>
  );
}
