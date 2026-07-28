/**
 * Rich text editing — the selection-to-markdown transforms behind a formatting
 * toolbar.
 *
 * Markdown over `contenteditable` is a deliberate choice. A contenteditable
 * surface is a DOM-only construct with no React Native equivalent, so an editor
 * built on it could never have a native binding. These transforms are pure
 * string arithmetic over a plain text value and a selection range, which every
 * platform's text input already provides — so Bold means exactly the same thing
 * on both, and it is testable without a browser.
 */

/** An inline mark, applied by wrapping the selection. */
export type MarkdownMark = 'bold' | 'italic' | 'code' | 'strike';

/** A block form, applied by prefixing every line the selection touches. */
export type MarkdownBlock = 'heading' | 'quote' | 'bullet' | 'number';

/** A selection range in the text, as every text input reports one. */
export interface TextSelection {
  start: number;
  end: number;
}

/** The text and where the caret should end up, after an edit. */
export interface EditResult {
  text: string;
  selection: TextSelection;
}

/** The delimiter each inline mark wraps its selection in. */
export const MARK_DELIMITERS: Record<MarkdownMark, string> = {
  bold: '**',
  italic: '_',
  code: '`',
  strike: '~~',
};

/** The line prefix each block form applies. */
export const BLOCK_PREFIXES: Record<MarkdownBlock, string> = {
  heading: '# ',
  quote: '> ',
  bullet: '- ',
  number: '1. ',
};

const clamp = (n: number, min: number, max: number): number => (n < min ? min : n > max ? max : n);

/** A selection clamped into the text, so a stale range cannot slice out of bounds. */
function safeSelection(text: string, selection: TextSelection): TextSelection {
  const start = clamp(Math.min(selection.start, selection.end), 0, text.length);
  const end = clamp(Math.max(selection.start, selection.end), 0, text.length);
  return { start, end };
}

/**
 * Applies or removes an inline mark around the selection.
 *
 * Toggling recognises two shapes, because a user's selection lands either way:
 * the delimiters sitting just *outside* the selection (they selected the word
 * and are un-bolding it), or *inside* it (they selected the whole `**word**`).
 * Both unwrap; anything else wraps.
 *
 * With an empty selection the delimiters are inserted and the caret is placed
 * between them, so pressing Bold and typing produces bold text rather than
 * leaving the caret stranded after the markers.
 */
export function toggleMark(text: string, selection: TextSelection, mark: MarkdownMark): EditResult {
  const d = MARK_DELIMITERS[mark];
  const { start, end } = safeSelection(text, selection);
  const selected = text.slice(start, end);

  // Delimiters immediately outside the selection.
  const before = text.slice(Math.max(0, start - d.length), start);
  const after = text.slice(end, end + d.length);
  if (before === d && after === d) {
    const next = text.slice(0, start - d.length) + selected + text.slice(end + d.length);
    return { text: next, selection: { start: start - d.length, end: end - d.length } };
  }

  // Delimiters inside the selection.
  if (selected.length >= d.length * 2 && selected.startsWith(d) && selected.endsWith(d)) {
    const inner = selected.slice(d.length, selected.length - d.length);
    return {
      text: text.slice(0, start) + inner + text.slice(end),
      selection: { start, end: start + inner.length },
    };
  }

  const next = text.slice(0, start) + d + selected + d + text.slice(end);
  return { text: next, selection: { start: start + d.length, end: end + d.length } };
}

/**
 * Which marks are already applied around the selection — what a toolbar reads
 * to show a pressed button.
 */
export function activeMarks(text: string, selection: TextSelection): MarkdownMark[] {
  const { start, end } = safeSelection(text, selection);
  const tokens = tokenizeMarkdown(text);

  // Every run the selection covers — or, for a caret, the run it sits in. A
  // caret between two runs takes the one it is at the end of as well as the one
  // it is at the start of, so typing at either boundary of `**bold**` reports
  // bold rather than only doing so dead centre.
  const touched = tokens.filter((token) =>
    start === end ? start >= token.start && start <= token.end : token.start < end && token.end > start,
  );
  if (touched.length === 0) return [];

  // A mark is active only where it covers the whole selection: half a selection
  // being bold is not a state the Bold button can honestly show as pressed.
  const content = touched.filter((token) => token.kind !== 'marker');
  const considered = content.length ? content : touched;

  return (Object.keys(MARK_DELIMITERS) as MarkdownMark[]).filter((mark) =>
    considered.every((token) => token.marks.includes(mark)),
  );
}

