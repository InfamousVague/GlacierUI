/**
 * Chat logic - the rules every chat surface reads from: how a flat message log
 * collapses into author runs, where the separators land, how a reaction bar
 * tallies, and what a bubble's corners, timestamp, and status resolve to.
 *
 * This is the layer where chat apps actually differ from one another, so it is
 * the layer most likely to drift. Everything here is a decision rather than a
 * pixel, which is why it lives once in commons and neither binding re-derives
 * any of it.
 *
 * Time is epoch milliseconds everywhere, never a `Date`. Three reasons, in
 * order of how much they hurt: messages arrive as JSON, so a number is what the
 * transport already carries and a `Date` would be a parse step at every
 * boundary; a number is a primitive, so it compares by value in a memo
 * dependency list where a freshly-allocated `Date` would re-render a virtualised
 * transcript on every tick; and equal moments compare equal with `===`, which is
 * exactly the identity a stable list key needs. Calendar arithmetic still goes
 * through the local-date constructor - see `calendar-view.ts`, whose `dayKey`
 * and `startOfDay` are reused here rather than re-implemented, because a day is
 * not always 86,400,000ms and a transcript that loses a day twice a year is
 * worse than one with no date rows at all.
 */

import { dayKey, startOfDay } from './calendar-view.ts';

/** Epoch milliseconds. The one time representation the whole suite speaks. */
export type Millis = number;

/**
 * How far along a message is on its way to the other end.
 *
 * Exported as a const array so the spec and both bindings derive one enum
 * instead of each transcribing the same five words.
 */
export const deliveryStatuses = ['sending', 'sent', 'delivered', 'read', 'failed'] as const;

export type DeliveryStatus = (typeof deliveryStatuses)[number];

/** One person's one reaction, as the server stores it. */
export interface Reaction {
  /** The rendered glyph. Compared as-is: the caller owns any normalisation. */
  emoji: string;
  /** Who reacted; also how the viewer's own reaction is recognised. */
  actorId: string;
  /** Optional, and deliberately unused for ordering - see `aggregateReactions`. */
  at?: Millis;
}

/** Something sent alongside (or instead of) text. */
export interface ChatAttachment {
  /** Stable identity, and the render key. */
  id: string;
  /** Where the bytes are. Opaque here; each binding loads it its own way. */
  url?: string;
  /** As reported by the server or the file picker, e.g. `image/png`. */
  mimeType?: string;
  /** As the user sees it. Also the fallback when the mime type is useless. */
  fileName?: string;
  byteSize?: number;
  /** Intrinsic pixel size, so a renderer can reserve the box before the bytes land. */
  width?: number;
  height?: number;
  /** Playable length, for the audio and video renderers. */
  durationMs?: number;
}

/**
 * One message. Deliberately thin: everything a chat surface *decides* is
 * derived from these fields, and anything a particular app also needs rides
 * along on its own subtype - every function here is generic over `M extends
 * ChatMessage`, so extra fields survive grouping untouched.
 */
export interface ChatMessage {
  /** Stable identity. Optimistic sends must keep the same id once acked, or
   *  the group and the unread anchor both lose their place. */
  id: string;
  /** Who sent it. Grouping compares these; it never compares display names,
   *  which two different people can share. */
  authorId: string;
  /** When it was sent, epoch millis. */
  at: Millis;
  text?: string;
  attachments?: ChatAttachment[];
  reactions?: Reaction[];
  /** Omitted for anything received - status is about the viewer's own outbox. */
  status?: DeliveryStatus;
  /** The message this one answers, for a quoted preview. */
  replyToId?: string;
  editedAt?: Millis;
  /**
   * Refuses to be merged with its neighbours in either direction. This is how a
   * system notice ("Ana joined"), a call record, or a date-change notice stays
   * on its own row instead of being swallowed into whichever author happened to
   * speak on both sides of it.
   */
  breaksGroup?: boolean;
}

/**
 * A run of consecutive messages from one author, rendered as one stack with a
 * single avatar and header.
 */
