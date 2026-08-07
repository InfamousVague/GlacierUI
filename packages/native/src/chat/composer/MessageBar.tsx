// The Glacier MessageBar, rendered with React Native primitives: the composer at
// the foot of a thread. Every decision that could differ between platforms -
// which chord sends, what counts as a character, whether this draft may go out,
// what the send hands back, how a file is staged, how much of a quoted message
// survives - comes from @glacier/logic, the same functions the DOM kit calls.
//
// The one genuine divergence is how the field reaches its height, and the spec
// records it under the `grower` anatomy entry: the DOM stacks a hidden twin and
// lets CSS take the taller of the two, while React Native has no twin and grows
// through `onContentSizeChange`. Both are clamped by the same minRows and
// maxRows, so the two bars settle at the same size for the same draft.

import { useRef, useState, type ReactNode } from 'react';
import { Pressable, TextInput, View, Text as RNText, type TextInputHandle } from 'react-native';
import {
  attachmentKind,
  composerCanSend,
  composerKeyAction,
  composerSubmission,
  defaultComposerLabels,
  draftCount,
  draftMeter,
  unstageAttachment,
  type AttachmentKind,
  type ChatAttachment,
  type ComposerLabels,
  type ComposerSubmission,
  type ComposerSubmitMode,
  type DraftCountMode,
  type DraftMeter,
  type ReplyPreview,
} from '@glacier/logic';
import { messageBarSpec, textSpec } from '@glacier/spec';
import { t } from '../../tokens.ts';
import { dimensionsFor, paintFor, sizeFor } from '../../resolve.ts';
import { Skeleton } from '../../atoms/feedback/Skeleton.tsx';
import { TypingIndicator } from './TypingIndicator.tsx';

export type { ComposerSubmission, ComposerSubmitMode, ComposerLabels, ReplyPreview };

const DIMS = dimensionsFor(messageBarSpec);
const bare = (v?: string): string | undefined => (v?.startsWith('$') ? v.slice(1) : v);
const BASE = (messageBarSpec.paint ?? {}) as { background?: string; text?: string; border?: string };
const SENDABLE = paintFor(messageBarSpec, 'states', 'sendable');
const DISABLED = paintFor(messageBarSpec, 'states', 'disabled');
const NEAR = paintFor(messageBarSpec, 'states', 'near');
const OVER = paintFor(messageBarSpec, 'states', 'over');

/** Interpolates `{name}` placeholders, matching the kit catalog's `format`. */
function fill(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) =>
    key in params ? String(params[key]) : whole,
  );
}

/** What a replaced send control is told, so it stays as correct as the default. */
export interface MessageBarState {
  text: string;
  canSend: boolean;
  busy: boolean;
  disabled: boolean;
  submitMode: ComposerSubmitMode;
  meter: DraftMeter;
  attachments: ChatAttachment[];
  send: () => void;
}

/** What a staged-attachment renderer is told about the file it is drawing. */
export interface StagedAttachmentContext {
  attachment: ChatAttachment;
  kind: AttachmentKind;
  index: number;
  remove: () => void;
}

