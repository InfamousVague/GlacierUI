import { describe, expect, it } from 'vitest';
import {
  BUBBLE_MAX_WIDTH,
  bubbleCorners,
  bubbleHasTail,
  defaultMessageLabels,
  messageMetrics,
  messageSide,
  messageTail,
  tailScaleX,
} from '../src/message.ts';
import { bubblePosition, deliveryStatuses, groupMessages, type BubblePosition } from '../src/chat.ts';
import { deliveryLabels } from '../src/status.ts';
import { messageDeliveryStatuses } from '../../spec/src/components/message-bubble.ts';

const POSITIONS: BubblePosition[] = ['only', 'first', 'middle', 'last'];

describe('messageSide', () => {
  it('puts the viewer on the trailing edge and everyone else on the leading one', () => {
    expect(messageSide(true)).toBe('end');
    expect(messageSide(false)).toBe('start');
  });
});

describe('bubbleCorners', () => {
  it('rounds every corner of a bubble that stands alone', () => {
    expect(bubbleCorners('only', 'end')).toEqual({
      startStart: 'radius-xl',
      startEnd: 'radius-xl',
      endStart: 'radius-xl',
      endEnd: 'radius-xl',
    });
  });

  it('only ever cuts the edge the run hugs', () => {
    // The free edge is what gives a stack its silhouette, so it stays round the
    // whole way down no matter where in the run a message sits.
    for (const position of POSITIONS) {
      expect(bubbleCorners(position, 'end').startStart).toBe('radius-xl');
      expect(bubbleCorners(position, 'end').endStart).toBe('radius-xl');
      expect(bubbleCorners(position, 'start').startEnd).toBe('radius-xl');
      expect(bubbleCorners(position, 'start').endEnd).toBe('radius-xl');
    }
  });

  it('cuts the corner facing each neighbour so a run reads as one sliced shape', () => {
    const first = bubbleCorners('first', 'end');
    const middle = bubbleCorners('middle', 'end');
    const last = bubbleCorners('last', 'end');
    // first has a neighbour below, so only its bottom outer corner is cut
    expect([first.startEnd, first.endEnd]).toEqual(['radius-xl', 'radius-xs']);
    // middle has one on both sides
    expect([middle.startEnd, middle.endEnd]).toEqual(['radius-xs', 'radius-xs']);
    // last has one above
    expect([last.startEnd, last.endEnd]).toEqual(['radius-xs', 'radius-xl']);
  });

  it('mirrors the geometry onto the leading edge for a received run', () => {
    const mine = bubbleCorners('middle', 'end');
    const theirs = bubbleCorners('middle', 'start');
    expect(theirs.startStart).toBe(mine.startEnd);
    expect(theirs.endStart).toBe(mine.endEnd);
    expect(theirs.startEnd).toBe(mine.startStart);
  });

  it('squares the corner a tail grows out of, so the join shows no seam', () => {
    expect(bubbleCorners('only', 'end', true).endEnd).toBe('radius-none');
    expect(bubbleCorners('last', 'start', true).endStart).toBe('radius-none');
    // and nothing else moves
    expect(bubbleCorners('only', 'end', true).startEnd).toBe('radius-xl');
  });

  it('reads its position straight from bubblePosition, for every slot in a run', () => {
    const shapes = [0, 1, 2, 3].map((index) => bubbleCorners(bubblePosition(index, 4), 'end'));
    // four distinct slots produce three distinct outer profiles: cut below, cut
    // both, cut both, cut above
    expect(shapes.map((s) => `${s.startEnd}/${s.endEnd}`)).toEqual([
      'radius-xl/radius-xs',
      'radius-xs/radius-xs',
      'radius-xs/radius-xs',
      'radius-xs/radius-xl',
    ]);
  });
});

describe('bubbleHasTail', () => {
  it('gives the run exactly one tail, on the message that ends it', () => {
    expect(POSITIONS.filter((position) => bubbleHasTail(position, true))).toEqual(['only', 'last']);
  });

  it('draws none at all when the transcript has turned tails off', () => {
    expect(POSITIONS.some((position) => bubbleHasTail(position, false))).toBe(false);
  });
});

