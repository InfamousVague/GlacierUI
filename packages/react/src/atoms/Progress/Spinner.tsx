import { controlSizes, spinnerTones } from '@perfect/spec';
import type { ComponentProps } from 'react';
import { cx } from '../../internal/cx.ts';
import { useT } from '../../i18n/LocaleProvider.tsx';
import { kitMessages } from '../../i18n/messages.ts';
import { Skeleton } from '../Skeleton/Skeleton.tsx';
import styles from './Progress.module.css';

// Derived from the spec so the unions cannot drift.
export type SpinnerSize = (typeof controlSizes)[number];
export type SpinnerTone = (typeof spinnerTones)[number];

export interface SpinnerProps extends ComponentProps<'span'> {
  /** sm tracks the surrounding font size (1em); md and lg are fixed. */
  size?: SpinnerSize;
  tone?: SpinnerTone;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Accessible name. Pass an empty string when a parent already announces loading. */
  'aria-label'?: string;
}

const SIZE_CLASS = { sm: 'spinnerSm', md: 'spinnerMd', lg: 'spinnerLg' } as const;

const SKELETON_DIAMETERS: Record<'sm' | 'md' | 'lg', string> = {
  sm: '1em',
  md: '1.25rem',
  lg: '1.875rem',
};

export function Spinner({ size = 'md', tone = 'subtle', skeleton = false, className, ...rest }: SpinnerProps) {
  const t = useT();
  const label = rest['aria-label'] ?? t(kitMessages.loading);
  if (skeleton) {
    return <Skeleton variant="circle" width={SKELETON_DIAMETERS[size]} className={className} />;
  }
  return (
    <span
      role="status"
      aria-label={label === '' ? undefined : label}
      aria-hidden={label === '' || undefined}
      className={cx(styles.spinner, styles[SIZE_CLASS[size]], tone !== 'subtle' && styles[tone], className)}
      {...rest}
    />
  );
}
