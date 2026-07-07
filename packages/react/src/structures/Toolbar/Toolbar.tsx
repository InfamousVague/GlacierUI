import type { ComponentProps, ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import styles from './Toolbar.module.css';

export interface ToolbarProps extends ComponentProps<'div'> {
  /** Content pinned to the start, such as a menu button or a title. */
  start?: ReactNode;
  /** Content pinned to the end, such as actions. */
  end?: ReactNode;
  /** Stick to the top of the scroll container. */
  sticky?: boolean;
  /** Add a bottom hairline. */
  border?: boolean;
  /** Add the translucent glass background, for app and page headers. */
  surface?: boolean;
  children?: ReactNode;
}

/**
 * A horizontal bar with start and end slots and a flexible middle. Use it for
 * app headers, page toolbars, and card headers. The middle grows, so the end
 * slot always hugs the trailing edge without a margin.
 */
export function Toolbar({
  start,
  end,
  sticky = false,
  border = false,
  surface = false,
  className,
  children,
  ...rest
}: ToolbarProps) {
  return (
    <div
      className={cx(styles.toolbar, className)}
      data-sticky={sticky || undefined}
      data-border={border || undefined}
      data-surface={surface || undefined}
      {...rest}
    >
      {start && <div className={styles.slot}>{start}</div>}
      <div className={styles.content}>{children}</div>
      {end && <div className={styles.slot}>{end}</div>}
    </div>
  );
}
