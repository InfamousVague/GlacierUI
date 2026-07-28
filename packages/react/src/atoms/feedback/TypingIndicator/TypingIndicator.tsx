import { formatTyping, typingText, type TypingState, type TypingTemplates } from '@glacier/logic';
import {
  TYPING_DOTS,
  typingDotDelays,
  useTypingAnnouncement,
  type TypingAnnounce,
} from '@glacier/logic';
// TODO(integration): switch to '@glacier/spec' once typing-indicator.ts is
// registered in packages/spec/src/index.ts.
import { typingIndicatorSpec } from '../../../../../spec/src/components/typing-indicator.ts';
import { useReducedMotion } from 'motion/react';
import type { ComponentProps, CSSProperties, ReactNode } from 'react';
import { cx } from '../../../internal/cx.ts';
import { defineMessages, useLocale, useT } from '../../../i18n/index.ts';
import { Skeleton } from '../Skeleton/Skeleton.tsx';
import styles from './TypingIndicator.module.css';

export type { TypingAnnounce };

export type TypingIndicatorSize = 'sm' | 'md';

/**
 * TODO(i18n): move these into packages/react/src/i18n/messages.ts as
 * `typingOne` / `typingTwo` / `typingSeveral` / `typingMany` — they are listed
 * in the handoff. Defined locally for now so the catalog file stays owned by one
 * integrator.
 *
 * Four templates rather than one string with a plural rule: "Ana and Bo are
 * typing" is three translation problems at once (the conjunction, the verb
 * agreement, and the word order), and `typingText` already decides which of the
 * four applies without spelling any of them.
 */
const messages = defineMessages({
  typingOne: {
    en: '{first} is typing', es: '{first} está escribiendo', fr: '{first} est en train d’écrire',
    de: '{first} schreibt', ja: '{first} が入力中', pt: '{first} está digitando',
    zh: '{first} 正在输入', ar: '{first} يكتب الآن',
  },
  typingTwo: {
    en: '{first} and {last} are typing', es: '{first} y {last} están escribiendo',
    fr: '{first} et {last} sont en train d’écrire', de: '{first} und {last} schreiben',
    ja: '{first} と {last} が入力中', pt: '{first} e {last} estão digitando',
    zh: '{first} 和 {last} 正在输入', ar: '{first} و{last} يكتبان الآن',
  },
  typingSeveral: {
    en: '{names} are typing', es: '{names} están escribiendo', fr: '{names} sont en train d’écrire',
    de: '{names} schreiben', ja: '{names} が入力中', pt: '{names} estão digitando',
    zh: '{names} 正在输入', ar: '{names} يكتبون الآن',
  },
  typingMany: {
    en: '{first} and {count} others are typing', es: '{first} y {count} más están escribiendo',
    fr: '{first} et {count} autres sont en train d’écrire', de: '{first} und {count} weitere schreiben',
    ja: '{first} と他 {count} 人が入力中', pt: '{first} e mais {count} estão digitando',
    zh: '{first} 和其他 {count} 人正在输入', ar: '{first} و{count} آخرون يكتبون الآن',
  },
});

export interface TypingIndicatorProps extends Omit<ComponentProps<'div'>, 'children' | 'label'> {
  /** Who is typing, in the order they should be listed. Blank names are dropped. */
  names?: string[];
  /** How many names the row has room for; on overflow one slot goes to "and N others". */
  max?: number;
  /** Overrides the sentence entirely, for a caller with its own formatter. */
  label?: ReactNode;
  /** When the row speaks to assistive tech. */
  announce?: TypingAnnounce;
  size?: TypingIndicatorSize;
  /** Drops the label and shows only the dots. */
  dotsOnly?: boolean;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Overrides the sentence templates; merged over the kit's translations. */
  templates?: Partial<TypingTemplates>;
}

/** The stagger steps, resolved once: three dots, each one motion step behind the last. */
const DELAYS = typingDotDelays(TYPING_DOTS);

/** The stagger token the delays multiply, read from the spec rather than retyped. */
const STAGGER = typingIndicatorSpec.dimensions?.stagger ?? '$duration-fast';

/**
 * The travelling dots and the line naming who is typing.
 *
 * Two decisions carry this component, and both are about restraint.
 *
 * **The animation is decoration.** The words say who is typing; the dots only
 * say that it is happening now. So under reduced motion they stop dead rather
 * than degrading to something slower — a loop that runs for as long as somebody
 * is composing is exactly what that setting exists to switch off — and nothing
 * is lost, because the sentence was always the content.
 *
 * **The live region fires on the rising edge only.** Typing is the noisiest
 * state in a chat app: it flips on and off every few seconds as people pause,
 * and a region wired straight to it narrates "Ana is typing" for the length of a
 * conversation. The sentence captured when typing begins is HELD while anyone is
 * still typing (so a second person joining changes the visible text without
 * re-firing the region) and cleared when it stops (which announces nothing).
 * `announce="always"` is the opt-in for a one-to-one chat where every change
 * matters; `announce="never"` is for a surface that speaks the state some other
 * way. The dots themselves are aria-hidden — three animated elements inside a
 * live region is how a transcript starts stuttering.
 *
 * The sentence shape comes from `typingText` in @glacier/logic and the words
 * from the kit catalog, joined with `Intl.ListFormat`, so no English is built
 * into the component and a list reads correctly in every locale.
 */
export function TypingIndicator({
  names = [],
  max = 2,
  label,
  announce = 'start',
  size = 'md',
  dotsOnly = false,
  skeleton = false,
  templates,
  className,
  ...rest
}: TypingIndicatorProps) {
  const t = useT();
  const locale = useLocale();
  const reduce = useReducedMotion();

  const state: TypingState = typingText(names, max);
  const resolved: TypingTemplates = {
    one: t(messages.typingOne),
    two: t(messages.typingTwo),
    several: t(messages.typingSeveral),
    many: t(messages.typingMany),
    ...templates,
  };
  // Joining a list is locale work of its own — the comma and the final
  // conjunction differ per language — so it goes through Intl rather than a join.
  const sentence = formatTyping(state, resolved, (list) =>
    new Intl.ListFormat(locale, { style: 'long', type: 'conjunction' }).format(list),
  );

  const active = state.key !== 'none';
  const announcement = useTypingAnnouncement(sentence, active, announce);

  if (skeleton) {
    return (
      <div className={cx(styles.row, styles[size], className)} aria-hidden="true">
        <Skeleton variant="text" width="9ch" />
      </div>
    );
  }

  return (
    <div className={cx(styles.row, styles[size], className)} data-typing={active || undefined} {...rest}>
      {/* Decoration: the sentence beside them says everything they do. */}
      <span className={styles.dots} aria-hidden="true" data-static={reduce ? '' : undefined}>
        {DELAYS.map((step) => (
          <span
            key={step}
            className={styles.dot}
            style={{ '--typing-delay': `calc(var(--glacier-${STAGGER.slice(1)}) * ${step})` } as CSSProperties}
          />
        ))}
      </span>
      {!dotsOnly && (label ?? (active && <span className={styles.label}>{sentence}</span>))}
      {/*
        The one live region, held apart from the visible text so what is
        ANNOUNCED and what is SHOWN can differ: the label follows every change,
        the region speaks once.
      */}
      <span className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </span>
    </div>
  );
}
