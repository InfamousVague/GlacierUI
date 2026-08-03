import { describe, expect, it } from 'vitest';
import {
  aggregateReactions,
  attachmentKind,
  bubblePosition,
  chatDayKey,
  daysBetween,
  deliveryRank,
  deliveryStatuses,
  formatMessageTimestamp,
  formatTyping,
  groupMessages,
  insertSeparators,
  leastDelivery,
  messageTimestamp,
  typingText,
  CHAT_GROUP_WINDOW_MS,
  type ChatMessage,
  type DeliveryStatus,
  type Reaction,
} from '../src/chat.ts';

/**
 * The grouping rules are the contract the whole chat suite renders against, so
 * these pin the edges rather than the happy path: the exact window boundary,
 * the day crossing, the backwards clock, and the divider that must not move.
 *
 * Every moment is built with the local-date constructor so the suite reads the
 * same in any timezone - an ISO string with a `Z` would land on a different
 * calendar day for anyone east or west of Greenwich and take the day-boundary
 * assertions with it.
 */
const at = (y: number, m: number, d: number, h = 12, min = 0, s = 0): number =>
  new Date(y, m - 1, d, h, min, s).getTime();

const MINUTE = 60_000;

let seq = 0;
const msg = (partial: Partial<ChatMessage> & { authorId: string; at: number }): ChatMessage => ({
  id: partial.id ?? `m${(seq += 1)}`,
  text: partial.text ?? 'hi',
  ...partial,
});

