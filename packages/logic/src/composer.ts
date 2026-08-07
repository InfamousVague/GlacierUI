/**
 * Compose rules - everything a message bar decides before a character is drawn.
 *
 * `chat.ts` owns the transcript that has already happened and `message.ts` owns
 * how one message is drawn. This module owns the other end of the thread: the
 * draft the reader has not sent yet, and the handful of decisions that turn a
 * keystroke into either a newline or an irreversible send.
 *
 * The Enter policy is the reason this file exists rather than living in the DOM
 * binding. It is the single most destructive decision in a chat client - get it
 * wrong and half a thought goes out to a colleague - and it is decided from four
 * booleans on a key event. Written twice, the two platforms drift on the one
 * case nobody tests (the IME guard), and the drift is invisible until someone
 * typing Japanese sends a message every time they commit a candidate.
 *
 * Nothing here renders, measures, or reads a `window`. Auto-grow in particular
 * is deliberately absent: the DOM reaches its height with a replicated twin and
 * no measurement at all, and React Native reaches the same height through
 * `onContentSizeChange`, so `minRows` and `maxRows` travel as plain numbers and
 * each binding spends them in its own idiom. A shared "measure the text" helper
 * would be a DOM function with a native caller that could not use it.
 */

import { attachmentKind, type ChatAttachment, type ChatMessage } from './chat.ts';

// ---- the submit policy ------------------------------------------------------

/**
 * Which chord sends.
 *
 * - `enter` - Enter sends, Shift plus Enter opens a line. The desktop chat
 *   convention, and what a keyboard-first user expects.
 * - `modifier` - Command or Control plus Enter sends, a bare Enter opens a
 *   line. What a long-form composer (a support reply, a review) wants, and what
 *   a touch keyboard wants, because a soft keyboard's return key is the only
 *   way to reach a new paragraph.
 *
 * Exported as a const array so the spec and both bindings derive one enum
 * instead of each transcribing the same two words.
 */
export const composerSubmitModes = ['enter', 'modifier'] as const;

export type ComposerSubmitMode = (typeof composerSubmitModes)[number];

/**
 * The subset of a key event the policy reads, declared structurally so this
 * module never imports React or React Native.
 *
 * `isComposing` is the load-bearing field. While an input method is open, every
 * Enter belongs to the IME - it commits a candidate - and a composer that reads
 * it as a send fires a message on the way to the first kanji of the sentence.
 * The DOM's `KeyboardEvent.isComposing` and the legacy `keyCode === 229` are
 * both folded into this one flag at the platform edge, so the policy itself
 * stays a pure function of four booleans.
 */
export interface ComposerKeyEvent {
  key: string;
  shiftKey?: boolean;
  metaKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
  /** An input method is mid-composition, so this key is the IME's, not ours. */
  isComposing?: boolean;
}

/**
 * What a key should do in a composer.
 *
 * `ignore` rather than `undefined` so a binding's switch is exhaustive and a
 * new action cannot be silently dropped by a missing branch.
 */
export type ComposerKeyAction = 'submit' | 'newline' | 'cancel' | 'ignore';

/**
 * The whole Enter policy, in one pure function.
 *
 * Read in order, because the order is the argument:
 *
 * 1. **Composition wins outright.** Not "unless Shift is held", not "unless the
 *    draft is empty" - while an IME is open the keystroke was never ours to
 *    interpret.
 * 2. **Escape cancels**, and only ever cancels a mode: a reply banner or an
 *    edit. It never clears the draft. The browser's own undo does not reach a
 *    React-controlled value, so a composer that emptied itself on Escape would
 *    be destroying text with no way back.
 * 3. **Alt plus Enter is always a newline.** It is the one chord that means the
 *    same thing in every mode, and a user who has learned it should not have to
 *    know which mode the bar is in.
 * 4. **Then the mode decides.** In `enter`, a bare Enter submits and any
 *    modifier opens a line; in `modifier`, only Command or Control plus Enter
 *    submits and everything else opens a line.
 *
 * Every other key returns `ignore`, which is how a binding knows to leave the
 * event alone rather than calling `preventDefault` on ordinary typing.
 */
