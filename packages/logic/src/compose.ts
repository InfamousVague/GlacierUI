/**
 * Compose-bar logic — every decision a message composer makes that is not a
 * pixel: when send is allowed, how tall the field grows, what Enter does, how a
 * pending attachment moves through its life, where an @-token starts, and when
 * a held recording has been slid far enough to be thrown away.
 *
 * All of it is here rather than in a binding because both bindings need the same
 * answers, and the ones that most obviously "belong to the platform" are exactly
 * the ones that drift: a DOM composer that sends on Enter and a phone composer
 * that writes a newline are not two behaviours, they are one policy resolved
 * against one fact about the device (`resolveEnterPolicy`). The DOM decides the
 * fact; the policy lives here.
 *
 * Pure TypeScript: no DOM, no react-native. Files are described structurally
 * (`ComposeFileLike`) so the same screening runs over a browser `File` and a
 * device document-picker result without either type reaching this package.
 */

import { fileUploadRejectionReasons } from '@glacier/spec';
import { matchCommands, type CommandDescriptor, type CommandMatch } from './command-palette.ts';
// TODO(integration): switch to '@glacier/spec' once the compose specs are registered in packages/spec/src/index.ts.
import type { composeEnterPolicies, messageInputSpec } from '../../spec/src/components/message-input.ts';
import type { sendButtonStates } from '../../spec/src/components/send-button.ts';
import type { composeAttachmentStatuses } from '../../spec/src/components/attachment-tray.ts';
import type { characterCounterLevels } from '../../spec/src/components/character-counter.ts';
import type { voiceRecorderStates } from '../../spec/src/components/voice-recorder.ts';
import type { composeBarDensities, composeBlockReasons } from '../../spec/src/components/compose-bar.ts';
import type { mentionTriggers } from '../../spec/src/components/mention-autocomplete.ts';

export type ComposeEnterPolicy = (typeof composeEnterPolicies)[number];
export type SendButtonState = (typeof sendButtonStates)[number];
export type ComposeAttachmentStatus = (typeof composeAttachmentStatuses)[number];
export type CharacterCounterLevel = (typeof characterCounterLevels)[number];
export type VoiceRecorderState = (typeof voiceRecorderStates)[number];
export type ComposeDensity = (typeof composeBarDensities)[number];
export type ComposeBlockReason = (typeof composeBlockReasons)[number];
export type MentionTrigger = (typeof mentionTriggers)[number];

/** Marks `messageInputSpec` as referenced for the integration TODO above. */
export type ComposeSpecs = typeof messageInputSpec;

const clamp = (n: number, min: number, max: number): number => (n < min ? min : n > max ? max : n);
const clamp01 = (n: number): number => (Number.isFinite(n) ? clamp(n, 0, 1) : 0);

// ---- the Enter-key policy --------------------------------------------------

/** What a key event means to a composer. */
export type ComposeKeyIntent = 'send' | 'newline' | 'none';

/** The parts of a key event the policy reads. Both platforms can supply these. */
export interface ComposeKeyEvent {
  key: string;
  shiftKey?: boolean;
  metaKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
  /**
   * True while an input-method editor has an open composition. Sending on this
   * key would truncate the word being written — in Japanese and Chinese the
   * first Enter commits the IME candidate and never means "send".
   */
  isComposing?: boolean;
}

/**
 * Resolves `auto` against the device.
 *
 * `auto` is the only default that is right in both places a kit component
 * lands. On a keyboard, Enter sends: the hands are already there and reaching
 * for a button is the slow path. On a touch keyboard, Enter must write a
 * newline, because the return key is under the thumb and a mistyped send cannot
 * be taken back — there the send button is the send affordance. The binding
 * supplies the fact (`touch`); this decides what to do with it, so the two
 * platforms cannot disagree about what `auto` meant.
 */