describe('groupMessages', () => {
  it('returns nothing for an empty log', () => {
    expect(groupMessages([])).toEqual([]);
  });

  it('makes one group from one message', () => {
    const only = msg({ id: 'a', authorId: 'ana', at: at(2024, 3, 3, 9, 41) });
    const [group] = groupMessages([only]);
    expect(group?.messages).toEqual([only]);
    expect(group?.authorId).toBe('ana');
  });

  it('keeps one author talking in a single run', () => {
    const groups = groupMessages([
      msg({ authorId: 'ana', at: at(2024, 3, 3, 9, 41) }),
      msg({ authorId: 'ana', at: at(2024, 3, 3, 9, 42) }),
      msg({ authorId: 'ana', at: at(2024, 3, 3, 9, 43) }),
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0]?.messages).toHaveLength(3);
  });

  it('breaks when the author changes', () => {
    const groups = groupMessages([
      msg({ authorId: 'ana', at: at(2024, 3, 3, 9, 41) }),
      msg({ authorId: 'bo', at: at(2024, 3, 3, 9, 41, 10) }),
      msg({ authorId: 'ana', at: at(2024, 3, 3, 9, 41, 20) }),
    ]);
    expect(groups.map((g) => g.authorId)).toEqual(['ana', 'bo', 'ana']);
  });

  it('breaks when the pause is longer than the window', () => {
    const start = at(2024, 3, 3, 9, 41);
    const groups = groupMessages([
      msg({ authorId: 'ana', at: start }),
      msg({ authorId: 'ana', at: start + 6 * MINUTE }),
    ]);
    expect(groups).toHaveLength(2);
  });

  it('holds the run together at exactly the window edge', () => {
    // The window is inclusive: a pause of precisely five minutes is still one
    // burst, so the boundary is a rule rather than a rounding accident.
    const start = at(2024, 3, 3, 9, 41);
    const groups = groupMessages([
      msg({ authorId: 'ana', at: start }),
      msg({ authorId: 'ana', at: start + CHAT_GROUP_WINDOW_MS }),
    ]);
    expect(groups).toHaveLength(1);
  });

  it('breaks one millisecond past the window edge', () => {
    const start = at(2024, 3, 3, 9, 41);
    const groups = groupMessages([
      msg({ authorId: 'ana', at: start }),
      msg({ authorId: 'ana', at: start + CHAT_GROUP_WINDOW_MS + 1 }),
    ]);
    expect(groups).toHaveLength(2);
  });

  it('measures the pause from the previous message, not the start of the run', () => {
    // Three minutes apart each: a run may span far more than the window as long
    // as nobody stopped talking for longer than it.
    const start = at(2024, 3, 3, 9, 0);
    const groups = groupMessages([
      msg({ authorId: 'ana', at: start }),
      msg({ authorId: 'ana', at: start + 3 * MINUTE }),
      msg({ authorId: 'ana', at: start + 6 * MINUTE }),
      msg({ authorId: 'ana', at: start + 9 * MINUTE }),
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0]?.messages).toHaveLength(4);
  });

  it('breaks across a day boundary even inside the window', () => {
    // Two minutes apart, but a date row belongs between them.
    const groups = groupMessages([
      msg({ authorId: 'ana', at: at(2024, 3, 3, 23, 59) }),
      msg({ authorId: 'ana', at: at(2024, 3, 4, 0, 1) }),
    ]);
    expect(groups).toHaveLength(2);
    expect(groups.map((g) => g.dayKey)).toEqual(['2024-03-03', '2024-03-04']);
  });

  it('honours a custom window', () => {
    const start = at(2024, 3, 3, 9, 41);
    const messages = [
      msg({ authorId: 'ana', at: start }),
      msg({ authorId: 'ana', at: start + 30_000 }),
    ];
    expect(groupMessages(messages, { windowMs: 10_000 })).toHaveLength(2);
    expect(groupMessages(messages, { windowMs: 60_000 })).toHaveLength(1);
  });

  it('isolates a message that refuses to merge', () => {
    const groups = groupMessages([
      msg({ authorId: 'ana', at: at(2024, 3, 3, 9, 41) }),
      msg({ id: 'sys', authorId: 'ana', at: at(2024, 3, 3, 9, 41, 30), breaksGroup: true }),
      msg({ authorId: 'ana', at: at(2024, 3, 3, 9, 42) }),
    ]);
    // Same author on both sides, so without the flag this would be one run.
    expect(groups).toHaveLength(3);
    expect(groups[1]?.messages.map((m) => m.id)).toEqual(['sys']);
  });

  it('breaks the message after a forced break as well as the one before', () => {
    const groups = groupMessages([
      msg({ id: 'sys', authorId: 'system', at: at(2024, 3, 3, 9, 41), breaksGroup: true }),
      msg({ id: 'sys2', authorId: 'system', at: at(2024, 3, 3, 9, 41, 5), breaksGroup: true }),
    ]);
    // Two notices in a row are two rows, never a stack of notices.
    expect(groups).toHaveLength(2);
  });

  it('keeps a slightly backwards timestamp in the run', () => {
    // Optimistic sends and unsynced clients routinely stamp a message a few
    // seconds behind its predecessor; that must not reshape the layout.
    const start = at(2024, 3, 3, 9, 41);
    const groups = groupMessages([
      msg({ authorId: 'ana', at: start }),
      msg({ authorId: 'ana', at: start - 4000 }),
    ]);
    expect(groups).toHaveLength(1);
  });

  it('breaks on a large backwards jump', () => {
    const start = at(2024, 3, 3, 9, 41);
    const groups = groupMessages([
      msg({ authorId: 'ana', at: start }),
      msg({ authorId: 'ana', at: start - 20 * MINUTE }),
    ]);
    expect(groups).toHaveLength(2);
  });

  it('does not reorder an out-of-order log', () => {
    // The caller owns the transcript order; grouping only ever collapses it.
    const groups = groupMessages([
      msg({ id: 'c', authorId: 'ana', at: at(2024, 3, 3, 12, 0) }),
      msg({ id: 'a', authorId: 'ana', at: at(2024, 3, 3, 9, 0) }),
      msg({ id: 'b', authorId: 'ana', at: at(2024, 3, 3, 10, 0) }),
    ]);
    expect(groups.map((g) => g.id)).toEqual(['c', 'a', 'b']);
  });

  it('takes its id from the first message, so appending never remounts the run', () => {
    const first = msg({ id: 'a', authorId: 'ana', at: at(2024, 3, 3, 9, 41) });
    const second = msg({ id: 'b', authorId: 'ana', at: at(2024, 3, 3, 9, 42) });
    expect(groupMessages([first])[0]?.id).toBe('a');
    expect(groupMessages([first, second])[0]?.id).toBe('a');
  });

  it('spans the run with startedAt and endedAt', () => {
    const start = at(2024, 3, 3, 9, 41);
    const end = start + 2 * MINUTE;
    const [group] = groupMessages([
      msg({ authorId: 'ana', at: start }),
      msg({ authorId: 'ana', at: start + MINUTE }),
      msg({ authorId: 'ana', at: end }),
    ]);
    expect(group?.startedAt).toBe(start);
    expect(group?.endedAt).toBe(end);
  });

  it('reports the least advanced status of the run', () => {
    const start = at(2024, 3, 3, 9, 41);
    const [group] = groupMessages([
      msg({ authorId: 'ana', at: start, status: 'read' }),
      msg({ authorId: 'ana', at: start + 1000, status: 'sending' }),
      msg({ authorId: 'ana', at: start + 2000, status: 'delivered' }),
    ]);
    expect(group?.status).toBe('sending');
  });

  it('surfaces a failed send from anywhere in the run', () => {
    const start = at(2024, 3, 3, 9, 41);
    const [group] = groupMessages([
      msg({ authorId: 'ana', at: start, status: 'read' }),
      msg({ authorId: 'ana', at: start + 1000, status: 'failed' }),
    ]);
    expect(group?.status).toBe('failed');
  });

  it('leaves the status unset for received messages', () => {
    const [group] = groupMessages([msg({ authorId: 'bo', at: at(2024, 3, 3, 9, 41) })]);
    expect(group?.status).toBeUndefined();
  });

  it('marks a lone forced break as standalone', () => {
    const groups = groupMessages([
      msg({ authorId: 'system', at: at(2024, 3, 3, 9, 41), breaksGroup: true }),
      msg({ authorId: 'ana', at: at(2024, 3, 3, 9, 42) }),
    ]);
    expect(groups[0]?.standalone).toBe(true);
    expect(groups[1]?.standalone).toBe(false);
  });

  it('never reports a fresh group as continued', () => {
    // Only the divider split in insertSeparators sets that flag.
    const groups = groupMessages([msg({ authorId: 'ana', at: at(2024, 3, 3, 9, 41) })]);
    expect(groups[0]?.continued).toBe(false);
  });

  it('carries a caller subtype through untouched', () => {
    interface Rich extends ChatMessage {
      threadId: string;
    }
    const rich: Rich = { id: 'a', authorId: 'ana', at: at(2024, 3, 3), threadId: 't1' };
    const [group] = groupMessages<Rich>([rich]);
    expect(group?.messages[0]?.threadId).toBe('t1');
    // and the very same object, not a copy - identity is what memoisation reads
    expect(group?.messages[0]).toBe(rich);
  });

  it('does not mutate the log it was given', () => {
    const messages = [
      msg({ authorId: 'ana', at: at(2024, 3, 3, 9, 41) }),
      msg({ authorId: 'bo', at: at(2024, 3, 3, 9, 42) }),
    ];
    const snapshot = [...messages];
    groupMessages(messages);
    expect(messages).toEqual(snapshot);
  });

  it('is pure: the same log groups the same way twice', () => {
    const messages = [
      msg({ authorId: 'ana', at: at(2024, 3, 3, 9, 41) }),
      msg({ authorId: 'bo', at: at(2024, 3, 3, 9, 55) }),
    ];
    expect(groupMessages(messages)).toEqual(groupMessages(messages));
  });
});