export interface MessageGroup<M extends ChatMessage = ChatMessage> {
  /**
   * The first message's id. Derived rather than generated so the key survives a
   * re-group: appending a message either extends this run (id unchanged) or
   * starts a new one, and React never sees the whole transcript remount.
   */
  id: string;
  authorId: string;
  /** In render order, never empty. */
  messages: M[];
  /** The first message's time - what a group header prints. */
  startedAt: Millis;
  /** The last message's time - what a trailing stamp prints. */
  endedAt: Millis;
  /** `YYYY-MM-DD`, local. Groups never span days, so one key always fits. */
  dayKey: string;
  /** The least advanced status among the members; see `leastDelivery`. */
  status?: DeliveryStatus;
  /** The run is a single message that refused to merge - a system notice. */
  standalone: boolean;
  /**
   * This run picked up where an earlier run from the same author left off,
   * because a separator was pushed between them. The renderer should suppress
   * the repeated avatar and name; only `insertSeparators` ever sets it.
   */
  continued: boolean;
}

/**
 * How long a pause has to be before the next message starts a new stack.
 *
 * Five minutes is the interval nearly every chat client converged on, and the
 * reason is legibility rather than taste: below it a burst of typing reads as
 * one utterance, above it the reader has lost the thread and wants the header
 * back to re-establish who is talking.
 */
export const CHAT_GROUP_WINDOW_MS = 5 * 60 * 1000;

export interface GroupMessagesOptions {
  /** Pause after which a new stack begins. Defaults to `CHAT_GROUP_WINDOW_MS`. */
  windowMs?: number;
}

/** `YYYY-MM-DD` in local time for a moment. The date-row key and bucket key. */
export function chatDayKey(at: Millis): string {
  return dayKey(new Date(at));
}

/**
 * Whole local calendar days from `a` to `b`; negative when `b` is earlier.
 *
 * Both ends are flattened to midnight first and the division is rounded, so a
 * 23- or 25-hour DST day still counts as exactly one.
 */
export function daysBetween(a: Millis, b: Millis): number {
  const from = startOfDay(new Date(a)).getTime();
  const to = startOfDay(new Date(b)).getTime();
  return Math.round((to - from) / 86_400_000);
}

/** Builds a group from a non-empty run, deriving everything the renderer reads. */
function makeGroup<M extends ChatMessage>(messages: M[], continued: boolean): MessageGroup<M> {
  const first = messages[0] as M;
  const last = messages[messages.length - 1] as M;
  return {
    id: first.id,
    authorId: first.authorId,
    messages,
    startedAt: first.at,
    endedAt: last.at,
    dayKey: chatDayKey(first.at),
    status: leastDelivery(messages.map((m) => m.status)),
    standalone: messages.length === 1 && first.breaksGroup === true,
    continued,
  };
}

/**
 * Collapses a chronological log into author runs - the core of the whole suite,
 * because it decides where avatars, headers, and bubble tails appear.
 *
 * A run breaks when any of these is true of a message and the one before it:
 *
 * 1. **The author changed.** Compared by id, never by name.
 * 2. **The pause was longer than the window.** Measured as an *absolute*
 *    distance, so a message that arrives stamped slightly in the past - which
 *    optimistic sends and unsynced client clocks produce constantly - still
 *    groups with its neighbour instead of the sign of the subtraction deciding
 *    the layout. A genuinely large backwards jump still breaks, which is the
 *    honest read: the two messages are not from the same moment.
 * 3. **A local calendar day was crossed.** Checked independently of the window,
 *    because 23:59 and 00:01 are a two-minute pause and still want the date row
 *    between them. This is also why a group can carry a single `dayKey`, and
 *    why `insertSeparators` never has to split a run to emit one.
 * 4. **Either message refuses to merge** (`breaksGroup`). It breaks on both
 *    sides, so a system notice is always alone even when the same author speaks
 *    immediately before and after it.
 *
 * Input order is the render order and is preserved exactly. Sorting is
 * deliberately not done here: the caller owns the transcript's order (a paged
 * history and a live tail are stitched differently), and silently reordering
 * would move a message out from under a reader's cursor. Out-of-order input
 * therefore produces out-of-order groups - correctly grouped, still in the
 * order it was handed over.
 */
export function groupMessages<M extends ChatMessage>(
  messages: M[],
  options: GroupMessagesOptions = {},
): MessageGroup<M>[] {
  const { windowMs = CHAT_GROUP_WINDOW_MS } = options;
  const groups: MessageGroup<M>[] = [];
  let run: M[] = [];

  const flush = (): void => {
    if (run.length > 0) groups.push(makeGroup(run, false));
    run = [];
  };

  for (const message of messages) {
    const previous = run[run.length - 1];
    if (previous && !sameRun(previous, message, windowMs)) flush();
    run.push(message);
  }
  flush();

  return groups;
}

