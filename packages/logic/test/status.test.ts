import { describe, expect, it } from 'vitest';
import { deliveryStatuses, type DeliveryStatus } from '../src/chat.ts';
import {
  CONNECTION_RECONNECTED_MS,
  QUOTED_SNIPPET_MAX,
  TYPING_DOTS,
  advanceDelivery,
  connectionAutoDismisses,
  connectionGlyph,
  connectionLabel,
  connectionTone,
  connectionUrgency,
  connectionVisible,
  deliveryGlyph,
  deliveryLabel,
  deliveryTone,
  nextConnection,
  quotedSnippet,
  systemMessageGlyph,
  threadReplyForm,
  typingDotDelays,
  type ConnectionState,
} from '../src/status.ts';

describe('delivery glyphs', () => {
  it('gives every status its own silhouette', () => {
    // The whole point of the table: a red failed tick and a blue read tick must
    // differ in SHAPE, not only in hue.
    const shapes = deliveryStatuses.map(deliveryGlyph);
    expect(new Set(shapes).size).toBe(deliveryStatuses.length);
  });

  it('draws failure as something that is not a tick', () => {
    expect(deliveryGlyph('failed')).toBe('alert');
    expect(deliveryGlyph('read')).not.toBe(deliveryGlyph('delivered'));
  });

  it('spends colour only where it is worth spending', () => {
    expect(deliveryTone('sending')).toBe('subtle');
    expect(deliveryTone('sent')).toBe('muted');
    expect(deliveryTone('delivered')).toBe('muted');
    expect(deliveryTone('read')).toBe('accent');
    expect(deliveryTone('failed')).toBe('danger');
  });

  it('names every status, and takes an override', () => {
    for (const status of deliveryStatuses) expect(deliveryLabel(status)).not.toBe('');
    expect(deliveryLabel('read', { read: 'Lu' })).toBe('Lu');
  });
});

describe('advanceDelivery', () => {
  it('takes the first status it is given', () => {
    expect(advanceDelivery(undefined, 'sent')).toBe('sent');
  });

  it('never walks the ticks backwards when an ack arrives late', () => {
    // A `sent` ack landing after the `read` receipt it logically precedes is
    // routine; applying it blind would un-read the message on screen.
    expect(advanceDelivery('read', 'sent')).toBe('read');
    expect(advanceDelivery('delivered', 'sending')).toBe('delivered');
  });

  it('moves forward when the incoming status is further along', () => {
    expect(advanceDelivery('sent', 'delivered')).toBe('delivered');
    expect(advanceDelivery('delivered', 'read')).toBe('read');
  });

  it('lets failure through in both directions', () => {
    // It applies however far along the display was...
    expect(advanceDelivery('read', 'failed')).toBe('failed');
    // ...and any later event clears it, which is what a retry looks like.
    expect(advanceDelivery('failed', 'sending')).toBe('sending');
  });
});

describe('quotedSnippet', () => {
  it('caps a quote shorter than a conversation row', () => {
    expect(QUOTED_SNIPPET_MAX).toBeLessThan(120);
  });

  it('collapses newlines and cuts on a word boundary', () => {
    const text = `${'word '.repeat(40)}end`;
    const snippet = quotedSnippet(text);
    expect(snippet).not.toContain('\n');
    expect(snippet.length).toBeLessThanOrEqual(QUOTED_SNIPPET_MAX + 1);
    expect(snippet.endsWith('…')).toBe(true);
    expect(snippet).not.toMatch(/wor…$/);
  });

  it('leaves a short quote alone', () => {
    expect(quotedSnippet('on my way')).toBe('on my way');
    expect(quotedSnippet(undefined)).toBe('');
  });
});

describe('system message glyphs', () => {
  it('gives each kind its own mark', () => {
    const kinds = ['info', 'join', 'leave', 'topic', 'call'] as const;
    expect(new Set(kinds.map(systemMessageGlyph)).size).toBe(kinds.length);
  });
});

describe('typing dots', () => {
  it('staggers each dot by whole motion steps', () => {
    expect(typingDotDelays()).toEqual([0, 1, 2]);
    expect(typingDotDelays()).toHaveLength(TYPING_DOTS);
  });
});

describe('thread reply form', () => {
  it('picks the singular only for exactly one', () => {
    expect(threadReplyForm(1)).toBe('one');
    expect(threadReplyForm(0)).toBe('other');
    expect(threadReplyForm(2)).toBe('other');
  });
});

describe('connection state machine', () => {
  it('drops to offline from anywhere', () => {
    const states: ConnectionState[] = ['online', 'offline', 'reconnecting', 'reconnected'];
    for (const state of states) expect(nextConnection(state, 'lost')).toBe('offline');
  });

  it('never flashes a confirmation for a drop that did not happen', () => {
    // A transport fires `restored` on its very first successful open.
    expect(nextConnection('online', 'restored')).toBe('online');
    expect(nextConnection('online', 'retry')).toBe('online');
  });

  it('confirms only when it comes back from a broken state', () => {
    expect(nextConnection('offline', 'restored')).toBe('reconnected');
    expect(nextConnection('reconnecting', 'restored')).toBe('reconnected');
  });

  it('runs the whole loop and settles back to online', () => {
    let state: ConnectionState = 'online';
    state = nextConnection(state, 'lost');
    expect(state).toBe('offline');
    state = nextConnection(state, 'retry');
    expect(state).toBe('reconnecting');
    state = nextConnection(state, 'restored');
    expect(state).toBe('reconnected');
    state = nextConnection(state, 'settle');
    expect(state).toBe('online');
  });

  it('ignores a settle that is not waiting on one', () => {
    expect(nextConnection('offline', 'settle')).toBe('offline');
  });

  it('shows a banner for everything except a healthy connection', () => {
    expect(connectionVisible('online')).toBe(false);
    expect(connectionVisible('offline')).toBe(true);
    expect(connectionVisible('reconnecting')).toBe(true);
    expect(connectionVisible('reconnected')).toBe(true);
  });

  it('auto-dismisses only the confirmation', () => {
    expect(connectionAutoDismisses('reconnected')).toBe(true);
    expect(connectionAutoDismisses('offline')).toBe(false);
    expect(CONNECTION_RECONNECTED_MS).toBeGreaterThan(1000);
  });

  it('interrupts only for offline', () => {
    expect(connectionUrgency('offline')).toBe('assertive');
    expect(connectionUrgency('reconnecting')).toBe('polite');
    expect(connectionUrgency('reconnected')).toBe('polite');
  });

  it('paints and draws each state differently', () => {
    expect(connectionTone('offline')).toBe('danger');
    expect(connectionTone('reconnecting')).toBe('warning');
    expect(connectionTone('reconnected')).toBe('success');
    const glyphs = (['offline', 'reconnecting', 'reconnected'] as const).map(connectionGlyph);
    expect(new Set(glyphs).size).toBe(3);
  });

  it('says nothing when there is nothing to say', () => {
    expect(connectionLabel('online')).toBe('');
    expect(connectionLabel('offline')).not.toBe('');
    expect(connectionLabel('offline', { offline: 'Sin conexión' })).toBe('Sin conexión');
  });
});

describe('delivery rank is what advanceDelivery leans on', () => {
  it('resolves every status to a glyph without a gap', () => {
    // A missing entry would render nothing at all rather than failing loudly,
    // so the table is checked exhaustively.
    for (const status of deliveryStatuses satisfies readonly DeliveryStatus[]) {
      expect(deliveryGlyph(status)).toBeTypeOf('string');
      expect(deliveryTone(status)).toBeTypeOf('string');
    }
  });
});