describe('bubblePosition', () => {
  it('calls a run of one "only"', () => {
    expect(bubblePosition(0, 1)).toBe('only');
  });

  it('walks a run of three', () => {
    expect(bubblePosition(0, 3)).toBe('first');
    expect(bubblePosition(1, 3)).toBe('middle');
    expect(bubblePosition(2, 3)).toBe('last');
  });

  it('has no middle in a run of two', () => {
    expect(bubblePosition(0, 2)).toBe('first');
    expect(bubblePosition(1, 2)).toBe('last');
  });

  it('clamps an index past the end rather than throwing', () => {
    // A virtualised list can ask about a row it has not rendered yet.
    expect(bubblePosition(9, 3)).toBe('last');
  });

  it('clamps a negative index', () => {
    expect(bubblePosition(-2, 3)).toBe('first');
  });

  it('treats an empty or negative run as a single bubble', () => {
    expect(bubblePosition(0, 0)).toBe('only');
    expect(bubblePosition(0, -1)).toBe('only');
  });
});

describe('chatDayKey and daysBetween', () => {
  it('keys a moment by its local calendar day', () => {
    expect(chatDayKey(at(2024, 3, 3, 23, 59))).toBe('2024-03-03');
  });

  it('counts zero days within one day', () => {
    expect(daysBetween(at(2024, 3, 3, 0, 1), at(2024, 3, 3, 23, 59))).toBe(0);
  });

  it('counts one day across midnight, however short the gap', () => {
    expect(daysBetween(at(2024, 3, 3, 23, 59), at(2024, 3, 4, 0, 1))).toBe(1);
  });

  it('goes negative into the future', () => {
    expect(daysBetween(at(2024, 3, 5), at(2024, 3, 3))).toBe(-2);
  });

  it('counts whole days across a DST changeover', () => {
    // Rounding the division is what survives a 23- or 25-hour day; the US
    // spring-forward Sunday is 2024-03-10.
    expect(daysBetween(at(2024, 3, 9, 12), at(2024, 3, 11, 12))).toBe(2);
  });
});

