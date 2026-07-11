import type { ComponentSpec, PaintSpec, TokenRef } from '../schema.ts';
import { compactSizes, toneSpecs, token } from '../vocab.ts';

export const pillVariants = ['soft', 'solid', 'outline'] as const;

/**
 * The tone x variant paint matrix, transcribed from Pill.module.css. Each
 * tone's `paint` is its rendering under the default soft variant; the solid
 * and outline renderings ride along in the tone's `tokens` map.
 */
const pillTonePaint: Record<string, { paint: PaintSpec; tokens: Record<string, TokenRef> }> = {
  neutral: {
    paint: { background: token('hover'), text: token('text-muted') },
    tokens: { 'solid-background': token('gray-9'), 'solid-text': token('accent-contrast'), 'outline-border': token('border-strong') },
  },
  accent: {
    paint: { background: token('accent-soft'), text: token('accent-text') },
    tokens: { 'solid-background': token('accent-solid'), 'solid-text': token('accent-contrast'), 'outline-border': token('accent-border') },
  },
  success: {
    paint: { background: token('success-soft'), text: token('success-text') },
    tokens: { 'solid-background': token('success-solid'), 'solid-text': token('success-contrast'), 'outline-border': token('success-border') },
  },
  warning: {
    paint: { background: token('warning-soft'), text: token('warning-text') },
    tokens: { 'solid-background': token('warning-solid'), 'solid-text': token('warning-contrast'), 'outline-border': token('warning-border') },
  },
  danger: {
    paint: { background: token('danger-soft'), text: token('danger-text') },
    tokens: { 'solid-background': token('danger-solid'), 'solid-text': token('danger-contrast'), 'outline-border': token('danger-border') },
  },
  info: {
    paint: { background: token('info-soft'), text: token('info-text') },
    tokens: { 'solid-background': token('info-solid'), 'solid-text': token('info-contrast'), 'outline-border': token('info-border') },
  },
};

export const pillSpec: ComponentSpec = {
  name: 'Pill',
  id: 'pill',
  category: 'atom',
  status: 'stable',
  summary:
    'A compact capsule label in three variants and every tone - for tags, statuses, and counts - with an optional leading icon and an optional remove button that turns it into a dismissible tag.',
  element: 'span',
  anatomy: [
    { name: 'icon', description: 'Optional leading glyph, hidden from assistive tech.' },
    { name: 'label', description: 'The pill content, kept to one line.', required: true },
    { name: 'remove', description: 'Optional trailing remove button, shown when onRemove is set.' },
  ],
  props: [
    { name: 'tone', type: 'enum', values: [...toneSpecs().map((t) => t.name)], default: 'neutral', description: 'Semantic color family.' },
    { name: 'variant', type: 'enum', values: pillVariants, default: 'soft', description: 'Fill treatment.' },
    { name: 'size', type: 'enum', values: compactSizes, default: 'md', description: 'Compact size step.' },
    { name: 'icon', type: 'node', description: 'Leading glyph, hidden from assistive tech.' },
    { name: 'onRemove', type: 'handler', description: 'When set, renders a trailing remove button that calls this on click, turning the pill into a removable tag.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
    { name: 'glass', type: 'boolean', default: false, description: 'Renders the frosted glass material instead of a solid surface.' },
    { name: 'children', type: 'node', required: true, description: 'Pill label.' },
  ],
  variants: [
    // each variant's paint is its rendering at the default neutral tone
    { name: 'soft', description: 'Tinted fill, the default.', paint: { background: token('hover'), text: token('text-muted') } },
    { name: 'solid', description: 'Filled with the tone color.', paint: { background: token('gray-9'), text: token('accent-contrast') } },
    { name: 'outline', description: 'Hairline border on a transparent fill.', paint: { border: token('border-strong'), text: token('text-muted') } },
  ],
  tones: toneSpecs().map((tone) => ({ ...tone, ...(pillTonePaint[tone.name] ?? {}) })),
  sizes: [
    { name: 'sm', height: '1.375rem', paddingInline: token('space-2'), fontSize: token('font-size-xs') },
    { name: 'md', height: '1.75rem', paddingInline: token('space-3'), fontSize: token('font-size-sm') },
  ],
  defaults: { tone: 'neutral', variant: 'soft', size: 'md', skeleton: false, glass: false },
  dimensions: { radius: token('radius-full'), gap: token('space-1'), border: token('hairline') },
  // the ring belongs to the remove control, the pill itself never takes focus
  focusRing: { ring: token('focus-ring'), offset: '1px' },
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'space-1', 'space-2', 'space-3', 'radius-full', 'hairline', 'font-sans', 'font-weight-medium',
    'font-size-xs', 'font-size-sm', 'hover', 'text-muted', 'border-strong', 'gray-9', 'accent-contrast',
    'accent-soft', 'accent-text', 'accent-solid', 'accent-border', 'success-soft', 'success-text', 'success-solid',
    'success-contrast', 'success-border', 'warning-soft', 'warning-text', 'warning-solid', 'warning-contrast',
    'warning-border', 'danger-soft', 'danger-text', 'danger-solid', 'danger-contrast', 'danger-border',
    'info-soft', 'info-text', 'info-solid', 'info-contrast', 'info-border', 'focus-ring', 'duration-fast', 'ease-out',
  ],
  a11y: {
    notes: [
      'Decorative by default; the pill text carries the meaning.',
      'When onRemove is set the remove button is labeled from the kit’s translatable Dismiss message and is keyboard reachable.',
    ],
  },
};
