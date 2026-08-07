import {
  formatMessageTimestamp,
  formatReadReceipt,
  leastDelivery,
  messageTimestamp,
  readReceipt,
  type DeliveryStatus,
  type MessageReader,
  type MessageTimestamp,
  type MessageTimestampStyle,
  type Millis,
  type ReadReceiptTemplates,
} from '@glacier/logic';
import {
  type MessageLabels,
} from '@glacier/logic';
import type { ComponentProps, ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { useLocale, useT } from '../../i18n/LocaleProvider.tsx';
import { kitMessages } from '../../i18n/messages.ts';
import { DeliveryStatus as DeliveryMark } from '../../atoms/display/DeliveryStatus/DeliveryStatus.tsx';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import { messageMessages } from './messages.ts';
import styles from './MessageBubble.module.css';

export type { MessageLabels };

export interface MessageMetaProps extends Omit<ComponentProps<'span'>, 'children'> {
  /** The moment to print, epoch milliseconds. */
  at?: Millis;
  /**
   * The instant it is read against. Injected rather than defaulted inside the
   * formatter so a transcript, a test, and a screenshot all render the same.
   */
  now?: Millis;
  /** BCP-47 tag for the formatter; falls back to the active locale. */
  locale?: string;
  /** How much of the moment to spell out. */
  timestampStyle?: MessageTimestampStyle;
  /** One message's delivery state. */
  status?: DeliveryStatus;
  /**
   * A run's delivery states, collapsed with `leastDelivery` to the least
   * advanced of them - so a stack holding one failed send says failed, not
   * "read", which is what the last message in it might otherwise claim.
   */
  statuses?: (DeliveryStatus | undefined)[];
  /**
   * When it was read. The tick says *that* a message was opened and this says
   * *when*, which is the difference between a status and a receipt - and the
   * fact the sender was actually waiting for.
   */
  readAt?: Millis;
  /**
   * Who read it. The only honest answer in a group thread, where one `read`
   * tick cannot say which of five people opened the message.
   */
  readBy?: MessageReader[];
  /** How many reader names the line has room for before "and N others". */
  readByMax?: number;
  /** Translated read-receipt sentences, one per shape. */
  receiptTemplates?: Partial<ReadReceiptTemplates>;
  /** Marks a message its author changed after sending. */
  edited?: boolean;
  /** Sits inside an accent-filled bubble, so the line takes the contrast colour. */
  own?: boolean;
  /**
   * Whether the timestamp reaches the accessibility tree. False where an
   * enclosing group already announced the same moment, so it is not read twice.
   */
  announceTime?: boolean;
  /** Spells the timestamp; defaults to the platform's Intl. */
  formatTimestamp?: (stamp: MessageTimestamp, locale?: string) => string;
  /** Translated delivery and edited words, merged over the English defaults. */
  labels?: Partial<MessageLabels>;
  /** Renders a placeholder at the line's exact height. */
  skeleton?: boolean;
}

/**
 * The timestamp and delivery line under a message or a run.
 *
 * It carries two things that look decorative and are not. The status is the only
 * signal that a message did not go out, so it is always paired with a written
 * word - an icon alone is unreadable to anything that is not looking at the
 * screen. And a run's status is the *least* advanced of its members rather than
 * the last one's: a stack whose final message was read still holds a failed send
 * two messages up, and reporting "read" would hide the one thing the user has to
 * act on.
 */
export function MessageMeta({
  at,
  now = Date.now(),
  locale,
  timestampStyle = 'time',
  status,
  statuses,
  readAt,
  readBy,
  readByMax = 2,
  receiptTemplates,
  edited = false,
  own = false,
  announceTime = true,
  formatTimestamp = formatMessageTimestamp,
  labels,
  skeleton = false,
  className,
  ...rest
}: MessageMetaProps) {
  const t = useT();
  const activeLocale = useLocale();
  // The English fallbacks live in commons for the native binding; here the
  // catalog supplies every word, and `labels` still wins so an app can override
  // one of them without restating the set.
  const text: MessageLabels = {
    sending: t(messageMessages.messageSending),
    sent: t(messageMessages.messageSent),
    delivered: t(messageMessages.messageDelivered),
    read: t(messageMessages.messageRead),
    failed: t(messageMessages.messageFailed),
    edited: t(messageMessages.messageEdited),
    ...labels,
  };

  // An explicit status wins; a list of them collapses to the one the run should
  // advertise. Both paths end at the same value, so the line cannot say one
  // thing for a message and something else for the run holding it.
  const resolved = status ?? (statuses ? leastDelivery(statuses) : undefined);
  const statusLabel = resolved ? text[resolved] : undefined;

  const stamp = at === undefined ? undefined : messageTimestamp(at, now, timestampStyle);
  const time: ReactNode =
    stamp === undefined ? undefined : formatTimestamp(stamp, locale ?? activeLocale);

  // The read history, which is a different fact from the tick above it: the
  // glyph says a message was opened, this says when, or by whom. `readBy` wins
  // over `readAt` where both are given, because naming the readers answers the
  // question a group thread is actually asking - a single "Read" there is
  // ambiguous about which of five people it means.
  const tally = readBy !== undefined && readBy.length > 0 ? readReceipt(readBy, readByMax) : undefined;
  const readMoment = readAt ?? tally?.at;
  const readTime =
    readMoment === undefined
      ? ''
      : formatTimestamp(messageTimestamp(readMoment, now, 'time'), locale ?? activeLocale);
  const receipt = tally
    ? formatReadReceipt(
        tally,
        {
          one: t(kitMessages.messageReadByOne),
          two: t(kitMessages.messageReadByTwo),
          several: t(kitMessages.messageReadBySeveral),
          many: t(kitMessages.messageReadByMany),
          ...receiptTemplates,
        },
        { time: readTime, join: (names) => joinNames(names, locale ?? activeLocale) },
      )
    : readMoment === undefined
      ? ''
      : t(kitMessages.messageReadAt, { time: readTime });

  if (skeleton) {
    return (
      <span
        className={cx(styles.meta, className)}
        style={{ height: 'calc(var(--glacier-leading-xs) * var(--glacier-font-size-xs))' }}
        {...rest}
      >
        <Skeleton variant="text" width="4ch" />
      </span>
    );
  }

  return (
    <span
      className={cx(styles.meta, className)}
      data-own={own || undefined}
      data-status={resolved}
      {...rest}
    >
      {time !== undefined && (
        <span aria-hidden={announceTime ? undefined : 'true'}>{time}</span>
      )}
      {edited && <span>{text.edited}</span>}
      {resolved && (
        <>
          <DeliveryMark
            status={resolved}
            // `sm` is the step the spec pairs with xs text, which is what this
            // line is set in.
            size="sm"
            className={styles.metaIcon}
            // The line already spells the status out, one node along; a labelled
            // role="img" here would make a screen reader say it twice.
            decorative
            // Inside an accent fill the mark's own quiet greys are unreadable, so
            // it borrows the bubble's contrast colour - except failure, which is
            // the one status worth clashing for. Inline rather than a rule,
            // because it is the call site, not the mark, that knows what it has
            // been dropped onto.
            style={
              own && resolved !== 'failed' ? { color: 'var(--glacier-accent-contrast)' } : undefined
            }
          />
          {/* The word, not the glyph, is the status for a screen reader. */}
          <span className={styles.srOnly}>{statusLabel}</span>
        </>
      )}
      {/* Its own line rather than another item in the row: a group receipt is a
          sentence and the line above it is a row of glyphs, and letting the two
          share a line would reflow the stamp every time a reader arrived. */}
      {receipt !== '' && <span className={styles.receipt}>{receipt}</span>}
    </span>
  );
}

/**
 * Joins reader names the way the reader's own language joins a list.
 *
 * `Intl.ListFormat` is missing from a few older engines, so its absence
 * degrades to the plain comma `formatReadReceipt` already defaults to.
 */
function joinNames(list: string[], locale: string): string {
  const ListFormat = (Intl as { ListFormat?: new (locale?: string, options?: { style: string; type: string }) => { format(items: string[]): string } }).ListFormat;
  if (ListFormat === undefined) return list.join(', ');
  return new ListFormat(locale, { style: 'long', type: 'conjunction' }).format(list);
}
