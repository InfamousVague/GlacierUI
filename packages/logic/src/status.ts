/**
 * Status and chrome decisions — the small, load-bearing answers the message
 * atoms and the conversation chrome need before anything is painted: which
 * SHAPE a delivery state draws, how much of a quoted message survives, and what
 * a connection does between losing the network and getting it back.
 *
 * None of it is pixels, all of it is shared. A tick cluster that means "read" on
 * the web and "delivered" on the phone, or a reply preview that cuts at 100
 * characters in one binding and 140 in the other, are the exact drifts this file
 * exists to make impossible.
 *
 * `chat.ts` owns the transcript rules (grouping, separators, timestamps, typing
 * state, delivery ordering) and is consumed here rather than re-derived —
 * `deliveryRank` in particular, which is the one authority on how far along a
 * message is.
 *
 * Scoped to delivery: the quoted-message, system-message, typing, thread, and
 * connection helpers that used to live here went with the components that were
 * their only callers.
 */

import { useEffect, useRef, useState } from 'react';
import { deliveryRank, type DeliveryStatus } from './chat.ts';

// ---- delivery ---------------------------------------------------------------

/**
 * The mark a delivery indicator draws.
 *
 * Every one of these is a different SILHOUETTE, not a different colour, and that
 * is the whole point. The tick cluster is the smallest thing in a transcript —
 * roughly the height of a lowercase letter — which makes it precisely where
 * colour-only meaning fails: a red failed tick and a blue read tick are the same
 * grey mark to a monochrome display, a colour-blind reader, or anyone glancing
 * at a phone in sunlight. So:
 *
 * - `clock` — queued, nothing has left the device yet.
 * - `check` — one tick: the server has it.
 * - `double-check` — two ticks: their device has it.
 * - `check-circle` — a tick enclosed in a solid disc: they read it. Solid mass
 *   against the bare strokes of `double-check`, so "read" and "delivered" differ
 *   by fill and outline, not only by hue.
 * - `alert` — a triangle. Deliberately not a tick at all: a failure is the one
 *   state that asks the user to do something, and it should not be readable as a
 *   variation on success.
 */
export type DeliveryGlyph = 'clock' | 'check' | 'double-check' | 'check-circle' | 'alert';

const DELIVERY_GLYPH: Record<DeliveryStatus, DeliveryGlyph> = {
  sending: 'clock',
  sent: 'check',
  delivered: 'double-check',
  read: 'check-circle',
  failed: 'alert',
};

/** The shape a delivery state draws. Each binding maps it to its own icon. */
export function deliveryGlyph(status: DeliveryStatus): DeliveryGlyph {
  return DELIVERY_GLYPH[status];
}

/**
 * The colour family a delivery state tints, layered *on top of* the shape rather
 * than instead of it.
 *
 * Everything short of read stays in the quiet greys: a transcript is a column of
 * these, and five hundred coloured ticks are a light show. Read earns the accent
 * because it is the one transition the sender is actually waiting for, and
 * failed earns danger because it is the one that needs acting on.
 */
export type DeliveryTone = 'subtle' | 'muted' | 'accent' | 'danger';

const DELIVERY_TONE: Record<DeliveryStatus, DeliveryTone> = {
  sending: 'subtle',
  sent: 'muted',
  delivered: 'muted',
  read: 'accent',
  failed: 'danger',
};

export function deliveryTone(status: DeliveryStatus): DeliveryTone {
  return DELIVERY_TONE[status];
}

/**
 * Folds an incoming status into the one already on screen, so the ticks only
 * ever move forward.
 *
 * Acknowledgements race. A `sent` ack routinely lands after the `read` receipt
 * it logically precedes (two different servers, two different sockets, one
 * unlucky retry), and applying it blind walks the ticks backwards in front of
 * the sender — which reads as the message being un-read. `deliveryRank` already
 * orders the states, so the fix is a maximum rather than a special case at every
 * call site.
 *
 * Failure is the exception in both directions: a `failed` event always applies
 * however far along the display was, because it is the only state that asks for
 * an action, and any later event always clears it, because that is what a
 * successful retry looks like.
 */
export function advanceDelivery(
  current: DeliveryStatus | undefined,
  incoming: DeliveryStatus,
): DeliveryStatus {
  if (current === undefined) return incoming;
  if (incoming === 'failed' || current === 'failed') return incoming;
  return deliveryRank(incoming) > deliveryRank(current) ? incoming : current;
}

/** The text alternative for each delivery state; every tick has to say its name. */
export interface DeliveryLabels {
  sending: string;
  sent: string;
  delivered: string;
  read: string;
  failed: string;
}

/**
 * English fallbacks, so a binding without a catalog is still legible to a screen
 * reader. Both kits merge a caller's `labels` over these.
 */
export const deliveryLabels: DeliveryLabels = {
  sending: 'Sending',
  sent: 'Sent',
  delivered: 'Delivered',
  read: 'Read',
  failed: 'Not sent',
};

export function deliveryLabel(status: DeliveryStatus, labels?: Partial<DeliveryLabels>): string {
  return labels?.[status] ?? deliveryLabels[status];
}
