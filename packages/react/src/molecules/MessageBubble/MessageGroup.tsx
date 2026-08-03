import {
  bubblePosition,
  type BubblePosition,
  type ChatMessage,
  type MessageGroup as ChatMessageGroup,
  type Millis,
} from '@glacier/logic';
import {
  bubbleHasTail,
  messageMetrics,
  messageSide,
  type MessageLabels,
  type MessageLayout,
} from '@glacier/logic';
import type { CSSProperties, ComponentProps, ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { Text } from '../../atoms/display/Typography/Text.tsx';
import { MessageBubble } from './MessageBubble.tsx';
import { MessageMeta } from './MessageMeta.tsx';
import styles from './MessageBubble.module.css';

export type { ChatMessageGroup };

/**
 * What a slot renderer is told about the message it is decorating.
 *
 * The reactions, attachments, and quoted-reply components are built separately;
 * this is the contract between them and the run. It carries the message plus the
 * geometry facts a decoration might need - a reaction bar under the last bubble
 * of a run sits beside a tail, and one under a middle bubble does not.
 */
export interface MessageSlotContext<M extends ChatMessage = ChatMessage> {
  message: M;
  /** Position within this run, not within the transcript. */
  index: number;
  /** Where the message sits in the run; the same value that cut its corners. */
  position: BubblePosition;
  /** The viewer wrote it. */
  own: boolean;
  layout: MessageLayout;
  /** This is the message that ends the run - the one wearing the tail. */
  last: boolean;
}

export interface MessageGroupProps<M extends ChatMessage = ChatMessage>
  extends Omit<ComponentProps<'div'>, 'children' | 'content'> {
  /** The run, exactly as `groupMessages` in @glacier/logic built it. */
  group: ChatMessageGroup<M>;
  layout?: MessageLayout;
  /** The viewer wrote this run. Derived from `viewerId` when omitted. */
  own?: boolean;
  /** The reading user, compared against the run's authorId. */
  viewerId?: string;
  /** Drawn once at the head of the run, never on a continued one. */
  avatar?: ReactNode;
  /** Drawn once at the head of the run, never on a continued one. */
  authorName?: ReactNode;
  /**
   * The author's name as a plain string. A continued run hides its visible
   * header but must still be announced, or a screen reader hears an unlabelled
   * group of messages from nobody.
   */
  authorLabel?: string;
  /** Draws a tail on the message that ends the run. Ignored in row layout. */
  tails?: boolean;
  /** The instant timestamps are read against. */
  now?: Millis;
  /** BCP-47 tag for the timestamp formatter. */
  locale?: string;
  /** Replaces the default text rendering for one message. */
  renderBody?: (context: MessageSlotContext<M>) => ReactNode;
  /** Returns the reaction bar for one message. */
  renderReactions?: (context: MessageSlotContext<M>) => ReactNode;
  /** Returns the attachment block for one message. */
  renderAttachments?: (context: MessageSlotContext<M>) => ReactNode;
  /** Returns the quoted preview for one message. */
  renderReplyTo?: (context: MessageSlotContext<M>) => ReactNode;
  /** Translated delivery and edited words. */
  labels?: Partial<MessageLabels>;
  /** Renders the run as placeholders at its real footprint. */
  skeleton?: boolean;
}

/**
 * One author's run of messages.
 *
 * A run exists so a burst of typing reads as one utterance rather than four
 * interruptions, and that only works if the repeated parts are said once: the
 * avatar at the head, the name at the head, and a single timestamp and delivery
 * line at the foot instead of one per message.
 *
 * The `continued` flag is the subtle case and the one most easily got wrong.
 * When the unread divider lands mid-run, `insertSeparators` splits the run and
 * marks the trailing half continued - it is the same person still talking, with
 * a line drawn through their sentence. Repeating the avatar and name there would
 * turn one speaker into two and make the divider look like a change of author,
 * so a continued run suppresses both while keeping the gutter reserved, and its
 * text stays on exactly the same line as the half above it.
 *
 * The run's delivery status is the least advanced of its members, not the last
 * one's, so a stack holding a failed send says so even when everything after it
 * went through.
 */
export function MessageGroup<M extends ChatMessage = ChatMessage>({
  group,
  layout = 'bubble',
  own,
  viewerId,
  avatar,
  authorName,
  authorLabel,
  tails = true,
  now,
  locale,
  renderBody,
  renderReactions,
  renderAttachments,
  renderReplyTo,
  labels,
  skeleton = false,
  className,
  style,
  ...rest
}: MessageGroupProps<M>) {
  const isOwn = own ?? (viewerId !== undefined && group.authorId === viewerId);
  const metrics = messageMetrics(layout);
  const side = layout === 'row' ? 'start' : messageSide(isOwn);
  // A system notice is not a person talking, so it never grows a tail even at
  // the end of what is technically a run of one.
  const wantsTails = tails && layout === 'bubble' && !group.standalone;
  const showHeader = !group.continued;

  const vars = {
    '--message-stack-gap': `var(--glacier-${metrics.stackGap})`,
    '--message-gutter-gap': `var(--glacier-${metrics.gutterGap})`,
    '--message-gutter': `var(--glacier-${metrics.gutter})`,
  } as CSSProperties;

  const statuses = group.messages.map((message) => message.status);
  const label = authorLabel ?? (typeof authorName === 'string' ? authorName : undefined);

  const header = showHeader && (authorName != null || layout === 'row') && (
    <div className={styles.header}>
      {authorName != null && (
        <Text as="span" size="sm" weight="semibold" className={styles.author}>
          {authorName}
        </Text>
      )}
      {/* A row transcript puts the time in the header, where it labels the whole
          run; a bubble transcript puts it at the foot, next to the status. */}
      {layout === 'row' && (
        <MessageMeta at={group.startedAt} now={now} locale={locale} timestampStyle="auto" labels={labels} />
      )}
    </div>
  );

  // Bubble layout always closes the run with a stamp. Row layout has already
  // printed the time in the header, so it only speaks again when there is a
  // delivery state worth reporting.
  const footMeta =
    layout === 'bubble' ? (
      <MessageMeta
        at={group.endedAt}
        now={now}
        locale={locale}
        statuses={statuses}
        labels={labels}
        skeleton={skeleton}
      />
    ) : (
      statuses.some((status) => status !== undefined) && (
        <MessageMeta statuses={statuses} announceTime={false} labels={labels} />
      )
    );

  return (
    <div
      className={cx(styles.group, className)}
      style={{ ...vars, ...style }}
      data-layout={layout}
      data-side={side}
      data-own={isOwn || undefined}
      data-continued={group.continued || undefined}
      data-standalone={group.standalone || undefined}
      // Labelled by its author so a screen reader says who is talking once
      // rather than before every message. Without a name there is nothing to
      // label it with, and an unlabelled group is noise, so it stays a plain box.
      role={label ? 'group' : undefined}
      aria-label={label}
      {...rest}
    >
      {/* Reserved even when empty: the messages in a continued run must land on
          the same line as the ones above it. */}
      <div className={styles.gutter}>{showHeader ? avatar : null}</div>
      <div className={styles.stack}>
        {header}
        {group.messages.map((message, index) => {
          const position = bubblePosition(index, group.messages.length);
          const last = index === group.messages.length - 1;
          const context: MessageSlotContext<M> = { message, index, position, own: isOwn, layout, last };
          return (
            <MessageBubble
              key={message.id}
              layout={layout}
              own={isOwn}
              position={position}
              tail={bubbleHasTail(position, wantsTails)}
              edited={message.editedAt !== undefined}
              labels={labels}
              skeleton={skeleton}
              replyTo={renderReplyTo?.(context)}
              attachments={renderAttachments?.(context)}
              reactions={renderReactions?.(context)}
            >
              {renderBody ? renderBody(context) : message.text}
            </MessageBubble>
          );
        })}
        {footMeta}
      </div>
    </div>
  );
}