export function resolveEnterPolicy(
  policy: ComposeEnterPolicy | undefined,
  env: { touch: boolean },
): Exclude<ComposeEnterPolicy, 'auto'> {
  if (policy === 'send' || policy === 'newline') return policy;
  return env.touch ? 'newline' : 'send';
}

/**
 * What a key press means, given the resolved policy.
 *
 * Two rules hold under every policy, because a user who learned them on one
 * device should not find them dead on another: Shift+Enter is always a newline,
 * and Cmd/Ctrl+Enter is always send. The bare Enter is the only key the policy
 * actually decides.
 */
export function composeKeyIntent(
  event: ComposeKeyEvent,
  policy: Exclude<ComposeEnterPolicy, 'auto'>,
): ComposeKeyIntent {
  if (event.key !== 'Enter') return 'none';
  // An open composition owns the key outright: neither branch below may run.
  if (event.isComposing) return 'none';
  if (event.metaKey || event.ctrlKey) return 'send';
  if (event.shiftKey || event.altKey) return 'newline';
  return policy === 'send' ? 'send' : 'newline';
}

// ---- auto-grow geometry ----------------------------------------------------

export interface AutoGrowInput {
  /**
   * The height the content currently wants, in CSS pixels — `scrollHeight` on
   * the DOM, the reported content size on a device. Undefined before the first
   * measurement, which resolves to the minimum.
   */
  contentHeight?: number;
  /** One line of text, in CSS pixels. */
  lineHeight: number;
  /** Everything that is not text: vertical padding plus borders, in CSS pixels. */
  chrome?: number;
  minRows?: number;
  maxRows?: number;
}

export interface AutoGrowMetrics {
  /** Height before anything is typed. */
  minHeight: number;
  /** The cap; past it the field scrolls instead of growing. */
  maxHeight: number;
  /** What the field should be right now. */
  height: number;
  /** Whether the content has outgrown the cap and the field is now scrolling. */
  scrolls: number extends never ? never : boolean;
}

/**
 * Turns a row range into pixel heights.
 *
 * Rows, not pixels, are the authored unit: a cap written as "160px" is six lines
 * at one font size and three at another, so it breaks the moment the density or
 * the text scale moves. Rows survive both. The arithmetic is here so the DOM's
 * `scrollHeight` path and the device's content-size path land on the same
 * number instead of each rounding its own way.
 */
export function autoGrowMetrics({
  contentHeight,
  lineHeight,
  chrome = 0,
  minRows = 1,
  maxRows = 6,
}: AutoGrowInput): AutoGrowMetrics {
  const min = Math.max(1, Math.floor(minRows));
  const max = Math.max(min, Math.floor(maxRows));
  const minHeight = min * lineHeight + chrome;
  const maxHeight = max * lineHeight + chrome;
  const wanted = contentHeight === undefined || !Number.isFinite(contentHeight) ? minHeight : contentHeight;
  return {
    minHeight,
    maxHeight,
    height: clamp(wanted, minHeight, maxHeight),
    // A hair of slack: a browser's fractional scrollHeight otherwise reports a
    // scrollbar on a field that exactly fits its cap.
    scrolls: wanted > maxHeight + 0.5,
  };
}

// ---- attachments -----------------------------------------------------------

/** Why a file was refused, reusing FileUpload's vocabulary unchanged. */
export type ComposeRejectionReason = (typeof fileUploadRejectionReasons)[number];

/** The little a composer needs to know about a file; a DOM File satisfies it. */
export interface ComposeFileLike {
  name: string;
  /** MIME type; may be empty, which only an extension rule can then accept. */
  type?: string;
  size?: number;
}

export interface ComposeRejection<F extends ComposeFileLike = ComposeFileLike> {
  file: F;
  reason: ComposeRejectionReason;
}

/** One file on its way into a message. */
export interface ComposeAttachment {
  id: string;
  name: string;
  size?: number;
  status: ComposeAttachmentStatus;
  /** Upload fraction 0..1; only meaningful while uploading. */
  progress?: number;
  /** Why it failed; shown in place of the size. */
  error?: string;
}

