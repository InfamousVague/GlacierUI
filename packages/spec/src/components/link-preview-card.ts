import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/** How the card arranges its image against its text. */
export const linkPreviewLayouts = ['media', 'compact'] as const;

export const linkPreviewCardSpec: ComponentSpec = {
  name: 'LinkPreviewCard',
  id: 'link-preview-card',
  category: 'molecule',
  status: 'draft',
  summary:
    'The unfurled preview of a link in a message: the og:image, the title, a two-line description, and the domain that published it. With no image it becomes a compact row rather than leaving a hole where the picture would have been.',
  element: 'a',
  anatomy: [
    { name: 'card', description: 'The whole preview, one link.', required: true },
    { name: 'media', description: 'The og:image at the Open Graph ratio; absent in the compact layout.' },
    { name: 'title', description: 'The page title, clamped to two lines.', required: true },
    { name: 'description', description: 'The og:description, clamped to two lines.' },
    { name: 'domain', description: 'The publishing domain, stripped of protocol, credentials, port, and www.', required: true },
  ],
  props: [
    { name: 'url', type: 'string', required: true, description: 'Where the card goes, and what the domain line is derived from.' },
    { name: 'title', type: 'node', description: 'The page title. Without one the domain carries the card.' },
    { name: 'description', type: 'node', description: 'The page summary, clamped to two lines.' },
    { name: 'image', type: 'string', description: 'og:image URL. Omitted, the card drops to the compact layout — a leading glyph beside the text, no reserved media box.' },
    {
      name: 'layout',
      type: 'enum',
      values: linkPreviewLayouts,
      description: 'Overrides the layout the presence of an image would pick. Media without an image still reserves the box, which is what a hole looks like — so it is a deliberate choice, not a default.',
    },
    { name: 'onOpen', type: 'handler', description: 'Called when the card is activated, alongside following the href.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder while the unfurl is being fetched.' },
    { name: 'labels', type: 'object', description: 'Localized strings for the card.', fields: [
      { name: 'link', type: 'string', description: 'Names the card when there is no title, e.g. "Link".' },
    ] },
  ],
  defaults: { skeleton: false },
  dimensions: {
    radius: token('radius-lg'),
    gap: token('space-1'),
    border: token('hairline'),
    padding: token('space-3'),
    glyphSize: token('size-md'),
  },
  states: [
    {
      name: 'hover',
      description: 'The surface lifts to the hover fill and the title takes the accent, so a card the size of a paragraph still reads as one link.',
      paint: { background: token('hover') },
      tokens: { title: token('accent-text') },
    },
    { name: 'skeleton', description: 'A media box, a title line, and two description lines at the card\'s final geometry.' },
  ],
  paint: { background: '$surface-sunken', text: '$text', border: '$border-subtle' },
  focusRing: { ring: token('focus-ring'), offset: '2px' },
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'surface-sunken', 'hover', 'border-subtle', 'hairline', 'focus-ring',
    'radius-lg', 'radius-md', 'space-1', 'space-2', 'space-3', 'size-md',
    'text', 'text-muted', 'text-subtle', 'accent-text',
    'font-size-sm', 'font-size-xs', 'duration-fast', 'ease-out',
  ],
  a11y: {
    role: 'link',
    focusable: true,
    keyboard: [{ keys: 'Enter', action: 'Follows the link.' }],
    notes: [
      'The card is one link, not a stack of them: the title, image, and domain are one destination, and three tab stops to the same place is three times the work.',
      'Its name is the title plus the domain, so the destination is announced rather than just "link".',
      'The og:image is decorative — it illustrates a page the title already names, so alt text on it would announce the same thing twice.',
      'The domain is shown because a preview is publisher-supplied text: seeing where it actually goes is the reader\'s only defence against a title that lies.',
    ],
  },
  motion: {
    description: 'The surface and title cross-fade on hover at the fast duration; nothing moves, since a card that shifts under the pointer is a card that gets mis-clicked.',
    transition: { speed: 'fast', ease: 'out' },
  },
};
