import { describe, expect, it } from 'vitest';
import {
  firstCommandCursor,
  highlightSegments,
  groupCommands,
  isCommandShortcut,
  matchCommands,
  moveCommandCursor,
  type CommandDescriptor,
} from '../src/command-palette.ts';

const commands: CommandDescriptor[] = [
  { id: 'new', label: 'New file', group: 'File', shortcut: '⌘N' },
  { id: 'open', label: 'Open…', group: 'File', keywords: 'load import' },
  { id: 'save', label: 'Save', group: 'File', disabled: true },
  { id: 'theme', label: 'Toggle theme', group: 'View', keywords: 'dark light appearance' },
  { id: 'zen', label: 'Zen mode', group: 'View' },
];

describe('matchCommands', () => {
  it('returns everything for an empty query, in the caller order', () => {
    const matches = matchCommands(commands, '');
    expect(matches.map((m) => m.item.id)).toEqual(['new', 'open', 'save', 'theme', 'zen']);
  });

  it('treats a whitespace-only query as empty', () => {
    expect(matchCommands(commands, '   ')).toHaveLength(commands.length);
  });

  it('matches the label case-insensitively', () => {
    expect(matchCommands(commands, 'ZEN').map((m) => m.item.id)).toEqual(['zen']);
  });

  it('matches the group as well as the label', () => {
    expect(matchCommands(commands, 'view').map((m) => m.item.id)).toEqual(['theme', 'zen']);
  });

  it('matches keywords and reports which one hit', () => {
    const [match] = matchCommands(commands, 'dark');
    expect(match?.item.id).toBe('theme');
    expect(match?.matchedKeyword).toBe('dark');
  });

  it('surfaces the tightest keyword run when several terms hit only keywords', () => {
    const items = [
      { id: 'song', label: 'A Song', keywords: 'artist album hey, girl you know the rest of the lyric goes here' },
    ];
    const [match] = matchCommands(items, 'girl you know');
    expect(match?.matchedKeyword).toBe('…girl you know…');
  });

  it('leaves matchedKeyword unset when the label itself matched', () => {
    const [match] = matchCommands(commands, 'toggle');
    expect(match?.item.id).toBe('theme');
    expect(match?.matchedKeyword).toBeUndefined();
  });

  it('stamps flat indices that are contiguous over the survivors', () => {
    // The indices address the rendered list, not the source array, so a
    // filtered list must renumber from zero or the cursor addresses the wrong
    // row.
    const matches = matchCommands(commands, 'view');
    expect(matches.map((m) => m.index)).toEqual([0, 1]);
  });

  it('returns nothing when the query matches nothing', () => {
    expect(matchCommands(commands, 'xyzzy')).toEqual([]);
  });

  it('keeps disabled commands in the results', () => {
    // Listed so its absence is not mysterious; the cursor is what skips it.
    expect(matchCommands(commands, 'save').map((m) => m.item.id)).toEqual(['save']);
  });
});

describe('groupCommands', () => {
  it('collects adjacent runs under their heading', () => {
    const groups = groupCommands(matchCommands(commands, ''));
    expect(groups.map((g) => g.group)).toEqual(['File', 'View']);
    expect(groups[0]?.matches.map((m) => m.item.id)).toEqual(['new', 'open', 'save']);
  });

  it('preserves the caller order rather than gathering groups globally', () => {
    const interleaved: CommandDescriptor[] = [
      { id: 'a', label: 'A', group: 'One' },
      { id: 'b', label: 'B', group: 'Two' },
      { id: 'c', label: 'C', group: 'One' },
    ];
    const groups = groupCommands(matchCommands(interleaved, ''));
    expect(groups.map((g) => g.group)).toEqual(['One', 'Two', 'One']);
  });

  it('keeps the flat index so grouped rendering and keyboard order agree', () => {
    const groups = groupCommands(matchCommands(commands, ''));
    expect(groups.flatMap((g) => g.matches.map((m) => m.index))).toEqual([0, 1, 2, 3, 4]);
  });

  it('files ungrouped commands under no heading', () => {
    const groups = groupCommands(matchCommands([{ id: 'a', label: 'A' }], ''));
    expect(groups).toEqual([{ group: undefined, matches: [{ item: { id: 'a', label: 'A' }, matchedKeyword: undefined, index: 0 }] }]);
  });

  it('returns nothing for no matches', () => {
    expect(groupCommands([])).toEqual([]);
  });
});

