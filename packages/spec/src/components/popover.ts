import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/**
 * Placement of the panel relative to its trigger: a side, optionally suffixed
 * with an alignment. Exported so the React kit derives its Placement union and
 * any binding shares the same list.
 */
export const popoverPlacements = [
  'top',
  'top-start',
  'top-center',
  'top-end',
  'bottom',
  'bottom-start',
  'bottom-center',
  'bottom-end',
  'left',
  'left-start',
  'left-center',
  'left-end',
  'right',
  'right-start',
  'right-center',
  'right-end',
] as const;

export const popoverSpec: ComponentSpec = {
  name: 'Popover',
  id: 'popover',
  category: 'organism',
  status: 'stable',
  summary:
    'A floating glass panel anchored to a trigger; it portals to the body, flips and clamps on screen, and closes on outside press or Escape.',
  element: 'div',
  anatomy: [
    { name: 'trigger', description: 'The element that toggles the panel. Its ref and click are wired up, and it gains aria-haspopup, aria-expanded, and aria-controls.', required: true },
    { name: 'panel', description: 'The portalled floating dialog holding the popover content.', required: true },
    { name: 'content', description: 'The children rendered inside the panel.' },
  ],
  props: [
    { name: 'trigger', type: 'element', required: true, description: 'The element that toggles the popover; its ref and click are wired up.' },
    { name: 'placement', type: 'enum', values: popoverPlacements, default: 'bottom-start', description: 'Where to place the panel relative to the trigger before flipping and clamping.' },
    { name: 'open', type: 'boolean', description: 'Controlled open state; pair with onOpenChange.' },
    { name: 'defaultOpen', type: 'boolean', default: false, description: 'Initial open state when uncontrolled.' },
    { name: 'onOpenChange', type: 'handler', description: 'Fires with the next open state on toggle, outside press, or Escape.' },
    { name: 'aria-label', type: 'string', description: 'Accessible label for the panel when it has no heading.' },
    { name: 'className', type: 'string', description: 'Extra class names merged onto the panel.' },
    { name: 'children', type: 'node', description: 'The panel content.' },
  ],
  defaults: { placement: 'bottom-start', defaultOpen: false },
  // fixed panel metrics; size does not vary
  dimensions: {
    minWidth: '12rem',
    maxWidth: 'min(24rem, calc(100vw - 2rem))',
    padding: token('space-3'),
    radius: token('radius-lg'),
    border: token('hairline'),
    offset: '8px',
  },
  states: [
    { name: 'open', description: 'Panel mounts, portals to the body, animates in, and takes focus.' },
    { name: 'closed', description: 'Panel animates out and unmounts on animation complete.' },
    { name: 'focus-visible', description: 'The focused panel suppresses its outline; focus is managed, not ringed.' },
  ],
  tokens: [
    'space-3',
    'hairline',
    'glass-border',
    'radius-lg',
    'glass-thick',
    'blur-lg',
    'glass-saturate',
    'glass-highlight',
    'shadow-4',
    'text',
    'font-sans',
  ],
  a11y: {
    role: 'dialog',
    focusable: true,
    keyboard: [{ keys: 'Escape', action: 'Closes the panel and returns focus to the trigger.' }],
    notes: [
      'The panel portals to document.body and renders as role="dialog" with tabIndex -1.',
      'The trigger gains aria-haspopup="dialog", aria-expanded, and aria-controls pointing at the panel while open.',
      'Give the panel an aria-label when it has no visible heading.',
      'On open the panel receives focus; on Escape or outside pointer press it closes and focus returns to the trigger.',
      'Not a focus trap: focus can leave the panel, which does not close it.',
    ],
  },
  motion: {
    description: 'Panel fades and scales up from the trigger-anchored transform origin on open and reverses on close; respects reduced motion by fading only.',
    transition: { speed: 'Fast', ease: 'Out' },
  },
};
