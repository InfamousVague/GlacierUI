/**
 * Presence and people logic — the parts of a chat app's person-shaped
 * components that are decisions rather than pixels, shared so both bindings
 * behave and measure identically.
 *
 * Paint lives in the specs (`presence-dot`, `avatar-group`, `member-row`) and
 * is read through the shared resolvers; what lives here is everything a
 * renderer cannot derive from a token: which status draws which shape, how far
 * one avatar covers the next, how many fit before the stack gives up and counts,
 * and the English fallback labels that keep presence from being colour-only.
 */

// ---- presence ---------------------------------------------------------------

/**
 * The presence vocabulary. Closed on purpose: unlike a StatusDot's open tone
 * scale, "who is reachable right now" is a fixed set every chat product agrees
 * on, and letting callers invent members is how two screens end up disagreeing
 * about what amber means.
 *
 * - `online` — reachable now.
 * - `away` — signed in, idle.
 * - `busy` — signed in and asking not to be interrupted (do not disturb).
 * - `offline` — not signed in.
 * - `invisible` — signed in but appearing offline to everyone else. Only ever
 *   shown to the person themselves, which is why it is distinct from `offline`.
 */
export type PresenceStatus = 'online' | 'away' | 'busy' | 'offline' | 'invisible';

/** The statuses in reachability order, so a picker or legend reads top-down. */
export const presenceStatuses: readonly PresenceStatus[] = [
  'online',
  'away',
  'busy',
  'offline',
  'invisible',
];

/**
 * The mark a presence dot draws inside its circle.
 *
 * Colour alone cannot carry presence — roughly one in twelve men cannot
 * separate the green and amber the scale leans on, and a dot is far too small
 * for a hue to survive a bad display. So every status also differs in SHAPE:
 *
 * - `fill` — a solid disc (online).
 * - `crescent` — a disc with a bite out of it, the moon idiom (away).
 * - `bar` — a disc crossed by a bar, the universal do-not-disturb glyph (busy).
 * - `ring` — hollow: nothing is home (offline).
 * - `ring-dot` — hollow with a core, present but not showing (invisible).
 */
export type PresenceShape = 'fill' | 'crescent' | 'bar' | 'ring' | 'ring-dot';

const PRESENCE_SHAPE: Record<PresenceStatus, PresenceShape> = {
  online: 'fill',
  away: 'crescent',
  busy: 'bar',
  offline: 'ring',
  invisible: 'ring-dot',
};

/** The shape a status draws. Shared so the two bindings cannot draw two moons. */
export function presenceShape(status: PresenceStatus): PresenceShape {
  return PRESENCE_SHAPE[status] ?? 'fill';
}

/**
 * The mark geometry, as fractions of the dot's own diameter rather than
 * lengths.
 *
 * Ratios, not tokens, because the dot has two size steps and the mark has to
 * hold its proportions at both — a fixed 3px bar is half a small dot and a
 * quarter of a large one. Each binding multiplies these by its own diameter
 * (CSS percentages inside the dot's box, or a `calc()` against the size token),
 * so there is one set of numbers and no second guess at "about a third".
 */
export const presenceMark = {
  /** Diameter of the circle bitten out of the disc to make the crescent. */
  crescent: 0.72,
  /** How far that circle sits past the disc's top inline-end corner. */
  crescentInset: -0.2,
  /** The do-not-disturb bar. */
  barWidth: 0.56,
  barHeight: 0.2,
  /** Stroke of a hollow dot's ring. */
  ringStroke: 0.26,
  /** The core disc inside the invisible ring. */
  core: 0.34,
  /** Halo drawn behind a dot pinned to an avatar, so its edge stays legible. */
  halo: 0.16,
} as const;

/**
 * The English fallbacks for the text alternative every presence dot carries.
 * They live here rather than in either binding because both need the same words
 * before an app supplies translations, and a dot that says "Online" on the web
 * and "Available" on a phone is a bug the type system cannot catch.
 */
export interface PresenceLabels {
  online: string;
  away: string;
  busy: string;
  offline: string;
  invisible: string;
}

export const presenceLabels: PresenceLabels = {
  online: 'Online',
  away: 'Away',
  busy: 'Do not disturb',
  offline: 'Offline',
  invisible: 'Invisible',
};

/** The text alternative for a status, with any supplied overrides merged in. */
export function presenceLabel(status: PresenceStatus, labels?: Partial<PresenceLabels>): string {
  return labels?.[status] ?? presenceLabels[status];
}

/**
 * The dot step that reads correctly pinned to each avatar step. Small avatars
 * cannot host the larger dot without the mark swallowing the face; large ones
 * make the smaller dot look like dust.
 */
export function presenceDotSize(avatarSize: 'sm' | 'md' | 'lg' | 'xl'): 'sm' | 'md' {
  return avatarSize === 'sm' || avatarSize === 'md' ? 'sm' : 'md';
}

// ---- avatar stacking --------------------------------------------------------

/**
 * Which end of a stack sits on top.
 *
 * - `first-on-top` — the first avatar overlaps the second, and so on back. The
 *   default: reading order and stacking order agree, so the eye starts at the
 *   person the list considers most relevant.
 * - `last-on-top` — the trailing edge wins, which is what a stack that grows
 *   rightward toward a counter wants.
 */
