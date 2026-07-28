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
const BLOCK_PREFIXES: Record<MarkdownBlock, string> = {
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
  const marks: MarkdownMark[] = [];

  for (const mark of Object.keys(MARK_DELIMITERS) as MarkdownMark[]) {
    const d = MARK_DELIMITERS[mark];
    const before = text.slice(Math.max(0, start - d.length), start);
    const after = text.slice(end, end + d.length);
    const selected = text.slice(start, end);
    const wrappedOutside = before === d && after === d;
    const wrappedInside = selected.length >= d.length * 2 && selected.startsWith(d) && selected.endsWith(d);
    if (wrappedOutside || wrappedInside) marks.push(mark);
  }

  // `**bold**` also matches italic's `_`? No — but `**` does contain `*`, and a
  // future single-asterisk italic would collide. The delimiters above are chosen
  // so no one is a prefix of another, and this assertion is the reason why.
  return marks;
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
