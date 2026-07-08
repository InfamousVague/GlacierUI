import { motion, useReducedMotion } from 'motion/react';
import { Size, TextTone, Variant } from '@glacier/spec';
import { Speed, Ease, transition } from '@glacier/motion';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../internal/cx.ts';
import { useT } from '../../i18n/LocaleProvider.tsx';
import { kitMessages } from '../../i18n/messages.ts';
import { useAnchoredPosition, type Placement } from '../../internal/useAnchoredPosition.ts';
import { Button } from '../../atoms/inputs/Button/Button.tsx';
import { IconButton } from '../../atoms/inputs/Button/IconButton.tsx';
import { Heading } from '../../atoms/display/Typography/Heading.tsx';
import { Text } from '../../atoms/display/Typography/Text.tsx';
import styles from './Spotlight.module.css';

const CloseIcon = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

export interface SpotlightProps {
  /** Whether the tour step is shown. */
  open: boolean;
  /** The element to highlight; the cutout and callout are positioned against it. */
  targetRef: RefObject<HTMLElement | null>;
  /** Step heading. */
  title?: ReactNode;
  /** Step body copy. */
  description?: ReactNode;
  /** Where to place the callout relative to the target before flipping and clamping. */
  placement?: Placement;
  /** Padding around the target inside the cutout, in pixels. */
  cutoutPadding?: number;
  /** 1-based index of this step. */
  step?: number;
  /** Total number of steps in the tour. */
  total?: number;
  /** Advances to the next step; the Next button is hidden when omitted. */
  onNext?: () => void;
  /** Returns to the previous step; the Back button is hidden when omitted. */
  onBack?: () => void;
  /** Dismisses the tour, via the close button, Escape, or a backdrop press. */
  onClose: () => void;
  className?: string;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * A guided-tour step. A dimmed, full-screen backdrop with a highlighted cutout
 * punched around a target element, plus a callout - anchored to the target with
 * the shared overlay engine - carrying a title, body, step count, and
 * Back / Next / Close controls. The callout is a role="dialog" that traps focus,
 * closes on Escape or a backdrop press, and tracks the target on scroll and
 * resize so the cutout stays glued to it.
 */
export function Spotlight({
  open,
  targetRef,
  title,
  description,
  placement = 'bottom',
  cutoutPadding = 8,
  step,
  total,
  onNext,
  onBack,
  onClose,
  className,
}: SpotlightProps) {
  const t = useT();
  const titleId = useId();
  const descriptionId = useId();
  const reduce = useReducedMotion();
  const calloutRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<Rect | null>(null);

  const position = useAnchoredPosition(open, targetRef, calloutRef, { placement, offset: 12 });

  // Track the target's box so the cutout stays glued to it through scroll and
  // resize, mirroring how the anchored callout tracks it.
  useEffect(() => {
    if (!open) {
      setRect(null);
      return;
    }
    const measure = () => {
      const box = targetRef.current?.getBoundingClientRect();
      if (!box) return;
      setRect({ top: box.top, left: box.left, width: box.width, height: box.height });
    };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [open, targetRef]);

  // Lock body scroll, move focus into the callout, close on Escape, and restore
  // focus to the opener on close.
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const raf = requestAnimationFrame(() => calloutRef.current?.focus());
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      cancelAnimationFrame(raf);
      opener?.focus();
    };
  }, [open, onClose]);

  function trapTab(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Tab' || !calloutRef.current) return;
    const focusable = [
      ...calloutRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ];
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }
    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;
    if (event.shiftKey && (document.activeElement === first || document.activeElement === calloutRef.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  if (!open) return null;

  const pad = cutoutPadding;
  const cutout: Rect | null = rect
    ? {
        top: rect.top - pad,
        left: rect.left - pad,
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
      }
    : null;

  return createPortal(
    <div className={styles.root}>
      {/* The dimmed backdrop with a punched-out hole. A giant spread shadow on
          the ring paints the dim everywhere except the ring's own box, which is
          the cutout. Pointer events on the backdrop dismiss; the ring is
          click-through so the highlighted target stays usable. */}
      <motion.div
        className={styles.backdrop}
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={reduce ? { duration: 0 } : { duration: 0.15 }}
      >
        {cutout && (
          <div
            className={styles.ring}
            style={{
              top: cutout.top,
              left: cutout.left,
              width: cutout.width,
              height: cutout.height,
            }}
          />
        )}
      </motion.div>

      <motion.div
        ref={calloutRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        className={cx(styles.callout, className)}
        style={position?.style}
        tabIndex={-1}
        onKeyDown={trapTab}
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={reduce ? { duration: 0 } : transition(Speed.Fast, Ease.Out)}
      >
        <IconButton aria-label={t(kitMessages.closeTour)} size={Size.Small} className={styles.close} onClick={onClose}>
          {CloseIcon}
        </IconButton>
        {title && (
          <Heading level={2} visualLevel={4} id={titleId} className={styles.title}>
            {title}
          </Heading>
        )}
        {description && (
          <Text tone={TextTone.Muted} size={Size.Small} id={descriptionId} className={styles.description}>
            {description}
          </Text>
        )}
        <div className={styles.footer}>
          {step != null && total != null && (
            <span className={styles.count} aria-label={t(kitMessages.stepOf, { step, total })}>
              {step} / {total}
            </span>
          )}
          <div className={styles.actions}>
            {onBack && (
              <Button variant={Variant.Ghost} size={Size.Small} onClick={onBack}>
                {t(kitMessages.back)}
              </Button>
            )}
            {onNext && (
              <Button variant={Variant.Solid} size={Size.Small} onClick={onNext}>
                {total != null && step === total ? t(kitMessages.done) : t(kitMessages.next)}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}
