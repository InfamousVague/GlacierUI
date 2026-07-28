/**
 * Reaction and message-action decisions — the answers a reaction bar, an emoji
 * picker, and a hover action cluster need that are not pixels.
 *
 * The tally itself is NOT here: `aggregateReactions` in `chat.ts` owns it, and
 * everything below consumes its `ReactionSummary` rather than recounting. What
 * lives here is the layer above the tally — how many chips fit before the row
 * has to fold, which emoji a picker offers before you have typed anything, and
 * what a pill shows in the second between your finger and the server's answer.
 *
 * Every one of those is a place the DOM and native bindings would otherwise
 * each pick a number, and a reaction bar that caps at eight on the web and
 * twelve on the phone is not a styling drift, it is two different products.
 *
 * The ordering contract from `aggregateReactions` — first appearance, never by
 * count, so a chip cannot move out from under a finger already travelling
 * toward it — is load-bearing for everything here. `applyPending` only ever
 * APPENDS a newly added emoji, and `splitReactions` only ever cuts the TAIL, so
 * neither can reorder what the tally decided.
 */

import type { Reaction, ReactionSummary } from './chat.ts';
// TODO(integration): switch to '@glacier/spec' once the reaction and
// message-action specs are registered in packages/spec/src/index.ts.
import { reactionIntents } from '../../spec/src/components/reaction-pill.ts';
import { messageActionOrder } from '../../spec/src/components/message-actions.ts';

export type { Reaction, ReactionSummary };

// ---- the display cap -------------------------------------------------------

/**
 * How many pills a bar shows before the tail collapses into a "+N" chip.
 *
 * Eight, and the number is a height budget rather than a taste call. A pill is
 * roughly a fifth of a message's usable width, so eight is two full rows on a
 * phone and one on a desktop — the point at which the reactions stop annotating
 * the message and start outweighing it. Past that the tail is almost always a
 * long thin distribution of single-count novelty emoji, which is exactly the
 * content a "+N" summarises without loss.
 *
 * The cap is a count of EMOJI, not of people: a single 🎉 with forty actors is
 * one pill, and capping by actors would hide emoji nobody has seen while
 * showing the same one eight times.
 */
export const REACTION_DISPLAY_CAP = 8;

/**
 * The frequently-used row a picker opens on, when the app has nothing better.
 *
 * A real app should pass the viewer's own most-used glyphs; this is the
 * cold-start set, chosen to cover the distinct *replies* a reaction stands in
 * for — agreement, affection, amusement, celebration, surprise, sympathy,
 * gratitude, and "seen it" — rather than eight ways of saying yes. Eight, so it
 * is exactly one grid row at the default column count and the picker opens with
 * a straight edge instead of a ragged one.
 */
export const frequentReactions: readonly string[] = ['👍', '❤️', '😂', '🎉', '😮', '😢', '🙏', '👀'];

/** Grid width, and therefore the vertical arrow-key stride. One constant, so the two cannot disagree. */
export const REACTION_PICKER_COLUMNS = 8;

/**
 * How many actions stay in the cluster before the rest fold into the overflow
 * menu. Three plus a "more" is four controls — the most that fits over a
 * bubble's corner on a phone without covering the text it belongs to.
 */
export const MESSAGE_ACTION_INLINE_CAP = 3;

/**
 * How long a touch has to rest before it counts as a long press.
 *
 * 500ms is what `ContextMenu` already uses, and the two must match: a
 * long-press on a message is a long-press on whatever the host wrapped it in,
 * so a message that opened its actions at 400ms while the context menu waited
 * for 500ms would fire both.
 */
export const MESSAGE_LONG_PRESS_MS = 500;

// ---- the optimistic toggle -------------------------------------------------

/** What a press is asking the server to do. Derived from the spec's enum. */
export type ReactionIntent = (typeof reactionIntents)[number];

/** One toggle the server has not answered yet. */
export interface PendingReaction {
  emoji: string;
  intent: ReactionIntent;
}

