import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

export const dividerSpec: ComponentSpec = {
  name: 'Divider',
  id: 'divider',
  category: 'atom',
  status: 'stable',
  summary: 'A hairline rule that separates content, horizontal or vertical, with an optional centered label.',
  element: 'hr',
  anatomy: [{ name: 'label', description: 'Optional centered text; switches the rule to a labelled separator.' }],
  props: [
    { name: 'orientation', type: 'enum', values: ['horizontal', 'vertical'], default: 'horizontal', description: 'Rule direction.' },
    { name: 'label', type: 'node', description: 'Centered label; renders a div separator with a rule on each side.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
  ],
  defaults: { orientation: 'horizontal', skeleton: false },
  dimensions: { thickness: token('hairline'), gap: token('space-3') },
  tokens: ['hairline', 'border-subtle', 'space-3', 'font-family-sans', 'font-size-xs', 'text-subtle'],
  a11y: {
    role: 'separator',
    focusable: false,
    notes: ['A vertical divider sets aria-orientation="vertical".'],
  },
};