/** The moves an attachment can be asked to make. */
export type ComposeAttachmentEvent = 'start' | 'progress' | 'succeed' | 'fail' | 'retry' | 'cancel';

/**
 * The only legal moves. Everything not listed is refused rather than silently
 * applied — a `progress` arriving after a `cancel` is a race, not an update, and
 * a tray that accepted it would resurrect a chip the user already dismissed.
 */
const ATTACHMENT_MOVES: Record<
  ComposeAttachmentStatus,
  Partial<Record<ComposeAttachmentEvent, ComposeAttachmentStatus>>
> = {
  pending: { start: 'uploading', succeed: 'complete', fail: 'failed', cancel: 'canceled' },
  uploading: { progress: 'uploading', succeed: 'complete', fail: 'failed', cancel: 'canceled' },
  complete: { cancel: 'canceled' },
  failed: { retry: 'uploading', cancel: 'canceled' },
  // Terminal on purpose: the owner drops canceled attachments from its list.
  canceled: {},
};

/** Whether an event is legal in the current status. */
export function canAdvanceAttachment(status: ComposeAttachmentStatus, event: ComposeAttachmentEvent): boolean {
  return ATTACHMENT_MOVES[status][event] !== undefined;
}

/**
 * Applies one event to one attachment.
 *
 * Returns the SAME object when the move is illegal, so a reducer can bail with
 * a reference check instead of re-rendering a tray that did not change.
 */
export function advanceAttachment(
  attachment: ComposeAttachment,
  event: ComposeAttachmentEvent,
  patch: { progress?: number; error?: string } = {},
): ComposeAttachment {
  const next = ATTACHMENT_MOVES[attachment.status][event];
  if (next === undefined) return attachment;

  const moved: ComposeAttachment = { ...attachment, status: next };
  if (patch.progress !== undefined) moved.progress = clamp01(patch.progress);
  switch (event) {
    case 'start':
      moved.progress = patch.progress === undefined ? 0 : moved.progress;
      break;
    case 'succeed':
      // A finished upload reads 100%, whatever the last frame happened to say.
      moved.progress = 1;
      delete moved.error;
      break;
    case 'fail':
      moved.error = patch.error ?? attachment.error;
      break;
    case 'retry':
      // A retry starts over: keeping the old bar and the old error would claim
      // progress the new attempt has not made.
      moved.progress = 0;
      delete moved.error;
      break;
    default:
      break;
  }
  return moved;
}

const SIZE_UNITS = ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte'] as const;

/**
 * A byte count as a short, locale-aware size (`1.2 MB`).
 *
 * Decimal units, not binary: a phone that reports a 1.2 MB photo and a composer
 * that calls the same file 1.1 MiB look like a bug. Intl carries the unit name,
 * so the abbreviation is translated rather than hard-coded English.
 */
export function formatBytes(bytes: number, locale = 'en'): string {
  let value = Math.max(0, bytes);
  let unit = 0;
  while (value >= 1000 && unit < SIZE_UNITS.length - 1) {
    value /= 1000;
    unit += 1;
  }
  return new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: SIZE_UNITS[unit],
    unitDisplay: 'short',
    maximumFractionDigits: unit === 0 || value >= 10 ? 0 : 1,
  }).format(value);
}

/**
 * Splits a file name so the middle can be elided and the extension survives —
 * `presentation-final-v4.key` must not truncate to `presentation-fi…`, because
 * the type is the part the user is scanning for.

/** Attachments still in flight — the ones send waits for. */
export function attachmentsInFlight(attachments: readonly ComposeAttachment[]): ComposeAttachment[] {
  return attachments.filter((a) => a.status === 'pending' || a.status === 'uploading');
}

