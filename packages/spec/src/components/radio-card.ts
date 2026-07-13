import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

export const radioCardSpec: ComponentSpec = {
  name: 'RadioCard',
  id: 'radio-card',
  category: 'atom',
  status: 'stable',
  summary:
    'A selectable card with radio semantics: a preview tile with a title, description, and icon that checks as one of a group. Works controlled or uncontrolled; group cards by shared name for a one-of-many choice.',
  element: 'label',
  anatomy: [
    { name: 'icon', description: 'Optional leading glyph or preview swatch above the title, tinted with accent-text and marked aria-hidden.' },
    { name: 'title', description: 'The card heading, the primary label of the choice.', required: true },
    { name: 'description', description: 'Optional secondary line under the title, in muted secondary text.' },
    { name: 'children', description: 'Optional extra content below the description, e.g. a preview or a nested control.' },
    { name: 'indicator', description: 'The corner check mark that scales in when the card is selected; aria-hidden.', required: true },
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
    iconSize: token('font-size-md'),
    bodyGap: token('space-1'),
    bodyInset: token('space-5'),
    indicatorInset: token('space-3'),
    indicator: '1.25rem',
  },
  states: [
    {
      name: 'checked',
      description:
        'Border shifts to the accent solid, the surface takes an accent-soft tint, and the corner check scales in. Driven by the hidden input via :has() when uncontrolled and by a checked class when controlled.',
      tokens: { border: token('accent-solid'), background: token('accent-soft'), indicator: token('accent-solid') },
    },
    {
      name: 'hover',
      description: 'The subtle hairline border strengthens to hint at interactivity; a checked card keeps its accent border.',
      tokens: { border: token('border-strong') },
    },
    {
      name: 'focus-visible',
      description: 'Keyboard focus on the hidden input draws a 2px focus ring around the whole card with a 2px offset.',
      tokens: { ring: token('focus-ring') },
    },
    { name: 'disabled', description: 'Halved opacity and a not-allowed cursor; the native input is disabled so it cannot be selected.' },
  ],
  paint: { background: '$surface-raised', text: '$text', border: '$border-subtle' },
  focusRing: { ring: token('focus-ring'), offset: '2px' },
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'space-1', 'space-2', 'space-3', 'space-4', 'space-5', 'hairline', 'radius-lg', 'radius-full',
    'font-sans', 'font-size-xs', 'font-size-sm', 'font-size-md', 'font-weight-semibold', 'leading-md',
    'text', 'text-muted', 'surface-raised', 'border-subtle', 'border-strong',
    'accent-soft', 'accent-solid', 'accent-text', 'accent-contrast',
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
      'The icon and check indicator are aria-hidden; the native input carries the accessible role and checked state.',
      'Group cards with a shared name so the browser and assistive technology treat them as one radio set.',
    ],
  },
  motion: {
    description:
      'The corner check springs in on select and fades out on deselect; respects reduced motion (motion collapses to an instant swap). Controlled cards animate the scale and opacity via Motion; uncontrolled cards use a CSS transition driven off the hidden input state.',
    transition: { speed: 'fast', ease: 'spring' },
  },
};
