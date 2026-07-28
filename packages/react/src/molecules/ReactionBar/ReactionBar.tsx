import { aggregateReactions, type Reaction } from '@glacier/logic';
import {
  moveGridCursor,
  optimisticReactions,
  splitReactions,
  REACTION_DISPLAY_CAP,
  type OptimisticReaction,
  type PendingReaction,
  type ReactionIntent,
} from '@glacier/logic';
import { reactionBarAddModes } from '@glacier/spec';
import { SmilePlus } from '@glacier/icons';
import { useEffect, useMemo, useRef, useState, type ComponentProps, type KeyboardEvent } from 'react';
import { cx } from '../../internal/cx.ts';
import { resolveDirection } from '../../internal/direction.ts';
import { useControlled } from '../../internal/useControlled.ts';
import { useT } from '../../i18n/LocaleProvider.tsx';
import { format } from '../../i18n/locale.ts';
import { reactionMessages } from '../../i18n/reactionMessages.ts';
import { FilterChip } from '../../atoms/inputs/FilterChip/FilterChip.tsx';
import { ReactionPill } from '../../atoms/inputs/ReactionPill/ReactionPill.tsx';
import styles from './ReactionBar.module.css';

export type ReactionBarAddMode = (typeof reactionBarAddModes)[number];

export interface ReactionBarProps extends Omit<ComponentProps<'div'>, 'onToggle'> {
  /** The raw records. Tallied through the shared aggregate, never recounted here. */
  reactions?: readonly Reaction[];
  /** Who is looking, so their own reactions paint as engaged. */
  viewerId?: string;
  /** Toggles the server has not acknowledged yet; folded into the tally. */
  pending?: readonly PendingReaction[];
  /** Pills shown before the tail folds. Defaults to the shared display cap. */
  cap?: number;
  /** Controlled: the overflow has been opened. */
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /** When the add-a-reaction chip is offered. */
  add?: ReactionBarAddMode;
  /** Called when the add chip is pressed. Omit it and the chip never renders. */
  onAdd?: () => void;
  /** Called with the emoji and the intent when a pill is pressed. */
  onToggle?: (emoji: string, intent: ReactionIntent) => void;
  size?: 'sm' | 'md';
  /** Turns an actorId into a display name for the pill's hover list. */
  resolveActor?: (actorId: string) => string;
}

/**
 * The row of reaction pills under a message, plus its way in to the picker.
 *
 * **Nothing means nothing.** With no reactions and no add chip this returns
 * `null` rather than an empty `div`: a zero-height box still consumes the
 * message stack's row gap, which is how a transcript ends up with unexplained
 * extra space under half its messages.
 *
 * **Many wraps, it does not scroll or truncate.** The bar flows onto as many
 * lines as it needs up to `cap`, and the tail past the cap folds into a "+N"
 * chip that expands in place. See `splitReactions` in commons for why the cut
 * is always the tail and never a re-sort.
 *
 * **One tab stop.** The pills are a roving-tabindex `toolbar`, not one tab stop
 * each: a transcript of fifty messages with six reactions apiece would otherwise
 * put three hundred stops between the reader and the composer. Arrows move
 * between pills, wrapping, and inverting under RTL.
 */
export function ReactionBar({
  reactions,
  viewerId,
  pending,
  cap = REACTION_DISPLAY_CAP,
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  add = 'auto',
  onAdd,
  onToggle,
  size = 'md',
  resolveActor,
  className,
  onKeyDown,
  ...rest
}: ReactionBarProps) {
  const t = useT();
  const barRef = useRef<HTMLDivElement>(null);
  const [cursor, setCursor] = useState(0);
  const [isExpanded, setExpanded] = useControlled(expanded, defaultExpanded);

  const summaries: OptimisticReaction[] = useMemo(
    () => optimisticReactions(aggregateReactions, reactions, pending, viewerId),
    [reactions, pending, viewerId],
  );

  const split = useMemo(() => splitReactions(summaries, cap), [summaries, cap]);
  const shown = isExpanded ? summaries : split.shown;
  const overflow = isExpanded ? 0 : split.overflow;

  // `auto` withholds the chip until the message already carries a reaction:
  // on a bare message the MessageActions cluster owns the react affordance, and
  // a permanent second plus under every row competes with it for the same job.
  const showAdd = onAdd !== undefined && (add === 'always' || (add === 'auto' && summaries.length > 0));

  // A shrinking bar must not strand the cursor past its last cell.
  const cells = shown.length + (overflow > 0 ? 1 : 0) + (showAdd ? 1 : 0);
  useEffect(() => {
    setCursor((c) => (c >= cells ? Math.max(0, cells - 1) : c));
  }, [cells]);

  if (cells === 0) return null;

  function focusCell(index: number) {
    const buttons = barRef.current?.querySelectorAll<HTMLElement>('button');
    buttons?.[index]?.focus();
  }

  function onBarKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const rtl = resolveDirection(barRef.current) === 'rtl';
    const next = moveGridCursor(cursor, event, cells, { rtl });
    // A key the cursor does not answer to (Enter, Space, Tab) must fall through
    // untouched, or the pill under it stops being pressable.
    if (next === cursor && !['Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    setCursor(next);
    focusCell(next);
  }

  const rove = (index: number) => ({ tabIndex: index === cursor ? 0 : -1 });

  return (
    <div
      ref={barRef}
      role="toolbar"
      aria-label={t(reactionMessages.reactionsLabel)}
      className={cx(styles.bar, className)}
      onKeyDown={onBarKeyDown}
      {...rest}
    >
      {shown.map((summary, index) => (
        <ReactionPill
          key={summary.emoji}
          emoji={summary.emoji}
          count={summary.count}
          reactedByViewer={summary.reactedByViewer}
          pending={summary.pending}
          actors={resolveActor ? summary.actors.map(resolveActor) : summary.actors}
          size={size}
          onToggle={onToggle}
          {...rove(index)}
        />
      ))}
      {overflow > 0 && (
        // A plain chip, not a pill: it is not an emoji and must never look
        // pressable-as-a-reaction. Expanding is the only thing it does.
        <FilterChip
          size={size}
          aria-label={format(t(reactionMessages.reactionsOverflow), { count: overflow })}
          data-reaction-overflow=""
          onSelectedChange={() => {
            setExpanded(true);
            onExpandedChange?.(true);
          }}
          {...rove(shown.length)}
        >
          {format(t(reactionMessages.reactionsOverflowShort), { count: overflow })}
        </FilterChip>
      )}
      {showAdd && (
        <FilterChip
          size={size}
          aria-label={t(reactionMessages.reactionAdd)}
          data-reaction-add=""
          icon={<SmilePlus size={14} />}
          onSelectedChange={() => onAdd?.()}
          {...rove(shown.length + (overflow > 0 ? 1 : 0))}
        />
      )}
    </div>
  );
}