/** A tally entry plus whether the viewer's own toggle on it is still in flight. */
export interface OptimisticReaction extends ReactionSummary {
  /**
   * An add or remove on this emoji has not been acknowledged. Bindings paint it
   * as reduced emphasis and NOTHING else — no spinner, no size change, no
   * disabled attribute. See `applyPending` for why.
   */
  pending: boolean;
}

/** Whether pressing this pill adds the viewer's reaction or takes it back. */
export function reactionIntent(summary: ReactionSummary | undefined): ReactionIntent {
  return summary?.reactedByViewer === true ? 'remove' : 'add';
}

/**
 * Folds in-flight toggles into a tally, so a pill shows the outcome the user
 * asked for the instant they ask for it.
 *
 * The three rules, and what each one is protecting:
 *
 * 1. **An added emoji that has no pill yet APPENDS.** It is never inserted in
 *    the middle, because first-appearance order is the whole reason the bar is
 *    stable — and from the viewer's point of view their own reaction did appear
 *    last, so the optimistic position is also the position the server will
 *    confirm.
 * 2. **A removal that empties a pill DROPS it immediately.** Leaving a ghost at
 *    zero would be the safer-looking choice and it is the wrong one: the user
 *    pressed a thing to make it go away, and a chip that stays put reads as
 *    "that did not work" and gets pressed again.
 * 3. **A pending pill is still a pill.** It keeps its size, its position, its
 *    focusability, and its `aria-pressed` — which reports the ASSUMED outcome,
 *    not the stale truth, so a screen-reader user hears the same optimistic
 *    answer a sighted one sees. Disabling it instead would drop focus out of
 *    the row at the worst possible moment.
 *
 * A pending entry whose intent the tally already reflects (adding an emoji the
 * viewer is already recorded on, usually because the ack arrived while the
 * optimistic entry was still in the caller's queue) changes no counts and only
 * marks the pill pending, so a late acknowledgement cannot double-count.
 *
 * The input is never mutated: every entry is copied, because callers memoise
 * the aggregate and a mutation here would corrupt the tally for the next render.
 */
export function applyPending(
  summaries: readonly ReactionSummary[],
  pending: readonly PendingReaction[] = [],
  viewerId?: string,
): OptimisticReaction[] {
  const out: OptimisticReaction[] = summaries.map((s) => ({ ...s, actors: [...s.actors], pending: false }));

  for (const { emoji, intent } of pending) {
    const at = out.findIndex((s) => s.emoji === emoji);
    const entry = at === -1 ? undefined : (out[at] as OptimisticReaction);

    if (intent === 'add') {
      if (entry === undefined) {
        out.push({
          emoji,
          count: 1,
          reactedByViewer: true,
          actors: viewerId === undefined ? [] : [viewerId],
          pending: true,
        });
        continue;
      }
      if (!entry.reactedByViewer) {
        entry.count += 1;
        entry.reactedByViewer = true;
        if (viewerId !== undefined) entry.actors.push(viewerId);
      }
      entry.pending = true;
      continue;
    }

    if (entry === undefined) continue;
    if (entry.reactedByViewer) {
      entry.count -= 1;
      entry.reactedByViewer = false;
      entry.actors = entry.actors.filter((id) => id !== viewerId);
    }
    // Rule 2: the last reaction leaving takes the pill with it.
    if (entry.count <= 0) out.splice(at, 1);
    else entry.pending = true;
  }

  return out;
}

/**
 * Convenience for the common call: tally raw records, then fold in the pending
 * toggles. Takes `aggregateReactions` as an argument rather than importing it,
 * so this module stays a pure consumer of the tally and the two cannot end up
 * circularly importing one another.
 */
export function optimisticReactions(
  aggregate: (reactions: Reaction[], viewerId?: string) => ReactionSummary[],
  reactions: readonly Reaction[] = [],
  pending: readonly PendingReaction[] = [],
  viewerId?: string,
): OptimisticReaction[] {
  return applyPending(aggregate([...reactions], viewerId), pending, viewerId);
}

// ---- the overflow ----------------------------------------------------------

