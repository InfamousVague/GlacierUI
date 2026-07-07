import type { ComponentProps } from 'react';
import { cx } from '../../internal/cx.ts';
import { Skeleton } from '../Skeleton/Skeleton.tsx';
import styles from './StatusDot.module.css';

export type StatusDotTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

/** Diameter per size, mirroring the .sm/.md rules in the CSS. */
const SIZE_REM: Record<'sm' | 'md', string> = {
  sm: '0.5rem',
  md: '0.625rem',
};

export interface StatusDotProps extends Omit<ComponentProps<'span'>, 'children'> {
  tone?: StatusDotTone;
  /** Adds an animated expanding ring for live states. */
  pulse?: boolean;
  size?: 'sm' | 'md';
  /** Accessible name. When set, the dot becomes a status region; otherwise it is decorative. */
  label?: string;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
}

export function StatusDot({
  tone = 'neutral',
  pulse = false,
  size = 'md',
  label,
  skeleton = false,
  className,
  ...rest
}: StatusDotProps) {
  const sizeRem = SIZE_REM[size];

  if (skeleton) {
    return <Skeleton variant="circle" width={sizeRem} className={className} />;
  }

  return (
    <span
      className={cx(styles.dot, styles[size], styles[tone], pulse && styles.pulse, className)}
      role={label ? 'status' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : 'true'}
      {...rest}
    />
  );
}
