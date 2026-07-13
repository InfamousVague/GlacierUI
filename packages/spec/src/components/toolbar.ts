import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

export const toolbarSpec: ComponentSpec = {
  name: 'Toolbar',
  id: 'toolbar',
  category: 'structure',
  status: 'stable',
  summary: 'A horizontal bar with a start slot, a flexible middle, and an end slot, for app and page headers.',
  element: 'div',
  anatomy: [
    { name: 'start', description: 'Leading slot, such as a menu button or title.' },
    { name: 'content', description: 'The flexible middle; it grows so the end slot hugs the trailing edge.' },
    { name: 'end', description: 'Trailing slot, such as actions.' },
  ],
  props: [
    { name: 'start', type: 'node', description: 'Content pinned to the start.' },
    { name: 'end', type: 'node', description: 'Content pinned to the end.' },
    { name: 'sticky', type: 'boolean', default: false, description: 'Stick to the top of the scroll container.' },
    { name: 'border', type: 'boolean', default: false, description: 'Add a bottom hairline.' },
    { name: 'surface', type: 'boolean', default: false, description: 'Add the translucent glass background.' },
    { name: 'children', type: 'node', description: 'The middle content.' },
  ],
  defaults: { sticky: false, border: false, surface: false },
  // even padding on every side; the middle grows so no slot needs a margin
  dimensions: { padding: token('space-3'), gap: token('space-3') },
  states: [
    { name: 'sticky', description: 'Pins to the top of the scroll container (position: sticky, top 0, z-index 20). Pure positioning with zero paint of its own - pair it with surface so content scrolling under it stays legible.', behavioral: true },
    { name: 'border', description: 'Adds a hairline border-subtle bottom rule.', paint: { border: token('border-subtle') } },
    { name: 'surface', description: 'Adds the translucent glass-thin background with a blur-md, glass-saturate backdrop filter.', paint: { background: token('glass-thin') }, tokens: { blur: token('blur-md'), saturate: token('glass-saturate') } },
  ],
  // the slotted content paints
  paint: {},
  tokens: ['space-3', 'font-sans', 'hairline', 'border-subtle', 'glass-thin', 'blur-md', 'glass-saturate'],
  a11y: {
    notes: ['Give an icon-only control in the start or end slot an aria-label; the toolbar adds no labels of its own.'],
  },
};
