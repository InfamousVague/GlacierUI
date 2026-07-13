import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

export const tabbedPanelSpec: ComponentSpec = {
  name: 'TabbedPanel',
  id: 'tabbed-panel',
  category: 'organism',
  status: 'stable',
  summary:
    'A framed panel with a header row of tabs - each optionally carrying a count badge - plus a bounded content body that switches per active tab and an optional end slot for actions.',
  element: 'div',
  anatomy: [
    { name: 'panel', description: 'The bordered, rounded frame wrapping the header and body.', required: true },
    { name: 'header', description: 'The top row holding the tab list and the optional actions slot.', required: true },
    { name: 'tablist', description: 'The role="tablist" of role="tab" buttons that drive the body.', required: true },
    { name: 'tab', description: 'A role="tab" button with a label and an optional CounterBadge count.' },
    { name: 'actions', description: 'An end-aligned slot for controls that act on the panel.' },
    { name: 'body', description: 'The role="tabpanel" content area for the active tab.', required: true },
  ],
  props: [
    { name: 'tabs', type: 'node', required: true, description: 'The tabs to show: { id, label, count?, content, disabled? }.' },
    { name: 'value', type: 'string', description: 'Controlled active tab id.' },
    { name: 'defaultValue', type: 'string', description: 'Initial active tab id when uncontrolled; defaults to the first enabled tab.' },
    { name: 'onValueChange', type: 'handler', description: 'Called with the id of the newly activated tab.' },
    { name: 'actions', type: 'node', description: 'Content rendered in the header end slot, e.g. a Button or Menu.' },
    { name: 'aria-label', type: 'string', description: 'Accessible name for the tab list.' },
  ],
  defaults: {},
  dimensions: {
    radius: token('radius-xl'),
    gap: token('space-2'),
    border: token('hairline'),
    bodyPadding: token('space-5'),
  },
  states: [
    { name: 'hover', description: 'A hovered, enabled tab strengthens its label from text-muted to text.', paint: { text: token('text') } },
    {
      name: 'selected',
      description: 'The active tab strengthens its label to text and carries the sliding accent underline (2px tall, a literal) on the header hairline; its count badge flips to the accent tone.',
      paint: { text: token('text') },
      tokens: { indicator: token('accent-solid') },
    },
    { name: 'disabled', description: 'A disabled tab fades its label to text-disabled with a not-allowed cursor and is skipped by arrow navigation.', paint: { text: token('text-disabled') } },
  ],
  // .tab:focus-visible and .body:focus-visible both draw a 2px focus-ring
  // outline inset by 2px (outline-offset: -2px) so it survives the panel's
  // overflow clipping.
  paint: { background: '$surface-raised', text: '$text', border: '$border-subtle' },
  focusRing: { ring: token('focus-ring'), offset: '-2px' },
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'space-1', 'space-2', 'space-3', 'space-4', 'space-5',
    'hairline', 'border-subtle', 'radius-xl', 'radius-md', 'radius-sm', 'radius-full',
    'surface', 'surface-raised', 'shadow-1', 'text', 'text-muted', 'text-disabled',
    'font-sans', 'font-size-sm', 'font-weight-medium', 'accent-solid', 'focus-ring',
    'duration-fast', 'ease-out',
  ],
  a11y: {
    role: 'tablist',
    focusable: true,
    keyboard: [
      { keys: 'ArrowRight, ArrowLeft', action: 'Moves to and activates the next or previous tab, wrapping and skipping disabled tabs.' },
      { keys: 'Home, End', action: 'Activates the first or last enabled tab.' },
      { keys: 'Tab', action: 'Moves focus from the active tab into the content body.' },
    ],
    notes: [
      'Automatic activation: the panel body switches as focus moves between tabs.',
      'Each tab is aria-controls-linked to its panel, and the panel is aria-labelledby its tab.',
      'A tab count renders as a CounterBadge inside the tab button.',
      'Disabled tabs carry the disabled attribute and are skipped by arrow navigation.',
    ],
  },
  motion: {
    description: 'The active-tab underline slides between tabs as a shared layout element, and the body content fades and lifts on switch; both respect reduced motion.',
    transition: { speed: 'fast', ease: 'out' },
  },
};
