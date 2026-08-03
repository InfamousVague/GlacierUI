// The Glacier MessageMeta, rendered with React Native primitives: the timestamp
// and delivery status line under a message or a run. The mark itself is the
// DeliveryStatus atom rather than a second glyph table - same component the
// standalone mark uses, so a bubble and a delivery indicator cannot draw the
// same state differently - and how a run's several statuses collapse to one
// comes from @glacier/logic, the same function the DOM kit calls.

import { View, Text as RNText } from 'react-native';
import {
  formatMessageTimestamp,
  leastDelivery,
  messageTimestamp,
  type DeliveryStatus as DeliveryStatusValue,
  type MessageTimestamp,
  type MessageTimestampStyle,
  type Millis,
} from '@glacier/logic';
import {
  defaultMessageLabels,
  type MessageLabels,
} from '@glacier/logic';
import { DeliveryStatus } from './DeliveryStatus.tsx';
import { textSpec } from '@glacier/spec';
import {
  messageMetaSpec,
  // TODO(integration): switch to '@glacier/spec' once message-bubble.ts is
  // re-exported from packages/spec/src/index.ts.
} from '../../../../spec/src/components/message-bubble.ts';
import { t } from '../../tokens.ts';
import { paintFor, sizeFor } from '../../resolve.ts';

export type { MessageLabels };

export interface MessageMetaProps {
  at?: Millis;
  /** Injected rather than read from the clock, so a transcript renders deterministically. */
  now?: Millis;
  locale?: string;
  timestampStyle?: MessageTimestampStyle;
  /** One message's delivery state. */
  status?: DeliveryStatusValue;
  /** A run's states, collapsed to the least advanced of them. */
  statuses?: (DeliveryStatusValue | undefined)[];
  edited?: boolean;
  /** Sits inside an accent-filled bubble, so the line takes the contrast colour. */
  own?: boolean;
  formatTimestamp?: (stamp: MessageTimestamp, locale?: string) => string;
  labels?: Partial<MessageLabels>;
}

/**
 * The timestamp and delivery line.
 *
 * A run reports the *least* advanced status of its members rather than its last
 * message's: a stack whose final message was read can still hold a failed send
 * two messages up, and that is the one thing the user has to act on.
 *
 * Typography is read from the text spec rather than typed in, so the line
 * matches the DOM kit's `xs` text exactly. The status word rides along as an
 * accessibility label because the glyph alone says nothing out loud.
 */
export function MessageMeta({
  at,
  now = Date.now(),
  locale,
  timestampStyle = 'time',
  status,
  statuses,
  edited = false,
  own = false,
  formatTimestamp = formatMessageTimestamp,
  labels,
}: MessageMetaProps) {
  const text: MessageLabels = { ...defaultMessageLabels, ...labels };

  const resolved = status ?? (statuses ? leastDelivery(statuses) : undefined);

  const stamp = at === undefined ? undefined : messageTimestamp(at, now, timestampStyle);
  const time = stamp === undefined ? undefined : formatTimestamp(stamp, locale);

  const rest = paintFor(messageMetaSpec, 'states', 'default');
  const inside = paintFor(messageMetaSpec, 'states', 'own');
  const dims = sizeFor(textSpec, 'xs');

  const lineStyle = {
    color: t(own ? (inside.text ?? 'accent-contrast') : (rest.text ?? 'text-subtle')),
    fontSize: t(dims.fontSize ?? 'font-size-xs'),
    lineHeight: t('leading-xs'),
    fontFamily: t('font-sans'),
    // A clock that reflowed as the minute ticked would jitter every stamp in the
    // transcript.
    fontVariant: ['tabular-nums'],
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: t('space-1'),
        // Inside an accent fill the line leans on opacity for hierarchy, since
        // there is no quieter colour available that stays readable.
        opacity: own ? 0.75 : 1,
      }}
    >
      {time !== undefined && <RNText style={lineStyle}>{time}</RNText>}
      {edited && <RNText style={lineStyle}>{text.edited}</RNText>}
      {resolved && (
        // Not `decorative`, unlike the DOM line: there the status word rides
        // along as visually-hidden text, so the mark beside it would be a second
        // announcement of the same fact. React Native has no such text, and the
        // mark's own label is the only thing that says the status out loud.
        <DeliveryStatus
          status={resolved}
          // `sm` is the step the spec pairs with xs text, which is what this
          // line is set in.
          size="sm"
          label={text[resolved]}
          // Inside an accent fill both the quiet greys and the accent tint go
          // unreadable, so the mark borrows the bubble's contrast colour -
          // except failure, which is the one status worth clashing for.
          color={own && resolved !== 'failed' ? t('accent-contrast') : undefined}
        />
      )}
    </View>
  );
}
