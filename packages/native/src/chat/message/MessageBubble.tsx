// The Glacier MessageBubble, rendered with React Native primitives: one message,
// as either an edge-aligned tinted capsule or a full-width row. Every decision
// that shapes it - which edge authorship takes, which corner radius each slot in
// a run gets, whether this message wears the tail, and the tail's own path -
// comes from @glacier/logic, the same functions the DOM kit calls, so a run
// cannot break differently on a phone than it does in a browser.

import type { ReactNode } from 'react';
import { View, Text as RNText } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { type BubblePosition, type DeliveryStatus, type Millis } from '@glacier/logic';
import {
  BUBBLE_MAX_WIDTH,
  bubbleCorners,
  messageMetrics,
  messageSide,
  messageTail,
  tailScaleX,
  type MessageLabels,
  type MessageLayout,
  type MessageSide,
} from '@glacier/logic';
import {
  messageBubbleSpec,
  // TODO(integration): switch to '@glacier/spec' once message-bubble.ts is
  // re-exported from packages/spec/src/index.ts.
} from '../../../../spec/src/components/message-bubble.ts';
import { textSpec } from '@glacier/spec';
import { t } from '../../tokens.ts';
import { paintFor, sizeFor } from '../../resolve.ts';
import { Skeleton } from '../../atoms/feedback/Skeleton.tsx';
import { MessageMeta } from './MessageMeta.tsx';

export type { MessageLayout, MessageSide, MessageLabels };

export interface MessageBubbleProps {
  /** Bubble draws a tinted, edge-aligned capsule; row draws full-width prose. */
  layout?: MessageLayout;
  /** The viewer sent it. */
  own?: boolean;
  /** Where it sits in its author's run; drives the corner geometry. */
  position?: BubblePosition;
  /** Draws the tail. Only meaningful on the message that ends a run. */
  tail?: boolean;
  /** Overrides the edge authorship would choose. Logical, never physical. */
  side?: MessageSide;
  /**
   * The page runs right to left.
   *
   * Everything else here is expressed logically and flips by itself, but an SVG
   * path has no writing direction, so the tail's mirror has to be a value. The
   * DOM binding gets this from a `:dir(rtl)` rule; a device build wires it to
   * `I18nManager.isRTL`, which is why it is a prop rather than a global read -
   * the docs render both directions on one page.
   */
  rtl?: boolean;
  /** Rendered in the leading gutter. */
  avatar?: ReactNode;
  /** Reserves the gutter without filling it, so continuation lines stay aligned. */
  gutter?: boolean;
  /** The name and time line above the body, in row layout. */
  header?: ReactNode;
  at?: Millis;
  now?: Millis;
  locale?: string;
  /** How far along the send is; omitted for anything received. */
  status?: DeliveryStatus;
  edited?: boolean;
  /** Replaces the default timestamp and status line entirely. */
  meta?: ReactNode;
  /** Slot under the body for the reaction bar. */
  reactions?: ReactNode;
  /** Slot above the text for images, files, and media. */
  attachments?: ReactNode;
  /** Slot above the body for a quoted preview. */
  replyTo?: ReactNode;
  labels?: Partial<MessageLabels>;
  skeleton?: boolean;
  children?: ReactNode;
}

/**
 * One message, in either of the two chat layouts.
 *
 * The corner geometry is the part worth understanding. A run of messages has to
 * read as one utterance, and it only does if the corners facing a neighbour
 * tighten while the corners facing open space stay round - the stacked edge
 * behaves like one tall shape that has been sliced, and the free edge keeps the
 * silhouette that says which side of the conversation it came from. That is
 * `bubbleCorners`, and both bindings ask it rather than deciding for themselves.
 */
