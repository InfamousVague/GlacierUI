import { describe, expect, it } from 'vitest';
import { deliveryStatuses, type DeliveryStatus } from '../src/chat.ts';
import {
  advanceDelivery,
  deliveryGlyph,
  deliveryLabel,
  deliveryTone,
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
