/**
 * The two axes, tested as two axes.
 *
 * Almost every case here is really the same assertion from a different side: a
 * delivery state belongs to the local half of the conversation and to nothing
 * else. The interesting failures are the ones where a caller's data disagrees
 * with that — a synced transcript that stamps every row `delivered`, or a local
 * message with no status at all — because those are the cases where a renderer
 * that merely "does not draw a remote tick by default" quietly draws one.
 */

import { describe, expect, it } from 'vitest';
import {
  CHAT_GROUP_WINDOW_MS,
  deliveryStatuses,
  type ChatMessage,
  type DeliveryStatus,
} from '../src/chat.ts';
import {
  CONVERSATION_ASSUMED_STATUS,
  CONVERSATION_SKELETON_VIEWER,
  CONVERSATION_STICK_SLOP,
  atBottom,
  conversationOwn,
  conversationRuns,
  conversationSkeletonMessages,
  conversationSkeletonRuns,
  isProvisional,
  messageAck,
  messageAuthorship,
} from '../src/conversation-view.ts';
import { auditStrictness, validateSpec } from '@glacier/spec';
import { conversationViewSpec, messageAcks, messageAuthorships } from '../../spec/src/components/conversation-view.ts';

const VIEWER = 'ana';
const AT = new Date(2024, 2, 3, 9, 41).getTime();

const message = (over: Partial<ChatMessage> & Pick<ChatMessage, 'id'>): ChatMessage => ({
  authorId: VIEWER,
  at: AT,
  text: 'hello',
  ...over,
});

const statusesOf = (messages: readonly ChatMessage[]) => messages.map((m) => m.status);

describe('authorship', () => {
  it('is a comparison of ids and nothing else', () => {
    expect(messageAuthorship('ana', VIEWER)).toBe('local');
    expect(messageAuthorship('bo', VIEWER)).toBe('remote');
    expect(conversationOwn('local')).toBe(true);
    expect(conversationOwn('remote')).toBe(false);
  });
});

describe('acknowledgement', () => {
  it('splits the five delivery states into in-flight, settled, and the dead end', () => {
    expect(messageAck('sending')).toBe('optimistic');
    for (const status of ['sent', 'delivered', 'read'] as const)
      expect(messageAck(status)).toBe('confirmed');
    expect(messageAck('failed')).toBe('failed');
  });

  it('marks only an in-flight send provisional, never a failed one', () => {
    // The whole reason `failed` is not folded into `optimistic`: they are both
    // unacknowledged and they want opposite treatment.
    expect(isProvisional('optimistic')).toBe(true);
    expect(isProvisional('failed')).toBe(false);
    expect(isProvisional('confirmed')).toBe(false);
    expect(isProvisional(undefined)).toBe(false);
  });
});

describe('conversationRuns', () => {
  it('resolves authorship from the viewer rather than from a pre-tagged message', () => {
    const runs = conversationRuns(
      [message({ id: 'a' }), message({ id: 'b', authorId: 'bo' })],
      VIEWER,
    );
    expect(runs.map((r) => r.authorship)).toEqual(['local', 'remote']);
    expect(runs.map((r) => r.own)).toEqual([true, false]);
    // and the same log read by the other participant flips entirely
    expect(conversationRuns([message({ id: 'a' }), message({ id: 'b', authorId: 'bo' })], 'bo').map(
      (r) => r.authorship,
    )).toEqual(['remote', 'local']);
  });

  it('STRIPS a delivery state off a remote run, rather than merely not drawing one', () => {
    // A transport that stamps every row it syncs is an ordinary thing; the
    // resulting tick would be a claim about our outbox with nothing behind it.
    const runs = conversationRuns(
      [message({ id: 'a', authorId: 'bo', status: 'read' }), message({ id: 'b', authorId: 'bo', status: 'delivered' })],
      VIEWER,
    );
    expect(runs).toHaveLength(1);
    expect(runs[0]!.status).toBeUndefined();
    expect(runs[0]!.ack).toBeUndefined();
    expect(statusesOf(runs[0]!.group.messages)).toEqual([undefined, undefined]);
  });

  it('gives a local run a delivery state even when the caller modelled none', () => {
    const runs = conversationRuns([message({ id: 'a' })], VIEWER);
    expect(runs[0]!.status).toBe(CONVERSATION_ASSUMED_STATUS);
    expect(runs[0]!.ack).toBe('confirmed');
    // sent, not sending: a caller who never sets a status is rendering history
    // the server already has, and `sending` would never resolve.
    expect(CONVERSATION_ASSUMED_STATUS).toBe('sent');
  });

  it('reports the least advanced status in a run, so one stalled send is not hidden', () => {
    const runs = conversationRuns(
      [
        message({ id: 'a', status: 'read' }),
        message({ id: 'b', at: AT + 1000, status: 'sending' }),
        message({ id: 'c', at: AT + 2000, status: 'read' }),
      ],
      VIEWER,
    );
    expect(runs[0]!.status).toBe('sending');
    expect(runs[0]!.ack).toBe('optimistic');
    expect(runs[0]!.provisional).toBe(true);
  });

  it('never quiets a failed run, which is the one row asking to be acted on', () => {
    const runs = conversationRuns([message({ id: 'a', status: 'failed' })], VIEWER);
    expect(runs[0]!.ack).toBe('failed');
    expect(runs[0]!.provisional).toBe(false);
  });

  it('groups with groupMessages and keys each run by the group it came from', () => {
    const runs = conversationRuns(
      [
        message({ id: 'a' }),
        message({ id: 'b', at: AT + 1000 }),
        message({ id: 'c', at: AT + 1000, authorId: 'bo' }),
      ],
      VIEWER,
    );
    expect(runs.map((r) => r.key)).toEqual(['a', 'c']);
    expect(runs[0]!.group.messages).toHaveLength(2);
  });

  it('forwards the grouping window instead of keeping a second copy of it', () => {
    const log = [message({ id: 'a' }), message({ id: 'b', at: AT + CHAT_GROUP_WINDOW_MS - 1 })];
    expect(conversationRuns(log, VIEWER)).toHaveLength(1);
    expect(conversationRuns(log, VIEWER, { windowMs: 1000 })).toHaveLength(2);
  });

  it('leaves an already-correct run untouched, so a settled transcript does not re-allocate', () => {
    const runs = conversationRuns([message({ id: 'a', authorId: 'bo' })], VIEWER);
    const again = conversationRuns(runs[0]!.group.messages, VIEWER);
    expect(again[0]!.group.messages[0]).toBe(runs[0]!.group.messages[0]);
  });

  it('drops delivery entirely when asked, for a placeholder that has no state to report', () => {
    const runs = conversationRuns([message({ id: 'a', status: 'read' })], VIEWER, { delivery: false });
    expect(runs[0]!.status).toBeUndefined();
    expect(runs[0]!.own).toBe(true);
    expect(statusesOf(runs[0]!.group.messages)).toEqual([undefined]);
  });
});