describe('messageTimestamp', () => {
  const now = at(2024, 3, 10, 15, 0);

  it('shows the clock for today', () => {
    const stamp = messageTimestamp(at(2024, 3, 10, 9, 41), now);
    expect(stamp.kind).toBe('time');
    expect(stamp.format).toEqual({ hour: 'numeric', minute: '2-digit' });
    expect(stamp.daysAgo).toBe(0);
  });

  it('names yesterday', () => {
    const stamp = messageTimestamp(at(2024, 3, 9, 23, 59), now);
    expect(stamp.kind).toBe('yesterday');
    expect(stamp.daysAgo).toBe(1);
  });

  it('names the weekday within the last week', () => {
    expect(messageTimestamp(at(2024, 3, 7, 9), now).kind).toBe('weekday');
    expect(messageTimestamp(at(2024, 3, 5, 9), now).format).toEqual({ weekday: 'long' });
  });

  it('still names the weekday six days back', () => {
    expect(messageTimestamp(at(2024, 3, 4, 9), now).kind).toBe('weekday');
  });

  it('drops the weekday at exactly seven days, where it would name two days', () => {
    const stamp = messageTimestamp(at(2024, 3, 3, 9), now);
    expect(stamp.daysAgo).toBe(7);
    expect(stamp.kind).toBe('date');
  });

  it('shows a bare date inside the same year', () => {
    const stamp = messageTimestamp(at(2024, 1, 3, 9), now);
    expect(stamp.kind).toBe('date');
    expect(stamp.format).toEqual({ month: 'short', day: 'numeric' });
  });

  it('adds the year once it is another one', () => {
    const stamp = messageTimestamp(at(2023, 12, 31, 23, 59), now);
    expect(stamp.kind).toBe('dateWithYear');
    expect(stamp.format.year).toBe('numeric');
  });

  it('carries the moment through untouched, so the caller formats from the source', () => {
    const moment = at(2024, 3, 10, 9, 41, 30);
    expect(messageTimestamp(moment, now).at).toBe(moment);
  });

  it('forces the clock for the time style, however old the message', () => {
    expect(messageTimestamp(at(2019, 5, 1), now, 'time').kind).toBe('time');
  });

  it('forces a date for the date style, even today', () => {
    expect(messageTimestamp(at(2024, 3, 10, 9), now, 'date').kind).toBe('date');
  });

  it('never says "yesterday" in the date style, which a separator row must not', () => {
    expect(messageTimestamp(at(2024, 3, 9, 9), now, 'date').kind).toBe('date');
  });

  it('keeps the year in the date style for another year', () => {
    expect(messageTimestamp(at(2022, 3, 9, 9), now, 'date').kind).toBe('dateWithYear');
  });

  it('shows the clock for a moment a few seconds into the future', () => {
    // Sender clock skew stamps arrivals slightly ahead; "in 4 seconds" is noise.
    const stamp = messageTimestamp(now + 4000, now);
    expect(stamp.kind).toBe('time');
    expect(stamp.daysAgo).toBe(0);
  });

  it('shows a date for a moment days into the future, never a relative phrase', () => {
    const stamp = messageTimestamp(at(2024, 3, 14, 9), now);
    expect(stamp.daysAgo).toBe(-4);
    expect(stamp.kind).toBe('date');
  });
});

describe('formatMessageTimestamp', () => {
  const now = at(2024, 3, 10, 15, 0);

  it('spells the clock', () => {
    const text = formatMessageTimestamp(messageTimestamp(at(2024, 3, 10, 9, 41), now), 'en-US');
    expect(text).toMatch(/9:41/);
  });

  it('spells yesterday as a word rather than "1 day ago"', () => {
    const text = formatMessageTimestamp(messageTimestamp(at(2024, 3, 9, 9), now), 'en-US');
    expect(text.toLowerCase()).toContain('yesterday');
  });

  it('spells a short date', () => {
    expect(formatMessageTimestamp(messageTimestamp(at(2024, 1, 3, 9), now), 'en-US')).toBe('Jan 3');
  });

  it('spells a dated year', () => {
    expect(formatMessageTimestamp(messageTimestamp(at(2022, 1, 3, 9), now), 'en-US')).toContain('2022');
  });

  it('translates without a catalog', () => {
    // The whole point of returning a decision instead of a string: another
    // locale needs no new entry anywhere in the kit.
    const text = formatMessageTimestamp(messageTimestamp(at(2024, 3, 9, 9), now), 'es');
    expect(text.toLowerCase()).toContain('ayer');
  });
});