export function composerKeyAction(
  event: ComposerKeyEvent,
  mode: ComposerSubmitMode = 'enter',
): ComposerKeyAction {
  if (event.isComposing === true) return 'ignore';
  if (event.key === 'Escape') return 'cancel';
  if (event.key !== 'Enter') return 'ignore';
  if (event.altKey === true) return 'newline';

  const modified = event.metaKey === true || event.ctrlKey === true;
  if (mode === 'modifier') return modified ? 'submit' : 'newline';
  return event.shiftKey === true || modified ? 'newline' : 'submit';
}

/**
 * The submit mode a pointer type would choose, for a caller who wants to opt in.
 *
 * Deliberately not the default. Reading the environment makes the most
 * destructive behaviour in the component non-deterministic: it mis-resolves on
 * a touchscreen laptop, flips mid-session when an iPad meets a keyboard, and
 * leaves a docs example, a test, and the user's own screen disagreeing about
 * what Enter does. A caller who knows their platform can pass the result of
 * this; the component itself starts at `enter` and stays there.
 */
export function composerSubmitModeFor(pointer: 'coarse' | 'fine'): ComposerSubmitMode {
  return pointer === 'coarse' ? 'modifier' : 'enter';
}

// ---- counting --------------------------------------------------------------

/**
 * What a character is, for the purpose of a limit.
 *
 * The three answers disagree by a lot on exactly the text people paste into
 * chat. A flag is one grapheme, two code points, and four UTF-16 units; a
 * family emoji can be seven, eleven, and eleven. So the mode is a prop rather
 * than a decision: the counter has to agree with whatever the server actually
 * enforces, and only the caller knows which that is.
 *
 * - `graphemes` - what a person would call a character. The honest default.
 * - `codePoints` - `[...text].length`, what most modern APIs count.
 * - `utf16` - `text.length`, what a `varchar` column and most older APIs count.
 */
export const draftCountModes = ['graphemes', 'codePoints', 'utf16'] as const;

export type DraftCountMode = (typeof draftCountModes)[number];

/**
 * Counts a draft.
 *
 * `Intl.Segmenter` is the only correct way to count graphemes and it is absent
 * from older engines, so its absence degrades to code points rather than
 * throwing: an off-by-a-little count on one old browser is a far better failure
 * than a composer that will not render.
 */
export function draftCount(text: string, mode: DraftCountMode = 'graphemes'): number {
  if (mode === 'utf16') return text.length;
  if (mode === 'codePoints') return [...text].length;

  const Segmenter = (Intl as { Segmenter?: new (locale?: string, options?: { granularity: string }) => { segment(input: string): Iterable<unknown> } }).Segmenter;
  if (Segmenter === undefined) return [...text].length;
  let count = 0;
  for (const _ of new Segmenter(undefined, { granularity: 'grapheme' }).segment(text)) count += 1;
  return count;
}

/**
 * How a draft stands against its limit.
 *
 * Three states rather than a raw number because the counter should not be a
 * live readout. A number that changes on every keystroke is noise on screen and
 * a firehose in a live region; what a writer needs is the moment the budget
 * starts to matter and the moment it is gone. Bindings announce on a transition
 * between these, not on a change of `count`.
 */
export const draftMeterStates = ['idle', 'near', 'over'] as const;

export type DraftMeterState = (typeof draftMeterStates)[number];

export interface DraftMeter {
  count: number;
  /** Undefined when the draft has no limit; `state` is then always `idle`. */
  max?: number;
  /** `max - count`, negative once over. Undefined with no limit. */
  remaining?: number;
  state: DraftMeterState;
}

/**
 * The share of the budget that has to be spent before the counter speaks.
 *
 * Ten percent left, not a fixed number of characters: a 280-character limit and
 * a 4000-character one want warnings at very different distances, and a fixed
 * threshold is either constant nagging on the short one or a useless
 * last-second warning on the long one.
 */
