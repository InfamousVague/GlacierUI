import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

export const fieldsetSpec: ComponentSpec = {
  name: 'Fieldset',
  id: 'fieldset',
  category: 'molecule',
  status: 'draft',
  summary:
    'A styled native fieldset that groups related Fields under a legend, with the native disabled attribute cascading to every nested control.',
  element: 'fieldset',
  anatomy: [
    {
      name: 'legend',
      description: 'The native legend that names the group for assistive tech; floats on the border when bordered.',
      required: true,
    },
    {
      name: 'description',
      description: 'A muted supporting line under the legend, tied to the group through aria-describedby.',
    },
    { name: 'actions', description: 'An optional row of actions pinned to the end of the legend line.' },
    { name: 'content', description: 'The stacked group of Fields, one gap step apart.', required: true },
  ],
  props: [
    { name: 'legend', type: 'node', required: true, description: 'The group label, rendered as a native legend.' },
    { name: 'description', type: 'node', description: 'Muted supporting content under the legend, announced with the group.' },
    { name: 'actions', type: 'node', description: 'Actions aligned to the end of the legend line.' },
    {
      name: 'disabled',
      type: 'boolean',
      default: false,
      description:
        'Sets the NATIVE fieldset disabled attribute, so the browser disables every nested form control with no per-control wiring.',
    },
    {
      name: 'bordered',
      type: 'boolean',
      default: false,
      description: 'Draws the classic hairline box with the legend floating on the border; borderless by default.',
    },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the group geometry.' },
    { name: 'children', type: 'node', required: true, description: 'The grouped form controls, usually Fields.' },
  ],
  defaults: { disabled: false, bordered: false, skeleton: false },
  dimensions: {
    gap: token('space-5'),
    contentOffset: token('space-4'),
    border: token('hairline'),
    radius: token('radius-lg'),
    padding: token('space-5'),
  },
  states: [
    {
      name: 'disabled',
      description:
        'The native attribute disables every nested control for free; the legend and description dim so the state reads at a glance.',
    },
    { name: 'skeleton', description: 'Swaps the legend and description for placeholder lines; nested controls render their own skeletons.' },
  ],
  // the legend and grouped fields paint
  paint: {},
  tokens: [
    'font-sans', 'font-size-md', 'font-size-sm', 'font-weight-semibold', 'leading-sm',
    'space-1', 'space-2', 'space-4', 'space-5',
    'text', 'text-muted', 'hairline', 'border', 'radius-lg',
  ],
  a11y: {
    role: 'group',
    notes: [
      'Renders a real fieldset element: the legend names the group, so screen readers announce it when focus enters any nested control.',
      'The description gets a generated id referenced from the fieldset through aria-describedby; a consumer-supplied aria-describedby is merged, not replaced.',
      'disabled is the native fieldset attribute: the browser removes every nested control from the tab order and blocks interaction without touching each control.',
      'The actions row is regular content inside the group, kept outside the legend so it does not pollute the group name.',
    ],
  },
};
