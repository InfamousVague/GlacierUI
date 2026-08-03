/**
 * Conversation-view logic - the two axes a rendered thread has to keep apart,
 * plus the handful of numbers a scrolling transcript needs on both platforms.
 *
 * `chat.ts` owns what a transcript IS (where runs break, how a stack's status
 * collapses, how a moment is spelled) and `message.ts` owns how wide and how
 * round one message is. Neither of them knows who is reading. That is the gap
 * this module fills, and it is exactly one question asked twice:
 *
 * 1. **Authorship** - local or remote. Whose side of the conversation this run
 *    came from. Decided by comparing ids, and nothing else.
 * 2. **Acknowledgement** - optimistic or confirmed. Whether the server has the
 *    message yet. Decided by the delivery status, and nothing else.
 *
 * They are independent, and the reason to say so out loud is that they are
 * constantly conflated: "mine" gets drawn as "sent", and a received message
 * ends up wearing a tick. It cannot mean anything. A tick reports what *our*
 * server told *us* about *our* outbox; about a message someone else sent, we
 * know only that it arrived. So the resolver below does not merely decline to
 * render a remote status - it strips one when the caller's data carries it,
 * because a transport that helpfully stamps every row `delivered` is a real
 * thing and a remote bubble wearing a tick is a lie the reader cannot detect.
 *
 * The other direction is the same rule read forwards: a local message ALWAYS
 * has a delivery state, so one is filled in when the caller has not modelled
 * optimistic sends at all. See `CONVERSATION_ASSUMED_STATUS` for why the
 * fallback is `sent` rather than `sending`.
 *
 * Nothing here is added to `chat.ts` or `message.ts`: both are consumed by the
 * message molecules on their own, and neither should learn about a viewer.
 */

import {
  groupMessages,
  leastDelivery,
  type ChatMessage,
  type DeliveryStatus,
  type MessageGroup,
  type Millis,
} from './chat.ts';

// ---- axis 1: authorship -----------------------------------------------------

/**
 * Whose side of the conversation a message came from.
 *
 * `local`/`remote` rather than `own`/`other` because this is about which client
 * produced the message, which is what decides whether a delivery state exists
 * at all. The message molecules speak `own` - that is a *presentation* fact,
 * the edge a bubble hugs - and `conversationOwn` is the one-line bridge.
 */
export type MessageAuthorship = 'local' | 'remote';

/** Which side produced a message. The only input is a pair of ids. */
export function messageAuthorship(authorId: string, viewerId: string): MessageAuthorship {
  return authorId === viewerId ? 'local' : 'remote';
}

/** The presentation flag the message molecules take. */
export function conversationOwn(authorship: MessageAuthorship): boolean {
  return authorship === 'local';
}

// ---- axis 2: acknowledgement ------------------------------------------------

/**
 * Where a local message sits on its way to the server.
 *
 * Two of these are the axis proper and the third is its dead end:
 *
 * - `optimistic` - on screen because the client put it there. Nothing has come
 *   back yet. The client is asserting the send, not reporting it.
 * - `confirmed` - the server has it, and everything after that (their device
 *   has it, they read it) is further along the same road.
 * - `failed` - unacknowledged, like `optimistic`, but no longer waiting.
 *
 * `failed` gets its own name rather than folding into `optimistic` because the
 * two want opposite treatment. An optimistic message should be *quieter* than a
 * settled one: it is provisional, and de-emphasis is the honest way to say so
 * without implying anything is wrong. A failed one is the single row in a
 * transcript that asks the reader to act, so quieting it is the exact wrong
 * move. Folding them together is how "still sending" and "never sent" end up
 * looking alike, which is the one confusion a delivery indicator exists to
 * prevent.
 */
export type MessageAck = 'optimistic' | 'confirmed' | 'failed';

const ACK: Record<DeliveryStatus, MessageAck> = {
  sending: 'optimistic',
  sent: 'confirmed',
  delivered: 'confirmed',
  read: 'confirmed',
  failed: 'failed',
};

/** Which side of the acknowledgement axis a delivery status sits on. */
export function messageAck(status: DeliveryStatus): MessageAck {
  return ACK[status];
}