export const DRAFT_NEAR_LIMIT = 0.9;

/** Resolves a draft against its limit. */
export function draftMeter(count: number, max?: number): DraftMeter {
  if (max === undefined || !Number.isFinite(max) || max <= 0) return { count, state: 'idle' };
  const remaining = max - count;
  const state: DraftMeterState = remaining < 0 ? 'over' : count >= max * DRAFT_NEAR_LIMIT ? 'near' : 'idle';
  return { count, max, remaining, state };
}

// ---- sendability -----------------------------------------------------------

/** Everything that decides whether the send control is live. */
export interface ComposerSendability {
  /** The draft as typed. Trimmed here, so the caller never has to remember to. */
  text: string;
  /** How many files are staged. An attachment is a message on its own. */
  attachments?: number;
  /** The draft is over its limit. */
  over?: boolean;
  /** A send is already in flight. */
  busy?: boolean;
  disabled?: boolean;
}

/**
 * Whether this draft can go out - the single authority, consulted by both the
 * key handler and the send control's own disabled state.
 *
 * Deriving it twice is how a draft of three spaces gets two different answers:
 * the button greys out and Enter still fires, or the reverse. There is
 * deliberately no `canSend` override prop in either binding, because an
 * override that can lie about emptiness is worth less than the one feature it
 * would buy - and a photo with no caption is already covered here, honestly,
 * by counting the attachments.
 */
export function composerCanSend({
  text,
  attachments = 0,
  over = false,
  busy = false,
  disabled = false,
}: ComposerSendability): boolean {
  if (disabled || busy || over) return false;
  return text.trim() !== '' || attachments > 0;
}

/**
 * What a send hands back.
 *
 * One object rather than a bare string, because a reply and an edit are part of
 * what is being sent. A composer whose `onSend` takes only text forces the app
 * to read its own "replying to" state after the callback fires, and that is
 * precisely the race that answers the wrong message: the banner has already
 * been cleared by the same interaction that sent.
 */
export interface ComposerSubmission {
  /** The draft, trimmed. Never the raw value, and never empty when attachments are. */
  text: string;
  /** The staged attachments, in order. Empty rather than undefined. */
  attachments: ChatAttachment[];
  /** The message this one answers, when the reply banner was up. */
  replyToId?: string;
  /** The message being rewritten, when the bar was in edit mode. */
  editingId?: string;
}

/** Builds the submission a send should carry, with the trim applied once. */
export function composerSubmission(
  text: string,
  options: { attachments?: ChatAttachment[]; replyToId?: string; editingId?: string } = {},
): ComposerSubmission {
  const { attachments = [], replyToId, editingId } = options;
  return {
    text: text.trim(),
    attachments,
    ...(replyToId === undefined ? {} : { replyToId }),
    ...(editingId === undefined ? {} : { editingId }),
  };
}

// ---- staged attachments -----------------------------------------------------

/**
 * Adds attachments to the staged list, by id.
 *
 * De-duplicates because a file picker re-opened on the same file, a re-drop of
 * a dragged image, and a paste of a clipboard image the user already attached
 * are all ordinary, and a list holding the same id twice renders two chips that
 * one removal cannot clear. `max` truncates rather than rejecting: the user
 * asked for these files and the ones that fit should still be staged.
 */
export function stageAttachments(
  current: ChatAttachment[],
  incoming: ChatAttachment[],
  max?: number,
): ChatAttachment[] {
  const seen = new Set(current.map((a) => a.id));
  const next = [...current];
  for (const attachment of incoming) {
    if (seen.has(attachment.id)) continue;
    seen.add(attachment.id);
    next.push(attachment);
  }
  return max === undefined || max < 0 ? next : next.slice(0, max);
}

/** Removes one staged attachment by id, leaving the rest in order. */
export function unstageAttachment(current: ChatAttachment[], id: string): ChatAttachment[] {
  return current.filter((attachment) => attachment.id !== id);
}

// ---- what the bar says ------------------------------------------------------

