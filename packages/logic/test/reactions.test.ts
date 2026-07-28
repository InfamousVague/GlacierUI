import { describe, expect, it } from 'vitest';
import { aggregateReactions, type Reaction } from '../src/chat.ts';
import {
  applyPending,
  defaultEmojiSet,
  formatReactionLabel,
  frequentReactions,
  moveGridCursor,
  optimisticReactions,
  orderMessageActions,
  reactionIntent,
  reactionLabelState,
  searchEmoji,
  splitMessageActions,
  splitReactions,
  MESSAGE_ACTION_INLINE_CAP,
  REACTION_DISPLAY_CAP,
  REACTION_PICKER_COLUMNS,
  type PendingReaction,
} from '../src/reactions.ts';

const r = (emoji: string, actorId: string): Reaction => ({ emoji, actorId });

const tally = (reactions: Reaction[], viewerId?: string) => aggregateReactions(reactions, viewerId);

describe('reactionIntent', () => {
  it('asks to add when the viewer has not reacted and to remove when they have', () => {
    expect(reactionIntent({ emoji: '👍', count: 2, reactedByViewer: false, actors: [] })).toBe('add');
    expect(reactionIntent({ emoji: '👍', count: 2, reactedByViewer: true, actors: [] })).toBe('remove');
    // A pill that has no tally at all is an add — this is the picker's path.
    expect(reactionIntent(undefined)).toBe('add');
  });
});

describe('applyPending', () => {
  it('appends a newly added emoji rather than inserting it', () => {
    const summaries = tally([r('🎉', 'a'), r('👍', 'b')], 'me');
    const out = applyPending(summaries, [{ emoji: '❤️', intent: 'add' }], 'me');
    // First-appearance order is the whole reason the bar is stable, so the new
    // pill can only ever land at the end.
    expect(out.map((s) => s.emoji)).toEqual(['🎉', '👍', '❤️']);
    expect(out[2]).toMatchObject({ count: 1, reactedByViewer: true, pending: true, actors: ['me'] });
  });

  it('increments an existing pill the viewer had not joined', () => {
    const summaries = tally([r('👍', 'a'), r('👍', 'b')], 'me');
    const out = applyPending(summaries, [{ emoji: '👍', intent: 'add' }], 'me');
    expect(out[0]).toMatchObject({ count: 3, reactedByViewer: true, pending: true });
    expect(out[0]?.actors).toEqual(['a', 'b', 'me']);
  });

  it('does not double-count an add the tally already reflects', () => {
    // The acknowledgement landed while the optimistic entry was still queued.
    const summaries = tally([r('👍', 'a'), r('👍', 'me')], 'me');
    const out = applyPending(summaries, [{ emoji: '👍', intent: 'add' }], 'me');
    expect(out[0]).toMatchObject({ count: 2, reactedByViewer: true, pending: true });
  });

  it('decrements on removal and keeps the pill while others are still on it', () => {
    const summaries = tally([r('👍', 'a'), r('👍', 'me')], 'me');
    const out = applyPending(summaries, [{ emoji: '👍', intent: 'remove' }], 'me');
    expect(out[0]).toMatchObject({ emoji: '👍', count: 1, reactedByViewer: false, pending: true });
    expect(out[0]?.actors).toEqual(['a']);
  });

  it('drops a pill the removal empties, instead of leaving a ghost at zero', () => {
    const summaries = tally([r('👍', 'me'), r('🎉', 'a')], 'me');
    const out = applyPending(summaries, [{ emoji: '👍', intent: 'remove' }], 'me');
    expect(out.map((s) => s.emoji)).toEqual(['🎉']);
  });

  it('ignores a removal for an emoji that is not there', () => {
    const summaries = tally([r('👍', 'a')], 'me');
    expect(applyPending(summaries, [{ emoji: '❤️', intent: 'remove' }], 'me')).toHaveLength(1);
  });

  it('never mutates the tally it was handed', () => {
    const summaries = tally([r('👍', 'a')], 'me');
    const before = JSON.stringify(summaries);
    applyPending(summaries, [{ emoji: '👍', intent: 'add' }], 'me');
    expect(JSON.stringify(summaries)).toBe(before);
  });

  it('marks nothing pending when nothing is in flight', () => {
    const out = applyPending(tally([r('👍', 'a')], 'me'));
    expect(out.every((s) => !s.pending)).toBe(true);
  });

  it('folds records and pending toggles together through optimisticReactions', () => {
    const pending: PendingReaction[] = [{ emoji: '🚀', intent: 'add' }];
    const out = optimisticReactions(aggregateReactions, [r('👍', 'a')], pending, 'me');
    expect(out.map((s) => s.emoji)).toEqual(['👍', '🚀']);
    expect(out[1]?.pending).toBe(true);
  });
});

