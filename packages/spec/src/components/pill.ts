import type { ComponentSpec } from '../schema.ts';
import { compactSizes, toneSpecs, token } from '../vocab.ts';

export const pillVariants = ['soft', 'solid', 'outline'] as const;

export const pillSpec: ComponentSpec = {
  name: 'Pill',
  id: 'pill',
  category: 'atom',
  status: 'stable',
  summary: 'A compact capsule label in three variants and every tone, for tags, statuses, and counts.',
  element: 'span',
  anatomy: [{ name: 'label', description: 'The pill content, kept to one line.', required: true }],
  props: [
    { name: 'tone', type: 'enum', values: [...toneSpecs().map((t) => t.name)], default: 'neutral', description: 'Semantic color family.' },
    { name: 'variant', type: 'enum', values: pillVariants, default: 'soft', description: 'Fill treatment.' },
    { name: 'size', type: 'enum', values: compactSizes, default: 'md', description: 'Compact size step.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
    { name: 'children', type: 'node', required: true, description: 'Pill label.' },
  ],
  variants: [
    { name: 'soft', description: 'Tinted fill, the default.' },
    { name: 'solid', description: 'Filled with the tone color.' },
    { name: 'outline', description: 'Hairline border on a transparent fill.' },
  ],
  tones: toneSpecs(),
  sizes: [
    { name: 'sm', height: '1.375rem', paddingInline: token('space-2'), fontSize: token('font-size-xs') },
    { name: 'md', height: '1.75rem', paddingInline: token('space-3'), fontSize: token('font-size-sm') },
  ],
  defaults: { tone: 'neutral', variant: 'soft', size: 'md', skeleton: false },
  dimensions: { radius: token('radius-full'), gap: token('space-1'), border: token('hairline') },
  tokens: [
    'space-1', 'space-2', 'space-3', 'radius-full', 'hairline', 'font-family-sans', 'font-weight-medium',
    'font-size-xs', 'font-size-sm', 'hover', 'text-muted', 'border-strong', 'gray-9', 'accent-contrast',
    'accent-soft', 'accent-text', 'accent-solid', 'accent-border', 'success-soft', 'success-text', 'success-solid',
    'success-contrast', 'success-border', 'warning-soft', 'warning-text', 'warning-solid', 'warning-contrast',
    'warning-border', 'danger-soft', 'danger-text', 'danger-solid', 'danger-contrast', 'danger-border',
    'info-soft', 'info-text', 'info-solid', 'info-contrast', 'info-border',
  ],
  a11y: { notes: ['Decorative by default; the pill text carries the meaning.'] },
};
