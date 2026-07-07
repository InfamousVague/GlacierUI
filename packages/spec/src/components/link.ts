import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

export const linkSpec: ComponentSpec = {
  name: 'Link',
  id: 'link',
  category: 'atom',
  status: 'stable',
  summary: 'An inline anchor in the accent color that underlines on hover and shows a focus ring.',
  element: 'a',
  anatomy: [{ name: 'label', description: 'The link text or inline content.', required: true }],
  props: [
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders an 8ch text placeholder in place of the link.' },
    { name: 'children', type: 'node', description: 'Link content.' },
  ],
  defaults: { skeleton: false },
  dimensions: { radius: token('radius-xs') },
  states: [
    { name: 'hover', description: 'Text underline appears; underline offset is 0.2em.' },
    { name: 'focus-visible', description: 'A 2px accent outline at 2px offset.', tokens: { ring: token('focus-ring') } },
  ],
  tokens: [
    'accent-text',
    'font-weight-medium',
    'radius-xs',
    'duration-fast',
    'ease-out',
    'focus-ring',
  ],
  a11y: {
    role: 'link',
    focusable: true,
    keyboard: [{ keys: 'Enter', action: 'Follows the link.' }],
    notes: [
      'Renders a native anchor; passes through href, target, rel, and other anchor attributes.',
      'Hover underline is not the only affordance since the accent color already distinguishes the link.',
    ],
  },
  motion: {
    description: 'Eases its color on hover; respects reduced motion.',
    transition: { speed: 'fast', ease: 'out' },
  },
};
