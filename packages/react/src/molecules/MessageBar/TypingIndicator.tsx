import { formatTyping, typingText, type TypingTemplates } from '@glacier/logic';
// re-exported from packages/spec/src/index.ts.
import { typingIndicatorSpec } from '@glacier/spec';
import { dimensionsFor } from '@glacier/logic';
import type { CSSProperties, ComponentProps } from 'react';
import { cx } from '../../internal/cx.ts';
import { useLocale, useT } from '../../i18n/LocaleProvider.tsx';
import { kitMessages } from '../../i18n/messages.ts';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import styles from './MessageBar.module.css';

export type { TypingTemplates };

/** The spec's measurements, read once; a bare number passes through unwrapped. */
const DIMS = dimensionsFor(typingIndicatorSpec);

function metric(value: string | undefined, fallback: string): string {
  const resolved = value ?? fallback;
  return /^[.\d]/.test(resolved) ? resolved : `var(--glacier-${resolved})`;
}

const VARS = {
  '--typing-gap': metric(DIMS.gap, 'space-2'),
  '--typing-dot-size': metric(DIMS.dotSize, '4px'),
  '--typing-dot-gap': metric(DIMS.dotGap, 'space-1'),
} as CSSProperties;

export interface TypingIndicatorProps extends Omit<ComponentProps<'div'>, 'children'> {
  /** Who is typing, as display names. */
  names: string[];
  /** How many names the row has room for. */
  max?: number;
  /** Draws the animated dots beside the sentence. */
  dots?: boolean;
  /** Translated sentences, one per shape, merged over the kit catalog. */
  templates?: Partial<TypingTemplates>;
  /** Renders a placeholder at the row's exact height. */
  skeleton?: boolean;
}

/**
 * The row that says who is typing.
 *
 * It takes names, never a sentence. "Ana and Bo are typing" is three
 * translation problems at once - the conjunction, the verb agreement, and the
 * word order, none of which survive a naive join in Japanese or Arabic - so the
 * count chooses a template in @glacier/logic and the catalog supplies the
 * words. `Intl.ListFormat` joins the names, because joining a list is itself
 * locale work.
 *
 * Nobody typing renders nothing at all rather than an empty line: a row that
 * reserved its height would make the composer jump by a line every time someone
 * paused, which is the most distracting thing a typing indicator can do.
 */
export function TypingIndicator({
  names,
  max = 2,
  dots = true,
  templates,
  skeleton = false,
  className,
  style,
  ...rest
}: TypingIndicatorProps) {
  const t = useT();
  const locale = useLocale();

  if (skeleton) {
    return (
      <div className={cx(styles.typing, className)} style={{ ...VARS, ...style }} {...rest}>
        <Skeleton variant="text" width="12ch" />
      </div>
    );
  }

  const state = typingText(names, max);
  const resolved: TypingTemplates = {
    one: t(kitMessages.messageBarTypingOne),
    two: t(kitMessages.messageBarTypingTwo),
    several: t(kitMessages.messageBarTypingSeveral),
    many: t(kitMessages.messageBarTypingMany),
    ...templates,
  };
  const text = formatTyping(state, resolved, (list) => joinNames(list, locale));

  if (state.key === 'none' || text === '') return null;

  return (
    <div
      className={cx(styles.typing, className)}
      style={{ ...VARS, ...style }}
      data-typing={state.key}
      // Polite, never assertive: somebody starting to type is not an
      // interruption, and a thread of five people would otherwise talk over
      // whatever the reader was already being told.
      aria-live="polite"
      {...rest}
    >
      {dots && (
        // Decoration - the sentence beside them is the whole content.
        <span className={styles.dots} aria-hidden="true">
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
        </span>
      )}
      <span>{text}</span>
    </div>
  );
}

/**
 * Joins names the way the reader's language joins a list.
 *
 * `Intl.ListFormat` is absent from a few older engines, so its absence degrades
 * to the plain comma a caller who had not thought about it would have written -
 * which is the same default `formatTyping` carries.
 */
function joinNames(list: string[], locale: string): string {
  const ListFormat = (Intl as { ListFormat?: new (locale?: string, options?: { style: string; type: string }) => { format(items: string[]): string } }).ListFormat;
  if (ListFormat === undefined) return list.join(', ');
  return new ListFormat(locale, { style: 'long', type: 'conjunction' }).format(list);
}
