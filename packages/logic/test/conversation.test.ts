import { describe, expect, it } from 'vitest';
import {
  CONVERSATION_MARKER_ORDER,
  CONVERSATION_SNIPPET_MAX,
  UNREAD_DISPLAY_MAX,
  conversationBadge,
  conversationMarkers,
  conversationMetaMarkers,
  conversationMetrics,
  conversationOrder,
  conversationPrefixMarker,
  conversationRowHeight,
  conversationSectionLabel,
  conversationSnippet,
  conversationStateLabels,
  conversationTimestamp,
  conversationTimestampBucket,
  conversationTimestampLabel,
  conversationWindow,
  defaultConversationLabels,
  formatUnreadCount,
  groupConversations,
  moveConversationCursor,
  truncateSnippet,
  type ConversationSummary,
} from '../src/conversation.ts';

const conversation = (over: Partial<ConversationSummary> = {}): ConversationSummary => ({
  id: 'c1',
  name: 'Ada Lovelace',
  ...over,
});

describe('marker precedence', () => {
  it('orders every marker the way the spec declares', () => {
    expect([...CONVERSATION_MARKER_ORDER]).toEqual(['failed', 'draft', 'unread', 'muted', 'pinned']);
  });

  it('lists only the markers a conversation carries, in precedence order', () => {
    expect(conversationMarkers(conversation({ pinned: true, unreadCount: 2 }))).toEqual(['unread', 'pinned']);
    expect(conversationMarkers(conversation())).toEqual([]);
  });

  it('gives the snippet prefix to a failed send over a draft', () => {
    expect(conversationPrefixMarker(conversation({ failed: true, draft: true }))).toBe('failed');
    expect(conversationPrefixMarker(conversation({ draft: true }))).toBe('draft');
    expect(conversationPrefixMarker(conversation())).toBeNull();
  });

  it('lets every marker coexist: each owns a different slot', () => {
    const everything = conversation({
      pinned: true,
      muted: true,
      draft: true,
      failed: true,
      unreadCount: 4,
    });
    // prefix slot takes one...
    expect(conversationPrefixMarker(everything)).toBe('failed');
    // ...the meta slot takes both quiet glyphs...
    expect(conversationMetaMarkers(everything)).toEqual(['pinned', 'muted']);
    // ...and the badge still shows the count, so nothing is lost
    expect(conversationBadge(everything)?.count).toBe(4);
  });

  it('demotes the badge rather than hiding it when muted', () => {
    expect(conversationBadge(conversation({ unreadCount: 3 }))?.tone).toBe('danger');
    expect(conversationBadge(conversation({ unreadCount: 3, muted: true }))?.tone).toBe('neutral');
    expect(conversationBadge(conversation({ unreadCount: 0 }))).toBeNull();
  });
});

describe('unread count', () => {
  it('caps at 99+', () => {
    expect(UNREAD_DISPLAY_MAX).toBe(99);
    expect(formatUnreadCount(1)).toBe('1');
    expect(formatUnreadCount(99)).toBe('99');
    expect(formatUnreadCount(100)).toBe('99+');
    expect(formatUnreadCount(4821)).toBe('99+');
  });

  it('settles nonsense at zero rather than printing NaN', () => {
    expect(formatUnreadCount(Number.NaN)).toBe('0');
    expect(formatUnreadCount(-5)).toBe('0');
  });
});

