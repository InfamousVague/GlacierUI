import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

export const virtualListSpec: ComponentSpec = {
  name: 'VirtualList',
  id: 'virtual-list',
  category: 'organism',
  status: 'draft',
  summary:
    'Renders only the rows a scroller can actually show, so a list of a hundred thousand costs the same as a list of twenty.',
  element: 'div',
  anatomy: [
    { name: 'viewport', description: 'The scrolling box. Its height is what decides how many rows exist at once.', required: true },
    { name: 'canvas', description: 'A spacer as tall as the whole list, so the scrollbar describes the data rather than the window.', required: true },
    { name: 'window', description: 'The rendered slice, offset to sit where its rows belong.', required: true },
    { name: 'row', description: 'One rendered row, at the fixed item height.', required: true },
    { name: 'empty', description: 'What shows when there are no rows at all.' },
  ],
  props: [
    { name: 'count', type: 'number', required: true, description: 'How many rows there are in total. The list never receives the data itself — only how much of it there is.' },
    { name: 'itemSize', type: 'number', required: true, description: 'Height of one row in pixels. Every row is this tall; variable heights are out of scope by design.' },
    { name: 'renderItem', type: 'handler', required: true, description: 'Renders the row at an index. Called only for rows inside the window.' },
    { name: 'height', type: 'string', description: 'Viewport height. Defaults to filling its parent, which is usually what a full-page list wants.' },
    { name: 'overscan', type: 'number', default: 3, description: 'Extra rows rendered beyond each edge, so a row does its mount work before it is visible rather than during the frame that scrolls it in.' },
    { name: 'onVisibleChange', type: 'handler', description: 'Called with the first and last rendered index whenever the window moves. Useful for paging in more data.' },
    { name: 'getKey', type: 'handler', description: 'A stable key for the row at an index. Defaults to the index, which is fine for a static list and wrong for one that reorders.' },
    { name: 'emptyLabel', type: 'node', description: 'Shown when count is zero.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders placeholder rows at the exact item height.' },
  ],
  defaults: { overscan: 3, skeleton: false },
  dimensions: {
    radius: token('radius-lg'),
    border: token('hairline'),
  },
  states: [
    { name: 'default', description: 'Scrolled anywhere, with the window covering the viewport plus its overscan.' },
    {
      name: 'empty',
      description: 'No rows at all, said in one quiet line rather than an empty scrolling box.',
      tokens: { text: token('text-subtle') },
    },
    { name: 'skeleton', description: 'Placeholder rows at the real item height, so the scrollbar and the row rhythm are already correct before the data lands.' },
  ],
  paint: {
    background: token('surface'),
    text: token('text'),
    border: token('border'),
  },
  focusRing: { ring: token('accent-soft'), offset: '2px' },
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'surface', 'surface-hover', 'border', 'text', 'text-subtle',
    'space-2', 'space-3', 'radius-lg', 'hairline',
    'font-size-sm', 'accent-soft', 'duration-fast', 'ease-out',
  ],
  a11y: {
    role: 'listbox',
    focusable: true,
    keyboard: [
      { keys: 'ArrowUp, ArrowDown', action: 'Scrolls by a row, as the native scroller does.' },
      { keys: 'PageUp, PageDown', action: 'Scrolls by a viewport.' },
      { keys: 'Home, End', action: 'Jumps to the first or last row.' },
    ],
    notes: [
      'Rows carry aria-setsize and aria-posinset naming the position in the WHOLE list, not the window — without them a screen reader announces "row 3 of 12" while the user is at item 40,000.',
      'The viewport is the scroll container and takes focus, so keyboard scrolling works without every row being tabbable.',
      'Only windowed rows exist in the DOM. Anything that must be findable by browser find-in-page or reachable by Tab does not belong in a virtualized list.',
      'The spacer preserves the true scroll height, so the scrollbar communicates how much data there is rather than how much is rendered.',
    ],
  },
  motion: {
    description: 'Nothing animates. The window is replaced as the scroller moves, and easing rows into place would smear them against a scroll the user is driving directly.',
    transition: { speed: 'fast', ease: 'out' },
  },
};
