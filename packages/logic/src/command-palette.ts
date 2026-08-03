/**
 * Command palette logic - the matching, grouping, and cursor rules behind a
 * ⌘K overlay. All of it is decisions rather than pixels, so both bindings share
 * one answer to "what does this query match, and where does the cursor go".
 */

/** A single runnable command. */
export interface CommandDescriptor {
  /** Stable identity; also what `onRun` reports back. */
  id: string;
  /** The line the user reads. */
  label: string;
  /** Optional heading this command files under, e.g. "Navigation". */
  group?: string;
  /**
   * Extra words the query should match but the list should not show - aliases,
   * old names, the thing a user would guess before learning the real label.
   */
  keywords?: string;
  /** Key hint rendered on the trailing edge, e.g. "⌘S". Display only. */
  shortcut?: string;
  /** Listed but not runnable; the cursor skips it. */
  disabled?: boolean;
}

/**
 * A command that survived the query, plus why.
 *
 * `matchedKeyword` is set only when the query hit a keyword and not the label,
 * so the list can show the user the word they actually typed rather than a row
 * that looks unrelated to their query.
 */
export interface CommandMatch<T extends CommandDescriptor = CommandDescriptor> {
  item: T;
  matchedKeyword?: string;
  /** Position in the flat result order - the index the cursor addresses. */
  index: number;
}

/** A run of matches sharing a heading, in the order they should render. */
export interface CommandGroup<T extends CommandDescriptor = CommandDescriptor> {
  /** The heading, or undefined for commands filed under none. */
  group?: string;
  matches: CommandMatch<T>[];
}

const norm = (value: string): string => value.trim().toLowerCase();

const escapeRe = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * How well a single term hit an item, lower being better, or null for a miss.
 *
 * The tiers are about *where* the term landed, not how many characters it
 * shares - "seek" should put SeekBar above a component that merely lists seek
 * as a keyword, and that is a fact about position, not a similarity score.
 */
function rankTerm(item: CommandDescriptor, term: string): number | null {
  const label = norm(item.label);
  if (label.startsWith(term)) return 0;
  if (new RegExp(`\\b${escapeRe(term)}`).test(label)) return 1;
  if (label.includes(term)) return 2;
  if (norm(`${item.group ?? ''} ${item.keywords ?? ''}`).includes(term)) return 3;
  return null;
}

/**
 * Filters commands by a query, orders them by where the query hit, and stamps
 * each survivor with its flat index.
 *
 * Two rules, both chosen so a user can predict the result and a test can pin it:
 *
 * - **Every whitespace-separated term must match somewhere.** Terms are ANDed
 *   across the label, group, and keywords, so "audio bar" finds a SeekBar tagged
 *   `audio` even though no single field contains that phrase. A single
 *   contiguous substring test cannot: it asks the user to type a fragment that
 *   exists verbatim, which means guessing the label they are searching for.
 * - **Results are tiered by where the term landed** - label prefix, then a word
 *   start inside the label, then anywhere in the label, then group or keywords.
 *   An item is ranked by its *worst* term, so a command has to be a good match
 *   for the whole query rather than a great match for one word of it.
 *
 * This is deliberately not fuzzy scoring. There is no character-distance
 * measure and no tie-break that a reader has to trust; ties keep the caller's
 * order, so the caller still decides priority within a tier. An empty query
 * returns everything, in the given order, so opening the palette shows the full
 * menu - and because every item then ranks equally, `groupCommands` still sees
 * the caller's grouping intact.
 */
export function matchCommands<T extends CommandDescriptor>(items: T[], query: string): CommandMatch<T>[] {
  const terms = norm(query).split(/\s+/).filter(Boolean);

  const scored: { item: T; rank: number; order: number; matchedKeyword?: string }[] = [];

  items.forEach((item, order) => {
    if (!terms.length) {
      scored.push({ item, rank: 0, order });
      return;
    }

    let worst = 0;
    for (const term of terms) {
      const rank = rankTerm(item, term);
      if (rank === null) return; // one miss drops the item
      worst = Math.max(worst, rank);
    }

    // Only worth naming when the label alone would not explain the hit - the
    // row otherwise looks unrelated to what the user typed.
    const words = (item.keywords ?? '').split(/\s+/).filter(Boolean);
    const matchedKeyword = terms.every((term) => rankTerm(item, term) === 3)
      ? words.find((word) => terms.some((term) => norm(word).includes(term)))
      : undefined;

    scored.push({ item, rank: worst, order, matchedKeyword });
  });

  scored.sort((a, b) => a.rank - b.rank || a.order - b.order);

  return scored.map((entry, index) => ({ item: entry.item, matchedKeyword: entry.matchedKeyword, index }));
}

