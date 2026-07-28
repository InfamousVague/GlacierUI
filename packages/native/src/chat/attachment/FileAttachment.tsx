// FileAttachment — the native binding of @glacier/react's FileAttachment.
//
// A document sent in a message: the type glyph, the name middle-truncated so
// the extension survives, the size, and a download control that becomes a
// ProgressBar row while the bytes move. The glyph family, the size formatting,
// and the name split all come from @glacier/logic, so a file card reads the
// same on both platforms — including which of `.numbers` and `.pdf` stays
// visible when the name is too long for the bubble.
//
// Resting visuals only: the web eases the progress fill; there is no animation
// runtime here, so the bar holds its computed width.

import { View, Text, type ViewProps } from 'react-native';
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
import type { ComponentType } from 'react';
import type { ChatAttachment } from '@glacier/logic';
import {
  attachmentLabel,
  fileGlyph,
  formatFileSize,
  progressPercent,
  splitFileName,
  type FileGlyph,
} from '@glacier/logic';
// TODO(integration): switch to '@glacier/spec' once the spec is registered.
import { fileAttachmentSpec } from '../../../../spec/src/components/file-attachment.ts';
import { t } from '../../tokens.ts';
import { dimensionsFor } from '../../resolve.ts';
import { IconButton } from '../../atoms/inputs/IconButton.tsx';
import { ProgressBar } from '../../atoms/feedback/ProgressBar.tsx';
import { Skeleton } from '../../atoms/feedback/Skeleton.tsx';

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

// There is no LocaleProvider natively, so the English kit strings are the
// literals (callers override through `labels`), matching FileUpload.
const DEFAULT_LABELS: FileAttachmentLabels = {
  file: 'File',
  download: 'Download {name}',
  cancel: 'Cancel {name}',
  transferring: '{percent}%',
};

/**
 * The kit's icon for each glyph family. The families are decided once in
 * @glacier/logic; this table is the only thing an icon-pack swap touches.
 */
const GLYPH_ICON: Record<FileGlyph, ComponentType<{ size?: number; color?: string }>> = {
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

export interface FileAttachmentProps extends Omit<ViewProps, 'children' | 'style'> {
  attachment: ChatAttachment;
  /** Transfer progress as a fraction from 0 to 1. Set, the card is in progress. */
  progress?: number;
  indeterminate?: boolean;
  onDownload?: () => void;
  onCancel?: () => void;
  /**
   * A real download URL on the web. Accepted-but-inert natively: there is no
   * anchor to hand the OS, so a device build routes the tap through
   * `onDownload` and its own file handling.
   */
  href?: string;
  /** Formats the size. Fixed `en` when omitted — there is no locale context here. */
  locale?: string;
  skeleton?: boolean;
  labels?: Partial<FileAttachmentLabels>;
}

// Size-independent metrics and the rest paint, read once from the spec. The
// card declares no variants, so its paint is the spec's top-level rest paint.
const BOX = dimensionsFor(fileAttachmentSpec);
const bare = (ref: string | undefined, fallback: string): string => t((ref ?? fallback).replace(/^\$/, ''));
const CARD_BG = bare(fileAttachmentSpec.paint?.background, '$surface-sunken');
const CARD_BORDER = bare(fileAttachmentSpec.paint?.border, '$border-subtle');

/** Interpolates `{name}` placeholders, matching the kit catalog's `format`. */
function interpolate(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) =>
    key in params ? String(params[key]) : whole,
  );
}