/**
 * The block form the selection sits in, if any.
 *
 * Reported for the same reason as the marks: a toolbar that can apply a form
 * should be able to say when it is already applied. Only one is returned
 * because the prefixes are mutually exclusive on a line.
 */
export function activeBlock(text: string, selection: TextSelection): MarkdownBlock | null {
  const { start, end } = safeSelection(text, selection);
  const tokens = tokenizeMarkdown(text);
  const touched = tokens.filter((token) =>
    start === end ? start >= token.start && start <= token.end : token.start < end && token.end > start,
  );
  // `null` is a value here, not an absence: a selection spanning a quote and a
  // plain line is in neither, the same way a partially-bold selection is not
  // bold. Filtering the plain runs out would report the quote.
  const blocks = new Set(touched.map((token) => token.block ?? null));
  if (blocks.size !== 1) return null;
  return [...blocks][0] ?? null;
}

/** The [start, end) character range of every line the selection touches. */
function lineRange(text: string, selection: TextSelection): { start: number; end: number } {
  const { start, end } = safeSelection(text, selection);
  const lineStart = text.lastIndexOf('\n', start - 1) + 1;
  const nextBreak = text.indexOf('\n', end);
  const lineEnd = nextBreak === -1 ? text.length : nextBreak;
  return { start: lineStart, end: lineEnd };
}

/**
 * Applies or removes a block form across every line the selection touches.
 *
 * Removal only happens when *every* touched line already carries the prefix. A
 * mixed selection — some lines quoted, some not — applies the prefix to the
 * rest, which is what makes a second press finish the job rather than undoing
 * half of it.
 */
export function toggleBlock(text: string, selection: TextSelection, block: MarkdownBlock): EditResult {
  const prefix = BLOCK_PREFIXES[block];
  const { start: from, end: to } = lineRange(text, selection);
  const body = text.slice(from, to);
  const lines = body.split('\n');

  // A numbered list renumbers as it goes, so toggling it off has to match any
  // digit rather than the literal "1. " the prefix map holds.
  const matcher = block === 'number' ? /^\d+\. / : null;
  const has = (line: string) => (matcher ? matcher.test(line) : line.startsWith(prefix));

  // Blank lines are skipped below, so that prefixing a multi-line selection
  // does not quote the empty lines separating its paragraphs. On a single empty
  // line that rule would mean the button does nothing at all — which is exactly
  // the moment it is most likely to be pressed, before anything has been typed.
  // There the prefix is inserted and the caret lands after it, ready to type.
  if (lines.length === 1 && lines[0]!.length === 0) {
    const inserted = block === 'number' ? '1. ' : prefix;
    const caret = from + inserted.length;
    return {
      text: text.slice(0, from) + inserted + text.slice(to),
      selection: { start: caret, end: caret },
    };
  }

  const allPrefixed = lines.every((line) => line.length === 0 || has(line));

  const next = lines.map((line, i) => {
    if (line.length === 0) return line;
    if (allPrefixed) return line.replace(matcher ?? prefix, '');
    if (has(line)) return line;
    return (block === 'number' ? `${i + 1}. ` : prefix) + line;
  });

  const replaced = next.join('\n');
  return {
    text: text.slice(0, from) + replaced + text.slice(to),
    // Select the whole affected block, so a second press toggles the same lines
    // rather than whatever the caret happened to collapse onto.
    selection: { start: from, end: from + replaced.length },
  };
}

/**
 * Wraps the selection in a markdown link.
 *
 * With no selection, the URL becomes the label too — a bare `[](url)` gives the
 * user an invisible link they then have to find and fix.
 */
export function insertLink(text: string, selection: TextSelection, url: string): EditResult {
  const { start, end } = safeSelection(text, selection);
  const label = text.slice(start, end) || url;
  const snippet = `[${label}](${url})`;
  return {
    text: text.slice(0, start) + snippet + text.slice(end),
    // Select the label, which is the part a user is most likely to retype.
    selection: { start: start + 1, end: start + 1 + label.length },
  };
}

/** The parts of a key event the editor's shortcut test needs. */
export interface MarkShortcutEvent {
  key: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
}

