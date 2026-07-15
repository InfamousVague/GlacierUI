import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/** Orientations, exported so the React kit derives its union from here. */
export const navBarOrientations = ['horizontal', 'vertical'] as const;

/** Spring presets for the active pill, exported so the React kit derives its union from here. */
export const navBarSprings = ['snappy', 'smooth', 'bouncy'] as const;

export const navBarSpec: ComponentSpec = {
  name: 'NavBar',
  id: 'nav-bar',
  category: 'structure',
  status: 'stable',
  summary:
    'An app-level primary navigation bar: a horizontal row for top navs and tab bars, or a slim vertical icon rail, with a sliding active pill.',
  element: 'nav',
  anatomy: [
    {
      name: 'items',
      description: 'The main run of NavBarItem controls: leading in horizontal orientation, top-aligned in vertical.',
      required: true,
    },
    {
      name: 'end',
      description: 'Pinned to the far end (the trailing edge when horizontal, the bottom when vertical), for a settings item.',
    },
    { name: 'item', description: 'NavBarItem: an icon-first control with an accessible label, an optional badge, and the active pill.' },
    { name: 'icon', description: 'Required leading glyph, hidden from assistive tech; the label is the accessible name.' },
    {
      name: 'label',
      description:
        'The required accessible item label. By default it appears in a tooltip; showLabels renders it beside horizontal icons.',
    },
    {
      name: 'badge',
      description: 'Optional CounterBadge: pinned to the top-right corner of the icon square in vertical, inline after the label in horizontal.',
    },
    { name: 'indicator', description: 'The active pill: one layout element that slides between items behind the item content.' },
  ],
  props: [
    {
      name: 'orientation',
      type: 'enum',
      values: navBarOrientations,
      default: 'horizontal',
      description: 'Horizontal row for a top nav or bottom tab bar; vertical for a slim icon rail.',
    },
    {
      name: 'aria-label',
      type: 'string',
      required: true,
      description: 'Accessible name for the nav landmark. Required: apps often render more than one navigation landmark.',
    },
    { name: 'end', type: 'node', description: 'Content pinned to the far end: bottom when vertical, trailing edge when horizontal.' },
    { name: 'showLabels', type: 'boolean', default: false, description: 'Shows item labels beside icons in horizontal orientation.' },
    {
      name: 'spring',
      type: 'enum',
      values: navBarSprings,
      default: 'snappy',
      description: 'Spring preset for the active pill as it slides between items.',
    },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
    { name: 'children', type: 'node', description: 'The run of NavBarItem controls.' },
  ],
  defaults: { orientation: 'horizontal', showLabels: false, spring: 'snappy', skeleton: false },
  // the rail is the space-12 step of the scale (the classic slim ~3.5rem rail);
  // items are control-height-md squares in vertical and control-height-md tall in horizontal
  dimensions: {
    railSize: token('space-12'),
    itemSize: token('control-height-md'),
    gap: token('space-1'),
    padding: token('space-2'),
    itemPaddingInline: token('space-3'),
    radius: token('radius-md'),
  },
  states: [
    {
      name: 'hover',
      description: 'A non-active item washes to the hover background and full text color; active items keep the pill instead.',
      paint: { background: token('hover'), text: token('text') },
    },
    {
      name: 'focus-visible',
      description: 'A 2px inset accent ring outlines the focused item.',
      tokens: { ring: token('focus-ring') },
    },
    {
      name: 'active',
      description: 'The current item shows the sliding accent-soft pill behind it and takes accent text at medium weight; aria-current is page.',
      paint: { background: token('accent-soft'), text: token('accent-text') },
      tokens: { weight: token('font-weight-medium') },
    },
    { name: 'disabled', description: 'Halved opacity, not-allowed cursor, and hover suppressed.' },
  ],
  // 2px focus-ring outline inset into the item (outline-offset: -2px)
  // the nav items paint
  paint: {},
  focusRing: { ring: token('focus-ring'), offset: '-2px' },
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'font-sans',
    'space-1', 'space-2', 'space-3', 'space-12',
    'control-height-md', 'radius-md',
    'font-size-sm', 'font-weight-medium',
    'text', 'text-muted',
    'hover', 'accent-soft', 'accent-text', 'focus-ring',
    'duration-fast', 'ease-out',
  ],
  a11y: {
    role: 'navigation',
    focusable: true,
    notes: [
      'The root is a nav landmark; aria-label is a required prop so multiple navigation landmarks stay distinguishable.',
      'NavBarItem renders a button by default, or an anchor when given as="a" with an href.',
      'Labels are accessible names and tooltip content by default. showLabels renders them visibly beside horizontal icons.',
      'The active item sets aria-current="page"; a disabled item sets aria-disabled and drops the hover wash.',
      'Item icons and the active pill are aria-hidden; the label is always the accessible name.',
    ],
  },
  motion: {
    description:
      'The active pill is a shared layout element that slides between items on the chosen spring; item colors ease on hover. Both respect reduced motion.',
    transition: { spring: 'snappy' },
  },
};
