import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

export const fieldSpec: ComponentSpec = {
  name: 'Field',
  id: 'field',
  category: 'molecule',
  status: 'stable',
  summary: 'A form-control wrapper that stacks a label, a control, and a hint or error, and wires their aria.',
  element: 'div',
  anatomy: [
    { name: 'label', description: 'The field label, rendered as a native label tied to the control by htmlFor.' },
    { name: 'required', description: 'A red asterisk appended after the label when required is set; aria-hidden.' },
    { name: 'control', description: 'The wrapped form control; reads its id and aria wiring from Field context.', required: true },
    { name: 'meta', description: 'The reserved line below the control that holds the hint or error.' },
    { name: 'hint', description: 'Muted helper text; fades in.' },
    { name: 'error', description: 'Danger-colored message that replaces the hint and shakes in; role alert.' },
  ],
  props: [
    { name: 'label', type: 'node', description: 'The field label.' },
    { name: 'hint', type: 'node', description: 'Muted helper text below the control.' },
    { name: 'error', type: 'node', description: 'Error message; when set it replaces the hint, shakes in, and marks the field invalid.' },
    { name: 'required', type: 'boolean', description: 'Appends a required asterisk after the label.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the field geometry.' },
    { name: 'className', type: 'string', description: 'Extra class on the field wrapper.' },
    { name: 'children', type: 'node', required: true, description: 'The form control to wrap.' },
  ],
  defaults: { skeleton: false },
  // vertical stack; the meta line reserves height so a hint-to-error swap does not jump
  dimensions: { gap: token('space-2') },
  states: [
    {
      name: 'invalid',
      description: 'error is set: the field carries data-invalid and shows the error in place of the hint.',
      tokens: { text: token('danger-text') },
    },
    {
      name: 'required',
      description: 'Shows the danger-colored asterisk after the label.',
      tokens: { marker: token('danger-text') },
    },
    { name: 'skeleton', description: 'Swaps the label and hint for placeholder blocks; the control renders its own skeleton.' },
  ],
  // the label, control, and message children paint
  paint: {},
  tokens: [
    'space-2', 'font-sans', 'font-size-sm', 'font-size-xs', 'font-weight-medium',
    'leading-sm', 'leading-xs', 'text', 'text-muted', 'danger-text',
  ],
  a11y: {
    notes: [
      'Provides a FieldContext with a generated id, the meta describedBy id, and the invalid flag; the wrapped control reads them for htmlFor, aria-describedby, and aria-invalid.',
      'The meta line gets that describedBy id so the hint or error is announced with the control.',
      'The error message renders with role alert so it is announced when it appears.',
      'The required asterisk is aria-hidden; convey requiredness on the control itself.',
    ],
  },
  motion: {
    description: 'The hint fades in; the error fades in and shakes; both collapse to no motion under reduced motion.',
    transition: { speed: 'fast' },
  },
};