/**
 * The mark a keyboard shortcut asks for, or null. ⌘/Ctrl + B, I, and E — the
 * chords every editor uses, so they need no explanation.
 */
export function markForShortcut(event: MarkShortcutEvent): MarkdownMark | null {
  if (!(event.metaKey || event.ctrlKey)) return null;
  const key = event.key.toLowerCase();
  if (key === 'b') return 'bold';
  if (key === 'i') return 'italic';
  if (key === 'e') return 'code';
  return null;
}

/* -- highlighting ---------------------------------------------------------- */

/**
 * What a run of characters is, for an editor that styles its own source.
 *
 * `marker` is the syntax itself — the asterisks, the backticks, the `> `. It is
 * kept in the text rather than hidden, and drawn quietly, so the document still
 * reads as markdown while the content it wraps takes the styling it describes.
 */
export type MarkdownTokenKind =
  | 'text'
  | 'marker'
  | MarkdownMark
  | MarkdownBlock
  | 'link-text'
  | 'link-url'
  /** The ``` fence line, and the language written after the opening one. */
  | 'code-lang'
  /** Inside a fence. The `code-*` kinds are what a highlighter found there. */
  | 'code-block'
  | 'code-keyword'
  | 'code-string'
  | 'code-number'
  | 'code-comment';

/** A run of characters, as a half-open range over the source. */
export interface MarkdownToken {
  kind: MarkdownTokenKind;
  start: number;
  /** Exclusive. */
  end: number;
  /** Marks enclosing this run, outermost first — `**a _b_**` makes `b` both. */
  marks: MarkdownMark[];
  /** The block the run sits in, when it is not a plain paragraph. */
  block?: MarkdownBlock;
}

/** Longest first, so `**` is never mistaken for two italics. */
const INLINE_ORDER: MarkdownMark[] = ['bold', 'strike', 'code', 'italic'];

/** Italic accepts either delimiter, though the toolbar writes `_`. */
const ITALIC_DELIMITERS = ['_', '*'];

