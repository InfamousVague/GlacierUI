// The Glacier MessageGroup, rendered with React Native primitives: one author's
// run of messages, with the avatar and name said once and the timestamps
// collapsed to the run. Grouping, slot positions, and the delivery roll-up all
// come from @glacier/logic, so a run looks and reports the same here as it
// does in the DOM kit.

import type { ReactNode } from 'react';
import { View } from 'react-native';
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
import { t } from '../../tokens.ts';
import { Text } from '../../atoms/display/Text.tsx';
import { MessageBubble } from './MessageBubble.tsx';
import { MessageMeta } from './MessageMeta.tsx';

export type { ChatMessageGroup };

/** What a slot renderer is told about the message it is decorating. */
export interface MessageSlotContext<M extends ChatMessage = ChatMessage> {
  message: M;
  index: number;
  position: BubblePosition;
  own: boolean;
  layout: MessageLayout;
  /** This is the message that ends the run - the one wearing the tail. */
  last: boolean;
}

export interface MessageGroupProps<M extends ChatMessage = ChatMessage> {
  /** The run, exactly as `groupMessages` in @glacier/logic built it. */
  group: ChatMessageGroup<M>;
  layout?: MessageLayout;
  /** The viewer wrote this run. Derived from `viewerId` when omitted. */
  own?: boolean;
  viewerId?: string;
  /** The page runs right to left; forwarded to the tail. */
  rtl?: boolean;
  /** Drawn once at the head of the run, never on a continued one. */
  avatar?: ReactNode;
  authorName?: ReactNode;
  /** The author's name as a plain string, for a run whose header is suppressed. */
  authorLabel?: string;
  tails?: boolean;
  now?: Millis;
  locale?: string;
  renderBody?: (context: MessageSlotContext<M>) => ReactNode;
  renderReactions?: (context: MessageSlotContext<M>) => ReactNode;
  renderAttachments?: (context: MessageSlotContext<M>) => ReactNode;
  renderReplyTo?: (context: MessageSlotContext<M>) => ReactNode;
  labels?: Partial<MessageLabels>;
  skeleton?: boolean;
}

/**
 * One author's run of messages.
 *
 * The `continued` flag is the case worth spelling out. When the unread divider
 * lands mid-run, `insertSeparators` splits the run and marks the trailing half
 * continued - the same person is still talking, with a line drawn through their
 * sentence. Repeating the avatar and name there would turn one speaker into two
 * and make the divider read as a change of author, so a continued run suppresses
 * both while keeping the gutter reserved, and its messages stay on exactly the
 * line the half above them used.
 */
export function MessageGroup<M extends ChatMessage = ChatMessage>({
  group,
  layout = 'bubble',
  own,
  viewerId,
  rtl = false,
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
}: MessageGroupProps<M>) {
  const isOwn = own ?? (viewerId !== undefined && group.authorId === viewerId);
  const metrics = messageMetrics(layout);
  const isBubble = layout === 'bubble';
  const side = isBubble ? messageSide(isOwn) : 'start';
  // A system notice is not a person talking, so it never grows a tail.
  const wantsTails = tails && isBubble && !group.standalone;
  const showHeader = !group.continued;

  const statuses = group.messages.map((message) => message.status);
  const label = authorLabel ?? (typeof authorName === 'string' ? authorName : undefined);

  return (
    <View
      style={{ flexDirection: 'row', gap: t(metrics.gutterGap), minWidth: 0 }}
      // Labelled by its author so a screen reader says who is talking once
      // rather than before every message.
      accessibilityRole={label ? 'group' : undefined}
      aria-label={label}
    >
      {/* Reserved even when empty: a continued run must land on the same line
          as the half above it. */}
      <View
        style={{
          width: t(metrics.gutter),
          flexGrow: 0,
          flexShrink: 0,
          justifyContent: isBubble ? 'flex-end' : 'flex-start',
          alignItems: 'center',
        }}
      >
        {showHeader ? avatar : null}
      </View>
      <View
        style={{
          flex: 1,
          minWidth: 0,
          // Tight: the messages in a run are one utterance, and the cut corners
          // only read as one shape across a small gap.
          gap: t(metrics.stackGap),
          alignItems: group.standalone ? 'center' : side === 'end' ? 'flex-end' : 'flex-start',
        }}
      >
        {showHeader && (authorName != null || !isBubble) && (
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: t('space-2') }}>
            {authorName != null && (
              <Text size="sm" weight="semibold">
                {authorName}
              </Text>
            )}
            {/* A row transcript puts the time in the header, where it labels the
                whole run; a bubble transcript puts it at the foot beside the
                status. */}
            {!isBubble && (
              <MessageMeta at={group.startedAt} now={now} locale={locale} timestampStyle="auto" labels={labels} />
            )}
          </View>
        )}
        {group.messages.map((message, index) => {
          const position = bubblePosition(index, group.messages.length);
          const last = index === group.messages.length - 1;
          const context: MessageSlotContext<M> = { message, index, position, own: isOwn, layout, last };
          return (
            <MessageBubble
              key={message.id}
              layout={layout}
              own={isOwn}
              rtl={rtl}
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
        {isBubble ? (
          <MessageMeta at={group.endedAt} now={now} locale={locale} statuses={statuses} labels={labels} />
        ) : (
          statuses.some((status) => status !== undefined) && (
            <MessageMeta statuses={statuses} labels={labels} />
          )
        )}
      </View>
    </View>
  );
}
