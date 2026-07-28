// The Glacier ThreadIndicator, rendered with React Native primitives: the
// footer that opens a thread. The reply-count form and the last-activity
// timestamp both come from @glacier/logic — `threadReplyForm` and the same
// `messageTimestamp` ladder the bubbles read — and the paint comes from the
// thread-indicator spec through the shared resolvers.

import { type ReactNode } from 'react';
import { Pressable, Text as RNText, View, type ViewProps } from 'react-native';
import { formatMessageTimestamp, messageTimestamp, press, type Millis } from '@glacier/logic';
import { threadReplyForm } from '@glacier/logic';
// TODO(integration): switch to '@glacier/spec' once thread-indicator.ts is registered.
import { threadIndicatorSpec } from '../../../../spec/src/components/thread-indicator.ts';
import { t } from '../../tokens.ts';
import { dimensionsFor, paintFor } from '../../resolve.ts';
import { Text } from '../../atoms/display/Text.tsx';
import { Skeleton } from '../../atoms/feedback/Skeleton.tsx';

/** The wording, since there is no LocaleProvider here; `label` overrides it. */
export interface ThreadIndicatorLabels {
  /** `{count}` reply, for exactly one. */
  one: string;
  /** `{count}` replies, for everything else. */
  other: string;
}

const DEFAULT_LABELS: ThreadIndicatorLabels = { one: '{count} reply', other: '{count} replies' };

export interface ThreadIndicatorProps extends Omit<ViewProps, 'children' | 'style'> {
  /** How many replies the thread holds. */
  count: number;
  /** The faces, as a slot — compose an AvatarGroup. */
  participants?: ReactNode;
  /** Epoch milliseconds of the last reply. */
  lastActivityAt?: Millis;
  /** The moment to measure against; injected so a test is not clock-dependent. */
  now?: Millis;
  /** BCP-47 tag for the timestamp formatter. */
  locale?: string;
  /** Overrides the reply-count wording. */
  label?: string;
  /** Overrides the formatted last-activity time. */
  activity?: string;
  /** Opens the thread. */
  onPress?: () => void;
  /** The thread has replies this reader has not seen. */
  unread?: boolean;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Overrides the English wording; merged over the defaults. */
  labels?: Partial<ThreadIndicatorLabels>;
}

// Size-independent box metrics (gap, padding, radius) read once from the spec.
const BOX = dimensionsFor(threadIndicatorSpec);
// The count's colour: the spec's top-level rest paint, as a bare token name.
const COUNT_COLOR = (threadIndicatorSpec.paint?.text ?? '$accent-text').replace(/^\$/, '');

/**
 * One strip, one target. The faces are decorative — their names are already
 * inside the thread — so making each one pressable would put five extra stops
 * under every message that happens to have a reply. The accessible name is the
 * count and the time, so opening it is an informed choice.
 *
 * Unread is carried by weight as well as colour, which is what makes it survive
 * greyscale; the reply count is real text rather than a badge, because a number
 * that exists only as a coloured pill is a number a screen reader has to guess
 * at.
 */
export function ThreadIndicator({
  count,
  participants,
  lastActivityAt,
  now = Date.now(),
  locale,
  label,
  activity,
  onPress,
  unread = false,
  skeleton = false,
  labels,
  ...rest
}: ThreadIndicatorProps) {
  const words = { ...DEFAULT_LABELS, ...labels };
  const unreadPaint = paintFor(threadIndicatorSpec, 'states', 'unread');

  const box = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    alignSelf: 'flex-start' as const,
    gap: t(BOX.gap ?? 'space-2'),
    paddingVertical: t(BOX.paddingBlock ?? 'space-1'),
    paddingHorizontal: t(BOX.paddingInline ?? 'space-2'),
    borderRadius: t(BOX.radius ?? 'radius-md'),
  };

  if (skeleton) {
    return (
      <View aria-hidden={true} style={box} {...rest}>
        <Skeleton variant="circle" width="1.25rem" />
        <Skeleton variant="text" width="8ch" />
      </View>
    );
  }

  const replies = label ?? words[threadReplyForm(count)].replace('{count}', String(count));
  const stamp =
    lastActivityAt === undefined
      ? undefined
      : formatMessageTimestamp(messageTimestamp(lastActivityAt, now), locale);
  const when = activity ?? stamp;

  const content = (
    <>
      {/* Decorative: the count already says how many people are in there. */}
      {participants != null && <View aria-hidden={true}>{participants}</View>}
      <RNText
        style={{
          color: t(unread ? (unreadPaint.count ?? COUNT_COLOR) : COUNT_COLOR),
          fontSize: t('font-size-xs'),
          fontWeight: t(unread ? 'font-weight-semibold' : 'font-weight-medium') as never,
          fontFamily: t('font-sans'),
        }}
      >
        {replies}
      </RNText>
      {when != null && (
        <Text size="xs" tone="subtle" numberOfLines={1}>
          {when}
        </Text>
      )}
    </>
  );

  if (!onPress) {
    return (
      <View style={box} {...rest}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        stamp === undefined ? `Open thread, ${replies}` : `Open thread, ${replies}, last reply ${stamp}`
      }
      onPress={onPress}
      style={({ pressed }) => [box, { transform: [{ scale: pressed ? press.compact : 1 }] }]}
      {...rest}
    >
      {content}
    </Pressable>
  );
}
