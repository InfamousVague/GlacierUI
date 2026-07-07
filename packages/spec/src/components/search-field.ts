import type { ComponentSpec } from '../schema.ts';
import { controlSize, controlSizes, token } from '../vocab.ts';

export const searchFieldSpec: ComponentSpec = {
  name: 'SearchField',
  id: 'search-field',
  category: 'atom',
  status: 'stable',
  summary: 'A search input with a leading magnifier, a clear button that appears once typed, and an optional trailing shortcut slot.',
  element: 'div',
  anatomy: [
    { name: 'icon', description: 'Leading magnifier glyph, absolutely inset from the left, decorative.' },
    { name: 'input', description: 'The type="search" text field.', required: true },
    { name: 'clear', description: 'Trailing button that clears the value; rendered only when the value is non-empty.' },
    { name: 'shortcut', description: 'Right-aligned slot for a keyboard shortcut hint, e.g. a Kbd.' },
  ],
  props: [
    { name: 'value', type: 'string', description: 'Controlled value.' },
    { name: 'defaultValue', type: 'string', default: '', description: 'Initial value in uncontrolled mode.' },
    { name: 'onValueChange', type: 'handler', description: 'Called with the new string on input and on clear.' },
    { name: 'placeholder', type: 'string', default: 'Search', description: 'Placeholder text.' },
    { name: 'size', type: 'enum', values: controlSizes, default: 'md', description: 'Control size step.' },
    { name: 'shortcut', type: 'node', description: 'Right-aligned slot for a keyboard shortcut hint.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
  ],
  sizes: [
    controlSize('sm', { paddingInline: token('space-8') }),
    controlSize('md', { paddingInline: token('space-8') }),
    controlSize('lg', { paddingInline: token('space-10') }),
  ],
  defaults: { defaultValue: '', placeholder: 'Search', size: 'md', skeleton: false },
  dimensions: { radius: token('radius-lg'), border: token('hairline') },
  states: [
    { name: 'hover', description: 'Border strengthens when not focused or disabled.', tokens: { border: token('border-strong') } },
    { name: 'focus', description: 'Border switches to the focus ring and a 3px accent-soft ring blooms.', tokens: { border: token('focus-ring') } },
    { name: 'disabled', description: 'Halved opacity, sunken surface, not-allowed cursor.', tokens: { background: token('surface-sunken') } },
    { name: 'invalid', description: 'aria-invalid paints a danger border; on focus a danger ring.', tokens: { border: token('danger-border') } },
  ],
  tokens: [
    'space-2', 'space-3', 'space-4', 'space-8', 'space-10',
    'control-height-sm', 'control-height-md', 'control-height-lg',
    'radius-lg', 'radius-full', 'hairline',
    'font-sans', 'font-size-xs', 'font-size-sm', 'font-size-md',
    'surface', 'surface-sunken', 'text', 'text-subtle', 'border', 'border-strong',
    'focus-ring', 'accent-soft', 'danger-border', 'danger-solid', 'danger-soft',
    'duration-fast', 'ease-out',
  ],
  a11y: {
    role: 'searchbox',
    focusable: true,
    keyboard: [{ keys: 'Escape', action: "Clears via the browser's native search field, or use the clear button." }],
    notes: [
      'Reads its id, aria-describedby, and aria-invalid from a surrounding Field when present.',
      'The clear button is labelled "Clear search"; the magnifier icon is aria-hidden.',
    ],
  },
  motion: {
    description: 'Border, box-shadow, and background cross-fade on hover and focus; the clear button eases its color and background.',
    transition: { speed: 'fast', ease: 'out' },
  },
};