describe('messageTail', () => {
  it('is a path both bindings can draw, sized to its own box', () => {
    expect(messageTail.path.startsWith('M')).toBe(true);
    expect(messageTail.path.endsWith('Z')).toBe(true);
    expect(messageTail.width).toBeGreaterThan(0);
    expect(messageTail.height).toBeGreaterThan(0);
  });

  it('points away from the transcript, flipping with the side and the direction', () => {
    // authored pointing right, so a trailing bubble in a left-to-right page
    // needs no transform at all
    expect(tailScaleX('end')).toBe(1);
    expect(tailScaleX('start')).toBe(-1);
    // ...and a right-to-left page mirrors both, because the whole transcript did
    expect(tailScaleX('end', true)).toBe(-1);
    expect(tailScaleX('start', true)).toBe(1);
  });
});

describe('messageMetrics', () => {
  it('reserves a gutter exactly as wide as the avatar each layout draws', () => {
    // Row's avatar is a step larger, because with no fill and no alignment it is
    // the only thing marking where an author's block starts.
    expect(messageMetrics('bubble').avatarSize).toBe('sm');
    expect(messageMetrics('row').avatarSize).toBe('md');
    expect(messageMetrics('bubble').gutter).toBe('size-xl');
    expect(messageMetrics('row').gutter).toBe('size-2xl');
  });

  it('hands back token names, never raw values, so both bindings wrap them their own way', () => {
    const metrics = messageMetrics('bubble');
    for (const value of [metrics.stackGap, metrics.paddingInline, metrics.paddingBlock, metrics.fontSize])
      expect(value).toMatch(/^[a-z][a-z0-9-]*$/);
  });

  it('leaves the far quarter of the column empty, which is what makes alignment readable', () => {
    const share = Number.parseInt(BUBBLE_MAX_WIDTH, 10);
    expect(share).toBeGreaterThan(50);
    expect(share).toBeLessThan(85);
  });

  it('falls back to bubble for an unknown layout rather than rendering nothing', () => {
    expect(messageMetrics('sideways' as never)).toEqual(messageMetrics('bubble'));
  });
});

describe('labels', () => {
  it('names every status, so a glyph is never the only thing said', () => {
    for (const status of deliveryStatuses) expect(defaultMessageLabels[status]).toBeTruthy();
    expect(defaultMessageLabels.edited).toBeTruthy();
  });

  it('takes the delivery words from the delivery table rather than restating them', () => {
    // Two English fallbacks for one state is how a transcript ends up saying
    // "Not sent" beside the glyph and "Not delivered" under it.
    for (const status of deliveryStatuses)
      expect(defaultMessageLabels[status]).toBe(deliveryLabels[status]);
  });
});

describe('the spec mirrors commons', () => {
  it('lists exactly the delivery statuses the log defines', () => {
    // The spec cannot import commons without a package cycle, so the transcribed
    // list is checked here rather than trusted.
    expect([...messageDeliveryStatuses]).toEqual([...deliveryStatuses]);
  });
});

describe('a run drawn end to end', () => {
  it('turns four messages from one author into one continuous shape with one tail', () => {
    const at = Date.UTC(2024, 2, 3, 9, 41);
    const [group] = groupMessages(
      [0, 1, 2, 3].map((i) => ({ id: `m${i}`, authorId: 'me', at: at + i * 1000, text: `line ${i}` })),
    );
    const messages = group?.messages ?? [];
    expect(messages).toHaveLength(4);

    const side = messageSide(true);
    const drawn = messages.map((_, index) => {
      const position = bubblePosition(index, messages.length);
      const tail = bubbleHasTail(position, true);
      return { corners: bubbleCorners(position, side, tail), tail };
    });

    // exactly one tail, at the foot of the run
    expect(drawn.map((d) => d.tail)).toEqual([false, false, false, true]);
    // the outer edge is continuous: every join between two bubbles is cut on
    // both sides of the gap
    for (let i = 0; i < drawn.length - 1; i += 1) {
      expect(drawn[i]?.corners.endEnd).toBe('radius-xs');
      expect(drawn[i + 1]?.corners.startEnd).toBe('radius-xs');
    }
    // and the run opens and closes round, so it still reads as a bubble
    expect(drawn[0]?.corners.startEnd).toBe('radius-xl');
    expect(drawn[3]?.corners.endEnd).toBe('radius-none');
  });
});