describe('moveCommandCursor', () => {
  const all = matchCommands(commands, '');

  it('steps forward', () => {
    expect(moveCommandCursor(all, 0, 1)).toBe(1);
  });

  it('skips a disabled row', () => {
    // index 2 is `save`, disabled - down from `open` lands on `theme`.
    expect(moveCommandCursor(all, 1, 1)).toBe(3);
  });

  it('skips a disabled row going backwards too', () => {
    expect(moveCommandCursor(all, 3, -1)).toBe(1);
  });

  it('wraps past the end', () => {
    expect(moveCommandCursor(all, 4, 1)).toBe(0);
  });

  it('wraps past the start', () => {
    expect(moveCommandCursor(all, 0, -1)).toBe(4);
  });

  it('reports no cursor for an empty list', () => {
    expect(moveCommandCursor([], 0, 1)).toBe(-1);
  });

  it('reports no cursor when every row is disabled', () => {
    // Walks a full lap and gives up rather than looping forever.
    const none = matchCommands([{ id: 'a', label: 'A', disabled: true }], '');
    expect(moveCommandCursor(none, 0, 1)).toBe(-1);
  });

  it('finds the one runnable row from anywhere', () => {
    const mostly = matchCommands(
      [
        { id: 'a', label: 'A', disabled: true },
        { id: 'b', label: 'B', disabled: true },
        { id: 'c', label: 'C' },
      ],
      '',
    );
    expect(moveCommandCursor(mostly, 0, 1)).toBe(2);
  });
});

describe('firstCommandCursor', () => {
  it('lands on the top row', () => {
    expect(firstCommandCursor(matchCommands(commands, ''))).toBe(0);
  });

  it('skips a disabled first row', () => {
    const matches = matchCommands([{ id: 'a', label: 'A', disabled: true }, { id: 'b', label: 'B' }], '');
    expect(firstCommandCursor(matches)).toBe(1);
  });

  it('reports no cursor for an empty list', () => {
    expect(firstCommandCursor([])).toBe(-1);
  });
});

describe('isCommandShortcut', () => {
  it('accepts Cmd+K', () => {
    expect(isCommandShortcut({ key: 'k', metaKey: true })).toBe(true);
  });

  it('accepts Ctrl+K', () => {
    expect(isCommandShortcut({ key: 'k', ctrlKey: true })).toBe(true);
  });

  it('accepts an uppercase K, as a held Shift reports it', () => {
    expect(isCommandShortcut({ key: 'K', metaKey: true })).toBe(true);
  });

  it('rejects a bare K', () => {
    expect(isCommandShortcut({ key: 'k' })).toBe(false);
  });

  it('rejects another modified key', () => {
    expect(isCommandShortcut({ key: 'j', metaKey: true })).toBe(false);
  });
});

