import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

export const scrollToLatestSpec: ComponentSpec = {
  name: 'ScrollToLatest',
  id: 'scroll-to-latest',
  category: 'molecule',
  status: 'draft',
  summary:
    'The floating jump control on a transcript: a raised round button pointing down, appearing once the reader has scrolled away from the end and carrying a CounterBadge when messages are waiting.',
  element: 'button',
  anatomy: [
    { name: 'root', description: 'The floating button, positioned over the transcript\'s trailing bottom corner.', required: true },
    { name: 'glyph', description: 'The downward chevron.', required: true },
    { name: 'badge', description: 'A CounterBadge on the button\'s leading top corner, when messages are waiting.' },
  ],
  props: [
    { name: 'onClick', type: 'handler', required: true, description: 'Called when the control is pressed; the transcript scrolls to the end.' },
    { name: 'visible', type: 'boolean', default: false, description: 'Whether it is on screen. Decided by shouldShowScrollToLatest, never by the button itself.' },
    { name: 'count', type: 'number', default: 0, description: 'Unread messages waiting below. Zero renders the button bare.' },
    { name: 'max', type: 'number', default: 99, description: 'Cap on the badge, past which it reads `${max}+`.' },
    { name: 'label', type: 'string', description: 'Accessible name. Defaults to the shared "Scroll to latest messages" string.' },
  ],
  defaults: { visible: false, count: 0, max: 99 },
  dimensions: {
    diameter: token('control-height-md'),
    radius: token('radius-full'),
    offset: token('space-4'),
    iconSize: token('size-sm'),
  },
  // A raised surface rather than a solid accent: it floats over the reader's
  // messages, and a saturated fill there competes with the conversation it is
  // meant to be a footnote to. The badge carries the urgency instead.
  paint: { background: token('surface-raised'), text: token('text'), border: token('border') },
  focusRing: { ring: token('focus-ring'), offset: '2px' },
  states: [
    { name: 'default', description: 'Resting over the transcript.' },
    { name: 'hover', description: 'Lifts to the hover tint and gains a step of shadow.', tokens: { background: token('hover'), shadow: token('shadow-3') } },
    { name: 'waiting', description: 'Messages are unread below, so the badge appears in the danger tone — the one place in the transcript that is allowed to be loud.', tokens: { badge: token('danger-solid'), badgeText: token('danger-contrast') } },
  ],
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'control-height-md', 'radius-full', 'space-4', 'size-sm',
    'surface-raised', 'text', 'border', 'hover', 'shadow-2', 'shadow-3',
    'danger-solid', 'danger-contrast', 'focus-ring', 'duration-fast', 'ease-out',
  ],
  a11y: {
    role: 'button',
    focusable: true,
    keyboard: [{ keys: 'Space, Enter', action: 'Scrolls the transcript to the newest message.' }],
    notes: [
      'It leaves the tab order entirely while hidden, rather than being faded out and still focusable — a control a sighted user cannot see must not be one a keyboard user lands on.',
      'The count is spoken as part of the button\'s name, so pressing it is a decision the reader can make without hunting for the badge.',
      'The badge is decorative to assistive tech: repeating the number the label already carries would announce it twice.',
    ],
  },
  motion: {
    description:
      'Fades and rises a few pixels on enter; press dips like any compact control. There is no exit animation, and that is deliberate — the control leaves because the reader reached the bottom, which means they are looking at the newest message and not at the corner the button was in. Animating it out would only delay removing it from the tab order. Reduced motion drops the movement and keeps the fade.',
    press: true,
    transition: { speed: 'fast', ease: 'out' },
  },
};