/** A capped bar: what shows, what folded, and how many folded. */
export interface ReactionSplit<T extends ReactionSummary = ReactionSummary> {
  shown: T[];
  hidden: T[];
  /** `hidden.length`, so a caller can label the chip without measuring twice. */
  overflow: number;
}

/**
 * Caps a bar at `cap` pills and folds the tail.
 *
 * It WRAPS to as many lines as the shown pills need rather than truncating to
 * one, and it never scrolls. Truncation loses information that costs nothing to
 * show, and a horizontally scrolling strip nested inside a vertically scrolling
 * transcript is a gesture conflict — a thumb that drifts a few degrees off the
 * horizontal scrolls the conversation instead, which is why every chat client
 * that tried it went back to wrapping.
 *
 * The cut is always the TAIL. The viewer's own reaction is not hoisted out of
 * the hidden set even though that would be friendlier, because hoisting is
 * reordering, and the one property this whole suite buys with first-appearance
 * ordering is that a chip never moves.
 */
export function splitReactions<T extends ReactionSummary>(
  summaries: readonly T[],
  cap: number = REACTION_DISPLAY_CAP,
): ReactionSplit<T> {
  const limit = Math.max(1, Math.floor(cap));
  if (summaries.length <= limit) return { shown: [...summaries], hidden: [], overflow: 0 };
  // The "+N" chip occupies a slot of its own, so showing `limit` pills PLUS the
  // chip would overflow the row it was measured for — the same slot-back trade
  // `splitOverflow` and `typingText` make elsewhere in commons.
  const keep = Math.max(1, limit - 1);
  return { shown: summaries.slice(0, keep), hidden: summaries.slice(keep), overflow: summaries.length - keep };
}

// ---- labels ----------------------------------------------------------------

/**
 * Which sentence a pill's accessible name should take.
 *
 * Four templates rather than one with a plural rule, for the same reason
 * `typingText` returns a key instead of a sentence: "3 reactions, you reacted"
 * is three grammar problems at once, and the ones that matter (Arabic's dual,
 * Japanese having no plural, the fact that "you reacted" is a clause with its
 * own word order) do not survive a string concatenation.
 */
export type ReactionLabelKey = 'one' | 'other' | 'oneByViewer' | 'otherByViewer';

/** A pill's state, resolved into what a template needs — never into a sentence. */
export interface ReactionLabelState {
  key: ReactionLabelKey;
  emoji: string;
  count: number;
  byViewer: boolean;
}

/** Picks the template a pill's accessible name should use. */
export function reactionLabelState(summary: ReactionSummary): ReactionLabelState {
  const one = summary.count === 1;
  const byViewer = summary.reactedByViewer;
  const key: ReactionLabelKey = byViewer ? (one ? 'oneByViewer' : 'otherByViewer') : one ? 'one' : 'other';
  return { key, emoji: summary.emoji, count: summary.count, byViewer };
}

/**
 * Every string the reaction surfaces speak. English defaults live in
 * `defaultReactionLabels` for the native binding, which has no message catalog;
 * the DOM binding resolves the same keys through the kit's translator.
 *
 * The `{emoji}`, `{count}`, and `{name}` placeholders are the same syntax the
 * kit catalog interpolates, so each of these is an ordinary catalog entry.
 */
export interface ReactionLabels {
  /** e.g. `'{emoji}, 1 reaction'` */
  one: string;
  /** e.g. `'{emoji}, {count} reactions'` */
  other: string;
  /** e.g. `'{emoji}, 1 reaction, you reacted'` */
  oneByViewer: string;
  /** e.g. `'{emoji}, {count} reactions, you reacted'` */
  otherByViewer: string;
  /** The toolbar's own name. */
  bar: string;
  /** e.g. `'Show {count} more reactions'` — the overflow chip's accessible name. */
  overflow: string;
  /** e.g. `'+{count}'` — the overflow chip's visible text, separate so a locale can renumber it. */
  overflowShort: string;
  /** The add-a-reaction chip. */
  add: string;
  /** The picker panel's name. */
  picker: string;
  /** The picker's search field. */
  pickerSearch: string;
  /** The frequently-used row. */
  pickerFrequent: string;
  /** All of the picker's emoji. */
  pickerAll: string;
  /** Shown when a query matches nothing. */
  pickerEmpty: string;
}

