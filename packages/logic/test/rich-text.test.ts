import { describe, expect, it } from 'vitest';
import {
  activeBlock,
  tokenizeMarkdown,
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

describe('tokenizeMarkdown', () => {
  const cover = (text: string) =>
    tokenizeMarkdown(text)
      .map((t) => text.slice(t.start, t.end))
      .join('');

  const kindsOf = (text: string) => tokenizeMarkdown(text).map((t) => [t.kind, text.slice(t.start, t.end)]);

  it('reproduces the source exactly - the invariant both editors rest on', () => {
    for (const sample of [
      '',
      'plain text',
      '**bold**',
      'a **b** c',
      '# Heading\n\n> quote\n- bullet\n1. numbered',
      '`code` and _italic_ and ~~struck~~',
      '[label](https://example.com)',
      'unclosed ** marker',
      '**bold _and italic_**',
      'line one\nline two\n',
      '\n\n\n',
    ]) {
      expect(cover(sample)).toBe(sample);
    }
  });

  it('never overlaps and never leaves a gap', () => {
    const text = '# Title\n**bold** and `code`\n> quoted [link](url)';
    const tokens = tokenizeMarkdown(text);
    let at = 0;
    for (const token of tokens) {
      expect(token.start).toBe(at);
      expect(token.end).toBeGreaterThan(token.start);
      at = token.end;
    }
    expect(at).toBe(text.length);
  });

  it('separates the markers from what they wrap', () => {
    expect(kindsOf('**hi**')).toEqual([
      ['marker', '**'],
      ['bold', 'hi'],
      ['marker', '**'],
    ]);
  });

  it('marks a block prefix without styling the line as a marker', () => {
    const tokens = tokenizeMarkdown('> quoted');
    expect(tokens[0]).toMatchObject({ kind: 'marker', block: 'quote' });
    expect(tokens[1]).toMatchObject({ kind: 'text', block: 'quote' });
  });

  it('recognises every block form the toolbar writes', () => {
    for (const [source, block] of [
      ['# h', 'heading'],
      ['###### h', 'heading'],
      ['> q', 'quote'],
      ['- b', 'bullet'],
      ['* b', 'bullet'],
      ['1. n', 'number'],
      ['42. n', 'number'],
    ] as const) {
      expect(tokenizeMarkdown(source)[0]).toMatchObject({ kind: 'marker', block });
    }
  });

  it('nests marks, so inner text carries both', () => {
    const tokens = tokenizeMarkdown('**a _b_**');
    const inner = tokens.find((t) => t.kind === 'italic');
    expect(inner!.marks).toEqual(['bold', 'italic']);
  });

  it('treats code as terminal, so its contents are never re-read', () => {
    const tokens = tokenizeMarkdown('`**not bold**`');
    expect(tokens.some((t) => t.kind === 'bold')).toBe(false);
    expect(tokens.find((t) => t.kind === 'code')!.marks).toEqual(['code']);
  });

  it('leaves an unclosed delimiter as plain text', () => {
    // The common state while the pair is still being typed - it must not
    // swallow the rest of the document.
    expect(tokenizeMarkdown('**hanging').every((t) => t.kind === 'text')).toBe(true);
  });

  it('does not let a mark span a line break', () => {
    expect(tokenizeMarkdown('**open\nclose**').some((t) => t.kind === 'bold')).toBe(false);
  });

  it('ignores an empty pair rather than emitting a zero-width run', () => {
    expect(tokenizeMarkdown('****').every((t) => t.kind === 'text')).toBe(true);
  });

  it('reads `**` as bold rather than two italics', () => {
    expect(tokenizeMarkdown('**b**').some((t) => t.kind === 'bold')).toBe(true);
    expect(tokenizeMarkdown('**b**').some((t) => t.kind === 'italic')).toBe(false);
  });

  it('splits a link into its label and its target', () => {
    expect(kindsOf('[a](b)')).toEqual([
      ['marker', '['],
      ['link-text', 'a'],
      ['marker', ']('],
      ['link-url', 'b'],
      ['marker', ')'],
    ]);
  });

  it('merges touching runs so a renderer emits one span per stretch', () => {
    // Every character is plain, so it should be a single token, not eleven.
    expect(tokenizeMarkdown('plain words')).toHaveLength(1);
  });

  it('agrees with what the toolbar writes', () => {
    // Bold applied by the toolbar must be recognised by the highlighter; this
    // is the drift the shared delimiters exist to prevent.
    const applied = toggleMark('word', { start: 0, end: 4 }, 'bold');
    expect(tokenizeMarkdown(applied.text).some((t) => t.kind === 'bold')).toBe(true);
  });
});

describe('activeMarks with the caret inside a mark', () => {
  const at = (text: string, caret: number) => activeMarks(text, { start: caret, end: caret });

  it('reports the mark from anywhere inside it, not just at its edges', () => {
    const text = '**bold text**';
    // Dead centre, between "bold" and "text" - the case that used to report
    // nothing because the delimiters were not immediately adjacent.
    expect(at(text, 7)).toEqual(['bold']);
  });

  it('reports it at both boundaries of the content', () => {
    const text = '**bold**';
    expect(at(text, 2)).toEqual(['bold']);
    expect(at(text, 6)).toEqual(['bold']);
  });

  it('reports nothing outside the mark', () => {
    const text = 'plain **bold** plain';
    expect(at(text, 2)).toEqual([]);
    expect(at(text, 18)).toEqual([]);
  });

  it('reports both marks where they nest', () => {
    const text = '**a _b_ c**';
    expect(at(text, 6)).toEqual(['bold', 'italic']);
  });

  it('does not report a mark that covers only part of a selection', () => {
    // Half bold is not a state the button can honestly show as pressed.
    const text = '**bold** plain';
    expect(activeMarks(text, { start: 2, end: 13 })).toEqual([]);
  });

  it('reports a mark that covers the whole selection', () => {
    const text = '**bold text**';
    expect(activeMarks(text, { start: 2, end: 11 })).toEqual(['bold']);
  });

  it('still recognises a selection that encloses its own delimiters', () => {
    expect(activeMarks('**bold**', { start: 0, end: 8 })).toEqual(['bold']);
  });
});

describe('activeBlock', () => {
  const at = (text: string, caret: number) => activeBlock(text, { start: caret, end: caret });

  it('names the block the caret sits in', () => {
    expect(at('> quoted', 4)).toBe('quote');
    expect(at('# heading', 4)).toBe('heading');
    expect(at('- item', 4)).toBe('bullet');
    expect(at('1. item', 4)).toBe('number');
  });

  it('reports none on a plain line', () => {
    expect(at('plain', 2)).toBeNull();
  });

  it('reports none when a selection spans two different blocks', () => {
    // In neither, the same way a partly-bold selection is not bold.
    expect(activeBlock('> quoted\nplain', { start: 4, end: 12 })).toBeNull();
  });

  it('reports the block from within its prefix as well as its text', () => {
    expect(at('> quoted', 1)).toBe('quote');
  });
});

describe('toggleBlock on an empty line', () => {
  const empty = { start: 0, end: 0 };

  it('inserts the marker and its space', () => {
    expect(toggleBlock('', empty, 'heading').text).toBe('# ');
    expect(toggleBlock('', empty, 'quote').text).toBe('> ');
    expect(toggleBlock('', empty, 'bullet').text).toBe('- ');
    expect(toggleBlock('', empty, 'number').text).toBe('1. ');
  });

  it('leaves the caret after the marker, ready to type', () => {
    // Before this, pressing Heading on an empty document did nothing at all -
    // the moment the button is most likely to be pressed.
    const result = toggleBlock('', empty, 'heading');
    expect(result.selection).toEqual({ start: 2, end: 2 });
    expect(toggleBlock('', empty, 'number').selection).toEqual({ start: 3, end: 3 });
  });

  it('toggles back off on a second press', () => {
    const on = toggleBlock('', empty, 'quote');
    expect(toggleBlock(on.text, on.selection, 'quote').text).toBe('');
  });

  it('still skips blank lines inside a multi-line selection', () => {
    // The separator between two paragraphs should not become a quote.
    expect(toggleBlock('a\n\nb', { start: 0, end: 4 }, 'quote').text).toBe('> a\n\n> b');
  });

  it('inserts on an empty line among others', () => {
    const text = 'a\n\nb';
    // Caret on the blank middle line.
    expect(toggleBlock(text, { start: 2, end: 2 }, 'quote').text).toBe('a\n> \nb');
  });
});

describe('fenced code blocks', () => {
  const cover = (text: string) =>
    tokenizeMarkdown(text)
      .map((t) => text.slice(t.start, t.end))
      .join('');
  const kinds = (text: string) => tokenizeMarkdown(text).map((t) => [t.kind, text.slice(t.start, t.end)]);

  it('still reproduces the source exactly', () => {
    for (const sample of [
      '```\ncode\n```',
      '```js\nconst a = 1;\n```',
      '```\nunclosed',
      'before\n```\nin\n```\nafter',
      '~~~\ntilde fence\n~~~',
      '```\n\n```',
    ]) {
      expect(cover(sample)).toBe(sample);
    }
  });

  it('marks the fence and names the language', () => {
    const out = kinds('```ts\nx\n```');
    expect(out[0]).toEqual(['marker', '```']);
    expect(out[1]).toEqual(['code-lang', 'ts']);
    expect(out[out.length - 1]).toEqual(['marker', '```']);
  });

  it('treats the body as code, not as markdown', () => {
    // The whole point: `**` inside a fence is not bold.
    const tokens = tokenizeMarkdown('```\n**not bold**\n```');
    expect(tokens.some((t) => t.kind === 'bold')).toBe(false);
  });

  it('does not apply block prefixes inside a fence', () => {
    const tokens = tokenizeMarkdown('```\n# not a heading\n```');
    expect(tokens.some((t) => t.block === 'heading')).toBe(false);
  });

  it('highlights strings, numbers, keywords and comments', () => {
    const found = (src: string, kind: string) => tokenizeMarkdown(src).filter((t) => t.kind === kind);
    expect(found('```\nconst a = 1;\n```', 'code-keyword').map((t) => t)).toHaveLength(1);
    expect(found('```\nx = "hi";\n```', 'code-string')).toHaveLength(1);
    expect(found('```\nx = 42;\n```', 'code-number')).toHaveLength(1);
    expect(found('```\n// note\n```', 'code-comment')).toHaveLength(1);
  });

  it('does not read a digit inside an identifier as a number', () => {
    const src = '```\nvalue1 = 2\n```';
    const numbers = tokenizeMarkdown(src).filter((t) => t.kind === 'code-number');
    expect(numbers).toHaveLength(1);
    expect(src.slice(numbers[0]!.start, numbers[0]!.end)).toBe('2');
  });

  it('keeps an escaped quote inside its string', () => {
    const src = '```\n"a\\"b"\n```';
    const strings = tokenizeMarkdown(src).filter((t) => t.kind === 'code-string');
    expect(strings).toHaveLength(1);
    expect(src.slice(strings[0]!.start, strings[0]!.end)).toBe('"a\\"b"');
  });

  it('runs an unclosed fence to the end of the document', () => {
    const tokens = tokenizeMarkdown('```\nstill code\n**not bold**');
    expect(tokens.some((t) => t.kind === 'bold')).toBe(false);
  });

  it('closes only on a matching fence character', () => {
    // A ~~~ line does not close a ``` fence.
    const tokens = tokenizeMarkdown('```\n~~~\n**still code**\n```');
    expect(tokens.some((t) => t.kind === 'bold')).toBe(false);
  });

  it('resumes markdown after the closing fence', () => {
    const tokens = tokenizeMarkdown('```\ncode\n```\n**bold**');
    expect(tokens.some((t) => t.kind === 'bold')).toBe(true);
  });
});
