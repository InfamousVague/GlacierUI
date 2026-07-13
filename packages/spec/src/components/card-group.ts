import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/** Layout modes, exported so bindings derive their union from the contract. */
export const cardGroupModes = ['grid', 'list'] as const;

/** Gap steps, exported so bindings derive their union from the contract. */
export const cardGroupGaps = ['sm', 'md', 'lg'] as const;

/** Density steps, exported so bindings derive their union from the contract. */
export const cardGroupDensities = ['comfortable', 'compact'] as const;

export const cardGroupSpec: ComponentSpec = {
  name: 'CardGroup',
  id: 'card-group',
  category: 'layout',
  status: 'stable',
  summary:
    'A layout shelf for repeated card surfaces: a responsive auto-fill grid with a stable minimum card width, or a single-column list, with token-driven gaps and a geometry-preserving skeleton.',
  element: 'div',
  anatomy: [
    {
      name: 'group',
      description: 'The CSS grid container; a plain div with no implicit role.',
      required: true,
    },
    {
      name: 'item',
      description:
        'Implicit: each direct child becomes one grid item. In grid mode items share the auto-fill tracks; in list mode they stack full-width. Every item is floored at min-width 0 so long content cannot blow a track open.',
    },
  ],
  props: [
    {
      name: 'mode',
      type: 'enum',
      values: cardGroupModes,
      default: 'grid',
      description:
        'Layout mode. grid lays cards on repeat(auto-fill, minmax(...)) columns that keep a stable minimum width and wrap responsively; list stacks them in a single column.',
    },
    {
      name: 'minItemWidth',
      type: 'string',
      default: '16rem',
      description:
        'The minimum card width in grid mode, as a CSS length. Feeds the --card-group-min custom property; ignored in list mode.',
    },
    {
      name: 'gap',
      type: 'enum',
      values: cardGroupGaps,
      default: 'md',
      description: 'Space between cards, from the token scale: sm space-3, md space-4, lg space-6.',
    },
    {
      name: 'density',
      type: 'enum',
      values: cardGroupDensities,
      default: 'comfortable',
      description:
        'Rhythm control; compact tightens the chosen gap one space step (sm space-2, md space-3, lg space-4).',
    },
    {
      name: 'skeleton',
      type: 'boolean',
      default: false,
      description:
        'Renders skeletonCount rounded placeholder cards in the same tracks, so the grid geometry holds while content loads.',
    },
    {
      name: 'skeletonCount',
      type: 'number',
      default: 6,
      description: 'How many placeholder cards the skeleton renders.',
    },
    {
      name: 'children',
      type: 'node',
      description: 'The cards, or any repeated surfaces; omitted entirely when the skeleton grid stands in.',
    },
  ],
  defaults: {
    mode: 'grid',
    minItemWidth: '16rem',
    gap: 'md',
    density: 'comfortable',
    skeleton: false,
    skeletonCount: 6,
  },
  dimensions: {
    gapSm: token('space-3'),
    gapMd: token('space-4'),
    gapLg: token('space-6'),
    compactGapSm: token('space-2'),
    compactGapMd: token('space-3'),
    compactGapLg: token('space-4'),
    // Geometry values genuinely off the token scale.
    minItemWidth: '16rem',
    skeletonItemHeight: '8rem',
    skeletonItemRadius: token('radius-xl'),
  },
  states: [
    {
      name: 'grid',
      description:
        'The default responsive mode: grid-template-columns: repeat(auto-fill, minmax(min(100%, var(--card-group-min)), 1fr)). Every card keeps at least minItemWidth (clamped to the container so nothing overflows a narrow parent), leftover space distributes evenly across the row, and cards wrap to new rows as the container narrows. Pure layout, zero paint of its own.',
      behavioral: true,
    },
    {
      name: 'list',
      description:
        'A single minmax(0, 1fr) column: cards stack full-width in source order with the same token-driven gap. Pure layout, zero paint of its own.',
      behavioral: true,
    },
    {
      name: 'skeleton',
      description:
        'skeletonCount rounded rect placeholders (radius-xl, 8rem tall) fill the same tracks as the live cards, so columns and gaps do not shift when content arrives. The whole group is aria-hidden.',
    },
  ],
  // the grouped cards paint
  paint: {},
  tokens: ['space-2', 'space-3', 'space-4', 'space-6', 'radius-xl'],
  a11y: {
    focusable: false,
    notes: [
      'Renders a plain div with no role: it is purely visual layout and adds no semantics over its children.',
      'When the content is semantically a list, the consumer adds role="list" to the group and role="listitem" to each child (or renders list markup inside); CardGroup never assumes it.',
      'Reading order and keyboard order follow source order in both modes; grid mode only wraps rows, it never reorders.',
      'The skeleton branch is aria-hidden; mark the surrounding region aria-busy at the app level while loading.',
    ],
  },
};
