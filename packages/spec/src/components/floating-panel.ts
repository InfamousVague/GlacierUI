import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

export const floatingPanelSpec: ComponentSpec = {
  name: 'FloatingPanel',
  id: 'floating-panel',
  category: 'organism',
  status: 'stable',
  summary:
    'A draggable, dismissable non-modal floating glass panel: a header grab-bar with a title and close button that you drag to move, portalled to the body and clamped to the viewport.',
  element: 'div',
  anatomy: [
    { name: 'panel', description: 'The portalled role="dialog" glass surface, positioned with fixed top/left.', required: true },
    { name: 'handle', description: 'The header grab-bar; a pointer-drag on it moves the panel.', required: true },
    { name: 'title', description: 'The heading shown in the grab-bar; labels the dialog.', required: true },
    { name: 'close', description: 'The trailing close IconButton that dismisses the panel.', required: true },
    { name: 'body', description: 'The scrollable content region beneath the handle.' },
  ],
  props: [
    { name: 'open', type: 'boolean', required: true, description: 'Whether the panel is shown; it unmounts when false.' },
    { name: 'title', type: 'node', required: true, description: 'Title rendered in the drag handle bar; labels the dialog.' },
    { name: 'onClose', type: 'handler', required: true, description: 'Called when dismissed via the close button or Escape.' },
    { name: 'defaultPosition', type: 'token', description: 'Initial top-left position in viewport pixels ({ x, y }); defaults to { x: 24, y: 24 }.' },
    { name: 'className', type: 'string', description: 'Extra class names merged onto the panel.' },
    { name: 'children', type: 'node', description: 'The panel body content.' },
  ],
  defaults: {},
  // fixed panel metrics; size does not vary
  dimensions: {
    minWidth: '16rem',
    maxWidth: 'min(28rem, calc(100vw - 2rem))',
    maxHeight: 'calc(100vh - 2rem)',
    radius: token('radius-lg'),
    border: token('hairline'),
    gap: token('space-3'),
  },
  states: [
    { name: 'open', description: 'Panel mounts, portals to the body, and animates in at its position.' },
    { name: 'dragging', description: 'A pointer-drag on the handle moves the panel; the position stays clamped inside the viewport.' },
    { name: 'closed', description: 'Panel unmounts on close; the page underneath is never blocked.' },
  ],
  tokens: [
    'hairline',
    'glass-border',
    'radius-lg',
    'glass-thick',
    'blur-lg',
    'glass-saturate',
    'glass-highlight',
    'shadow-4',
    'border-subtle',
    'space-2',
    'space-3',
    'space-4',
    'font-size-sm',
    'text',
    'font-sans',
  ],
  a11y: {
    role: 'dialog',
    focusable: false,
    keyboard: [{ keys: 'Escape', action: 'Closes the panel.' }],
    notes: [
      'The panel portals to document.body and renders as role="dialog" labelled by its title via aria-labelledby.',
      'Non-modal by design: it does not use aria-modal, lock body scroll, trap focus, or render an overlay — the page underneath stays interactive.',
      'The grab-bar carries a grab cursor and touch-action:none so pointer-drag works on touch without scrolling the page.',
      'Dragging is pointer-only; keyboard users cannot move the panel, but its position is never load-bearing.',
    ],
  },
  motion: {
    description: 'Panel fades and scales up on open; respects reduced motion by fading only.',
    transition: { speed: 'Fast', ease: 'Out' },
  },
};
