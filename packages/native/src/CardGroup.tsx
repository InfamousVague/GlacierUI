/*
 * CardGroup — a titled/repeating layout shelf for card surfaces, rendered with
 * React Native primitives. The web version is a real CSS grid
 * (`repeat(auto-fill, minmax(min(100%, var(--card-group-min)), 1fr))`) or a
 * single-column list. React Native has no CSS grid, so grid mode is EMULATED
 * with a flex-wrap row plus per-child cells that carry the track width (the same
 * mechanism <Grid> uses); see the note by `cell` below. Prop names + defaults
 * (mode='grid', minItemWidth='16rem', gap='md', density='comfortable') match
 * @glacier/react's CardGroup so the docs Web/Native toggle compares 1:1, and
 * every gap/geometry value is read from cardGroupSpec through the shared
 * resolvers so it cannot drift from CardGroup.module.css.
 */

import { Children, type ReactNode } from 'react';
import { View, type ViewProps, type Style } from 'react-native';
import { cardGroupModes, cardGroupGaps, cardGroupDensities, cardGroupSpec } from '@glacier/spec';
import { t } from './tokens.ts';
import { dimensionsFor } from './resolve.ts';
import { Skeleton } from './Skeleton.tsx';

// Derived from the spec so the unions cannot drift from the web kit.
/** grid wraps cards on auto-fill columns; list stacks them in one column. */
export type CardGroupMode = (typeof cardGroupModes)[number];

/** The token-driven gap steps between cards. */
export type CardGroupGap = (typeof cardGroupGaps)[number];

/** compact tightens the chosen gap one space step. */
export type CardGroupDensity = (typeof cardGroupDensities)[number];

export interface CardGroupProps extends Omit<ViewProps, 'style' | 'children'> {
  /**
   * Layout mode. grid lays cards on auto-fill columns floored at `minItemWidth`
   * that wrap responsively; list stacks them in a single column.
   */
  mode?: CardGroupMode;
  /**
   * The minimum card width in grid mode, e.g. '16rem'. Drives each cell's
   * flexBasis; ignored in list mode.
   */
  minItemWidth?: string;
  /** Space between cards, from the token scale. */
  gap?: CardGroupGap;
  /** compact tightens the chosen gap one space step. */
  density?: CardGroupDensity;
  /** Renders placeholder cards so the grid geometry holds while loading. */
  skeleton?: boolean;
  /** How many placeholder cards the skeleton renders. */
  skeletonCount?: number;
  /** The cards, or any repeated surfaces. */
  children?: ReactNode;
  /** Web-only: CSS class name. Accepted but no-op on native. */
  className?: string;
  /** Escape hatch: a flat style object merged last (mirrors the web's `style`). */
  style?: Style;
}

// Size-independent metrics read once from the spec. The gap keys resolve to bare
// token names (space-2..space-6) that get wrapped by t(); the raw geometry
// lengths (minItemWidth '16rem', skeletonItemHeight '8rem') pass through as-is.
const DIMS = dimensionsFor(cardGroupSpec);

// The gap token per density × step, mirroring the CSS `--card-group-gap` cascade:
// comfortable → sm/md/lg = space-3/4/6; compact tightens one step to space-2/3/4.
const GAP_TOKEN: Record<CardGroupDensity, Record<CardGroupGap, string | undefined>> = {
  comfortable: { sm: DIMS.gapSm, md: DIMS.gapMd, lg: DIMS.gapLg },
  compact: { sm: DIMS.compactGapSm, md: DIMS.compactGapMd, lg: DIMS.compactGapLg },
};

const GAP_FALLBACK: Record<CardGroupDensity, Record<CardGroupGap, string>> = {
  comfortable: { sm: 'space-3', md: 'space-4', lg: 'space-6' },
  compact: { sm: 'space-2', md: 'space-3', lg: 'space-4' },
};

/**
 * A layout shelf for repeated surfaces such as Cards and StatTiles, rendered
 * with React Native primitives. In grid mode it lays each child in a flex cell
 * whose `flexBasis` is `minItemWidth` and that grows to share leftover space and
 * wraps to a new row once another `minItemWidth` track no longer fits — a close
 * analogue of `auto-fill` that reflows with no media queries. In list mode it
 * stacks children full-width in a single column. Purely visual: it renders a
 * plain <View> with no role, so add list semantics on top when the content is
 * semantically a list.
 *
 * Web-parity notes / deliberate reductions:
 * - There is no CSS grid on native, so the responsive auto-fill grid is emulated
 *   with flexWrap + per-child cells (see `cell`). Each cell can shrink below
 *   `minItemWidth` (flexShrink 1, minWidth 0), matching the web's
 *   `min(100%, var(--card-group-min))` clamp so a card never overflows a narrow
 *   parent.
 * - The skeleton branch renders the resting placeholder only: the web sweeps a
 *   highlight band across each Skeleton (an opacity pulse under reduced motion);
 *   the native Skeleton is a static tinted block at the exact geometry, so
 *   columns and gaps still hold when the real cards arrive.
 * - `className` and the DOM `data-gap`/`data-density` hooks are web-only and
 *   accepted-but-noop; the gap is resolved to a token here instead. `style`
 *   passes through to the container as an escape hatch (applied last so it wins).
 */
export function CardGroup({
  mode = 'grid',
  minItemWidth = '16rem',
  gap = 'md',
  density = 'comfortable',
  skeleton = false,
  skeletonCount = 6,
  className: _className,
  style,
  children,
  ...rest
}: CardGroupProps) {
  const isList = mode === 'list';
  const gapToken = t(GAP_TOKEN[density][gap] ?? GAP_FALLBACK[density][gap]);

  // The grid/list container. A wrapping flex row emulates the auto-fill grid; a
  // column stacks the list. `gap` applies to both axes when wrapping; `stretch`
  // matches CSS grid's default cross-axis behavior (equal-height cells per row).
  const container: Style = {
    flexDirection: isList ? 'column' : 'row',
    flexWrap: isList ? 'nowrap' : 'wrap',
    alignItems: 'stretch',
    minWidth: 0,
    gap: gapToken,
  };

  // Per-child cell carries the track sizing (the web renders children directly
  // as grid items; the cell wrapper is the mechanism RN needs to size a track).
  // Grid: flexBasis floored at `minItemWidth`, growing to fill and wrapping
  // below it. List: full-width, floored at zero so long content never blows out.
  const cell: Style = isList
    ? { minWidth: 0 }
    : { flexGrow: 1, flexShrink: 1, flexBasis: minItemWidth, minWidth: 0 };

  if (skeleton) {
    // Placeholder cards fill the same tracks as the live children, so columns
    // and gaps do not shift when the real cards arrive. The whole group is
    // aria-hidden, matching the web; mark the region aria-busy at the app level.
    const count = Math.max(1, skeletonCount);
    return (
      <View aria-hidden={true} {...rest} style={[container, style as never]}>
        {Array.from({ length: count }, (_, i) => (
          <View key={i} style={cell}>
            <Skeleton
              variant="rect"
              width="100%"
              height={DIMS.skeletonItemHeight ?? '8rem'}
              radius={t(DIMS.skeletonItemRadius ?? 'radius-xl')}
            />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View {...rest} style={[container, style as never]}>
      {Children.toArray(children).map((child, i) => (
        <View key={i} style={cell}>
          {child}
        </View>
      ))}
    </View>
  );
}
