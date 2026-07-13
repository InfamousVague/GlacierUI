import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

export const labelSpec: ComponentSpec = {
  name: 'Label',
  id: 'label',
  category: 'atom',
  status: 'stable',
  summary: 'A form field label with an optional required marker.',
  element: 'label',
  anatomy: [
    { name: 'text', description: 'The label content.', required: true },
    { name: 'required', description: 'A red asterisk appended after the text when required is set.' },
  ],
  props: [
    { name: 'required', type: 'boolean', default: false, description: 'Appends a required marker after the label text.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the component exact geometry.' },
    { name: 'children', type: 'node', description: 'Label text.' },
  ],
  defaults: { required: false, skeleton: false },
  dimensions: { fontSize: token('font-size-sm'), lineHeight: token('leading-sm') },
  paint: { text: '$text' },
  tokens: ['font-sans', 'font-size-sm', 'leading-sm', 'font-weight-medium', 'text', 'danger-text'],
  a11y: {
    focusable: false,
    notes: [
      'Renders a native label element; pair it with a control via htmlFor.',
      'The required asterisk is aria-hidden; convey requiredness on the control itself.',
    ],
  },
};