/**
 * Whether a run should be drawn provisionally - visibly lighter than a settled
 * one, because the client is asserting it rather than reporting it.
 *
 * Only `optimistic`, deliberately. This is the whole restraint budget for the
 * second axis: a spinner per message would turn an ordinary conversation into a
 * loading screen, and every send is optimistic for a moment.
 */
export function isProvisional(ack: MessageAck | undefined): boolean {
  return ack === 'optimistic';
}

/**
 * The status assumed for a local message that arrived without one.
 *
 * `sent`, not `sending`. A caller who never sets `status` is not modelling
 * optimistic sends at all - their transcript is history the server already
 * has - and defaulting to `sending` would paint every message they ever
 * rendered as permanently in flight, a spinner-shaped state that nothing will
 * ever resolve. `sent` is the weakest claim that is true for such a caller: the
 * server has it, and nothing is asserted about the other end.
 */
export const CONVERSATION_ASSUMED_STATUS: DeliveryStatus = 'sent';

// ---- the two axes together --------------------------------------------------

/** One author's run, with both axes resolved against the reading viewer. */
export interface ConversationRun<M extends ChatMessage = ChatMessage> {
  /** Render key. The run's id, which is its first message's id. */
  key: string;
  /**
   * The run, with delivery normalised: remote runs carry no status anywhere,
   * local runs carry one on every message.
   */
  group: MessageGroup<M>;
  authorship: MessageAuthorship;
  /** `authorship === 'local'`, precomputed because every renderer wants it. */
  own: boolean;
  /**
   * The run's delivery state, least-advanced-first per `leastDelivery`.
   * **Undefined on a remote run, always** - that is the invariant.
   */
  status?: DeliveryStatus;
  /** Which side of the acknowledgement axis. Undefined exactly when `status` is. */
  ack?: MessageAck;
  /** `ack === 'optimistic'`; the flag a binding de-emphasises on. */
  provisional: boolean;
}

export interface ConversationRunsOptions {
  /** Pause after which a new run begins; forwarded to `groupMessages`. */
  windowMs?: number;
  /**
   * Set false to resolve every run with no delivery state at all.
   *
   * For the skeleton, which renders local and remote runs to hold the real
   * geometry but must not claim a delivery state it does not have - a
   * placeholder reading "Read" is a lie with a tick next to it.
   */
  delivery?: boolean;
}

/** Rewrites a run's messages so their statuses match what the axis permits. */
function normalise<M extends ChatMessage>(
  group: MessageGroup<M>,
  local: boolean,
  delivery: boolean,
): MessageGroup<M> {
  const messages = group.messages.map((message) => {
    const status = !delivery || !local ? undefined : message.status ?? CONVERSATION_ASSUMED_STATUS;
    // Identity is preserved where nothing changed, so a confirmed remote
    // transcript re-renders without allocating a second copy of itself.
    return status === message.status ? message : ({ ...message, status } as M);
  });
  const status = leastDelivery(messages.map((m) => m.status));
  return status === group.status && messages.every((m, i) => m === group.messages[i])
    ? group
    : { ...group, messages, status };
}

/**
 * The whole component contract in one function: a flat log plus the reader's id
 * becomes a list of runs that already know which side they are on and what, if
 * anything, they are allowed to say about delivery.
 *
 * The caller passes a `viewerId` rather than pre-tagging each message, because
 * ownership is not a property of a message - the same message is "mine" in one
 * window and "theirs" in another, and asking every caller to fan a viewer out
 * over a thousand rows is how a transcript ends up with two sources of truth
 * for who is talking.
 *
 * Grouping is `groupMessages` verbatim; nothing here re-derives a run.
 */
export function conversationRuns<M extends ChatMessage>(
  messages: M[],
  viewerId: string,
  options: ConversationRunsOptions = {},
): ConversationRun<M>[] {
  const { windowMs, delivery = true } = options;
  return groupMessages(messages, windowMs === undefined ? {} : { windowMs }).map((group) => {
    const authorship = messageAuthorship(group.authorId, viewerId);
    const local = authorship === 'local';
    const normalised = normalise(group, local, delivery);
    const status = normalised.status;
    const ack = status === undefined ? undefined : messageAck(status);
    return {
      key: normalised.id,
      group: normalised,
      authorship,
      own: local,
      status,
      ack,
      provisional: isProvisional(ack),
    };
  });
}