describe('splitReactions', () => {
  const many = (n: number) =>
    Array.from({ length: n }, (_, i) => ({ emoji: String(i), count: 1, reactedByViewer: false, actors: [] }));

  it('shows everything when the bar fits', () => {
    expect(splitReactions(many(3), 8)).toMatchObject({ shown: many(3), hidden: [], overflow: 0 });
  });

  it('gives one slot back to the overflow chip, which occupies a slot of its own', () => {
    const split = splitReactions(many(12), 8);
    expect(split.shown).toHaveLength(7);
    expect(split.overflow).toBe(5);
    expect(split.hidden).toHaveLength(5);
  });

  it('always cuts the tail, never re-sorts', () => {
    const split = splitReactions(many(12), 8);
    expect(split.shown.map((s) => s.emoji)).toEqual(['0', '1', '2', '3', '4', '5', '6']);
  });

  it('defaults to the shared display cap and never shows nothing', () => {
    expect(splitReactions(many(20)).shown).toHaveLength(REACTION_DISPLAY_CAP - 1);
    expect(splitReactions(many(5), 0).shown).toHaveLength(1);
  });
});

describe('reaction labels', () => {
  it('picks a template from the count and whether the viewer is in it', () => {
    const at = (count: number, byViewer: boolean) =>
      reactionLabelState({ emoji: '👍', count, reactedByViewer: byViewer, actors: [] }).key;
    expect(at(1, false)).toBe('one');
    expect(at(3, false)).toBe('other');
    expect(at(1, true)).toBe('oneByViewer');
    expect(at(3, true)).toBe('otherByViewer');
  });

  it('spells the whole state, not just the glyph', () => {
    const state = reactionLabelState({ emoji: '👍', count: 3, reactedByViewer: true, actors: [] });
    expect(formatReactionLabel(state)).toBe('👍, 3 reactions, you reacted');
  });

  it('takes translated templates', () => {
    const state = reactionLabelState({ emoji: '❤️', count: 2, reactedByViewer: false, actors: [] });
    expect(
      formatReactionLabel(state, {
        one: '{emoji}, 1 réaction',
        other: '{emoji}, {count} réactions',
        oneByViewer: '',
        otherByViewer: '',
      }),
    ).toBe('❤️, 2 réactions');
  });
});

