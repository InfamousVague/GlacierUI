import { motion, useReducedMotion } from 'motion/react';
import { Speed, Ease, transition } from '@perfect/motion';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../internal/cx.ts';
import { useT } from '../../i18n/LocaleProvider.tsx';
import { kitMessages } from '../../i18n/messages.ts';
import { IconButton } from '../../atoms/Button/IconButton.tsx';
import { Heading } from '../../atoms/Typography/Heading.tsx';
import styles from './FloatingPanel.module.css';

export interface Point {
  x: number;
  y: number;
}

export interface FloatingPanelProps {
  /** Whether the panel is shown. */
  open: boolean;
  /** Panel title, rendered in the drag handle bar. */
  title: ReactNode;
  /** Called when the user dismisses via the close button or Escape. */
  onClose: () => void;
  /** Initial top-left position in viewport pixels. */
  defaultPosition?: Point;
  /** Extra class names merged onto the panel. */
  className?: string;
  /** Panel body content. */
  children?: ReactNode;
}

const CloseIcon = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

/** Keep a point so the panel stays inside the viewport with an inset margin. */
function clampToViewport(point: Point, size: { width: number; height: number }, margin = 8): Point {
  const maxX = Math.max(margin, window.innerWidth - size.width - margin);
  const maxY = Math.max(margin, window.innerHeight - size.height - margin);
  return {
    x: Math.min(Math.max(margin, point.x), maxX),
    y: Math.min(Math.max(margin, point.y), maxY),
  };
}

/**
 * A draggable, dismissable NON-modal floating panel. A glass Surface portalled
 * to the body with a header grab-bar you drag to move it (pointer events), a
 * title, and a close button. Its position is clamped to the viewport so it can
 * never be dragged fully off-screen. Unlike Modal it does not lock scroll, trap
 * focus, or render an overlay — it floats above the page and lets you keep
 * working underneath.
 */
export function FloatingPanel({
  open,
  title,
  onClose,
  defaultPosition = { x: 24, y: 24 },
  className,
  children,
}: FloatingPanelProps) {
  const t = useT();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [position, setPosition] = useState<Point>(defaultPosition);

  // Close on Escape while open. Non-modal: no scroll lock, no focus trap.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  // Re-clamp when the viewport shrinks so the panel never strands off-screen.
  useEffect(() => {
    if (!open) return;
    const onResize = () => {
      const el = panelRef.current;
      if (!el) return;
      setPosition((prev) => clampToViewport(prev, { width: el.offsetWidth, height: el.offsetHeight }));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [open]);

  // Pointer-drag on the grab-bar. Listeners are attached natively (not via
  // React's synthetic system) so move/up keep firing while the pointer leaves
  // the handle, which is the standard drag pattern. A drag is active for one
  // pointer between its down and up, tracked by the `drag` closure.
  useEffect(() => {
    const handle = handleRef.current;
    if (!open || !handle) return;

    let drag: { pointerId: number; offsetX: number; offsetY: number } | null = null;

    const samePointer = (event: PointerEvent) =>
      drag != null && (event.pointerId == null || event.pointerId === drag.pointerId);

    const onMove = (event: PointerEvent) => {
      const el = panelRef.current;
      if (!drag || !samePointer(event) || !el) return;
      const next = { x: event.clientX - drag.offsetX, y: event.clientY - drag.offsetY };
      setPosition(clampToViewport(next, { width: el.offsetWidth, height: el.offsetHeight }));
    };

    const onUp = (event: PointerEvent) => {
      if (!samePointer(event)) return;
      drag = null;
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
    };

    const onDown = (event: PointerEvent) => {
      // Primary button / touch / pen only; ignore the close button. A missing
      // button (synthetic events in tests) counts as primary.
      if (event.button > 0) return;
      if ((event.target as HTMLElement).closest('button')) return;
      const el = panelRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      drag = {
        pointerId: event.pointerId,
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top,
      };
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
      document.addEventListener('pointercancel', onUp);
    };

    handle.addEventListener('pointerdown', onDown);
    return () => {
      handle.removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <motion.div
      ref={panelRef}
      role="dialog"
      aria-labelledby={titleId}
      className={cx(styles.panel, className)}
      style={{ top: position.y, left: position.x }}
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={reduce ? { duration: 0 } : transition(Speed.Fast, Ease.Out)}
    >
      <div ref={handleRef} className={styles.handle} data-perfect-drag-handle="">
        <Heading level={2} visualLevel={6} id={titleId} className={styles.title}>
          {title}
        </Heading>
        <IconButton aria-label={t(kitMessages.close)} size="sm" className={styles.close} onClick={onClose}>
          {CloseIcon}
        </IconButton>
      </div>
      <div className={styles.body}>{children}</div>
    </motion.div>,
    document.body,
  );
}