describe('matchCommands - keyword and multi-term search', () => {
  const kit = [
    { id: 'slider', label: 'Slider', group: 'Atoms', keywords: 'form input range value drag' },
    { id: 'seekbar', label: 'Seek Bar', group: 'Atoms', keywords: 'audio video media player scrub sound' },
    { id: 'playercard', label: 'Player Card', group: 'Molecules', keywords: 'audio music media player track' },
    { id: 'modal', label: 'Modal', group: 'Organisms', keywords: 'overlay popup dialog window' },
    { id: 'progress', label: 'Progress Bar', group: 'Atoms', keywords: 'feedback loading percent' },
  ];
  const ids = (query: string) => matchCommands(kit, query).map((m) => m.item.id);

  it('finds a component by a concept it never names', () => {
    // The whole point: "audio" appears in no label.
    expect(ids('audio')).toEqual(['seekbar', 'playercard']);
  });

  it('finds a component by a synonym of its own name', () => {
    expect(ids('popup')).toEqual(['modal']);
  });

  it('ANDs the terms, so a second word narrows rather than widens', () => {
    expect(ids('audio')).toHaveLength(2);
    expect(ids('audio music')).toEqual(['playercard']);
  });

  it('matches terms across different fields', () => {
    // "media" is a keyword, "card" is in the label; neither field holds both.
    expect(ids('media card')).toEqual(['playercard']);
  });

  it('drops an item when any single term misses', () => {
    expect(ids('audio nonsense')).toEqual([]);
  });

  it('ignores extra whitespace between terms', () => {
    expect(ids('  audio   music  ')).toEqual(['playercard']);
  });

  it('ranks a label hit above a keyword hit', () => {
    // Slider names itself; SeekBar merely lists 'scrub'... but both hold 'bar'.
    expect(ids('bar')).toEqual(['seekbar', 'progress']);
  });

  it('ranks a label prefix above a mid-label match', () => {
    const items = [
      { id: 'mid', label: 'Rich Text Editor' },
      { id: 'prefix', label: 'Text Area' },
    ];
    expect(matchCommands(items, 'text').map((m) => m.item.id)).toEqual(['prefix', 'mid']);
  });

  it('ranks by the worst term, so a whole-query match wins', () => {
    const items = [
      { id: 'half', label: 'Audio', keywords: 'zzz' },
      { id: 'whole', label: 'Audio Player', keywords: '' },
    ];
    // Both match 'audio' at tier 0; only 'whole' matches 'player' in its label.
    expect(matchCommands(items, 'audio player').map((m) => m.item.id)).toEqual(['whole']);
  });

  it('keeps the caller’s order within a tier', () => {
    // All three match 'a' only via keywords, so nothing reorders them.
    const items = [
      { id: 'first', label: 'One', keywords: 'alpha' },
      { id: 'second', label: 'Two', keywords: 'alpha' },
      { id: 'third', label: 'Three', keywords: 'alpha' },
    ];
    expect(matchCommands(items, 'alpha').map((m) => m.item.id)).toEqual(['first', 'second', 'third']);
  });

  it('reports the keyword that earned the hit, for the row to explain itself', () => {
    const [hit] = matchCommands(kit, 'audio');
    expect(hit!.matchedKeyword).toBe('audio');
  });

  it('names no keyword when the label already explains the hit', () => {
    const [hit] = matchCommands(kit, 'modal');
    expect(hit!.matchedKeyword).toBeUndefined();
  });

  it('renumbers indices to the ranked order, so the cursor follows the eye', () => {
    const matches = matchCommands(kit, 'bar');
    expect(matches.map((m) => m.index)).toEqual([0, 1]);
  });

  it('treats a regex-special query as literal text, not a pattern', () => {
    const items = [{ id: 'a', label: 'C++ Guide' }, { id: 'b', label: 'Anything' }];
    expect(matchCommands(items, 'c++').map((m) => m.item.id)).toEqual(['a']);
    expect(() => matchCommands(items, '(')).not.toThrow();
  });

  it('still returns everything, in the given order, for an empty query', () => {
    expect(ids('')).toEqual(kit.map((k) => k.id));
    expect(ids('   ')).toEqual(kit.map((k) => k.id));
  });
});

describe('highlightSegments', () => {
  const marked = (text: string, query: string) =>
    highlightSegments(text, query)
      .filter((s) => s.match)
      .map((s) => s.text);

  it('returns the whole string unmarked for an empty query', () => {
    expect(highlightSegments('Rich Text Editor', '')).toEqual([{ text: 'Rich Text Editor', match: false }]);
  });

  it('returns the whole string unmarked when nothing lands', () => {
    expect(highlightSegments('Button', 'zzz')).toEqual([{ text: 'Button', match: false }]);
  });

  it('marks a single term', () => {
    expect(marked('Rich Text Editor', 'rich')).toEqual(['Rich']);
  });

  it('marks each term of a multi-term query', () => {
    // Matching ANDs terms across fields, so highlighting has to be term-wise
    // too - marking the whole query as one string would mark nothing here.
    expect(marked('Rich Text Editor', 'rich editor')).toEqual(['Rich', 'Editor']);
  });

  it('is case-insensitive but preserves the original casing', () => {
    expect(marked('Rich Text Editor', 'RICH')).toEqual(['Rich']);
  });

  it('marks every occurrence, not just the first', () => {
    expect(marked('text and more text', 'text')).toEqual(['text', 'text']);
  });

  it('merges overlapping hits into one run', () => {
    // 'text' and 'extra' overlap; two marks would paint a seam mid-word.
    const segments = highlightSegments('textra', 'text extra');
    expect(segments.filter((s) => s.match)).toHaveLength(1);
  });

  it('merges touching runs so no zero-width gap appears between them', () => {
    expect(marked('abcd', 'ab cd')).toEqual(['abcd']);
  });

  it('reassembles to exactly the original string', () => {
    const text = 'Rich Text Editor';
    for (const q of ['', 'rich', 'rich editor', 'zzz', 'e']) {
      expect(highlightSegments(text, q).map((s) => s.text).join('')).toBe(text);
    }
  });

  it('handles an empty label', () => {
    expect(highlightSegments('', 'rich')).toEqual([{ text: '', match: false }]);
  });

  it('marks a leading hit without emitting an empty first segment', () => {
    expect(highlightSegments('Button', 'butt')[0]).toEqual({ text: 'Butt', match: true });
  });
});
