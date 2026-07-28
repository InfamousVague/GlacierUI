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
 */

import { useEffect, useRef, useState } from 'react';
import { deliveryRank, type DeliveryStatus } from './chat.ts';
import { truncateSnippet } from './conversation.ts';

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

// ---- quoted message ---------------------------------------------------------

/**
 * How much of a quoted message survives into the reply preview.
 *
 * Shorter than a conversation row's 120 (see `CONVERSATION_SNIPPET_MAX`) for a
 * simple reason: a sidebar row spans the whole sidebar, while a quote block sits
 * *inside* a bubble that is already capped at a fraction of the transcript
 * width. 100 characters is about two lines at that width, which is the most a
 * quote can take before it competes with the reply it is context for.
 */
export const QUOTED_SNIPPET_MAX = 100;

/**
 * How many lines the quote block shows before it clips.
 *
 * Two, matching the character budget rather than fighting it: the cap keeps the
 * *string* identical across bindings, and the line clamp keeps the *box*
 * identical when a caller passes a wider bubble or a narrower font.
 */
export const QUOTED_SNIPPET_LINES = 2;

/**
 * The quoted body as it is shown: one line, whitespace collapsed, cut on a word
 * boundary. Reuses the conversation-row truncation rather than growing a second
 * one, so a message that reads "…let me check and" in the sidebar cannot read
 * "…let me check an" in a quote.
 */
export function quotedSnippet(text: string | undefined, max: number = QUOTED_SNIPPET_MAX): string {
  return truncateSnippet(text, max);
}

// ---- system messages --------------------------------------------------------

/**
 * What a system line is reporting. A closed set: these are the events a chat
 * transcript narrates about itself, and anything outside them is an ordinary
 * message that happens to be from a bot.
 */
export type SystemMessageKind = 'info' | 'join' | 'leave' | 'topic' | 'call';

/** The glyph each kind draws; each binding maps it to its own icon component. */
export type SystemGlyph = 'info' | 'user-plus' | 'user-minus' | 'pencil' | 'phone-off';

const SYSTEM_GLYPH: Record<SystemMessageKind, SystemGlyph> = {
  info: 'info',
  join: 'user-plus',
  leave: 'user-minus',
  topic: 'pencil',
  call: 'phone-off',
};

export function systemMessageGlyph(kind: SystemMessageKind): SystemGlyph {
  return SYSTEM_GLYPH[kind];
}

// ---- typing indicator -------------------------------------------------------

/** How many dots the indicator animates. Three: fewer reads as a glitch, more as a loader. */
export const TYPING_DOTS = 3;

/**
 * The stagger multiplier for each dot, as whole steps of the indicator's stagger
 * token — so a binding writes `calc(<stagger token> * n)` and neither platform
 * hardcodes a millisecond.
 *
 * Integers rather than fractions of the cycle because the wave has to survive a
 * theme that scales its motion tokens: if the stagger and the cycle both come
 * from the scale, the wave keeps its proportions at any speed.
 */
export function typingDotDelays(count: number = TYPING_DOTS): number[] {
  return Array.from({ length: Math.max(0, Math.floor(count)) }, (_, i) => i);
}

/**
 * When the typing row speaks to assistive tech.
 *
 * - `start` (the default) — once, when someone begins typing after a lull.
 * - `always` — every change, including each person joining and leaving.
 * - `never` — silent; the row is visual chrome only.
 *
 * `start` is the default because typing is the noisiest state in a chat app: it
 * flips on and off every few seconds as people pause, and a live region wired
 * straight to it narrates "Ana is typing… Ana is typing… Ana is typing" for the
 * length of a conversation. The one moment the state carries information for a
 * non-visual reader is the rising edge — *someone has started replying* — so
 * that is the only moment it speaks. Stopping is deliberately silent, because
 * emptying a live region announces nothing, and "Ana stopped typing" is an
 * interruption reporting the absence of news.
 */
export type TypingAnnounce = 'start' | 'always' | 'never';

/**
 * The string a typing live region should currently hold — usually empty.
 *
 * Under `start` the sentence captured at the rising edge is HELD for as long as
 * anyone is typing. That is what makes it announce exactly once: a live region
 * fires on change, and a held string does not change when a second typist joins
 * or the names reorder. When typing stops it goes back to empty, which is a
 * change a screen reader does not read out.
 */
export function useTypingAnnouncement(
  text: string,
  active: boolean,
  mode: TypingAnnounce = 'start',
): string {
  const [held, setHeld] = useState('');

  useEffect(() => {
    if (!active) {
      setHeld('');
      return;
    }
    // Only the rising edge is captured; later changes to `text` are ignored so
    // the region does not re-fire mid-conversation.
    setHeld((previous) => (previous === '' ? text : previous));
  }, [active, text]);

  if (mode === 'never') return '';
  if (mode === 'always') return active ? text : '';
  return held;
}

// ---- thread indicator -------------------------------------------------------

/**
 * Which reply-count template applies. Two forms, not full ICU plurals: the kit's
 * catalog interpolates `{count}` and nothing more, and a binding that needs a
 * language with three or six forms passes its own formatted string instead.
 */
export function threadReplyForm(count: number): 'one' | 'other' {
  return Math.abs(count) === 1 ? 'one' : 'other';
}

// ---- connection -------------------------------------------------------------

/**
 * Where the client is between having a connection and not.
 *
 * `reconnected` is a state rather than a flag because it is the only one that
 * ends on a timer: it is the brief confirmation that closes the loop the drop
 * opened. Without it a banner simply vanishes, and a vanishing banner is
 * indistinguishable from a banner the user missed.
 */