describe('snippet', () => {
  it('collapses a multi-line message to one line', () => {
    expect(truncateSnippet('one\ntwo   three\t four')).toBe('one two three four');
  });

  it('leaves a short message alone', () => {
    expect(truncateSnippet('see you there')).toBe('see you there');
  });

  it('cuts on a word boundary and marks the cut', () => {
    const long = 'lorem ipsum dolor sit amet '.repeat(10);
    const out = truncateSnippet(long);
    expect(out.length).toBeLessThanOrEqual(CONVERSATION_SNIPPET_MAX + 1);
    expect(out.endsWith('…')).toBe(true);
    // never mid-word: the character before the ellipsis closes a word
    expect(out.slice(-2, -1)).not.toBe(' ');
    expect(long.startsWith(out.slice(0, -1))).toBe(true);
  });

  it('cuts a single over-long word where it lands rather than dropping it', () => {
    const out = truncateSnippet('a'.repeat(400));
    expect(out).toBe(`${'a'.repeat(CONVERSATION_SNIPPET_MAX)}…`);
  });

  it('spends the sender from outside the budget so it survives truncation', () => {
    const out = conversationSnippet({ sender: 'Grace', snippet: 'lorem ipsum '.repeat(40) });
    expect(out.startsWith('Grace: ')).toBe(true);
    expect(out.endsWith('…')).toBe(true);
  });

  it('handles a sender with no message and a message with no sender', () => {
    expect(conversationSnippet({ sender: 'Grace' })).toBe('Grace');
    expect(conversationSnippet({ snippet: 'hi' })).toBe('hi');
    expect(conversationSnippet({})).toBe('');
  });
});

describe('timestamps', () => {
  const now = new Date(2026, 6, 27, 14, 30); // Monday 27 July 2026

  it('reads today as a time', () => {
    const at = new Date(2026, 6, 27, 9, 5);
    expect(conversationTimestampBucket(at, now)).toBe('time');
    expect(conversationTimestamp(at, { now, locale: 'en-US' })).toBe('9:05 AM');
  });

  it('reads the last week as a weekday', () => {
    const yesterday = new Date(2026, 6, 26, 9, 5);
    expect(conversationTimestampBucket(yesterday, now)).toBe('weekday');
    expect(conversationTimestamp(yesterday, { now, locale: 'en-US' })).toBe('Sun');
  });

  it('reads anything older as a date', () => {
    const old = new Date(2026, 5, 2, 9, 5);
    expect(conversationTimestampBucket(old, now)).toBe('date');
    expect(conversationTimestamp(old, { now, locale: 'en-US' })).toBe('6/2/26');
  });

  it('puts the boundary at seven days', () => {
    expect(conversationTimestampBucket(new Date(2026, 6, 21), now)).toBe('weekday');
    expect(conversationTimestampBucket(new Date(2026, 6, 20), now)).toBe('date');
  });

  it('treats a future timestamp as today rather than falling through to a date', () => {
    expect(conversationTimestampBucket(new Date(2026, 6, 28), now)).toBe('time');
  });

  it('spells the timestamp out in full for the hidden phrase', () => {
    expect(conversationTimestampLabel(new Date(2026, 6, 26, 9, 5), 'en-US')).toContain('2026');
  });

  it('returns nothing for an unusable date instead of "Invalid Date"', () => {
    expect(conversationTimestamp(Number.NaN)).toBe('');
    expect(conversationTimestampLabel(new Date('nope'))).toBe('');
  });
});

describe('sections', () => {
  const items = [
    conversation({ id: 'a', pinned: true }),
    conversation({ id: 'b' }),
    conversation({ id: 'c', pinned: true }),
  ];

  it('lifts pinned conversations into their own section, keeping the given order', () => {
    expect(groupConversations(items).map((s) => [s.id, s.items.map((i) => i.id)])).toEqual([
      ['pinned', ['a', 'c']],
      ['all', ['b']],
    ]);
  });

  it('drops an empty section rather than rendering a headerless one', () => {
    expect(groupConversations([conversation({ id: 'b' })]).map((s) => s.id)).toEqual(['all']);
    expect(groupConversations([])).toEqual([]);
  });

  it('collapses to one run when ungrouped', () => {
    const flat = groupConversations(items, false);
    expect(flat).toHaveLength(1);
    expect(conversationOrder(flat)).toEqual(['a', 'b', 'c']);
  });

  it('flattens to visual order across sections, which is what posinset counts', () => {
    expect(conversationOrder(groupConversations(items))).toEqual(['a', 'c', 'b']);
  });

  it('names each section from the shared labels', () => {
    expect(conversationSectionLabel('pinned', defaultConversationLabels)).toBe('Pinned');
    expect(conversationSectionLabel('all', defaultConversationLabels)).toBe('All conversations');
  });
});