/** Attachments that would actually ride along with the message. */
export function sendableAttachments(attachments: readonly ComposeAttachment[]): ComposeAttachment[] {
  return attachments.filter((a) => a.status !== 'canceled');
}

/** Does the file pass an accept string? Mirrors FileUpload's native semantics. */
function acceptsFile(file: ComposeFileLike, accept: string | undefined): boolean {
  if (!accept) return true;
  const name = file.name.toLowerCase();
  const type = (file.type ?? '').toLowerCase();
  return accept
    .split(',')
    .map((rule) => rule.trim().toLowerCase())
    .filter((rule) => rule.length > 0)
    .some((rule) => {
      if (rule.startsWith('.')) return name.endsWith(rule);
      if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, -1));
      return type === rule;
    });
}

/**
 * Screens incoming files exactly as FileUpload does — type, then size, then
 * count, first failure wins, one reason per file — so a file pasted into the
 * composer is refused for the same reason it would be refused by the dropzone,
 * with the same word.
 */
export function screenFiles<F extends ComposeFileLike>(
  files: readonly F[],
  options: { accept?: string; maxSize?: number; maxFiles?: number; current?: number } = {},
): { accepted: F[]; rejections: ComposeRejection<F>[] } {
  const { accept, maxSize, maxFiles, current = 0 } = options;
  const capacity = maxFiles === undefined ? Number.POSITIVE_INFINITY : Math.max(maxFiles - current, 0);
  const accepted: F[] = [];
  const rejections: ComposeRejection<F>[] = [];
  for (const file of files) {
    if (!acceptsFile(file, accept)) rejections.push({ file, reason: 'type' });
    else if (maxSize !== undefined && (file.size ?? 0) > maxSize) rejections.push({ file, reason: 'size' });
    else if (accepted.length >= capacity) rejections.push({ file, reason: 'count' });
    else accepted.push(file);
  }
  return { accepted, rejections };
}

// ---- send enablement -------------------------------------------------------

export interface ComposeSendInput {
  text: string;
  attachments?: readonly ComposeAttachment[];
  /** A send is already in flight. */
  sending?: boolean;
  /** The last send failed; the control is now the retry. */
  failed?: boolean;
  /** Character cap; zero or absent means no cap. */
  limit?: number;
  disabled?: boolean;
}

/** Whether send may run, and if not, which fix the user needs. */
export type ComposeSendPermission =
  | { allowed: true; reason?: undefined }
  | { allowed: false; reason: ComposeBlockReason };

/**
 * THE send rule, in one place.
 *
 * There is something to send when the trimmed text is non-empty or at least one
 * attachment survives; a message that is only whitespace is not a message. An
 * upload still running blocks send rather than racing it, because a message that
 * arrives before its picture is a message with a broken picture. Over the limit
 * blocks too, and is reported ahead of an upload: the user has to act on the
 * limit, whereas the upload finishes on its own.
 *
 * A failed send does NOT block: the control has become the retry, and refusing
 * the retry would strand the message.
 */
export function canSendCompose({
  text,
  attachments = [],
  sending = false,
  failed: _failed = false,
  limit,
  disabled = false,
}: ComposeSendInput): ComposeSendPermission {
  if (disabled) return { allowed: false, reason: 'disabled' };
  if (sending) return { allowed: false, reason: 'sending' };

  const live = sendableAttachments(attachments);
  if (text.trim().length === 0 && live.length === 0) return { allowed: false, reason: 'empty' };
  if (limit !== undefined && limit > 0 && countCharacters(text) > limit)
    return { allowed: false, reason: 'over-limit' };
  if (attachmentsInFlight(live).length > 0) return { allowed: false, reason: 'uploading' };
  return { allowed: true };
}

/**
 * The send control's visual state. `empty` is every refused case, not only a
 * blank field — the control looks the same whichever fix is outstanding, while
 * `canSendCompose`'s reason is what its label says.
 */
