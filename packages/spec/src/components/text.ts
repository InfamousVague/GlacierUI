import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/** Rendered elements, exported so the React kit derives its `as` union from here. */
export const textElements = ['p', 'span', 'div', 'strong', 'em', 'small'] as const;

/** Size steps, exported so bindings share the same font-scale union. */
export const textSizes = ['xs', 'sm', 'md', 'lg'] as const;

/** Semantic text tones, exported so bindings share the union. */
export const textTones = ['default', 'muted', 'subtle', 'accent', 'danger', 'success', 'warning'] as const;

/** Font weights, exported so bindings share the union. */
export const textWeights = ['regular', 'medium', 'semibold', 'bold'] as const;

/** Text alignment options, exported so bindings share the union. */
export const textAligns = ['start', 'center', 'end', 'justify'] as const;

export const textSpec: ComponentSpec = {
  name: 'Text',
  id: 'text',
  category: 'atom',
  status: 'stable',
  summary: 'Body text in four sizes, seven tones, and four weights, with an optional monospace tabular variant.',
  element: 'p',
  props: [
    { name: 'as', type: 'enum', values: textElements, default: 'p', description: 'Rendered host element.' },
    { name: 'size', type: 'enum', values: textSizes, default: 'md', description: 'Font-size step, sets size and line height.' },
    { name: 'tone', type: 'enum', values: textTones, default: 'default', description: 'Semantic text color.' },
    { name: 'weight', type: 'enum', values: textWeights, default: 'regular', description: 'Font weight.' },
    { name: 'mono', type: 'boolean', default: false, description: 'Monospace family with tabular numerals, for values and measurements.' },
    { name: 'align', type: 'enum', values: textAligns, description: 'Text alignment; inherits when unset.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
    { name: 'children', type: 'node', description: 'Text content.' },
  ],
  // each tone paints only the text color; background and border are never touched
  tones: [
    { name: 'default', description: 'Primary body color.', paint: { text: token('text') } },
    { name: 'muted', description: 'Lower-emphasis secondary text.', paint: { text: token('text-muted') } },
    { name: 'subtle', description: 'Faintest text, for captions and hints.', paint: { text: token('text-subtle') } },
    { name: 'accent', description: 'Brand accent text.', paint: { text: token('accent-text') } },
    { name: 'danger', description: 'Error text.', paint: { text: token('danger-text') } },
    { name: 'success', description: 'Positive text.', paint: { text: token('success-text') } },
    { name: 'warning', description: 'Caution text.', paint: { text: token('warning-text') } },
  ],
  sizes: [
    { name: 'xs', fontSize: token('font-size-xs') },
    { name: 'sm', fontSize: token('font-size-sm') },
    { name: 'md', fontSize: token('font-size-md') },
    { name: 'lg', fontSize: token('font-size-lg') },
  ],
  defaults: { as: 'p', size: 'md', tone: 'default', weight: 'regular', mono: false, skeleton: false },
  tokens: [
    'font-sans', 'font-mono',
    'font-size-xs', 'font-size-sm', 'font-size-md', 'font-size-lg',
    'leading-xs', 'leading-sm', 'leading-md', 'leading-lg',
    'font-weight-regular', 'font-weight-medium', 'font-weight-semibold', 'font-weight-bold',
    'text', 'text-muted', 'text-subtle', 'accent-text', 'danger-text', 'success-text', 'warning-text',
  ],
  a11y: {
    focusable: false,
    notes: [
      'Renders a paragraph by default; set as to span, div, strong, em, or small to change semantics.',
      'The skeleton placeholder is a text-variant Skeleton 14ch wide at the chosen font size.',
    ],
  },
};
