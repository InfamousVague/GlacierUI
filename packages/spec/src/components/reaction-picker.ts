import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

export const reactionPickerSpec: ComponentSpec = {
  name: 'ReactionPicker',
  id: 'reaction-picker',
  category: 'molecule',
  status: 'draft',
  summary:
    'The emoji chooser: a frequently-used row over a searchable grid. The emoji set is a prop with a small sensible default — shipping a full 3,600-glyph Unicode dataset is a data problem, not a design-system one.',
  element: 'div',
  anatomy: [
    { name: 'panel', description: 'The picker body. Unpainted: the host popover or sheet owns the surface.', required: true },
    { name: 'search', description: 'The SearchField that narrows the grid. The panel\'s first tab stop.' },
    { name: 'frequent', description: 'The frequently-used row, hidden the moment a query is typed — a "frequent" shortcut is noise once you have said what you want.' },
    { name: 'grid', description: 'The emoji grid, in the order the set was given.', required: true },
    { name: 'cell', description: 'One emoji button, named by its emoji name so it is reachable by voice and legible to a screen reader.', required: true },
    { name: 'empty', description: 'The line shown when a query matches nothing.' },
  ],
  props: [
    {
      name: 'emojis',
      type: 'array',
      item: {
        type: 'object',
        description: 'One choosable emoji and the words that find it.',
        fields: [
          { name: 'emoji', type: 'string', required: true, description: 'The glyph.' },
          { name: 'name', type: 'string', required: true, description: 'Its name, also the cell\'s accessible name.' },
          { name: 'keywords', type: 'array', item: { type: 'string', description: 'One search term.' }, description: 'Extra search terms.' },
        ],
      },
      description:
        'The choosable set. A prop, not a bundled dataset: a real picker wants a localised, skin-toned, versioned emoji table that an app owns and updates, and freezing one inside a design system would be wrong within a release. Defaults to a ~40-glyph starter set.',
    },
    { name: 'frequent', type: 'array', item: { type: 'string', description: 'One glyph.' }, description: 'The frequently-used row, as glyphs. Defaults to the shared eight; an app should pass the viewer\'s own.' },
    { name: 'columns', type: 'number', default: 8, description: 'Grid width. Also the arrow-key stride, so the two can never disagree.' },
    { name: 'query', type: 'string', description: 'Controlled search text.' },
    { name: 'defaultQuery', type: 'string', default: '', description: 'Initial search text when uncontrolled.' },
    { name: 'onQueryChange', type: 'handler', description: 'Called with the new search text.' },
    { name: 'onSelect', type: 'handler', description: 'Called with the chosen glyph.' },
    { name: 'reacted', type: 'array', item: { type: 'string', description: 'One glyph.' }, description: 'Glyphs the viewer has already used on this message; their cells report aria-pressed.' },
    { name: 'labels', type: 'object', description: 'Translated strings; merged over the shared English defaults.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the panel\'s exact geometry.' },
  ],
  defaults: { columns: 8, defaultQuery: '', skeleton: false },
  dimensions: {
    /** Between the search field, the frequent row, and the grid. */
    gap: token('space-2'),
    padding: token('space-2'),
    radius: token('radius-lg'),
    /** Between cells, both axes. */
    cellGap: token('space-1'),
    /** One cell's square edge — a comfortable touch target that still fits eight across a phone. */
    cellSize: token('control-height-md'),
    cellRadius: token('radius-md'),
  },
  // The panel is transparent: it lives inside a Popover, Menu, or sheet, and
  // painting a second surface inside one is how a picker ends up double-framed.
  paint: {},
  states: [
    { name: 'default', description: 'The frequent row over the full grid, nothing queried.' },
    { name: 'hover', description: 'A cell washes with the hover fill so the target is unambiguous at a glance.', tokens: { background: token('hover') } },
    {
      name: 'reacted',
      description: 'A glyph the viewer already used on this message reports aria-pressed and carries the accent tint, so the picker shows what choosing it will undo.',
      tokens: { background: token('accent-soft'), text: token('accent-text') },
    },
    { name: 'focus-visible', description: 'A 2px focus ring on the cell.', tokens: { ring: token('focus-ring') } },
    { name: 'empty', description: 'No match. A single quiet line, not an illustration: the fix is to retype, and a large empty state pushes the grid off screen.', tokens: { text: token('text-subtle') } },
    { name: 'skeleton', description: 'The grid loads as a block of cell-shaped bones, so the panel does not resize when the set arrives.' },
  ],
  focusRing: { ring: token('focus-ring'), offset: '2px' },
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'space-1', 'space-2', 'radius-lg', 'radius-md', 'control-height-md',
    'hover', 'accent-soft', 'accent-text', 'text-subtle', 'focus-ring', 'duration-fast', 'ease-out',
  ],
  a11y: {
    role: 'group',
    focusable: false,
    keyboard: [
      { keys: 'Tab', action: 'Search field, then the frequent row, then the grid. Three stops, not one per glyph.' },
      { keys: 'ArrowLeft, ArrowRight', action: 'Moves one cell along the row, wrapping. Inverted under RTL.' },
      { keys: 'ArrowUp, ArrowDown', action: 'Moves one row up or down within the grid, clamping at the ends.' },
      { keys: 'Home, End', action: 'Jumps to the first or last cell.' },
      { keys: 'Enter, Space', action: 'Chooses the focused glyph.' },
    ],
    notes: [
      'Every cell is named by its emoji NAME, not the glyph. Screen readers announce an unlabelled emoji inconsistently and voice control cannot say a picture, so "thumbs up" is both the label and the command.',
      'The grid is a roving-tabindex group: forty tab stops inside a popover would make Escape the only usable way out.',
      'Typing in the search field never moves focus into the grid, so a query can be corrected without losing the caret.',
    ],
  },
  motion: {
    description: 'Cells scale on press only. The grid never animates as it filters — rows shifting under a reader mid-search is worse than an instant swap.',
    press: true,
    transition: { speed: 'fast', ease: 'out' },
  },
};
