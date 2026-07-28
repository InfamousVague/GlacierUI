import type { ComponentProps } from 'react';
import { firstCommandCursor, moveCommandCursor } from '@glacier/logic';
import { Paperclip } from '@glacier/icons';
import {
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type DragEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import {
  applyMention,
  canSendCompose,
  composeMetrics,
  composeSendState,
  countCharacters,
  mentionInsertion,
  mentionMatches,
  mentionQuery,
  screenFiles,
  type ComposeAttachment,
  type ComposeDensity,
  type ComposeEnterPolicy,
  type ComposeRejection,
  type MentionCandidate,
  type MentionTriggerRule,
} from '@glacier/logic';
import { cx } from '../../internal/cx.ts';
import { useControlled } from '../../internal/useControlled.ts';
import { useT } from '../../i18n/LocaleProvider.tsx';
import { IconButton } from '../../atoms/inputs/Button/IconButton.tsx';
import { AttachmentTray } from './AttachmentTray.tsx';
import { CharacterCounter } from './CharacterCounter.tsx';
import { ComposeContextBanner, type ComposeContextMode } from './ComposeContextBanner.tsx';
import { MentionAutocomplete } from './MentionAutocomplete.tsx';
import { MessageInput } from './MessageInput.tsx';
import { SendButton } from './SendButton.tsx';
import { VoiceRecorder } from './VoiceRecorder.tsx';
import { composeMessages } from './messages.ts';
import styles from './ComposeBar.module.css';

export type { ComposeDensity };

/** The reply / edit / forward context the bar is composing under. */
export interface ComposeContext {
  mode: ComposeContextMode;
  author?: ReactNode;
  preview?: ReactNode;
  count?: number;
}

export interface ComposeBarProps extends Omit<ComponentProps<'form'>, 'size' | 'onChange' | 'children'> {
  /** Controlled message text. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Called with the trimmed text and the attachments when send is allowed. */
  onSend?: (text: string, attachments: readonly ComposeAttachment[]) => void;

  /** Pending attachments; their upload belongs to the app. */
  attachments?: readonly (ComposeAttachment & { mimeType?: string })[];
  onAttachmentCancel?: (id: string) => void;
  onAttachmentRetry?: (id: string) => void;
  /** Called with files added by the attach control, a drop, or a paste. */
  onFiles?: (files: File[]) => void;
  onReject?: (rejections: ComposeRejection<File>[]) => void;
  accept?: string;
  maxSize?: number;
  maxFiles?: number;

  /** Renders the context banner when set. */
  context?: ComposeContext;
  onContextDismiss?: () => void;

  /** Character cap: shows the counter near it and blocks send past it. */
  limit?: number;
  /** A send is in flight. */
  sending?: boolean;
  /** The last send failed; the control becomes the retry. */
  failed?: boolean;

  /** Candidates for the @-popup. */
  mentions?: readonly MentionCandidate[];
  /** Candidates for the /-popup, matched by the same matcher. */
  commands?: readonly MentionCandidate[];

  /** Called with the recorded seconds when a voice take is sent. Omit it and the recorder is not rendered. */
  onVoice?: (seconds: number) => void;
  /** Loudness reader handed to the recorder; the host owns the microphone. */
  voiceMeter?: (() => number) | null;

  enterPolicy?: ComposeEnterPolicy;
  density?: ComposeDensity;
  minRows?: number;
  maxRows?: number;
  placeholder?: string;
  disabled?: boolean;
  glass?: boolean;
  skeleton?: boolean;
  className?: string;
  /** Accessible name for the composer region. */
  'aria-label'?: string;
  /** Pins the coarse-pointer probe; docs and tests need a fixed platform. */
  touch?: boolean;
}

/** `/` completes commands, `@` and `#` complete people and channels. */
const TRIGGERS: readonly MentionTriggerRule[] = [
  { trigger: '@' },
  { trigger: '#' },
  { trigger: '/', atStart: true },
];

/**
 * The message composer: a context banner and attachment tray above, the
 * auto-growing input in the middle, and the attach, voice, and send controls on
 * the trailing edge.
 *
 * It owns two things and delegates everything else. The first is layout. The
 * second is **the send rule**, which is not a boolean but a reason:
 * `canSendCompose` in @glacier/logic decides whether there is anything to
 * send, whether an upload is still running, and whether the message is over its
 * limit — and the reason travels into the send control's accessible name, so a
 * user who presses and gets nothing is told which of the four things to fix.
 *
 * It never clears its own value. Clearing on send would lose the message
 * whenever the send fails, which is exactly the moment the text matters most;
 * the owner clears once the send has actually landed.
 */
export function ComposeBar({
  value: valueProp,
  defaultValue = '',
  onValueChange,
  onSend,
  attachments = [],
  onAttachmentCancel,
  onAttachmentRetry,
  onFiles,
  onReject,
  accept,
  maxSize,
  maxFiles,
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
  placeholder,
  disabled = false,
  glass = false,
  skeleton = false,
  className,
  'aria-label': ariaLabel,
  touch,
  ...rest
}: ComposeBarProps) {
  const t = useT();
  const metrics = composeMetrics(density);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const listId = useId();

  const [value, setValue] = useControlled(valueProp, defaultValue);
  const [caret, setCaret] = useState(0);
  const [cursor, setCursor] = useState(0);
  const [dragging, setDragging] = useState(false);
  // Which token the user has dismissed with Escape, by its start offset. Kept
  // rather than just closing, so the popup does not reopen on the next
  // keystroke of a token the user has said they are done with.
  const [dismissed, setDismissed] = useState<number | null>(null);
  // Where the caret has to land after a completion rewrote the text.
  const pendingCaret = useRef<number | null>(null);

  const token = useMemo(() => mentionQuery(value, caret, TRIGGERS), [value, caret]);
  const candidates = token?.trigger === '/' ? commands : mentions;
  const popupOpen =
    token !== null && token.start !== dismissed && candidates !== undefined && candidates.length > 0;
  // The same pure call MentionAutocomplete makes, so the cursor here and the
  // highlighted row there are always the same row.
  const matches = useMemo(
    () => (popupOpen ? mentionMatches(candidates ?? [], token?.query ?? '') : []),
    [popupOpen, candidates, token?.query],
  );

  // Every keystroke rebuilds the list, so the cursor has to be re-seated: an
  // index kept across a narrowing list points at a different person.
  const seatedCursor = matches[cursor] ? cursor : firstCommandCursor(matches);

  const permission = canSendCompose({ text: value, attachments, sending, failed, limit, disabled });
  const sendState = composeSendState({ text: value, attachments, sending, failed, limit, disabled });

  // Setting the value and the caret in the same commit: React restores the DOM
  // selection to the end of a controlled textarea otherwise, dropping the caret
  // past text the user has not finished writing.
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (el && pendingCaret.current !== null) {
      el.setSelectionRange(pendingCaret.current, pendingCaret.current);
      setCaret(pendingCaret.current);
      pendingCaret.current = null;
    }
  }, [value]);

  const update = (next: string) => {
    setValue(next);
    onValueChange?.(next);
  };

  const send = () => {
    if (!permission.allowed) return;
    onSend?.(value.trim(), attachments);
  };

  const choose = (id: string) => {
    const candidate = (candidates ?? []).find((c) => c.id === id);
    if (!candidate || !token) return;
    const next = applyMention(value, token, mentionInsertion(candidate));
    pendingCaret.current = next.caret;
    update(next.text);
  };

  const addFiles = (incoming: File[]) => {
    const { accepted, rejections } = screenFiles(incoming, {
      accept,
      maxSize,
      maxFiles,
      current: attachments.length,
    });
    if (accepted.length > 0) onFiles?.(accepted);
    if (rejections.length > 0) onReject?.(rejections);
  };

  /** The popup owns these keys while it is open; the input's policy sees the rest. */
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (popupOpen && matches.length > 0) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        setCursor(moveCommandCursor(matches, seatedCursor, event.key === 'ArrowDown' ? 1 : -1));
        return;
      }
      if (event.key === 'Enter' || event.key === 'Tab') {
        const match = matches[seatedCursor];
        if (match && !match.item.disabled) {
          // Consumed before MessageInput's policy sees it: mid-mention, Enter
          // completes the name rather than sending a half-written message.
          event.preventDefault();
          choose(match.item.id);
          return;
        }
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        // Closes without touching the text: the token stays exactly as typed,
        // and stays closed until the user starts a different one.
        setDismissed(token?.start ?? null);
        return;
      }
    }
    if (event.key === 'Escape' && context && onContextDismiss) {
      event.preventDefault();
      onContextDismiss();
    }
  };

  const onDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    if (disabled) return;
    const dropped = Array.from(event.dataTransfer?.files ?? []);
    if (dropped.length > 0) addFiles(dropped);
  };

  return (
    <form
      {...rest}
      className={cx(styles.bar, glass && styles.glass, className)}
      // A form region with a name, so a reader can jump to the composer and
      // knows what the controls belong to.
      aria-label={ariaLabel ?? t(composeMessages.composer)}
      data-density={density}
      data-dragging={dragging || undefined}
      data-disabled={disabled || undefined}
      style={{ '--compose-gap': `var(--glacier-${metrics.gap})` } as CSSProperties}
      onSubmit={(event) => {
        event.preventDefault();
        send();
      }}
      onDragEnter={(event) => {
        event.preventDefault();
        if (disabled) return;
        dragDepth.current += 1;
        if (Array.from(event.dataTransfer?.types ?? []).includes('Files')) setDragging(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={() => {
        dragDepth.current = Math.max(dragDepth.current - 1, 0);
        if (dragDepth.current === 0) setDragging(false);
      }}
      onDrop={onDrop}
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

      <div className={styles.row}>
        {onFiles && (
          <>
            {/* A real file input, so the chooser, the keyboard route, and the
                accept filter are the platform's rather than reimplemented. */}
            <input
              ref={fileRef}
              type="file"
              className={styles.file}
              accept={accept}
              multiple
              tabIndex={-1}
              aria-hidden="true"
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                const chosen = Array.from(event.currentTarget.files ?? []);
                if (chosen.length > 0) addFiles(chosen);
                // Cleared so choosing the same file twice still fires a change.
                event.currentTarget.value = '';
              }}
            />
            <IconButton
              size={metrics.controlSize}
              variant="ghost"
              disabled={disabled}
              skeleton={skeleton}
              className={styles.control}
              aria-label={t(composeMessages.attach)}
              onClick={() => fileRef.current?.click()}
            >
              <Paperclip size={18} />
            </IconButton>
          </>
        )}

        <div className={styles.field}>
          <MentionAutocomplete
            open={popupOpen}
            query={token?.query ?? ''}
            trigger={token?.trigger ?? '@'}
            candidates={candidates ?? []}
            cursor={seatedCursor}
            onCursorChange={setCursor}
            onChoose={choose}
            listId={listId}
          />
          <MessageInput
            bare
            inputRef={inputRef}
            value={value}
            onValueChange={update}
            onSend={send}
            onKeyDown={onKeyDown}
            onCaretChange={setCaret}
            onPasteFiles={onFiles ? addFiles : undefined}
            enterPolicy={enterPolicy}
            minRows={minRows ?? metrics.minRows}
            maxRows={maxRows}
            size={metrics.controlSize}
            disabled={disabled}
            skeleton={skeleton}
            touch={touch}
            placeholder={placeholder ?? t(composeMessages.placeholder)}
            aria-label={ariaLabel ?? t(composeMessages.composer)}
            // The input owns the popup; focus never moves into it.
            role={popupOpen ? 'combobox' : undefined}
            aria-expanded={popupOpen || undefined}
            aria-controls={popupOpen ? listId : undefined}
            aria-activedescendant={popupOpen && matches[seatedCursor] ? `${listId}-${seatedCursor}` : undefined}
          />
        </div>

        <div className={styles.trailing}>
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
        </div>
      </div>
    </form>
  );
}
