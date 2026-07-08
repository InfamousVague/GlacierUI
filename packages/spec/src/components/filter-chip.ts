import type { ComponentSpec } from '../schema.ts';
import { compactSizes, token } from '../vocab.ts';

export const filterChipSpec: ComponentSpec = {
  name: 'FilterChip',
  id: 'filter-chip',
  category: 'atom',
  status: 'stable',
  summary:
    'A toggleable filter pill (button, aria-pressed) for faceted filtering: the selected state paints the accent soft tint, with an optional leading icon and trailing count.',
  element: 'button',
  anatomy: [
    { name: 'icon', description: 'An optional leading glyph, hidden from assistive tech.' },
    { name: 'label', description: 'The chip text, kept to one line.', required: true },
    { name: 'count', description: 'An optional trailing count rendered as a CounterBadge.' },
  ],
  props: [
    { name: 'selected', type: 'boolean', description: 'Controlled selected state.' },
    { name: 'defaultSelected', type: 'boolean', default: false, description: 'Initial selected state when uncontrolled.' },
    { name: 'onSelectedChange', type: 'handler', description: 'Called with the next selected state when the chip is toggled.' },
    { name: 'icon', type: 'node', description: 'Leading glyph.' },
    { name: 'count', type: 'number', description: 'Trailing count, rendered as a CounterBadge; hidden when 0 or less.' },
    { name: 'size', type: 'enum', values: compactSizes, default: 'md', description: 'Compact size step.' },
    { name: 'disabled', type: 'boolean', default: false, description: 'Dims the chip and blocks toggling.' },
    { name: 'children', type: 'node', required: true, description: 'Chip label.' },
  ],
  sizes: [
    { name: 'sm', height: '1.375rem', paddingInline: token('space-2'), fontSize: token('font-size-xs') },
    { name: 'md', height: '1.75rem', paddingInline: token('space-3'), fontSize: token('font-size-sm') },
  ],
  defaults: { defaultSelected: false, size: 'md', disabled: false },
  dimensions: { radius: token('radius-full'), gap: token('space-2'), border: token('hairline') },
  states: [
    {
      name: 'selected',
      description: 'aria-pressed is true; the chip fills with the accent soft tint and the trailing count switches to the accent tone.',
      tokens: { background: token('accent-soft'), border: token('accent-border'), text: token('accent-text') },
    },
  ],
  tokens: [
    'space-2', 'space-3', 'radius-full', 'hairline', 'font-sans', 'font-weight-medium',
    'font-size-xs', 'font-size-sm', 'duration-fast', 'ease-out', 'border-strong', 'text-muted',
    'text', 'hover', 'accent-soft', 'accent-soft-hover', 'accent-border', 'accent-text', 'focus-ring',
  ],
  a11y: {
    role: 'button',
    focusable: true,
    keyboard: [
      { keys: 'Enter, Space', action: 'Toggles the chip between selected and unselected.' },
      { keys: 'Tab', action: 'Moves focus to and from the chip.' },
    ],
    notes: [
      'Renders as a button with aria-pressed reflecting the selected state.',
      'The leading icon is aria-hidden; the trailing CounterBadge announces its count via role="status".',
    ],
  },
  motion: {
    description: 'The chip scales down slightly on press; respects reduced motion.',
    press: true,
    transition: { speed: 'fast', ease: 'out' },
  },
};
