/**
 * Transcript logic — what a scrolling message log *does* with a viewport.
 *
 * `chat.ts` owns what a transcript CONTAINS: how a flat log collapses into
 * author runs, where the separators land, how a stamp is spelled. This file owns
 * everything downstream of that: how close to the bottom still counts as "at the
 * bottom", when the jump-to-latest affordance earns its place on screen, what to
 * do to the scroll offset after content above the viewport changed size, and how
 * new arrivals reach a screen reader without drowning it.
 *
 * The split is deliberate and not just ownership hygiene. Sequence-building is
 * pure data with no notion of a viewport; viewport policy is pure arithmetic
 * with no notion of a message. Keeping them apart means nothing in here can
 * tempt a caller into recomputing a sequence — and in particular nothing here
 * touches the unread anchor, whose whole value is that it is pinned once and
 * never re-derived.
 *
 * Every decision below is shared because the alternative is two products. A DOM
 * transcript that treats 32px from the bottom as "at the bottom" and a phone
 * that treats 100px as "at the bottom" do not merely differ in a number: they
 * disagree about whether an arriving message should scroll the screen, which is
 * the single most noticeable behaviour a chat app has.
 *
 * Pure TypeScript: no DOM, no react-native. Geometry arrives as three plain
 * numbers (`TranscriptMetrics`) that both a DOM element and a React Native
 * scroll event can produce, so neither platform's scroll object reaches here.
 */

import {
  daysBetween,
  messageTimestamp,
  type ChatMessage,
  type ChatSequenceItem,
  type MessageTimestampFormat,
  type Millis,
} from './chat.ts';

// ---- at-bottom --------------------------------------------------------------

/**
 * How far from the true bottom still counts as being at the bottom, in CSS
 * pixels.
 *
 * It cannot be zero. Sub-pixel layout, fractional device pixel ratios, and a
 * scroll position that browsers round differently at the extremes mean a
 * viewport parked at the end routinely reports a distance of 0.5 or 1.3 rather
 * than 0 — and a transcript that decides it is no longer at the bottom because
 * of a rounding error stops following the conversation, which reads as a bug
 * nobody can reproduce.
 *
 * 32px is roughly one line of chat text: close enough that anything still
 * hidden below is a sliver rather than a message, far enough to absorb rounding
 * and the elastic overscroll a trackpad produces at the end of a list.
 */
export const AT_BOTTOM_EPSILON_PX = 32;

/**
 * How far up the user must have scrolled before the jump-to-latest affordance
 * appears on its own.
 *
 * Separate from — and much larger than — the at-bottom epsilon on purpose. One
 * shared threshold makes the button flash on and off around a single boundary
 * as the user nudges the wheel, which is worse than not having the button.
 * These two numbers are the two ends of a hysteresis band: the affordance
 * appears only after a deliberate scroll of roughly a screenful on a phone, and
 * hides only on a real return to the bottom.
 */
export const SCROLL_TO_LATEST_REVEAL_PX = 240;

/**
 * A scroll viewport's geometry, in CSS pixels.
 *
 * Deliberately three plain numbers rather than a scroll event or an element: a
 * DOM viewport reads `scrollTop`/`scrollHeight`/`clientHeight`, and a React
 * Native scroll event reads `contentOffset.y`/`contentSize.height`/
 * `layoutMeasurement.height`. Both map onto this in one line, and neither
 * platform's object crosses into commons.
 */
export interface TranscriptMetrics {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
}

/** How much content sits below the viewport, never negative. */
export function distanceFromBottom(metrics: TranscriptMetrics): number {
  const { scrollTop, scrollHeight, clientHeight } = metrics;
  // Clamped because overscroll (iOS rubber-banding, a trackpad flick) reports a
  // scrollTop past the end, and a negative distance would read as "beyond the
  // bottom" everywhere downstream.
  return Math.max(0, scrollHeight - clientHeight - scrollTop);
}

/** Whether the viewport is near enough to the end to count as following along. */
export function isAtBottom(metrics: TranscriptMetrics, epsilon = AT_BOTTOM_EPSILON_PX): boolean {
  return distanceFromBottom(metrics) <= epsilon;
}

export interface ScrollToLatestOptions {
  /** Unread messages waiting below; any at all justifies the affordance. */
  unread?: number;
  /** Whether it is showing right now, so it can stay shown (hysteresis). */
  shown?: boolean;
  epsilon?: number;
  reveal?: number;
}