export function composeSendState(input: ComposeSendInput): SendButtonState {
  if (input.sending) return 'sending';
  if (input.failed) return 'failed';
  return canSendCompose(input).allowed ? 'ready' : 'empty';
}

// ---- the character counter -------------------------------------------------

/**
 * Counts what a user would call characters: code points, so one emoji is one
 * character rather than the two UTF-16 units `length` reports. A counter that
 * charges two for 😀 is a counter people stop trusting.
 */
export function countCharacters(text: string): number {
  return [...text].length;
}

export interface CharacterCounterState {
  level: CharacterCounterLevel;
  /** Characters left; negative once over the limit. */
  remaining: number;
  /** Whether anything should render at all. */
  visible: boolean;
}

/** The last tenth of the allowance, where the countdown turns from muted to warning. */
const CLOSE_RATIO = 0.9;

/**
 * When the counter appears and what colour it is.
 *
 * Below the threshold it does not render — a number that is always on is a
 * number nobody reads, and it turns a chat box into a form. It fades up at 80%
 * of the limit, warns in the last tenth, and goes danger (and negative) past it.
 */
export function characterCounterState(
  length: number,
  limit: number,
  options: { threshold?: number; showAlways?: boolean } = {},
): CharacterCounterState {
  const { threshold = 0.8, showAlways = false } = options;
  if (!(limit > 0)) return { level: 'far', remaining: Number.POSITIVE_INFINITY, visible: false };
  const ratio = length / limit;
  const level: CharacterCounterLevel =
    ratio > 1 ? 'over' : ratio >= CLOSE_RATIO ? 'close' : ratio >= threshold ? 'near' : 'far';
  return { level, remaining: limit - length, visible: showAlways || level !== 'far' };
}

// ---- mentions and slash commands -------------------------------------------

/** One trigger and where it may legally open a popup. */
export interface MentionTriggerRule {
  trigger: MentionTrigger;
  /**
   * The token may only open at the very start of the text. True for `/`: a
   * slash command is the whole message, and `and/or` is not a command.
   */
  atStart?: boolean;
}

/** `@` and `#` anywhere after whitespace; `/` only as the first character. */
export const DEFAULT_MENTION_TRIGGERS: readonly MentionTriggerRule[] = [
  { trigger: '@' },
  { trigger: '#' },
  { trigger: '/', atStart: true },
];

/** The token being typed at the caret. */
export interface MentionQuery {
  trigger: MentionTrigger;
  /** Everything between the trigger and the caret; empty right after the trigger. */
  query: string;
  /** Index of the trigger character. */
  start: number;
  /** The caret, i.e. one past the last character of the query. */
  end: number;
}

/**
 * Finds the completable token at the caret, or null.
 *
 * Walks back from the caret to the nearest trigger, and only accepts it when it
 * opens a token: at the start of the text or after whitespace, so `ada@host`
 * never becomes a mention. Whitespace inside the query ends it, which is what
 * makes "@ada and bob" stop offering people after the first word instead of
 * matching the rest of the sentence.
 */
export function mentionQuery(
  text: string,
  caret: number,
  triggers: readonly MentionTriggerRule[] = DEFAULT_MENTION_TRIGGERS,
): MentionQuery | null {
  const end = clamp(caret, 0, text.length);
  for (let i = end - 1; i >= 0; i -= 1) {
    const char = text[i] as string;
    if (/\s/.test(char)) return null;
    const rule = triggers.find((t) => t.trigger === char);
    if (!rule) continue;
    if (rule.atStart && i !== 0) return null;
    const before = i === 0 ? '' : (text[i - 1] as string);
    if (i !== 0 && !/\s/.test(before)) return null;
    return { trigger: rule.trigger, query: text.slice(i + 1, end), start: i, end };
  }
  return null;
}

/**
 * Replaces the token with a completion, returning the new text and where the
 * caret goes. A trailing space is part of the completion: without it the very
 * next keystroke re-opens the popup on a token the user has already finished.
 */
