/**
 * @glacier/native — ReactionBar.
 *
 * The React Native binding of @glacier/react's ReactionBar: the wrapping row of
 * reaction pills under a message, its "+N" overflow chip, and its way in to the
 * picker. The tally, the optimistic fold, the display cap, and the overflow
 * split all come from @glacier/logic, so a native transcript counts, caps, and
 * folds exactly as a DOM one does — none of that logic is re-derived here.
 *
 * Geometry (the space-1 gap on both axes and the space-1 clearance under the
 * bubble) is read from the reaction-bar spec through the shared resolvers.
 *
 * Web-parity notes (resting visuals only):
 * - **There is no hover and no keyboard here**, so the web's roving-tabindex
 *   toolbar has nothing to rove: React Native has no tab order and no arrow
 *   keys. The bar still reports itself as a labelled group so a screen reader
 *   announces "Reactions" before reading the pills, which is the part of the
 *   web toolbar semantics that does carry over.
 * - The bar WRAPS rather than scrolling, same as the web and for the same
 *   reason — a horizontal strip inside a vertically scrolling transcript is a
 *   gesture conflict, and it is worse on a touch screen than on a trackpad.
 */
import { View } from 'react-native';
import { aggregateReactions, type Reaction } from '@glacier/logic';
import {
  optimisticReactions,
  splitReactions,
  defaultReactionLabels,
  REACTION_DISPLAY_CAP,
  type OptimisticReaction,
  type PendingReaction,
  type ReactionIntent,
  type ReactionLabels,
} from '@glacier/logic';
// TODO(integration): switch to '@glacier/spec' once reaction-bar.ts is
// registered in packages/spec/src/index.ts.
import { reactionBarSpec, reactionBarAddModes } from '../../../../spec/src/components/reaction-bar.ts';
import { SmilePlus } from '@glacier/icons';
import { t } from '../../tokens.ts';
import { dimensionsFor } from '../../resolve.ts';
import { FilterChip } from '../../atoms/inputs/FilterChip.tsx';
import { ReactionPill } from './ReactionPill.tsx';

export type ReactionBarAddMode = (typeof reactionBarAddModes)[number];

export interface ReactionBarProps {
  reactions?: readonly Reaction[];
  viewerId?: string;
  pending?: readonly PendingReaction[];
  cap?: number;
  /** Controlled: the overflow has been opened and every pill shows. */
  expanded?: boolean;
  add?: ReactionBarAddMode;
  onExpandedChange?: (expanded: boolean) => void;
  onAdd?: () => void;
  onToggle?: (emoji: string, intent: ReactionIntent) => void;
  size?: 'sm' | 'md';
  resolveActor?: (actorId: string) => string;
  labels?: Partial<ReactionLabels>;
}

// Size-independent box metrics (the row/column gaps, the clearance) from the spec.
const BOX = dimensionsFor(reactionBarSpec);

function metric(value: string | undefined, fallback: string): string {
  const v = value ?? fallback;
  return /^[.\d]/.test(v) ? v : t(v);
}

/** Interpolates `{name}` placeholders, matching the kit catalog's `format`. */
function fill(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) => (key in params ? String(params[key]) : whole));
}

export function ReactionBar({
  reactions,
  viewerId,
  pending,
  cap = REACTION_DISPLAY_CAP,
  expanded = false,
  add = 'auto',
  onExpandedChange,
  onAdd,
  onToggle,
  size = 'md',
  resolveActor,
  labels,
}: ReactionBarProps) {
  const strings = { ...defaultReactionLabels, ...labels };

  const summaries: OptimisticReaction[] = optimisticReactions(aggregateReactions, reactions, pending, viewerId);
  const split = splitReactions(summaries, cap);
  const shown = expanded ? summaries : split.shown;
  const overflow = expanded ? 0 : split.overflow;

  // `auto` withholds the chip until the message already carries a reaction: on
  // a bare message the action cluster owns the react affordance.
  const showAdd = onAdd !== undefined && (add === 'always' || (add === 'auto' && summaries.length > 0));

  // Nothing means nothing: an empty View still eats the message stack's row
  // gap, which is how a transcript grows unexplained space under half its rows.
  if (shown.length === 0 && overflow === 0 && !showAdd) return null;

  return (
    <View
      accessibilityRole="toolbar"
      aria-label={strings.bar}
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        columnGap: metric(BOX.gap, 'space-1'),
        rowGap: metric(BOX.rowGap, 'space-1'),
        marginTop: metric(BOX.marginBlockStart, 'space-1'),
      }}
    >
      {shown.map((summary) => (
        <ReactionPill
          key={summary.emoji}
          emoji={summary.emoji}
          count={summary.count}
          reactedByViewer={summary.reactedByViewer}
          pending={summary.pending}
          actors={resolveActor ? summary.actors.map(resolveActor) : summary.actors}
          size={size}
          onToggle={onToggle}
        />
      ))}
      {overflow > 0 && (
        // A plain chip, not a pill: it is not an emoji and must never look
        // pressable-as-a-reaction.
        <FilterChip
          size={size}
          aria-label={fill(strings.overflow, { count: overflow })}
          onSelectedChange={() => onExpandedChange?.(true)}
        >
          {fill(strings.overflowShort, { count: overflow })}
        </FilterChip>
      )}
      {showAdd && (
        <FilterChip size={size} aria-label={strings.add} icon={<SmilePlus size={14} />} onSelectedChange={() => onAdd?.()}>
          {''}
        </FilterChip>
      )}
    </View>
  );
}
