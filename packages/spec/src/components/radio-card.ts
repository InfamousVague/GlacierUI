import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

export const radioCardSpec: ComponentSpec = {
  name: 'RadioCard',
  id: 'radio-card',
  category: 'atom',
  status: 'stable',
  summary:
    'A selectable card with radio semantics: a preview tile with a title, description, and icon that checks as one of a group.',
  element: 'label',
  anatomy: [
    { name: 'icon', description: 'Optional leading glyph or preview swatch above the title.' },
    { name: 'title', description: 'The card heading, the primary label of the choice.', required: true },
    { name: 'description', description: 'Optional secondary line describing the choice.' },
    { name: 'children', description: 'Optional extra content below the description, e.g. a preview.' },
    { name: 'indicator', description: 'The check mark that appears in the corner when selected.', required: true },
  ],
  props: [
    { name: 'title', type: 'node', required: true, description: 'The card heading, the primary label.' },
    { name: 'description', type: 'node', description: 'Secondary line under the title.' },
    { name: 'icon', type: 'node', description: 'Leading glyph or preview swatch above the title.' },
    { name: 'checked', type: 'boolean', description: 'Controlled selected state.' },
    { name: 'defaultChecked', type: 'boolean', default: false, description: 'Initial selected state when uncontrolled.' },
    { name: 'onCheckedChange', type: 'handler', description: 'Called with the next checked state when the card is selected.' },
    { name: 'value', type: 'string', description: 'The native radio value submitted with the form.' },
    { name: 'name', type: 'string', description: 'Groups cards into one radio set; only one card per name is selected.' },
    { name: 'disabled', type: 'boolean', default: false, description: 'Dims the card and blocks interaction.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
    { name: 'children', type: 'node', description: 'Extra content rendered below the description.' },
  ],
  defaults: { defaultChecked: false, disabled: false, skeleton: false },
  dimensions: {
    radius: token('radius-lg'),
    padding: token('space-4'),
    gap: token('space-2'),
    border: token('hairline'),
    titleSize: token('font-size-sm'),
    descriptionSize: token('font-size-xs'),
    indicator: '1.25rem',
  },
  states: [
    {
      name: 'checked',
      description: 'Border shifts to accent, the surface takes an accent-soft tint, and a corner check appears.',
      tokens: { border: token('accent-solid'), background: token('accent-soft'), indicator: token('accent-solid') },
    },
    {
      name: 'hover',
      description: 'The border strengthens to hint at interactivity.',
      tokens: { border: token('border-strong') },
    },
    {
      name: 'focus-visible',
      description: 'A 2px accent focus ring blooms outward from the card.',
      tokens: { ring: token('focus-ring') },
    },
    { name: 'disabled', description: 'Halved opacity and not-allowed cursor.' },
  ],
  tokens: [
    'space-2', 'space-3', 'space-4', 'hairline', 'radius-lg', 'radius-full',
    'font-sans', 'font-size-xs', 'font-size-sm', 'font-weight-semibold', 'line-height-normal',
    'text', 'text-secondary', 'surface-raised', 'border-subtle', 'border-strong',
    'accent-soft', 'accent-solid', 'accent-border', 'accent-text', 'accent-contrast',
    'focus-ring', 'duration-fast', 'ease-out', 'ease-spring',
  ],
  a11y: {
    role: 'radio',
    focusable: true,
    keyboard: [
      { keys: 'Space', action: 'Selects the focused card.' },
      { keys: 'Arrow keys', action: 'Moves selection within the shared-name group (native).' },
    ],
    notes: [
      'Wraps a visually hidden native radio input; the label element makes the whole card clickable.',
      'The check indicator is aria-hidden; the native input carries the accessible state.',
      'Group cards with a shared name so assistive technology treats them as one radio set.',
    ],
  },
  motion: {
    description:
      'The corner check springs in on select and fades out on deselect; respects reduced motion. Controlled cards animate via Motion, uncontrolled via CSS on the input state.',
    transition: { speed: 'fast', ease: 'spring' },
  },
};
