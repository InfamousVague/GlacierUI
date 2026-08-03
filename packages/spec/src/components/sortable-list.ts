import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/** How much room each row takes. */
export const sortableListSizes = ['sm', 'md', 'lg'] as const;

export const sortableListSpec: ComponentSpec = {
  name: 'SortableList',
  id: 'sortable-list',
  category: 'organism',
  status: 'draft',
  summary:
    'A list whose rows can be reordered by dragging a handle, or from the keyboard alone: lift with Space, move with the arrows, drop with Space.',
  element: 'ul',
  anatomy: [
    { name: 'list', description: 'The ordered container.', required: true },
    { name: 'item', description: 'One row: its handle, its content, and whatever the caller renders.', required: true },
    { name: 'handle', description: 'The grip that starts a drag. A dedicated target, so a row can hold text a user still needs to select.', required: true },
    { name: 'content', description: 'The row body, rendered by the caller.' },
    { name: 'ghost', description: 'The lifted row, raised and following the pointer.' },
    { name: 'live', description: 'The live region that announces each keyboard move.', required: true },
  ],
  props: [
    { name: 'items', type: 'array', required: true, item: { type: 'object', description: 'A row: id, and whatever else the renderer needs.' }, description: 'The rows in their current order. Controlled - the list reports a new order and the caller decides whether to take it.' },
    { name: 'onReorder', type: 'handler', required: true, description: 'Called with the reordered array once a drag is dropped or a keyboard move committed. Not called when an item is returned to where it started.' },
    { name: 'renderItem', type: 'handler', required: true, description: 'Renders one row\'s content. The handle and row chrome are the list\'s.' },
    { name: 'getLabel', type: 'handler', description: 'The name announced for a row as it moves. Defaults to the row\'s id, which is rarely what a person wants read aloud.' },
    { name: 'size', type: 'enum', values: sortableListSizes, default: 'md', description: 'Row height and padding step.' },
    { name: 'disabled', type: 'boolean', default: false, description: 'Freezes the order and drops every handle from the tab order.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders placeholder rows with the exact geometry.' },
  ],
  defaults: { size: 'md', disabled: false, skeleton: false },
  dimensions: {
    radius: token('radius-lg'),
    gap: token('space-1'),
    padding: token('space-3'),
    border: token('hairline'),
  },
  states: [
    { name: 'default', description: 'At rest, in the caller\'s order.' },
    {
      name: 'hover',
      description: 'The handle darkens on hover so the grip is discoverable before it is grabbed.',
      tokens: { background: token('surface-hover'), text: token('text') },
    },
    {
      name: 'dragging',
      description: 'The lifted row: raised off the list on a shadow, following the pointer, while the rows it passes slide into the gap it left.',
      tokens: { background: token('surface-raised'), border: token('accent-border'), shadow: token('shadow-3') },
    },
    {
      name: 'lifted',
      description: 'The keyboard equivalent of dragging: the row is held, the arrows move it, and Space drops it. Marked distinctly because there is no pointer to explain what is happening.',
      tokens: { border: token('accent-border'), background: token('accent-soft') },
    },
    { name: 'disabled', description: 'Halved opacity; handles leave the tab order entirely rather than being focusable and inert.' },
    { name: 'skeleton', description: 'Rows keep their exact height, so the list does not resize when the real content lands.' },
  ],
  paint: {
    background: token('surface'),
    text: token('text'),
    border: token('border'),
  },
  focusRing: { ring: token('accent-soft'), offset: '2px' },
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'surface', 'surface-raised', 'surface-hover', 'border', 'border-strong',
    'text', 'text-muted', 'text-subtle',
    'accent-soft', 'accent-border', 'shadow-3',
    'space-1', 'space-2', 'space-3', 'radius-lg', 'hairline',
    'font-size-sm', 'duration-fast', 'ease-out',
  ],
  a11y: {
    role: 'list',
    focusable: true,
    keyboard: [
      { keys: 'Tab', action: 'Moves between handles.' },
      { keys: 'Space, Enter', action: 'Lifts the row, and drops it once lifted.' },
      { keys: 'ArrowUp, ArrowDown', action: 'Moves a lifted row one slot, clamped at both ends.' },
      { keys: 'Home, End', action: 'Sends a lifted row to the top or the bottom.' },
      { keys: 'Escape', action: 'Cancels the lift and returns the row to where it started.' },
    ],
    notes: [
      'Reordering is fully operable from the keyboard, not only by dragging: lift, move, drop. A list that can only be sorted with a mouse cannot be sorted by everyone.',
      'Every move is announced in a live region, naming the row and its new position - the only feedback a non-sighted user gets that the drag did anything.',
      'The handle is a button with its own accessible name, so it is reachable and describable rather than being a decorative grip.',
      'Escape restores the original order, so an accidental lift is recoverable without having to count moves back.',
    ],
  },
  motion: {
    description: 'Rows slide to their new slots; the lifted row does not animate, since it is already tracking the pointer and easing it would make it lag the hand.',
    transition: { speed: 'fast', ease: 'out' },
  },
};
