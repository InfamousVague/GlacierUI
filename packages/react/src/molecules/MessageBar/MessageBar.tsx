import {
  attachmentKind,
  composerCanSend,
  composerKeyAction,
  composerSubmission,
  dimensionsFor,
  draftCount,
  draftMeter,
  unstageAttachment,
  type AttachmentKind,
  type ChatAttachment,
  type ComposerSubmission,
  type DraftMeter,
  type ReplyPreview,
} from '@glacier/logic';
// re-exported from packages/spec/src/index.ts.
import { composerSubmitModes, draftCountModes, messageBarSpec } from '@glacier/spec';
import { FileText, Image as ImageIcon, Play, Send, Volume2, X } from '@glacier/icons';
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx.ts';
import { useControlled } from '../../internal/useControlled.ts';
import { useT } from '../../i18n/LocaleProvider.tsx';
import { kitMessages } from '../../i18n/messages.ts';
import { IconButton } from '../../atoms/inputs/Button/IconButton.tsx';
import { Kbd } from '../../atoms/display/Typography/Kbd.tsx';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import { TypingIndicator } from './TypingIndicator.tsx';
import styles from './MessageBar.module.css';

// Derived from the spec so the unions cannot drift from the contract, exactly
// as Textarea derives its size from `textareaSizes`.
export type ComposerSubmitMode = (typeof composerSubmitModes)[number];
export type DraftCountMode = (typeof draftCountModes)[number];

export type { ComposerSubmission, ReplyPreview };

/** The spec's measurements, read once; a bare number passes through unwrapped. */
const DIMS = dimensionsFor(messageBarSpec);

function metric(value: string | undefined, fallback: string): string {
  const resolved = value ?? fallback;
  return /^[.\d]/.test(resolved) ? resolved : `var(--glacier-${resolved})`;
}

const VARS = {
  '--message-bar-radius': metric(DIMS.radius, 'radius-xl'),
  '--message-bar-padding-inline': metric(DIMS.paddingInline, 'space-2'),
  '--message-bar-padding-block': metric(DIMS.paddingBlock, 'space-2'),
  '--message-bar-gap': metric(DIMS.gap, 'space-2'),
  '--message-bar-stack-gap': metric(DIMS.stackGap, 'space-2'),
  '--message-bar-border': metric(DIMS.border, 'hairline'),
  '--message-bar-field-padding-inline': metric(DIMS.fieldPaddingInline, 'space-2'),
  '--message-bar-field-padding-block': metric(DIMS.fieldPaddingBlock, 'space-1'),
  // The field's own typography, published so the hidden twin reads the same
  // values rather than a second set of literals that could drift from these.
  '--message-bar-font-size': 'var(--glacier-font-size-sm)',
  '--message-bar-leading': 'var(--glacier-leading-sm)',
  '--message-bar-line': 'calc(var(--glacier-leading-sm) * var(--glacier-font-size-sm))',
} as CSSProperties;

/** The glyph a staged attachment gets, routed through the shared kind. */
const KIND_ICON: Record<AttachmentKind, typeof FileText> = {
  image: ImageIcon,
  video: Play,
  audio: Volume2,
  file: FileText,
};

/** What a replaced send control is told, so it stays as correct as the default. */
export interface MessageBarState {
  /** The draft as typed, untrimmed. */
  text: string;
  /** The single authority, the same one the key handler consults. */
  canSend: boolean;
  busy: boolean;
  disabled: boolean;
  submitMode: ComposerSubmitMode;
  /**
   * The draft against its budget. With no `maxLength` the draft is not counted
   * at all - counting graphemes on every keystroke to answer a question nobody
   * asked is waste - so `count` reads 0 and `state` reads `idle`.
   */
  meter: DraftMeter;
  attachments: ChatAttachment[];
  /** Sends, if it can. Calling it when `canSend` is false does nothing. */
  send: () => void;
}