describe('atBottom', () => {
  const scroll = (offset: number) => ({ offset, viewport: 100, content: 1000 });

  it('is true at the exact end and anywhere inside the slop', () => {
    expect(atBottom(scroll(900))).toBe(true);
    expect(atBottom(scroll(900 - CONVERSATION_STICK_SLOP))).toBe(true);
  });

  it('is false once the reader has genuinely scrolled up', () => {
    expect(atBottom(scroll(900 - CONVERSATION_STICK_SLOP - 1))).toBe(false);
    expect(atBottom(scroll(0))).toBe(false);
  });

  it('settles at true for an unmeasured scroller, which is empty and starts at its end', () => {
    expect(atBottom({ offset: 0, viewport: 0, content: 0 })).toBe(true);
    expect(atBottom({ offset: Number.NaN, viewport: 100, content: 1000 })).toBe(true);
  });

  it("takes a caller's slop, and treats a negative one as zero", () => {
    expect(atBottom(scroll(880), 0)).toBe(false);
    expect(atBottom(scroll(900), -50)).toBe(true);
  });
});

describe('the skeleton thread', () => {
  const runs = conversationRuns(conversationSkeletonMessages(AT), CONVERSATION_SKELETON_VIEWER, {
    delivery: false,
  });

  it('travels the same grouping path, so it holds the geometry it will settle into', () => {
    expect(runs).toHaveLength(conversationSkeletonRuns.length);
    expect(runs.map((r) => r.own)).toEqual(conversationSkeletonRuns.map((r) => r.own));
    expect(runs.map((r) => r.group.messages.length)).toEqual(
      conversationSkeletonRuns.map((r) => r.length),
    );
  });

  it('alternates edges, which is what a transcript actually looks like', () => {
    expect(runs.map((r) => r.authorship)).toEqual(['remote', 'local', 'remote', 'local']);
  });

  it('claims no delivery state anywhere: a bone captioned "Read" is a lie with a tick beside it', () => {
    expect(runs.every((r) => r.status === undefined)).toBe(true);
    expect(runs.flatMap((r) => statusesOf(r.group.messages)).every((s) => s === undefined)).toBe(true);
  });
});

describe('the spec', () => {
  it('is structurally valid and binds its paint completely', () => {
    expect(validateSpec(conversationViewSpec)).toEqual([]);
    const audit = auditStrictness(conversationViewSpec);
    expect(audit.missing).toEqual([]);
    expect(audit.completeness).toBe(1);
  });

  it('keeps its transcribed enums identical to the ones commons derives', () => {
    // The spec cannot import @glacier/logic (logic already depends on it), so
    // the duplication is checked rather than trusted.
    const acks = new Set(deliveryStatuses.map((status: DeliveryStatus) => messageAck(status)));
    expect([...acks].sort()).toEqual([...messageAcks].sort());
    expect([...messageAuthorships].sort()).toEqual(
      [messageAuthorship('a', 'a'), messageAuthorship('a', 'b')].sort(),
    );
  });
});
