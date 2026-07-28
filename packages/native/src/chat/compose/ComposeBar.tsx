/**
 * @glacier/native — ComposeBar.
 *
 * The React Native binding of @glacier/react's composer: a context banner and
 * attachment tray above, the auto-growing input in the middle, and the attach,
 * voice, and send controls on the trailing edge. THE SEND RULE is the same
 * function on both platforms — `canSendCompose` in @glacier/logic — so a bar
 * that refuses to send here refuses for the same reason and with the same words
 * there. Paint and geometry come from the compose-bar spec through the shared
 * resolvers.
 *
 * KEY HANDLING DIVERGES SHARPLY, and the divergence cascades from the input up:
 *
 * - **No keyboard shortcuts reach the bar at all.** On the web, Enter sends or
 *   writes a newline per policy, Shift+Enter always writes one, Cmd/Ctrl+Enter
 *   always sends, and Escape closes the mention popup or dismisses the context.
 *   React Native's TextInput reports no modifiers and no Escape, so NONE of
 *   those chords exist here. Every one of them has a control instead: the send
 *   button sends, the banner's dismiss drops the context, and a mention is
 *   completed by pressing its row.
 * - This is exactly why the send control is refused rather than hidden. On the
 *   web it is one of three ways to send; here it is the only one.
 * - The mention popup's cursor is therefore a pointer affordance, not a
 *   keyboard one; the matcher and the flat indices behind it are still the
 *   command palette's, shared with the web.
 * - **Files** come from the host: there is no `input[type=file]`, no drop
 *   target, and no clipboard file API, so the attach control calls `onAttach`
 *   for the app to open a document picker, and `screenFiles` still screens
 *   whatever comes back with FileUpload's type/size/count contract.
 *
 * Resting visuals only: the focus-within border lift, the drag-over wash, and
 * the glass blur are web material this binding does not run.
 */

import { useState, type ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';
import { Paperclip } from '@glacier/icons';
import { firstCommandCursor } from '@glacier/logic';
import {
  applyMention,
  canSendCompose,
  composeMetrics,
  composeSendState,
  countCharacters,
  mentionInsertion,
  mentionMatches,
  mentionQuery,
  type ComposeAttachment,
  type ComposeDensity,
  type ComposeEnterPolicy,
  type MentionCandidate,
  type MentionTriggerRule,
} from '@glacier/logic';
// TODO(integration): switch to '@glacier/spec' once the compose specs are registered.
import { composeBarSpec } from '../../../../spec/src/components/compose-bar.ts';
import { t } from '../../tokens.ts';
import { dimensionsFor } from '../../resolve.ts';
import { IconButton } from '../../atoms/inputs/IconButton.tsx';
import { AttachmentTray } from './AttachmentTray.tsx';
import { CharacterCounter } from './CharacterCounter.tsx';
import { ComposeContextBanner, type ComposeContextMode } from './ComposeContextBanner.tsx';
import { MentionAutocomplete } from './MentionAutocomplete.tsx';
import { MessageInput } from './MessageInput.tsx';
import { SendButton } from './SendButton.tsx';
import { VoiceRecorder } from '../call/VoiceRecorder.tsx';

export type { ComposeDensity };

export interface ComposeContext {
  mode: ComposeContextMode;
  author?: string;
  preview?: ReactNode;
  count?: number;
}

export interface ComposeBarProps extends Omit<ViewProps, 'children' | 'style'> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onSend?: (text: string, attachments: readonly ComposeAttachment[]) => void;

  attachments?: readonly (ComposeAttachment & { mimeType?: string })[];
  onAttachmentCancel?: (id: string) => void;
  onAttachmentRetry?: (id: string) => void;
  /** Asks the host to open a document picker; there is no native file input. */
  onAttach?: () => void;

  context?: ComposeContext;
  onContextDismiss?: () => void;

  limit?: number;
  sending?: boolean;
  failed?: boolean;

  mentions?: readonly MentionCandidate[];
  commands?: readonly MentionCandidate[];

  onVoice?: (seconds: number) => void;
  voiceMeter?: (() => number) | null;

  enterPolicy?: ComposeEnterPolicy;
  density?: ComposeDensity;
  minRows?: number;
  maxRows?: number;
  placeholder?: string;
  disabled?: boolean;
  skeleton?: boolean;
  'aria-label'?: string;
}

/** `/` completes commands, `@` and `#` complete people and channels. */
const TRIGGERS: readonly MentionTriggerRule[] = [
  { trigger: '@' },
  { trigger: '#' },
  { trigger: '/', atStart: true },
];

const DIMS = dimensionsFor(composeBarSpec);

function metric(value: string | undefined, fallback: string): string {
  const v = value ?? fallback;
  return /^[.\d]/.test(v) ? v : t(v);
}

