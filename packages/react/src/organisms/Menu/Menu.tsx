import { motion, useReducedMotion } from 'motion/react';
import { Speed, Ease, transition } from '@glacier/motion';
import {
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../internal/cx.ts';
import { resolveDirection, useDirection, type Direction } from '../../internal/direction.ts';
import { useControlled } from '../../internal/useControlled.ts';
import { useAnchoredPosition, type Placement, type VirtualAnchor } from '../../internal/useAnchoredPosition.ts';
import styles from './Menu.module.css';

interface MenuContextValue {
  /** Closes the whole menu stack and restores focus to where it came from. */
  close: () => void;
  /** The root panel's id; every panel in the stack carries it as data-menu-stack. */
  stackId: string;
  /** Whether the nearest ancestor panel is open; a flyout closes when it drops. */
  open: boolean;
}
const MenuContext = createContext<MenuContextValue | null>(null);

// ---- shared panel internals -------------------------------------------------

function enabledItemsIn(panel: HTMLElement | null): HTMLElement[] {
  return Array.from(panel?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])') ?? []);
}

function focusItemIn(panel: HTMLElement | null, index: number) {
  const items = enabledItemsIn(panel);
  if (items.length === 0) {
    // Every item disabled: focus the panel itself so Escape (handled on the
    // panel's onKeyDown) still closes the menu instead of stranding focus.
    panel?.focus();
    return;
  }
  const i = ((index % items.length) + items.length) % items.length;
  items[i]?.focus();
}

/** ArrowUp/ArrowDown/Home/End roving focus shared by every panel. Returns true when handled. */
function navigatePanel(event: KeyboardEvent<HTMLDivElement>, panel: HTMLElement | null): boolean {
  const items = enabledItemsIn(panel);
  const current = items.indexOf(document.activeElement as HTMLElement);
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      focusItemIn(panel, current + 1);
      return true;
    case 'ArrowUp':
      event.preventDefault();
      focusItemIn(panel, current - 1);
      return true;
    case 'Home':
      event.preventDefault();
      focusItemIn(panel, 0);
      return true;
    case 'End':
      event.preventDefault();
      focusItemIn(panel, items.length - 1);
      return true;
  }
  return false;
}

/** True when the event landed inside any panel of the given menu stack. */
function withinStack(target: EventTarget | null, stackId: string): boolean {
  return target instanceof Element && target.closest(`[data-menu-stack="${stackId}"]`) !== null;
}

interface MenuPanelProps {
  panelRef: RefObject<HTMLDivElement | null>;
  id?: string;
  isOpen: boolean;
  stackId: string;
  label?: string;
  /**
   * The trigger's resolved writing direction, stamped on the portalled panel.
   * The portal escapes any scoped dir ancestor, so without this the panel
   * would fall back to the document direction.
   */
  dir?: Direction;
  className?: string;
  style?: CSSProperties;
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  onPointerEnter?: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerLeave?: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onExitComplete: () => void;
  children?: ReactNode;
}

/** The portalled glass panel shared by Menu, ContextMenu, and MenuSub flyouts. */
function MenuPanel({
  panelRef,
  id,
  isOpen,
  stackId,
  label,
  dir,
  className,
  style,
  onKeyDown,
  onPointerEnter,
  onPointerLeave,
  onExitComplete,
  children,
}: MenuPanelProps) {
  const reduce = useReducedMotion();
  return createPortal(
    <motion.div
      ref={panelRef}
      id={id}
      role="menu"
      aria-label={label}
      tabIndex={-1}
      dir={dir}
      data-menu-stack={stackId}
      className={cx(styles.menu, className)}
      style={style}
      onKeyDown={onKeyDown}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -4 }}
      animate={isOpen ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.98, y: -2 }}
      transition={reduce ? { duration: 0 } : transition(Speed.Fast, Ease.Out)}
      onAnimationComplete={() => {
        if (!isOpen) onExitComplete();
      }}
    >
      {children}
    </motion.div>,
    document.body,
  );
}