/**
 * Whether the jump-to-latest affordance should be on screen.
 *
 * Three rules, in priority order:
 *
 * 1. **At the bottom, never.** There is nothing to jump to, and a button that
 *    lingers over the newest message covers the thing the user came for.
 * 2. **Anything unread below, always.** Distance is irrelevant once a message
 *    the user has not seen is waiting: one scroll-wheel notch up from the bottom
 *    with an arriving message still needs the affordance, because the alternative
 *    is a message that silently never gets read.
 * 3. **Otherwise, only past the reveal distance — and once shown it stays shown
 *    until the bottom is reached.** This is the hysteresis: the appear boundary
 *    and the disappear boundary are different, so nothing flickers under a
 *    finger that is still dragging.
 */
export function shouldShowScrollToLatest(
  metrics: TranscriptMetrics,
  options: ScrollToLatestOptions = {},
): boolean {
  const { unread = 0, shown = false, epsilon = AT_BOTTOM_EPSILON_PX, reveal = SCROLL_TO_LATEST_REVEAL_PX } = options;
  if (isAtBottom(metrics, epsilon)) return false;
  if (unread > 0) return true;
  if (shown) return true;
  return distanceFromBottom(metrics) > reveal;
}

/** Everything a transcript reports upward so the surrounding chrome can react. */
export interface TranscriptScrollState {
  /** Following the conversation: new messages may move the viewport. */
  atBottom: boolean;
  /** Content hidden below the viewport, in CSS pixels. */
  distanceFromBottom: number;
  /** Unread messages waiting below; 0 once the reader reaches the bottom. */
  unreadBelow: number;
  /** Whether the jump-to-latest affordance should be visible. */
  showScrollToLatest: boolean;
}

// ---- unread -----------------------------------------------------------------

/** Where the unread divider sits in the sequence, or -1 when everything is read. */
export function unreadIndex<M extends ChatMessage>(items: readonly ChatSequenceItem<M>[]): number {
  return items.findIndex((item) => item.kind === 'unread');
}

/**
 * How many unread messages are waiting below the viewport.
 *
 * Defined as the divider's own count while the reader is away from the bottom,
 * and zero the moment they arrive — not as a geometric "messages below the fold"
 * measurement, and the difference matters. A geometric count changes on every
 * scroll frame, so the number on the affordance would tick down as the user
 * drags, which is both distracting and a lie: those messages are still unread,
 * they are merely on screen. The divider's count is pinned to the same anchor
 * the divider itself is (see `insertSeparators`), so the badge holds still, and
 * "reached the bottom" is the one event that genuinely clears it.
 */
export function unreadBelow<M extends ChatMessage>(
  items: readonly ChatSequenceItem<M>[],
  atBottom: boolean,
): number {
  if (atBottom) return 0;
  for (const item of items) if (item.kind === 'unread') return item.count;
  return 0;
}

// ---- scroll anchoring -------------------------------------------------------

/**
 * What to do to the scroll offset after a commit changed the content.
 *
 * This is the shared half of the hardest behaviour in a transcript. The platform
 * half — how to observe an element's offset and how to write a scroll position —
 * is different on the DOM and on React Native, but *which* of the three moves to
 * make is one policy, and a binding that decides it locally is a binding that
 * will eventually disagree with the other one about whether loading older
 * history should move the screen.
 */
export type TranscriptAdjustment =
  /** Stay glued to the end: the reader was following, so follow. */
  | { kind: 'pin-bottom' }
  /** Shift by this many pixels to hold the reader's place. */
  | { kind: 'anchor'; delta: number }
  /** Leave the viewport exactly where it is. */
  | { kind: 'none' };

export interface TranscriptAdjustmentInput {
  /** Whether the reader was at the bottom BEFORE this commit. */
  atBottom: boolean;
  /** Whether rows were inserted above the previous first row. */
  prepended: boolean;
  /** The anchor row's offset within the content, now. */
  anchorOffset?: number;
  /** The same row's offset as recorded before this commit. */
  previousAnchorOffset?: number;
  /** Total content height now. */
  scrollHeight: number;
  /** Total content height before this commit. */
  previousScrollHeight: number;
}

/**
 * Decides how to correct the scroll offset after the content changed.
 *
 * **Pinning wins outright.** A reader parked at the bottom asked, by being
 * there, to be shown what arrives; anchoring them in place would leave new
 * messages accumulating just off screen.
 *
 * **Otherwise the anchor row decides.** The correct fix for "the content above
 * me changed size" is not a height difference — it is the observed movement of
 * a specific row the reader can see. Measuring a real row is what makes this
 * survive the cases a height delta gets wrong: an image above the viewport
 * finishing its load, a quoted reply expanding, a page of history that arrives
 * *and* collapses two runs into one. If the row moved by 400px, shift by 400px
 * and the reader's eye never leaves the sentence it was on. If it did not move,
 * the change was below them and must not move anything — which is exactly why
 * appending is handled by this same rule with no special case.
 *
 * **The height delta is only a fallback, and only for a prepend.** When the
 * anchor row is gone — paged out, or unmounted by a future windowing list — the
 * total height change is the best remaining estimate, and it is right whenever
 * the growth was above the viewport. It is only consulted on a known prepend,
 * because for an append it would be exactly wrong: it would scroll the reader
 * down by the height of a message they never asked to see.
 */
