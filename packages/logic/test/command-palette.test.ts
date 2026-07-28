import { describe, expect, it } from 'vitest';
import {
  firstCommandCursor,
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
    // index 2 is `save`, disabled — down from `open` lands on `theme`.
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