/** Whether `next` belongs to the run `previous` is part of. */
function sameRun(previous: ChatMessage, next: ChatMessage, windowMs: number): boolean {
  if (previous.breaksGroup === true || next.breaksGroup === true) return false;
  if (previous.authorId !== next.authorId) return false;
  if (chatDayKey(previous.at) !== chatDayKey(next.at)) return false;
  return Math.abs(next.at - previous.at) <= windowMs;
}

/**
 * Where a message sits in its run. Drives corner radii and the tail: `only` is
 * a fully rounded bubble with a tail, `first`/`middle`/`last` flatten the edge
 * facing their neighbour so a stack reads as one block.
 */
export type BubblePosition = 'only' | 'first' | 'middle' | 'last';

/**
 * Classifies a position in a run.
 *
 * Clamps rather than throwing: a virtualised list can ask about an index it has
 * not rendered yet, and a bubble with slightly wrong corners is a far better
 * failure than a crashed transcript.
 */
export function bubblePosition(indexInGroup: number, groupLength: number): BubblePosition {
  if (groupLength <= 1) return 'only';
  if (indexInGroup <= 0) return 'first';
  if (indexInGroup >= groupLength - 1) return 'last';
  return 'middle';
}

/**
 * Which shape a timestamp should take. Not the text - the *shape*; see
 * `messageTimestamp` for why no English appears in this module.
 *
 * - `time` - the clock, e.g. "9:41 AM". What a bubble's own stamp shows.
 * - `yesterday` - the previous calendar day, spelled by the caller's
 *   `Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(-1, 'day')`.
 * - `weekday` - within the last week, e.g. "Tuesday".
 * - `date` - this year, e.g. "Mar 3".
 * - `dateWithYear` - any other year, e.g. "Mar 3, 2024".
 */
export type MessageTimestampKind = 'time' | 'yesterday' | 'weekday' | 'date' | 'dateWithYear';

/** How much of the moment the caller wants spelled out. */
export type MessageTimestampStyle =
  /** The full ladder: clock today, "Yesterday", weekday, then a date. */
  | 'auto'
  /** Always the clock, whatever day it was. */
  | 'time'
  /** Always the calendar date - what a date separator row prints. */
  | 'date';

/**
 * The subset of `Intl.DateTimeFormatOptions` these kinds need, declared
 * structurally rather than imported.
 *
 * Two reasons: commons must not reach for a platform lib, and Hermes ships
 * without full ICU on some builds - a binding that has to hand-roll the
 * formatting should still be handed the same description of what to print,
 * rather than a type it cannot satisfy. The shape is assignable to
 * `Intl.DateTimeFormatOptions`, so the common case is a direct spread.
 */
export interface MessageTimestampFormat {
  hour?: 'numeric';
  minute?: '2-digit';
  weekday?: 'long';
  month?: 'short';
  day?: 'numeric';
  year?: 'numeric';
}

/**
 * A moment plus a description of how to spell it - never a spelled string.
 *
 * Formatting a date is locale work, and a design system that returns "Mar 3"
 * has just hardcoded English into every app that consumes it. So this returns
 * the decision (which of the five shapes applies) and leaves the words to the
 * caller's `Intl` or catalog. `formatMessageTimestamp` is the convenience path
 * for callers who are happy with `Intl`.
 */
export interface MessageTimestamp {
  kind: MessageTimestampKind;
  /** The moment, unchanged, so the caller formats from the source of truth. */
  at: Millis;
  /** Whole local days between `at` and `now`; 0 is today, negative is the future. */
  daysAgo: number;
  /** The fields `kind` wants rendered. */
  format: MessageTimestampFormat;
}

const CLOCK: MessageTimestampFormat = { hour: 'numeric', minute: '2-digit' };
const WEEKDAY: MessageTimestampFormat = { weekday: 'long' };
const SHORT_DATE: MessageTimestampFormat = { month: 'short', day: 'numeric' };
const LONG_DATE: MessageTimestampFormat = { month: 'short', day: 'numeric', year: 'numeric' };

/** Beyond this many days back, a weekday name stops identifying a unique day. */
const WEEKDAY_HORIZON = 7;