export const defaultReactionLabels: ReactionLabels = {
  one: '{emoji}, 1 reaction',
  other: '{emoji}, {count} reactions',
  oneByViewer: '{emoji}, 1 reaction, you reacted',
  otherByViewer: '{emoji}, {count} reactions, you reacted',
  bar: 'Reactions',
  overflow: 'Show {count} more reactions',
  overflowShort: '+{count}',
  add: 'Add a reaction',
  picker: 'Choose a reaction',
  pickerSearch: 'Search emoji',
  pickerFrequent: 'Frequently used',
  pickerAll: 'All emoji',
  pickerEmpty: 'No emoji found',
};

/** The strings the action cluster speaks. */
export interface MessageActionsLabels {
  /** The cluster's own name. */
  toolbar: string;
  /** The overflow control. */
  more: string;
}

export const defaultMessageActionsLabels: MessageActionsLabels = {
  toolbar: 'Message actions',
  more: 'More actions',
};

/** Interpolates `{name}` placeholders, matching the kit catalog's `format`. */
function interpolate(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) => (key in params ? String(params[key]) : whole));
}

/**
 * Spells a pill's accessible name. The name is the whole state — glyph, tally,
 * and whether the viewer is in it — because a button named "👍" tells a
 * screen-reader user neither how many people agreed nor what pressing it does.
 */
export function formatReactionLabel(
  state: ReactionLabelState,
  labels: Pick<ReactionLabels, ReactionLabelKey> = defaultReactionLabels,
): string {
  return interpolate(labels[state.key], { emoji: state.emoji, count: state.count });
}

// ---- keyboard --------------------------------------------------------------

/** A key press, structurally typed so commons never names a DOM event. */
export interface CursorKeyEvent {
  key: string;
}

export interface GridCursorOptions {
  /** Cells per row. Leave unset for a single row — a toolbar rather than a grid. */
  columns?: number;
  /** Right-to-left, which swaps the horizontal arrows. */
  rtl?: boolean;
}

/**
 * Moves a roving-tabindex cursor. One function for three surfaces — the
 * reaction bar's row, the action cluster's row, and the picker's grid — because
 * they are the same interaction at different column counts, and three copies is
 * three chances for Home to do something different in each.
 *
 * Horizontal movement WRAPS: a single row of chips has two ends and no meaning
 * beyond them, so wrapping costs nothing and saves a keypress. Vertical
 * movement CLAMPS: in a grid, wrapping from the top row to the bottom throws the
 * eye across the entire panel for what the user read as a one-step move.
 *
 * Returns the current index for any key it does not handle, so a caller can
 * compare identity to decide whether to `preventDefault`.
 */
export function moveGridCursor(
  index: number,
  event: CursorKeyEvent,
  count: number,
  options: GridCursorOptions = {},
): number {
  if (count <= 0) return 0;
  const { columns = count, rtl = false } = options;
  const stride = Math.max(1, Math.floor(columns));
  const wrap = (i: number): number => ((i % count) + count) % count;
  const forward = rtl ? -1 : 1;

  switch (event.key) {
    case 'ArrowRight':
      return wrap(index + forward);
    case 'ArrowLeft':
      return wrap(index - forward);
    case 'ArrowDown':
      return index + stride < count ? index + stride : index;
    case 'ArrowUp':
      return index - stride >= 0 ? index - stride : index;
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return index;
  }
}

// ---- the emoji set ---------------------------------------------------------

/** One choosable emoji and the words that find it. */
export interface EmojiEntry {
  emoji: string;
  /** Its name. Also the cell's accessible name — a screen reader cannot read a picture. */
  name: string;
  /** Extra search terms. */
  keywords?: readonly string[];
}

