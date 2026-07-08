import { motion, useReducedMotion } from 'motion/react';
import { Speed, Ease, transition } from '@perfect/motion';
import {
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../internal/cx.ts';
import { useControlled } from '../../internal/useControlled.ts';
import { useAnchoredPosition, type Placement } from '../../internal/useAnchoredPosition.ts';
import styles from './Menu.module.css';

interface MenuContextValue {
  close: () => void;
}
const MenuContext = createContext<MenuContextValue | null>(null);

export interface MenuProps {
  /** The element that toggles the menu. Its ref and click are wired up. */
  trigger: ReactElement;
  /** Where to place the menu relative to the trigger. */
  placement?: Placement;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Accessible label for the menu. */
  'aria-label'?: string;
  className?: string;
  children?: ReactNode;
}

/**
 * A dropdown list of actions anchored to a trigger. Built on the same anchored
 * overlay as Popover — it portals to the body, flips and clamps on screen, and
 * closes on outside press or Escape — but with menu semantics: a role="menu"
 * panel of role="menuitem" rows, arrow-key roving focus, and select-to-close.
 */
export function Menu({
  trigger,
  placement = 'bottom-start',
  open,
  defaultOpen = false,
  onOpenChange,
  className,
  children,
  ...rest
}: MenuProps) {
  const menuId = useId();
  const reduce = useReducedMotion();
  const triggerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setOpen] = useControlled(open, defaultOpen);
  const [mounted, setMounted] = useState(isOpen);

  const position = useAnchoredPosition(mounted, triggerRef, menuRef, { placement });

  function setOpenState(next: boolean) {
    setOpen(next);
    onOpenChange?.(next);
  }

  function close() {
    setOpenState(false);
    triggerRef.current?.focus();
  }

  useEffect(() => {
    if (isOpen) setMounted(true);
  }, [isOpen]);

  function enabledItems(): HTMLElement[] {
    return Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])') ?? []);
  }

  function focusItem(index: number) {
    const items = enabledItems();
    if (items.length === 0) return;
    const i = ((index % items.length) + items.length) % items.length;
    items[i]?.focus();
  }

  // On open, focus the first item once the panel is positioned; close on
  // outside press. Escape and arrow keys are handled on the menu itself.
  useEffect(() => {
    if (!mounted) return;
    const raf = requestAnimationFrame(() => focusItem(0));
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target) && !triggerRef.current?.contains(target)) {
        setOpenState(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('pointerdown', onPointerDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const items = enabledItems();
    const current = items.indexOf(document.activeElement as HTMLElement);
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        focusItem(current + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        focusItem(current - 1);
        break;
      case 'Home':
        event.preventDefault();
        focusItem(0);
        break;
      case 'End':
        event.preventDefault();
        focusItem(items.length - 1);
        break;
      case 'Escape':
        event.preventDefault();
        close();
        break;
      case 'Tab':
        setOpenState(false);
        break;
    }
  }

  const triggerEl = cloneElement(trigger as ReactElement<Record<string, unknown>>, {
    ref: triggerRef,
    'aria-haspopup': 'menu',
    'aria-expanded': isOpen,
    'aria-controls': isOpen ? menuId : undefined,
    onClick: (event: unknown) => {
      (trigger.props as { onClick?: (event: unknown) => void }).onClick?.(event);
      setOpenState(!isOpen);
    },
  });

  return (
    <MenuContext.Provider value={{ close }}>
      {triggerEl}
      {mounted &&
        createPortal(
          <motion.div
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-label={rest['aria-label']}
            className={cx(styles.menu, className)}
            style={position?.style}
            onKeyDown={onKeyDown}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -4 }}
            animate={isOpen ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.98, y: -2 }}
            transition={reduce ? { duration: 0 } : transition(Speed.Fast, Ease.Out)}
            onAnimationComplete={() => {
              if (!isOpen) setMounted(false);
            }}
          >
            {children}
          </motion.div>,
          document.body,
        )}
    </MenuContext.Provider>
  );
}

export interface MenuItemProps extends Omit<ComponentProps<'button'>, 'onSelect'> {
  /** Leading glyph. */
  icon?: ReactNode;
  /** Trailing shortcut hint, e.g. a Kbd or "⌘C". */
  shortcut?: ReactNode;
  /** Paints the row in the danger tone. */
  danger?: boolean;
  /** Called when the item is chosen; the menu then closes. */
  onSelect?: () => void;
}

/** A single action row inside a Menu. */
export function MenuItem({ icon, shortcut, danger, onSelect, disabled, className, children, onClick, ...rest }: MenuItemProps) {
  const ctx = useContext(MenuContext);
  return (
    <button
      type="button"
      role="menuitem"
      tabIndex={-1}
      aria-disabled={disabled || undefined}
      data-danger={danger || undefined}
      className={cx(styles.item, className)}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        if (disabled) return;
        onClick?.(event);
        onSelect?.();
        ctx?.close();
      }}
      {...rest}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.label}>{children}</span>
      {shortcut && <span className={styles.shortcut}>{shortcut}</span>}
    </button>
  );
}

/** A divider between groups of items. */
export function MenuSeparator({ className }: { className?: string }) {
  return <div role="separator" className={cx(styles.separator, className)} />;
}

/** A non-interactive section heading inside a Menu. */
export function MenuLabel({ className, children }: { className?: string; children?: ReactNode }) {
  return (
    <div role="presentation" className={cx(styles.groupLabel, className)}>
      {children}
    </div>
  );
}
