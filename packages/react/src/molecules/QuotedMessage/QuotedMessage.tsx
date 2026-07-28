import { quotedSnippet } from '@glacier/logic';
// TODO(integration): switch to '@glacier/spec' once quoted-message.ts is
// registered in packages/spec/src/index.ts.
import { quotedMessageTones } from '../../../../spec/src/components/quoted-message.ts';
import { motion, useReducedMotion } from 'motion/react';
import { pressTap } from '@glacier/motion';
import type { ComponentProps, ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { defineMessages, useT } from '../../i18n/index.ts';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import styles from './QuotedMessage.module.css';

// Derived from the spec so the tone union cannot drift.
export type QuotedMessageTone = (typeof quotedMessageTones)[number];

/**
 * TODO(i18n): move into packages/react/src/i18n/messages.ts as
 * `quotedJumpTo` (parameterized: `{author}`, `{text}`); listed in the handoff.
 *
 * The accessible name has to say what activating the block will DO, and to
 * whose message — "button" is not a choice anyone can make.
 */
const messages = defineMessages({
  quotedJumpTo: {
    en: 'Reply to {author}: {text}. Go to the original message',
    es: 'Respuesta a {author}: {text}. Ir al mensaje original',
    fr: 'Réponse à {author} : {text}. Aller au message d’origine',
    de: 'Antwort an {author}: {text}. Zur ursprünglichen Nachricht',
    ja: '{author} への返信: {text}。元のメッセージへ移動',
    pt: 'Resposta a {author}: {text}. Ir para a mensagem original',
    zh: '回复 {author}：{text}。跳转到原始消息',
    ar: 'رد على {author}: {text}. الانتقال إلى الرسالة الأصلية',
  },
});

export interface QuotedMessageProps
  extends Omit<ComponentProps<typeof motion.button>, 'children' | 'onSelect'> {
  /** Who is being quoted. */
  author: ReactNode;
  /** What they said; truncated by the shared quoted-snippet rule. */
  text?: string;
  /** Stands in for a quote with no text — "Photo", "Voice message". */
  placeholder?: ReactNode;
  /** A thumbnail of the quoted attachment, on the trailing edge. */
  preview?: ReactNode;
  /** Which family the rule and author line paint. */
  tone?: QuotedMessageTone;
  /** Jumps to the original. Omit it and the block renders inert. */
  onPress?: () => void;
  /** Overrides the accessible name of the jump target. */
  label?: string;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
}

/**
 * The reply-context block: who is being answered, one clipped line of what they
 * said, a rule down the leading edge, and a press target that jumps to the
 * original.
 *
 * The snippet is cut in the STRING, not only by CSS, and it is cut by the same
 * `truncateSnippet` a conversation row uses — so what a screen reader reads
 * matches what the eye sees, and a message that ends "…let me check and" in the
 * sidebar cannot end "…let me check an" here. A visually clipped line still
 * reads out in full to assistive tech, which is the failure mode this avoids.
 *
 * Pressability is all-or-nothing. With a handler it is a real button with a
 * name that says where it goes; without one it is an inert box with no focus
 * stop, no hover, and no press dip — because a focus stop in a transcript that
 * does nothing when activated is worse than no affordance at all.
 *
 * The rule is a logical inline-start border, so under RTL it moves to the right
 * edge along with the text it marks.
 */
export function QuotedMessage({
  author,
  text,
  placeholder,
  preview,
  tone = 'accent',
  onPress,
  label,
  skeleton = false,
  className,
  // Held back from `rest`: these props are typed for the pressable button, so
  // its ref cannot be spread onto the static branch's div.
  ref,
  ...rest
}: QuotedMessageProps) {
  const t = useT();
  const reduce = useReducedMotion();

  if (skeleton) {
    return (
      <div className={cx(styles.quote, styles[tone], className)} aria-hidden="true">
        <div className={styles.body}>
          <Skeleton variant="text" width="6ch" />
          <Skeleton variant="text" width="80%" />
        </div>
      </div>
    );
  }

  const snippet = quotedSnippet(text);
  const body = snippet !== '' ? snippet : placeholder;

  const content = (
    <>
      <span className={styles.body}>
        <span className={styles.author}>{author}</span>
        {body != null && body !== '' && <span className={styles.snippet}>{body}</span>}
      </span>
      {/* Trailing, so a thumbnail can never push the author line off the row. */}
      {preview != null && (
        <span className={styles.preview} aria-hidden="true">
          {preview}
        </span>
      )}
    </>
  );

  if (!onPress) {
    return (
      // Cast at this one boundary: the props are declared for the pressable
      // motion.button, and this branch renders a plain div. Only the DOM
      // attributes (data-*, id, aria-*) are meaningful here.
      <div className={cx(styles.quote, styles[tone], className)} data-tone={tone} {...(rest as ComponentProps<'div'>)}>
        {content}
      </div>
    );
  }

  return (
    <motion.button
      type="button"
      className={cx(styles.quote, styles[tone], styles.pressable, className)}
      data-tone={tone}
      // The name says whose message and where it goes; the visible text is
      // already inside, so aria-label replacing it is the point rather than a
      // duplication.
      aria-label={label ?? t(messages.quotedJumpTo, { author: textOf(author), text: snippet })}
      whileTap={pressTap('compact', reduce ?? false)}
      onClick={onPress}
      {...rest}
      ref={ref}
    >
      {content}
    </motion.button>
  );
}

/**
 * The author as a string for the accessible name. A node author (a styled name,
 * a mention chip) has no text this side of the DOM, so it falls back to an empty
 * slot rather than "[object Object]" — the snippet still carries the sentence.
 */
function textOf(node: ReactNode): string {
  return typeof node === 'string' || typeof node === 'number' ? String(node) : '';
}