describe('insertSeparators', () => {
  const conversation = (): ChatMessage[] => [
    { id: 'a', authorId: 'ana', at: at(2024, 3, 3, 9, 41) },
    { id: 'b', authorId: 'ana', at: at(2024, 3, 3, 9, 42) },
    { id: 'c', authorId: 'bo', at: at(2024, 3, 4, 10, 0) },
    { id: 'd', authorId: 'bo', at: at(2024, 3, 4, 10, 1) },
  ];
  const sequence = (options?: Parameters<typeof insertSeparators>[1]) =>
    insertSeparators(groupMessages(conversation()), options);

  it('returns nothing for an empty transcript', () => {
    expect(insertSeparators([])).toEqual([]);
  });

  it('opens with a date row', () => {
    expect(sequence()[0]).toMatchObject({ kind: 'day', dayKey: '2024-03-03' });
  });

  it('emits one date row per day, not per group', () => {
    const days = sequence().filter((item) => item.kind === 'day');
    expect(days.map((d) => (d.kind === 'day' ? d.dayKey : ''))).toEqual(['2024-03-03', '2024-03-04']);
  });

  it('suppresses the date rows on request', () => {
    expect(sequence({ dayHeaders: false }).every((item) => item.kind === 'group')).toBe(true);
  });

  it('leaves out the divider when nothing is unread', () => {
    expect(sequence().some((item) => item.kind === 'unread')).toBe(false);
  });

  it('places the divider immediately before the anchor group', () => {
    const items = sequence({ unreadAnchorId: 'c' });
    const index = items.findIndex((item) => item.kind === 'unread');
    const after = items[index + 1];
    expect(after?.kind).toBe('group');
    expect(after?.kind === 'group' && after.group.messages[0]?.id).toBe('c');
  });

  it('keeps the anchor group whole when the divider lands at its head', () => {
    const items = sequence({ unreadAnchorId: 'c' });
    const groups = items.filter((item) => item.kind === 'group');
    expect(groups).toHaveLength(2);
  });

  it('splits a run so the divider lands before a mid-run message', () => {
    const items = sequence({ unreadAnchorId: 'd' });
    const groups = items.flatMap((item) => (item.kind === 'group' ? [item.group] : []));
    expect(groups.map((g) => g.messages.map((m) => m.id))).toEqual([['a', 'b'], ['c'], ['d']]);
  });

  it('marks the trailing half of a split run as continued', () => {
    const items = sequence({ unreadAnchorId: 'd' });
    const tail = items.flatMap((item) => (item.kind === 'group' ? [item.group] : [])).at(-1);
    // The renderer drops the repeated avatar, so one author does not read as two.
    expect(tail?.continued).toBe(true);
    expect(tail?.authorId).toBe('bo');
  });

  it('counts the unread run to the end of the transcript', () => {
    const divider = sequence({ unreadAnchorId: 'b' }).find((item) => item.kind === 'unread');
    expect(divider?.kind === 'unread' && divider.count).toBe(3);
  });

  it('stamps the divider with the anchor message time', () => {
    const divider = sequence({ unreadAnchorId: 'c' }).find((item) => item.kind === 'unread');
    expect(divider?.kind === 'unread' && divider.at).toBe(at(2024, 3, 4, 10, 0));
  });

  it('does not move the divider as new messages arrive', () => {
    // The reason the anchor is an id: the line stays put and only its count
    // grows, so nothing shifts under a reader mid-sentence.
    const before = insertSeparators(groupMessages(conversation()), { unreadAnchorId: 'c' });
    const later = insertSeparators(
      groupMessages([...conversation(), { id: 'e', authorId: 'bo', at: at(2024, 3, 4, 10, 2) }]),
      { unreadAnchorId: 'c' },
    );
    const index = (items: typeof before) => items.findIndex((item) => item.kind === 'unread');
    expect(index(later)).toBe(index(before));
    expect(later[index(later)]).toMatchObject({ key: 'unread:c', count: 3 });
  });

  it('raises the divider only once', () => {
    expect(sequence({ unreadAnchorId: 'a' }).filter((item) => item.kind === 'unread')).toHaveLength(1);
  });

  it('shows the divider above everything when the whole conversation is unread', () => {
    const items = sequence({ unreadAnchorId: 'a' });
    // the date row still comes first: the divider belongs to the messages
    expect(items.map((item) => item.kind).slice(0, 3)).toEqual(['day', 'unread', 'group']);
  });

  it('falls back to the watermark when no anchor is pinned', () => {
    const divider = sequence({ lastReadAt: at(2024, 3, 3, 9, 41, 30) }).find((i) => i.kind === 'unread');
    expect(divider?.kind === 'unread' && divider.key).toBe('unread:b');
  });

  it('falls back to the watermark when the pinned anchor has gone', () => {
    // A pinned message can be deleted or paged out; the divider should not
    // vanish with it.
    const divider = sequence({
      unreadAnchorId: 'deleted',
      lastReadAt: at(2024, 3, 3, 9, 41, 30),
    }).find((i) => i.kind === 'unread');
    expect(divider?.kind === 'unread' && divider.key).toBe('unread:b');
  });

  it('never raises the divider on the viewer’s own message', () => {
    // Sending from another window must not mark your own words unread.
    const divider = sequence({ lastReadAt: at(2024, 3, 3, 9, 41, 30), viewerId: 'ana' }).find(
      (i) => i.kind === 'unread',
    );
    expect(divider?.kind === 'unread' && divider.key).toBe('unread:c');
  });

  it('leaves the divider out when the watermark is past everything', () => {
    expect(sequence({ lastReadAt: at(2024, 3, 5) }).some((i) => i.kind === 'unread')).toBe(false);
  });

  it('honours an explicit anchor on the viewer’s own message', () => {
    // The caller pinned it deliberately - usually "mark unread from here".
    const divider = sequence({ unreadAnchorId: 'a', viewerId: 'ana' }).find((i) => i.kind === 'unread');
    expect(divider?.kind === 'unread' && divider.key).toBe('unread:a');
  });

  it('keys every row uniquely and by identity rather than position', () => {
    const keys = sequence({ unreadAnchorId: 'd' }).map((item) => item.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).toEqual(['day:2024-03-03', 'group:a', 'day:2024-03-04', 'group:c', 'unread:d', 'group:d']);
  });
});

