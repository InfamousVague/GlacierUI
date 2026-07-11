import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/**
 * Placement of the panel relative to its trigger: a side, optionally suffixed
 * with an alignment. Exported so the React kit derives its Placement union and
 * any binding shares the same list. The inline sides are writing-direction
 * relative: inline-end resolves to right in LTR and left in RTL, while the
 * physical left and right stay put in every direction. Start and end
 * alignments on the block sides are logical too.
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
  'inline-start',
  'inline-start-start',
  'inline-start-center',
  'inline-start-end',
  'inline-end',
  'inline-end-start',
  'inline-end-center',
  'inline-end-end',
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
    {
      name: 'arrow',
      description:
        'A small rotated-square pointer wearing the panel material, poking out of the edge that faces the trigger and following the resolved placement, including start and end alignments.',
      required: true,
    },
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
    offset: '12px',
  },
  states: [
    {
      name: 'open',
      description: 'Panel mounts, portals to the body, animates in, and takes focus; the one-piece glass surface (panel plus arrow) paints glass-thick behind the content with a glass-border hairline stroke.',
      tokens: { background: token('glass-thick'), border: token('glass-border') },
    },
    {
      name: 'closed',
      description: 'Panel animates out (motion-driven opacity and scale, no token repaint) and unmounts on animation complete.',
      behavioral: true,
    },
    {
      name: 'focus-visible',
      description: 'The focused panel suppresses its outline (.positioner:focus-visible { outline: none }); focus is managed, not ringed - zero paint delta.',
      behavioral: true,
    },
  ],
  // The panel itself never rings: its outline is suppressed and focus is
  // managed on open. The ring belongs to the trigger and to any focusable
  // content inside, which draw the kit-wide 2px focus-ring outline at a 2px
  // offset.
  focusRing: { ring: token('focus-ring'), offset: '2px' },
  tokens: [
    'space-3',
    'hairline',
    'glass-border',
    'radius-lg',
    'glass-thick',
    'blur-lg',
    'glass-saturate',
    'text',
    'font-sans',
    'focus-ring',
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
