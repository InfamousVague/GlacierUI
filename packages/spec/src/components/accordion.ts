import type { ComponentSpec } from '../schema.ts';

export const accordionSpec: ComponentSpec = {
  name: 'Accordion',
  id: 'accordion',
  category: 'molecule',
  status: 'stable',
  summary: 'A vertically stacked list of disclosure panels that expand to reveal content.',
  element: 'div',
  anatomy: [
    { name: 'trigger', description: 'The header button that toggles an item.', required: true },
    { name: 'content', description: 'The panel shown when an item is open.', required: true },
  ],
  props: [
    { name: 'items', type: 'element', required: true, description: 'Accordion items with title, content, id, and optional disabled state.' },
    { name: 'defaultOpen', type: 'element', description: 'The initially open item or items.' },
    { name: 'allowMultiple', type: 'boolean', default: false, description: 'Allows more than one panel to be open at a time.' },
  ],
  defaults: { allowMultiple: false },
  a11y: {
    role: 'presentation',
    focusable: false,
    keyboard: [{ keys: 'Enter/Space', action: 'Toggle the focused accordion item.' }],
    notes: ['Each item uses a button trigger and exposes expanded state with aria-expanded.']
  },
};
