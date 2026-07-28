import type { ComponentProps, ReactNode } from 'react';
import {
  defaultTranscriptLabels,
  transcriptDayLabel,
  type TranscriptDayLabel,
  type TranscriptLabels,
} from '@glacier/logic';
import {
  dateSeparatorVariants,
  // TODO(integration): switch to '@glacier/spec' once date-separator.ts is
  // registered in packages/spec/src/index.ts.
} from '../../../../spec/src/components/date-separator.ts';
import { cx } from '../../internal/cx.ts';
import styles from './MessageList.module.css';

// Derived from the spec so the variant union cannot drift from the native kit.
export type DateSeparatorVariant = (typeof dateSeparatorVariants)[number];

export interface DateSeparatorProps extends Omit<ComponentProps<'div'>, 'children'> {
  /** The spelled day. Supply this, or supply `at` and let the row spell it. */
  label?: ReactNode;
  /** The day, epoch millis. Ignored when `label` is given. */
  at?: number;
  /** Instant `at` is read against; injectable so the row renders deterministically. */
  now?: number;
  /** BCP-47 tag for the date formatter. */
  locale?: string;
  /** Translated strings, merged over the shared English defaults. */
  labels?: Partial<TranscriptLabels>;
  /** Rule sits the label on a hairline; chip floats it as a pill. */
  variant?: DateSeparatorVariant;
  /**
   * Pins the row to the scroll viewport's top edge while its day passes.
   *
   * MessageList sets this for you; it is exposed because a caller rendering
   * their own day rows through `renderDay` needs the same switch.
   */
  sticky?: boolean;
}

/**
 * Spells a day label.
 *
 * `today` and `yesterday` come from the catalog rather than from `Intl`:
 * `RelativeTimeFormat` can produce both, but it produces them in the casing and
 * register the CLDR data happens to carry ("today", "aujourd'hui"), and a kit
 * whose date rows disagree with the rest of the app's capitalisation is a kit
 * every app patches around. Everything below those two rungs is a genuine date,
 * where `Intl` is exactly right and a catalog would be absurd.
 */
function spell(day: TranscriptDayLabel, locale: string | undefined, labels: TranscriptLabels): string {
  if (day.kind === 'today') return labels.today;
  if (day.kind === 'yesterday') return labels.yesterday;
  return new Intl.DateTimeFormat(locale, day.format).format(new Date(day.at));
}

/**
 * The day divider in a transcript.
 *
 * It is a named `separator`, not a heading. A long transcript holds hundreds of
 * these, and a screen reader's heading list is a navigation aid for the page —
 * filling it with three months of dates buries the headings that were actually
 * worth jumping to. The visible text is hidden from assistive tech and the day
 * rides on `aria-label`, because nothing about `role="separator"` promises that
 * a reader will announce the element's contents.
 *
 * Sticky positioning is a real behavioural difference between the two bindings
 * rather than a styling detail; the native file's header says exactly what it
 * does and does not reproduce.
 */
export function DateSeparator({
  label,
  at,
  now,
  locale,
  labels,
  variant = 'rule',
  sticky = false,
  className,
  ...rest
}: DateSeparatorProps) {
  const text = { ...defaultTranscriptLabels, ...labels };
  const spelled =
    label ?? (at === undefined ? '' : spell(transcriptDayLabel(at, now ?? Date.now()), locale, text));

  return (
    <div
      role="separator"
      // A separator cannot be named by its own text, so the name is explicit and
      // the text is decoration. `String` rather than the node, because a caller
      // may pass an element and an aria-label must be a string.
      aria-label={typeof spelled === 'string' ? spelled : undefined}
      className={cx(styles.day, sticky && styles.sticky, className)}
      data-variant={variant}
      data-sticky={sticky || undefined}
      {...rest}
    >
      <span className={styles.dayRule} aria-hidden="true" />
      <span className={styles.dayLabel} aria-hidden="true">
        {spelled}
      </span>
      <span className={styles.dayRule} aria-hidden="true" />
    </div>
  );
}
