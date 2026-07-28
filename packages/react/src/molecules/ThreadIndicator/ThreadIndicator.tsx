import { formatMessageTimestamp, messageTimestamp, type Millis } from '@glacier/logic';
import { threadReplyForm } from '@glacier/logic';
import { motion, useReducedMotion } from 'motion/react';
import { pressTap } from '@glacier/motion';
import type { ComponentProps, ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { defineMessages, useLocale, useT } from '../../i18n/index.ts';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import styles from './ThreadIndicator.module.css';

/**
 * TODO(i18n): move into packages/react/src/i18n/messages.ts as
 * `threadReplyOne` / `threadReplyOther` (parameterized: `{count}`) and
 * `threadOpen` (`{count}`, `{time}`); listed in the handoff.
 *
 * Two forms rather than full ICU plurals: the kit's catalog interpolates
 * `{count}` and nothing else. That is exact for en/es/fr/de/pt, and correct by
 * construction for ja/zh (one form, both entries identical); Arabic has six
 * categories and takes the closest general form, which is why `label` exists as
 * the escape hatch for a caller with a real plural engine.
 */
const messages = defineMessages({
  threadReplyOne: {
    en: '{count} reply', es: '{count} respuesta', fr: '{count} réponse', de: '{count} Antwort',
    ja: '返信 {count} 件', pt: '{count} resposta', zh: '{count} 条回复', ar: '{count} رد',
  },
  threadReplyOther: {
    en: '{count} replies', es: '{count} respuestas', fr: '{count} réponses', de: '{count} Antworten',
    ja: '返信 {count} 件', pt: '{count} respostas', zh: '{count} 条回复', ar: '{count} ردود',
  },
  threadOpen: {
    en: 'Open thread, {replies}, last reply {time}',
    es: 'Abrir hilo, {replies}, última respuesta {time}',
    fr: 'Ouvrir le fil, {replies}, dernière réponse {time}',
    de: 'Thread öffnen, {replies}, letzte Antwort {time}',
    ja: 'スレッドを開く、{replies}、最後の返信 {time}',
    pt: 'Abrir tópico, {replies}, última resposta {time}',
    zh: '打开话题，{replies}，最后回复 {time}',
    ar: 'فتح المحادثة، {replies}، آخر رد {time}',
  },
  /** The same name for a thread with no recorded last activity. */
  threadOpenBrief: {
    en: 'Open thread, {replies}', es: 'Abrir hilo, {replies}', fr: 'Ouvrir le fil, {replies}',
    de: 'Thread öffnen, {replies}', ja: 'スレッドを開く、{replies}', pt: 'Abrir tópico, {replies}',
    zh: '打开话题，{replies}', ar: 'فتح المحادثة، {replies}',
  },
});

export interface ThreadIndicatorProps
  extends Omit<ComponentProps<typeof motion.button>, 'children'> {
  /** How many replies the thread holds. */
  count: number;
  /**
   * The faces, as a slot — compose an AvatarGroup. A node rather than a list of
   * people, because how a stack of avatars overlaps is not this component's
   * decision.
   */
  participants?: ReactNode;
  /** Epoch milliseconds of the last reply. */
  lastActivityAt?: Millis;
  /** The moment to measure against; injected so a test is not clock-dependent. */
  now?: Millis;
  /** Overrides the reply-count wording. */
  label?: ReactNode;
  /** Overrides the formatted last-activity time. */
  activity?: ReactNode;
  /** Opens the thread. */
  onPress?: () => void;
  /** The thread has replies this reader has not seen. */
  unread?: boolean;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
}

/**
 * The footer that opens a thread: who replied, how many times, and when last.
 *
 * One button, not a row of them. The faces are decorative — their names are
 * already inside the thread — and making each one focusable would put five extra
 * tab stops under every message that happens to have a reply. So the whole strip
 * is a single target whose accessible name is the count and the time, and the
 * avatars are hidden from assistive tech.
 *
 * The reply count is real text rather than a badge, because a number that exists
 * only as a coloured pill is a number a screen reader has to guess at; unread is
 * carried by weight as well as colour, so it survives greyscale.
 *
 * The time is spelled by the shared `messageTimestamp` ladder, the same one the
 * bubbles use, so a thread footer and the message above it never disagree about
 * what "yesterday" means.
 */
export function ThreadIndicator({
  count,
  participants,
  lastActivityAt,
  now = Date.now(),
  label,
  activity,
  onPress,
  unread = false,
  skeleton = false,
  className,
  ...rest
}: ThreadIndicatorProps) {
  const t = useT();
  const locale = useLocale();
  const reduce = useReducedMotion();

  if (skeleton) {
    return (
      <div className={cx(styles.row, className)} aria-hidden="true">
        <Skeleton variant="circle" width="1.25rem" />
        <Skeleton variant="text" width="8ch" />
      </div>
    );
  }

  const replies =
    label ?? t(threadReplyForm(count) === 'one' ? messages.threadReplyOne : messages.threadReplyOther, { count });

  const stamp =
    lastActivityAt === undefined ? undefined : formatMessageTimestamp(messageTimestamp(lastActivityAt, now), locale);
  const when = activity ?? stamp;

  const body = (
    <>
      {participants != null && (
        // Decorative: the count already says how many people are in there, and
        // their names are in the thread itself.
        <span className={styles.faces} aria-hidden="true">
          {participants}
        </span>
      )}
      <span className={styles.count}>{replies}</span>
      {when != null && <span className={styles.activity}>{when}</span>}
    </>
  );

  if (!onPress) {
    return (
      // Cast at this one boundary: the props are declared for the pressable
      // motion.button, and this branch renders a plain div. Only the DOM
      // attributes (data-*, id, aria-*) are meaningful here.
      <div className={cx(styles.row, className)} data-unread={unread || undefined} {...(rest as ComponentProps<'div'>)}>
        {body}
      </div>
    );
  }

  return (
    <motion.button
      type="button"
      className={cx(styles.row, styles.pressable, className)}
      data-unread={unread || undefined}
      aria-label={
        stamp === undefined
          ? t(messages.threadOpenBrief, { replies: nameOf(replies, count) })
          : t(messages.threadOpen, { replies: nameOf(replies, count), time: stamp })
      }
      whileTap={pressTap('compact', reduce ?? false)}
      onClick={onPress}
      {...rest}
    >
      {body}
    </motion.button>
  );
}

/**
 * The reply count as a string for the accessible name. A node `label` (a styled
 * count, a mixed run) has no text this side of the DOM, so the bare number
 * stands in rather than "[object Object]".
 */
function nameOf(label: ReactNode, count: number): string {
  return typeof label === 'string' || typeof label === 'number' ? String(label) : String(count);
}