describe('moveGridCursor', () => {
  it('wraps horizontally in a single row', () => {
    expect(moveGridCursor(0, { key: 'ArrowLeft' }, 4)).toBe(3);
    expect(moveGridCursor(3, { key: 'ArrowRight' }, 4)).toBe(0);
  });

  it('inverts the horizontal arrows under RTL', () => {
    expect(moveGridCursor(1, { key: 'ArrowRight' }, 4, { rtl: true })).toBe(0);
    expect(moveGridCursor(1, { key: 'ArrowLeft' }, 4, { rtl: true })).toBe(2);
  });

  it('steps a whole row vertically and clamps rather than wrapping', () => {
    expect(moveGridCursor(1, { key: 'ArrowDown' }, 20, { columns: 8 })).toBe(9);
    expect(moveGridCursor(9, { key: 'ArrowUp' }, 20, { columns: 8 })).toBe(1);
    // Clamped: a wrap here would throw the eye across the whole panel.
    expect(moveGridCursor(1, { key: 'ArrowUp' }, 20, { columns: 8 })).toBe(1);
    expect(moveGridCursor(18, { key: 'ArrowDown' }, 20, { columns: 8 })).toBe(18);
  });

  it('jumps to the ends and leaves unknown keys alone', () => {
    expect(moveGridCursor(4, { key: 'Home' }, 9)).toBe(0);
    expect(moveGridCursor(4, { key: 'End' }, 9)).toBe(8);
    expect(moveGridCursor(4, { key: 'Enter' }, 9)).toBe(4);
    expect(moveGridCursor(4, { key: 'ArrowRight' }, 0)).toBe(0);
  });
});

describe('searchEmoji', () => {
  it('returns the set unchanged for an empty query, so clearing restores it', () => {
    expect(searchEmoji(defaultEmojiSet, '   ')).toHaveLength(defaultEmojiSet.length);
  });

  it('puts name-prefix matches above keyword matches', () => {
    const hits = searchEmoji(defaultEmojiSet, 'fire');
    expect(hits[0]?.emoji).toBe('🔥');
  });

  it('matches keywords as well as names', () => {
    expect(searchEmoji(defaultEmojiSet, 'lol').map((e) => e.emoji)).toContain('😂');
  });

  it('finds nothing for a query nothing answers', () => {
    expect(searchEmoji(defaultEmojiSet, 'zzzzz')).toEqual([]);
  });

  it('preserves the given order inside each band', () => {
    const set = [
      { emoji: 'a', name: 'party popper' },
      { emoji: 'b', name: 'partying face' },
    ];
    expect(searchEmoji(set, 'party').map((e) => e.emoji)).toEqual(['a', 'b']);
  });
});

describe('message actions', () => {
  const a = (id: string) => ({ id });

  it('sorts the reserved ids into the shared order', () => {
    expect(orderMessageActions([a('more'), a('thread'), a('react'), a('reply')]).map((x) => x.id)).toEqual([
      'react',
      'reply',
      'thread',
      'more',
    ]);
  });

  it('lands custom actions among the actions, just before more', () => {
    expect(orderMessageActions([a('more'), a('copy'), a('pin'), a('react')]).map((x) => x.id)).toEqual([
      'react',
      'copy',
      'pin',
      'more',
    ]);
  });

  it('keeps every action inline and grows no overflow when the set fits', () => {
    const split = splitMessageActions([a('react'), a('reply'), a('thread')], 3);
    expect(split.inline.map((x) => x.id)).toEqual(['react', 'reply', 'thread']);
    expect(split.overflow).toEqual([]);
  });

  it('gives one inline slot back to the more control when it overflows', () => {
    const split = splitMessageActions([a('react'), a('reply'), a('thread'), a('copy'), a('pin')], 3);
    expect(split.inline.map((x) => x.id)).toEqual(['react', 'reply']);
    expect(split.overflow.map((x) => x.id)).toEqual(['thread', 'copy', 'pin']);
  });

  it('defaults to the shared inline cap', () => {
    const many = Array.from({ length: 6 }, (_, i) => a(`x${i}`));
    expect(splitMessageActions(many).inline).toHaveLength(MESSAGE_ACTION_INLINE_CAP - 1);
  });
});

describe('shared constants', () => {
  it('opens the picker on exactly one full grid row of frequent glyphs', () => {
    expect(frequentReactions).toHaveLength(REACTION_PICKER_COLUMNS);
  });

  it('ships a starter emoji set that covers the frequent row', () => {
    for (const emoji of frequentReactions) {
      expect(defaultEmojiSet.some((e) => e.emoji === emoji)).toBe(true);
    }
  });
});