/**
 * The picker's cold-start set: forty glyphs, not four thousand.
 *
 * A full emoji dataset is explicitly out of scope, and not for size reasons. A
 * usable one is localised (the name a Spanish speaker searches is not
 * "thinking face"), skin-toned, grouped, and versioned against the Unicode
 * release the platform's font actually has — all of which are things an app
 * owns and updates on its own schedule. Freezing one inside a design system
 * would be stale within a release and untranslatable forever, so `emojis` is a
 * prop and this is only what the picker shows before an app supplies its own.
 *
 * The forty here are the ones that answer a message: the eight in
 * `frequentReactions` plus the range of reply a reaction stands in for.
 */
export const defaultEmojiSet: readonly EmojiEntry[] = [
  { emoji: '👍', name: 'thumbs up', keywords: ['yes', 'agree', 'ok', 'like'] },
  { emoji: '👎', name: 'thumbs down', keywords: ['no', 'disagree', 'dislike'] },
  { emoji: '❤️', name: 'red heart', keywords: ['love', 'like'] },
  { emoji: '🔥', name: 'fire', keywords: ['hot', 'lit', 'great'] },
  { emoji: '😂', name: 'tears of joy', keywords: ['laugh', 'lol', 'funny'] },
  { emoji: '🤣', name: 'rolling on the floor laughing', keywords: ['laugh', 'rofl', 'funny'] },
  { emoji: '😊', name: 'smiling face', keywords: ['happy', 'smile'] },
  { emoji: '😍', name: 'heart eyes', keywords: ['love', 'adore'] },
  { emoji: '😮', name: 'open mouth', keywords: ['wow', 'surprised', 'shock'] },
  { emoji: '😢', name: 'crying face', keywords: ['sad', 'tear', 'sorry'] },
  { emoji: '😭', name: 'loudly crying face', keywords: ['sad', 'sob'] },
  { emoji: '😡', name: 'angry face', keywords: ['mad', 'rage'] },
  { emoji: '🤔', name: 'thinking face', keywords: ['hmm', 'consider', 'unsure'] },
  { emoji: '🙄', name: 'rolling eyes', keywords: ['whatever', 'ugh'] },
  { emoji: '😴', name: 'sleeping face', keywords: ['tired', 'zzz', 'bored'] },
  { emoji: '🥳', name: 'partying face', keywords: ['celebrate', 'party'] },
  { emoji: '🎉', name: 'party popper', keywords: ['celebrate', 'congrats', 'hooray'] },
  { emoji: '🎊', name: 'confetti ball', keywords: ['celebrate', 'party'] },
  { emoji: '🙏', name: 'folded hands', keywords: ['thanks', 'please', 'pray'] },
  { emoji: '👏', name: 'clapping hands', keywords: ['applause', 'bravo', 'well done'] },
  { emoji: '🙌', name: 'raising hands', keywords: ['celebrate', 'praise', 'yay'] },
  { emoji: '👀', name: 'eyes', keywords: ['look', 'seen', 'watching'] },
  { emoji: '✅', name: 'check mark', keywords: ['done', 'yes', 'complete'] },
  { emoji: '❌', name: 'cross mark', keywords: ['no', 'wrong', 'cancel'] },
  { emoji: '⚠️', name: 'warning', keywords: ['caution', 'careful'] },
  { emoji: '❓', name: 'question mark', keywords: ['question', 'ask', 'huh'] },
  { emoji: '❗', name: 'exclamation mark', keywords: ['important', 'urgent'] },
  { emoji: '💯', name: 'hundred points', keywords: ['perfect', 'score', 'agree'] },
  { emoji: '💡', name: 'light bulb', keywords: ['idea', 'suggestion'] },
  { emoji: '🚀', name: 'rocket', keywords: ['ship', 'launch', 'fast'] },
  { emoji: '🐛', name: 'bug', keywords: ['issue', 'defect', 'error'] },
  { emoji: '🛠️', name: 'hammer and wrench', keywords: ['fix', 'build', 'work'] },
  { emoji: '📌', name: 'pushpin', keywords: ['pin', 'important', 'save'] },
  { emoji: '☕', name: 'hot beverage', keywords: ['coffee', 'break', 'tea'] },
  { emoji: '🍕', name: 'pizza', keywords: ['food', 'lunch'] },
  { emoji: '🎂', name: 'birthday cake', keywords: ['birthday', 'celebrate'] },
  { emoji: '🌈', name: 'rainbow', keywords: ['pride', 'colour'] },
  { emoji: '⭐', name: 'star', keywords: ['favourite', 'great'] },
  { emoji: '💀', name: 'skull', keywords: ['dead', 'funny', 'dying'] },
  { emoji: '🤝', name: 'handshake', keywords: ['deal', 'agree', 'welcome'] },
];

