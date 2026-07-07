import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

export const emptyStateSpec: ComponentSpec = {
  name: 'EmptyState',
  id: 'empty-state',
  category: 'atom',
  status: 'stable',
  summary:
    'A centered placeholder for an empty view, with an optional icon disc, a title, a muted description, and an action.',
  element: 'div',
  anatomy: [
    { name: 'icon', description: 'Optional glyph inside a round, sunken disc above the title.' },
    { name: 'title', description: 'Short heading naming what is empty or missing.', required: true },
    { name: 'description', description: 'Optional muted sentence with more context, width-capped and centered.' },
    { name: 'action', description: 'Optional call-to-action rendered below the text.' },
  ],
  props: [
    { name: 'icon', type: 'node', description: 'Glyph rendered inside the leading disc.' },
    { name: 'title', type: 'node', required: true, description: 'Heading naming what is empty.' },
    { name: 'description', type: 'node', description: 'Muted supporting sentence, centered and width-capped.' },
    { name: 'action', type: 'node', description: 'Call-to-action node, e.g. a Button, below the text.' },
    { name: 'children', type: 'node', description: 'Extra content rendered below the action.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
  ],
  defaults: { skeleton: false },
  dimensions: {
    gap: token('space-4'),
    discSize: '4rem',
    discRadius: token('radius-full'),
    iconSize: token('font-size-2xl'),
    paddingBlock: token('space-8'),
    paddingInline: token('space-6'),
    descriptionMaxWidth: '28rem',
    titleFontSize: token('font-size-lg'),
    descriptionFontSize: token('font-size-sm'),
  },
  tokens: [
    'space-2', 'space-3', 'space-4', 'space-6', 'space-8',
    'radius-full', 'surface-sunken',
    'font-sans', 'font-size-sm', 'font-size-lg', 'font-size-2xl',
    'font-weight-semibold', 'line-height-normal', 'line-height-relaxed',
    'text', 'text-secondary',
  ],
  a11y: {
    focusable: false,
    notes: [
      'The title is the accessible label for the empty view; keep it a short, literal phrase.',
      'The icon is decorative; mark it aria-hidden so it is not announced.',
      'Provide a real action (a button or link) when the user can resolve the empty state.',
    ],
  },
  motion: {
    description: 'Static; the component itself does not animate.',
  },
};
