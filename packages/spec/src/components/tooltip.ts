import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/**
 * Placement of the bubble relative to its trigger: a side, optionally suffixed
 * with an alignment. Exported so the React kit derives its Placement union and
 * any binding shares the same list.
 */
export const tooltipPlacements = [
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

export const tooltipSpec: ComponentSpec = {
  name: 'Tooltip',
  id: 'tooltip',
  category: 'molecule',
  status: 'stable',
  summary:
    'A hover and focus label that portals to the body so it escapes overflow clipping; it flips and clamps on screen and stays non-interactive.',
  element: 'div',
  anatomy: [
    {
      name: 'trigger',
      description:
        'The element the tooltip describes. Its ref and pointer/focus handlers are wired up, and it gains aria-describedby pointing at the bubble while shown.',
      required: true,
    },
    {
      name: 'bubble',
      description:
        'The portalled role="tooltip" glass bubble holding the content; positioned above, below, or beside the trigger.',
      required: true,
    },
  ],
  props: [
    { name: 'content', type: 'node', required: true, description: 'The bubble content: a short label, shortcut, or hint.' },
    { name: 'children', type: 'element', required: true, description: 'The element the tooltip describes; its ref and event handlers are wired up.' },
    { name: 'placement', type: 'enum', values: tooltipPlacements, default: 'top', description: 'Where to place the bubble relative to the trigger before flipping and clamping.' },
    { name: 'delay', type: 'number', default: 300, description: 'Milliseconds of hover intent before the bubble opens; focus opens instantly.' },
    { name: 'disabled', type: 'boolean', default: false, description: 'Suppresses the tooltip entirely; the trigger renders untouched.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
    { name: 'className', type: 'string', description: 'Extra class names merged onto the bubble.' },
  ],
  defaults: { placement: 'top', delay: 300, disabled: false, skeleton: false },
  // fixed bubble metrics; the bubble does not vary with size
  dimensions: {
    maxWidth: 'min(18rem, calc(100vw - 2rem))',
    paddingInline: token('space-2'),
    paddingBlock: token('space-1'),
    radius: token('radius-md'),
    border: token('hairline'),
    fontSize: token('font-size-xs'),
    offset: '6px',
  },
  states: [
    { name: 'shown', description: 'Bubble mounts, portals to the body, and fades and scales in from the trigger-anchored origin.' },
    { name: 'hidden', description: 'Bubble fades out and unmounts on animation complete.' },
  ],
  tokens: [
    'space-1',
    'space-2',
    'hairline',
    'radius-md',
    'glass-border',
    'glass-thick',
    'glass-highlight',
    'glass-saturate',
    'blur-md',
    'shadow-3',
    'text',
    'font-sans',
    'font-size-xs',
    'leading-xs',
  ],
  a11y: {
    role: 'tooltip',
    focusable: false,
    keyboard: [{ keys: 'Escape', action: 'Hides the bubble while it is shown, without moving focus.' }],
    notes: [
      'The bubble portals to document.body and renders as role="tooltip".',
      'The trigger gains aria-describedby pointing at the bubble while it is shown, so assistive tech announces the content as a description.',
      'Opens on hover intent after the delay or immediately on focus; hides on pointer leave, blur, or Escape.',
      'The bubble is non-interactive (pointer-events: none) so it never traps the cursor over the trigger.',
      'A tooltip supplements the trigger; it must not be the only place a control is named or its meaning stated.',
    ],
  },
  motion: {
    description: 'Bubble fades and scales up from the trigger-anchored transform origin on show and reverses on hide; respects reduced motion by fading only.',
    transition: { speed: 'Fast', ease: 'Out' },
  },
};
