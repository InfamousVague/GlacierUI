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
    'A hover and focus label that portals to the body so it escapes overflow clipping; it opens on hover intent after a delay or instantly on focus, flips and clamps on screen, and stays non-interactive.',
  element: 'div',
  anatomy: [
    {
      name: 'trigger',
      description:
        'The single child element the tooltip describes. It is cloned so its ref and pointer/focus handlers are wired up without replacing any the caller already passed, and it gains aria-describedby pointing at the bubble while shown. When disabled or skeleton the child is returned untouched with no wiring.',
      required: true,
    },
    {
      name: 'arrow',
      description:
        'A small rotated-square pointer wearing the bubble material, poking out of the edge that faces the trigger. It follows the resolved placement: centered on the edge, or pinned near the leading or trailing corner for start and end alignments.',
      required: true,
    },
    {
      name: 'bubble',
      description:
        'The portalled role="tooltip" glass surface holding the content, positioned above, below, or beside the trigger. It carries a thick-glass background, hairline border, backdrop blur and saturation, and a soft blurred drop shadow, and is fixed to the viewport with pointer-events disabled so it can never trap the cursor.',
      required: true,
    },
  ],
  props: [
    { name: 'content', type: 'node', required: true, description: 'The bubble content: a short label, shortcut, or hint. Rendered inside the portalled bubble.' },
    { name: 'children', type: 'element', required: true, description: 'The single element the tooltip describes. It is cloned so its ref and pointer/focus handlers are wired up, preserving any handlers already on the child.' },
    { name: 'placement', type: 'enum', values: tooltipPlacements, default: 'top', description: 'Preferred side and alignment of the bubble relative to the trigger before flipping to the opposite side and clamping into the viewport.' },
    { name: 'delay', type: 'number', default: 300, description: 'Milliseconds of hover intent before the bubble opens. Focus opens instantly regardless; a value of 0 opens on hover instantly too.' },
    { name: 'disabled', type: 'boolean', default: false, description: 'Suppresses the tooltip entirely; the child is returned with no wiring and nothing can open.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Returns the child untouched so its own geometry stands in while loading; the tooltip adds no footprint of its own and no hover wiring.' },
    { name: 'className', type: 'string', description: 'Extra class names merged onto the bubble.' },
  ],
  defaults: { placement: 'top', delay: 300, disabled: false, skeleton: false },
  // fixed bubble metrics; the bubble does not vary with size
  dimensions: {
    maxWidth: 'min(18rem, calc(100vw - 2rem))',
    paddingInline: token('space-3'),
    paddingBlock: token('space-2'),
    radius: token('radius-md'),
    border: token('hairline'),
    blur: token('blur-md'),
    fontSize: token('font-size-xs'),
    lineHeight: token('leading-xs'),
    offset: '10px',
  },
  states: [
    { name: 'shown', description: 'Bubble is mounted and portalled to the body, fades and scales up with a small upward drift from the trigger-anchored transform origin, and the trigger carries aria-describedby pointing at it. Motion and announcement only; the bubble paint never changes.', behavioral: true },
    { name: 'hidden', description: 'Bubble fades and scales back down, then unmounts once the exit animation completes; the trigger drops aria-describedby. Motion and announcement only; the bubble paint never changes.', behavioral: true },
  ],
  tokens: [
    'space-2',
    'space-3',
    'hairline',
    'radius-md',
    'glass-border',
    'glass-thick',
    'glass-saturate',
    'blur-md',
    'text',
    'font-sans',
    'font-size-xs',
    'leading-xs',
  ],
  a11y: {
    role: 'tooltip',
    focusable: false,
    keyboard: [{ keys: 'Escape', action: 'Hides the bubble while it is shown, via a document-level key handler, without moving focus off the trigger.' }],
    notes: [
      'The bubble portals to document.body and renders as role="tooltip" with a stable generated id.',
      'The trigger gains aria-describedby pointing at the bubble only while it is shown, merged with any aria-describedby the child already had, so assistive tech announces the content as a description.',
      'Opens on hover intent after the delay or immediately on keyboard focus; hides on pointer leave, blur, or Escape.',
      'Touch pointers are excluded from the hover-intent path: a tap does not open the bubble, so it never lingers over touch targets.',
      'The Escape handler is a document-level keydown listener registered only while the bubble is mounted, and it hides the bubble without stealing focus from the trigger.',
      'The bubble is non-interactive (pointer-events: none) so it never traps the cursor over the trigger it describes.',
      'A tooltip supplements the trigger; it must not be the only place a control is named or its meaning stated.',
    ],
  },
  motion: {
    description: 'On show the bubble fades in, scales up from just under full size, and drifts up a couple of pixels, all from the trigger-anchored transform origin; on hide it reverses and unmounts once the exit animation completes. Under reduced motion it crossfades opacity only, with no scale or translate.',
    transition: { speed: 'Fast', ease: 'Out' },
  },
};
