import type { ComponentSpec } from '../schema.ts';

/** object-fit values the image supports. */
export const imageFits = ['cover', 'contain', 'fill', 'none', 'scale-down'] as const;

/** Corner radius steps the image supports, from the radius scale. */
export const imageRadii = ['none', 'sm', 'md', 'lg', 'xl', '2xl', 'full'] as const;

export const imageSpec: ComponentSpec = {
  name: 'Image',
  id: 'image',
  category: 'atom',
  status: 'stable',
  summary:
    'A framed image with a fixed aspect ratio: it holds its box while loading, fits with object-fit, rounds its corners, and falls back on error.',
  element: 'img',
  anatomy: [
    { name: 'frame', description: 'The aspect-ratio box that clips and rounds the image.', required: true },
    { name: 'image', description: 'The image element itself.', required: true },
    { name: 'fallback', description: 'Shown when the source fails to load.' },
  ],
  props: [
    { name: 'src', type: 'string', required: true, description: 'Image source URL.' },
    { name: 'alt', type: 'string', required: true, description: 'Alternative text; pass an empty string for decorative images.' },
    { name: 'aspectRatio', type: 'string', description: 'Aspect ratio of the frame, e.g. "2 / 3" for a cover or 1 for a square (a number is allowed).' },
    { name: 'fit', type: 'enum', values: imageFits, default: 'cover', description: 'How the image fills its frame (object-fit).' },
    { name: 'radius', type: 'enum', values: imageRadii, default: 'md', description: 'Corner radius from the radius scale.' },
    { name: 'fallback', type: 'node', description: 'Rendered when the image fails to load; defaults to a muted broken-image glyph.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Render a placeholder with the frame geometry.' },
    { name: 'loading', type: 'enum', values: ['lazy', 'eager'], default: 'lazy', description: 'Native lazy/eager loading hint.' },
  ],
  defaults: { fit: 'cover', radius: 'md', skeleton: false, loading: 'lazy' },
  tokens: [
    'surface-sunken', 'text-subtle', 'duration-normal', 'ease-out',
    'radius-none', 'radius-sm', 'radius-md', 'radius-lg', 'radius-xl', 'radius-2xl', 'radius-full',
  ],
  a11y: {
    notes: [
      'alt is required; pass an empty string for purely decorative images.',
      'While the source loads a skeleton holds the frame; on error a muted broken-image glyph replaces it.',
    ],
  },
};