describe('keyboard cursor', () => {
  const ids = ['a', 'b', 'c'];

  it('steps down and up', () => {
    expect(moveConversationCursor(ids, 'a', 'ArrowDown')).toBe('b');
    expect(moveConversationCursor(ids, 'b', 'ArrowUp')).toBe('a');
  });

  it('clamps at the ends instead of wrapping, so the viewport never teleports', () => {
    expect(moveConversationCursor(ids, 'c', 'ArrowDown')).toBe('c');
    expect(moveConversationCursor(ids, 'a', 'ArrowUp')).toBe('a');
  });

  it('enters at the near end when nothing is focused yet', () => {
    expect(moveConversationCursor(ids, undefined, 'ArrowDown')).toBe('a');
    expect(moveConversationCursor(ids, undefined, 'ArrowUp')).toBe('c');
  });

  it('jumps to the ends', () => {
    expect(moveConversationCursor(ids, 'b', 'Home')).toBe('a');
    expect(moveConversationCursor(ids, 'b', 'End')).toBe('c');
  });

  it('leaves keys it does not own alone', () => {
    expect(moveConversationCursor(ids, 'b', 'k')).toBeUndefined();
    expect(moveConversationCursor([], undefined, 'ArrowDown')).toBeUndefined();
  });
});

describe('accessible phrases', () => {
  it('spells out every marker in precedence order', () => {
    const phrases = conversationStateLabels(
      conversation({ unreadCount: 120, muted: true, pinned: true, failed: true }),
      defaultConversationLabels,
    );
    expect(phrases).toEqual(['Not delivered', '99+ unread', 'Muted', 'Pinned']);
  });

  it('says nothing about a plain conversation', () => {
    expect(conversationStateLabels(conversation(), defaultConversationLabels)).toEqual([]);
  });
});

describe('geometry', () => {
  it('resolves each density to spec token names, never raw values', () => {
    for (const density of ['compact', 'comfortable'] as const) {
      const m = conversationMetrics(density);
      for (const value of [m.height, m.paddingInline, m.gap, m.radius, m.fontSize])
        expect(value.startsWith('$')).toBe(false);
      expect(m.height).not.toMatch(/rem|px/);
    }
  });

  it('steps the two densities apart', () => {
    const compact = conversationMetrics('compact');
    const comfortable = conversationMetrics('comfortable');
    expect(compact.height).not.toBe(comfortable.height);
    expect(compact.avatar).toBe('sm');
    expect(comfortable.avatar).toBe('md');
    expect(conversationRowHeight('compact')).toBeLessThan(conversationRowHeight('comfortable'));
  });
});

describe('windowing seam', () => {
  it('renders everything, with no struts, when it has no viewport', () => {
    expect(conversationWindow({ total: 500, rowHeight: 64 })).toEqual({
      start: 0,
      end: 500,
      padStart: 0,
      padEnd: 0,
    });
  });

  it('windows once it is given a viewport, and the struts hold the rest of the height', () => {
    const w = conversationWindow({
      total: 500,
      rowHeight: 64,
      scrollTop: 6400,
      viewportHeight: 640,
      overscan: 2,
    });
    expect(w.start).toBe(98); // row 100, less the overscan
    expect(w.end).toBe(113);
    // the struts stand in for exactly the rows that are not rendered
    expect(w.padStart).toBe(98 * 64);
    expect(w.padEnd).toBe((500 - 113) * 64);
  });

  it('clamps at both ends of the list', () => {
    const top = conversationWindow({ total: 10, rowHeight: 64, viewportHeight: 640 });
    expect(top.start).toBe(0);
    expect(top.end).toBe(10);
    expect(top.padStart).toBe(0);
    expect(top.padEnd).toBe(0);
    expect(conversationWindow({ total: 0, rowHeight: 64, viewportHeight: 640 }).end).toBe(0);
  });
});
