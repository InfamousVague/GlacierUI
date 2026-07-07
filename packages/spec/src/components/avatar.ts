import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/** Size steps, exported so the React kit derives its union from here. */
export const avatarSizes = ['sm', 'md', 'lg', 'xl'] as const;

/** Shapes, exported so the React kit derives its union from here. */
export const avatarShapes = ['circle', 'rounded'] as const;

export const avatarSpec: ComponentSpec = {
  name: 'Avatar',
  id: 'avatar',
  category: 'atom',
  status: 'stable',
  summary: 'A square profile image that falls back to initials, then a blank placeholder, in four sizes and two shapes.',
  element: 'span',
  anatomy: [
    { name: 'image', description: 'The src image, object-fit cover, shown when src is set and has not errored.' },
    { name: 'initials', description: 'Up to two uppercased word-initials of name, shown when there is no image.' },
    { name: 'placeholder', description: 'A blank sunken fill, shown when there is neither image nor name.' },
  ],
  props: [
    { name: 'src', type: 'string', description: 'Image URL; falls back to initials then placeholder on error.' },
    { name: 'alt', type: 'string', description: 'Image alt text; defaults to name then empty string.' },
    { name: 'name', type: 'string', description: 'Person name; source of the up-to-two-letter initials fallback.' },
    { name: 'size', type: 'enum', values: avatarSizes, default: 'md', description: 'Size step.' },
    { name: 'shape', type: 'enum', values: avatarShapes, default: 'circle', description: 'Circle or rounded-square.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
    { name: 'glass', type: 'boolean', default: false, description: 'Renders the frosted glass material instead of a solid surface.' },
  ],
  sizes: [
    { name: 'sm', diameter: '1.75rem', fontSize: token('font-size-xs') },
    { name: 'md', diameter: '2.25rem', fontSize: token('font-size-sm') },
    { name: 'lg', diameter: '3rem', fontSize: token('font-size-md') },
    { name: 'xl', diameter: '4rem', fontSize: token('font-size-lg') },
  ],
  defaults: { size: 'md', shape: 'circle', skeleton: false, glass: false },
  dimensions: { radius: token('radius-full') },
  states: [
    { name: 'image', description: 'src present and not errored; renders the img.' },
    { name: 'errored', description: 'img onError falls the component through to the initials or placeholder branch.' },
    { name: 'initials', description: 'No image but a name; renders up to two uppercased initials on an accent-soft fill.', tokens: { background: token('accent-soft'), text: token('accent-text') } },
    { name: 'placeholder', description: 'Neither image nor name; a blank sunken fill, aria-hidden.', tokens: { background: token('surface-sunken') } },
  ],
  tokens: [
    'surface-sunken', 'accent-soft', 'accent-text', 'radius-full', 'radius-md',
    'font-sans', 'font-weight-semibold', 'font-size-xs', 'font-size-sm', 'font-size-md', 'font-size-lg',
  ],
  a11y: {
    focusable: false,
    notes: [
      'The initials wrapper carries aria-label={name}; the initials text itself is presentational.',
      'The blank placeholder is aria-hidden.',
      'A rounded shape uses radius-md; the default circle uses radius-full.',
    ],
  },
};