export function MessageBubble({
  layout = 'bubble',
  own = false,
  position = 'only',
  tail = false,
  side,
  rtl = false,
  avatar,
  gutter,
  header,
  at,
  now,
  locale,
  status,
  edited = false,
  meta,
  reactions,
  attachments,
  replyTo,
  labels,
  skeleton = false,
  children,
}: MessageBubbleProps) {
  const metrics = messageMetrics(layout);
  // A row transcript is one column, so authorship moves nothing.
  const resolvedSide: MessageSide = side ?? (layout === 'row' ? 'start' : messageSide(own));
  const isBubble = layout === 'bubble';
  const showTail = isBubble && tail;
  const corners = bubbleCorners(position, resolvedSide, showTail);
  const showGutter = gutter ?? (layout === 'row' || avatar != null);

  // Paint comes out of the spec through the shared resolver, never typed in
  // here: that is exactly how the native Button's font once drifted from the
  // web kit's.
  const rest = paintFor(messageBubbleSpec, 'states', 'default');
  const mine = paintFor(messageBubbleSpec, 'states', 'own');
  const failed = paintFor(messageBubbleSpec, 'states', 'failed');
  const fill = t(own ? (mine.background ?? 'accent-solid') : (rest.background ?? 'surface-raised'));
  const bodyDims = sizeFor(textSpec, 'sm');

  const bubbleStyle = {
    position: 'relative',
    minWidth: 0,
    gap: t('space-1'),
    borderStartStartRadius: t(corners.startStart),
    borderStartEndRadius: t(corners.startEnd),
    borderEndStartRadius: t(corners.endStart),
    borderEndEndRadius: t(corners.endEnd),
    ...(isBubble
      ? {
          // The remaining quarter of the column is what keeps alignment
          // readable; a bubble that could reach the far edge would stop
          // distinguishing its author.
          maxWidth: BUBBLE_MAX_WIDTH,
          backgroundColor: fill,
          paddingHorizontal: t(metrics.paddingInline),
          paddingVertical: t(metrics.paddingBlock),
        }
      : { width: '100%' }),
    // A failed send keeps its fill and takes a border, so it is findable by
    // scanning without the transcript turning red.
    ...(status === 'failed'
      ? { borderWidth: t('hairline'), borderColor: t(failed.border ?? 'danger-border'), borderStyle: 'solid' }
      : null),
  };

  const hasMeta = meta !== undefined || at !== undefined || status !== undefined || edited;

  return (
    <View style={{ flexDirection: 'row', gap: t(metrics.gutterGap), minWidth: 0 }}>
      {showGutter && (
        <View
          style={{
            width: t(metrics.gutter),
            flexGrow: 0,
            flexShrink: 0,
            // A bubble transcript's avatar belongs beside the message the tail
            // points out of; a row transcript's heads the run.
            justifyContent: isBubble ? 'flex-end' : 'flex-start',
            alignItems: 'center',
          }}
        >
          {avatar}
        </View>
      )}
      <View
        style={{
          flex: 1,
          minWidth: 0,
          gap: t(metrics.lineGap),
          alignItems: isBubble && resolvedSide === 'end' ? 'flex-end' : 'flex-start',
        }}
      >
        {header != null && (
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: t('space-2'), minWidth: 0 }}>
            {header}
          </View>
        )}
        <View style={bubbleStyle}>
          {replyTo}
          {attachments}
          {skeleton ? (
            // A width, because a bone has none of its own: the web passes 18ch
            // and native was passing nothing, so the bone collapsed and took
            // the bubble down with it — a message-shaped placeholder rendered
            // as a sliver. Roughly the same 18 characters at this text size.
            <Skeleton variant="text" width={144} />
          ) : (
            children != null && (
              // React Native inherits no colour across a View, so the body has
              // to state its own - which is why it is a bare RN Text with the
              // text spec's metrics rather than the kit's Text atom, whose tone
              // list has no accent-contrast in it.
              <RNText
                style={{
                  color: t(own ? (mine.text ?? 'accent-contrast') : (rest.text ?? 'text')),
                  fontSize: t(bodyDims.fontSize ?? metrics.fontSize),
                  lineHeight: t('leading-sm'),
                  fontFamily: t('font-sans'),
                }}
              >
                {children}
              </RNText>
            )
          )}
          {hasMeta && (
            <View style={{ alignSelf: resolvedSide === 'end' ? 'flex-end' : 'flex-start' }}>
              {meta ?? (
                <MessageMeta
                  at={at}
                  now={now}
                  locale={locale}
                  status={status}
                  edited={edited}
                  own={own && isBubble}
                  labels={labels}
                />
              )}
            </View>
          )}
          {/* The same path the DOM kit draws, from the same constants. An SVG
              rather than a pseudo-element precisely because this binding has no
              pseudo-elements - solving it here first is what keeps one tail
              instead of two. */}
          {showTail && (
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                ...(resolvedSide === 'end'
                  ? { insetInlineEnd: -messageTail.width }
                  : { insetInlineStart: -messageTail.width }),
                transform: [{ scaleX: tailScaleX(resolvedSide, rtl) }],
              }}
            >
              <Svg width={messageTail.width} height={messageTail.height} viewBox={`0 0 ${messageTail.width} ${messageTail.height}`}>
                <Path d={messageTail.path} fill={fill} />
              </Svg>
            </View>
          )}
        </View>
        {reactions}
      </View>
    </View>
  );
}