/** What a staged-attachment renderer is told about the file it is drawing. */
export interface StagedAttachmentContext {
  attachment: ChatAttachment;
  /** Resolved through `attachmentKind`, so a staged voice note and a sent one agree. */
  kind: AttachmentKind;
  index: number;
  /** Unstages this file. Wired to the caller's `onAttachmentsChange`. */
  remove: () => void;
}

export interface MessageBarLabels {
  placeholder: string;
  send: string;
  attach: string;
  cancelReply: string;
  cancelEdit: string;
}

export interface MessageBarProps extends Omit<ComponentProps<'div'>, 'onSubmit' | 'children' | 'defaultValue'> {
  /** The draft, controlled. */
  value?: string;
  /** The initial draft when the bar owns its own state. */
  defaultValue?: string;
  /** Called with the next draft on every edit. */
  onValueChange?: (next: string) => void;
  /** Called with the trimmed text, the staged files, and the reply and edit ids. */
  onSend?: (submission: ComposerSubmission) => void;
  /** Which chord sends. */
  submitMode?: ComposerSubmitMode;
  /** Empty-field prompt; defaults to the translated kit string. */
  placeholder?: string;
  /** Rows the empty field shows. */
  minRows?: number;
  /** Rows the field grows to before it scrolls. */
  maxRows?: number;
  /** The character budget. Never applied as a `maxlength`; see the component doc. */
  maxLength?: number;
  /** What counts as a character, so the counter agrees with the server. */
  countAs?: DraftCountMode;
  /** The staged attachments, controlled. */
  attachments?: ChatAttachment[];
  /** Called with the next staged list after one is added or removed. */
  onAttachmentsChange?: (next: ChatAttachment[]) => void;
  /** Draws one staged attachment; receives its resolved kind and a remover. */
  renderAttachment?: (context: StagedAttachmentContext) => ReactNode;
  /** The message being answered, resolved by `replyPreview` rather than as markup. */
  replyTo?: ReplyPreview | null;
  /** Dismisses the reply banner. Its presence is what gives Escape a meaning. */
  onCancelReply?: () => void;
  /** The message being rewritten; travels with the send as `editingId`. */
  editingId?: string;
  /** Leaves edit mode. Its presence is what gives Escape a meaning. */
  onCancelEdit?: () => void;
  /** Who is typing, as display names. Never a pre-joined sentence. */
  typing?: string[];
  /** How many typist names the row has room for. */
  typingMax?: number;
  /** A send is already in flight. */
  busy?: boolean;
  /** A closed thread: nothing is editable and nothing goes out. */
  disabled?: boolean;
  /** Replaces the send control, receiving the live state. */
  renderSend?: (state: MessageBarState) => ReactNode;
  /** The leading slot, for an attachment or media control. */
  attach?: ReactNode;
  /** The trailing slot before the send control. */
  actions?: ReactNode;
  /** Shows the submit policy as visible keys. The spoken one is always present. */
  keyboardHint?: boolean;
  /** The frosted material, for a bar pinned over a scrolling transcript. */
  glass?: boolean;
  /** Hosts the bar in a `form`. Off by default; see the component doc. */
  asForm?: boolean;
  /** Forwarded to the textarea. Its `onKeyDown` runs first and can claim a key. */
  inputProps?: Omit<ComponentProps<'textarea'>, 'value' | 'defaultValue' | 'onChange'>;
  /** Translated strings, merged over the kit catalog. */
  labels?: Partial<MessageBarLabels>;
  /** Renders a placeholder at the bar's exact geometry. */
  skeleton?: boolean;
}

