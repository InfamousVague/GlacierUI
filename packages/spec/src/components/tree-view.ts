import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

export const treeViewSpec: ComponentSpec = {
  name: 'TreeView',
  id: 'tree-view',
  category: 'organism',
  status: 'stable',
  summary:
    'A hierarchical list of expandable rows - like a file explorer or a chapter outline - with animated branches, single selection, and full WAI-ARIA tree keyboard navigation.',
  element: 'ul',
  anatomy: [
    { name: 'tree', description: 'The role="tree" root list that owns the roving tabindex.', required: true },
    { name: 'row', description: 'A role="treeitem" row: chevron slot, optional icon, label, optional trailing slot; indented by its depth.', required: true },
    { name: 'chevron', description: 'The rotating disclosure glyph on parent rows; leaf rows keep the empty slot so labels align.' },
    { name: 'icon', description: 'Optional leading glyph inside a row.' },
    { name: 'trailing', description: 'Optional trailing content inside a row, such as a counter.' },
    { name: 'group', description: 'The role="group" branch list a parent expands; animates its height open and closed.' },
  ],
  props: [
    {
      name: 'items',
      type: 'array',
      required: true,
      description: 'The tree rows, nested via children.',
      item: {
        type: 'object',
        description: 'One row of the tree.',
        fields: [
          { name: 'id', type: 'string', required: true, description: 'Unique id for the row, reported by selection and expansion.' },
          { name: 'label', type: 'node', required: true, description: 'Content rendered as the row label.' },
          { name: 'icon', type: 'node', description: 'Leading glyph, hidden from assistive tech.' },
          { name: 'trailing', type: 'node', description: 'Trailing content such as a counter badge.' },
          { name: 'disabled', type: 'boolean', description: 'Skipped by arrow navigation and unselectable.' },
          { name: 'children', type: 'array', description: 'Child rows; their presence makes the row an expandable parent.', item: { type: 'object', description: 'A nested row with the same shape.' } },
        ],
      },
    },
    { name: 'expandedIds', type: 'array', description: 'Controlled list of expanded parent ids.', item: { type: 'string', description: 'An expanded parent id.' } },
    { name: 'defaultExpandedIds', type: 'array', description: 'Initially expanded parent ids when uncontrolled.', item: { type: 'string', description: 'An expanded parent id.' } },
    { name: 'onExpandedChange', type: 'handler', description: 'Called with the next full list of expanded ids whenever a parent toggles.' },
    { name: 'selectedId', type: 'string', description: 'Controlled selected row id (single-select).' },
    { name: 'defaultSelectedId', type: 'string', description: 'Initially selected row id when uncontrolled.' },
    { name: 'onSelect', type: 'handler', description: 'Called with the id of the row that becomes selected.' },
    { name: 'aria-label', type: 'string', required: true, description: 'Accessible name for the tree.' },
    { name: 'glass', type: 'boolean', default: false, description: 'Renders the frosted glass material behind the tree.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the component exact geometry.' },
  ],
  defaults: { glass: false, skeleton: false },
  dimensions: {
    radius: token('radius-md'),
    gap: token('space-2'),
    paddingInline: token('space-3'),
    paddingBlock: token('space-1'),
    indent: token('space-4'),
  },
  states: [
    { name: 'selected', description: 'The single selected row wears the accent soft tint with accent text at medium weight; its chevron inherits the accent text color.', paint: { background: token('accent-soft'), text: token('accent-text') }, tokens: { weight: token('font-weight-medium') } },
    { name: 'hover', description: 'Pointer over an enabled, unselected row washes to the hover background and full text color.', paint: { background: token('hover'), text: token('text') } },
    { name: 'disabled', description: 'Halved opacity (0.5), not-allowed cursor, skipped by arrow navigation, and unselectable.' },
  ],
  // 2px focus-ring outline inset into the row (outline-offset: -2px), painted
  // on the row rather than the whole subtree the li owns
  paint: { text: '$text-muted' },
  focusRing: { ring: token('focus-ring'), offset: '-2px' },
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'space-1', 'space-2', 'space-3', 'space-4',
    'font-sans', 'font-size-sm', 'font-weight-medium',
    'radius-md', 'radius-lg', 'hairline',
    'text', 'text-muted', 'text-subtle', 'hover', 'accent-soft', 'accent-text',
    'glass-regular', 'glass-border', 'glass-highlight', 'blur-md', 'glass-saturate',
    'focus-ring', 'duration-fast', 'ease-out',
  ],
  a11y: {
    role: 'tree',
    focusable: true,
    keyboard: [
      { keys: 'ArrowDown, ArrowUp', action: 'Moves focus to the next or previous visible row, skipping disabled rows.' },
      { keys: 'ArrowRight', action: 'Expands a collapsed parent; on an expanded parent, moves focus to its first child.' },
      { keys: 'ArrowLeft', action: 'Collapses an expanded parent; otherwise moves focus to the parent row.' },
      { keys: 'Home, End', action: 'Moves focus to the first or last visible row.' },
      { keys: 'Enter, Space', action: 'Selects the focused row; on a parent row, also toggles its expansion.' },
    ],
    notes: [
      'The root is a role="tree" list of role="treeitem" rows with role="group" branch lists; parents expose aria-expanded and every row carries aria-level, aria-setsize, and aria-posinset.',
      'One roving tabindex spans the visible rows: exactly one row sits in the tab order, initially the selected row or the first enabled row.',
      'Selection is single-select and reported through aria-selected; disabled rows are dimmed, skipped by arrows, and unselectable.',
      'Clicking a parent row both toggles its branch and selects it.',
    ],
  },
  motion: {
    description: 'Branches animate their height open and closed and the chevron rotates on a token transition; respects reduced motion.',
    transition: { speed: 'fast', ease: 'out' },
  },
};