export function transcriptAdjustment(input: TranscriptAdjustmentInput): TranscriptAdjustment {
  const { atBottom, prepended, anchorOffset, previousAnchorOffset, scrollHeight, previousScrollHeight } = input;

  if (atBottom) return { kind: 'pin-bottom' };

  if (anchorOffset !== undefined && previousAnchorOffset !== undefined) {
    const delta = anchorOffset - previousAnchorOffset;
    return delta === 0 ? { kind: 'none' } : { kind: 'anchor', delta };
  }

  if (prepended && scrollHeight > previousScrollHeight) {
    return { kind: 'anchor', delta: scrollHeight - previousScrollHeight };
  }

  return { kind: 'none' };
}

/**
 * How many rows were inserted above the row that used to be first.
 *
 * Identity, not counting: a transcript's length changes for four different
 * reasons at once, so "the list got longer" says nothing about *where*. The
 * previous first row's key is the only fact that answers it, and because
 * `insertSeparators` keys rows by day and by message id rather than by index,
 * that key survives a page of history landing above it.
 *
 * Returns 0 when the key is unknown, unchanged, or no longer present — all three
 * mean "this was not a prepend I can reason about", and the anchor row is the
 * mechanism that carries those cases anyway.
 */
export function prependedCount(
  previousFirstKey: string | undefined,
  items: readonly { key: string }[],
): number {
  if (previousFirstKey === undefined) return 0;
  const at = items.findIndex((item) => item.key === previousFirstKey);
  return at > 0 ? at : 0;
}

// ---- arrivals ---------------------------------------------------------------

/** The last message in the rendered sequence, or undefined when it holds none. */
export function lastMessageId<M extends ChatMessage>(items: readonly ChatSequenceItem<M>[]): string | undefined {
  for (let i = items.length - 1; i >= 0; i -= 1) {
    const item = items[i];
    if (item?.kind === 'group') return item.group.messages[item.group.messages.length - 1]?.id;
  }
  return undefined;
}

/**
 * How many messages sit after `id` in the sequence.
 *
 * This, rather than a length difference, is what "how many arrived" means. A
 * transcript grows at both ends: paging older history lengthens the list without
 * anything having arrived, and announcing "12 new messages" because the reader
 * scrolled up into last Tuesday is a bug a screen reader user cannot ignore.
 * Counting from the previously-known last message is immune to that, because
 * everything a prepend adds lands before it.
 *
 * Returns 0 when `id` is unknown or no longer present: a transcript that has
 * lost its own tail (a jump to a search result, a cleared window) has no
 * meaningful arrival count, and silence is the right failure.
 */
export function countMessagesAfter<M extends ChatMessage>(
  items: readonly ChatSequenceItem<M>[],
  id: string | undefined,
): number {
  if (id === undefined) return 0;
  let found = false;
  let count = 0;
  for (const item of items) {
    if (item.kind !== 'group') continue;
    for (const message of item.group.messages) {
      if (found) count += 1;
      else if (message.id === id) found = true;
    }
  }
  return found ? count : 0;
}

// ---- announcements ----------------------------------------------------------

/**
 * How long the live region waits before speaking again.
 *
 * A busy channel produces messages faster than any screen reader can read one,
 * and an unthrottled live region does not merely lag — most readers interrupt
 * themselves on each update, so the user hears an endless string of first
 * syllables and never a whole sentence. Two seconds is long enough for a short
 * announcement to finish and short enough that the transcript still feels live.
 */
export const ANNOUNCE_INTERVAL_MS = 2000;

/** Pending arrivals plus when the live region last spoke. */
export interface AnnouncerState {
  /** Messages that have arrived and not yet been announced. */
  pending: number;
  /** When the last announcement was published, epoch millis. */
  lastAt: Millis;
}

/** A transcript that has announced nothing yet. */
export const idleAnnouncer: AnnouncerState = { pending: 0, lastAt: 0 };

/** Adds arrivals to the pending tally. Negative and fractional counts are ignored. */
export function queueArrivals(state: AnnouncerState, arrivals: number): AnnouncerState {
  if (!Number.isFinite(arrivals) || arrivals <= 0) return state;
  return { ...state, pending: state.pending + Math.floor(arrivals) };
}

/**
 * Takes whatever the live region is allowed to say now.
 *
 * Returns a count of 0 for "stay silent" — either nothing has arrived or the
 * interval has not elapsed — and leaves the state untouched in that case, so
 * pending arrivals accumulate into one announcement rather than being dropped.
 * That coalescing is the point: five messages in a second become "5 new
 * messages", spoken once, instead of five interrupted fragments.
 */