/**
 * The composer at the foot of a thread.
 *
 * Almost every decision here follows from one fact: Enter sends something that
 * cannot be recalled. So the key policy lives in @glacier/logic as a pure
 * function of four booleans rather than in this file, both bindings call it,
 * and the IME guard is its first line - because while an input method is open
 * every Enter belongs to the IME, and a composer that reads one as a send fires
 * a message on the way to the first kanji of a sentence.
 *
 * Two other refusals are worth stating, because both look like features:
 *
 * **There is no `maxlength`.** The attribute blocks keystrokes, truncates a
 * paste silently, and cuts an input method off mid-word. `maxLength` here
 * counts instead - through `Intl.Segmenter` by default, so a flag is one
 * character and not four - refuses to send while over, and lets the text stand.
 * Losing the end of what someone pasted is a worse failure than a message that
 * will not go yet.
 *
 * **There is no `canSend` override.** Sendability is `composerCanSend` in
 * commons, consulted by the key handler and by the send control's own disabled
 * state, so a draft of three spaces cannot get two different answers. An
 * attachment with no caption already sends, honestly, because that function
 * knows what an attachment is.
 *
 * The host is a `div`, not a `form`. Implicit submission applies to single-line
 * inputs only, so Enter in a textarea is hand-handled under either host, and
 * the landmark is not worth an invalid nested form the first time this bar is
 * dropped inside a page form. `asForm` is there for callers who want it.
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
  keyboardHint = false,
  glass = false,
  asForm = false,
  inputProps,
  labels,
  skeleton = false,
  className,
  style,
  ...rest
}: MessageBarProps) {
  const t = useT();
  const field = useRef<HTMLTextAreaElement>(null);
  const hintId = useId();
  const [draft, setDraft] = useControlled(value, defaultValue);
  const staged = attachments ?? EMPTY_ATTACHMENTS;

  const text: MessageBarLabels = {
    placeholder: t(kitMessages.messageBarPlaceholder),
    send: t(kitMessages.messageBarSend),
    attach: t(kitMessages.messageBarAttach),
    cancelReply: t(kitMessages.messageBarCancelReply),
    cancelEdit: t(kitMessages.messageBarCancelEdit),
    ...labels,
  };

  // Counting is the expensive part of a keystroke when the mode is graphemes,
  // so it is memoised on the two things that decide it.
  const meter = useMemo(
    () => draftMeter(maxLength === undefined ? 0 : draftCount(draft, countAs), maxLength),
    [draft, countAs, maxLength],
  );

  const canSend = composerCanSend({
    text: draft,
    attachments: staged.length,
    over: meter.state === 'over',
    busy,
    disabled,
  });

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
    onValueChange?.('');
    // Focus stays in the field. Blurring dismisses a mobile keyboard, and the
    // next message is usually seconds away.
    field.current?.focus();
  };

  const cancel = () => {
    // Edit mode is the more specific of the two, so it unwinds first. Neither
    // ever clears the draft: the browser's own undo does not reach a controlled
    // value, so a composer that emptied itself here would destroy text with no
    // way back.
    if (editingId !== undefined && onCancelEdit) return onCancelEdit();
    if (replyTo != null && onCancelReply) return onCancelReply();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // The caller's handler runs first, and a key it has already claimed skips
    // the submit policy entirely. This one line is what lets a mentions or
    // slash-command overlay swallow Enter later without this component changing.
    inputProps?.onKeyDown?.(event);
    if (event.defaultPrevented) return;

    const action = composerKeyAction(
      {
        key: event.key,
        shiftKey: event.shiftKey,
        metaKey: event.metaKey,
        ctrlKey: event.ctrlKey,
        altKey: event.altKey,
        // Both spellings of "an input method is composing", folded here at the
        // platform edge so the pure policy never learns about the deprecated
        // Android WebView keyCode. Do not delete the second: it is the only
        // signal some of those builds send.
        isComposing:
          event.nativeEvent.isComposing || (event.nativeEvent as { keyCode?: number }).keyCode === 229,
      },
      submitMode,
    );

    if (action === 'submit') {
      event.preventDefault();
      send();
      return;
    }
    if (action === 'cancel') cancel();
  };

  const changeAttachments = (next: ChatAttachment[]) => onAttachmentsChange?.(next);

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

  const hint =
    submitMode === 'enter'
      ? t(kitMessages.messageBarHintEnter)
      : t(kitMessages.messageBarHintModifier, { modifier: modifierWord() });

  // The key caps, composed here rather than in the JSX so the words come from
  // the catalog: a keyboard sold in one market does not always print what one
  // sold in another does.
  const enterCap = t(kitMessages.messageBarKeyEnter);
  const caps =
    submitMode === 'enter'
      ? { send: enterCap, newline: `${t(kitMessages.messageBarKeyShift)} + ${enterCap}` }
      : { send: `${modifierSymbol()} + ${enterCap}`, newline: enterCap };

  const announcement = useMeterAnnouncement(meter, t);

  if (skeleton) {
    return (
      <div className={cx(styles.composer, className)} style={{ ...VARS, ...style }} {...rest}>
        <Skeleton
          width="100%"
          height={`calc(var(--message-bar-line) * ${Math.max(1, minRows)} + var(--glacier-space-6))`}
          radius="var(--message-bar-radius)"
        />
      </div>
    );
  }

  const frame = (
    <>
      {(replyTo != null || editingId !== undefined) && (
        <div className={styles.banner}>
          <span className={styles.bannerText}>
            {editingId !== undefined ? (
              t(kitMessages.messageBarEditing)
            ) : replyTo?.authorName !== undefined ? (
              <>
                <span className={styles.bannerAuthor}>
                  {t(kitMessages.messageBarReplyingTo, { name: replyTo.authorName })}
                </span>{' '}
                {replyTo.text}
                {replyTo.truncated ? '…' : ''}
              </>
            ) : (
              <>
                {t(kitMessages.messageBarReplying)} {replyTo?.text}
                {replyTo?.truncated ? '…' : ''}
              </>
            )}
          </span>
          {(editingId !== undefined ? onCancelEdit : onCancelReply) && (
            <IconButton
              size="sm"
              aria-label={editingId !== undefined ? text.cancelEdit : text.cancelReply}
              onClick={editingId !== undefined ? onCancelEdit : onCancelReply}
            >
              <X size={14} />
            </IconButton>
          )}
        </div>
      )}

      {staged.length > 0 && (
        <ul className={styles.tray} aria-label={t(kitMessages.messageBarAttachments)}>
          {staged.map((attachment, index) => {
            const kind = attachmentKind(attachment.mimeType, attachment.fileName ?? attachment.url);
            const remove = () => changeAttachments(unstageAttachment(staged, attachment.id));
            const name = attachment.fileName ?? attachment.id;
            const Glyph = KIND_ICON[kind];
            return (
              <li key={attachment.id}>
                {renderAttachment ? (
                  renderAttachment({ attachment, kind, index, remove })
                ) : (
                  <span className={styles.chip} data-kind={kind}>
                    <Glyph size={14} aria-hidden="true" />
                    <span className={styles.chipName}>{name}</span>
                    <IconButton
                      size="sm"
                      // Named, not "Remove" five times over: a list of
                      // identically-labelled controls is a list nobody can
                      // navigate by name.
                      aria-label={t(kitMessages.messageBarRemoveAttachment, { name })}
                      onClick={remove}
                      disabled={disabled}
                    >
                      <X size={12} />
                    </IconButton>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <div className={styles.row}>
        {attach}
        {/* The twin carries the same text under the same typography, so the
            row is as tall as the taller of the two and nothing is measured. */}
        <div
          className={styles.grower}
          data-replicated-value={draft}
          style={
            {
              '--message-bar-min-rows': Math.max(1, minRows),
              '--message-bar-max-rows': Math.max(Math.max(1, minRows), maxRows),
            } as CSSProperties
          }
        >
          <textarea
            {...inputProps}
            ref={field}
            className={cx(styles.field, inputProps?.className)}
            rows={Math.max(1, minRows)}
            value={draft}
            placeholder={placeholder ?? text.placeholder}
            disabled={disabled}
            aria-label={inputProps?.['aria-label'] ?? t(kitMessages.messageBarLabel)}
            // The policy is spoken whether or not it is drawn. Enter here is
            // irreversible and invisible, and the person least likely to have
            // found it by accident is the one who never sees a hint.
            aria-describedby={cx(hintId, inputProps?.['aria-describedby'])}
            onChange={(event) => {
              setDraft(event.target.value);
              onValueChange?.(event.target.value);
            }}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Absent until the budget starts to matter: a number that changed on
            every keystroke would be noise on screen and a firehose in the
            live region below. */}
        {meter.state !== 'idle' && meter.max !== undefined && (
          <span className={styles.meter} data-state={meter.state}>
            {t(kitMessages.messageBarCount, { count: meter.count, max: meter.max })}
          </span>
        )}

        {actions}

        {renderSend ? (
          renderSend(state)
        ) : (
          <IconButton
            variant="solid"
            aria-label={text.send}
            // The same authority the key handler consults; deriving it twice
            // is how the button and Enter start disagreeing.
            disabled={!canSend}
            onClick={send}
            {...(asForm ? { type: 'submit' as const } : {})}
          >
            <Send size={16} />
          </IconButton>
        )}
      </div>

      {keyboardHint && (
        // The visible half of the policy, and only the visible half: the
        // spoken one below is present whether or not this is drawn, so
        // hiding this from the accessibility tree loses nothing.
        <span className={styles.hint} aria-hidden="true">
          <Kbd>{caps.send}</Kbd>
          <Kbd>{caps.newline}</Kbd>
        </span>
      )}

      <span id={hintId} className={styles.srOnly}>
        {hint}
      </span>

      {/* Only a threshold crossing, never a running count. The transcript is
          already a polite live region that announces an in-flight send and a
          failure; saying the same things here would double-speak them. */}
      <span className={styles.srOnly} role="status" aria-live="polite">
        {announcement}
      </span>
    </>
  );

  return (
    <div
      className={cx(styles.composer, className)}
      style={{ ...VARS, ...style }}
      data-submit-mode={submitMode}
      data-meter={meter.state}
      data-busy={busy || undefined}
      data-disabled={disabled || undefined}
      data-glass={glass || undefined}
      data-editing={editingId === undefined ? undefined : ''}
      data-replying={replyTo == null ? undefined : ''}
      {...rest}
    >
      {/* Above the bar, where every chat client puts it: a row that appeared
          under the composer would push the send control away from the thumb
          already travelling toward it. */}
      {typing !== undefined && typing.length > 0 && <TypingIndicator names={typing} max={typingMax} />}

      {/* Two hosts rather than one dynamic tag, so neither branch has to widen
          its props to the union of a form's and a div's. */}
      {asForm ? (
        <form
          className={styles.bar}
          onSubmit={(event) => {
            event.preventDefault();
            send();
          }}
        >
          {frame}
        </form>
      ) : (
        <div className={styles.bar}>{frame}</div>
      )}
    </div>
  );
}

