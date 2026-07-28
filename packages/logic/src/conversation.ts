/**
 * Conversation-list logic — everything a chat sidebar row decides before it is
 * painted: how long a snippet may be, how a count is capped, how a timestamp
 * reads at a glance, and which marker wins which slot when a conversation is
 * pinned and muted and has a failed send and four unread messages all at once.
 *
 * All of it lives here because both bindings need the same answers. A row that
 * truncates at 120 characters on the web and 80 on the phone is two products.
 */

// TODO(integration): switch to '@glacier/spec' once the conversation specs are
// registered in packages/spec/src/index.ts.
import {
  conversationListItemSpec,
  conversationMarkerOrder,
} from '../../spec/src/components/conversation-list.ts';
import { startOfDay } from './calendar-view.ts';
import { sizeFor, dimensionsFor } from './spec.ts';

/**
 * How tightly a row is packed. Two steps, not three: a sidebar row is either
 * "fit more threads on screen" or "let me read the last message", and a third
 * step in between is a preference nobody has.
 */
export type ConversationDensity = 'compact' | 'comfortable';

/**
 * One conversation as the list needs to know it. Renderer-agnostic on purpose —
 * `avatar` is the one React-shaped field, because an avatar for a group chat is
 * an AvatarGroup and the row must not have to know which it was handed.
 */
export interface ConversationSummary {
  /** Stable id; selection and keyboard focus are keyed off it. */
  id: string;
  /** Who the conversation is with. A plain string: it is also the accessible name. */
  name: string;
  /** The last message body. */
  snippet?: string;
  /** Who sent the last message. Prefixed to the snippet in a group chat. */
  sender?: string;
  /** When the last message landed. */
  timestamp?: Date | number;
  /** Unread messages waiting. */
  unreadCount?: number;
  /** Notifications silenced. */
  muted?: boolean;
  /** Kept at the top of the list. */
  pinned?: boolean;
  /** An unsent draft is waiting in the composer. */
  draft?: boolean;
  /** The last outgoing message did not send. */
  failed?: boolean;
}

// ---- markers ---------------------------------------------------------------

/** Every annotation a row can carry. */
export type ConversationMarker = (typeof conversationMarkerOrder)[number];

/**
 * The precedence order, straight from the spec so the contract has one home:
 * failed, draft, unread, muted, pinned.
 *
 * Precedence is not "which one to show" — it is "which one wins a contested
 * slot". The row has three slots and they are deliberately independent, so a
 * conversation with every marker set still renders every marker:
 *
 * - the **prefix** slot, at the head of the snippet line, takes exactly one of
 *   `failed` or `draft`. Both replace what the snippet *means* — it stops being
 *   "the last thing said" and becomes "the thing you have to deal with" — so
 *   they cannot share. `failed` wins, because an undelivered message is a
 *   broken promise and a draft is only an unfinished one.
 * - the **meta** slot, beside the timestamp, takes `pinned` then `muted`. They
 *   are small, quiet glyphs describing the conversation rather than its
 *   contents, and both fit.
 * - the **badge** slot, on the trailing edge of the snippet line, takes
 *   `unread`.
 *
 * The single interaction between slots is that `muted` demotes the unread badge
 * from danger to neutral. Muting quiets a conversation; it does not lie about
 * having messages in it.
 */
export const CONVERSATION_MARKER_ORDER = conversationMarkerOrder;

/** Every marker the conversation carries, in precedence order. */
export function conversationMarkers(c: ConversationSummary): ConversationMarker[] {
  const present: Record<ConversationMarker, boolean> = {
    failed: c.failed === true,
    draft: c.draft === true,
    unread: (c.unreadCount ?? 0) > 0,
    muted: c.muted === true,
    pinned: c.pinned === true,
  };
  return CONVERSATION_MARKER_ORDER.filter((marker) => present[marker]);
}

/** The one marker that owns the snippet prefix, or null when the snippet speaks for itself. */
export function conversationPrefixMarker(c: ConversationSummary): 'failed' | 'draft' | null {
  if (c.failed) return 'failed';
  if (c.draft) return 'draft';
  return null;
}