describe('aggregateReactions', () => {
  const reactions: Reaction[] = [
    { emoji: '👍', actorId: 'ana' },
    { emoji: '🎉', actorId: 'bo' },
    { emoji: '👍', actorId: 'cy' },
    { emoji: '👍', actorId: 'bo' },
  ];

  it('returns nothing for no reactions', () => {
    expect(aggregateReactions([])).toEqual([]);
  });

  it('tallies each emoji', () => {
    const summary = aggregateReactions(reactions);
    expect(summary.map((s) => [s.emoji, s.count])).toEqual([
      ['👍', 3],
      ['🎉', 1],
    ]);
  });

  it('orders by first appearance, so a chip never moves under a finger', () => {
    // Count order would put 👍 first here too - the tell is that 🎉, with one
    // reaction, stays ahead of an emoji that arrives later with more.
    const summary = aggregateReactions([
      { emoji: '🎉', actorId: 'ana' },
      { emoji: '👍', actorId: 'bo' },
      { emoji: '👍', actorId: 'cy' },
    ]);
    expect(summary.map((s) => s.emoji)).toEqual(['🎉', '👍']);
  });

  it('counts a replayed reaction once', () => {
    const summary = aggregateReactions([
      { emoji: '👍', actorId: 'ana' },
      { emoji: '👍', actorId: 'ana', at: 2 },
    ]);
    expect(summary[0]?.count).toBe(1);
    expect(summary[0]?.actors).toEqual(['ana']);
  });

  it('lets one actor react with several emoji', () => {
    const summary = aggregateReactions([
      { emoji: '👍', actorId: 'ana' },
      { emoji: '🎉', actorId: 'ana' },
    ]);
    expect(summary.map((s) => s.count)).toEqual([1, 1]);
  });

  it('flags the viewer’s own reaction', () => {
    const summary = aggregateReactions(reactions, 'cy');
    expect(summary[0]?.reactedByViewer).toBe(true);
    expect(summary[1]?.reactedByViewer).toBe(false);
  });

  it('flags nothing when there is no viewer', () => {
    expect(aggregateReactions(reactions).every((s) => !s.reactedByViewer)).toBe(true);
  });

  it('flags the viewer even when they reacted last', () => {
    expect(aggregateReactions(reactions, 'bo')[0]?.reactedByViewer).toBe(true);
  });

  it('lists the actors in first-seen order for the tooltip', () => {
    expect(aggregateReactions(reactions)[0]?.actors).toEqual(['ana', 'cy', 'bo']);
  });

  it('does not mutate the records it was given', () => {
    const input: Reaction[] = [{ emoji: '👍', actorId: 'ana' }];
    aggregateReactions(input, 'ana');
    expect(input).toEqual([{ emoji: '👍', actorId: 'ana' }]);
  });
});

