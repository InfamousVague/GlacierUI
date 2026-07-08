import { motion, useReducedMotion } from 'motion/react';
import { Spring, springTransition } from '@perfect/motion';
import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../internal/cx.ts';
import { useT } from '../../i18n/LocaleProvider.tsx';
import { kitMessages } from '../../i18n/messages.ts';
import { IconButton } from '../../atoms/Button/IconButton.tsx';
import { Heading } from '../../atoms/Typography/Heading.tsx';
import { Text } from '../../atoms/Typography/Text.tsx';
import styles from './Modal.module.css';

export interface ModalProps {
  open: boolean;
  /** Called when the user dismisses via Escape, the close button, or the overlay. */
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  footer?: ReactNode;
  children?: ReactNode;
}

const CloseIcon = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * A glass dialog rendered in a portal. Springs open, closes instantly.
 * Locks body scroll, traps Tab focus inside the panel, closes on Escape and
 * overlay press, and restores focus to the opener on close.
 */
export function Modal({ open, onClose, title, description, size = 'md', footer, children }: ModalProps) {
  const t = useT();
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // lock body scroll, focus the panel, restore focus on close
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      opener?.focus();
    };
  }, [open, onClose]);

  function trapTab(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'Tab' || !panelRef.current) return;
    const focusable = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
    if (focusable.length === 0) {
      e.preventDefault();
      return;
    }
    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;
    if (e.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  if (!open) return null;

  return createPortal(
    <motion.div
      className={styles.overlay}
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={reduce ? { duration: 0 } : { duration: 0.15 }}
    >
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        className={cx(styles.panel, styles[size])}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={trapTab}
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={reduce ? { duration: 0 } : springTransition(Spring.Snappy)}
      >
        <IconButton aria-label={t(kitMessages.close)} size="sm" className={styles.close} onClick={onClose}>
          {CloseIcon}
        </IconButton>
        {(title || description) && (
          <header className={styles.header}>
            {title && (
              <Heading level={2} visualLevel={3} id={titleId}>
                {title}
              </Heading>
            )}
            {description && (
              <Text tone="muted" size="sm" id={descriptionId}>
                {description}
              </Text>
            )}
          </header>
        )}
        {children}
        {footer && <footer className={styles.footer}>{footer}</footer>}
      </motion.div>
    </motion.div>,
    document.body,
  );
}