/**
 * Chooses how to spell a message's time relative to `now`.
 *
 * The ladder - clock, "Yesterday", weekday, date, date with year - exists
 * because each rung is the shortest label that is still unambiguous at that
 * distance. "Tuesday" is perfect three days back and a lie eight days back,
 * which is why the weekday rung stops one short of a full week rather than at
 * seven days: at exactly seven, "Tuesday" would name two different Tuesdays.
 *
 * A moment in the future never reads as a relative phrase. Clock skew between a
 * sender and the viewer routinely stamps a just-arrived message a few seconds
 * ahead, and "in 4 seconds" on a message you are reading is nonsense; a future
 * moment on today's date shows the clock, and anything further shows a date.
 *
 * `now` is a required parameter rather than a `Date.now()` default, so tests
 * and screenshots are not clock-dependent - the same reason `calendar-view`
 * injects `today`.
 */
export function messageTimestamp(
  at: Millis,
  now: Millis,
  style: MessageTimestampStyle = 'auto',
): MessageTimestamp {
  const daysAgo = daysBetween(at, now);
  const sameYear = new Date(at).getFullYear() === new Date(now).getFullYear();

  if (style === 'time') return { kind: 'time', at, daysAgo, format: CLOCK };

  if (style === 'date' || daysAgo !== 0) {
    if (style === 'auto' && daysAgo === 1) return { kind: 'yesterday', at, daysAgo, format: SHORT_DATE };
    if (style === 'auto' && daysAgo > 1 && daysAgo < WEEKDAY_HORIZON) {
      return { kind: 'weekday', at, daysAgo, format: WEEKDAY };
    }
    return sameYear
      ? { kind: 'date', at, daysAgo, format: SHORT_DATE }
      : { kind: 'dateWithYear', at, daysAgo, format: LONG_DATE };
  }

  return { kind: 'time', at, daysAgo, format: CLOCK };
}

/**
 * Spells a timestamp with the platform's `Intl`. A convenience, not the
 * contract: a binding with its own catalog should read `kind` and format the
 * words itself, which is why the decision and the spelling are separate calls.
 *
 * `numeric: 'auto'` is what turns -1 day into "yesterday" rather than "1 day
 * ago", in whatever language the locale asks for.
 */
export function formatMessageTimestamp(stamp: MessageTimestamp, locale?: string): string {
  if (stamp.kind === 'yesterday') {
    return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(-1, 'day');
  }
  return new Intl.DateTimeFormat(locale, stamp.format).format(new Date(stamp.at));
}

/**
 * One row of the rendered transcript: a group of messages, a date separator, or
 * the unread divider. A flat, keyed sequence rather than a nested tree, because
 * that is what a virtualised list can measure and index.
 */
export type ChatSequenceItem<M extends ChatMessage = ChatMessage> =
  | { kind: 'day'; key: string; dayKey: string; at: Millis }
  | { kind: 'unread'; key: string; at: Millis; count: number }
  | { kind: 'group'; key: string; group: MessageGroup<M> };

export interface InsertSeparatorsOptions {
  /**
   * The id of the first unread message, captured once when the conversation
   * opened. Pinning an id - rather than recomputing "first message I have not
   * read" on every render - is the entire trick behind a stable divider.
   */
  unreadAnchorId?: string;
  /**
   * Fallback watermark, used only when no anchor id resolves. Intended for the
   * first render, where the caller reads back the resolved anchor and pins it.
   */
  lastReadAt?: Millis;
  /** The viewer, so their own messages never raise the divider. */
  viewerId?: string;
  /** Set false for a compact transcript with no date rows. Defaults to true. */
  dayHeaders?: boolean;
}

/**
 * Weaves date separators and the unread divider into the rendered sequence.
 *
 * **Date rows** are emitted whenever the day key changes. Groups never span a
 * day (see `groupMessages`), so a date row always lands cleanly between two
 * groups and never has to cut one.
 *
 * **The unread divider** is the part that has to be got right, because it is
 * the one element that must *not* move while the user is reading. It is placed
 * immediately before the anchor message and nowhere else:
 *
 * - The anchor is an id, resolved from `unreadAnchorId` first. New messages
 *   arriving append after it, so the divider stays exactly where the reader
 *   left it and only its `count` grows. Recomputing the divider from a
 *   read-watermark on every render is what makes dividers jump - the watermark
 *   advances as the client marks messages read, and the line walks down the
 *   screen under the reader's eyes.
 * - `lastReadAt` is consulted only when the anchor id is missing or no longer
 *   in the transcript (deleted, or paged out). It picks the first message after
 *   the watermark that the viewer did not send - your own message arriving in
 *   another window must never mark itself unread.
 * - When the anchor falls mid-run, the run is split so the line lands in the
 *   right place, and the trailing half is flagged `continued` so the renderer
 *   drops the repeated avatar rather than making one author look like two.
 * - `count` is the number of messages from the anchor to the end of the
 *   transcript, so the caller can label the line with its own pluralised string.
 */
