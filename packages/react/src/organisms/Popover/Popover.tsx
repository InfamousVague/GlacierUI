import { motion, useReducedMotion } from 'motion/react';
import { Speed, Ease, transition } from '@glacier/motion';
import { popoverOpenOns } from '@glacier/spec';
import {
  cloneElement,
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../internal/cx.ts';
import { useDirection } from '../../internal/direction.ts';
import { useControlled } from '../../internal/useControlled.ts';
import { useAnchoredPosition, type Placement } from '../../internal/useAnchoredPosition.ts';
import { ArrowGlass } from '../../internal/ArrowGlass.tsx';
import styles from './Popover.module.css';

/** Derived from the spec so the union cannot drift. */
export type PopoverOpenOn = (typeof popoverOpenOns)[number];

/**
 * A pointer crossing from the trigger to the panel passes over the gap between
 * them, so leaving either one starts a countdown the other can cancel rather
 * than shutting the panel under the cursor on its way in.
 */
const HOVER_GRACE = 150;

export interface PopoverProps {
  /** The element that toggles the popover. Its ref and click are wired up. */
  trigger: ReactElement;
  /** Where to place the panel relative to the trigger. */
  placement?: Placement;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * What opens the panel. Hover opens it on pointer and on focus and leaves the
   * trigger's press alone, for a trigger that already does something of its own
   * - a mute button that shows a fader while the pointer is on it. The panel
   * does not take focus when it opens that way, since the pointer went to it and
   * the keyboard did not; Tab from the trigger hands focus over.
   */
  openOn?: PopoverOpenOn;
  /** Accessible label for the panel when it has no heading. */
  'aria-label'?: string;
  className?: string;
  children?: ReactNode;
}

/**
 * A floating panel anchored to a trigger. The panel portals to the body so it
 * escapes overflow-clipping ancestors, flips and clamps to stay on screen, and
 * closes on outside press and Escape. This is the anchored-overlay bone that
 * menus, pickers, and rich tooltips build on.
 */
export function Popover({
  trigger,
  placement = 'bottom-start',
  open,
  defaultOpen = false,
  onOpenChange,
  openOn = 'press',
  className,
  children,
  ...rest
}: PopoverProps) {
  const panelId = useId();
  const reduce = useReducedMotion();
  const triggerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isOpen, setOpen] = useControlled(open, defaultOpen);
  const [mounted, setMounted] = useState(isOpen);
  // the panel portals to the body, past any scoped dir ancestor - carry the
  // trigger's resolved direction with it
  const dir = useDirection(triggerRef);

  // offset leaves room for the arrow tip plus a small visual gap
  const position = useAnchoredPosition(mounted, triggerRef, panelRef, { placement, offset: 12 });

  function setOpenState(next: boolean) {
    setOpen(next);
    onOpenChange?.(next);
  }

  function holdOpen() {
    if (closeTimer.current !== null) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function show() {
    holdOpen();
    setOpenState(true);
  }

  function hideSoon() {
    holdOpen();
    closeTimer.current = setTimeout(() => {
      closeTimer.current = null;
      setOpenState(false);
    }, HOVER_GRACE);
  }

  useEffect(() => holdOpen, []);

  useEffect(() => {
    if (isOpen) setMounted(true);
  }, [isOpen]);

  useEffect(() => {
    if (!mounted) return;
    // A panel the pointer opened must not take focus off whatever the keyboard
    // was on; one that was asked for by a press is where the user just went.
    if (openOn === 'press') panelRef.current?.focus();
    const onPointerDown = (event: globalThis.PointerEvent) => {
      const target = event.target as Node;
      if (!panelRef.current?.contains(target) && !triggerRef.current?.contains(target)) {
        setOpenState(false);
      }
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenState(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  const triggerProps = trigger.props as {
    onClick?: (event: unknown) => void;
    onPointerEnter?: (event: PointerEvent<HTMLElement>) => void;
    onPointerLeave?: (event: PointerEvent<HTMLElement>) => void;
    onFocus?: (event: FocusEvent<HTMLElement>) => void;
    onBlur?: (event: FocusEvent<HTMLElement>) => void;
    onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
  };

  const anchoring = {
    ref: triggerRef,
    'aria-expanded': isOpen,
    'aria-controls': isOpen ? panelId : undefined,
  };

  const triggerEl = cloneElement(
    trigger as ReactElement<Record<string, unknown>>,
    openOn === 'press'
      ? {
          ...anchoring,
          'aria-haspopup': 'dialog',
          onClick: (event: unknown) => {
            triggerProps.onClick?.(event);
            setOpenState(!isOpen);
          },
        }
      : {
          ...anchoring,
          onPointerEnter: (event: PointerEvent<HTMLElement>) => {
            triggerProps.onPointerEnter?.(event);
            show();
          },
          onPointerLeave: (event: PointerEvent<HTMLElement>) => {
            triggerProps.onPointerLeave?.(event);
            // A touch leaves the moment it lands, so the tap that opened the
            // panel would be the gesture that shut it again.
            if (event.pointerType !== 'touch') hideSoon();
          },
          onFocus: (event: FocusEvent<HTMLElement>) => {
            triggerProps.onFocus?.(event);
            show();
          },
          onBlur: (event: FocusEvent<HTMLElement>) => {
            triggerProps.onBlur?.(event);
            if (!panelRef.current?.contains(event.relatedTarget)) hideSoon();
          },
          onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
            triggerProps.onKeyDown?.(event);
            // The panel portals to the end of the body, so Tab would step over
            // it to whatever follows the trigger. Hand focus across instead.
            if (event.key === 'Tab' && !event.shiftKey && isOpen) {
              event.preventDefault();
              panelRef.current?.focus();
            }
          },
        },
  );

  function onPanelKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpenState(false);
      triggerRef.current?.focus();
    }
  }

  // Tabbing out of a hovered panel is done with it; a press-opened one is not,
  // since focus leaving it was never what closed it.
  function onPanelBlur(event: FocusEvent<HTMLDivElement>) {
    const next = event.relatedTarget;
    if (!panelRef.current?.contains(next) && next !== triggerRef.current) hideSoon();
  }

  return (
    <>
      {triggerEl}
      {/* The positioned wrapper stays transparent and the glass panel and
          arrow are SIBLINGS inside it: a backdrop-filter can only sample the
          page from outside a filtered ancestor, so an arrow nested in the
          blurred panel could tint but never blur what is behind it. */}
      {mounted &&
        createPortal(
          <motion.div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-label={rest['aria-label']}
            dir={dir}
            tabIndex={-1}
            className={styles.positioner}
            data-placement={position?.placement}
            style={position?.style}
            onKeyDown={onPanelKeyDown}
            onPointerEnter={openOn === 'hover' ? holdOpen : undefined}
            onPointerLeave={openOn === 'hover' ? hideSoon : undefined}
            onBlur={openOn === 'hover' ? onPanelBlur : undefined}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -4 }}
            animate={isOpen ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.98, y: -2 }}
            transition={reduce ? { duration: 0 } : transition(Speed.Fast, Ease.Out)}
            onAnimationComplete={() => {
              if (!isOpen) setMounted(false);
            }}
          >
            <ArrowGlass placement={position?.placement} tipAt={position?.arrowOffset} />
            <div className={cx(styles.panel, className)}>{children}</div>
          </motion.div>,
          document.body,
        )}
    </>
  );
}
