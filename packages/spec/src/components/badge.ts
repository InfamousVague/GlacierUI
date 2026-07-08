import type { ComponentSpec } from '../schema.ts';
import { compactSizes, toneSpecs, token } from '../vocab.ts';

/** Fill treatments the badge supports, exported so the React kit derives its union from here. */
export const badgeVariants = ['soft', 'solid'] as const;

/** Semantic color families the badge supports, exported so the React kit derives its union from here. */
export const badgeTones = ['neutral', 'accent', 'success', 'warning', 'danger', 'info'] as const;

export const badgeSpec: ComponentSpec = {
  name: 'Badge',
  id: 'badge',
  category: 'atom',
  status: 'stable',
  summary: 'A small labeled status badge: an inline-flex text pill in every tone, with a soft or solid fill and two compact sizes.',
  element: 'span',
  anatomy: [{ name: 'label', description: 'The badge text, kept to one short line.', required: true }],
  props: [
    { name: 'tone', type: 'enum', values: badgeTones, default: 'neutral', description: 'Semantic color family.' },
    { name: 'variant', type: 'enum', values: badgeVariants, default: 'soft', description: 'Fill treatment: a tinted soft fill or a solid tone fill.' },
    { name: 'size', type: 'enum', values: compactSizes, default: 'md', description: 'Compact size step.' },
    { name: 'children', type: 'node', required: true, description: 'Badge label.' },
  ],
  variants: [
    { name: 'soft', description: 'Tinted fill on a subtle tone tint, the default.' },
    { name: 'solid', description: 'Filled with the tone color and contrast text.' },
  ],
  tones: toneSpecs(badgeTones),
  sizes: [
    { name: 'sm', height: token('size-md'), paddingInline: token('space-2'), fontSize: token('font-size-xs') },
    { name: 'md', height: token('size-lg'), paddingInline: token('space-2'), fontSize: token('font-size-xs') },
  ],
  defaults: { tone: 'neutral', variant: 'soft', size: 'md' },
  dimensions: { radius: token('radius-full') },
  tokens: [
    'radius-full', 'font-sans', 'font-weight-medium', 'space-2', 'font-size-xs',
    'hover', 'text-muted', 'gray-9', 'accent-contrast',
    'accent-soft', 'accent-text', 'accent-solid',
    'success-soft', 'success-text', 'success-solid', 'success-contrast',
    'warning-soft', 'warning-text', 'warning-solid', 'warning-contrast',
    'danger-soft', 'danger-text', 'danger-solid', 'danger-contrast',
    'info-soft', 'info-text', 'info-solid', 'info-contrast',
  ],
  a11y: {
    focusable: false,
    notes: ['Decorative by default; the badge text carries the meaning. Add an aria-label if the tone alone conveys status.'],
  },
};