export function insertSeparators<M extends ChatMessage>(
  groups: MessageGroup<M>[],
  options: InsertSeparatorsOptions = {},
): ChatSequenceItem<M>[] {
  const { unreadAnchorId, lastReadAt, viewerId, dayHeaders = true } = options;
  const anchorId = resolveAnchor(groups, unreadAnchorId, lastReadAt, viewerId);
  const remaining = anchorId === undefined ? 0 : countFrom(groups, anchorId);

  const items: ChatSequenceItem<M>[] = [];
  let currentDay: string | undefined;
  let anchorPlaced = false;

  const pushGroup = (group: MessageGroup<M>): void => {
    items.push({ kind: 'group', key: `group:${group.id}`, group });
  };

  for (const group of groups) {
    if (dayHeaders && group.dayKey !== currentDay) {
      currentDay = group.dayKey;
      // Keyed by the day, not the index, so inserting an older page above does
      // not renumber every row below it.
      items.push({ kind: 'day', key: `day:${group.dayKey}`, dayKey: group.dayKey, at: group.startedAt });
    }

    const at = anchorPlaced || anchorId === undefined ? -1 : group.messages.findIndex((m) => m.id === anchorId);
    if (at === -1) {
      pushGroup(group);
      continue;
    }

    anchorPlaced = true;
    const head = group.messages.slice(0, at);
    const tail = group.messages.slice(at);
    if (head.length > 0) pushGroup(makeGroup(head, group.continued));
    items.push({
      kind: 'unread',
      key: `unread:${anchorId}`,
      at: (tail[0] as M).at,
      count: remaining,
    });
    // The tail continues the author's run whenever it was cut out of one; a
    // divider at the very top of a group leaves the group whole and keeps
    // whatever `continued` it already carried.
    pushGroup(makeGroup(tail, head.length > 0 ? true : group.continued));
  }

  return items;
}

/** The anchor id to divide on, or undefined for "everything has been read". */
function resolveAnchor<M extends ChatMessage>(
  groups: MessageGroup<M>[],
  unreadAnchorId: string | undefined,
  lastReadAt: Millis | undefined,
  viewerId: string | undefined,
): string | undefined {
  if (unreadAnchorId !== undefined) {
    const pinned = groups.some((g) => g.messages.some((m) => m.id === unreadAnchorId));
    // An explicit anchor wins outright, even on the viewer's own message: the
    // caller pinned it deliberately and knows something this function does not.
    if (pinned) return unreadAnchorId;
  }
  if (lastReadAt === undefined) return undefined;
  for (const group of groups) {
    for (const message of group.messages) {
      if (message.at > lastReadAt && message.authorId !== viewerId) return message.id;
    }
  }
  return undefined;
}

/** How many messages sit at or after the anchor, in render order. */
function countFrom<M extends ChatMessage>(groups: MessageGroup<M>[], anchorId: string): number {
  let counting = false;
  let count = 0;
  for (const group of groups) {
    for (const message of group.messages) {
      if (!counting && message.id === anchorId) counting = true;
      if (counting) count += 1;
    }
  }
  return count;
}

/** One emoji's tally on a message. */
export interface ReactionSummary {
  emoji: string;
  count: number;
  /** Drives the "you reacted" outline, and whether tapping adds or removes. */
  reactedByViewer: boolean;
  /** Everyone who reacted, first-seen order - the tooltip's list. */
  actors: string[];
}

/**
 * Tallies raw reaction records into one entry per emoji.
 *
 * Ordered by first appearance, not by count. A bar sorted by count reshuffles
 * itself the instant someone else reacts, which moves the chip out from under a
 * finger already travelling toward it; first-seen order only ever grows at the
 * end, so every existing chip keeps its position for the life of the message.
 *
 * A repeated actor on the same emoji is counted once. Servers replay events,
 * optimistic updates race their own acknowledgement, and a double-counted
 * reaction is a bug the user can see.
 */
