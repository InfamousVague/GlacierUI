import type { ComponentProps, ElementType, ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { Skeleton } from '../Skeleton/Skeleton.tsx';
import styles from './Typography.module.css';

export type TextTone = 'default' | 'muted' | 'subtle' | 'accent' | 'danger' | 'success' | 'warning';

export interface TextProps extends Omit<ComponentProps<'p'>, 'children'> {
  /** Rendered element. Defaults to a paragraph. */
  as?: 'p' | 'span' | 'div' | 'strong' | 'em' | 'small';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  tone?: TextTone;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  /** Monospace with tabular numerals, for values and measurements. */
  mono?: boolean;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  children?: ReactNode;
}

export function Text({
  as = 'p',
  size = 'md',
  tone = 'default',
  weight = 'regular',
  mono = false,
  skeleton = false,
  className,
  children,
  ...rest
}: TextProps) {
  if (skeleton) {
    return (
      <Skeleton
        variant="text"
        width="14ch"
        className={className}
        style={{ fontSize: `var(--perfect-font-size-${size})` }}
      />
    );
  }
  const Component: ElementType = as;
  return (
    <Component
      className={cx(
        styles.text,
        styles[size],
        styles[`tone-${tone}`],
        styles[`weight-${weight}`],
        mono && styles.mono,
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}
