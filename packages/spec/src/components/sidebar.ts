import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/** Spring presets for the active pill, exported so the React kit derives its union from here. */
export const sidebarSprings = ['snappy', 'smooth', 'bouncy'] as const;

export const sidebarSpec: ComponentSpec = {
  name: 'Sidebar',
  id: 'sidebar',
  category: 'structure',
  status: 'stable',
  summary:
    'The bones of a side navigation: an optional pinned header, a scrollable body of sections, and an optional pinned footer.',
  element: 'div',
  anatomy: [
    { name: 'header', description: 'Pinned region at the top, for a brand or a search field. Adds a bottom hairline.' },
    { name: 'body', description: 'The scrollable middle that holds SidebarSection groups.', required: true },
    { name: 'footer', description: 'Pinned region at the bottom, for a profile or settings link. Adds a top hairline.' },
    { name: 'section', description: 'SidebarSection: a titled group of items with an optional uppercase heading.' },
    { name: 'item', description: 'SidebarItem: a navigation row with an icon, label, and optional trailing slot.' },
    { name: 'indicator', description: 'The active pill: one layout element that slides between items behind the row content.' },
  ],
  props: [
    { name: 'header', type: 'node', description: 'Pinned region at the top, for a brand or a search field.' },
    { name: 'footer', type: 'node', description: 'Pinned region at the bottom, for a profile or settings link.' },
    {
      name: 'spring',
      type: 'enum',
      values: sidebarSprings,
      default: 'snappy',
      description: 'Spring preset for the active pill as it slides between items.',
    },
    { name: 'children', type: 'node', description: 'The scrollable body, filled with SidebarSection and SidebarItem.' },
  ],
  defaults: { spring: 'snappy' },
  // regions padded on every side; the body scrolls and stacks its sections
  dimensions: {
    regionPadding: token('space-4'),
    bodyGap: token('space-5'),
    itemGap: token('space-2'),
    itemPaddingBlock: token('space-2'),
    itemPaddingInline: token('space-3'),
    itemRadius: token('radius-md'),
    border: token('hairline'),
  },
  states: [
    {
      name: 'hover',
      description: 'A non-active item washes to the hover background; active items keep the pill instead.',
      tokens: { background: token('hover'), text: token('text') },
    },
    {
      name: 'focus-visible',
      description: 'A 2px inset accent ring outlines the focused item.',
      tokens: { ring: token('focus-ring') },
    },
    {
      name: 'active',
      description: 'The current row shows the soft accent pill and accent text; aria-current is page.',
      tokens: { background: token('accent-soft'), text: token('accent-text') },
    },
    { name: 'disabled', description: 'Halved opacity, not-allowed cursor, and hover suppressed.' },
  ],
  tokens: [
    'font-sans',
    'space-2', 'space-3', 'space-4', 'space-5',
    'hairline', 'border-subtle', 'radius-md',
    'font-size-xs', 'font-size-sm', 'font-weight-medium', 'font-weight-semibold',
    'text', 'text-muted', 'text-subtle',
    'hover', 'accent-soft', 'accent-text', 'focus-ring',
    'duration-fast', 'ease-out',
  ],
  a11y: {
    notes: [
      'The Sidebar is a plain container; give it a nav landmark and an aria-label at the call site.',
      'SidebarItem renders a button by default, or an anchor when given as="a" with an href.',
      'The active item sets aria-current="page"; a disabled item sets aria-disabled and drops the hover wash.',
      'The active pill is aria-hidden; provide an aria-label for an icon-only item.',
    ],
  },
  motion: {
    description:
      'The active pill is a shared layout element that slides between items on the chosen spring; item colors ease on hover. Both respect reduced motion.',
    transition: { spring: 'snappy' },
  },
};
