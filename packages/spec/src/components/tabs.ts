import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/** Underline spring presets, exported so the React kit derives its union from here. */
export const tabsSprings = ['snappy', 'smooth', 'bouncy'] as const;

export const tabsSpec: ComponentSpec = {
  name: 'Tabs',
  id: 'tabs',
  category: 'molecule',
  status: 'stable',
  summary: 'A tab menu following the WAI-ARIA tabs pattern with automatic activation and a springing underline indicator.',
  element: 'div',
  anatomy: [
    { name: 'list', description: 'The tablist row, underlined by a bottom hairline.', required: true },
    { name: 'tab', description: 'One tab trigger button; carries its label and, when selected, the indicator.', required: true },
    { name: 'indicator', description: 'The springing underline that animates between selected tabs as a shared layout element.' },
    { name: 'panel', description: 'The tabpanel showing the active tab content, cross-faded on change.', required: true },
  ],
  props: [
    { name: 'tabs', type: 'node', required: true, description: 'Ordered tab items, each a value, label, content, and optional disabled flag.' },
    { name: 'value', type: 'string', description: 'Controlled selected tab value.' },
    { name: 'defaultValue', type: 'string', description: 'Initial selected value when uncontrolled; falls back to the first enabled tab.' },
    { name: 'onValueChange', type: 'handler', description: 'Fires with the new value when the selected tab changes.' },
    { name: 'spring', type: 'enum', values: tabsSprings, default: 'snappy', description: 'Spring preset for the underline indicator.' },
    { name: 'fullWidth', type: 'boolean', default: false, description: 'Stretches the tabs to fill the list width.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
    { name: 'aria-label', type: 'string', description: 'Accessible name for the tab list.' },
    { name: 'className', type: 'string', description: 'Extra class on the root wrapper.' },
  ],
  defaults: { spring: 'snappy', fullWidth: false, skeleton: false },
  // list gap and tab padding are fixed; the underline sits on the list hairline
  dimensions: {
    gap: token('space-1'),
    paddingBlock: token('space-3'),
    paddingInline: token('space-4'),
    radius: token('radius-md'),
    border: token('hairline'),
    indicatorThickness: '2px',
  },
  states: [
    { name: 'hover', description: 'An enabled unselected tab lifts its label from muted to full text color.', tokens: { text: token('text') } },
    { name: 'selected', description: 'The active tab takes full text color and mounts the underline indicator.', tokens: { text: token('text'), indicator: token('accent-solid') } },
    { name: 'focus-visible', description: 'A 2px inset accent ring on the focused tab or panel.', tokens: { ring: token('focus-ring') } },
    { name: 'disabled', description: 'A disabled tab dims to the disabled text color and blocks activation.', tokens: { text: token('text-disabled') } },
  ],
  // a 2px focus-ring outline inset into the tab (offset -2px); the panel draws
  // the same ring outset 2px
  focusRing: { ring: token('focus-ring'), offset: '-2px' },
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'space-1', 'space-2', 'space-3', 'space-4', 'space-5',
    'hairline', 'border-subtle', 'font-sans', 'font-size-sm', 'font-weight-medium',
    'radius-sm', 'radius-md', 'radius-full',
    'text', 'text-muted', 'text-disabled', 'accent-solid', 'focus-ring',
    'duration-fast', 'ease-out',
  ],
  a11y: {
    role: 'tablist',
    focusable: true,
    keyboard: [
      { keys: 'ArrowRight', action: 'Moves to and activates the next enabled tab, wrapping past the end.' },
      { keys: 'ArrowLeft', action: 'Moves to and activates the previous enabled tab, wrapping past the start.' },
      { keys: 'Home', action: 'Activates the first enabled tab.' },
      { keys: 'End', action: 'Activates the last enabled tab.' },
    ],
    notes: [
      'Automatic activation: arrow keys move selection and activate in one step, skipping disabled tabs.',
      'Roving tabindex: only the selected tab is in the tab order (tabIndex 0); the rest are -1.',
      'Each tab sets aria-selected and aria-controls; the panel is a focusable tabpanel with aria-labelledby back to its tab.',
      'The indicator is aria-hidden and decorative.',
    ],
  },
  motion: {
    description: 'The underline springs between tabs as a shared layout element; the panel cross-fades and rises on change. Both are disabled under reduced motion.',
    transition: { spring: 'snappy', speed: 'fast', ease: 'out' },
  },
};
