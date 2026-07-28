import type { ComponentProps, ReactNode } from 'react';
import {
  defaultTranscriptLabels,
  formatTranscriptLabel,
  type TranscriptLabels,
} from '@glacier/logic';
import { cx } from '../../internal/cx.ts';
import styles from './MessageList.module.css';

/** Where the label sits on the rule. */
export type UnreadDividerAlign = 'start' | 'center' | 'end';

export interface UnreadDividerProps extends Omit<ComponentProps<'div'>, 'children'> {
  /** The phrase on the rule. Defaults to the shared "New messages" string. */
  label?: ReactNode;
  /** How many messages are unread from here down. Shown when greater than zero. */
  count?: number;
  /** Translated strings, merged over the shared English defaults. */
  labels?: Partial<TranscriptLabels>;
  /** Centre reads as a boundary; start reads as a heading for what follows. */
  align?: UnreadDividerAlign;
}

/**
 * The "new messages" rule.
 *
 * Three things separate it from a `DateSeparator`, and they are separate on
 * purpose rather than for variety: an accent-tinted rule instead of a neutral
 * hairline, a semibold tracked label instead of a muted one, and a tally chip a
 * date row never has. A reader scrolling a transcript full of date rows has to
 * be able to find this one without reading any of them.
 *
 * It is deliberately not sticky and offers no option to become so. A day row
 * pins because it answers "what am I looking at now", which is a question about
 * the viewport. This row answers "where did I stop", which is a question about
 * the transcript — pin it to the top edge and it would follow the reader down
 * the page, marking nothing.
 *
 * It also does not fade out when the messages below it are read. The divider is
 * the landmark the reader is using; removing it mid-read takes away the only
 * thing on screen that was holding their place. It leaves when the transcript is
 * next rebuilt with a fresh anchor, which is a decision the app makes, not a
 * decision this row makes while being looked at.
 */
export function UnreadDivider({
  label,
  count = 0,
  labels,
  align = 'center',
  className,
  ...rest
}: UnreadDividerProps) {
  const text = { ...defaultTranscriptLabels, ...labels };
  const phrase = label ?? text.newMessages;
  const showCount = count > 0;

  // The count belongs in the accessible name, not beside it: a reader hearing
  // "New messages, separator" and then a stray "12" has to work out what the
  // number was counting.
  const name =
    showCount && typeof phrase === 'string'
      ? formatTranscriptLabel(text.newMessageCount, { count })
      : typeof phrase === 'string'
        ? phrase
        : undefined;

  return (
    <div
      role="separator"
      aria-label={name}
      className={cx(styles.unread, className)}
      data-align={align}
      data-count={showCount ? count : undefined}
      {...rest}
    >
      <span className={styles.unreadRule} aria-hidden="true" />
      <span className={styles.unreadLabel} aria-hidden="true">
        {phrase}
        {showCount && <span className={styles.unreadCount}>{count}</span>}
      </span>
      <span className={styles.unreadRule} aria-hidden="true" />
    </div>
  );
}
