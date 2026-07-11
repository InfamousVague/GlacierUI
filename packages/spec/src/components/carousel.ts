import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

export const carouselSpec: ComponentSpec = {
  name: 'Carousel',
  id: 'carousel',
  category: 'molecule',
  status: 'stable',
  summary:
    'A horizontal snap-scroll strip hosting arbitrary card children, with wheel/drag scroll and optional prev/next controls that appear when the strip overflows.',
  element: 'div',
  anatomy: [
    { name: 'root', description: 'The positioning wrapper that holds the scroller and any overlaid controls.', required: true },
    { name: 'scroller', description: 'The scroll-snapping role="group" track; each direct child is a snap target.', required: true },
    { name: 'control', description: 'A prev/next IconButton overlaid on the track edge, shown only while overflowing and disabled at the corresponding end.' },
  ],
  props: [
    { name: 'children', type: 'node', required: true, description: 'The card children laid out in the horizontal strip; each becomes a snap target.' },
    { name: 'showControls', type: 'boolean', default: false, description: 'Renders prev/next controls that appear when the strip overflows.' },
    { name: 'gap', type: 'token', default: '$space-4', description: 'Space between cards; any CSS length or a space token.' },
    { name: 'aria-label', type: 'string', description: 'Accessible name for the scrollable region.' },
    { name: 'className', type: 'string', description: 'Extra class on the root wrapper.' },
  ],
  defaults: { showControls: false, gap: '$space-4' },
  dimensions: {
    gap: token('space-4'),
    radius: token('radius-md'),
    controlShadow: token('shadow-3'),
  },
  // a 2px focus-ring outline around the scroller, offset 2px
  focusRing: { ring: token('focus-ring'), offset: '2px' },
  // the overlaid control slots ease opacity and visibility as overflow changes
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'space-1', 'space-4', 'radius-md', 'shadow-3',
    'focus-ring', 'duration-fast', 'ease-out',
  ],
  a11y: {
    role: 'group',
    focusable: true,
    keyboard: [
      { keys: 'Tab', action: 'Moves focus to the scroll region, then into its focusable card children.' },
      { keys: 'ArrowLeft, ArrowRight', action: 'Scrolls the focused region horizontally (native scroll-container behavior).' },
    ],
    notes: [
      'The track is a focusable role="group" so keyboard users can scroll it and reach off-screen cards.',
      'CSS scroll-snap gives tidy per-card stops; the scrollbar is visually hidden but scrolling stays available.',
      'Prev/next controls are aria-labelled IconButtons kept out of the tab order (the scroller itself is the keyboard entry point); they hide when nothing overflows and disable at each end.',
    ],
  },
  motion: {
    description: 'Paging and snap use smooth native scroll; the overlaid controls cross-fade as overflow appears and disappears.',
    transition: { speed: 'fast', ease: 'out' },
  },
};
