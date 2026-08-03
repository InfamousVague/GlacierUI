/**
 * Message presentation - the measurements and mappings a rendered message needs,
 * as opposed to the rules about the transcript itself.
 *
 * `chat.ts` owns WHAT a transcript is: where runs break, where separators land,
 * which slot in a run a message occupies, which status a stack advertises. This
 * module owns HOW WIDE and HOW ROUND - the handful of numbers and names that a
 * DOM bubble and a React Native bubble must agree on or the two kits quietly
 * draw different chat apps.
 *
 * Delivery is NOT here. Which shape a status draws, which token tints it, and
 * what it is called all live in `status.ts`, because the same answers are needed
 * by the standalone delivery mark as by a bubble's meta line - and a second copy
 * of that table is how "delivered" and "read" end up sharing a silhouette on one
 * surface and not the other.
 *
 * The split matters because these are the values most likely to be re-guessed:
 * a corner radius or a max-width ratio looks like styling, so it gets typed into
 * a stylesheet on one side and a style object on the other, and nobody notices
 * they disagree until a screenshot comparison. Everything here is therefore
 * either a bare `--glacier-*` token name (each binding wraps it its own way) or
 * a plain number, and neither binding is allowed a literal of its own.
 *
 * Nothing here is added to `chat.ts`: that module is the log's contract and is
 * consumed by the list, the reactions, and the typing atoms as well. This one is
 * only about drawing a message.
 */

import type { BubblePosition } from './chat.ts';
import { deliveryLabels, type DeliveryLabels } from './status.ts';

/**
 * The two chat layouts, which are genuinely different products rather than two
 * skins of one.
 *
 * - `bubble` - iMessage, WhatsApp, Signal. A tinted, rounded, edge-aligned
 *   capsule whose corners encode its place in a run, sized to its content and
 *   capped well short of the column so authorship is legible from shape and
 *   position alone.
 * - `row` - Slack, Discord, IRC. Full-width prose with an avatar gutter and a
 *   name/time header, no fill at all. Alignment carries no meaning here, so the
 *   header has to say who is talking.
 */
export type MessageLayout = 'bubble' | 'row';

/**
 * Which edge of the transcript a message hugs, in logical terms.
 *
 * Deliberately `start`/`end` rather than `left`/`right`. The physical reading is
 * a consequence of the writing direction, not a property of the message: an
 * Arabic transcript mirrors as a whole, exactly the way the platform's own chat
 * app does, and pinning "mine" to the physical right would leave the viewer's
 * own messages on the wrong side of their own language.
 */
export type MessageSide = 'start' | 'end';

/**
 * Where authorship puts a message.
 *
 * The viewer's own messages take the trailing edge. This is the one convention
 * every major client shares, and it is not arbitrary: the composer sits at the
 * bottom-trailing corner, so a sent message travels the shortest possible
 * distance from where it was typed to where it lands.
 *
 * In `row` layout every message takes the leading edge regardless of author -
 * a Slack transcript is a single column and alignment says nothing - so callers
 * in that layout pass the side straight through rather than deriving it here.
 */
export function messageSide(own: boolean): MessageSide {
  return own ? 'end' : 'start';
}

/**
 * The four corner radii of a bubble, named logically: `startStart` is the corner
 * at the start of the block axis and the start of the inline axis (top-leading
 * in a Latin transcript), and so on around the box. These map one-to-one onto
 * the CSS `border-start-start-radius` family and onto React Native's
 * `borderStartStartRadius` family, so both bindings apply them without doing
 * any left/right arithmetic of their own.
 *
 * Values are bare token names.
 */
export interface BubbleCorners {
  startStart: string;
  startEnd: string;
  endStart: string;
  endEnd: string;
}

/** A bubble's normal, fully rounded corner. */
const ROUND = 'radius-xl';

/**
 * The corner facing a neighbour in the same run. Not zero: a hard right angle
 * reads as a rendering bug rather than as continuation, while a small radius
 * reads as one shape that has been cut.
 */
const TIGHT = 'radius-xs';

/** The corner a tail grows out of; it must be square or the join shows a seam. */
const FLUSH = 'radius-none';

/**
 * The corner radii for one bubble, given its slot in the run.
 *
 * This is the whole reason `bubblePosition` exists. A run of four messages is
 * one utterance, and the eye reads it as one utterance only if the stacked edge
 * behaves like a single tall shape that has been sliced: the corners facing a
 * neighbour tighten, the corners facing open space stay round. Get it wrong and
 * four separate lozenges say "four separate thoughts", which is a lie about the
 * conversation.
 *
 * Only the outer edge - the one the run hugs - carries the geometry. The inner
 * edge faces the empty half of the column, so it stays round the whole way down
 * and gives the stack its silhouette. That asymmetry is what makes a bubble run
 * recognisable at a glance, and it is why the side has to be passed in.
 *
 * `tail` squares the outer bottom corner, because a tail drawn against a rounded
 * corner leaves a visible notch where the two curves meet.
 */
export function bubbleCorners(
  position: BubblePosition,
  side: MessageSide,
  tail = false,
): BubbleCorners {
  const stacksAbove = position === 'middle' || position === 'last';
  const stacksBelow = position === 'first' || position === 'middle';
  const outerTop = stacksAbove ? TIGHT : ROUND;
  const outerBottom = tail ? FLUSH : stacksBelow ? TIGHT : ROUND;

  return side === 'end'
    ? { startStart: ROUND, startEnd: outerTop, endStart: ROUND, endEnd: outerBottom }
    : { startStart: outerTop, startEnd: ROUND, endStart: outerBottom, endEnd: ROUND };
}

