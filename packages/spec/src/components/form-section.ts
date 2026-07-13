import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

export const formSectionSpec: ComponentSpec = {
  name: 'FormSection',
  id: 'form-section',
  category: 'molecule',
  status: 'draft',
  summary:
    'A page-level grouping for settings and long forms: a titled, labelled section with an optional description, title-row actions, and a stacking divider.',
  element: 'section',
  anatomy: [
    { name: 'title', description: 'The section title, a Heading whose id labels the section through aria-labelledby.', required: true },
    { name: 'description', description: 'A muted supporting line under the title.' },
    { name: 'actions', description: 'An optional row of actions aligned with the title row, at the end.' },
    { name: 'content', description: 'The section body, often one or more Fieldsets.', required: true },
    { name: 'divider', description: 'An optional hairline Divider above the section, for stacking multiple sections.' },
  ],
  props: [
    { name: 'title', type: 'node', required: true, description: 'The section title, rendered as a Heading.' },
    {
      name: 'level',
      type: 'enum',
      values: ['1', '2', '3', '4', '5', '6'],
      default: '3',
      description: 'Semantic heading level for the title.',
    },
    { name: 'description', type: 'node', description: 'Muted supporting content under the title.' },
    { name: 'actions', type: 'node', description: 'Actions aligned to the end of the title row.' },
    {
      name: 'divider',
      type: 'boolean',
      default: false,
      description: 'Draws a hairline Divider above the section so stacked sections separate cleanly.',
    },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the section geometry.' },
    { name: 'children', type: 'node', required: true, description: 'The section content, often Fieldsets.' },
  ],
  defaults: { level: '3', divider: false, skeleton: false },
  dimensions: {
    gap: token('space-5'),
    contentOffset: token('space-5'),
    headerGap: token('space-4'),
    dividerOffset: token('space-6'),
    border: token('hairline'),
  },
  states: [
    { name: 'skeleton', description: 'Swaps the title and description for placeholder lines; the content renders its own skeletons.' },
  ],
  // the heading and grouped fields paint
  paint: {},
  tokens: [
    'font-sans', 'font-size-sm', 'leading-sm',
    'space-1', 'space-2', 'space-4', 'space-5', 'space-6',
    'text-muted', 'hairline', 'border-subtle',
  ],
  a11y: {
    role: 'region',
    notes: [
      'Renders a section element with aria-labelledby pointing at the generated title id, so the title names a landmark region.',
      'The level prop keeps the heading semantic within the page outline while the visual size stays consistent.',
      'The divider is decorative separation between stacked sections; it carries no semantics of its own.',
    ],
  },
};
