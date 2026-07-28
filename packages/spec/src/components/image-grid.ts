import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

export const imageGridSpec: ComponentSpec = {
  name: 'ImageGrid',
  id: 'image-grid',
  category: 'molecule',
  status: 'draft',
  summary:
    'The album layout for two or more photos sent together: two side by side, three as a banner over a pair, four as a 2x2, and past four a 2x2 whose last tile carries a "+N" count.',
  element: 'div',
  anatomy: [
    { name: 'grid', description: 'The mosaic itself: rows of tiles, gutters between them.', required: true },
    { name: 'row', description: 'One row of the mosaic; tiles inside it share the width.', required: true },
    { name: 'tile', description: 'One photo, cropped to its slot. An ImageAttachment in fill mode.', required: true },
    { name: 'overflow', description: 'The "+N" wash over the last tile when the album is larger than the mosaic.' },
  ],
  props: [
    {
      name: 'images',
      type: 'array',
      required: true,
      description: 'The album, in send order. One image renders as a single framed photo rather than a mosaic.',
      item: { type: 'object', description: 'A ChatAttachment with a url and, ideally, its intrinsic size.' },
    },
    {
      name: 'alts',
      type: 'array',
      description: 'Per-image alt text, positionally matched to images. A gap falls back to the file name.',
      item: { type: 'string', description: 'What the sender said this picture is.' },
    },
    { name: 'max', type: 'number', default: 4, description: 'How many tiles before the rest collapse into the count.' },
    { name: 'onOpen', type: 'handler', description: 'Called with the attachment and its index when a tile is activated.' },
    { name: 'labels', type: 'object', description: 'Localized strings for the album and its overflow tile.', fields: [
      { name: 'album', type: 'string', description: 'Names the group, with a {count} slot, e.g. "{count} photos".' },
      { name: 'image', type: 'string', description: 'Per-photo fallback when a tile has neither alt nor file name.' },
      { name: 'open', type: 'string', description: 'The open action, with a {name} slot.' },
      { name: 'more', type: 'string', description: 'The overflow tile, with a {count} slot, e.g. "{count} more photos".' },
    ] },
  ],
  defaults: { max: 4 },
  dimensions: {
    gap: token('space-1'),
    radius: token('radius-lg'),
  },
  states: [
    {
      name: 'overflow',
      description: 'The last tile is washed over and carries the remaining count, which is also its accessible name.',
      tokens: { wash: token('overlay'), text: token('accent-contrast') },
    },
  ],
  paint: {},
  tokens: ['space-1', 'radius-lg', 'overlay', 'accent-contrast', 'font-size-lg', 'font-weight-semibold'],
  a11y: {
    role: 'group',
    focusable: false,
    keyboard: [{ keys: 'Tab', action: 'Moves through the tiles in send order.' }],
    notes: [
      'The mosaic is one labelled group so a screen reader announces "4 photos" before walking into them, rather than reading four unrelated images.',
      'The overflow tile announces the count it hides, not the photo underneath it, since activating it opens the rest of the album.',
      'Tiling comes from imageGridLayout in @glacier/logic, so the DOM and native albums are the same mosaic rather than two near-misses.',
    ],
  },
};
