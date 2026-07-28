import { describe, expect, it } from 'vitest';
import { groupMessages, insertSeparators, type ChatMessage } from '../src/chat.ts';
import {
  ANNOUNCE_INTERVAL_MS,
  AT_BOTTOM_EPSILON_PX,
  SCROLL_TO_LATEST_REVEAL_PX,
  countMessagesAfter,
  defaultTranscriptLabels,
  distanceFromBottom,
  drainAnnouncement,
  formatTranscriptLabel,
  idleAnnouncer,
  isAtBottom,
  lastMessageId,
  prependedCount,
  queueArrivals,
  shouldShowScrollToLatest,
  transcriptAdjustment,
  transcriptDayLabel,
  unreadBelow,
  unreadIndex,
} from '../src/transcript.ts';

const DAY = 86_400_000;

/** A viewport with `distance` pixels of content still below it. */
const at = (distance: number) => ({ scrollTop: 1000 - distance, scrollHeight: 1300, clientHeight: 300 });

function message(id: string, authorId: string, atMs: number): ChatMessage {
  return { id, authorId, at: atMs };
}

describe('distanceFromBottom', () => {
  it('measures what is still hidden below', () => {
    expect(distanceFromBottom({ scrollTop: 0, scrollHeight: 1000, clientHeight: 300 })).toBe(700);
    expect(distanceFromBottom({ scrollTop: 700, scrollHeight: 1000, clientHeight: 300 })).toBe(0);
  });

  it('clamps overscroll to zero', () => {
    // iOS rubber-banding and a trackpad flick both report a scrollTop past the
    // end; a negative distance would read as "beyond the bottom" downstream.
    expect(distanceFromBottom({ scrollTop: 780, scrollHeight: 1000, clientHeight: 300 })).toBe(0);
  });
});

describe('isAtBottom', () => {
  it('tolerates sub-pixel rounding rather than requiring an exact zero', () => {
    expect(isAtBottom({ scrollTop: 699.4, scrollHeight: 1000, clientHeight: 300 })).toBe(true);
  });

  it('stops counting once a whole line is hidden', () => {
    expect(isAtBottom(at(AT_BOTTOM_EPSILON_PX))).toBe(true);
    expect(isAtBottom(at(AT_BOTTOM_EPSILON_PX + 1))).toBe(false);
  });
});

describe('shouldShowScrollToLatest', () => {
  it('never shows at the bottom, whatever is unread', () => {
    expect(shouldShowScrollToLatest(at(0), { unread: 12, shown: true })).toBe(false);
  });

  it('shows for any unread message, however small the scroll', () => {
    // One notch up from the bottom with something waiting still needs the
    // affordance: the alternative is a message that silently never gets read.
    expect(shouldShowScrollToLatest(at(AT_BOTTOM_EPSILON_PX + 1), { unread: 1 })).toBe(true);
  });

  it('otherwise waits for a deliberate scroll', () => {
    expect(shouldShowScrollToLatest(at(SCROLL_TO_LATEST_REVEAL_PX))).toBe(false);
    expect(shouldShowScrollToLatest(at(SCROLL_TO_LATEST_REVEAL_PX + 1))).toBe(true);
  });

  it('holds still once shown, so nothing flickers under a dragging finger', () => {
    // Inside the reveal distance but well clear of the bottom: it would have to
    // re-cross the appear boundary to be hidden, and only the bottom hides it.
    expect(shouldShowScrollToLatest(at(100), { shown: true })).toBe(true);
    expect(shouldShowScrollToLatest(at(100), { shown: false })).toBe(false);
  });
});

describe('unreadIndex / unreadBelow', () => {
  const groups = groupMessages([
    message('a', 'ana', 0),
    message('b', 'bo', DAY),
    message('c', 'bo', DAY + 1000),
  ]);
  const items = insertSeparators(groups, { unreadAnchorId: 'b' });

  it('finds the divider', () => {
    expect(unreadIndex(items)).toBeGreaterThan(0);
    expect(items[unreadIndex(items)]?.kind).toBe('unread');
  });

  it('is -1 when everything has been read', () => {
    expect(unreadIndex(insertSeparators(groups))).toBe(-1);
  });

  it('reports the divider count while away, and nothing once at the bottom', () => {
    expect(unreadBelow(items, false)).toBe(2);
    // Not a geometric count: it must not tick down as the reader drags.
    expect(unreadBelow(items, true)).toBe(0);
  });
});

