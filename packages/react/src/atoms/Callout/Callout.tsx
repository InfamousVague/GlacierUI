import { calloutTones } from '@perfect/spec';
import type { ComponentProps, ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { Skeleton } from '../Skeleton/Skeleton.tsx';
import styles from './Callout.module.css';

// Derived from the spec so the tone union cannot drift.
export type CalloutTone = (typeof calloutTones)[number];

export interface CalloutProps extends Omit<ComponentProps<'div'>, 'title'> {
  tone?: CalloutTone;
  title?: ReactNode;
  icon?: ReactNode;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  children?: ReactNode;
}

export function Callout({
  tone = 'note',
  title,
  icon,
  skeleton = false,
  className,
  children,
  ...rest
}: CalloutProps) {
  if (skeleton) {
    return (
      <Skeleton
        width="100%"
        height="4rem"
        radius="var(--perfect-radius-lg)"
        className={className}
      />
    );
  }
  const alert = tone === 'warning' || tone === 'danger';
  return (
    <div
      role={alert ? 'alert' : 'note'}
      className={cx(styles.callout, styles[tone], className)}
      {...rest}
    >
      {icon != null && <span className={styles.icon}>{icon}</span>}
      <div className={styles.body}>
        {title != null && <span className={styles.title}>{title}</span>}
        {children}
      </div>
    </div>
  );
}
