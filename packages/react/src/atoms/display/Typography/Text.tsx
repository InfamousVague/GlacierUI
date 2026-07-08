import { textAligns, textElements, textSizes, textTones, textWeights, SkeletonVariant } from '@glacier/spec';
import type { ComponentProps, ElementType, ReactNode } from 'react';
import { cx } from '../../../internal/cx.ts';
import { Skeleton } from '../../feedback/Skeleton/Skeleton.tsx';
import styles from './Typography.module.css';

// Derived from the spec so the unions cannot drift. (The `TextTone` enum lives
// in @glacier/spec; this union is the string form the tone prop accepts.)
export type TextToneName = (typeof textTones)[number];
export type TextSize = (typeof textSizes)[number];
export type TextElement = (typeof textElements)[number];
export type TextWeight = (typeof textWeights)[number];
export type TextAlign = (typeof textAligns)[number];

export interface TextProps extends Omit<ComponentProps<'p'>, 'children'> {
  /** Rendered element. Defaults to a paragraph. */
  as?: TextElement;
  size?: TextSize;
  tone?: TextToneName;
  weight?: TextWeight;
  /** Monospace with tabular numerals, for values and measurements. */
  mono?: boolean;
  /** Text alignment; inherits when unset. */
  align?: TextAlign;
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
  align,
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
          height: `calc(var(--glacier-leading-${size}) * var(--glacier-font-size-${size}))`,
        }}
      >
        <Skeleton variant={SkeletonVariant.Text} width="14ch" style={{ fontSize: `var(--glacier-font-size-${size})` }} />
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
        align && styles[`align-${align}`],
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}