// ---- scrolling --------------------------------------------------------------

/** A scroller's position, in the same three numbers every platform reports. */
export interface ConversationScroll {
  /** How far it has been scrolled from the top. */
  offset: number;
  /** The visible height. */
  viewport: number;
  /** The full scrollable height. */
  content: number;
}

/**
 * How close to the bottom still counts as being at the bottom.
 *
 * Not zero, for two reasons that both bite. Sub-pixel layout means a scroller
 * pinned to its end frequently reports an offset a fraction short of the exact
 * maximum, so an equality test would decide the reader had scrolled up when
 * they had not moved at all. And a reader a couple of lines from the end is,
 * behaviourally, still reading the live tail. A generous slop keeps the thread
 * following them; a tight one drops them off it for a stray trackpad twitch.
 */
export const CONVERSATION_STICK_SLOP = 32;

/**
 * Whether the reader is parked at the live end of the thread.
 *
 * This is the entire stick-to-bottom policy, and keeping it this small is
 * deliberate. A transcript that scrolls itself is only ever correct in one
 * case - the reader was already at the bottom when something arrived - and
 * every other case is the viewport being yanked out from under somebody. The
 * heavier machinery (anchoring to a specific row, preserving the offset while
 * older pages prepend) belongs to a virtualised list, not to this.
 *
 * Degenerate metrics settle at `true`: a scroller that has not been measured
 * yet is empty, and an empty thread should start at its end.
 */
export function atBottom(scroll: ConversationScroll, slop = CONVERSATION_STICK_SLOP): boolean {
  const { offset, viewport, content } = scroll;
  if (![offset, viewport, content].every(Number.isFinite)) return true;
  return content - viewport - offset <= Math.max(0, slop);
}

// ---- skeleton ---------------------------------------------------------------

/**
 * The viewer the placeholder transcript is drawn for. Any value works; it only
 * has to differ from the peer id so the runs alternate sides.
 */
export const CONVERSATION_SKELETON_VIEWER = 'glacier-skeleton-viewer';

const SKELETON_PEER = 'glacier-skeleton-peer';

/** One placeholder run: which side it sits on and how many bubbles it stacks. */
export interface ConversationSkeletonRun {
  own: boolean;
  length: number;
}

/**
 * The shape of the placeholder thread.
 *
 * A transcript's geometry is not its text - it is the zig-zag of runs down
 * alternating edges, and the fact that some runs are one bubble and some are
 * three. So the placeholder is a real conversation shape rather than a column
 * of identical bars: it opens on a remote run (the common case, since you open
 * a thread to read what someone said), answers, and varies the run lengths, so
 * both edges and both stacking behaviours are represented before any data
 * lands.
 */
export const conversationSkeletonRuns: readonly ConversationSkeletonRun[] = [
  { own: false, length: 2 },
  { own: true, length: 1 },
  { own: false, length: 1 },
  { own: true, length: 2 },
];

/**
 * The placeholder thread as ordinary messages, to be fed through
 * `conversationRuns` exactly like real ones.
 *
 * Synthesising *messages* rather than pre-built groups is the point: the
 * placeholder then travels the identical grouping, side, corner, and gap path
 * the loaded transcript will, so it cannot settle into a different layout than
 * the one it was holding. `at` is spaced a second apart so every run stays
 * inside the grouping window and breaks only where the author changes.
 */
export function conversationSkeletonMessages(now: Millis = 0): ChatMessage[] {
  const messages: ChatMessage[] = [];
  let at = now;
  conversationSkeletonRuns.forEach((run, index) => {
    for (let i = 0; i < run.length; i += 1) {
      messages.push({
        id: `glacier-skeleton-${index}-${i}`,
        authorId: run.own ? CONVERSATION_SKELETON_VIEWER : SKELETON_PEER,
        at,
        text: '',
      });
      at += 1000;
    }
  });
  return messages;
}
