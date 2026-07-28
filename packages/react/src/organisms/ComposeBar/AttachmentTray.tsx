import type { ComponentProps } from 'react';
import { attachmentKind } from '@glacier/logic';
import { FileText, Film, Image as ImageIcon, Music, RotateCcw, X } from '@glacier/icons';
import { splitFileName } from '@glacier/logic';
import {
  formatBytes,
  type ComposeAttachment,
  type ComposeAttachmentStatus,
} from '@glacier/logic';
import { cx } from '../../internal/cx.ts';
import { useLocale, useT } from '../../i18n/LocaleProvider.tsx';
import { IconButton } from '../../atoms/inputs/Button/IconButton.tsx';
import { ProgressBar } from '../../atoms/feedback/Progress/ProgressBar.tsx';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import { composeMessages } from './messages.ts';
import styles from './AttachmentTray.module.css';

export type { ComposeAttachment, ComposeAttachmentStatus };

export interface AttachmentChipProps extends ComposeAttachment, Omit<ComponentProps<'li'>, 'id'> {
  /** The file's MIME type, used only to pick the glyph. */
  mimeType?: string;
  onCancel?: (id: string) => void;
  onRetry?: (id: string) => void;
  disabled?: boolean;
  skeleton?: boolean;
}

/** One glyph per kind, from the shared `attachmentKind` classifier. */
const GLYPHS = { image: ImageIcon, video: Film, audio: Music, file: FileText } as const;

/** Progress is announced in quarters; a reader cannot follow a fast upload frame by frame. */
const ANNOUNCE_STEP = 4;

/**
 * One pending file: a type glyph, its name and size, a progress bar while it is
 * in flight, and a dismiss.
 *
 * Cancelling an upload and removing a finished file are the same control,
 * because to the user they are the same thought — "not this one" — and a chip
 * that grows a second button the moment its upload lands would move the target
 * out from under the finger about to press it.
 */
export function AttachmentChip({
  id,
  name,
  size,
  status = 'pending',
  progress,
  error,
  mimeType,
  onCancel,
  onRetry,
  disabled = false,
  skeleton = false,
  ...rest
}: AttachmentChipProps) {
  const t = useT();
  const locale = useLocale();

  if (skeleton) {
    return (
      <li className={styles.chip} data-skeleton="" {...rest}>
        <Skeleton width="8rem" height="var(--glacier-space-6)" radius="var(--glacier-radius-md)" />
      </li>
    );
  }

  const Glyph = GLYPHS[attachmentKind(mimeType, name)];
  const { head, tail } = splitFileName(name);
  const uploading = status === 'uploading' || status === 'pending';
  const percent = Math.round((progress ?? 0) * 100);
  // Rounded to a quarter so the live region speaks four times, not four hundred.
  const announced = Math.round(percent / (100 / ANNOUNCE_STEP)) * (100 / ANNOUNCE_STEP);

  return (
    <li className={styles.chip} data-status={status} data-disabled={disabled || undefined} {...rest}>
      <span className={styles.icon} aria-hidden="true">
        <Glyph size={14} />
      </span>
      <span className={styles.body}>
        <span className={styles.name} title={name}>
          <span className={styles.nameHead}>{head}</span>
          {tail.length > 0 && <span className={styles.nameTail}>{tail}</span>}
        </span>
        {status === 'failed' && error ? (
          <span className={styles.error}>{error}</span>
        ) : size !== undefined ? (
          <span className={styles.meta}>{formatBytes(size, locale)}</span>
        ) : null}
        {status === 'uploading' && (
          <ProgressBar
            className={styles.progress}
            size="sm"
            value={progress === undefined ? undefined : percent}
            indeterminate={progress === undefined}
            aria-label={t(composeMessages.uploadProgress, { name, percent })}
          />
        )}
      </span>
      {/* Announced politely and in coarse steps: the bar is the visual channel,
          this is the spoken one, and a per-frame update would drown a reader. */}
      {uploading && (
        <span className={styles.live} aria-live="polite">
          {t(composeMessages.uploadProgress, { name, percent: announced })}
        </span>
      )}
      {status === 'failed' && onRetry && (
        <IconButton
          size="sm"
          variant="ghost"
          disabled={disabled}
          aria-label={t(composeMessages.retryAttachment, { name })}
          onClick={() => onRetry(id)}
        >
          <RotateCcw size={12} />
        </IconButton>
      )}
      <IconButton
        size="sm"
        variant="ghost"
        disabled={disabled}
        aria-label={t(composeMessages.removeAttachment, { name })}
        onClick={() => onCancel?.(id)}
      >
        <X size={12} />
      </IconButton>
    </li>
  );
}

export interface AttachmentTrayProps extends ComponentProps<'ul'> {
  /** Pending attachments, in the order they were added. */
  attachments: readonly (ComposeAttachment & { mimeType?: string })[];
  onCancel?: (id: string) => void;
  onRetry?: (id: string) => void;
  disabled?: boolean;
  skeleton?: boolean;
  className?: string;
  /** Accessible name for the list; defaults to the localized "Attachments". */
  'aria-label'?: string;
}

/**
 * The row of pending attachments above a compose bar.
 *
 * It renders NOTHING when there is nothing attached — not an empty row, not a
 * collapsed one. A composer that reserves a shelf for files it does not have
 * pushes the input up the screen for no reason, and the tray appearing is
 * itself the confirmation that a file arrived.
 *
 * Progress is displayed here, never driven from here: uploading is transport,
 * which this kit does not do (the same line FileUpload draws). The owner moves
 * each attachment through `advanceAttachment` and hands the result back down.
 */
export function AttachmentTray({
  attachments,
  onCancel,
  onRetry,
  disabled = false,
  skeleton = false,
  className,
  'aria-label': ariaLabel,
  ...rest
}: AttachmentTrayProps) {
  const t = useT();
  if (attachments.length === 0) return null;

  return (
    <ul className={cx(styles.tray, className)} aria-label={ariaLabel ?? t(composeMessages.attachments)} {...rest}>
      {attachments.map((attachment) => (
        <AttachmentChip
          key={attachment.id}
          {...attachment}
          onCancel={onCancel}
          onRetry={onRetry}
          disabled={disabled}
          skeleton={skeleton}
        />
      ))}
    </ul>
  );
}