/** The quiet glyphs that sit beside the timestamp, in the order they are drawn. */
export function conversationMetaMarkers(c: ConversationSummary): ('pinned' | 'muted')[] {
  const out: ('pinned' | 'muted')[] = [];
  if (c.pinned) out.push('pinned');
  if (c.muted) out.push('muted');
  return out;
}

/** Badge tones, named as CounterBadge's tone prop expects them. */
export type ConversationBadgeTone = 'danger' | 'neutral';

/** The unread badge, or null when there is nothing waiting. */
export function conversationBadge(
  c: ConversationSummary,
): { count: number; text: string; tone: ConversationBadgeTone } | null {
  const count = c.unreadCount ?? 0;
  if (count <= 0) return null;
  return {
    count,
    text: formatUnreadCount(count),
    // Muted demotes rather than hides: the count is still true.
    tone: c.muted ? 'neutral' : 'danger',
  };
}

// ---- unread count ----------------------------------------------------------

/**
 * The highest number a badge will print. Past this the exact figure stops being
 * information — "412 unread" and "99+ unread" prompt the same action — and the
 * badge would grow wide enough to eat the timestamp.
 */
export const UNREAD_DISPLAY_MAX = 99;

/** The badge's text: the count, or `99+` once it passes the cap. */
export function formatUnreadCount(count: number, max: number = UNREAD_DISPLAY_MAX): string {
  const whole = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  return whole > max ? `${max}+` : String(whole);
}

// ---- snippet ---------------------------------------------------------------

/**
 * How much of the last message a row shows. Long enough to recognise the thread
 * without opening it, short enough that two rows are never the same length by
 * accident. The row also clips visually; this cap exists so the *string* both
 * bindings hand to their text layer is identical, rather than one platform
 * ellipsising at a different column than the other.
 */
export const CONVERSATION_SNIPPET_MAX = 120;

/** The ellipsis a truncated snippet ends with (one glyph, not three periods). */
const ELLIPSIS = '…';

/**
 * Collapses a message to one line and trims it to `max` characters.
 *
 * Newlines and runs of whitespace collapse first: a message is authored as a
 * block and read here as a line, and a raw `\n` would either open a gap or be
 * silently dropped depending on the platform. The cut then falls on a word
 * boundary where one is available, because a snippet ending mid-word reads as a
 * rendering bug rather than a truncation.
 */
export function truncateSnippet(text: string | undefined, max: number = CONVERSATION_SNIPPET_MAX): string {
  const flat = (text ?? '').replace(/\s+/g, ' ').trim();
  if (flat.length <= max) return flat;
  const cut = flat.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  // A single word longer than the whole budget has no boundary to fall back on,
  // so it is cut where it lands rather than vanishing entirely.
  const body = lastSpace > 0 ? cut.slice(0, lastSpace) : cut;
  return `${body.trimEnd()}${ELLIPSIS}`;
}

/**
 * The snippet as it is shown, sender included.
 *
 * The sender is spent from outside the budget rather than inside it: in a group
 * chat "who said it" is the part you scan for, and letting a long body push the
 * name off the row would make every row look the same.
 */
export function conversationSnippet(
  c: Pick<ConversationSummary, 'snippet' | 'sender'>,
  max: number = CONVERSATION_SNIPPET_MAX,
): string {
  const body = truncateSnippet(c.snippet, max);
  const sender = (c.sender ?? '').trim();
  if (!sender) return body;
  if (!body) return sender;
  return `${sender}: ${body}`;
}

// ---- timestamps ------------------------------------------------------------

/**
 * Which shape a list-row timestamp takes. A row has one line's trailing edge to
 * spend, so the format shortens as the message gets older and precision stops
 * being useful: you care what *time* today's message arrived, only what *day*
 * last week's did, and only the date for anything older.
 */
export type ConversationTimestampBucket = 'time' | 'weekday' | 'date';

/** How many days back still reads as a weekday name rather than a date. */
const WEEKDAY_WINDOW_DAYS = 7;

const asDate = (value: Date | number): Date => (value instanceof Date ? value : new Date(value));

