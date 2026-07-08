import { pillVariants, tones } from '@glacier/spec';
import type { ComponentProps, ReactNode } from 'react';
import { cx } from '../../../internal/cx.ts';
import { useT } from '../../../i18n/LocaleProvider.tsx';
import { kitMessages } from '../../../i18n/messages.ts';
import { Skeleton } from '../../feedback/Skeleton/Skeleton.tsx';
import styles from './Pill.module.css';

// Tone and the variant list come from the spec so they stay in lockstep.
export type PillTone = (typeof tones)[number];
export type PillVariant = (typeof pillVariants)[number];

const SKELETON_GEOMETRY: Record<'sm' | 'md', { width: string; height: string }> = {
  sm: { width: '3.5rem', height: '1.375rem' },
  md: { width: '4.5rem', height: '1.75rem' },
};

export interface PillProps extends Omit<ComponentProps<'span'>, 'children'> {
  tone?: PillTone;
  variant?: PillVariant;
  size?: 'sm' | 'md';
  /** Leading glyph, hidden from assistive tech. */
  icon?: ReactNode;
  /** When set, renders a trailing remove button that calls this on click, turning the pill into a removable tag. */
  onRemove?: () => void;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Renders the frosted glass material instead of a solid surface. */
  glass?: boolean;
  children?: ReactNode;
}

export function Pill({
  tone = 'neutral',
  variant = 'soft',
  size = 'md',
  icon,
  onRemove,
  skeleton = false,
  glass = false,
  className,
  children,
  ...rest
}: PillProps) {
  const t = useT();
  if (skeleton) {
    return (
      <Skeleton
        width={SKELETON_GEOMETRY[size].width}
        height={SKELETON_GEOMETRY[size].height}
        radius="var(--glacier-radius-full)"
        className={className}
      />
    );
  }
  return (
    <span className={cx(styles.pill, styles[variant], styles[tone], styles[size], glass && styles.glass, className)} {...rest}>
      {icon != null && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
      {onRemove && (
        <button type="button" className={styles.remove} aria-label={t(kitMessages.dismiss)} onClick={onRemove}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </span>
  );
}