export function applyMention(
  text: string,
  token: MentionQuery,
  insert: string,
): { text: string; caret: number } {
  const completed = `${token.trigger}${insert} `;
  return {
    text: text.slice(0, token.start) + completed + text.slice(token.end),
    caret: token.start + completed.length,
  };
}

/** A completable person, channel, or command. Structurally a palette command. */
export interface MentionCandidate extends CommandDescriptor {
  /** The handle inserted into the message; falls back to the label. */
  handle?: string;
}

/**
 * Matches candidates with the command palette's matcher, then lifts prefix hits
 * above mid-word ones.
 *
 * The matcher is REUSED, not reimplemented — the substring rule, the keyword
 * fallback, the `matchedKeyword` report, and the flat indices the cursor
 * addresses are all the palette's, so a query narrows a mention list exactly as
 * it narrows a ⌘K list. Two things are layered on top of it here rather than
 * forked into it:
 *
 * 1. The handle is folded into the searched keywords before matching, so
 *    `@bcantrill` is findable from a list that displays "Bryan Cantrill". (The
 *    generalisation the matcher itself wants is an option naming which extra
 *    fields to search; until it has one, projecting the handle into `keywords`
 *    gets the same result without a second matcher to keep in step.)
 * 2. Prefix hits are lifted above mid-word ones. In a palette, "type" finding
 *    "Prototype" is a useful catch; in a mention list, typing "an" and being
 *    offered "Bryan" before "Ana" is wrong, because a name is completed from
 *    its start. Ordering is stable inside each tier, so the caller's priority
 *    still decides among equals, and the indices are re-stamped afterwards so
 *    `moveCommandCursor` and `firstCommandCursor` keep working unchanged.
 */
export function mentionMatches<T extends MentionCandidate>(
  candidates: readonly T[],
  query: string,
): CommandMatch<T>[] {
  // Projected copies carry the handle in the searched keywords; the map takes
  // each match back to the caller's own object, so nothing downstream sees the
  // rewritten field.
  const origin = new Map<MentionCandidate, T>();
  const searchable = candidates.map((candidate) => {
    const projected: T = candidate.handle
      ? { ...candidate, keywords: `${candidate.keywords ?? ''} ${candidate.handle}`.trim() }
      : candidate;
    origin.set(projected, candidate);
    return projected;
  });

  const matched = matchCommands(searchable, query).map((match) => ({
    ...match,
    item: origin.get(match.item) ?? match.item,
  }));
  const q = query.trim().toLowerCase();
  if (q === '') return matched;

  const startsWith = (match: CommandMatch<T>): boolean => {
    if (match.item.label.toLowerCase().startsWith(q)) return true;
    const handle = match.item.handle?.toLowerCase() ?? '';
    if (handle.startsWith(q) || handle.replace(/^@/, '').startsWith(q)) return true;
    return (match.item.keywords ?? '')
      .toLowerCase()
      .split(/\s+/)
      .some((word) => word.length > 0 && word.replace(/^@/, '').startsWith(q));
  };

  const lead: CommandMatch<T>[] = [];
  const rest: CommandMatch<T>[] = [];
  for (const match of matched) (startsWith(match) ? lead : rest).push(match);
  return [...lead, ...rest].map((match, index) => ({ ...match, index }));
}

