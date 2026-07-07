import type { ComponentSpec } from '../schema.ts';
import { compactSizes, token } from '../vocab.ts';

/** Semantic color families the badge supports, exported so the React kit derives its union from here. */
export const counterBadgeTones = ['danger', 'accent', 'neutral', 'success'] as const;

export const counterBadgeSpec: ComponentSpec = {
  name: 'CounterBadge',
  id: 'counter-badge',
  category: 'atom',
  status: 'stable',
  summary: 'A small numeric badge for unread or attention counts on nav icons and tabs, pill-shaped with tabular figures.',
  element: 'span',
  anatomy: [{ name: 'count', description: 'The count label, capped at `${max}+`; hidden from assistive tech via the status label.' }],
  props: [
    { name: 'count', type: 'number', required: true, description: 'The number to display; the badge renders nothing when count is 0 or less.' },
    { name: 'max', type: 'number', default: 99, description: 'Renders `${max}+` when count is greater than max.' },
    { name: 'tone', type: 'enum', values: counterBadgeTones, default: 'danger', description: 'Semantic color family.' },
    { name: 'dot', type: 'boolean', default: false, description: 'Renders a small dot with no number, for presence or attention.' },
    { name: 'size', type: 'enum', values: compactSizes, default: 'md', description: 'Compact size step.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
    { name: 'glass', type: 'boolean', default: false, description: 'Renders the frosted glass material instead of a solid surface.' },
    { name: 'aria-label', type: 'string', description: 'Overrides the status label; defaults to `${count} items`, or `New activity` in dot mode.' },
  ],
  tones: [
    { name: 'danger', description: 'Errors and destructive states, the default.', tokens: { background: token('danger-solid'), text: token('danger-contrast') } },
    { name: 'accent', description: 'The brand accent family, for primary emphasis.', tokens: { background: token('accent-solid'), text: token('accent-contrast') } },
    { name: 'neutral', description: 'The default, low-emphasis gray family.', tokens: { background: token('gray-9'), text: token('accent-contrast') } },
    { name: 'success', description: 'Positive or complete states.', tokens: { background: token('success-solid'), text: token('success-contrast') } },
  ],
  sizes: [
    { name: 'sm', height: '1rem', paddingInline: token('space-1'), fontSize: token('font-size-xs'), diameter: '0.5rem' },
    { name: 'md', height: '1.25rem', paddingInline: token('space-2'), fontSize: token('font-size-xs'), diameter: '0.625rem' },
  ],
  defaults: { max: 99, tone: 'danger', dot: false, size: 'md', skeleton: false, glass: false },
  dimensions: { radius: token('radius-full') },
  tokens: [
    'radius-full', 'font-sans', 'font-weight-semibold', 'space-1', 'space-2', 'font-size-xs',
    'danger-solid', 'danger-contrast', 'accent-solid', 'accent-contrast', 'gray-9',
    'success-solid', 'success-contrast',
  ],
  a11y: {
    role: 'status',
    focusable: false,
    notes: [
      'Sets role="status" and an aria-label so the count is announced; the visible digits are aria-hidden.',
      'In dot mode the label defaults to "New activity"; otherwise to "${count} items".',
    ],
  },
};