export type ConnectionState = 'online' | 'offline' | 'reconnecting' | 'reconnected';

/**
 * What happened.
 *
 * - `lost` — the socket dropped.
 * - `retry` — an attempt to reopen it has started.
 * - `restored` — the socket is open again.
 * - `settle` — the confirmation has been shown long enough; fired by the
 *   auto-dismiss timer, and part of the machine rather than a separate setState
 *   so the whole lifecycle is testable as one pure function.
 */
export type ConnectionEvent = 'lost' | 'retry' | 'restored' | 'settle';

/**
 * The connection state machine.
 *
 * The rule worth spelling out is `online + restored → online`: a client that was
 * never disconnected must not flash "Reconnected". Transports fire `restored`
 * on their very first successful open, and a confirmation for a drop that never
 * happened trains people to ignore the banner that matters. The confirmation is
 * only ever reached FROM a broken state.
 *
 * `retry` from `online` is likewise a no-op rather than a state: a heartbeat
 * probe firing on a healthy connection is not news.
 */
export function nextConnection(state: ConnectionState, event: ConnectionEvent): ConnectionState {
  switch (event) {
    case 'lost':
      return 'offline';
    case 'retry':
      return state === 'online' ? 'online' : 'reconnecting';
    case 'restored':
      return state === 'online' ? 'online' : 'reconnected';
    case 'settle':
      return state === 'reconnected' ? 'online' : state;
  }
}

/**
 * How long the "Reconnected" confirmation stays before it settles back to
 * `online`.
 *
 * Not a motion token: the duration scale tops out at 600ms because it describes
 * transitions, and this is a DWELL — how long a message stays readable, which is
 * a reading-speed question rather than an animation one. Three seconds is about
 * two seconds of reading plus the time it takes to look up at a banner you were
 * not watching for.
 */
export const CONNECTION_RECONNECTED_MS = 3000;

/** Whether the banner should be on screen at all. Healthy connections say nothing. */
export function connectionVisible(state: ConnectionState): boolean {
  return state !== 'online';
}

/** Whether this state ends on its own, rather than waiting for the transport. */
export function connectionAutoDismisses(state: ConnectionState): boolean {
  return state === 'reconnected';
}

/** The banner colour family per state. */
export type ConnectionTone = 'danger' | 'warning' | 'success';

const CONNECTION_TONE: Record<Exclude<ConnectionState, 'online'>, ConnectionTone> = {
  offline: 'danger',
  reconnecting: 'warning',
  reconnected: 'success',
};

/**
 * The tone the banner paints. `online` has no banner, so it borrows the success
 * paint rather than inventing a fourth family — the value is never rendered.
 */
export function connectionTone(state: ConnectionState): ConnectionTone {
  return state === 'online' ? 'success' : CONNECTION_TONE[state];
}

/**
 * How hard the banner interrupts.
 *
 * Only `offline` is assertive, and only because it changes what the user can do:
 * anything typed from here on is not going anywhere. Retrying and recovering are
 * progress reports on a problem already announced, so they wait for a pause —
 * cutting across someone's reading to say "still trying" is worse than silence.
 */
export type ConnectionUrgency = 'assertive' | 'polite';

export function connectionUrgency(state: ConnectionState): ConnectionUrgency {
  return state === 'offline' ? 'assertive' : 'polite';
}

/** The glyph each connection state draws; each binding maps it to its own icon. */
export type ConnectionGlyph = 'wifi-off' | 'refresh' | 'wifi';

const CONNECTION_GLYPH: Record<Exclude<ConnectionState, 'online'>, ConnectionGlyph> = {
  offline: 'wifi-off',
  reconnecting: 'refresh',
  reconnected: 'wifi',
};

export function connectionGlyph(state: ConnectionState): ConnectionGlyph {
  return state === 'online' ? 'wifi' : CONNECTION_GLYPH[state];
}

/** The words each connection state needs; English fallbacks live below. */
export interface ConnectionLabels {
  offline: string;
  reconnecting: string;
  reconnected: string;
  /** The retry action, offered only while offline. */
  retry: string;
}

export const connectionLabels: ConnectionLabels = {
  offline: 'You are offline',
  reconnecting: 'Reconnecting…',
  reconnected: 'Back online',
  retry: 'Try again',
};

export function connectionLabel(
  state: ConnectionState,
  labels?: Partial<ConnectionLabels>,
): string {
  if (state === 'online') return '';
  return labels?.[state] ?? connectionLabels[state];
}

/**
 * Fires `settle` once the confirmation has been up long enough.
 *
 * Lives here rather than in either binding because the timer IS the state
 * machine's last transition: a web banner that clears after 3s and a native one
 * that clears after 5s are two products. `setTimeout` is the one scheduling
 * primitive both platforms share, so this stays renderer-agnostic.
 */
export function useConnectionSettle(
  state: ConnectionState,
  onSettle: () => void,
  delayMs: number = CONNECTION_RECONNECTED_MS,
): void {
  // The callback is held in a ref rather than watched as a dependency: a caller
  // passing an inline arrow would otherwise restart the timer on every render,
  // and a banner whose timer keeps restarting never dismisses at all.
  const settleRef = useRef(onSettle);
  settleRef.current = onSettle;

  useEffect(() => {
    if (!connectionAutoDismisses(state)) return;
    const id = setTimeout(() => settleRef.current(), delayMs);
    return () => clearTimeout(id);
  }, [state, delayMs]);
}
