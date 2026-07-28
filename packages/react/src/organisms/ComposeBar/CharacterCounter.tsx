import type { ComponentProps } from 'react';
import { characterCounterState, type CharacterCounterLevel } from '@glacier/logic';
import { cx } from '../../internal/cx.ts';
import { useT } from '../../i18n/LocaleProvider.tsx';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import { composeMessages } from './messages.ts';
import styles from './CharacterCounter.module.css';

export type { CharacterCounterLevel };

export interface CharacterCounterProps extends ComponentProps<'span'> {
  /** Characters used. Count them with countCharacters, not String.length. */
  length: number;
  /** The cap. Zero or less turns the counter off entirely. */
  limit: number;
  /** Fraction of the limit at which the counter appears. */
  threshold?: number;
  /** Keeps it visible from the first character, for a hard external cap. */
  showAlways?: boolean;
  skeleton?: boolean;
  className?: string;
}

/**
 * The remaining-characters readout.
 *
 * **Meter was the first thing checked, and it does not cover this.** Meter is a
 * row of discrete pips with `role="meter"`, built to answer "how full or how
 * good is this" — password strength, quota, health. A character counter is a
 * countdown whose two defining behaviours a meter cannot have: it goes NEGATIVE
 * once the message is over the limit, and it is absent for the whole first
 * three quarters of a message. A meter that renders -3, or that unmounts, is no
 * longer a meter. So this is its own two-line atom rather than a Meter bent out
 * of shape.
 *
 * It counts DOWN. What the user has to act on is how much room is left, not how
 * much has been used, and it appears only near the limit — a number that is
 * always on is a number nobody reads, and it turns a chat box into a form.
 */
export function CharacterCounter({
  length,
  limit,
  threshold,
  showAlways = false,
  skeleton = false,
  className,
  ...rest
}: CharacterCounterProps) {
  const t = useT();
  const { level, remaining, visible } = characterCounterState(length, limit, { threshold, showAlways });

  if (skeleton) return <Skeleton variant="text" width="2.5rem" className={className} />;
  // Not an empty box: no box. Reserving space for a counter that is not there
  // shifts the controls beside it the moment it appears.
  if (!visible) return null;

  const label =
    remaining < 0
      ? t(composeMessages.charactersOver, { count: -remaining })
      : t(composeMessages.charactersLeft, { count: remaining });

  return (
    // Polite, so it is spoken as it changes without interrupting typing. The
    // visible text is the bare number; the units live in the accessible name so
    // the readout stays one short token beside the send control.
    <span role="status" aria-label={label} className={cx(styles.counter, className)} data-level={level} {...rest}>
      <span aria-hidden="true">{remaining}</span>
    </span>
  );
}
