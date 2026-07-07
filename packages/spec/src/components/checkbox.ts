import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

export const checkboxSpec: ComponentSpec = {
  name: 'Checkbox',
  id: 'checkbox',
  category: 'atom',
  status: 'stable',
  summary: 'A binary checkbox: a native input with a custom square box and an animated check, plus an optional label.',
  element: 'label',
  anatomy: [
    { name: 'input', description: 'Visually hidden native checkbox input that carries state and focus.', required: true },
    { name: 'box', description: 'The square indicator that fills on check and holds the checkmark.', required: true },
    { name: 'label', description: 'Optional text beside the box.' },
  ],
  props: [
    { name: 'label', type: 'node', description: 'Text or content shown beside the box.' },
    { name: 'checked', type: 'boolean', description: 'Controlled checked state.' },
    { name: 'defaultChecked', type: 'boolean', default: false, description: 'Initial checked state when uncontrolled.' },
    { name: 'onCheckedChange', type: 'handler', description: 'Fires with the next checked value on change.' },
    { name: 'disabled', type: 'boolean', default: false, description: 'Dims the control and blocks interaction.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
  ],
  defaults: { defaultChecked: false, skeleton: false },
  dimensions: { radius: token('radius-sm'), gap: token('space-2'), border: token('hairline'), size: '1.375rem', iconSize: '0.875rem' },
  states: [
    { name: 'checked', description: 'Box fills with the accent and shows the check.', tokens: { background: token('accent-solid'), border: token('accent-solid'), check: token('accent-contrast') } },
    { name: 'focus-visible', description: 'A 2px accent focus ring rings the box.', tokens: { ring: token('focus-ring') } },
    { name: 'disabled', description: 'Halved opacity and not-allowed cursor.' },
  ],
  tokens: [
    'space-2', 'font-sans', 'font-size-sm', 'text', 'hairline', 'border-strong',
    'duration-fast', 'ease-out', 'focus-ring', 'radius-sm', 'surface', 'accent-contrast', 'accent-solid',
  ],
  a11y: {
    role: 'checkbox',
    focusable: true,
    keyboard: [{ keys: 'Space', action: 'Toggles the checkbox.' }],
    notes: [
      'The native input carries the role, state, and focus; the box is aria-hidden.',
      'A disabled checkbox is removed from the tab order and blocks toggling.',
    ],
  },
  motion: {
    description: 'The checkmark draws its path in on check; the box eases its fill and border. Both respect reduced motion.',
    transition: { speed: 'fast', ease: 'out' },
  },
};
