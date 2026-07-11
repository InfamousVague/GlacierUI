import { motion, useReducedMotion } from 'motion/react';
import { Ease, Speed, transition } from '@glacier/motion';
import { TextTone, alertDialogTones } from '@glacier/spec';
import { createPortal } from 'react-dom';
import { useId, useRef, type ComponentProps, type ReactNode } from 'react';
import { Button } from '../../atoms/inputs/Button/Button.tsx';
import { Heading } from '../../atoms/display/Typography/Heading.tsx';
import { Text } from '../../atoms/display/Typography/Text.tsx';
import { cx } from '../../internal/cx.ts';
import { useDialogLayer } from '../../internal/useDialogLayer.ts';
import { useT } from '../../i18n/LocaleProvider.tsx';
import { kitMessages } from '../../i18n/messages.ts';
import styles from './AlertDialog.module.css';

export type AlertDialogTone = (typeof alertDialogTones)[number];

export interface AlertDialogProps extends Omit<ComponentProps<typeof motion.div>, 'title'> {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  actionLabel: ReactNode;
  onAction: () => void;
  cancelLabel?: ReactNode;
  tone?: AlertDialogTone;
  actionDisabled?: boolean;
  actionLoading?: boolean;
  /** Allows Escape and backdrop dismissal. Defaults to false for deliberate confirmation flows. */
  dismissible?: boolean;
  children?: ReactNode;
}

/** A confirmation dialog that focuses its least destructive action first. */
export function AlertDialog({
  open,
  onClose,
  title,
  description,
  actionLabel,
  onAction,
  cancelLabel,
  tone = 'neutral',
  actionDisabled = false,
  actionLoading = false,
  dismissible = false,
  children,
  className,
  ...rest
}: AlertDialogProps) {
  const t = useT();
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();

  useDialogLayer({ open, onClose, dialogRef: panelRef, initialFocusRef: cancelRef, dismissible });

  if (!open) return null;

  return createPortal(
    <motion.div
      className={styles.overlay}
      onClick={dismissible ? onClose : undefined}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={reduce ? { duration: 0 } : { duration: 0.15 }}
    >
      <motion.div
        {...rest}
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={cx(styles.panel, styles[tone], className)}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={reduce ? { duration: 0 } : transition(Speed.Fast, Ease.Out)}
      >
        <Heading level={2} visualLevel={3} id={titleId}>
          {title}
        </Heading>
        {description && (
          <Text tone={TextTone.Muted} id={descriptionId} className={styles.description}>
            {description}
          </Text>
        )}
        {children && <div className={styles.body}>{children}</div>}
        <footer className={styles.footer}>
          <Button ref={cancelRef} variant="ghost" onClick={onClose}>
            {cancelLabel ?? t(kitMessages.cancel)}
          </Button>
          <Button
            variant={tone === 'danger' ? 'danger' : 'solid'}
            disabled={actionDisabled}
            loading={actionLoading}
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        </footer>
      </motion.div>
    </motion.div>,
    document.body,
  );
}