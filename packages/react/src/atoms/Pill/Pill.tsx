import { pillVariants, type Tone } from '@perfect/spec';
import type { ComponentProps, ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { Skeleton } from '../Skeleton/Skeleton.tsx';
import styles from './Pill.module.css';

// Tone and the variant list come from the spec so they stay in lockstep.
export type PillTone = Tone;
export type PillVariant = (typeof pillVariants)[number];

const SKELETON_GEOMETRY: Record<'sm' | 'md', { width: string; height: string }> = {
  sm: { width: '3.5rem', height: '1.375rem' },
  md: { width: '4.5rem', height: '1.75rem' },
};

export interface PillProps extends Omit<ComponentProps<'span'>, 'children'> {
  tone?: PillTone;
  variant?: PillVariant;
  size?: 'sm' | 'md';
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  children?: ReactNode;
}

export function Pill({
  tone = 'neutral',
  variant = 'soft',
  size = 'md',
  skeleton = false,
  className,
  children,
  ...rest
}: PillProps) {
  if (skeleton) {
    return (
      <Skeleton
        width={SKELETON_GEOMETRY[size].width}
        height={SKELETON_GEOMETRY[size].height}
        radius="var(--perfect-radius-full)"
        className={className}
      />
    );
  }
  return (
    <span className={cx(styles.pill, styles[variant], styles[tone], styles[size], className)} {...rest}>
      {children}
    </span>
  );
}
