import type { ComponentProps, ElementType, ReactNode } from 'react';
import { cx } from '../internal/cx.ts';
import { resolveBox, resolveFlow, splitBoxProps } from './resolve.ts';
import type { BoxStyleProps, FlowProps } from './types.ts';
import styles from './Layout.module.css';

export interface RowProps extends BoxStyleProps, FlowProps, Omit<ComponentProps<'div'>, 'color'> {
  as?: ElementType;
  /** Wrap onto new lines when the row runs out of width. */
  wrap?: boolean;
  children?: ReactNode;
}

/**
 * A horizontal flow. Children sit in a row with a token gap, centered on the
 * cross axis by default. Set wrap to let them flow onto new lines.
 */
export function Row({
  as,
  gap = 3,
  align,
  justify,
  wrap = false,
  className,
  style,
  children,
  ...props
}: RowProps) {
  const { box, rest } = splitBoxProps(props);
  const b = resolveBox(box);
  const f = resolveFlow({ gap, align, justify });
  const Component: ElementType = as ?? 'div';
  return (
    <Component
      className={cx(styles.box, styles.row, className)}
      style={{ ...b.style, ...f.style, ...style }}
      data-wrap={wrap ? '' : undefined}
      {...b.attrs}
      {...f.attrs}
      {...rest}
    >
      {children}
    </Component>
  );
}
