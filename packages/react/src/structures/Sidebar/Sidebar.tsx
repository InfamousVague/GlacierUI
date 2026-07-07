import type { ComponentProps, ElementType, ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import styles from './Sidebar.module.css';

export interface SidebarProps extends Omit<ComponentProps<'div'>, 'title'> {
  /** Pinned region at the top, for a brand or a search field. */
  header?: ReactNode;
  /** Pinned region at the bottom, for a profile or settings link. */
  footer?: ReactNode;
  children?: ReactNode;
}

/**
 * The bones of a side navigation: an optional pinned header, a scrollable body
 * of sections, and an optional pinned footer. Drop it into AppShell's sidebar
 * slot and fill it with SidebarSection and SidebarItem.
 */
export function Sidebar({ header, footer, className, children, ...rest }: SidebarProps) {
  return (
    <div className={cx(styles.sidebar, className)} {...rest}>
      {header && <div className={cx(styles.region, styles.regionBordered)}>{header}</div>}
      <div className={styles.body}>{children}</div>
      {footer && <div className={cx(styles.region, styles.footer)}>{footer}</div>}
    </div>
  );
}

export interface SidebarSectionProps extends Omit<ComponentProps<'div'>, 'title'> {
  /** Optional uppercase group heading. */
  title?: ReactNode;
  children?: ReactNode;
}

/** A titled group of sidebar items. */
export function SidebarSection({ title, className, children, ...rest }: SidebarSectionProps) {
  return (
    <div className={className} {...rest}>
      {title && <div className={styles.sectionTitle}>{title}</div>}
      <div className={styles.sectionItems}>{children}</div>
    </div>
  );
}

export interface SidebarItemProps extends Omit<ComponentProps<'button'>, 'title'> {
  /** Rendered element. Use 'a' for links. Defaults to a button. */
  as?: ElementType;
  /** Anchor href when rendered as a link. */
  href?: string;
  target?: string;
  rel?: string;
  icon?: ReactNode;
  /** Highlights the item as the current location. */
  active?: boolean;
  /** Trailing content such as a CounterBadge. */
  trailing?: ReactNode;
  children?: ReactNode;
}

/** A navigation row: icon, label, and an optional trailing slot. */
export function SidebarItem({
  as,
  icon,
  active = false,
  trailing,
  disabled,
  className,
  children,
  ...rest
}: SidebarItemProps) {
  const Component: ElementType = as ?? 'button';
  const extra = Component === 'button' ? { type: 'button' as const, disabled } : {};
  return (
    <Component
      className={cx(styles.item, className)}
      data-active={active || undefined}
      aria-current={active ? 'page' : undefined}
      aria-disabled={disabled || undefined}
      {...extra}
      {...rest}
    >
      {icon && (
        <span className={styles.itemIcon} aria-hidden="true">
          {icon}
        </span>
      )}
      <span className={styles.itemLabel}>{children}</span>
      {trailing && <span className={styles.itemTrailing}>{trailing}</span>}
    </Component>
  );
}
