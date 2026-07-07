import { createContext, useContext, useId, type ComponentProps, type ElementType, type ReactNode } from 'react';
import { motion, useReducedMotion, type Transition } from 'motion/react';
import { Spring, springTransition } from '@perfect/motion';
import { cx } from '../../internal/cx.ts';
import styles from './Sidebar.module.css';

// Shared with SidebarItem so the active pill is one layout element that slides
// between items, even across sections. null when an item is used outside a
// Sidebar, where the pill is static.
interface SidebarContextValue {
  layoutId: string;
  transition: Transition;
}
const SidebarContext = createContext<SidebarContextValue | null>(null);

export interface SidebarProps extends Omit<ComponentProps<'div'>, 'title'> {
  /** Pinned region at the top, for a brand or a search field. */
  header?: ReactNode;
  /** Pinned region at the bottom, for a profile or settings link. */
  footer?: ReactNode;
  /** Spring preset for the active pill as it slides between items. */
  spring?: Spring;
  children?: ReactNode;
}

/**
 * The bones of a side navigation: an optional pinned header, a scrollable body
 * of sections, and an optional pinned footer. Drop it into AppShell's sidebar
 * slot and fill it with SidebarSection and SidebarItem. The active pill slides
 * between items with the chosen spring.
 */
export function Sidebar({ header, footer, spring = Spring.Smooth, className, children, ...rest }: SidebarProps) {
  const id = useId();
  const reduce = useReducedMotion();
  const context: SidebarContextValue = {
    layoutId: `${id}-active`,
    transition: reduce ? { duration: 0 } : springTransition(spring),
  };
  return (
    <SidebarContext.Provider value={context}>
      <div className={cx(styles.sidebar, className)} {...rest}>
        {header && <div className={cx(styles.region, styles.regionBordered)}>{header}</div>}
        <div className={styles.body}>{children}</div>
        {footer && <div className={cx(styles.region, styles.footer)}>{footer}</div>}
      </div>
    </SidebarContext.Provider>
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
    <div className={cx(styles.section, className)} {...rest}>
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
  const context = useContext(SidebarContext);
  return (
    <Component
      className={cx(styles.item, className)}
      data-active={active || undefined}
      aria-current={active ? 'page' : undefined}
      aria-disabled={disabled || undefined}
      {...extra}
      {...rest}
    >
      {active &&
        (context ? (
          <motion.span
            className={styles.indicator}
            layoutId={context.layoutId}
            transition={context.transition}
            aria-hidden="true"
          />
        ) : (
          <span className={styles.indicator} aria-hidden="true" />
        ))}
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
