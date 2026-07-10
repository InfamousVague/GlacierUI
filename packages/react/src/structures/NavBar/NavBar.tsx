import { navBarOrientations } from '@glacier/spec';
import {
  createContext,
  useContext,
  useId,
  type ComponentProps,
  type ElementType,
  type ReactNode,
} from 'react';
import { motion, useReducedMotion, type Transition } from 'motion/react';
import { Spring, springTransition } from '@glacier/motion';
import { cx } from '../../internal/cx.ts';
import { asPolymorphic } from '../../internal/poly.ts';
import { CounterBadge } from '../../atoms/display/CounterBadge/CounterBadge.tsx';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import { Tooltip } from '../../molecules/Tooltip/Tooltip.tsx';
import styles from './NavBar.module.css';

// Derived from the spec so the orientation union cannot drift.
export type NavBarOrientation = (typeof navBarOrientations)[number];

// Shared with NavBarItem so the active pill is one layout element that slides
// between items, and so items know the bar's orientation. null when an item is
// used outside a NavBar, where the item lays out horizontally and the pill is
// static.
interface NavBarContextValue {
  orientation: NavBarOrientation;
  layoutId: string;
  transition: Transition;
}
const NavBarContext = createContext<NavBarContextValue | null>(null);

/** The item square in vertical orientation and the item height in horizontal. */
const ITEM_SIZE = 'var(--glacier-control-height-md)';

/** Item widths for the horizontal skeleton, one entry per placeholder item. */
const SKELETON_ITEM_WIDTHS = ['5rem', '6rem', '5.5rem', '4.5rem'];

export interface NavBarProps extends ComponentProps<'nav'> {
  /** Horizontal row for a top nav or bottom tab bar; vertical for a slim icon rail. */
  orientation?: NavBarOrientation;
  /** Required: apps often carry more than one nav landmark, and the label tells them apart. */
  'aria-label': string;
  /** Pinned to the far end (bottom when vertical, trailing edge when horizontal), for a settings item. */
  end?: ReactNode;
  /** Spring preset for the active pill as it slides between items. */
  spring?: Spring;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  children?: ReactNode;
}

/**
 * An app-level primary navigation bar. Horizontal it is a row of icon-and-label
 * items for a top nav or a bottom tab bar; vertical it is a slim icon rail of
 * square buttons with tooltips carrying the labels. Fill it with NavBarItem and
 * pin a settings item in the end slot. The active pill slides between items
 * with the chosen spring.
 */
export function NavBar({
  orientation = 'horizontal',
  end,
  spring = Spring.Snappy,
  skeleton = false,
  className,
  children,
  'aria-label': ariaLabel,
  ...rest
}: NavBarProps) {
  const id = useId();
  const reduce = useReducedMotion();

  if (skeleton) {
    const widths = orientation === 'vertical' ? SKELETON_ITEM_WIDTHS.map(() => ITEM_SIZE) : SKELETON_ITEM_WIDTHS;
    return (
      <nav {...rest} aria-hidden="true" className={cx(styles.nav, styles[orientation], className)}>
        <div className={styles.items}>
          {widths.map((width, index) => (
            <Skeleton key={index} width={width} height={ITEM_SIZE} radius="var(--glacier-radius-md)" />
          ))}
        </div>
        <div className={styles.end}>
          <Skeleton width={ITEM_SIZE} height={ITEM_SIZE} radius="var(--glacier-radius-md)" />
        </div>
      </nav>
    );
  }

  const context: NavBarContextValue = {
    orientation,
    layoutId: `${id}-active`,
    transition: reduce ? { duration: 0 } : springTransition(spring),
  };
  return (
    <NavBarContext.Provider value={context}>
      <nav className={cx(styles.nav, styles[orientation], className)} aria-label={ariaLabel} {...rest}>
        <div className={styles.items}>{children}</div>
        {end && <div className={styles.end}>{end}</div>}
      </nav>
    </NavBarContext.Provider>
  );
}

export interface NavBarItemProps extends Omit<ComponentProps<'button'>, 'children'> {
  /** Rendered element. Use 'a' for links. Defaults to a button. */
  as?: ElementType;
  /** Anchor href when rendered as a link. */
  href?: string;
  target?: string;
  rel?: string;
  /** Required leading glyph, hidden from assistive tech. */
  icon: ReactNode;
  /**
   * Required label. Visible text in horizontal orientation; in vertical it
   * becomes the accessible name and a tooltip placed to the right.
   */
  label: string;
  /** Highlights the item as the current location. */
  active?: boolean;
  /** Optional count shown as a CounterBadge: pinned to the icon corner in vertical, inline in horizontal. */
  badge?: number;
}

/**
 * One destination in a NavBar: an icon with a label, an optional count badge,
 * and the sliding active pill. In the vertical rail the label collapses into
 * an aria-label plus a right-placed tooltip, so the item stays a square icon
 * button.
 */
export function NavBarItem({
  as,
  icon,
  label,
  active = false,
  badge,
  disabled,
  className,
  ...rest
}: NavBarItemProps) {
  const Component = asPolymorphic(as, 'button');
  const extra = (as ?? 'button') === 'button' ? { type: 'button' as const, disabled } : {};
  const context = useContext(NavBarContext);
  const vertical = context?.orientation === 'vertical';
  const item = (
    <Component
      className={cx(styles.item, vertical ? styles.itemVertical : styles.itemHorizontal, className)}
      data-active={active || undefined}
      aria-current={active ? 'page' : undefined}
      aria-disabled={disabled || undefined}
      aria-label={vertical ? label : undefined}
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
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
      {!vertical && <span className={styles.label}>{label}</span>}
      {badge !== undefined && <CounterBadge count={badge} size="sm" className={styles.badge} />}
    </Component>
  );
  // The rail has no visible labels, so every item carries its own tooltip.
  if (vertical) {
    return (
      <Tooltip content={label} placement="right">
        {item}
      </Tooltip>
    );
  }
  return item;
}