/**
 * Everything a composer says out loud.
 *
 * Shared for the same reason `MessageLabels` is: two label sets would let the
 * DOM bar and the native one describe the same control differently, and the
 * submit hint in particular is a promise about what a keypress will do. The DOM
 * kit overlays its translation catalog on top of these; a native app passes its
 * own.
 */
export interface ComposerLabels {
  /** Accessible name for the field itself. */
  label: string;
  placeholder: string;
  send: string;
  attach: string;
  /** Names the staged tray as a list. */
  attachments: string;
  /** Takes `{name}`, so five remove controls are not all called "Remove". */
  removeAttachment: string;
  /** Takes `{name}`. */
  replyingTo: string;
  /** Used when the quoted message's author has not resolved. */
  replying: string;
  cancelReply: string;
  editing: string;
  cancelEdit: string;
  /** The spoken submit policy in `enter` mode. */
  hintEnter: string;
  /** The spoken submit policy in `modifier` mode; takes `{modifier}`. */
  hintModifier: string;
  /** The counter, taking `{count}` and `{max}`. */
  count: string;
}

/** English fallbacks, so a binding with no catalog is still legible. */
export const defaultComposerLabels: ComposerLabels = {
  label: 'Message',
  placeholder: 'Write a message',
  send: 'Send',
  attach: 'Add attachment',
  attachments: 'Attachments',
  removeAttachment: 'Remove {name}',
  replyingTo: 'Replying to {name}',
  replying: 'Replying to a message',
  cancelReply: 'Cancel reply',
  editing: 'Editing a message',
  cancelEdit: 'Cancel editing',
  hintEnter: 'Press Enter to send, Shift plus Enter for a new line',
  hintModifier: 'Press {modifier} plus Enter to send, Enter for a new line',
  count: '{count} of {max}',
};

// ---- the reply banner -------------------------------------------------------

/**
 * The quoted strip above the field, resolved rather than handed over as markup.
 *
 * A `ReactNode` here would push the strip to the app, and then two apps and two
 * platforms draw the same preview three different ways - and, worse, route
 * around `attachmentKind`, so a voice note quoted in the composer and the same
 * voice note in the transcript get called different things.
 */
export interface ReplyPreview {
  /** The message being answered. Travels with the send as `replyToId`. */
  id: string;
  /** Who wrote it, already resolved to a display name by the caller. */
  authorName?: string;
  /** The excerpt, already cut to `REPLY_PREVIEW_LIMIT`. */
  text: string;
  /** Set when the quoted message was media rather than words. */
  kind?: 'image' | 'video' | 'audio' | 'file';
  /** True when the excerpt was cut, so a binding can add its own ellipsis. */
  truncated: boolean;
}

/**
 * How much of a quoted message survives.
 *
 * One line at a comfortable reading width. The preview exists to say *which*
 * message is being answered, not to re-read it, and a banner that grows to
 * three lines has taken the composer's space to repeat something already on
 * screen a moment above.
 */
export const REPLY_PREVIEW_LIMIT = 120;

/**
 * Resolves the message being answered into the strip the bar draws.
 *
 * Whitespace is collapsed before the cut: a quoted stack trace or a pasted poem
 * is one line here whatever the newlines said, and collapsing after truncating
 * would spend the budget on the newlines themselves.
 */
export function replyPreview(
  message: Pick<ChatMessage, 'id' | 'text' | 'attachments'>,
  options: { authorName?: string; limit?: number } = {},
): ReplyPreview {
  const { authorName, limit = REPLY_PREVIEW_LIMIT } = options;
  const flat = (message.text ?? '').replace(/\s+/g, ' ').trim();
  const truncated = flat.length > limit;
  const first = message.attachments?.[0];
  return {
    id: message.id,
    ...(authorName === undefined ? {} : { authorName }),
    text: truncated ? flat.slice(0, limit).trimEnd() : flat,
    ...(first === undefined ? {} : { kind: attachmentKind(first.mimeType, first.fileName ?? first.url) }),
    truncated,
  };
}