/** A stable empty list, so an uncontrolled bar does not re-render on identity. */
const EMPTY_ATTACHMENTS: ChatAttachment[] = [];

/**
 * The announcement for a budget that just changed footing.
 *
 * Keyed on the meter's STATE, not its count: a live readout of every keystroke
 * is the single most common way a well-meant live region becomes unusable.
 */
function useMeterAnnouncement(meter: DraftMeter, t: ReturnType<typeof useT>): string {
  const [announcement, setAnnouncement] = useState('');
  const previous = useRef(meter.state);
  const remaining = meter.remaining ?? 0;

  useEffect(() => {
    if (meter.state === previous.current) return;
    previous.current = meter.state;
    if (meter.state === 'over') setAnnouncement(t(kitMessages.messageBarOver, { over: -remaining }));
    else if (meter.state === 'near') setAnnouncement(t(kitMessages.messageBarRemaining, { remaining }));
    else setAnnouncement('');
  }, [meter.state, remaining, t]);

  return announcement;
}

/**
 * Which modifier this platform calls the send key, in words a screen reader can
 * say. The symbol version is for the visible hint only, where a glyph reads
 * faster than a word.
 */
function isApple(): boolean {
  if (typeof navigator === 'undefined') return false;
  const platform = (navigator as { platform?: string }).platform ?? '';
  return /Mac|iPhone|iPad|iPod/.test(platform || navigator.userAgent);
}

function modifierWord(): string {
  return isApple() ? 'Command' : 'Control';
}

function modifierSymbol(): string {
  return isApple() ? '⌘' : 'Ctrl';
}
