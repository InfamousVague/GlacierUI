import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/** The scroll axis the container caps and fades along. */
export const scrollAreaOrientations = ['vertical', 'horizontal'] as const;

export const scrollAreaSpec: ComponentSpec = {
  name: 'ScrollArea',
  id: 'scroll-area',
  category: 'molecule',
  status: 'stable',
  summary:
    'A styled overflow container with a thin themed scrollbar and edge fade masks that appear only when there is more content to scroll in that direction.',
  element: 'div',
  anatomy: [
    { name: 'root', description: 'The wrapper that caps the viewport and carries the data-fade-start/end flags driving the masks.', required: true },
    { name: 'viewport', description: 'The focusable, keyboard-scrollable overflow region holding the content; masked at scrollable edges.', required: true },
    { name: 'fade', description: 'The CSS mask ramp dissolving the content toward a scrollable edge.' },
  ],
  props: [
    { name: 'maxHeight', type: 'string', description: 'Caps the viewport along the scroll axis (max-height when vertical, max-width when horizontal); a CSS length or pixel number.' },
    { name: 'orientation', type: 'enum', values: scrollAreaOrientations, default: 'vertical', description: 'Scroll axis; vertical fades top/bottom, horizontal fades left/right.' },
    { name: 'hideScrollbar', type: 'boolean', default: false, description: 'Hides the scrollbar entirely while every scroll input keeps working; the edge fades still signal the overflow.' },
    { name: 'children', type: 'node', description: 'The overflowing content.' },
    { name: 'className', type: 'string', description: 'Extra class on the root wrapper.' },
  ],
  defaults: { orientation: 'vertical', hideScrollbar: false },
  // fade width and scrollbar thickness are fixed on the space scale
  dimensions: {
    fade: token('space-6'),
    scrollbar: token('space-2'),
    radius: token('radius-full'),
  },
  states: [
    // the masks are untinted (a transparent-to-#000 mask-image ramp); their only
    // tokenized value is the fade width on the space scale
    { name: 'fade-start', description: 'Once scrolled off the start edge, a space-6-wide transparent-to-opaque mask ramp dissolves the leading edge to signal hidden content.', tokens: { fade: token('space-6') } },
    { name: 'fade-end', description: 'While more content remains, a space-6-wide transparent-to-opaque mask ramp dissolves the trailing edge; it clears at the end.', tokens: { fade: token('space-6') } },
    { name: 'focus-visible', description: 'A 2px inset accent ring on the keyboard-focused viewport.', tokens: { ring: token('focus-ring') } },
  ],
  // a 2px focus-ring outline inset into the viewport (offset -2px)
  focusRing: { ring: token('focus-ring'), offset: '-2px' },
  tokens: [
    'space-2', 'space-6',
    'font-sans', 'text',
    'border', 'border-strong',
    'radius-sm', 'radius-full', 'focus-ring',
  ],
  a11y: {
    role: 'group',
    focusable: true,
    keyboard: [
      { keys: 'ArrowUp, ArrowDown', action: 'Scrolls a vertical viewport when it holds keyboard focus.' },
      { keys: 'ArrowLeft, ArrowRight', action: 'Scrolls a horizontal viewport when it holds keyboard focus.' },
      { keys: 'PageUp, PageDown, Home, End', action: 'Scrolls by a page or to an end, per the platform default.' },
    ],
    notes: [
      'The viewport is a focusable role="group" so keyboard users can scroll it without a pointer.',
      'The edge fades are purely decorative (CSS masks) and expose no content or state to assistive tech.',
    ],
  },
  motion: {
    description: 'A scroll listener and ResizeObserver toggle the edge masks as content scrolls or the box resizes; there is no timed animation.',
  },
};
