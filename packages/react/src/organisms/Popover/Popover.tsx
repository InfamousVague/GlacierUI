import { motion, useReducedMotion } from 'motion/react';
import { Speed, Ease, transition } from '@glacier/motion';
import {
  cloneElement,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
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

export interface PopoverProps {
  /** The element that toggles the popover. Its ref and click are wired up. */
  trigger: ReactElement;
  /** Where to place the panel relative to the trigger. */
  placement?: Placement;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
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
  className,
  children,
  ...rest
}: PopoverProps) {
  const panelId = useId();
  const reduce = useReducedMotion();
  const triggerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (isOpen) setMounted(true);
  }, [isOpen]);

  useEffect(() => {
    if (!mounted) return;
    panelRef.current?.focus();
    const onPointerDown = (event: PointerEvent) => {
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

  const triggerEl = cloneElement(trigger as ReactElement<Record<string, unknown>>, {
    ref: triggerRef,
    'aria-haspopup': 'dialog',
    'aria-expanded': isOpen,
    'aria-controls': isOpen ? panelId : undefined,
    onClick: (event: unknown) => {
      (trigger.props as { onClick?: (event: unknown) => void }).onClick?.(event);
      setOpenState(!isOpen);
    },
  });

  function onPanelKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpenState(false);
      triggerRef.current?.focus();
    }
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
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -4 }}
            animate={isOpen ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.98, y: -2 }}
            transition={reduce ? { duration: 0 } : transition(Speed.Fast, Ease.Out)}
            onAnimationComplete={() => {
              if (!isOpen) setMounted(false);
            }}
          >
            <ArrowGlass placement={position?.placement} />
            <div className={cx(styles.panel, className)}>{children}</div>
          </motion.div>,
          document.body,
        )}
    </>
  );
}