export function aggregateReactions(reactions: Reaction[], viewerId?: string): ReactionSummary[] {
  const byEmoji = new Map<string, ReactionSummary>();
  const seen = new Set<string>();

  for (const { emoji, actorId } of reactions) {
    const pair = `${emoji} ${actorId}`;
    if (seen.has(pair)) continue;
    seen.add(pair);

    const existing = byEmoji.get(emoji);
    if (existing) {
      existing.count += 1;
      existing.actors.push(actorId);
      if (actorId === viewerId) existing.reactedByViewer = true;
    } else {
      byEmoji.set(emoji, {
        emoji,
        count: 1,
        reactedByViewer: viewerId !== undefined && actorId === viewerId,
        actors: [actorId],
      });
    }
  }

  return [...byEmoji.values()];
}

/** Which sentence a typing indicator should render. */
export type TypingKey = 'none' | 'one' | 'two' | 'several' | 'many';

/** Who is typing, resolved into what a template needs - never into a sentence. */
export interface TypingState {
  /** Which template to render. */
  key: TypingKey;
  /** The names to show, in the order they were given. */
  names: string[];
  /** How many typists are hidden behind the "and N others" phrase. */
  others: number;
  /** Everyone typing, shown or not. */
  total: number;
}

/**
 * Resolves who is typing into a template choice plus its slots.
 *
 * No English is returned. "Ana and Bo are typing" is three translation problems
 * at once - the conjunction, the verb agreement, and the word order, none of
 * which survive a naive join in Japanese or Arabic - so this returns the
 * decision and `formatTyping` (or the caller's own catalog) supplies the words.
 * The `{name}` placeholder syntax is deliberately the same one the kit's message
 * catalog interpolates, so a typing string is an ordinary catalog entry.
 *
 * `max` is the number of names the row has room for. On overflow one slot is
 * given back to the "and N others" phrase - the same trade `splitOverflow`
 * makes in `calendar-view`, for the same reason: the summary occupies a slot,
 * so showing `max` names *plus* the summary overflows the row it was measured
 * for.
 *
 * Blank names are dropped rather than rendered as a gap: a typist whose profile
 * has not loaded yet should shorten the list, not produce " is typing".
 */
export function typingText(names: string[], max = 2): TypingState {
  const present = names.filter((name) => name.trim() !== '');
  const total = present.length;
  if (total === 0) return { key: 'none', names: [], others: 0, total: 0 };

  const limit = Math.max(1, Math.floor(max));
  if (total <= limit) {
    const key: TypingKey = total === 1 ? 'one' : total === 2 ? 'two' : 'several';
    return { key, names: present, others: 0, total };
  }

  const shown = present.slice(0, Math.max(1, limit - 1));
  return { key: 'many', names: shown, others: total - shown.length, total };
}

/**
 * The sentences a typing indicator needs, one per shape. Every template may use
 * `{names}` (the shown names, joined), `{first}`, `{last}`, `{count}` (how many
 * are hidden), and `{total}`.
 */
export interface TypingTemplates {
  /** Rendered when nobody is typing. Omit for the usual empty string. */
  none?: string;
  /** e.g. `'{first} is typing'` */
  one: string;
  /** e.g. `'{first} and {last} are typing'` */
  two: string;
  /** e.g. `'{names} are typing'` */
  several: string;
  /** e.g. `'{first} and {count} others are typing'` */
  many: string;
}

/** Interpolates `{name}` placeholders, matching the kit catalog's `format`. */
function interpolate(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) =>
    key in params ? String(params[key]) : whole,
  );
}

/**
 * Renders a typing state with caller-supplied templates.
 *
 * `join` is a hook rather than a hardcoded `", "` because joining a list is
 * itself locale work (`Intl.ListFormat` in most apps); the default is the plain
 * comma a caller who has not thought about it would have written anyway.
 */
export function formatTyping(
  state: TypingState,
  templates: TypingTemplates,
  join: (names: string[]) => string = (names) => names.join(', '),
): string {
  if (state.key === 'none') return templates.none ?? '';
  return interpolate(templates[state.key], {
    names: join(state.names),
    first: state.names[0] ?? '',
    last: state.names[state.names.length - 1] ?? '',
    count: state.others,
    total: state.total,
  });
}

