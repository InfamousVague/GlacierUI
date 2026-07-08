import type { ComponentProps, CSSProperties, ElementType, ReactNode } from 'react';
import type { SpaceStep } from '@glacier/tokens';
import { cx } from '../internal/cx.ts';
import { asPolymorphic } from '../internal/poly.ts';
import { assignColumns, resolveBox, resolveFlow, splitBoxProps } from './resolve.ts';
import type { Align, BoxStyleProps, Justify, Responsive } from './types.ts';
import styles from './Layout.module.css';

export interface GridProps extends BoxStyleProps, Omit<ComponentProps<'div'>, 'color'> {
  as?: ElementType;
  gap?: Responsive<SpaceStep>;
  /** Fixed column count, optionally per breakpoint. Ignored when minChildWidth is set. */
  columns?: Responsive<number>;
  /** Auto-fit as many equal columns as fit at this minimum child width. */
  minChildWidth?: string;
  align?: Align;
  justify?: Justify;
  children?: ReactNode;
}

/**
 * A grid. Give it a fixed column count (responsive), or a minChildWidth to
 * auto-fit as many equal tracks as fit, which reflows with no media queries.
 * Children never overflow, since each track floors at zero.
 */
export function Grid({
  as,
  gap = 4,
  columns = 1,
  minChildWidth,
  align,
  justify,
  className,
  style,
  children,
  ...props
}: GridProps) {
  const { box, rest } = splitBoxProps(props);
  const b = resolveBox(box);
  const f = resolveFlow({ gap, align, justify });
  const gridStyle: Record<string, string> = { ...(f.style as Record<string, string>) };
  if (minChildWidth) gridStyle['--pl-min'] = minChildWidth;
  else assignColumns(gridStyle, columns);
  const Component = asPolymorphic(as, 'div');
  return (
    <Component
      className={cx(styles.box, styles.grid, className)}
      style={{ ...b.style, ...(gridStyle as CSSProperties), ...style }}
      data-autofit={minChildWidth ? '' : undefined}
      {...b.attrs}
      {...f.attrs}
      {...rest}
    >
      {children}
    </Component>
  );
}