export function ComposeBar({
  value: valueProp,
  defaultValue = '',
  onValueChange,
  onSend,
  attachments = [],
  onAttachmentCancel,
  onAttachmentRetry,
  onAttach,
  context,
  onContextDismiss,
  limit,
  sending = false,
  failed = false,
  mentions,
  commands,
  onVoice,
  voiceMeter = null,
  enterPolicy = 'auto',
  density = 'comfortable',
  minRows,
  maxRows = 6,
  placeholder = 'Write a message…',
  disabled = false,
  skeleton = false,
  'aria-label': ariaLabel = 'Message composer',
  ...rest
}: ComposeBarProps) {
  const metrics = composeMetrics(density);
  const [internal, setInternal] = useState(defaultValue);
  const [caret, setCaret] = useState(0);
  const [cursor, setCursor] = useState(0);

  const value = valueProp ?? internal;
  const update = (next: string) => {
    if (valueProp === undefined) setInternal(next);
    onValueChange?.(next);
  };

  const token = mentionQuery(value, caret, TRIGGERS);
  const candidates = token?.trigger === '/' ? commands : mentions;
  const popupOpen = token !== null && candidates !== undefined && candidates.length > 0;
  // The same pure call MentionAutocomplete makes, so the row this cursor
  // addresses is the row drawn there.
  const matches = popupOpen ? mentionMatches(candidates ?? [], token?.query ?? '') : [];
  const seatedCursor = matches[cursor] ? cursor : firstCommandCursor(matches);

  const permission = canSendCompose({ text: value, attachments, sending, failed, limit, disabled });
  const sendState = composeSendState({ text: value, attachments, sending, failed, limit, disabled });

  const send = () => {
    if (!permission.allowed) return;
    onSend?.(value.trim(), attachments);
  };

  const choose = (id: string) => {
    const candidate = (candidates ?? []).find((c) => c.id === id);
    if (!candidate || !token) return;
    const next = applyMention(value, token, mentionInsertion(candidate));
    update(next.text);
    setCaret(next.caret);
  };

  return (
    <View
      accessibilityRole="form"
      aria-label={ariaLabel}
      style={{
        width: '100%',
        gap: t(metrics.gap),
        padding: metric(DIMS.paddingBlock, 'space-2'),
        borderWidth: t('hairline'),
        borderColor: t('border'),
        borderRadius: metric(DIMS.radius, 'radius-xl'),
        backgroundColor: t('surface'),
        opacity: disabled ? 0.5 : 1,
      }}
      {...rest}
    >
      {context && onContextDismiss && (
        <ComposeContextBanner
          mode={context.mode}
          author={context.author}
          preview={context.preview}
          count={context.count}
          onDismiss={onContextDismiss}
          skeleton={skeleton}
        />
      )}

      <AttachmentTray
        attachments={attachments}
        onCancel={onAttachmentCancel}
        onRetry={onAttachmentRetry}
        disabled={disabled}
        skeleton={skeleton}
      />

      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: t('space-1') }}>
        {onAttach && (
          <IconButton
            size={metrics.controlSize}
            variant="ghost"
            disabled={disabled}
            skeleton={skeleton}
            aria-label="Attach files"
            onPress={onAttach}
          >
            <Paperclip size={18} color={t('text-muted')} />
          </IconButton>
        )}

        {/* The popup anchors to this, so it has to be the positioned parent. */}
        <View style={{ flex: 1, minWidth: 0, position: 'relative' }}>
          <MentionAutocomplete
            open={popupOpen}
            query={token?.query ?? ''}
            trigger={token?.trigger ?? '@'}
            candidates={candidates ?? []}
            cursor={seatedCursor}
            onCursorChange={setCursor}
            onChoose={choose}
          />
          <MessageInput
            bare
            value={value}
            onValueChange={update}
            onSend={send}
            onCaretChange={setCaret}
            enterPolicy={enterPolicy}
            minRows={minRows ?? metrics.minRows}
            maxRows={maxRows}
            size={metrics.controlSize}
            disabled={disabled}
            placeholder={placeholder}
            aria-label={ariaLabel}
          />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: t('space-1') }}>
          {limit !== undefined && limit > 0 && (
            <CharacterCounter length={countCharacters(value)} limit={limit} />
          )}
          {onVoice && (
            <VoiceRecorder
              meter={voiceMeter}
              onSend={onVoice}
              size={metrics.controlSize}
              disabled={disabled}
            />
          )}
          <SendButton
            state={sendState}
            blockReason={permission.reason}
            size={metrics.controlSize}
            skeleton={skeleton}
            onSend={send}
          />
        </View>
      </View>
    </View>
  );
}
