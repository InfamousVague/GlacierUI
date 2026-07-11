import { motion, useReducedMotion } from 'motion/react';
import { Size, TextTone } from '@glacier/spec';
import { Spring, springTransition } from '@glacier/motion';
import { useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../internal/cx.ts';
import { useDialogLayer } from '../../internal/useDialogLayer.ts';
import { useT } from '../../i18n/LocaleProvider.tsx';
import { kitMessages } from '../../i18n/messages.ts';
import { IconButton } from '../../atoms/inputs/Button/IconButton.tsx';
import { Heading } from '../../atoms/display/Typography/Heading.tsx';
import { Text } from '../../atoms/display/Typography/Text.tsx';
import styles from './Modal.module.css';

export interface ModalProps {
  open: boolean;
  /** Called when the user dismisses via Escape, the close button, or the overlay. */
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: ReactNode;
  children?: ReactNode;
}

const CloseIcon = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

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

  useDialogLayer({ open, onClose, dialogRef: panelRef });

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
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={reduce ? { duration: 0 } : springTransition(Spring.Snappy)}
      >
        <IconButton aria-label={t(kitMessages.close)} size={Size.Small} className={styles.close} onClick={onClose}>
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
              <Text tone={TextTone.Muted} size={Size.Small} id={descriptionId}>
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
