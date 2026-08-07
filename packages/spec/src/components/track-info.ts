import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/**
 * Artwork footprints, from a row chip up to a now-playing cover, plus `fill` -
 * where the height is not the art's to choose. On a strip the row is as tall as
 * the controls beside it, and a cover that picks its own size either floats in
 * the gap or sets the height of chrome that was measured for something else.
 */
export const trackInfoSizes = ['sm', 'md', 'lg', 'fill'] as const;

/** How the text column sits against the artwork beside it. */
export const trackInfoAligns = ['start', 'center'] as const;

export const trackInfoSpec: ComponentSpec = {
  name: 'TrackInfo',
  id: 'track-info',
  category: 'molecule',
  status: 'draft',
  summary:
    'What is playing, as one block: album art beside the title, album, and artist, each line stepping down in quietness - and the first two in size - so the order is legible before a word is read.',
  element: 'div',
  anatomy: [
    { name: 'artwork', description: 'Album art on the leading edge, held square and sized by the size step.' },
    { name: 'lines', description: 'The text column beside it.', required: true },
    { name: 'title', description: 'What is playing, in the full text colour, a step below the page\'s type.' },
    { name: 'subtitle', description: 'A second line, one step down in size and quietness.' },
    { name: 'album', description: 'A third line, quieter again at the same size - the scale has no smaller step.' },
  ],
  props: [
    {
      name: 'artwork',
      type: 'node',
      description:
        'Album art. Held square and sized by the size step; omit it and the text column takes the whole block.',
    },
    { name: 'title', type: 'node', description: 'What is playing.' },
    { name: 'subtitle', type: 'node', description: 'A second line, usually the album.' },
    { name: 'album', type: 'node', description: 'A third line, usually the artist or source.' },
    {
      name: 'size',
      type: 'enum',
      values: trackInfoSizes,
      default: 'md',
      description:
        'The artwork footprint: a chip in a dense row, a thumbnail in a strip, a cover on a now-playing surface, or fill to take the height of whatever holds it.',
    },
    {
      name: 'align',
      type: 'enum',
      values: trackInfoAligns,
      default: 'center',
      description:
        'How the text column sits against the artwork. Centre reads right when the art is the taller of the two; start when the lines run past it.',
    },
    {
      name: 'skeleton',
      type: 'boolean',
      default: false,
      description:
        "Loads each line as its own placeholder at its own width, so the block holds the shape it will settle into rather than collapsing to one bar.",
    },
  ],
  defaults: { size: 'md', align: 'center', skeleton: false },
  sizes: [
    { name: 'sm', diameter: '2rem', gap: token('space-2') },
    { name: 'md', diameter: '2.5rem', gap: token('space-3') },
    { name: 'lg', diameter: '4rem', gap: token('space-3') },
    // The one size with no measurement of its own: it is whatever it is given,
    // held square by its aspect ratio rather than by a width.
    { name: 'fill', diameter: '100%', gap: token('space-3') },
  ],
  dimensions: {
    gap: token('space-3'),
    lineGap: token('space-0'),
    radius: token('radius-md'),
  },
  states: [
    {
      name: 'default',
      description:
        'Three lines, each a step quieter than the last and the first two a step smaller. A line too long for the block ellipsizes rather than wrapping, so the row height never depends on the track name.',
    },
    {
      name: 'skeleton',
      description:
        "One bone per line at that line's own width, with a square bone standing in for the cover - a loading block is the same block, unfilled.",
    },
  ],
  paint: { text: token('text') },
  tokens: [
    'space-0', 'space-2', 'space-3', 'radius-md',
    'text', 'text-muted', 'text-subtle',
    'font-size-sm', 'font-size-xs',
  ],
  a11y: {
    focusable: false,
    notes: [
      'Text, not a control: it carries no role of its own, so the surface around it stays the thing a screen reader announces.',
      'The artwork is decorative - the title beside it already names the track, so an alt would be read twice.',
      'Truncation is visual only; the full string stays in the document for a screen reader to read out.',
    ],
  },
};