describe('typingText', () => {
  it('says nothing when nobody is typing', () => {
    expect(typingText([])).toEqual({ key: 'none', names: [], others: 0, total: 0 });
  });

  it('resolves one typist', () => {
    expect(typingText(['Ana'])).toMatchObject({ key: 'one', names: ['Ana'], others: 0 });
  });

  it('resolves two typists', () => {
    expect(typingText(['Ana', 'Bo'])).toMatchObject({ key: 'two', names: ['Ana', 'Bo'], others: 0 });
  });

  it('gives a slot back to the summary on overflow', () => {
    // Two names would fit, but "and N others" needs a slot of its own.
    expect(typingText(['Ana', 'Bo', 'Cy'])).toMatchObject({ key: 'many', names: ['Ana'], others: 2 });
  });

  it('counts the others behind a single name', () => {
    expect(typingText(['Ana', 'Bo', 'Cy', 'Di'])).toMatchObject({ key: 'many', names: ['Ana'], others: 3 });
  });

  it('uses the several shape when the row has room for three', () => {
    expect(typingText(['Ana', 'Bo', 'Cy'], 3)).toMatchObject({ key: 'several', others: 0 });
  });

  it('overflows a wider row at its own limit', () => {
    expect(typingText(['Ana', 'Bo', 'Cy', 'Di', 'Ed'], 3)).toMatchObject({
      key: 'many',
      names: ['Ana', 'Bo'],
      others: 3,
    });
  });

  it('always reports the true total, shown or not', () => {
    expect(typingText(['Ana', 'Bo', 'Cy', 'Di']).total).toBe(4);
  });

  it('drops a name that has not loaded yet', () => {
    expect(typingText(['Ana', '   ', 'Bo'])).toMatchObject({ key: 'two', names: ['Ana', 'Bo'] });
  });

  it('says nothing when every name is blank', () => {
    expect(typingText(['', ' ']).key).toBe('none');
  });

  it('still shows one name when asked for none', () => {
    // A row with no names is not an indicator; clamp rather than render "and 3
    // others" with nobody named.
    expect(typingText(['Ana', 'Bo', 'Cy'], 0)).toMatchObject({ names: ['Ana'], others: 2 });
  });

  it('keeps the caller’s order', () => {
    expect(typingText(['Zoe', 'Ana'], 2).names).toEqual(['Zoe', 'Ana']);
  });
});

describe('formatTyping', () => {
  const templates = {
    one: '{first} is typing',
    two: '{first} and {last} are typing',
    several: '{names} are typing',
    many: '{first} and {count} others are typing',
  };

  it('renders one name', () => {
    expect(formatTyping(typingText(['Ana']), templates)).toBe('Ana is typing');
  });

  it('renders a pair', () => {
    expect(formatTyping(typingText(['Ana', 'Bo']), templates)).toBe('Ana and Bo are typing');
  });

  it('renders the overflow summary', () => {
    expect(formatTyping(typingText(['Ana', 'Bo', 'Cy', 'Di']), templates)).toBe(
      'Ana and 3 others are typing',
    );
  });

  it('joins a list with the caller’s own joiner', () => {
    const state = typingText(['Ana', 'Bo', 'Cy'], 3);
    const spelled = formatTyping(state, templates, (names) =>
      new Intl.ListFormat('en', { type: 'conjunction' }).format(names),
    );
    expect(spelled).toBe('Ana, Bo, and Cy are typing');
  });

  it('falls back to a plain comma join', () => {
    expect(formatTyping(typingText(['Ana', 'Bo', 'Cy'], 3), templates)).toBe('Ana, Bo, Cy are typing');
  });

  it('renders nothing when nobody is typing', () => {
    expect(formatTyping(typingText([]), templates)).toBe('');
  });

  it('uses the none template when one is supplied', () => {
    expect(formatTyping(typingText([]), { ...templates, none: 'quiet' })).toBe('quiet');
  });

  it('leaves an unknown placeholder alone rather than printing "undefined"', () => {
    expect(formatTyping(typingText(['Ana']), { ...templates, one: '{who} types' })).toBe('{who} types');
  });

  it('renders a template that reorders its slots, as a translation will', () => {
    const rtl = { ...templates, two: '{last} 和 {first} 正在输入' };
    expect(formatTyping(typingText(['Ana', 'Bo']), rtl)).toBe('Bo 和 Ana 正在输入');
  });
});

