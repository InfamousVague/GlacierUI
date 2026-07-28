import { motion, useReducedMotion } from 'motion/react';
import { Ease, Speed, pressTap, transition } from '@glacier/motion';
import { ChevronDown } from '@glacier/icons';
import type { ComponentProps } from 'react';
import {
  defaultTranscriptLabels,
  formatTranscriptLabel,
  type TranscriptLabels,
} from '@glacier/logic';
import { cx } from '../../internal/cx.ts';
import { CounterBadge } from '../../atoms/display/CounterBadge/CounterBadge.tsx';
import styles from './MessageList.module.css';

export interface ScrollToLatestProps
  extends Omit<ComponentProps<typeof motion.button>, 'children' | 'aria-label'> {
  /**
   * Whether it is on screen.
   *
   * Decided by `shouldShowScrollToLatest` in @glacier/logic, never here: when
   * a jump control appears is a product decision that a phone and a browser must
   * agree on, and a component that decided it for itself would be the place the
   * two quietly diverged.
   */
  visible?: boolean;
  /** Unread messages waiting below. Zero renders the button bare. */
  count?: number;
  /** Cap on the badge, past which it reads `${max}+`. */
  max?: number;
  /** Accessible name; the count is folded into it. */
  label?: string;
  /** Translated strings, merged over the shared English defaults. */
  labels?: Partial<TranscriptLabels>;
}

/**
 * The floating jump-to-latest control.
 *
 * It renders nothing at all while hidden rather than fading to zero opacity.
 * An invisible control that keeps its place in the tab order is a trap: a
 * keyboard user lands on something no sighted user can point at, and a screen
 * reader announces a button that is not there. The cost is that there is no exit
 * animation — which is no cost, because the reader who made it disappear did so
 * by scrolling to the newest message, and is looking at that, not at this
 * corner.
 *
 * A raised surface rather than a solid accent fill: it floats over other
 * people's messages, and a saturated disc there competes with the conversation
 * it is a footnote to. The badge is where the urgency goes.
 */
export function ScrollToLatest({
  visible = false,
  count = 0,
  max = 99,
  label,
  labels,
  className,
  ...rest
}: ScrollToLatestProps) {
  const reduce = useReducedMotion();
  const text = { ...defaultTranscriptLabels, ...labels };

  if (!visible) return null;

  // The count is part of the name, not a separate announcement: a reader who
  // hears "Scroll to latest messages" and then a stray "12" has to work out for
  // themselves what was being counted.
  const name =
    count > 0
      ? `${label ?? text.scrollToLatest}, ${formatTranscriptLabel(text.newMessageCount, { count })}`
      : (label ?? text.scrollToLatest);

  return (
    <span className={styles.latest}>
      <motion.button
        type="button"
        aria-label={name}
        className={cx(styles.latestButton, className)}
        data-count={count > 0 ? count : undefined}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={pressTap('compact', reduce ?? false)}
        transition={transition(Speed.Fast, Ease.Out)}
        {...rest}
      >
        <ChevronDown size="var(--glacier-size-sm)" aria-hidden="true" />
      </motion.button>
      {count > 0 && (
        // Decorative: the number is already in the button's name, and a badge
        // that also announced it would say it twice.
        <span className={styles.latestBadge} aria-hidden="true">
          <CounterBadge count={count} max={max} size="sm" />
        </span>
      )}
    </span>
  );
}
