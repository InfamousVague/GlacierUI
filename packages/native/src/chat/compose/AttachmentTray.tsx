/**
 * @glacier/native — AttachmentTray and AttachmentChip.
 *
 * The React Native binding of @glacier/react's tray: one chip per pending file,
 * each with its own progress and its own cancel. Geometry (the chip radius, gap,
 * hairline border and padding, the tray gap) and the per-status paint come from
 * the attachment-tray spec through the shared resolvers; the byte formatting,
 * the name split, and the classifier that picks the glyph are the same
 * @glacier/logic functions the DOM kit calls.
 *
 * Divergences:
 * - The tray scrolls in a horizontal ScrollView rather than an overflowing
 *   `<ul>`; the rule it enforces is the same (chips scroll, they never wrap).
 * - There is no `aria-live`. Upload progress is announced through
 *   `accessibilityValue` on the chip instead, which VoiceOver and TalkBack read
 *   on focus rather than on change — a coarser channel than the web's polite
 *   region, and the closest the platform has.
 * - Chip enter/leave motion is a device follow-up; this renders the resting row.
 */

import { type ComponentType } from 'react';
import { ScrollView, View, Text as RNText, type ViewProps } from 'react-native';
import { FileText, Film, Image as ImageIcon, Music, RotateCcw, X } from '@glacier/icons';
import { attachmentKind } from '@glacier/logic';
import { formatBytes } from '@glacier/logic';
import { splitFileName } from '@glacier/logic';
// TODO(integration): switch to '@glacier/spec' once the compose specs are registered.
import {
  attachmentChipSpec,
  attachmentTraySpec,
  composeAttachmentStatuses,
} from '../../../../spec/src/components/attachment-tray.ts';
import { t } from '../../tokens.ts';
import { paintFor, dimensionsFor } from '../../resolve.ts';
import { IconButton } from '../../atoms/inputs/IconButton.tsx';
import { ProgressBar } from '../../atoms/feedback/ProgressBar.tsx';
import { Skeleton } from '../../atoms/feedback/Skeleton.tsx';

// Derived from the spec so the status union cannot drift from the web kit.
export type ComposeAttachmentStatus = (typeof composeAttachmentStatuses)[number];

export interface ComposeAttachment {
  id: string;
  name: string;
  size?: number;
  status: ComposeAttachmentStatus;
  progress?: number;
  error?: string;
  /** MIME type, used only to pick the glyph. */
  mimeType?: string;
}

export interface AttachmentChipProps extends ComposeAttachment {
  onCancel?: (id: string) => void;
  onRetry?: (id: string) => void;
  disabled?: boolean;
  skeleton?: boolean;
}

export interface AttachmentTrayProps extends Omit<ViewProps, 'children' | 'style'> {
  attachments: readonly ComposeAttachment[];
  onCancel?: (id: string) => void;
  onRetry?: (id: string) => void;
  disabled?: boolean;
  skeleton?: boolean;
  'aria-label'?: string;
}

const GLYPHS = { image: ImageIcon, video: Film, audio: Music, file: FileText } as const;

// The permissive react-native d.ts declares no accessibilityValue, so the chip's
// announcing surface is typed through a narrow local alias (the pattern SeekBar
// and Slider use for their responder tracks).
type ProgressAccessible = { accessibilityValue?: { now: number; min: number; max: number } };
const Chip = View as unknown as ComponentType<ViewProps & ProgressAccessible>;

// Size-independent metrics read once from the spec.
const CHIP = dimensionsFor(attachmentChipSpec);
const TRAY = dimensionsFor(attachmentTraySpec);

/** A token name becomes a custom property; a raw CSS length passes through. */
function metric(value: string | undefined, fallback: string): string {
  const v = value ?? fallback;
  return /^[.\d]/.test(v) ? v : t(v);
}

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
}: AttachmentChipProps) {
  if (skeleton) {
    return <Skeleton width={128} height={t('space-6')} radius={t(CHIP.radius ?? 'radius-md')} />;
  }

  const Glyph = GLYPHS[attachmentKind(mimeType, name)];
  const { head, tail } = splitFileName(name);
  const percent = Math.round((progress ?? 0) * 100);
  // Per-status paint, read from the spec rather than hand-transcribed.
  const paint = paintFor(attachmentChipSpec, 'states', status);

  return (
    <Chip
      accessibilityRole="text"
      accessibilityLabel={name}
      // The platform's substitute for the web's polite live region.
      accessibilityValue={status === 'uploading' ? { now: percent, min: 0, max: 100 } : undefined}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: metric(CHIP.gap, 'space-2'),
        maxWidth: 224,
        paddingVertical: metric(CHIP.paddingBlock, 'space-1'),
        paddingHorizontal: metric(CHIP.paddingInline, 'space-2'),
        borderWidth: t('hairline'),
        borderColor: t(paint.border ?? 'border-subtle'),
        borderRadius: metric(CHIP.radius, 'radius-md'),
        backgroundColor: t('surface-sunken'),
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Glyph size={14} color={t('text-muted')} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row' }}>
          {/* Head elides, tail never does, so the extension always survives. */}
          <RNText numberOfLines={1} style={{ flexShrink: 1, color: t('text'), fontSize: t('font-size-xs') }}>
            {head}
          </RNText>
          {tail.length > 0 && (
            <RNText style={{ color: t('text'), fontSize: t('font-size-xs') }}>{tail}</RNText>
          )}
        </View>
        {status === 'failed' && error ? (
          <RNText style={{ color: t('danger-text'), fontSize: t('font-size-xs') }}>{error}</RNText>
        ) : size !== undefined ? (
          <RNText style={{ color: t('text-muted'), fontSize: t('font-size-xs') }}>{formatBytes(size)}</RNText>
        ) : null}
        {status === 'uploading' && (
          <View style={{ marginTop: t('space-1') }}>
            <ProgressBar
              size="sm"
              value={progress === undefined ? undefined : percent}
              indeterminate={progress === undefined}
              aria-label={`Uploading ${name}, ${percent}%`}
            />
          </View>
        )}
      </View>
      {status === 'failed' && onRetry && (
        <IconButton size="sm" variant="ghost" disabled={disabled} aria-label={`Retry ${name}`} onPress={() => onRetry(id)}>
          <RotateCcw size={12} color={t('text-muted')} />
        </IconButton>
      )}
      <IconButton
        size="sm"
        variant="ghost"
        disabled={disabled}
        aria-label={`Remove ${name}`}
        onPress={() => onCancel?.(id)}
      >
        <X size={12} color={t('text-muted')} />
      </IconButton>
    </Chip>
  );
}

export function AttachmentTray({
  attachments,
  onCancel,
  onRetry,
  disabled = false,
  skeleton = false,
  'aria-label': ariaLabel = 'Attachments',
  ...rest
}: AttachmentTrayProps) {
  // Nothing at all when there is nothing attached: a reserved shelf pushes the
  // input up the screen for files that do not exist.
  if (attachments.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityRole="list"
      aria-label={ariaLabel}
      contentContainerStyle={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: metric(TRAY.gap, 'space-2'),
        paddingBottom: metric(TRAY.paddingBlock, 'space-2'),
      }}
      {...rest}
    >
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
    </ScrollView>
  );
}