export type AvatarStackDirection = 'first-on-top' | 'last-on-top';

/**
 * The stack's shared measurements.
 *
 * `overlap` is a fraction of one avatar's diameter, so a stack holds its
 * proportions across all four avatar steps instead of needing a negative margin
 * per size. A third is the point where the faces still read as separate people
 * but the group reads as one object; past about two thirds the initials of the
 * covered avatars disappear, which is why `clampOverlap` stops there.
 */
export const avatarStack = {
  /** Fraction of a diameter each avatar covers of the one before it. */
  overlap: 0.32,
  /** Avatars drawn before the count takes over. The count is extra, not one of these. */
  max: 4,
  /** Ring drawn around each avatar so overlapping edges separate, as a fraction of the diameter. */
  ring: 0.07,
} as const;

/**
 * Read receipts are the same stack tuned down: tiny, tighter, and fewer, since
 * they sit under a message bubble rather than in a header and must not compete
 * with it. Its own numbers rather than a second guess in each binding.
 */
export const readReceiptStack = {
  overlap: 0.46,
  max: 3,
  /** The smallest avatar step; a read receipt is a hint, not a roster. */
  size: 'sm',
} as const;

/**
 * The English fallbacks for the strings a stack builds for itself, and the
 * templates an app replaces to translate them. `{n}` and `{names}` are the only
 * placeholders, matching the kit's own message catalog.
 */
export interface AvatarStackLabels {
  /** The count chip's accessible name. */
  more: string;
}

export const avatarStackLabels: AvatarStackLabels = { more: '{n} more' };

export interface ReadReceiptLabels extends AvatarStackLabels {
  readBy: string;
}

export const readReceiptLabels: ReadReceiptLabels = { ...avatarStackLabels, readBy: 'Read by {names}' };

/** Fills a template's `{key}` placeholders. Shared so both bindings interpolate alike. */
export function fillTemplate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = values[key];
    return value === undefined ? match : String(value);
  });
}

/**
 * The roster a stack announces: the names it drew, then the count it did not,
 * as one comma-joined list.
 *
 * Comma-joined rather than "A, B and C" on purpose — the conjunction differs per
 * language and per list length, and a hardcoded English "and" reads worse in a
 * translated app than a plain list does in any of them.
 */
export function stackLabel(
  names: readonly string[],
  overflow: number,
  moreTemplate: string = avatarStackLabels.more,
): string {
  const parts = names.filter((name) => name.trim().length > 0);
  if (overflow > 0) parts.push(fillTemplate(moreTemplate, { n: overflow }));
  return parts.join(', ');
}

/** Keeps an overlap inside the range where the stack still reads as faces. */
export function clampOverlap(overlap: number): number {
  if (!Number.isFinite(overlap)) return avatarStack.overlap;
  return Math.min(0.66, Math.max(0, overlap));
}

/** What a stack draws: the avatars that fit, and how many it could not. */
export interface StackSplit<T> {
  shown: T[];
  /** How many items the count stands for; 0 when everything fit. */
  overflow: number;
}

/**
 * Splits a roster into the avatars a stack draws and the number it counts.
 *
 * `max` is how many AVATARS are drawn; the "+N" counter is extra rather than
 * occupying the last slot, so a stack of four with `max` four shows four faces
 * and no counter, and a fifth person turns into "+1" beside them. The three
 * cases a caller hits — under, exactly at, and over the limit — all fall out of
 * this one function so neither binding has to rediscover the boundary.
 */
export function splitStack<T>(items: readonly T[], max: number): StackSplit<T> {
  // A non-positive max would otherwise render a bare counter with no anchor.
  const limit = Math.max(1, Math.floor(Number.isFinite(max) ? max : avatarStack.max));
  if (items.length <= limit) return { shown: [...items], overflow: 0 };
  return { shown: items.slice(0, limit), overflow: items.length - limit };
}

/**
 * The paint order for one slot. Returned as a plain number so each binding
 * hands it to its own layer property (CSS `z-index`, RN `zIndex`) rather than
 * reversing the child array on one platform and not the other.
 */
export function stackDepth(index: number, count: number, direction: AvatarStackDirection): number {
  return direction === 'first-on-top' ? count - index : index + 1;
}

// ---- roles ------------------------------------------------------------------

/**
 * The tone a role pill takes. Not a new component: a role badge IS a Pill, and
 * what the two bindings actually have to agree on is which tone a given role
 * name maps to, so "Owner" is not accent in a member list and warning in a
 * mention popover.
 */
export type MemberRoleTone = 'neutral' | 'accent' | 'info' | 'warning';

const ROLE_TONE: Record<string, MemberRoleTone> = {
  owner: 'accent',
  admin: 'accent',
  moderator: 'info',
  mod: 'info',
  guest: 'warning',
  bot: 'neutral',
  app: 'neutral',
  member: 'neutral',
};

/**
 * The tone for a role name, case- and space-insensitive. Anything unrecognised
 * rests neutral: an unknown role is a label, not an alarm.
 */
export function memberRoleTone(role: string): MemberRoleTone {
  return ROLE_TONE[role.trim().toLowerCase()] ?? 'neutral';
}
