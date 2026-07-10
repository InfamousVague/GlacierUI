import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

export const statTileSpec: ComponentSpec = {
  name: 'StatTile',
  id: 'stat-tile',
  category: 'atom',
  status: 'stable',
  summary:
    'A compact stat micro-card: an optional leading icon, a prominent value, and a muted label, with an optional trailing delta or hint. Built on the card surface tokens so a row or grid of tiles reads as one consistent panel.',
  element: 'div',
  anatomy: [
    { name: 'icon', description: 'Optional leading glyph framed in a muted, sunken disc. Decorative and aria-hidden; omitted when unset.' },
    { name: 'value', description: 'The prominent figure - a number, currency, or short string - in the primary text color.', required: true },
    { name: 'hint', description: 'Optional trailing delta or hint aligned to the value baseline, e.g. a change chip or timeframe.' },
    { name: 'label', description: 'The muted label naming what the value measures.', required: true },
  ],
  props: [
    { name: 'icon', type: 'node', description: 'Decorative glyph rendered in the leading disc; the disc is omitted when unset.' },
    { name: 'value', type: 'node', required: true, description: 'The prominent value - a number, currency, or short string.' },
    { name: 'label', type: 'node', required: true, description: 'The muted label naming what the value measures.' },
    { name: 'hint', type: 'node', description: 'Optional trailing delta or hint on the value baseline.' },
    { name: 'glass', type: 'boolean', default: false, description: 'Renders the frosted glass material instead of a solid card.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder mirroring the anatomy: icon disc and hint bones follow the icon and hint props, around the value and label lines.' },
  ],
  defaults: { glass: false, skeleton: false },
  dimensions: {
    gap: token('space-3'),
    radius: token('radius-lg'),
    border: token('hairline'),
    paddingBlock: token('space-4'),
    paddingInline: token('space-5'),
    iconSize: '2.25rem',
    iconRadius: token('radius-md'),
    valueFontSize: token('font-size-2xl'),
    labelFontSize: token('font-size-sm'),
    hintFontSize: token('font-size-xs'),
  },
  states: [
    { name: 'default', description: 'A row: an optional sunken icon disc, then a column of the value (2xl, semibold, primary text) with an optional trailing hint, and a secondary-text label below.' },
    { name: 'glass', description: 'Swaps the solid raised card for the frosted glass material with a top highlight.' },
    { name: 'skeleton', description: 'Replaces the content with two text-line placeholders sized to the value (2xl) and label (sm), holding the same vertical rhythm.' },
  ],
  tokens: [
    'space-1', 'space-2', 'space-3', 'space-4', 'space-5',
    'radius-md', 'radius-lg', 'hairline', 'border-subtle',
    'surface-raised', 'surface-sunken',
    'glass-regular', 'glass-border', 'glass-highlight', 'glass-saturate', 'blur-sm',
    'font-sans', 'font-size-xs', 'font-size-sm', 'font-size-lg', 'font-size-2xl',
    'font-weight-medium', 'font-weight-semibold', 'leading-md',
    'text', 'text-muted',
  ],
  a11y: {
    focusable: false,
    notes: [
      'A presentational container with no role of its own; the value and label are read in source order, so keep the label a short, literal phrase.',
      'The leading icon disc is decorative and marked aria-hidden, so it is not announced.',
      'When the hint conveys direction (up or down), do not rely on color alone - include a glyph or sign so the change is legible without color.',
    ],
  },
  motion: {
    description: 'The component is static and does not animate. In skeleton mode the placeholders inherit the shared Skeleton shimmer, which softens to an opacity pulse under reduced motion.',
  },
};
