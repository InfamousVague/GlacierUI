/**
 * Command palette logic — the matching, grouping, and cursor rules behind a
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
   * Extra words the query should match but the list should not show — aliases,
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
  /** Position in the flat result order — the index the cursor addresses. */
  index: number;
}

/** A run of matches sharing a heading, in the order they should render. */
export interface CommandGroup<T extends CommandDescriptor = CommandDescriptor> {
  /** The heading, or undefined for commands filed under none. */
  group?: string;
  matches: CommandMatch<T>[];
}

const norm = (value: string): string => value.trim().toLowerCase();

/**
 * Filters commands by a query and stamps each survivor with its flat index.
 *
 * Matching is a plain substring test across the label, group, and keywords.
 * That is deliberate: fuzzy scoring makes a palette feel clever right up until
 * it ranks something surprising first, and a substring match is a rule the user
 * can predict and a test can pin. An empty query returns everything, so opening
 * the palette shows the full menu rather than a blank list.
 *
 * Input order is preserved — the caller decides priority by ordering its list.
 */
export function matchCommands<T extends CommandDescriptor>(items: T[], query: string): CommandMatch<T>[] {
  const q = norm(query);
  const matches: CommandMatch<T>[] = [];

  for (const item of items) {
    if (q) {
      const haystack = norm(`${item.label} ${item.group ?? ''} ${item.keywords ?? ''}`);
      if (!haystack.includes(q)) continue;
    }
    const hitLabel = !q || norm(item.label).includes(q);
    const matchedKeyword = hitLabel
      ? undefined
      : (item.keywords ?? '').split(/\s+/).find((word) => word && norm(word).includes(q));
    matches.push({ item, matchedKeyword, index: matches.length });
  }

  return matches;
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
 * both ends — the movement every palette has, so arrowing past the last row
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
 * The first row the cursor should rest on for a fresh result set — used on open
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