/** Whole days between two instants, by calendar day rather than elapsed hours. */
function daysBetween(from: Date, to: Date): number {
  const a = startOfDay(from).getTime();
  const b = startOfDay(to).getTime();
  return Math.round((b - a) / 86_400_000);
}

/** The bucket a timestamp falls in, relative to `now`. */
export function conversationTimestampBucket(
  value: Date | number,
  now: Date | number = Date.now(),
): ConversationTimestampBucket {
  const days = daysBetween(asDate(value), asDate(now));
  if (days <= 0) return 'time';
  // A future timestamp (clock skew, a scheduled send) reads as today rather
  // than falling through to a date, which would look like a bug.
  if (days < WEEKDAY_WINDOW_DAYS) return 'weekday';
  return 'date';
}

export interface ConversationTimestampOptions {
  /** The instant to measure against; injectable so tests and SSR are deterministic. */
  now?: Date | number;
  /** BCP-47 tag for Intl. Defaults to the host's. */
  locale?: string;
}

/**
 * A list-row timestamp: today's time, this week's weekday, or an older date.
 * Both bindings call this, so a row never reads `2:14 PM` on one platform and
 * `14:14` on the other for the same message and locale.
 */
export function conversationTimestamp(
  value: Date | number,
  options: ConversationTimestampOptions = {},
): string {
  const date = asDate(value);
  if (Number.isNaN(date.getTime())) return '';
  const { locale, now = Date.now() } = options;
  switch (conversationTimestampBucket(date, now)) {
    case 'time':
      return new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }).format(date);
    case 'weekday':
      return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date);
    default:
      // Two-digit year: a sidebar row cannot spare four, and a thread old
      // enough to show a date is one you are identifying, not scheduling.
      return new Intl.DateTimeFormat(locale, { year: '2-digit', month: 'numeric', day: 'numeric' }).format(date);
  }
}

/**
 * The unabbreviated timestamp, for the row's hidden phrase. "Tue" is enough to
 * scan and useless to hear — a screen reader user has no column of neighbours
 * to read it against.
 */