/**
 * Collects matches into their headings without reordering them.
 *
 * Groups are formed from adjacent runs rather than gathered globally, so the
 * caller's order always survives: a list that interleaves groups renders
 * interleaved instead of being silently rearranged. Each match keeps the flat
 * index it was given, so keyboard movement and visual order stay the same
 * sequence even though the list is drawn in sections.
 */
export function groupCommands<T extends CommandDescriptor>(matches: CommandMatch<T>[]): CommandGroup<T>[] {
  const groups: CommandGroup<T>[] = [];
  for (const match of matches) {
    const last = groups[groups.length - 1];
    if (last && last.group === match.item.group) last.matches.push(match);
    else groups.push({ group: match.item.group, matches: [match] });
  }
  return groups;
}

/**
 * Where the cursor lands after a move, skipping disabled rows and wrapping at
 * both ends - the movement every palette has, so arrowing past the last row
 * returns to the first instead of dead-ending.
 *
 * Returns -1 when nothing is selectable, which is also the "no cursor" value,
 * so an all-disabled list simply has nowhere to be.
 */
export function moveCommandCursor<T extends CommandDescriptor>(
  matches: CommandMatch<T>[],
  from: number,
  delta: number,
): number {
  const count = matches.length;
  if (count === 0) return -1;

  // Walk at most one full lap; anything still disabled after that is a list
  // with no runnable rows at all.
  const step = delta < 0 ? -1 : 1;
  let cursor = from;
  for (let i = 0; i < count; i += 1) {
    cursor = (((cursor + step) % count) + count) % count;
    if (!matches[cursor]?.item.disabled) return cursor;
  }
  return -1;
}

/**
 * The first row the cursor should rest on for a fresh result set - used on open
 * and after every keystroke, so the top runnable command is always one Enter
 * away.
 */
export function firstCommandCursor<T extends CommandDescriptor>(matches: CommandMatch<T>[]): number {
  const index = matches.findIndex((match) => !match.item.disabled);
  return index;
}

/** The parts of a keyboard event the palette's open-shortcut test needs. */
export interface CommandShortcutEvent {
  key: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
}

/**
 * Whether a key event is the palette's summon chord: ⌘K on Apple platforms,
 * Ctrl+K everywhere else. Both are accepted on both, because a user who learned
 * one should not find it dead on the other machine.
 */
export function isCommandShortcut(event: CommandShortcutEvent): boolean {
  return (event.metaKey === true || event.ctrlKey === true) && event.key.toLowerCase() === 'k';
}

/** One run of a label, flagged for whether the query put it there. */
export interface CommandSegment {
  text: string;
  /** True when this run is part of why the row matched. */
  match: boolean;
}

/**
 * Splits a label into matched and unmatched runs so a row can show the user
 * exactly which characters answered their query.
 *
 * Term-wise, not query-wise, because matching is: `matchCommands` ANDs the
 * whitespace-separated terms across separate fields, so "rich text" can hit a
 * label that never contains that phrase contiguously. Highlighting the whole
 * query as one string would then mark nothing at all on a row that genuinely
 * matched. Each term is marked wherever it lands instead.
 *
 * Overlapping and adjacent hits are merged, so "text textarea" marks one run
 * rather than painting a seam through a word. Returns a single unmatched
 * segment when the query is empty or nothing lands, so callers can render the
 * result unconditionally.
 */
export function highlightSegments(text: string, query: string): CommandSegment[] {
  const terms = norm(query).split(/\s+/).filter(Boolean);
  if (!terms.length || !text) return [{ text, match: false }];

  const haystack = text.toLowerCase();
  const ranges: Array<[number, number]> = [];
  for (const term of terms) {
    // Every occurrence, not just the first: a term can legitimately appear more
    // than once in one label, and marking only the first reads as a near-miss.
    let from = 0;
    for (;;) {
      const at = haystack.indexOf(term, from);
      if (at === -1) break;
      ranges.push([at, at + term.length]);
      from = at + term.length;
    }
  }
  if (!ranges.length) return [{ text, match: false }];

  ranges.sort((a, b) => a[0] - b[0]);
  const merged: Array<[number, number]> = [];
  for (const [start, end] of ranges) {
    const last = merged[merged.length - 1];
    // `<=` merges touching runs as well as overlapping ones, so two terms that
    // meet exactly do not leave a zero-width unmatched segment between them.
    if (last && start <= last[1]) last[1] = Math.max(last[1], end);
    else merged.push([start, end]);
  }

  const segments: CommandSegment[] = [];
  let cursor = 0;
  for (const [start, end] of merged) {
    if (start > cursor) segments.push({ text: text.slice(cursor, start), match: false });
    segments.push({ text: text.slice(start, end), match: true });
    cursor = end;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), match: false });
  return segments;
}
