import {
  formatReactionLabel,
  reactionIntent,
  reactionLabelState,
  type ReactionIntent,
  type ReactionLabelKey,
} from '@glacier/logic';
import type { MouseEvent } from 'react';
import { cx } from '../../../internal/cx.ts';
import { useT } from '../../../i18n/LocaleProvider.tsx';
import { reactionMessages } from '../../../i18n/reactionMessages.ts';
import { FilterChip, type FilterChipProps } from '../FilterChip/FilterChip.tsx';
import styles from './ReactionPill.module.css';

export type { ReactionIntent };

/** The four accessible-name templates, overridable per pill. */
export type ReactionPillLabels = Partial<Record<ReactionLabelKey, string>>;

export interface ReactionPillProps
  extends Omit<
    FilterChipProps,
    // `onToggle` is the DOM's own ToggleEvent handler on <button>; ours reports
    // a reaction intent, so the DOM one is dropped rather than widened.
    'children' | 'count' | 'icon' | 'selected' | 'defaultSelected' | 'onSelectedChange' | 'onToggle'
  > {
  /** The glyph, compared as-is; the caller owns any normalisation. */
  emoji: string;
  /** How many people reacted with it. */
  count: number;
  /** The viewer is one of them. Paints the engaged state and flips the intent. */
  reactedByViewer?: boolean;
  /** An add or remove is in flight. Lowers emphasis; never disables. */
  pending?: boolean;
  /** Who reacted, as display names. Shown as the native hover title. */
  actors?: readonly string[];
  /** Overrides the whole accessible name, when a host has already built one. */
  label?: string;
  /** Overrides individual name templates; merged over the translated defaults. */
  labels?: ReactionPillLabels;
  /** Called with the emoji and what the press is asking for. */
  onToggle?: (emoji: string, intent: ReactionIntent) => void;
}

/**
 * One emoji and its tally on a message, as a toggle.
 *
 * **This is a FilterChip, not a new atom.** FilterChip already is the kit's
 * toggled chip: a `button` with `aria-pressed`, the accent-soft engaged fill,
 * the capsule geometry, the press dip, and the focus ring. A reaction pill is
 * that chip with a different label and a different tally, so it composes rather
 * than duplicating — the alternative was a second capsule that would have drifted
 * from the first the first time either was restyled.
 *
 * Two things are deliberately NOT delegated. FilterChip's `count` prop renders a
 * CounterBadge, which is a pill inside a pill; a reaction reads as one unit
 * ("👍 3"), so the glyph and count are passed as a single child instead. And the
 * accessible name is built here rather than falling out of the content, because
 * a button named "👍" tells a screen-reader user neither how many people agreed
 * nor whether pressing it will add or take back their own reaction.
 *
 * Fully controlled: `reactedByViewer` is the truth and `onToggle` reports the
 * intent. There is no uncontrolled path, because the state belongs to a server.
 */
export function ReactionPill({
  emoji,
  count,
  reactedByViewer = false,
  pending = false,
  actors,
  label,
  labels,
  onToggle,
  disabled,
  className,
  onClick,
  ...rest
}: ReactionPillProps) {
  const t = useT();
  const intent = reactionIntent({ emoji, count, reactedByViewer, actors: [] });

  const state = reactionLabelState({ emoji, count, reactedByViewer, actors: [] });
  const templates: Record<ReactionLabelKey, string> = {
    one: labels?.one ?? t(reactionMessages.reactionOne),
    other: labels?.other ?? t(reactionMessages.reactionOther),
    oneByViewer: labels?.oneByViewer ?? t(reactionMessages.reactionOneByViewer),
    otherByViewer: labels?.otherByViewer ?? t(reactionMessages.reactionOtherByViewer),
  };

  return (
    <FilterChip
      // Controlled through the tally; the chip never owns this state.
      selected={reactedByViewer}
      disabled={disabled}
      aria-label={label ?? formatReactionLabel(state, templates)}
      // The bar finds its pills by this rather than by class, so a roving
      // tabindex keeps working through a host's own className.
      data-reaction-pill=""
      data-emoji={emoji}
      data-pending={pending || undefined}
      title={actors && actors.length > 0 ? actors.join(', ') : undefined}
      className={cx(styles.pill, className)}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (disabled) return;
        onToggle?.(emoji, intent);
      }}
      {...rest}
    >
      {/* One child: the chip's own gap must not open up between a glyph and
          the number that belongs to it. Both halves are hidden from assistive
          tech — the label above already spells them, and announcing them again
          as loose text is how a pill ends up read as "👍 3 👍 3 reactions". */}
      <span className={styles.body} aria-hidden="true">
        <span className={styles.emoji}>{emoji}</span>
        <span className={styles.count}>{count}</span>
      </span>
    </FilterChip>
  );
}