// ---- Menu --------------------------------------------------------------------

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
 * overlay as Popover - it portals to the body, flips and clamps on screen, and
 * closes on outside press or Escape - but with menu semantics: a role="menu"
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
  const triggerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setOpen] = useControlled(open, defaultOpen);
  const [mounted, setMounted] = useState(isOpen);
  const dir = useDirection(triggerRef);

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

  // On open, focus the first item once the panel is positioned; close on
  // outside press. Escape and arrow keys are handled on the menu itself.
  useEffect(() => {
    if (!mounted) return;
    const raf = requestAnimationFrame(() => focusItemIn(menuRef.current, 0));
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      if (withinStack(event.target, menuId)) return; // a portalled flyout panel
      setOpenState(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('pointerdown', onPointerDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (navigatePanel(event, menuRef.current)) return;
    switch (event.key) {
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
    <MenuContext.Provider value={{ close, stackId: menuId, open: isOpen }}>
      {triggerEl}
      {mounted && (
        <MenuPanel
          panelRef={menuRef}
          id={menuId}
          isOpen={isOpen}
          stackId={menuId}
          label={rest['aria-label']}
          dir={dir}
          className={className}
          style={position?.style}
          onKeyDown={onKeyDown}
          onExitComplete={() => setMounted(false)}
        >
          {children}
        </MenuPanel>
      )}
    </MenuContext.Provider>
  );
}

// ---- ContextMenu ---------------------------------------------------------------

const LONG_PRESS_MS = 500;
const LONG_PRESS_TOLERANCE = 8;
const CONTEXT_OFFSET = 2;

/** A zero-size rect at a pointer position, duck-typed as the panel's anchor. */
function pointRect(x: number, y: number): DOMRect {
  return { x, y, top: y, left: x, right: x, bottom: y, width: 0, height: 0, toJSON: () => ({}) } as DOMRect;
}

export interface ContextMenuProps extends Omit<ComponentProps<'div'>, 'content'> {
  /** The menu content - MenuItem, MenuSub, MenuSeparator, MenuLabel rows. */
  content: ReactNode;
  onOpenChange?: (open: boolean) => void;
  /** Accessible label for the menu panel. */
  'aria-label'?: string;
  /** Class for the portalled menu panel; className styles the target wrapper. */
  menuClassName?: string;
}

/**
 * A menu summoned at the pointer instead of a trigger. Wrap any content: a
 * right-click (contextmenu) or a touch long-press opens the same glass panel
 * Menu uses, anchored to the pointer coordinates via a zero-size virtual
 * anchor. Dismisses on Escape, outside press, or scrolling away; focus moves
 * into the panel on open and is restored on close.
 */
export function ContextMenu({
  content,
  onOpenChange,
  menuClassName,
  className,
  children,
  onContextMenu,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  'aria-label': ariaLabel,
  ...rest
}: ContextMenuProps) {
  const menuId = useId();
  const anchorRef = useRef<VirtualAnchor | null>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const pressRef = useRef<{ x: number; y: number; timer: number } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null);
  // The anchor is a virtual point with no DOM node, so the panel itself is
  // what the engine reads direction from - stamp it with the target's dir.
  const dir = useDirection(targetRef);

  const position = useAnchoredPosition(mounted, anchorRef, menuRef, {
    placement: 'bottom-start',
    offset: CONTEXT_OFFSET,
    key: point,
  });

  function openAt(x: number, y: number) {
    anchorRef.current = { getBoundingClientRect: () => pointRect(x, y) };
    restoreRef.current = (document.activeElement as HTMLElement | null) ?? null;
    setPoint({ x, y });
    setIsOpen(true);
    setMounted(true);
    onOpenChange?.(true);
  }

  function closeMenu(restoreFocus: boolean) {
    setIsOpen(false);
    onOpenChange?.(false);
    if (restoreFocus) restoreRef.current?.focus();
  }

  function clearPress() {
    if (pressRef.current !== null) {
      window.clearTimeout(pressRef.current.timer);
      pressRef.current = null;
    }
  }

  useEffect(() => () => clearPress(), []);

  // On open (or reopen at new coordinates): focus the first item, dismiss on
  // outside press, dismiss when anything outside the stack scrolls away.
  useEffect(() => {
    if (!mounted) return;
    const raf = requestAnimationFrame(() => focusItemIn(menuRef.current, 0));
    const onDocPointerDown = (event: PointerEvent) => {
      if (withinStack(event.target, menuId)) return;
      closeMenu(false);
    };
    const onScroll = (event: Event) => {
      if (withinStack(event.target, menuId)) return;
      closeMenu(false);
    };
    document.addEventListener('pointerdown', onDocPointerDown);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('pointerdown', onDocPointerDown);
      window.removeEventListener('scroll', onScroll, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, point]);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (navigatePanel(event, menuRef.current)) return;
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        closeMenu(true);
        break;
      case 'Tab':
        closeMenu(false);
        break;
    }
  }

  return (
    <MenuContext.Provider value={{ close: () => closeMenu(true), stackId: menuId, open: isOpen }}>
      <div
        ref={targetRef}
        className={cx(styles.contextTarget, className)}
        onContextMenu={(event: MouseEvent<HTMLDivElement>) => {
          onContextMenu?.(event);
          event.preventDefault();
          clearPress();
          openAt(event.clientX, event.clientY);
        }}
        onPointerDown={(event: ReactPointerEvent<HTMLDivElement>) => {
          onPointerDown?.(event);
          if (event.pointerType === 'mouse') return; // mice long-press nothing; they right-click
          const { clientX, clientY } = event;
          clearPress();
          pressRef.current = {
            x: clientX,
            y: clientY,
            timer: window.setTimeout(() => {
              pressRef.current = null;
              openAt(clientX, clientY);
            }, LONG_PRESS_MS),
          };
        }}
        onPointerMove={(event: ReactPointerEvent<HTMLDivElement>) => {
          onPointerMove?.(event);
          if (pressRef.current === null) return;
          if (Math.hypot(event.clientX - pressRef.current.x, event.clientY - pressRef.current.y) > LONG_PRESS_TOLERANCE) {
            clearPress();
          }
        }}
        onPointerUp={(event: ReactPointerEvent<HTMLDivElement>) => {
          onPointerUp?.(event);
          clearPress();
        }}
        onPointerCancel={(event: ReactPointerEvent<HTMLDivElement>) => {
          onPointerCancel?.(event);
          clearPress();
        }}
        {...rest}
      >
        {children}
      </div>
      {mounted && (
        <MenuPanel
          panelRef={menuRef}
          id={menuId}
          isOpen={isOpen}
          stackId={menuId}
          label={ariaLabel}
          dir={dir}
          className={menuClassName}
          style={position?.style}
          onKeyDown={onKeyDown}
          onExitComplete={() => setMounted(false)}
        >
          {content}
        </MenuPanel>
      )}
    </MenuContext.Provider>
  );
}

// ---- MenuSub -------------------------------------------------------------------

const SUB_OPEN_DELAY_MS = 120;
const SUB_CLOSE_DELAY_MS = 300;
const SUB_OFFSET = 2;

const SubChevron = (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
    <path d="M3.5 1.5 7 5 3.5 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function clearTimer(ref: RefObject<number | null>) {
  if (ref.current !== null) {
    window.clearTimeout(ref.current);
    ref.current = null;
  }
}

export interface MenuSubProps extends ComponentProps<'button'> {
  /** The row's label. */
  label: ReactNode;
  /** Leading glyph. */
  icon?: ReactNode;
  /** Dims the row and keeps the flyout shut. */
  disabled?: boolean;
  /** Class for the flyout panel; className styles the row. */
  menuClassName?: string;
  /** The flyout content - MenuItem rows, separators, or deeper MenuSubs. */
  children?: ReactNode;
}

/**
 * A flyout submenu row inside a Menu or ContextMenu. Renders like a MenuItem
 * with a trailing chevron; its child panel opens toward inline-end of the row
 * (right in LTR, left in RTL, flipping at the viewport edge) on hover with an
 * intent delay, or on the arrow key pointing into it - ArrowRight in LTR,
 * ArrowLeft in RTL per the APG - or Enter, which focuses the first child item.
 * The opposite arrow closes the flyout and returns focus to the row; Escape
 * closes the whole stack. Nests.
 */
export function MenuSub({
  label,
  icon,
  disabled,
  menuClassName,
  className,
  children,
  onClick,
  onKeyDown,
  onPointerEnter,
  onPointerLeave,
  ...rest
}: MenuSubProps) {
  const ctx = useContext(MenuContext);
  const subId = useId();
  const rowRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const focusOnOpen = useRef(false);
  const openTimer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);
  const dir = useDirection(rowRef);

  const position = useAnchoredPosition(mounted, rowRef, panelRef, { placement: 'inline-end-start', offset: SUB_OFFSET });

  function openSub(withFocus: boolean) {
    clearTimer(openTimer);
    clearTimer(closeTimer);
    if (disabled) return;
    focusOnOpen.current = withFocus;
    setIsOpen(true);
    setMounted(true);
  }

  function closeSub() {
    clearTimer(openTimer);
    clearTimer(closeTimer);
    setIsOpen(false);
  }

  function scheduleClose() {
    clearTimer(closeTimer);
    closeTimer.current = window.setTimeout(() => {
      closeTimer.current = null;
      closeSub();
    }, SUB_CLOSE_DELAY_MS);
  }

  useEffect(() => () => {
    clearTimer(openTimer);
    clearTimer(closeTimer);
  }, []);

  // When a keyboard open asked for it, focus the flyout's first item once the
  // panel is in the tree and positioned.
  useEffect(() => {
    if (!mounted || !isOpen || !focusOnOpen.current) return;
    focusOnOpen.current = false;
    const raf = requestAnimationFrame(() => focusItemIn(panelRef.current, 0));
    return () => cancelAnimationFrame(raf);
  }, [mounted, isOpen]);

  // The flyout animates out with its ancestor instead of lingering at full
  // opacity while the parent panel fades.
  const parentOpen = ctx?.open ?? true;
  useEffect(() => {
    if (!parentOpen) closeSub();
     
  }, [parentOpen]);

  function onRowKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    onKeyDown?.(event);
    if (disabled) return;
    // APG: the arrow that points INTO the flyout opens it, so the horizontal
    // arrows invert under RTL. Resolved live at the keystroke.
    const openKey = resolveDirection(rowRef.current) === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    if (event.key === openKey || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      openSub(true);
    }
  }

  function onPanelKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (navigatePanel(event, panelRef.current)) {
      event.stopPropagation();
      return;
    }
    // the arrow pointing back at the row closes: ArrowLeft in LTR, ArrowRight in RTL
    const closeKey = resolveDirection(rowRef.current) === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    if (event.key === closeKey) {
      event.preventDefault();
      event.stopPropagation();
      closeSub();
      rowRef.current?.focus();
    } else if (event.key === 'Escape') {
      // close this level and let the event bubble so every ancestor panel
      // closes too - the root then restores focus to its trigger.
      closeSub();
    }
  }

  return (
    <>
      <button
        type="button"
        role="menuitem"
        ref={rowRef}
        tabIndex={-1}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? subId : undefined}
        aria-disabled={disabled || undefined}
        className={cx(styles.item, className)}
        onClick={(event: MouseEvent<HTMLButtonElement>) => {
          onClick?.(event);
          if (disabled) return;
          openSub(true);
        }}
        onKeyDown={onRowKeyDown}
        onPointerEnter={(event: ReactPointerEvent<HTMLButtonElement>) => {
          onPointerEnter?.(event);
          if (disabled) return;
          clearTimer(closeTimer);
          if (isOpen || openTimer.current !== null) return;
          openTimer.current = window.setTimeout(() => {
            openTimer.current = null;
            openSub(false);
          }, SUB_OPEN_DELAY_MS);
        }}
        onPointerLeave={(event: ReactPointerEvent<HTMLButtonElement>) => {
          onPointerLeave?.(event);
          clearTimer(openTimer);
          if (isOpen) scheduleClose();
        }}
        {...rest}
      >
        {icon && <span className={styles.icon}>{icon}</span>}
        <span className={styles.label}>{label}</span>
        <span className={styles.chevron}>{SubChevron}</span>
      </button>
      {mounted && (
        <MenuContext.Provider
          value={{
            close: ctx?.close ?? closeSub,
            stackId: ctx?.stackId ?? subId,
            open: parentOpen && isOpen,
          }}
        >
          <MenuPanel
            panelRef={panelRef}
            id={subId}
            isOpen={isOpen}
            stackId={ctx?.stackId ?? subId}
            label={typeof label === 'string' ? label : undefined}
            dir={dir}
            className={menuClassName}
            style={position?.style}
            onKeyDown={onPanelKeyDown}
            onPointerEnter={() => clearTimer(closeTimer)}
            onPointerLeave={() => scheduleClose()}
            onExitComplete={() => setMounted(false)}
          >
            {children}
          </MenuPanel>
        </MenuContext.Provider>
      )}
    </>
  );
}

// ---- items ---------------------------------------------------------------------

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