/** What gets typed into the message when a candidate is chosen. */
export function mentionInsertion(candidate: MentionCandidate): string {
  // A handle already carrying its trigger would double it, since applyMention
  // writes the trigger itself.
  const raw = candidate.handle ?? candidate.label;
  return raw.replace(/^[@#/]/, '');
}

// ---- the voice recorder ----------------------------------------------------

/** How far the finger has travelled toward throwing the take away. */
export interface SlideToCancel {
  /** 0 at the start, 1 at the threshold. Clamped, so it never overshoots. */
  progress: number;
  /** Past the threshold: releasing now discards. */
  canceling: boolean;
}

/**
 * Slide-to-cancel travel.
 *
 * Cancel is toward the INLINE START, not toward the left: in Arabic the whole
 * bar is mirrored, and a gesture hard-coded leftward would ask a right-to-left
 * user to slide toward the send button to cancel. The binding reports the raw
 * pointer delta and the writing direction; the flip happens once, here.
 */
export function slideToCancel(options: {
  /** Pointer x now minus x at press, in CSS pixels (screen axis, not logical). */
  delta: number;
  /** Travel needed to cancel, in CSS pixels. */
  threshold: number;
  direction?: 'ltr' | 'rtl';
}): SlideToCancel {
  const { delta, threshold, direction = 'ltr' } = options;
  const travel = direction === 'rtl' ? delta : -delta;
  const span = Math.max(1, threshold);
  return { progress: clamp01(travel / span), canceling: travel >= span };
}

/** The things that happen to a hold-to-record control. */
export type VoiceRecorderEvent = 'hold' | 'enter-cancel' | 'leave-cancel' | 'lock' | 'release' | 'stop' | 'discard';

const VOICE_MOVES: Record<VoiceRecorderState, Partial<Record<VoiceRecorderEvent, VoiceRecorderState>>> = {
  armed: { hold: 'recording' },
  // A release while recording ends the take and offers it; the outcome of the
  // release is read separately, from the state it happened in.
  recording: { 'enter-cancel': 'canceling', lock: 'locked', release: 'armed', stop: 'armed', discard: 'armed' },
  // Still recording while canceling — sliding back keeps the take, which is the
  // whole point of showing the threshold rather than firing at it.
  canceling: { 'leave-cancel': 'recording', lock: 'locked', release: 'armed', stop: 'armed', discard: 'armed' },
  // No finger left to release, so only explicit stop or discard can end it.
  locked: { stop: 'armed', discard: 'armed' },
};

/** Applies one event; returns the same state when the move is illegal. */
export function advanceVoiceState(state: VoiceRecorderState, event: VoiceRecorderEvent): VoiceRecorderState {
  return VOICE_MOVES[state][event] ?? state;
}

/**
 * What letting go means, given where the finger was when it happened. Releasing
 * inside the cancel zone throws the take away; releasing anywhere else sends it.
 * A locked recording has no release, so it reports nothing.
 */
export function voiceReleaseOutcome(state: VoiceRecorderState): 'send' | 'cancel' | 'none' {
  if (state === 'recording') return 'send';
  if (state === 'canceling') return 'cancel';
  return 'none';
}

/** Whether the strip has taken over the bar from the input. */
export function voiceIsLive(state: VoiceRecorderState): boolean {
  return state === 'recording' || state === 'canceling' || state === 'locked';
}

// ---- density ---------------------------------------------------------------

export interface ComposeMetrics {
  /** Gap between the bar's rows, as a bare token name. */
  gap: string;
  /** The bar's own padding, as a bare token name. */
  padding: string;
  /** Size step for the trailing controls. */
  controlSize: 'sm' | 'md' | 'lg';
  /** Rows the input starts at. */
  minRows: number;
}

/**
 * How tightly the bar packs, resolved once for both bindings — the same shape
 * `playerMetrics` has, so a compact composer above a compact player agrees with
 * it instead of being compact by a different amount.
 */
export function composeMetrics(density: ComposeDensity = 'comfortable'): ComposeMetrics {
  switch (density) {
    case 'compact':
      return { gap: 'space-1', padding: 'space-1', controlSize: 'sm', minRows: 1 };
    case 'spacious':
      return { gap: 'space-3', padding: 'space-3', controlSize: 'lg', minRows: 2 };
    default:
      return { gap: 'space-2', padding: 'space-2', controlSize: 'md', minRows: 1 };
  }
}
