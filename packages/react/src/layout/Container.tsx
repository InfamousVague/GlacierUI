import type { ComponentProps, ElementType, ReactNode } from 'react';
import { cx } from '../internal/cx.ts';
import { resolveBox, splitBoxProps } from './resolve.ts';
import type { BoxStyleProps, ContainerSize } from './types.ts';
import styles from './Layout.module.css';

export interface ContainerProps
  extends Omit<BoxStyleProps, 'maxWidth' | 'width'>,
    Omit<ComponentProps<'div'>, 'color'> {
  as?: ElementType;
  /** Max content width. Defaults to lg. */
  size?: ContainerSize;
  children?: ReactNode;
}

/**
 * A centered, width-capped column with comfortable responsive gutters. Wrap a
 * page in one so content never runs edge to edge on wide screens.
 */
export function Container({ as, size = 'lg', className, style, children, ...props }: ContainerProps) {
  const { box, rest } = splitBoxProps(props);
  // Default gutters only when the caller has not set horizontal padding.
  const hasX =
    box.padding !== undefined || box.paddingX !== undefined || box.paddingLeft !== undefined;
  const resolved = resolveBox({
    ...box,
    maxWidth: size,
    paddingX: hasX ? box.paddingX : { base: 4, md: 6 },
  });
  const Component: ElementType = as ?? 'div';
  return (
    <Component
      className={cx(styles.box, styles.container, className)}
      style={{ ...resolved.style, ...style }}
      {...resolved.attrs}
      {...rest}
    >
      {children}
    </Component>
  );
}
