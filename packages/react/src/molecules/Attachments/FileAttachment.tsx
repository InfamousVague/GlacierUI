import type { ChatAttachment } from '@glacier/logic';
import {
  Download,
  File as FileGlyphIcon,
  FileArchive,
  FileAudio,
  FileCode,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Presentation,
  X,
} from '@glacier/icons';
import type { ComponentProps, ComponentType } from 'react';
import {
  fileGlyph,
  formatFileSize,
  progressPercent,
  splitFileName,
  attachmentLabel,
  type FileGlyph,
} from '@glacier/logic';
import { cx } from '../../internal/cx.ts';
import { format, type Locale } from '../../i18n/locale.ts';
import { useLocale } from '../../i18n/LocaleProvider.tsx';
import { IconButton } from '../../atoms/inputs/Button/IconButton.tsx';
import { ProgressBar } from '../../atoms/feedback/Progress/ProgressBar.tsx';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import styles from './Attachments.module.css';

/** Every string the card can speak. */
export interface FileAttachmentLabels {
  /** Spoken when the attachment has no file name. */
  file: string;
  /** The download action, with a `{name}` slot. */
  download: string;
  /** The cancel action, with a `{name}` slot. */
  cancel: string;
  /** The in-progress line, with a `{percent}` slot. */
  transferring: string;
}

const DEFAULT_LABELS: FileAttachmentLabels = {
  file: 'File',
  download: 'Download {name}',
  cancel: 'Cancel {name}',
  transferring: '{percent}%',
};

/**
 * The kit's icon for each glyph family. The families themselves are decided in
 * @glacier/logic, so this table is the only thing that changes when the icon
 * pack does — and native keeps its own copy of exactly this shape.
 */
const GLYPH_ICON: Record<FileGlyph, ComponentType<{ size?: number }>> = {
  image: FileImage,
  video: FileVideo,
  audio: FileAudio,
  pdf: FileText,
  document: FileText,
  sheet: FileSpreadsheet,
  slides: Presentation,
  archive: FileArchive,
  code: FileCode,
  text: FileText,
  file: FileGlyphIcon,
};

export interface FileAttachmentProps extends Omit<ComponentProps<'div'>, 'children'> {
  /** The attachment: its file name, mime type, and byte size. */
  attachment: ChatAttachment;
  /** Transfer progress as a fraction from 0 to 1. Set, the card is in progress. */
  progress?: number;
  /** A transfer is running but its total is unknown. */
  indeterminate?: boolean;
  /** Called when the download control is activated. */
  onDownload?: () => void;
  /** Called when a running transfer is cancelled. */
  onCancel?: () => void;
  /** Renders the action as a real download link rather than a button. */
  href?: string;
  /** Formats the size; defaults to the surrounding locale. */
  locale?: Locale;
  /** Renders a placeholder with the card's exact geometry. */
  skeleton?: boolean;
  /** Overrides the spoken strings; merged over the English defaults. */
  labels?: Partial<FileAttachmentLabels>;
}

/**
 * A document sent in a message.
 *
 * Two decisions carry this card. The name truncates in the *middle*, because
 * the end is the half that identifies the file — `Q3-final-revised-v7.pdf` and
 * `Q3-final-revised-v7.numbers` are the same twenty characters followed by the
 * only difference that matters — and it does it by letting one run ellipsise
 * while the other is pinned, so it re-truncates at any width with nothing
 * measured. And the card is the same height at rest and mid-transfer, so a
 * finishing download does not resize the bubble under the reader.
 */
export function FileAttachment({
  attachment,
  progress,
  indeterminate = false,
  onDownload,
  onCancel,
  href,
  locale,
  skeleton = false,
  labels,
  className,
  ...rest
}: FileAttachmentProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const activeLocale = useLocale();
  const name = attachmentLabel(attachment, text.file);
  const transferring = progress !== undefined || indeterminate;
  const percent = progressPercent(progress ?? 0);
  const Glyph = GLYPH_ICON[fileGlyph(attachment.mimeType, attachment.fileName)];
  const { head, tail } = splitFileName(name);

  if (skeleton) {
    return (
      <div className={cx(styles.file, className)} {...rest}>
        <Skeleton variant="rect" width="var(--glacier-size-2xl)" height="var(--glacier-size-2xl)" />
        <div className={styles.fileBody}>
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="25%" />
        </div>
        <Skeleton
          variant="rect"
          width="var(--glacier-control-height-sm)"
          height="var(--glacier-control-height-sm)"
          radius="var(--glacier-control-radius)"
        />
      </div>
    );
  }

  const action = transferring && onCancel ? (
    <IconButton
      size="sm"
      className={styles.fileAction}
      aria-label={format(text.cancel, { name })}
      onClick={onCancel}
    >
      <X size={16} />
    </IconButton>
  ) : href ? (
    // A real anchor, not a button: right-click Save As and long-press Share are
    // download affordances the OS provides for free, and only to links.
    // TODO(integration): IconButton takes no `as`/`render` prop — see the
    // handoff note asking for one, and drop this hand-styled link when it lands.
    <a
      className={cx(styles.fileAction, styles.fileLink)}
      href={href}
      download={attachment.fileName}
      aria-label={format(text.download, { name })}
      onClick={onDownload}
    >
      <Download size={16} />
    </a>
  ) : onDownload ? (
    <IconButton
      size="sm"
      className={styles.fileAction}
      aria-label={format(text.download, { name })}
      onClick={onDownload}
    >
      <Download size={16} />
    </IconButton>
  ) : null;

  return (
    <div className={cx(styles.file, className)} data-transferring={transferring || undefined} {...rest}>
      {/* The glyph repeats what the name's extension already says, so it is
          decoration — useful to the eye, noise to a screen reader. */}
      <span className={styles.fileGlyph} aria-hidden="true">
        <Glyph size={18} />
      </span>
      <div className={styles.fileBody}>
        {/* The full name lives on the element: the eye gets the truncation, a
            screen reader and a tooltip both get the whole thing. */}
        <span className={styles.fileName} title={name}>
          <span className={styles.fileNameHead}>{head}</span>
          {tail !== '' && <span className={styles.fileNameTail}>{tail}</span>}
        </span>
        {/* The bar takes the size line's row rather than a row of its own, so
            the card is the same height at rest and mid-transfer and a finishing
            download does not resize the bubble under the reader. */}
        {transferring ? (
          <div className={styles.fileProgress}>
            <ProgressBar
              size="sm"
              className={styles.fileProgressBar}
              value={indeterminate ? undefined : percent}
              indeterminate={indeterminate}
              aria-label={format(text.download, { name })}
            />
            {/* Decorative: the bar beside it already reports the same number
                through aria-valuenow. */}
            {!indeterminate && (
              <span className={styles.fileMeta} aria-hidden="true">
                {format(text.transferring, { percent })}
              </span>
            )}
          </div>
        ) : (
          attachment.byteSize != null && (
            <span className={styles.fileMeta}>
              {formatFileSize(attachment.byteSize, locale ?? activeLocale)}
            </span>
          )
        )}
      </div>
      {action}
    </div>
  );
}
