import { describe, expect, it } from 'vitest';
import {
  activeMarks,
  insertLink,
  markForShortcut,
  toggleBlock,
  toggleMark,
} from '../src/rich-text.ts';

const sel = (start: number, end: number) => ({ start, end });

describe('toggleMark', () => {
  it('wraps a selection', () => {
    expect(toggleMark('hello world', sel(0, 5), 'bold')).toEqual({
      text: '**hello** world',
      selection: sel(2, 7),
    });
  });

  it('keeps the same words selected after wrapping', () => {
    const r = toggleMark('hello world', sel(0, 5), 'bold');
    expect(r.text.slice(r.selection.start, r.selection.end)).toBe('hello');
  });

  it('unwraps when the delimiters sit outside the selection', () => {
    // The user selected the word and pressed Bold again.
    expect(toggleMark('**hello** world', sel(2, 7), 'bold')).toEqual({
      text: 'hello world',
      selection: sel(0, 5),
    });
  });

  it('unwraps when the delimiters sit inside the selection', () => {
    // The user selected the whole `**hello**`.
    expect(toggleMark('**hello** world', sel(0, 9), 'bold')).toEqual({
      text: 'hello world',
      selection: sel(0, 5),
    });
  });

  it('round-trips', () => {
    const once = toggleMark('hello', sel(0, 5), 'italic');
    const twice = toggleMark(once.text, once.selection, 'italic');
    expect(twice.text).toBe('hello');
    expect(twice.selection).toEqual(sel(0, 5));
  });

  it('puts the caret between the markers for an empty selection', () => {
    // So pressing Bold and typing produces bold text, rather than leaving the
    // caret stranded after the markers.
    const r = toggleMark('', sel(0, 0), 'bold');
    expect(r.text).toBe('****');
    expect(r.selection).toEqual(sel(2, 2));
  });

  it('handles each mark', () => {
    expect(toggleMark('x', sel(0, 1), 'italic').text).toBe('_x_');
    expect(toggleMark('x', sel(0, 1), 'code').text).toBe('`x`');
    expect(toggleMark('x', sel(0, 1), 'strike').text).toBe('~~x~~');
  });

  it('nests different marks', () => {
    const bold = toggleMark('word', sel(0, 4), 'bold');
    const both = toggleMark(bold.text, bold.selection, 'italic');
    expect(both.text).toBe('**_word_**');
  });

  it('wraps mid-string without disturbing the rest', () => {
    expect(toggleMark('a big cat', sel(2, 5), 'bold').text).toBe('a **big** cat');
  });

  it('normalises a backwards selection', () => {
    expect(toggleMark('hello', sel(5, 0), 'bold').text).toBe('**hello**');
  });

  it('clamps a selection past the end rather than slicing out of bounds', () => {
    expect(toggleMark('hi', sel(0, 99), 'bold').text).toBe('**hi**');
  });

  it('does not mistake a too-short selection for a wrapped one', () => {
    // '**' alone is not `**x**`; wrapping it is correct.
    expect(toggleMark('**', sel(0, 2), 'bold').text).toBe('******');
  });
});

describe('activeMarks', () => {
  it('reports nothing for plain text', () => {
    expect(activeMarks('hello', sel(0, 5))).toEqual([]);
  });

  it('reports a mark whose delimiters are outside the selection', () => {
    expect(activeMarks('**hi**', sel(2, 4))).toContain('bold');
  });

  it('reports a mark whose delimiters are inside the selection', () => {
    expect(activeMarks('**hi**', sel(0, 6))).toContain('bold');
  });

  it('reports both when marks are nested', () => {
    const marks = activeMarks('**_hi_**', sel(3, 5));
    expect(marks).toContain('italic');
  });

  it('reports code separately from bold', () => {
    expect(activeMarks('`hi`', sel(1, 3))).toEqual(['code']);
  });
});

describe('toggleBlock', () => {
  it('prefixes the line the caret is on', () => {
    expect(toggleBlock('hello', sel(2, 2), 'quote').text).toBe('> hello');
  });

  it('prefixes every line the selection touches', () => {
    const r = toggleBlock('one\ntwo\nthree', sel(0, 7), 'bullet');
    expect(r.text).toBe('- one\n- two\nthree');
  });

  it('removes the prefix when every touched line has it', () => {
    const r = toggleBlock('> one\n> two', sel(0, 11), 'quote');
    expect(r.text).toBe('one\ntwo');
  });

  it('completes a mixed selection rather than undoing half of it', () => {
    // Some lines quoted, some not: a press should finish the job.
    const r = toggleBlock('> one\ntwo', sel(0, 9), 'quote');
    expect(r.text).toBe('> one\n> two');
  });

  it('numbers a list as it goes', () => {
    const r = toggleBlock('one\ntwo\nthree', sel(0, 13), 'number');
    expect(r.text).toBe('1. one\n2. two\n3. three');
  });

  it('removes a numbered list whatever the digits are', () => {
    // The literal prefix is "1. ", but line three carries "3. ".
    const r = toggleBlock('1. one\n2. two\n3. three', sel(0, 22), 'number');
    expect(r.text).toBe('one\ntwo\nthree');
  });

  it('leaves blank lines alone', () => {
    const r = toggleBlock('one\n\ntwo', sel(0, 8), 'quote');
    expect(r.text).toBe('> one\n\n> two');
  });

  it('selects the whole affected block so a second press toggles the same lines', () => {
    const first = toggleBlock('one\ntwo', sel(0, 7), 'quote');
    const second = toggleBlock(first.text, first.selection, 'quote');
    expect(second.text).toBe('one\ntwo');
  });

  it('expands a caret to its whole line', () => {
    // The caret is inside "two"; the prefix must land at the line start.
    expect(toggleBlock('one\ntwo', sel(5, 5), 'heading').text).toBe('one\n# two');
  });

  it('applies a heading', () => {
    expect(toggleBlock('Title', sel(0, 5), 'heading').text).toBe('# Title');
  });
});

describe('insertLink', () => {
  it('wraps the selection as the label', () => {
    expect(insertLink('see docs', sel(4, 8), 'https://x.dev').text).toBe('see [docs](https://x.dev)');
  });

  it('selects the label, the part most likely to be retyped', () => {
    const r = insertLink('see docs', sel(4, 8), 'https://x.dev');
    expect(r.text.slice(r.selection.start, r.selection.end)).toBe('docs');
  });

  it('uses the url as the label when nothing is selected', () => {
    // A bare [](url) would give the user an invisible link to hunt for.
    expect(insertLink('', sel(0, 0), 'https://x.dev').text).toBe('[https://x.dev](https://x.dev)');
  });
});

describe('markForShortcut', () => {
  it('maps the usual chords', () => {
    expect(markForShortcut({ key: 'b', metaKey: true })).toBe('bold');
    expect(markForShortcut({ key: 'i', ctrlKey: true })).toBe('italic');
    expect(markForShortcut({ key: 'e', metaKey: true })).toBe('code');
  });

  it('accepts an uppercase key, as a held Shift reports it', () => {
    expect(markForShortcut({ key: 'B', metaKey: true })).toBe('bold');
  });

  it('ignores an unmodified letter', () => {
    expect(markForShortcut({ key: 'b' })).toBeNull();
  });

  it('ignores an unmapped chord', () => {
    expect(markForShortcut({ key: 'q', metaKey: true })).toBeNull();
  });
});
