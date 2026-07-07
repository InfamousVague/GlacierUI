import { motion, useReducedMotion } from 'motion/react';
import { Speed, Ease, transition } from '@perfect/motion';
import {
  cloneElement,
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../internal/cx.ts';
import { useAnchoredPosition, type Placement } from '../../internal/useAnchoredPosition.ts';
import styles from './Tooltip.module.css';

export interface TooltipProps {
  /** The bubble content: a short label, shortcut, or hint. */
  content: ReactNode;
  /** The element the tooltip describes. Its ref and event handlers are wired up. */
  children: ReactElement;
  /** Where to place the bubble relative to the trigger before flipping and clamping. */
  placement?: Placement;
  /** Milliseconds of hover intent before the bubble opens. Focus opens instantly. */
  delay?: number;
  /** Suppresses the tooltip entirely; the trigger renders untouched. */
  disabled?: boolean;
  /** Renders a placeholder with the exact geometry. */
  skeleton?: boolean;
  className?: string;
}

/**
 * A hover and focus tooltip. The bubble portals to document.body so it escapes
 * overflow-clipping ancestors and stacking contexts, then flips and clamps to
 * stay on screen. It opens on hover intent after a short delay or immediately
 * on focus, and hides on leave, blur, or Escape. The bubble is non-interactive
 * (pointer-events: none) so it can never trap the cursor, and the trigger is
 * linked to it with aria-describedby.
 */
export function Tooltip({
  content,
  children,
  placement = 'top',
  delay = 300,
  disabled = false,
  skeleton = false,
  className,
}: TooltipProps) {
  const tooltipId = useId();
  const reduce = useReducedMotion();
  const triggerRef = useRef<HTMLElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const position = useAnchoredPosition(mounted, triggerRef, bubbleRef, { placement, offset: 6 });

  function clearTimer() {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function show(withDelay: boolean) {
    if (disabled) return;
    clearTimer();
    if (withDelay && delay > 0) {
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        setOpen(true);
      }, delay);
    } else {
      setOpen(true);
    }
  }

  function hide() {
    clearTimer();
    setOpen(false);
  }

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  // clean up any pending open timer on unmount
  useEffect(() => clearTimer, []);

  // hide on Escape while shown, without stealing focus from the trigger
  useEffect(() => {
    if (!mounted) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') hide();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // A tooltip has no standing footprint of its own: its geometry is the
  // trigger, which owns its own skeleton prop. Passing the child through keeps
  // the exact layout while loading, and drops the hover wiring so nothing opens.
  if (skeleton || disabled) {
    return children;
  }

  const childProps = children.props as {
    onPointerEnter?: (event: PointerEvent<HTMLElement>) => void;
    onPointerLeave?: (event: PointerEvent<HTMLElement>) => void;
    onFocus?: (event: FocusEvent<HTMLElement>) => void;
    onBlur?: (event: FocusEvent<HTMLElement>) => void;
    'aria-describedby'?: string;
  };

  const triggerEl = cloneElement(children as ReactElement<Record<string, unknown>>, {
    ref: triggerRef,
    'aria-describedby': cx(childProps['aria-describedby'], open ? tooltipId : '') || undefined,
    onPointerEnter: (event: PointerEvent<HTMLElement>) => {
      childProps.onPointerEnter?.(event);
      // touch pointers fire enter on tap; skip the hover-intent path for them
      if (event.pointerType === 'touch') return;
      show(true);
    },
    onPointerLeave: (event: PointerEvent<HTMLElement>) => {
      childProps.onPointerLeave?.(event);
      hide();
    },
    onFocus: (event: FocusEvent<HTMLElement>) => {
      childProps.onFocus?.(event);
      show(false);
    },
    onBlur: (event: FocusEvent<HTMLElement>) => {
      childProps.onBlur?.(event);
      hide();
    },
  });

  return (
    <>
      {triggerEl}
      {mounted &&
        createPortal(
          <motion.div
            ref={bubbleRef}
            id={tooltipId}
            role="tooltip"
            className={cx(styles.bubble, className)}
            style={position?.style}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 2 }}
            animate={open ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.98, y: 1 }}
            transition={reduce ? { duration: 0 } : transition(Speed.Fast, Ease.Out)}
            onAnimationComplete={() => {
              if (!open) setMounted(false);
            }}
          >
            {content}
          </motion.div>,
          document.body,
        )}
    </>
  );
}
