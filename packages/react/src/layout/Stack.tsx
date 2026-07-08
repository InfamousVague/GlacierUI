import type { ComponentProps, ElementType, ReactNode } from 'react';
import { cx } from '../internal/cx.ts';
import { asPolymorphic } from '../internal/poly.ts';
import { resolveBox, resolveFlow, splitBoxProps } from './resolve.ts';
import type { BoxStyleProps, FlowProps } from './types.ts';
import styles from './Layout.module.css';

export interface StackProps extends BoxStyleProps, FlowProps, Omit<ComponentProps<'div'>, 'color'> {
  as?: ElementType;
  children?: ReactNode;
}

/**
 * A vertical flow. Children stack with a token gap and no margins, so the
 * rhythm is always even. Defaults to gap 4 and stretched children.
 */
export function Stack({
  as,
  gap = 4,
  align,
  justify,
  className,
  style,
  children,
  ...props
}: StackProps) {
  const { box, rest } = splitBoxProps(props);
  const b = resolveBox(box);
  const f = resolveFlow({ gap, align, justify });
  const Component = asPolymorphic(as, 'div');
  return (
    <Component
      className={cx(styles.box, styles.stack, className)}
      style={{ ...b.style, ...f.style, ...style }}
      {...b.attrs}
      {...f.attrs}
      {...rest}
    >
      {children}
    </Component>
  );
}