/**
 * Whether this bubble is the one that gets the tail.
 *
 * One tail per run, on the message that ends it, because the tail marks where
 * the utterance is anchored to its author - repeating it on every bubble turns a
 * stack into a row of separate speech balloons and undoes the corner geometry
 * above. `only` counts as a run of one.
 */
export function bubbleHasTail(position: BubblePosition, tails: boolean): boolean {
  return tails && (position === 'only' || position === 'last');
}

/**
 * The tail, as a path rather than a pseudo-element.
 *
 * React Native has no `::after`, so a CSS-only tail would have to be
 * re-invented for the native binding and would drift the first time either side
 * was tweaked. An SVG path is the one description both bindings render natively
 * - `<path>` on the DOM, `react-native-svg`'s `Path` on device - from these
 * exact numbers.
 *
 * Authored pointing toward the physical right, with its inline-start edge on the
 * bubble's outer edge and its baseline flush with the bubble's bottom, so a
 * trailing bubble in a left-to-right transcript renders it untransformed. Every
 * other case is a horizontal flip; see `tailScaleX`.
 */
export const messageTail = {
  width: 8,
  height: 12,
  /**
   * Sweeps out of the bubble's side and returns along the bottom edge, so the
   * flare is continuous with the bubble rather than a triangle stuck to it.
   */
  path: 'M0 0C0 7 3 11 8 12L0 12Z',
} as const;

/**
 * Which way the tail points, as a horizontal scale factor.
 *
 * The path is physical - SVG has no logical axis and no amount of `direction`
 * on an ancestor will mirror a `d` attribute - so this is the one place in the
 * message layer where the writing direction has to be reasoned about explicitly.
 * The rule is simply "point away from the transcript's centre", which flips both
 * with the side and with the direction.
 *
 * The DOM binding passes `rtl: false` and lets a `:dir(rtl)` rule invert the
 * result, so the browser keeps owning direction; a React Native binding has no
 * such rule available and passes the flag it was given.
 */
export function tailScaleX(side: MessageSide, rtl = false): 1 | -1 {
  const pointsRight = side === 'end' ? !rtl : rtl;
  return pointsRight ? 1 : -1;
}

/**
 * How wide a bubble may grow, as a share of the transcript column.
 *
 * A bubble that can reach the full width stops being a bubble: with nothing left
 * over on the far side, alignment no longer distinguishes the two authors and
 * the transcript reads as a single column of tinted blocks. Leaving roughly a
 * quarter of the column empty is what keeps the "mine on that side, theirs on
 * this side" read alive even for long messages, and it also keeps line lengths
 * inside the range prose is comfortable at.
 */
export const BUBBLE_MAX_WIDTH = '72%';

/** The measurements one layout resolves to; spacing as bare token names. */
export interface MessageMetrics {
  /** Between two bubbles inside one run - tight, because they are one utterance. */
  stackGap: string;
  /** Between the avatar gutter and the run's content. */
  gutterGap: string;
  /** Between a run's header line and its first message. */
  lineGap: string;
  /** A bubble's own padding; unused by `row`, which paints nothing. */
  paddingInline: string;
  paddingBlock: string;
  /** Body text size. */
  fontSize: string;
  /** The avatar step this layout reserves. */
  avatarSize: 'sm' | 'md';
  /**
   * The gutter's width token, which must be exactly the avatar's diameter: every
   * message body in a run starts on the same line whether or not its row got the
   * avatar, and a continued run has to align with the one above it.
   */
  gutter: string;
}

const METRICS: Record<MessageLayout, MessageMetrics> = {
  bubble: {
    stackGap: 'space-1',
    gutterGap: 'space-2',
    lineGap: 'space-1',
    paddingInline: 'space-3',
    paddingBlock: 'space-2',
    fontSize: 'font-size-sm',
    // Small: in a bubble transcript the avatar is a repeated identity cue beside
    // an already-obvious shape, so it should not outweigh the message.
    avatarSize: 'sm',
    gutter: 'size-xl',
  },
  row: {
    // Rows are prose with no fill to separate them, so consecutive lines sit
    // almost flush and the run's own gap does the separating.
    stackGap: 'space-0',
    gutterGap: 'space-3',
    lineGap: 'space-1',
    paddingInline: 'space-0',
    paddingBlock: 'space-0',
    fontSize: 'font-size-sm',
    // Larger: with no fill and no alignment, the avatar is the only thing
    // marking where one author's block begins.
    avatarSize: 'md',
    gutter: 'size-2xl',
  },
};

/** Resolves a layout to its measurements, so both bindings pack a run alike. */
export function messageMetrics(layout: MessageLayout): MessageMetrics {
  return METRICS[layout] ?? METRICS.bubble;
}

/**
 * Everything a message says out loud.
 *
 * The five delivery words are `DeliveryLabels` verbatim rather than restated,
 * because a bubble's meta line and a standalone delivery mark are reporting the
 * same fact: two sets would let a transcript say "Not sent" beside the glyph and
 * "Not delivered" under it. `edited` is the only word a message owns that a
 * delivery mark has no use for, so it is the only one added here.
 */
export interface MessageLabels extends DeliveryLabels {
  /** Appended to a message whose author has since changed it. */
  edited: string;
}

/**
 * The English fallbacks, shared so the two bindings cannot disagree about the
 * shape of the label set - the DOM kit overlays its translation catalog on top
 * of these, and a native app passes its own.
 */
export const defaultMessageLabels: MessageLabels = {
  ...deliveryLabels,
  edited: 'Edited',
};