export interface MessageBarProps {
  /** The draft, controlled. */
  value?: string;
  /** The initial draft when the bar owns its own state. */
  defaultValue?: string;
  onValueChange?: (next: string) => void;
  /** Called with the trimmed text, the staged files, and the reply and edit ids. */
  onSend?: (submission: ComposerSubmission) => void;
  /**
   * Which chord sends.
   *
   * A soft keyboard has no Shift plus Enter, so a device build usually wants
   * `modifier` here - but it is still the caller's choice rather than something
   * this component reads off the environment, for the same reason the DOM
   * binding refuses to: a send that resolves from the device cannot be tested
   * and flips mid-session the moment a keyboard is attached.
   */
  submitMode?: ComposerSubmitMode;
  placeholder?: string;
  minRows?: number;
  maxRows?: number;
  /** The character budget. Never applied as a `maxLength`, which truncates silently. */
  maxLength?: number;
  countAs?: DraftCountMode;
  attachments?: ChatAttachment[];
  onAttachmentsChange?: (next: ChatAttachment[]) => void;
  renderAttachment?: (context: StagedAttachmentContext) => ReactNode;
  /** The message being answered, resolved by `replyPreview` rather than as markup. */
  replyTo?: ReplyPreview | null;
  onCancelReply?: () => void;
  editingId?: string;
  onCancelEdit?: () => void;
  /** Who is typing, as display names. Never a pre-joined sentence. */
  typing?: string[];
  typingMax?: number;
  busy?: boolean;
  disabled?: boolean;
  /** Replaces the send control, receiving the live state. */
  renderSend?: (state: MessageBarState) => ReactNode;
  /** The leading slot, for an attachment or media control. */
  attach?: ReactNode;
  /** The trailing slot before the send control. */
  actions?: ReactNode;
  /** The frosted tint. React Native cannot blur, so the material is the fill only. */
  glass?: boolean;
  /** Translated strings, merged over the English defaults. */
  labels?: Partial<ComposerLabels>;
  skeleton?: boolean;
}

/**
 * The composer.
 *
 * Two refusals carry over from the DOM binding verbatim, because both are about
 * data rather than paint:
 *
 * **No `maxLength` on the input.** React Native's `maxLength` truncates a paste
 * without saying so and cuts an input method off mid-word, exactly as the DOM
 * attribute does. `maxLength` here counts instead - through `Intl.Segmenter`, so
 * a flag is one character and not four - refuses to send while over, and lets
 * the text stand.
 *
 * **No `canSend` override.** Sendability is `composerCanSend` in commons,
 * consulted by the key handler and the send control alike, so a draft of three
 * spaces cannot get two different answers.
 *
 * The web's focus ring, its paint transition, and its dot animation are motion
 * and chrome this binding does not run; the resting frames match.
 */