const BLOCK_PATTERNS: { block: MarkdownBlock; re: RegExp }[] = [
  { block: 'heading', re: /^#{1,6} / },
  { block: 'quote', re: /^> / },
  { block: 'bullet', re: /^[-*] / },
  { block: 'number', re: /^\d+\. / },
];

/**
 * Splits markdown into styled runs.
 *
 * The result is a *complete, ordered, non-overlapping cover* of the input:
 * concatenating every token's slice reproduces the source exactly. That is the
 * property the editors depend on — both bindings draw the highlight as a layer
 * behind a real text input, and a single dropped or duplicated character would
 * slide the rest of the document out from under the caret.
 *
 * Inline marks are matched within a line. An unclosed `**` therefore styles
 * nothing rather than swallowing the rest of the document, which is the common
 * case while someone is still typing the pair.
 *
 * Shares `MARK_DELIMITERS` and `BLOCK_PREFIXES` with the toolbar, so what Bold
 * writes is by construction what the highlighter recognises.
 */
export function tokenizeMarkdown(text: string): MarkdownToken[] {
  const tokens: MarkdownToken[] = [];

  const push = (kind: MarkdownTokenKind, start: number, end: number, marks: MarkdownMark[], block?: MarkdownBlock) => {
    if (end <= start) return;
    const last = tokens[tokens.length - 1];
    // Merge touching runs of the same kind so a renderer emits one span per
    // stretch rather than one per character.
    if (last && last.kind === kind && last.end === start && last.block === block && sameMarks(last.marks, marks)) {
      last.end = end;
      return;
    }
    tokens.push({ kind, start, end, marks, ...(block ? { block } : {}) });
  };

  let lineStart = 0;
  let inFence = false;
  let fenceChar = '`';
  while (lineStart <= text.length) {
    let lineEnd = text.indexOf('\n', lineStart);
    if (lineEnd === -1) lineEnd = text.length;
    const line = text.slice(lineStart, lineEnd);

    // A fence swallows whole lines, so it is decided before anything else: the
    // text inside one is literal, and neither block prefixes nor inline marks
    // apply to it. An unclosed fence runs to the end of the document, which is
    // what markdown itself does.
    const fence = /^\s*(`{3,}|~{3,})/.exec(line);
    if (inFence) {
      if (fence && fence[1]!.startsWith(fenceChar)) {
        push('marker', lineStart, lineEnd, [], undefined);
        inFence = false;
      } else {
        scanCode(text, lineStart, lineEnd, push);
      }
      if (lineEnd < text.length) push('code-block', lineEnd, lineEnd + 1, []);
      lineStart = lineEnd + 1;
      continue;
    }
    if (fence) {
      const fenceEnd = lineStart + fence[0].length;
      push('marker', lineStart, fenceEnd, [], undefined);
      // Whatever follows the backticks names the language.
      push('code-lang', fenceEnd, lineEnd, [], undefined);
      inFence = true;
      fenceChar = fence[1]![0]!;
      if (lineEnd < text.length) push('code-block', lineEnd, lineEnd + 1, []);
      lineStart = lineEnd + 1;
      continue;
    }

    let cursor = lineStart;
    let block: MarkdownBlock | undefined;
    for (const { block: candidate, re } of BLOCK_PATTERNS) {
      const match = re.exec(line);
      if (!match) continue;
      block = candidate;
      push('marker', cursor, cursor + match[0].length, [], candidate);
      cursor += match[0].length;
      break;
    }

    scanInline(text, cursor, lineEnd, [], block, push);

    // The newline terminates this line, so it carries the line's block —
    // otherwise a selection over two quoted lines would look mixed.
    if (lineEnd < text.length) push('text', lineEnd, lineEnd + 1, [], block);
    lineStart = lineEnd + 1;
  }

  return tokens;
}

const sameMarks = (a: MarkdownMark[], b: MarkdownMark[]): boolean =>
  a.length === b.length && a.every((mark, i) => mark === b[i]);

type Push = (kind: MarkdownTokenKind, start: number, end: number, marks: MarkdownMark[], block?: MarkdownBlock) => void;

/** Walks one line, emitting marker/content runs and recursing into marks. */
function scanInline(
  text: string,
  from: number,
  to: number,
  marks: MarkdownMark[],
  block: MarkdownBlock | undefined,
  push: Push,
): void {
  let i = from;
  let plain = from;

  const flush = (upto: number) => {
    push(marks.length ? (marks[marks.length - 1] as MarkdownTokenKind) : 'text', plain, upto, marks, block);
  };

  while (i < to) {
    const link = matchLink(text, i, to);
    if (link) {
      flush(i);
      push('marker', link.start, link.textStart, marks, block);
      push('link-text', link.textStart, link.textEnd, marks, block);
      push('marker', link.textEnd, link.urlStart, marks, block);
      push('link-url', link.urlStart, link.urlEnd, marks, block);
      push('marker', link.urlEnd, link.end, marks, block);
      i = plain = link.end;
      continue;
    }

    const found = matchMark(text, i, to, marks);
    if (found) {
      flush(i);
      const { mark, delimiter, close } = found;
      const inner = [...marks, mark];
      push('marker', i, i + delimiter.length, inner, block);
      // Code is terminal: `**` inside a code span is code, not bold.
      if (mark === 'code') push('code', i + delimiter.length, close, inner, block);
      else scanInline(text, i + delimiter.length, close, inner, block, push);
      push('marker', close, close + delimiter.length, inner, block);
      i = plain = close + delimiter.length;
      continue;
    }

    i++;
  }

  flush(to);
}

/** A mark opening at `i`, with the position of its closing delimiter. */
function matchMark(
  text: string,
  i: number,
  to: number,
  open: MarkdownMark[],
): { mark: MarkdownMark; delimiter: string; close: number } | null {
  for (const mark of INLINE_ORDER) {
    // A mark cannot nest inside itself: `**a**b**` is one bold run, not two.
    if (open.includes(mark)) continue;
    const delimiters = mark === 'italic' ? ITALIC_DELIMITERS : [MARK_DELIMITERS[mark]];
    for (const delimiter of delimiters) {
      if (!text.startsWith(delimiter, i)) continue;
      const contentStart = i + delimiter.length;
      const close = text.indexOf(delimiter, contentStart);
      // Must close on this line, and must wrap something.
      if (close === -1 || close + delimiter.length > to || close === contentStart) continue;
      return { mark, delimiter, close };
    }
  }
  return null;
}

/** `[text](url)` starting at `i`, entirely within the line. */
function matchLink(
  text: string,
  i: number,
  to: number,
): { start: number; textStart: number; textEnd: number; urlStart: number; urlEnd: number; end: number } | null {
  if (text[i] !== '[') return null;
  const textEnd = text.indexOf(']', i + 1);
  if (textEnd === -1 || textEnd >= to || text[textEnd + 1] !== '(') return null;
  const urlEnd = text.indexOf(')', textEnd + 2);
  if (urlEnd === -1 || urlEnd >= to) return null;
  return {
    start: i,
    textStart: i + 1,
    textEnd,
    urlStart: textEnd + 2,
    urlEnd,
    end: urlEnd + 1,
  };
}

/**
 * Keywords shared across the C-family and its descendants.
 *
 * One list rather than a grammar per language, deliberately. The editor
 * highlights whatever is typed in a fence *as the user types it*, often before
 * the language tag exists — so it cannot dispatch on one, and shipping real
 * grammars would mean bundling a highlighter the kit has always declined to.
 * The result is honest about what it is: comments, strings, numbers, and words
 * that are keywords almost everywhere. Anything it does not know stays plain,
 * which reads as unremarkable rather than wrong.
 */
const CODE_KEYWORDS = new Set([
  'as', 'async', 'await', 'break', 'case', 'catch', 'class', 'const', 'continue', 'def', 'default',
  'delete', 'do', 'elif', 'else', 'end', 'enum', 'export', 'extends', 'false', 'final', 'finally',
  'fn', 'for', 'from', 'func', 'function', 'if', 'impl', 'import', 'in', 'instanceof', 'interface',
  'let', 'match', 'mod', 'mut', 'new', 'nil', 'none', 'null', 'package', 'pub', 'return', 'self',
  'static', 'struct', 'super', 'switch', 'this', 'throw', 'trait', 'true', 'try', 'type', 'typeof',
  'undefined', 'use', 'var', 'void', 'where', 'while', 'with', 'yield',
]);

const IDENTIFIER = /[A-Za-z_$][\w$]*/y;
const NUMBER = /(?:0[xXbBoO][0-9a-fA-F_]+|\d[\d_]*(?:\.[\d_]+)?(?:[eE][+-]?\d+)?)/y;

/**
 * Highlights one line inside a fence.
 *
 * Emits the same complete cover the rest of the tokenizer guarantees: every
 * character lands in exactly one run, or the highlight layer would slide out
 * from under the caret.
 */
function scanCode(text: string, from: number, to: number, push: Push): void {
  let i = from;
  let plain = from;
  const flush = (upto: number) => push('code-block', plain, upto, []);

  while (i < to) {
    const ch = text[i]!;

    // Line comment — runs to the end of the line either way.
    if ((ch === '/' && text[i + 1] === '/') || ch === '#') {
      flush(i);
      push('code-comment', i, to, []);
      return;
    }

    // Block comment, clipped to this line: the scanner is per-line, so an
    // unterminated one colours what is visible rather than guessing.
    if (ch === '/' && text[i + 1] === '*') {
      flush(i);
      const close = text.indexOf('*/', i + 2);
      const end = close === -1 || close + 2 > to ? to : close + 2;
      push('code-comment', i, end, []);
      i = plain = end;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      flush(i);
      let j = i + 1;
      while (j < to && text[j] !== ch) {
        if (text[j] === '\\') j++; // an escaped quote does not close the string
        j++;
      }
      const end = Math.min(j + 1, to);
      push('code-string', i, end, []);
      i = plain = end;
      continue;
    }

    NUMBER.lastIndex = i;
    const number = NUMBER.exec(text);
    // Only at a boundary, so the `1` in `a1` is not a number.
    if (number && number.index === i && !/[\w$]/.test(text[i - 1] ?? '')) {
      flush(i);
      const end = Math.min(i + number[0].length, to);
      push('code-number', i, end, []);
      i = plain = end;
      continue;
    }

    IDENTIFIER.lastIndex = i;
    const word = IDENTIFIER.exec(text);
    if (word && word.index === i) {
      const end = Math.min(i + word[0].length, to);
      if (CODE_KEYWORDS.has(word[0])) {
        flush(i);
        push('code-keyword', i, end, []);
        plain = end;
      }
      i = end;
      continue;
    }

    i++;
  }

  flush(to);
}
