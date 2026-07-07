import type { ComponentProps, ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { Skeleton } from '../Skeleton/Skeleton.tsx';
import styles from './EmptyState.module.css';

export interface EmptyStateProps extends Omit<ComponentProps<'div'>, 'title'> {
  /** Glyph rendered inside the leading disc. Decorative. */
  icon?: ReactNode;
  /** Heading naming what is empty or missing. */
  title: ReactNode;
  /** Muted supporting sentence, centered and width-capped. */
  description?: ReactNode;
  /** Call-to-action node, e.g. a Button, below the text. */
  action?: ReactNode;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  children?: ReactNode;
}

/**
 * A centered placeholder for an empty view. Stacks an optional icon disc, a
 * title, a muted description, and an action, all centered on both axes so it
 * reads as a calm, deliberate stop rather than a missing screen.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  skeleton = false,
  className,
  children,
  ...rest
}: EmptyStateProps) {
  if (skeleton) {
    return (
      <div className={cx(styles.emptyState, className)} {...rest}>
        <Skeleton variant="circle" width="4rem" className={styles.disc} />
        <Skeleton variant="text" width="12ch" style={{ fontSize: 'var(--perfect-font-size-lg)' }} />
        <Skeleton variant="text" width="24ch" style={{ fontSize: 'var(--perfect-font-size-sm)' }} />
      </div>
    );
  }
  return (
    <div className={cx(styles.emptyState, className)} {...rest}>
      {icon != null && (
        <span className={styles.disc} aria-hidden="true">
          {icon}
        </span>
      )}
      <h2 className={styles.title}>{title}</h2>
      {description != null && <p className={styles.description}>{description}</p>}
      {action != null && <div className={styles.action}>{action}</div>}
      {children}
    </div>
  );
}