export function MessageBar({
  value,
  defaultValue = '',
  onValueChange,
  onSend,
  submitMode = 'enter',
  placeholder,
  minRows = 1,
  maxRows = 6,
  maxLength,
  countAs = 'graphemes',
  attachments,
  onAttachmentsChange,
  renderAttachment,
  replyTo,
  onCancelReply,
  editingId,
  onCancelEdit,
  typing,
  typingMax = 2,
  busy = false,
  disabled = false,
  renderSend,
  attach,
  actions,
  glass = false,
  labels,
  skeleton = false,
}: MessageBarProps) {
  const [internal, setInternal] = useState(defaultValue);
  const draft = value ?? internal;
  const staged = attachments ?? EMPTY;
  // The measured content height, clamped by the row bounds below. This is the
  // native half of the `grower` divergence: no hidden twin exists here, so the
  // height comes back from the platform instead of from a layout the browser
  // already did.
  const [contentHeight, setContentHeight] = useState(0);
  const field = useRef<TextInputHandle>(null);

  const text: ComposerLabels = { ...defaultComposerLabels, ...labels };
  const xs = sizeFor(textSpec, 'xs');
  const sm = sizeFor(textSpec, 'sm');

  const meter = draftMeter(maxLength === undefined ? 0 : draftCount(draft, countAs), maxLength);
  const canSend = composerCanSend({
    text: draft,
    attachments: staged.length,
    over: meter.state === 'over',
    busy,
    disabled,
  });

  const setDraft = (next: string) => {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  };

  const send = () => {
    if (!canSend) return;
    onSend?.(
      composerSubmission(draft, {
        attachments: staged,
        ...(replyTo == null ? {} : { replyToId: replyTo.id }),
        ...(editingId === undefined ? {} : { editingId }),
      }),
    );
    setDraft('');
    setContentHeight(0);
    // Focus stays in the field: blurring dismisses the keyboard, and the next
    // message is usually seconds away.
    field.current?.focus();
  };

  const cancel = () => {
    if (editingId !== undefined && onCancelEdit) return onCancelEdit();
    if (replyTo != null && onCancelReply) return onCancelReply();
  };

  if (skeleton) {
    return (
      <Skeleton width="100%" height="3rem" radius={t(DIMS.radius ?? 'radius-xl')} />
    );
  }

  const rows = { min: Math.max(1, minRows), max: Math.max(Math.max(1, minRows), maxRows) };
  // One line box, in the same units the DOM binding computes its --message-bar-line
  // from: the sm leading times the sm font size.
  const line = `calc(${t('leading-sm')} * ${t(sm.fontSize ?? 'font-size-sm')})`;
  const state: MessageBarState = {
    text: draft,
    canSend,
    busy,
    disabled,
    submitMode,
    meter,
    attachments: staged,
    send,
  };

  return (
    <View style={{ gap: t(DIMS.stackGap ?? 'space-2'), minWidth: 0 }}>
      {typing !== undefined && typing.length > 0 && <TypingIndicator names={typing} max={typingMax} />}

      <View
        style={{
          gap: t(DIMS.stackGap ?? 'space-2'),
          minWidth: 0,
          paddingVertical: t(DIMS.paddingBlock ?? 'space-2'),
          paddingHorizontal: t(DIMS.paddingInline ?? 'space-2'),
          borderRadius: t(DIMS.radius ?? 'radius-xl'),
          borderWidth: t(DIMS.border ?? 'hairline'),
          borderStyle: 'solid',
          borderColor: glass ? t('glass-border') : t(bare(BASE.border) ?? 'border'),
          backgroundColor: disabled
            ? t(DISABLED.background ?? 'surface-sunken')
            : glass
              ? t('glass-regular')
              : t(bare(BASE.background) ?? 'surface-raised'),
        }}
      >
        {(replyTo != null || editingId !== undefined) && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: t(DIMS.gap ?? 'space-2'),
              minWidth: 0,
              paddingHorizontal: t(DIMS.fieldPaddingInline ?? 'space-2'),
              borderLeftWidth: 2,
              borderLeftColor: t('accent-border'),
            }}
          >
            <RNText
              numberOfLines={1}
              style={{
                flex: 1,
                color: t('text-muted'),
                fontFamily: t('font-sans'),
                fontSize: t(xs.fontSize ?? 'font-size-xs'),
                lineHeight: t('leading-xs'),
              }}
            >
              {editingId !== undefined
                ? text.editing
                : replyTo?.authorName !== undefined
                  ? `${fill(text.replyingTo, { name: replyTo.authorName })} ${replyTo.text}`
                  : `${text.replying} ${replyTo?.text ?? ''}`}
            </RNText>
            {(editingId !== undefined ? onCancelEdit : onCancelReply) && (
              <Pressable
                accessibilityRole="button"
                aria-label={editingId !== undefined ? text.cancelEdit : text.cancelReply}
                onPress={editingId !== undefined ? onCancelEdit : onCancelReply}
              >
                <RNText style={{ color: t('text-muted'), fontSize: t(xs.fontSize ?? 'font-size-xs') }}>
                  ✕
                </RNText>
              </Pressable>
            )}
          </View>
        )}

        {staged.length > 0 && (
          <View
            accessibilityRole="list"
            aria-label={text.attachments}
            style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t('space-2'), minWidth: 0 }}
          >
            {staged.map((attachment, index) => {
              const kind = attachmentKind(attachment.mimeType, attachment.fileName ?? attachment.url);
              const remove = () => onAttachmentsChange?.(unstageAttachment(staged, attachment.id));
              const name = attachment.fileName ?? attachment.id;
              if (renderAttachment) return renderAttachment({ attachment, kind, index, remove });
              return (
                <View
                  key={attachment.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: t('space-1'),
                    maxWidth: '14rem',
                    paddingVertical: t('space-1'),
                    paddingHorizontal: t('space-2'),
                    borderRadius: t('radius-md'),
                    backgroundColor: t('surface-sunken'),
                  }}
                >
                  <RNText
                    numberOfLines={1}
                    style={{
                      color: t('text-muted'),
                      fontFamily: t('font-sans'),
                      fontSize: t(xs.fontSize ?? 'font-size-xs'),
                      lineHeight: t('leading-xs'),
                    }}
                  >
                    {name}
                  </RNText>
                  <Pressable
                    accessibilityRole="button"
                    // Named by its file, not "Remove" five times over: a list of
                    // identically-labelled controls is a list nobody can
                    // navigate by name.
                    aria-label={fill(text.removeAttachment, { name })}
                    disabled={disabled}
                    onPress={remove}
                  >
                    <RNText style={{ color: t('text-muted'), fontSize: t(xs.fontSize ?? 'font-size-xs') }}>
                      ✕
                    </RNText>
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            gap: t(DIMS.gap ?? 'space-2'),
            minWidth: 0,
          }}
        >
          {attach}
          <TextInput
            ref={field}
            multiline
            value={draft}
            placeholder={placeholder ?? text.placeholder}
            placeholderTextColor={t('text-subtle')}
            editable={!disabled}
            aria-label={text.label}
            // The spoken policy, whether or not a hint is drawn: Enter here is
            // irreversible and invisible.
            accessibilityHint={
              submitMode === 'enter' ? text.hintEnter : fill(text.hintModifier, { modifier: 'Command' })
            }
            onChangeText={setDraft}
            onContentSizeChange={(event) => setContentHeight(event.nativeEvent.contentSize.height)}
            onKeyPress={(event) => {
              const { key, shiftKey, metaKey, ctrlKey, altKey, isComposing } = event.nativeEvent;
              const action = composerKeyAction(
                { key, shiftKey, metaKey, ctrlKey, altKey, isComposing },
                submitMode,
              );
              if (action === 'submit') {
                // Without this a claimed Enter also inserts the newline it was
                // supposed to replace.
                event.preventDefault?.();
                send();
                return;
              }
              if (action === 'cancel') cancel();
            }}
            style={{
              flex: 1,
              minWidth: 0,
              minHeight: `calc(${line} * ${rows.min})`,
              maxHeight: `calc(${line} * ${rows.max})`,
              // The measured height, once there is one; the bounds above cap it,
              // so a long draft scrolls instead of pushing the thread away.
              ...(contentHeight > 0 ? { height: contentHeight } : {}),
              borderWidth: 0,
              paddingVertical: t(DIMS.fieldPaddingBlock ?? 'space-1'),
              paddingHorizontal: t(DIMS.fieldPaddingInline ?? 'space-2'),
              backgroundColor: 'transparent',
              color: t(bare(BASE.text) ?? 'text'),
              fontFamily: t('font-sans'),
              fontSize: t(sm.fontSize ?? 'font-size-sm'),
              lineHeight: t('leading-sm'),
              textAlignVertical: 'top',
            }}
          />

          {/* Absent until the budget starts to matter: a number that changed on
              every keystroke would be noise. */}
          {meter.state !== 'idle' && meter.max !== undefined && (
            <RNText
              style={{
                color: t((meter.state === 'over' ? OVER.text : NEAR.text) ?? 'text-muted'),
                fontFamily: t('font-sans'),
                fontSize: t(xs.fontSize ?? 'font-size-xs'),
                lineHeight: t('leading-sm'),
              }}
            >
              {fill(text.count, { count: meter.count, max: meter.max })}
            </RNText>
          )}

          {actions}

          {renderSend ? (
            renderSend(state)
          ) : (
            <Pressable
              accessibilityRole="button"
              aria-label={text.send}
              // The same authority the key handler consults; deriving it twice
              // is how the button and the keyboard start disagreeing.
              disabled={!canSend}
              onPress={send}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: t('control-height-md'),
                height: t('control-height-md'),
                borderRadius: t('control-radius'),
                backgroundColor: t(SENDABLE.background ?? 'accent-solid'),
                opacity: canSend ? 1 : 0.5,
              }}
            >
              <RNText style={{ color: t(SENDABLE.text ?? 'accent-contrast'), fontSize: t('font-size-sm') }}>
                ➤
              </RNText>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

/** A stable empty list, so an uncontrolled bar does not re-render on identity. */
const EMPTY: ChatAttachment[] = [];
