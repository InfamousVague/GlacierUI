import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/** Panel width steps, exported so the React kit derives its union from here. */
export const modalSizes = ['sm', 'md', 'lg', 'xl'] as const;

export const modalSpec: ComponentSpec = {
  name: 'Modal',
  id: 'modal',
  category: 'organism',
  status: 'stable',
  summary: 'A glass dialog rendered in a portal: springs open, traps focus, locks scroll, and dismisses on Escape or overlay press.',
  element: 'div',
  anatomy: [
    { name: 'overlay', description: 'The fixed, blurred backdrop that centers the panel; clicking it closes the modal.' },
    { name: 'panel', description: 'The glass dialog surface holding the header, body, and footer.', required: true },
    { name: 'close', description: 'A small IconButton pinned to the top-right corner that closes the modal.' },
    { name: 'header', description: 'Wraps the title and description; rendered only when either is supplied.' },
    { name: 'title', description: 'A level-2 Heading, labelling the dialog via aria-labelledby.' },
    { name: 'description', description: 'A muted Text line, describing the dialog via aria-describedby.' },
    { name: 'body', description: 'The children slot, the main dialog content.' },
    { name: 'footer', description: 'End-aligned action row, rendered only when footer content is supplied.' },
  ],
  props: [
    { name: 'open', type: 'boolean', required: true, description: 'Whether the modal is mounted and shown; renders nothing when false.' },
    { name: 'onClose', type: 'handler', required: true, description: 'Called when the user dismisses via Escape, the close button, or an overlay press.' },
    { name: 'title', type: 'node', description: 'Heading text shown in the header and used as the dialog label.' },
    { name: 'description', type: 'node', description: 'Supporting text shown under the title and used as the dialog description.' },
    { name: 'size', type: 'enum', values: modalSizes, default: 'md', description: 'Panel max-width step.' },
    { name: 'footer', type: 'node', description: 'Action row content pinned to the panel bottom, end-aligned.' },
    { name: 'children', type: 'node', description: 'The dialog body content.' },
  ],
  sizes: [
    { name: 'sm', diameter: '22rem' },
    { name: 'md', diameter: '28rem' },
    { name: 'lg', diameter: '36rem' },
    { name: 'xl', diameter: '48rem' },
  ],
  defaults: { size: 'md' },
  // panel padding, radius, and the internal gaps; sizes only vary the max-width
  dimensions: {
    radius: token('radius-2xl'),
    border: token('hairline'),
    overlayPadding: token('space-6'),
    panelPadding: token('space-8'),
    headerGap: token('space-2'),
    headerMargin: token('space-6'),
    footerGap: token('space-3'),
    footerMargin: token('space-8'),
  },
  states: [
    { name: 'open', description: 'Overlay fades in and the panel springs up from scale 0.95, y 12; body scroll is locked and focus moves into the panel.', tokens: { overlay: token('overlay'), background: token('glass-thick') } },
    { name: 'overlay-hover', description: 'The blurred backdrop; pressing it anywhere outside the panel calls onClose.' },
  ],
  tokens: [
    'space-2', 'space-3', 'space-4', 'space-6', 'space-8', 'space-10', 'space-16',
    'overlay', 'blur-sm', 'blur-lg', 'glass-thick', 'glass-border', 'glass-highlight', 'glass-saturate',
    'hairline', 'radius-2xl', 'shadow-5', 'text', 'font-sans',
  ],
  a11y: {
    role: 'dialog',
    focusable: true,
    keyboard: [
      { keys: 'Escape', action: 'Closes the modal.' },
      { keys: 'Tab, Shift+Tab', action: 'Cycles focus within the panel, wrapping at the first and last focusable elements.' },
    ],
    notes: [
      'The panel sets aria-modal="true" and role="dialog".',
      'aria-labelledby points to the title and aria-describedby to the description, each only when supplied.',
      'Rendered into document.body via a portal.',
      'Tab focus is trapped inside the panel; the panel itself takes focus on open.',
      'Body scroll is locked while open and focus is restored to the opener on close.',
      'The close button carries aria-label="Close".',
    ],
  },
  motion: {
    description: 'The panel springs up on a snappy spring while the overlay fades over 150ms; closing is instant. Both respect reduced motion.',
    transition: { spring: 'snappy' },
  },
};