/**
 * Narrows an emoji set by a query.
 *
 * Prefix matches on the name come first, then everything else that matches
 * anywhere in the name or a keyword — so typing "he" puts "heart eyes" above
 * "hot beverage" without needing a scoring model. Within each band the input
 * order is preserved exactly, because the set's order is the app's decision and
 * a search should narrow a list, not re-sort it.
 *
 * An empty or whitespace-only query returns the set unchanged rather than
 * nothing, so a cleared search field restores the picker instead of emptying it.
 */
export function searchEmoji(entries: readonly EmojiEntry[], query: string): EmojiEntry[] {
  const q = query.trim().toLowerCase();
  if (q === '') return [...entries];

  const prefix: EmojiEntry[] = [];
  const rest: EmojiEntry[] = [];
  for (const entry of entries) {
    const name = entry.name.toLowerCase();
    if (name.startsWith(q) || entry.emoji === query.trim()) {
      prefix.push(entry);
      continue;
    }
    const hit = name.includes(q) || (entry.keywords ?? []).some((k) => k.toLowerCase().includes(q));
    if (hit) rest.push(entry);
  }
  return [...prefix, ...rest];
}

// ---- message actions -------------------------------------------------------

/** The reserved ids, in the order they read. `more` names the generated overflow control. */
export type MessageActionId = (typeof messageActionOrder)[number];

/** One offered action, renderer-agnostic apart from its `icon` slot. */
export interface MessageAction<Icon = unknown> {
  /** Stable id and render key. The reserved ids sort themselves; anything else keeps its given order. */
  id: string;
  /** The accessible name in the cluster, and the visible label in the menu. */
  label: string;
  icon?: Icon;
  /** Paints the danger tone in the menu layout. */
  danger?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
}

const MORE_RANK = messageActionOrder.indexOf('more');

/**
 * Sorts actions into the shared order.
 *
 * Reserved ids take their declared position; anything an app adds (copy, pin,
 * delete) ranks just before `more`, so a custom action lands among the actions
 * rather than after the overflow control. The sort is stable, so several custom
 * actions keep the order they were given.
 */
export function orderMessageActions<T extends { id: string }>(actions: readonly T[]): T[] {
  const rank = (id: string): number => {
    const at = (messageActionOrder as readonly string[]).indexOf(id);
    return at === -1 ? MORE_RANK - 0.5 : at;
  };
  return [...actions].sort((a, b) => rank(a.id) - rank(b.id));
}

/** A capped cluster: what stays inline, and what the overflow menu holds. */
export interface MessageActionSplit<T extends { id: string }> {
  inline: T[];
  overflow: T[];
}

/**
 * Orders a cluster and caps it.
 *
 * When the set overflows, one inline slot is given back to the "more" control —
 * the same trade `splitReactions` and `typingText` make, for the same reason:
 * the control occupies a slot, so `cap` inline actions PLUS a more button is one
 * wider than the space that was measured. A set that fits keeps every slot and
 * grows no overflow control at all, so the common three-action message never
 * shows an empty menu.
 */
export function splitMessageActions<T extends { id: string }>(
  actions: readonly T[],
  cap: number = MESSAGE_ACTION_INLINE_CAP,
): MessageActionSplit<T> {
  const ordered = orderMessageActions(actions);
  const limit = Math.max(1, Math.floor(cap));
  if (ordered.length <= limit) return { inline: ordered, overflow: [] };
  const keep = Math.max(1, limit - 1);
  return { inline: ordered.slice(0, keep), overflow: ordered.slice(keep) };
}
