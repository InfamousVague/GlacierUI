import { motion, useReducedMotion } from 'motion/react';
import { Spring, springTransition } from '@glacier/motion';
import { Size, TextTone, drawerSides, drawerSizes } from '@glacier/spec';
import { createPortal } from 'react-dom';
import { useId, useRef, type ComponentProps, type ReactNode } from 'react';
import { IconButton } from '../../atoms/inputs/Button/IconButton.tsx';
import { Heading } from '../../atoms/display/Typography/Heading.tsx';
import { Text } from '../../atoms/display/Typography/Text.tsx';
import { cx } from '../../internal/cx.ts';
import { useDialogLayer } from '../../internal/useDialogLayer.ts';
import { useT } from '../../i18n/LocaleProvider.tsx';
import { kitMessages } from '../../i18n/messages.ts';
import styles from './Drawer.module.css';

export type DrawerSide = (typeof drawerSides)[number];
export type DrawerSize = (typeof drawerSizes)[number];

export interface DrawerProps extends Omit<ComponentProps<typeof motion.div>, 'title'> {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  side?: DrawerSide;
  size?: DrawerSize;
  /**
   * Detach the sheet into a floating card with a gutter on every edge and all
   * corners rounded. Defaults to following the host's layout mode: a root
   * data-layout='floating' attribute floats every drawer; omit it (or set
   * 'full') for flush, edge-to-edge sheets. The prop forces the mode per
   * drawer either way.
   */
  floating?: boolean;
  footer?: ReactNode;
  dismissible?: boolean;
  children?: ReactNode;
}

const CloseIcon = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

function hiddenOffset(side: DrawerSide, floating: boolean) {
  // A floating panel starts a gutter short of the edge, so it travels a
  // little farther than its own size to fully leave the screen.
  const distance = floating ? '115%' : '100%';
  if (side === 'left') return { x: `-${distance}` };
  if (side === 'right') return { x: distance };
  return { y: distance };
}

/** A modal sheet that enters from a viewport edge and shares dialog focus behavior with Modal. */
export function Drawer({
  open,
  onClose,
  title,
  description,
  side = 'right',
  size = 'md',
  floating,
  footer,
  dismissible = true,
  children,
  className,
  ...rest
}: DrawerProps) {
  const t = useT();
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useDialogLayer({ open, onClose, dialogRef: panelRef, dismissible });

  if (!open) return null;

  // Read at open time: the layout mode does not change under an open sheet.
  const isFloating =
    floating ??
    (typeof document !== 'undefined' &&
      document.documentElement.getAttribute('data-layout') === 'floating');

  return createPortal(
    <motion.div
      className={cx(styles.overlay, styles[side], isFloating && styles.floating)}
      onClick={dismissible ? onClose : undefined}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={reduce ? { duration: 0 } : { duration: 0.15 }}
    >
      <motion.div
        {...rest}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        className={cx(styles.panel, styles[side], styles[size], isFloating && styles.floating, className)}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        initial={reduce ? { opacity: 0 } : { opacity: 0, ...hiddenOffset(side, isFloating) }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={reduce ? { duration: 0 } : springTransition(Spring.Snappy)}
      >
        {(title || description || dismissible) && (
          <header className={styles.header}>
            <div className={styles.headerContent}>
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
            </div>
            {dismissible && (
              <IconButton aria-label={t(kitMessages.close)} size={Size.Small} onClick={onClose}>
                {CloseIcon}
              </IconButton>
            )}
          </header>
        )}
        <div className={styles.body}>{children}</div>
        {footer && <footer className={styles.footer}>{footer}</footer>}
      </motion.div>
    </motion.div>,
    document.body,
  );
}