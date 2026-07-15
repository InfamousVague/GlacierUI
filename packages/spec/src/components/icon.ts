import type { ComponentSpec } from '../schema.ts';

export const iconSpec: ComponentSpec = {
  name: 'Icon',
  id: 'icon',
  category: 'atom',
  status: 'stable',
  summary:
    'A single-glyph SVG drawn on a 24-unit grid that sizes from a pixel prop, strokes at a shared width, and inherits currentColor from the text around it.',
  element: 'svg',
  anatomy: [
    {
      name: 'glyph',
      description: 'The stroked paths of one icon, drawn on the shared 24 by 24 grid.',
      required: true,
    },
    {
      name: 'backfill',
      description: 'Optional IconBackfill wrapper: a 33%-opacity silhouette of the glyph itself, painted from the resolved icon color.',
    },
  ],
  props: [
    { name: 'size', type: 'number', default: 24, description: 'Rendered width and height in pixels; the glyph scales from the 24-unit grid.' },
    { name: 'color', type: 'string', default: 'currentColor', description: 'Stroke color; the default inherits the surrounding text color.' },
    { name: 'strokeWidth', type: 'number', default: 2, description: 'Stroke width in grid units, shared across the set for a consistent weight.' },
    { name: 'backfill', type: 'boolean', default: false, description: 'Wraps the glyph in IconBackfill, adding a 33%-opacity silhouette in the same resolved icon color.' },
    {
      name: 'absoluteStrokeWidth',
      type: 'boolean',
      default: false,
      description: 'Keeps the stroke at its pixel width instead of scaling it with size, so small renders do not thin out.',
    },
    { name: 'aria-label', type: 'string', description: 'Accessible name for a meaningful icon; decorative icons should be aria-hidden by the host instead.' },
  ],
  sizes: [
    { name: 'sm', diameter: '16px' },
    { name: 'md', diameter: '20px' },
    { name: 'lg', diameter: '24px' },
  ],
  defaults: { size: 24, color: 'currentColor', strokeWidth: 2, backfill: false, absoluteStrokeWidth: false },
  dimensions: { strokeWidth: '2px', backfillOpacity: '33%' },
  // strokes currentColor, so it carries no paint of its own
  paint: {},
  tokens: [],
  a11y: {
    focusable: false,
    notes: [
      'Icons are decorative by default: hosts wrap them in an aria-hidden slot so the label text carries the meaning.',
      'A standalone meaningful icon needs role="img" plus an aria-label.',
    ],
  },
};
