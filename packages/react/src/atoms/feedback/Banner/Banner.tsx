import { bannerTones, Size } from '@glacier/spec';
import type { ComponentProps, ReactNode } from 'react';
import { cx } from '../../../internal/cx.ts';
import { useT } from '../../../i18n/LocaleProvider.tsx';
import { kitMessages } from '../../../i18n/messages.ts';
import { IconButton } from '../../inputs/Button/IconButton.tsx';
import { Skeleton } from '../Skeleton/Skeleton.tsx';
import styles from './Banner.module.css';

// Derived from the spec so the tone union cannot drift.
export type BannerTone = (typeof bannerTones)[number];

const DismissIcon = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

export interface BannerProps extends ComponentProps<'div'> {
  tone?: BannerTone;
  /** Leading glyph, centered with the message. */
  icon?: ReactNode;
  /** Trailing slot, typically a Button or link. */
  action?: ReactNode;
  /** When set, renders a trailing close IconButton that calls this. */
  onDismiss?: () => void;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  children?: ReactNode;
}

export function Banner({
  tone = 'info',
  icon,
  action,
  onDismiss,
  skeleton = false,
  className,
  children,
  ...rest
}: BannerProps) {
  const t = useT();
  if (skeleton) {
    return (
      <Skeleton
        width="100%"
        height="3rem"
        radius="var(--glacier-radius-lg)"
        className={className}
      />
    );
  }
  const alert = tone === 'warning' || tone === 'danger';
  return (
    <div
      role={alert ? 'alert' : 'status'}
      className={cx(styles.banner, styles[tone], className)}
      {...rest}
    >
      {icon != null && <span className={styles.icon}>{icon}</span>}
      <div className={styles.message}>{children}</div>
      {action != null && <div className={styles.action}>{action}</div>}
      {onDismiss != null && (
        <div className={styles.dismiss}>
          <IconButton aria-label={t(kitMessages.dismiss)} size={Size.Small} onClick={onDismiss}>
            {DismissIcon}
          </IconButton>
        </div>
      )}
    </div>
  );
}