export function FileAttachment({
  attachment,
  progress,
  indeterminate = false,
  onDownload,
  onCancel,
  href: _href,
  locale,
  skeleton = false,
  labels,
  ...rest
}: FileAttachmentProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const name = attachmentLabel(attachment, text.file);
  const transferring = progress !== undefined || indeterminate;
  const percent = progressPercent(progress ?? 0);
  const Glyph = GLYPH_ICON[fileGlyph(attachment.mimeType, attachment.fileName)];
  const { head, tail } = splitFileName(name);

  const card = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    width: '100%' as const,
    gap: t(BOX.gap ?? 'space-3'),
    paddingVertical: t(BOX.paddingBlock ?? 'space-2'),
    paddingHorizontal: t(BOX.paddingInline ?? 'space-3'),
    borderRadius: t(BOX.radius ?? 'radius-md'),
    borderWidth: t(BOX.border ?? 'hairline'),
    borderStyle: 'solid' as const,
    backgroundColor: CARD_BG,
    borderColor: CARD_BORDER,
  };

  if (skeleton) {
    return (
      <View {...rest} style={card}>
        <Skeleton variant="rect" width={t(BOX.glyphSize ?? 'size-2xl')} height={t(BOX.glyphSize ?? 'size-2xl')} />
        <View style={{ flex: 1, gap: t(BOX.metaGap ?? 'space-1') }}>
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="25%" />
        </View>
        <Skeleton
          variant="rect"
          width={t('control-height-sm')}
          height={t('control-height-sm')}
          radius={t('control-radius')}
        />
      </View>
    );
  }

  const action =
    transferring && onCancel ? (
      <IconButton size="sm" aria-label={interpolate(text.cancel, { name })} onPress={onCancel}>
        <X size={16} color={t('text-muted')} />
      </IconButton>
    ) : onDownload ? (
      <IconButton size="sm" aria-label={interpolate(text.download, { name })} onPress={onDownload}>
        <Download size={16} color={t('text-muted')} />
      </IconButton>
    ) : null;

  const nameStyle = {
    color: t('text'),
    fontFamily: t('font-sans'),
    fontSize: t('font-size-sm') as never,
  };
  const metaStyle = {
    color: t('text-muted'),
    fontFamily: t('font-sans'),
    fontSize: t('font-size-xs') as never,
    fontVariant: ['tabular-nums'] as const,
  };

  return (
    <View {...rest} style={card}>
      {/* The glyph repeats what the name's extension already says, so it is
          decoration — useful to the eye, noise to a screen reader. */}
      <View
        aria-hidden={true}
        style={{
          width: t(BOX.glyphSize ?? 'size-2xl'),
          height: t(BOX.glyphSize ?? 'size-2xl'),
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: t('radius-sm'),
          backgroundColor: t('accent-soft'),
        }}
      >
        <Glyph size={18} color={t('accent-text')} />
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: t(BOX.metaGap ?? 'space-1') }}>
        {/* Two runs, one elastic and one pinned: the head is allowed to clip and
            the tail is not, so the extension survives at any bubble width with
            nothing measured. The whole name is the row's accessible label. */}
        <View style={{ flexDirection: 'row', minWidth: 0 }} aria-label={name}>
          <Text numberOfLines={1} ellipsizeMode="tail" style={[nameStyle, { flexShrink: 1 }]}>
            {head}
          </Text>
          {tail !== '' && (
            <Text numberOfLines={1} style={[nameStyle, { flexShrink: 0 }]}>
              {tail}
            </Text>
          )}
        </View>
        {/* The bar takes the size line's row rather than a row of its own, so
            the card is the same height at rest and mid-transfer. */}
        {transferring ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: t('space-2') }}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <ProgressBar
                size="sm"
                value={indeterminate ? undefined : percent}
                indeterminate={indeterminate}
                aria-label={interpolate(text.download, { name })}
              />
            </View>
            {!indeterminate && (
              // Decorative: the bar beside it already reports the same number.
              <Text aria-hidden={true} style={metaStyle}>
                {interpolate(text.transferring, { percent })}
              </Text>
            )}
          </View>
        ) : (
          attachment.byteSize != null && (
            <Text style={metaStyle}>{formatFileSize(attachment.byteSize, locale ?? 'en')}</Text>
          )
        )}
      </View>
      {action}
    </View>
  );
}
