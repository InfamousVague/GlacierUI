import {
  type BubblePosition,
  type DeliveryStatus,
  type Millis,
} from '@glacier/logic';
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
import type { CSSProperties, ComponentProps, ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import { MessageMeta } from './MessageMeta.tsx';
import styles from './MessageBubble.module.css';

export type { MessageLayout, MessageSide, MessageLabels };

export interface MessageBubbleProps extends Omit<ComponentProps<'div'>, 'content'> {
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
  /** Rendered in the leading gutter. */
  avatar?: ReactNode;
  /**
   * Reserves the gutter without filling it, so a message whose avatar was
   * suppressed still lines up with the one above it. Defaults on in row layout,
   * where every line shares one column.
   */
  gutter?: boolean;
  /** The name and time line above the body, in row layout. */
  header?: ReactNode;
  /** When it was sent, epoch milliseconds. Renders a meta line when given. */
  at?: Millis;
  /** The instant timestamps are read against. */
  now?: Millis;
  /** BCP-47 tag for the timestamp formatter. */
  locale?: string;
  /** How far along the send is; omitted for anything received. */
  status?: DeliveryStatus;
  /** Marks a message its author changed after sending. */
  edited?: boolean;
  /** Replaces the default timestamp and status line entirely. */
  meta?: ReactNode;
  /** Slot under the body for the reaction bar. */
  reactions?: ReactNode;
  /** Slot above the text for images, files, and media. */
  attachments?: ReactNode;
  /** Slot above the body for a quoted preview of the message being answered. */
  replyTo?: ReactNode;
  /** Translated delivery and edited words. */
  labels?: Partial<MessageLabels>;
  /** Renders a placeholder with the bubble's exact geometry. */
  skeleton?: boolean;
}

/**
 * One message, in either of the two layouts chat apps actually use.
 *
 * **Bubble** is iMessage and WhatsApp: a tinted capsule on the edge its author
 * owns, sized to its content, whose corners are decided by `bubblePosition` in
 * @glacier/logic rather than by this component. That indirection is the point.
 * A run of four messages has to read as one utterance, and it only does so if
 * the corners facing a neighbour tighten while the corners facing open space
 * stay round — so the stacked edge behaves like a single tall shape that has
 * been sliced, and the free edge keeps the silhouette that says which side of
 * the conversation it came from. Both bindings ask the same function, so a run
 * cannot break differently on a phone than it does in a browser.
 *
 * **Row** is Slack and Discord: full width, no fill, avatar in a leading gutter,
 * name and time as a header line. Alignment means nothing in a single-column
 * transcript, so the header does the work colour and position do in a bubble.
 *
 * Which edge is "mine" is expressed logically — the viewer's messages take the
 * *trailing* edge, not the right one — so an Arabic transcript mirrors as a
 * whole and the viewer's own words stay on the side their language puts them.
 * The one thing that cannot be logical is the tail's path, since SVG has no
 * writing direction; see the stylesheet for how that is inverted exactly once.
 */
export function MessageBubble({
  layout = 'bubble',
  own = false,
  position = 'only',
  tail = false,
  side,
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
  className,
  style,
  children,
  ...rest
}: MessageBubbleProps) {
  const metrics = messageMetrics(layout);
  // A row transcript is one column, so authorship moves nothing; only a bubble
  // transcript spends the inline axis on who is talking.
  const resolvedSide: MessageSide = side ?? (layout === 'row' ? 'start' : messageSide(own));
  const showTail = layout === 'bubble' && tail;
  const corners = bubbleCorners(position, resolvedSide, showTail);
  const showGutter = gutter ?? (layout === 'row' || avatar != null);

  // The shared scale reaches CSS as custom properties, so the stylesheet keeps
  // deciding how the space is spent while the numbers stay one source.
  const vars = {
    '--message-gap': `var(--glacier-${metrics.lineGap})`,
    '--message-stack-gap': `var(--glacier-${metrics.stackGap})`,
    '--message-gutter-gap': `var(--glacier-${metrics.gutterGap})`,
    '--message-gutter': `var(--glacier-${metrics.gutter})`,
    '--message-padding-inline': `var(--glacier-${metrics.paddingInline})`,
    '--message-padding-block': `var(--glacier-${metrics.paddingBlock})`,
    '--message-font-size': `var(--glacier-${metrics.fontSize})`,
    '--message-max-width': BUBBLE_MAX_WIDTH,
    '--message-corner-start-start': `var(--glacier-${corners.startStart})`,
    '--message-corner-start-end': `var(--glacier-${corners.startEnd})`,
    '--message-corner-end-start': `var(--glacier-${corners.endStart})`,
    '--message-corner-end-end': `var(--glacier-${corners.endEnd})`,
    '--message-tail-width': `${messageTail.width}px`,
    // The direction-independent half of the flip; a `:dir(rtl)` rule inverts it.
    '--message-tail-scale': tailScaleX(resolvedSide),
  } as CSSProperties;

  const hasMeta = meta !== undefined || at !== undefined || status !== undefined || edited;

  return (
    <div
      className={cx(styles.message, className)}
      style={{ ...vars, ...style }}
      data-layout={layout}
      data-side={resolvedSide}
      data-position={position}
      data-own={own || undefined}
      data-tail={showTail || undefined}
      data-status={status}
      data-skeleton={skeleton || undefined}
      {...rest}
    >
      {showGutter && <div className={styles.gutter}>{avatar}</div>}
      <div className={styles.column}>
        {header != null && <div className={styles.header}>{header}</div>}
        <div className={styles.bubble}>
          {replyTo}
          {attachments}
          {skeleton ? (
            <Skeleton variant="text" width="18ch" />
          ) : (
            children != null && <div className={styles.body}>{children}</div>
          )}
          {hasMeta &&
            (meta ?? (
              <MessageMeta
                at={at}
                now={now}
                locale={locale}
                status={status}
                edited={edited}
                own={own && layout === 'bubble'}
                labels={labels}
              />
            ))}
          {/* An SVG rather than a pseudo-element: React Native has no `::after`,
              and a tail invented twice is a tail that drifts. The path and its
              box come from @glacier/logic; the fill is a token, applied in the
              stylesheet next to the bubble's own background so the two cannot
              come apart. */}
          {showTail && (
            <svg
              className={styles.tail}
              width={messageTail.width}
              height={messageTail.height}
              viewBox={`0 0 ${messageTail.width} ${messageTail.height}`}
              aria-hidden="true"
              focusable="false"
            >
              <path d={messageTail.path} />
            </svg>
          )}
        </div>
        {reactions}
      </div>
    </div>
  );
}