export function conversationTimestampLabel(value: Date | number, locale?: string): string {
  const date = asDate(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

// ---- sections --------------------------------------------------------------

/** The section buckets, in the order they stack. */
export type ConversationSectionId = 'pinned' | 'all';

export interface ConversationSection {
  id: ConversationSectionId;
  items: ConversationSummary[];
}

/**
 * Splits the list into Pinned and All, preserving the caller's order inside each
 * bucket — the list never re-sorts, because the order a chat app wants (most
 * recent activity) is a thing only the app knows.
 *
 * Empty sections are dropped rather than rendered headerless, and an ungrouped
 * list is one `all` section, so the renderer has exactly one shape to handle.
 */
export function groupConversations(
  items: readonly ConversationSummary[],
  grouped = true,
): ConversationSection[] {
  if (!grouped) return items.length ? [{ id: 'all', items: [...items] }] : [];
  const pinned = items.filter((c) => c.pinned);
  const rest = items.filter((c) => !c.pinned);
  const sections: ConversationSection[] = [];
  if (pinned.length) sections.push({ id: 'pinned', items: pinned });
  if (rest.length) sections.push({ id: 'all', items: rest });
  return sections;
}

/**
 * Every id in visual order across sections. This is the sequence the keyboard
 * walks and the sequence `aria-posinset` counts against, so a pinned row is
 * "1 of 20" and not "1 of 3".
 */
export function conversationOrder(sections: readonly ConversationSection[]): string[] {
  return sections.flatMap((section) => section.items.map((item) => item.id));
}

// ---- keyboard --------------------------------------------------------------

/**
 * Where a key moves the cursor, or `undefined` when the key is not ours to
 * handle (so the caller knows not to preventDefault).
 *
 * The ends clamp rather than wrap. A sidebar is a scrolled surface: wrapping
 * from the last row to the first teleports the viewport across thousands of
 * rows, and the user has no way to tell that from a crash.
 */
export function moveConversationCursor(
  ids: readonly string[],
  current: string | undefined,
  key: string,
): string | undefined {
  if (ids.length === 0) return undefined;
  const first = ids[0];
  const last = ids[ids.length - 1];
  const index = current === undefined ? -1 : ids.indexOf(current);

  switch (key) {
    case 'ArrowDown':
      // From nowhere, Down enters at the top rather than the second row.
      return index < 0 ? first : ids[Math.min(index + 1, ids.length - 1)];
    case 'ArrowUp':
      return index < 0 ? last : ids[Math.max(index - 1, 0)];
    case 'Home':
      return first;
    case 'End':
      return last;
    default:
      return undefined;
  }
}

// ---- geometry --------------------------------------------------------------

/**
 * The measurements a density resolves to. Spacing arrives as bare token names
 * for each binding to wrap its own way; the avatar and badge steps are
 * component size words, not tokens, because those components own their scales.
 */
export interface ConversationMetrics {
  /** Minimum row height. */
  height: string;
  paddingInline: string;
  paddingBlock: string;
  /** Between the avatar and the copy column. */
  gap: string;
  /** Between the name line and the snippet line. */
  lineGap: string;
  /** Between the timestamp and its marker glyphs. */
  metaGap: string;
  radius: string;
  fontSize: string;
  /** Avatar size step. */
  avatar: 'sm' | 'md';
  /** Counter badge size step. */
  badge: 'sm' | 'md';
  /** Marker glyph size, as a CSS length — glyphs sit off the token scale. */
  markerIcon: string;
}

const AVATAR_STEP: Record<ConversationDensity, 'sm' | 'md'> = { compact: 'sm', comfortable: 'md' };
const BADGE_STEP: Record<ConversationDensity, 'sm' | 'md'> = { compact: 'sm', comfortable: 'md' };

/**
 * Resolves a density to its measurements, reading the spec through the shared
 * resolvers rather than restating it. The spec is the one place the row's
 * geometry is written down; this is how both bindings get at it.
 */
export function conversationMetrics(density: ConversationDensity): ConversationMetrics {
  const size = sizeFor(conversationListItemSpec, density);
  const dims = dimensionsFor(conversationListItemSpec);
  return {
    height: size.height ?? 'size-4xl',
    paddingInline: size.paddingInline ?? 'space-3',
    paddingBlock: size.paddingBlock ?? 'space-3',
    gap: size.gap ?? dims.gap ?? 'space-3',
    lineGap: dims.lineGap ?? 'space-1',
    metaGap: dims.metaGap ?? 'space-1',
    radius: size.radius ?? dims.radius ?? 'radius-lg',
    fontSize: size.fontSize ?? 'font-size-sm',
    avatar: AVATAR_STEP[density] ?? 'md',
    badge: BADGE_STEP[density] ?? 'md',
    markerIcon: size.iconSize ?? '0.875rem',
  };
}

/**
 * Nominal row height in CSS pixels at the default root size.
 *
 * This is the one number in the file that is not a token, and it exists only so
 * a windowing strategy can compute a scroll offset without measuring the DOM.
 * Nothing paints from it — the row's real height still comes from the spec's
 * `height` token, which scales with density and root font size. Treat it as an
 * estimate: a windowing implementation should correct against measured rows.
 */
export function conversationRowHeight(density: ConversationDensity): number {
  // control-height-lg (3.25rem) and size-4xl (4rem) at a 16px root.
  return density === 'compact' ? 52 : 64;
}

/**
 * How wide each placeholder is while a row loads.
 *
 * Shared for the same reason the player's are: left to their own defaults the
 * two kits do not agree — the DOM Skeleton's text placeholder is a fixed `14ch`
 * and the native one is a fixed block, so a name and a timestamp would come out
 * the same length on one platform and different on the other.
 */
export const conversationSkeletonWidths = {
  name: '42%',
  snippet: '76%',
  /** A formatted timestamp is about five characters; px, so it does not stretch. */
  timestamp: 34,
  /** The unread badge's resting footprint. */
  badge: 20,
} as const;

// ---- copy ------------------------------------------------------------------

/**
 * Every string the list speaks. It lives here rather than in each binding
 * because the two would otherwise carry their own English defaults and drift
 * the moment one of them is reworded — which is exactly what happened to the
 * player's labels.
 *
 * The kit's message catalog is the translation home; these are the fallbacks a
 * consumer gets before wiring one up, and the shape a `labels` override fills.
 */
export interface ConversationLabels {
  /** Accessible name for the listbox itself. */
  list: string;
  /** Header and group name for the pinned section. */
  pinnedSection: string;
  /** Header and group name for everything else. */
  allSection: string;
  /** Hidden phrase for an unread row; given the already-capped count text. */
  unread: (count: string) => string;
  muted: string;
  pinned: string;
  draft: string;
  failed: string;
  /** Announced while the skeleton stands in for the list. */
  loading: string;
}

export const defaultConversationLabels: ConversationLabels = {
  list: 'Conversations',
  pinnedSection: 'Pinned',
  allSection: 'All conversations',
  unread: (count) => `${count} unread`,
  muted: 'Muted',
  pinned: 'Pinned',
  draft: 'Draft',
  failed: 'Not delivered',
  loading: 'Loading conversations',
};

/** The section's label, so both bindings title a group the same way. */
export function conversationSectionLabel(id: ConversationSectionId, labels: ConversationLabels): string {
  return id === 'pinned' ? labels.pinnedSection : labels.allSection;
}

/**
 * The phrases a row adds for assistive tech, in precedence order.
 *
 * Unread, muted, pinned, draft, and failed are all painted as weight, glyphs, or
 * a badge, and a screen reader gets none of that. Spelling them out is what
 * keeps the row's state from being carried by colour and position alone.
 */
export function conversationStateLabels(
  c: ConversationSummary,
  labels: ConversationLabels,
): string[] {
  const badge = conversationBadge(c);
  const phrases: Record<ConversationMarker, string | null> = {
    failed: labels.failed,
    draft: labels.draft,
    unread: badge ? labels.unread(badge.text) : null,
    muted: labels.muted,
    pinned: labels.pinned,
  };
  return conversationMarkers(c)
    .map((marker) => phrases[marker])
    .filter((phrase): phrase is string => phrase != null);
}

// ---- windowing seam --------------------------------------------------------

export interface ConversationWindowInput {
  /** Total rows in the flattened list. */
  total: number;
  /** Nominal row height in px, from `conversationRowHeight`. */
  rowHeight: number;
  /** Scroll offset of the host viewport. */
  scrollTop?: number;
  /** Height of the host viewport. Omit (or 0) to render everything. */
  viewportHeight?: number;
  /** Rows to keep mounted beyond each edge, so a fast scroll does not flash. */
  overscan?: number;
}

/** A slice of the list to render, plus the struts that stand in for the rest. */
export interface ConversationWindow {
  /** First index to render, inclusive. */
  start: number;
  /** Last index to render, exclusive. */
  end: number;
  /** Height of the leading strut, in px. */
  padStart: number;
  /** Height of the trailing strut, in px. */
  padEnd: number;
}

/**
 * The windowing calculation, written once so it cannot be done differently on
 * each platform — and, more to the point, so turning windowing on is a change
 * of *inputs* rather than a change of API.
 *
 * With no viewport height it returns the whole list and zero-height struts,
 * which is exactly what both bindings render today. The seam is that
 * `ConversationList` already renders its rows from `items` (not children),
 * already emits the two struts, and already numbers every row against the full
 * flattened order for `aria-posinset`. A windowing strategy therefore only has
 * to start feeding this function the host viewport's scrollTop and height; no
 * prop, no slot, and no accessibility attribute changes.
 */
export function conversationWindow(input: ConversationWindowInput): ConversationWindow {
  const { total, rowHeight, scrollTop = 0, viewportHeight = 0, overscan = 4 } = input;
  if (viewportHeight <= 0 || rowHeight <= 0 || total <= 0) {
    return { start: 0, end: total, padStart: 0, padEnd: 0 };
  }
  const firstVisible = Math.floor(Math.max(0, scrollTop) / rowHeight);
  const visibleCount = Math.ceil(viewportHeight / rowHeight) + 1;
  const start = Math.max(0, firstVisible - overscan);
  const end = Math.min(total, firstVisible + visibleCount + overscan);
  return {
    start,
    end,
    padStart: start * rowHeight,
    padEnd: Math.max(0, total - end) * rowHeight,
  };
}
