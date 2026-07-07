import { textElements, textSizes, textTones, textWeights } from '@perfect/spec';
import type { ComponentProps, ElementType, ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { Skeleton } from '../Skeleton/Skeleton.tsx';
import styles from './Typography.module.css';

// Derived from the spec so the unions cannot drift.
export type TextTone = (typeof textTones)[number];
export type TextSize = (typeof textSizes)[number];
export type TextElement = (typeof textElements)[number];
export type TextWeight = (typeof textWeights)[number];

export interface TextProps extends Omit<ComponentProps<'p'>, 'children'> {
  /** Rendered element. Defaults to a paragraph. */
  as?: TextElement;
  size?: TextSize;
  tone?: TextTone;
  weight?: TextWeight;
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
    // Hold the full line box (leading x font size), not just 1em, so swapping a
    // skeleton for real text never shifts. The bar itself stays a thin 1em,
    // centered in the line.
    return (
      <span
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          height: `calc(var(--perfect-leading-${size}) * var(--perfect-font-size-${size}))`,
        }}
      >
        <Skeleton variant="text" width="14ch" style={{ fontSize: `var(--perfect-font-size-${size})` }} />
      </span>
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