export function drainAnnouncement(
  state: AnnouncerState,
  now: Millis,
  intervalMs = ANNOUNCE_INTERVAL_MS,
): { state: AnnouncerState; count: number } {
  if (state.pending <= 0) return { state, count: 0 };
  if (state.lastAt !== 0 && now - state.lastAt < intervalMs) return { state, count: 0 };
  return { state: { pending: 0, lastAt: now }, count: state.pending };
}

/** How a transcript's new messages reach assistive technology. */
export type TranscriptAnnounce =
  /**
   * A coalesced count in a polite status region ("3 new messages"), at most once
   * per `ANNOUNCE_INTERVAL_MS`. The default, and the only setting that stays
   * usable on a busy channel.
   */
  | 'count'
  /**
   * The log itself is live, so each message body is read as it lands. Correct
   * for a quiet one-to-one thread; ruinous for a busy room.
   */
  | 'messages'
  /** Silent. For a surface that announces arrivals through its own chrome. */
  | 'off';

// ---- day labels -------------------------------------------------------------

/**
 * Which phrase a day separator should carry. The same ladder `messageTimestamp`
 * uses, with a `today` rung on top, because a date row's whole job is to say
 * which day this is and "today" is the answer readers scan for first.
 */
export type TranscriptDayKind = 'today' | 'yesterday' | 'weekday' | 'date' | 'dateWithYear';

/** A day, plus a description of how to spell it — never a spelled string. */
export interface TranscriptDayLabel {
  kind: TranscriptDayKind;
  /** The moment, unchanged, so the caller formats from the source of truth. */
  at: Millis;
  /** Whole local days between `at` and `now`; 0 is today. */
  daysAgo: number;
  /** The fields `kind` wants rendered, when it is spelled as a date. */
  format: MessageTimestampFormat;
}

/**
 * Chooses how to spell a day separator, relative to `now`.
 *
 * Delegates to `messageTimestamp` rather than re-deriving the ladder — the
 * weekday horizon, the future-moment rule, and the same-year test are decided
 * once, in chat.ts, and a transcript that disagreed with its own bubbles about
 * whether last Tuesday is "Tuesday" would be visibly incoherent. The one thing
 * added here is `today`, which a bubble stamp has no use for (it prints a clock)
 * and a date row cannot do without.
 *
 * `now` is required rather than defaulted to `Date.now()`, for the same reason
 * it is in chat.ts: a screenshot test that drifts with the wall clock is not a
 * test.
 */
export function transcriptDayLabel(at: Millis, now: Millis): TranscriptDayLabel {
  if (daysBetween(at, now) === 0) {
    const stamp = messageTimestamp(at, now, 'date');
    return { kind: 'today', at, daysAgo: 0, format: stamp.format };
  }
  // Never returns 'time': that rung is only reachable on the current day, which
  // the branch above has already taken.
  const stamp = messageTimestamp(at, now, 'auto');
  const kind: TranscriptDayKind = stamp.kind === 'time' ? 'date' : stamp.kind;
  return { kind, at: stamp.at, daysAgo: stamp.daysAgo, format: stamp.format };
}

// ---- labels -----------------------------------------------------------------

/**
 * Every string the transcript speaks, so it can be spoken in any language.
 *
 * English defaults live here rather than in either binding for the usual reason:
 * two hardcoded default sets are two products. A consuming app overrides them
 * from its own catalog; the kit's catalog keys are listed alongside each entry.
 */
export interface TranscriptLabels {
  /** Accessible name of the log region. */
  log: string;
  today: string;
  yesterday: string;
  /** The unread rule's own label. */
  newMessages: string;
  /** Announced arrival count. Uses `{count}`. */
  newMessageCount: string;
  /** The jump-to-latest control. */
  scrollToLatest: string;
  /** Announced while a page of older history is loading. */
  loadingOlder: string;
}

export const defaultTranscriptLabels: TranscriptLabels = {
  log: 'Message transcript',
  today: 'Today',
  yesterday: 'Yesterday',
  newMessages: 'New messages',
  newMessageCount: '{count} new messages',
  scrollToLatest: 'Scroll to latest messages',
  loadingOlder: 'Loading earlier messages',
};

/**
 * Interpolates `{name}` placeholders, matching the kit catalog's `format`.
 *
 * Deliberately a local copy: chat.ts keeps its own private one, and reaching
 * across to borrow it would couple two files with different owners over four
 * lines of regex.
 */
export function formatTranscriptLabel(
  template: string,
  params: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) =>
    key in params ? String(params[key]) : whole,
  );
}