describe('transcriptAdjustment', () => {
  const base = { prepended: false, scrollHeight: 1000, previousScrollHeight: 1000 };

  it('pins to the bottom for a reader who was already there', () => {
    // Outranks the anchor: being at the end is how you ask to see what arrives.
    expect(
      transcriptAdjustment({ ...base, atBottom: true, anchorOffset: 500, previousAnchorOffset: 100 }),
    ).toEqual({ kind: 'pin-bottom' });
  });

  it('shifts by the anchor row\'s own movement', () => {
    expect(
      transcriptAdjustment({ ...base, atBottom: false, anchorOffset: 1000, previousAnchorOffset: 100 }),
    ).toEqual({ kind: 'anchor', delta: 900 });
  });

  it('does nothing when the anchor row did not move, which is the append case', () => {
    expect(
      transcriptAdjustment({
        ...base,
        atBottom: false,
        anchorOffset: 100,
        previousAnchorOffset: 100,
        scrollHeight: 1600,
      }),
    ).toEqual({ kind: 'none' });
  });

  it('falls back to the height delta only when the anchor is gone AND it was a prepend', () => {
    expect(
      transcriptAdjustment({ atBottom: false, prepended: true, scrollHeight: 1600, previousScrollHeight: 1000 }),
    ).toEqual({ kind: 'anchor', delta: 600 });
    // Same growth, no prepend: correcting here would scroll the reader down by
    // the height of a message they never asked to see.
    expect(
      transcriptAdjustment({ atBottom: false, prepended: false, scrollHeight: 1600, previousScrollHeight: 1000 }),
    ).toEqual({ kind: 'none' });
  });
});

describe('prependedCount', () => {
  const items = [{ key: 'x' }, { key: 'y' }, { key: 'z' }];

  it('counts rows inserted above the previous first row', () => {
    expect(prependedCount('z', items)).toBe(2);
  });

  it('is zero when nothing was inserted, or the key is unknown or gone', () => {
    expect(prependedCount('x', items)).toBe(0);
    expect(prependedCount(undefined, items)).toBe(0);
    expect(prependedCount('missing', items)).toBe(0);
  });
});

describe('lastMessageId / countMessagesAfter', () => {
  const items = insertSeparators(
    groupMessages([message('a', 'ana', 0), message('b', 'ana', 1000), message('c', 'bo', 2000)]),
  );

  it('finds the tail past a trailing separator', () => {
    expect(lastMessageId(items)).toBe('c');
    expect(lastMessageId([])).toBeUndefined();
  });

  it('counts only what came after the known tail', () => {
    expect(countMessagesAfter(items, 'a')).toBe(2);
    expect(countMessagesAfter(items, 'c')).toBe(0);
  });

  it('counts nothing for an unknown tail, so a prepend announces nothing', () => {
    // A transcript that has lost its own tail has no meaningful arrival count,
    // and silence is the right failure.
    expect(countMessagesAfter(items, undefined)).toBe(0);
    expect(countMessagesAfter(items, 'gone')).toBe(0);
  });
});

describe('the announcer', () => {
  it('speaks the first arrival immediately', () => {
    const queued = queueArrivals(idleAnnouncer, 1);
    const { state, count } = drainAnnouncement(queued, 5_000);
    expect(count).toBe(1);
    expect(state).toEqual({ pending: 0, lastAt: 5_000 });
  });

  it('coalesces a burst into one announcement instead of dropping any', () => {
    let state = queueArrivals(idleAnnouncer, 1);
    state = drainAnnouncement(state, 1_000).state;
    state = queueArrivals(state, 2);
    state = queueArrivals(state, 3);

    // Too soon: it stays silent AND keeps the tally.
    const early = drainAnnouncement(state, 1_500);
    expect(early.count).toBe(0);
    expect(early.state.pending).toBe(5);

    const due = drainAnnouncement(state, 1_000 + ANNOUNCE_INTERVAL_MS);
    expect(due.count).toBe(5);
    expect(due.state.pending).toBe(0);
  });

  it('stays silent with nothing pending, and ignores nonsense arrivals', () => {
    expect(drainAnnouncement(idleAnnouncer, 9_000).count).toBe(0);
    expect(queueArrivals(idleAnnouncer, -3)).toBe(idleAnnouncer);
    expect(queueArrivals(idleAnnouncer, Number.NaN)).toBe(idleAnnouncer);
  });
});

describe('transcriptDayLabel', () => {
  const now = new Date(2026, 6, 27, 12, 0).getTime();
  const on = (y: number, m: number, d: number) => new Date(y, m, d, 9, 0).getTime();

  it('adds a today rung the bubble stamps have no use for', () => {
    expect(transcriptDayLabel(on(2026, 6, 27), now).kind).toBe('today');
  });

  it('reuses the chat ladder below it rather than re-deriving it', () => {
    expect(transcriptDayLabel(on(2026, 6, 26), now).kind).toBe('yesterday');
    expect(transcriptDayLabel(on(2026, 6, 24), now).kind).toBe('weekday');
    expect(transcriptDayLabel(on(2026, 2, 3), now).kind).toBe('date');
    expect(transcriptDayLabel(on(2024, 2, 3), now).kind).toBe('dateWithYear');
  });

  it('never returns a clock, whatever the hour', () => {
    for (const days of [0, 1, 3, 40, 900]) {
      expect(transcriptDayLabel(now - days * DAY, now).kind).not.toBe('time');
    }
  });
});

describe('labels', () => {
  it('interpolates the same {name} syntax the kit catalog uses', () => {
    expect(formatTranscriptLabel(defaultTranscriptLabels.newMessageCount, { count: 4 })).toBe('4 new messages');
    // An unknown placeholder is left alone rather than blanked, so a bad
    // translation degrades to visible nonsense instead of a missing word.
    expect(formatTranscriptLabel('{a} {b}', { a: 1 })).toBe('1 {b}');
  });
});