/** Which renderer an attachment gets. */
export type AttachmentKind = 'image' | 'video' | 'audio' | 'file';

/**
 * Extensions worth recognising when the mime type is missing or useless. Kept
 * short on purpose: this is a fallback, and anything not listed still renders
 * as a file card, which is never wrong - only less rich.
 */
const EXTENSION_KINDS: Record<string, AttachmentKind> = {
  jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', webp: 'image',
  avif: 'image', heic: 'image', heif: 'image', bmp: 'image', svg: 'image', tif: 'image', tiff: 'image',
  mp4: 'video', m4v: 'video', mov: 'video', webm: 'video', mkv: 'video', avi: 'video', ogv: 'video',
  mp3: 'audio', m4a: 'audio', aac: 'audio', wav: 'audio', flac: 'audio',
  ogg: 'audio', oga: 'audio', opus: 'audio', wma: 'audio', aiff: 'audio', caf: 'audio',
};

/**
 * Mime types that carry no information. Browsers, `multipart/form-data` posts,
 * and half the file pickers in existence hand back one of these for a file they
 * could not sniff, so they must fall through to the name rather than winning.
 */
const VAGUE_MIME = new Set(['application/octet-stream', 'binary/octet-stream', 'application/download']);

/**
 * Picks the renderer for an attachment.
 *
 * The mime type is trusted first - it is what the sender's platform actually
 * measured - with two exceptions that matter in practice: a parameterised type
 * (`image/jpeg; charset=binary`) has its parameters stripped, and the
 * placeholder types above are ignored so a `clip.mp4` posted as
 * `application/octet-stream` still plays instead of becoming a download link.
 *
 * The file name is a URL as often as it is a name - callers pass `attachment.url`
 * when they have nothing else - so the path, query, and fragment are stripped
 * before the extension is read.
 */
export function attachmentKind(mimeType?: string, fileName?: string): AttachmentKind {
  const mime = (mimeType ?? '').split(';')[0]?.trim().toLowerCase() ?? '';
  if (mime !== '' && !VAGUE_MIME.has(mime)) {
    if (mime.startsWith('image/')) return 'image';
    if (mime.startsWith('video/')) return 'video';
    if (mime.startsWith('audio/')) return 'audio';
  }
  return EXTENSION_KINDS[extensionOf(fileName ?? '')] ?? 'file';
}

/** The lowercased extension of a name or URL, or '' when it has none. */
function extensionOf(nameOrUrl: string): string {
  const path = nameOrUrl.split(/[?#]/)[0] ?? '';
  const base = path.split('/').pop() ?? '';
  const dot = base.lastIndexOf('.');
  // `dot <= 0` covers both "no extension" and a dotfile like `.gitignore`,
  // whose leading dot is part of the name rather than a type.
  return dot <= 0 ? '' : base.slice(dot + 1).toLowerCase();
}

/**
 * Orders delivery states so the *smallest* rank is the one a group should
 * advertise.
 *
 * `sending` through `read` is the natural progression. `failed` is ranked below
 * all of them, which is not chronologically true - a failed send got further
 * than one still queued - but is the right summary: a run holding one failed
 * message must show failed, because it is the only state that asks the user to
 * do something. Ranking it lowest makes that fall out of a plain minimum
 * instead of needing a special case at every call site.
 */
export function deliveryRank(status: DeliveryStatus): number {
  switch (status) {
    case 'failed':
      return 0;
    case 'sending':
      return 1;
    case 'sent':
      return 2;
    case 'delivered':
      return 3;
    case 'read':
      return 4;
  }
}

/**
 * The status a stack of messages should show: the least advanced of the ones
 * that carry a status.
 *
 * Messages with no status are received messages, which have no outbound state
 * to report, so they are skipped rather than dragging the group to "unknown" -
 * otherwise a single received message in a run would silently hide the sender's
 * own failed send.
 */
export function leastDelivery(statuses: (DeliveryStatus | undefined)[]): DeliveryStatus | undefined {
  let lowest: DeliveryStatus | undefined;
  for (const status of statuses) {
    if (status === undefined) continue;
    if (lowest === undefined || deliveryRank(status) < deliveryRank(lowest)) lowest = status;
  }
  return lowest;
}
