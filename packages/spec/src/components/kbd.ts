import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

export const kbdSpec: ComponentSpec = {
  name: 'Kbd',
  id: 'kbd',
  category: 'atom',
  status: 'stable',
  summary: 'A monospace key cap that renders a keyboard key or shortcut inline with a raised bottom edge.',
  element: 'kbd',
  anatomy: [{ name: 'label', description: 'The key text or shortcut, kept to one line.', required: true }],
  props: [
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
    { name: 'glass', type: 'boolean', default: false, description: 'Renders the frosted glass material instead of a solid surface.' },
    { name: 'children', type: 'node', required: true, description: 'Key label or shortcut text.' },
  ],
  defaults: { skeleton: false, glass: false },
  dimensions: {
    radius: token('radius-sm'),
    border: token('hairline'),
    borderBottom: '2px',
    fontSize: '0.8em',
    paddingBlock: '0.25em',
    paddingInline: '0.5em',
  },
  paint: { background: '$surface-sunken', text: '$text-muted', border: '$border' },
  tokens: ['font-mono', 'text-muted', 'surface-sunken', 'hairline', 'border', 'radius-sm'],
  a11y: {
    focusable: false,
    notes: ['Semantic kbd element; the key text carries the meaning.'],
  },
};