describe('attachmentKind', () => {
  it('reads the mime type first', () => {
    expect(attachmentKind('image/png')).toBe('image');
    expect(attachmentKind('video/mp4')).toBe('video');
    expect(attachmentKind('audio/mpeg')).toBe('audio');
  });

  it('files anything else', () => {
    expect(attachmentKind('application/pdf', 'report.pdf')).toBe('file');
  });

  it('strips mime parameters', () => {
    expect(attachmentKind('image/jpeg; charset=binary')).toBe('image');
  });

  it('ignores mime case and padding', () => {
    expect(attachmentKind('  IMAGE/PNG ')).toBe('image');
  });

  it('falls through a placeholder mime to the file name', () => {
    // The commonest real failure: a picker that could not sniff the file.
    expect(attachmentKind('application/octet-stream', 'clip.mp4')).toBe('video');
    expect(attachmentKind('binary/octet-stream', 'song.flac')).toBe('audio');
  });

  it('uses the name when there is no mime type at all', () => {
    expect(attachmentKind(undefined, 'holiday.HEIC')).toBe('image');
  });

  it('reads the extension out of a URL', () => {
    expect(attachmentKind(undefined, 'https://cdn.example.com/a/b/photo.webp?v=2&token=x')).toBe('image');
  });

  it('ignores a fragment', () => {
    expect(attachmentKind(undefined, '/media/clip.mov#t=10')).toBe('video');
  });

  it('keeps svg an image', () => {
    expect(attachmentKind('image/svg+xml')).toBe('image');
  });

  it('files an unknown extension', () => {
    expect(attachmentKind(undefined, 'archive.tar.gz')).toBe('file');
  });

  it('files a name with no extension', () => {
    expect(attachmentKind(undefined, 'Makefile')).toBe('file');
  });

  it('files a dotfile, whose leading dot is part of its name', () => {
    expect(attachmentKind(undefined, '.gitignore')).toBe('file');
  });

  it('files an attachment it knows nothing about', () => {
    expect(attachmentKind()).toBe('file');
    expect(attachmentKind('', '')).toBe('file');
  });

  it('reads a directory that looks like an extension without tripping over it', () => {
    expect(attachmentKind(undefined, '/photos.old/notes')).toBe('file');
  });
});

describe('deliveryRank', () => {
  it('advances through the outbound states', () => {
    expect(deliveryRank('sending')).toBeLessThan(deliveryRank('sent'));
    expect(deliveryRank('sent')).toBeLessThan(deliveryRank('delivered'));
    expect(deliveryRank('delivered')).toBeLessThan(deliveryRank('read'));
  });

  it('ranks a failure below everything, so a plain minimum surfaces it', () => {
    for (const status of deliveryStatuses) {
      if (status === 'failed') continue;
      expect(deliveryRank('failed')).toBeLessThan(deliveryRank(status));
    }
  });

  it('gives every status its own rank', () => {
    const ranks = deliveryStatuses.map(deliveryRank);
    expect(new Set(ranks).size).toBe(deliveryStatuses.length);
  });
});

describe('leastDelivery', () => {
  it('reports nothing for an empty run', () => {
    expect(leastDelivery([])).toBeUndefined();
  });

  it('reports nothing when no message carries a status', () => {
    expect(leastDelivery([undefined, undefined])).toBeUndefined();
  });

  it('skips the received messages rather than letting them win', () => {
    // A received message has no outbound state; treating it as "unknown" would
    // hide a failed send sitting next to it.
    expect(leastDelivery([undefined, 'failed', undefined])).toBe('failed');
  });

  it('picks the least advanced of a mixed run', () => {
    const statuses: DeliveryStatus[] = ['read', 'delivered', 'sent'];
    expect(leastDelivery(statuses)).toBe('sent');
  });

  it('lets a failure beat a still-sending message', () => {
    expect(leastDelivery(['sending', 'failed'])).toBe('failed');
  });

  it('reports read only when the whole run has been read', () => {
    expect(leastDelivery(['read', 'read'])).toBe('read');
  });
});
