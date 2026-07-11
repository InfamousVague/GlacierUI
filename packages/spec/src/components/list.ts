import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

export const listSizes = ['sm', 'md'] as const;

export const listSpec: ComponentSpec = {
  name: 'List',
  id: 'list',
  category: 'molecule',
  status: 'draft',
  summary: 'A semantic single-column list container that provides shared density and optional separators for ListItem rows.',
  element: 'ul',
  anatomy: [
    { name: 'root', description: 'Semantic unordered list container.', required: true },
    { name: 'item', description: 'Direct ListItem row child.' },
    { name: 'divider', description: 'Optional hairline separator between direct rows when divided is true.' },
  ],
  props: [
    { name: 'size', type: 'enum', values: listSizes, default: 'md', description: 'Shared row density step.' },
    { name: 'divided', type: 'boolean', default: false, description: 'Draws a hairline between direct ListItem children.' },
    { name: 'children', type: 'node', description: 'ListItem rows or other semantic list content.' },
  ],
  sizes: [
    { name: 'sm', height: token('control-height-sm'), paddingInline: token('space-3'), gap: token('space-1') },
    { name: 'md', height: token('control-height-md'), paddingInline: token('space-4'), gap: token('space-2') },
  ],
  defaults: { size: 'md', divided: false },
  dimensions: { gap: token('space-2'), border: token('hairline'), radius: token('radius-lg') },
  states: [
    { name: 'divided', description: 'Direct rows are separated by a hairline.', tokens: { border: token('border') } },
  ],
  tokens: [
    'space-1', 'space-2', 'space-3', 'space-4', 'control-height-sm', 'control-height-md',
    'font-sans', 'font-size-xs', 'font-size-sm', 'radius-lg', 'hairline', 'border', 'text',
  ],
  a11y: { role: 'list', notes: ['Renders a native unordered list. Use ListItem for native list-item children.'] },
  motion: { description: 'List itself is static; actionable rows provide native focus feedback.', transition: { speed: 'fast', ease: 'out' } },
};

export const listItemSpec: ComponentSpec = {
  name: 'ListItem',
  id: 'list-item',
  category: 'molecule',
  status: 'draft',
  summary: 'A semantic list row with leading/trailing slots, optional supporting description, selected state, and native actionable variants.',
  element: 'li',
  anatomy: [
    { name: 'row', description: 'The layout surface, rendered as a div, anchor, or button depending on interaction.' },
    { name: 'leading', description: 'Optional decorative leading icon or visual.' },
    { name: 'copy', description: 'Main title and optional supporting description.' },
    { name: 'title', description: 'Primary row label.', required: true },
    { name: 'description', description: 'Optional muted supporting line.' },
    { name: 'trailing', description: 'Optional trailing metadata, status, or action affordance.' },
  ],
  props: [
    { name: 'title', type: 'node', required: true, description: 'Primary row label.' },
    { name: 'description', type: 'node', description: 'Optional supporting content below the title.' },
    { name: 'leading', type: 'node', description: 'Optional decorative leading content.' },
    { name: 'trailing', type: 'node', description: 'Optional trailing content.' },
    { name: 'selected', type: 'boolean', default: false, description: 'Paints the row with the accent-soft selected treatment.' },
    { name: 'disabled', type: 'boolean', default: false, description: 'Dims content and blocks button-row activation.' },
    { name: 'href', type: 'string', description: 'Renders the row content as a native anchor when supplied.' },
    { name: 'onClick', type: 'handler', description: 'Renders the row content as a native button when supplied.' },
  ],
  defaults: { selected: false, disabled: false },
  dimensions: { gap: token('space-3'), radius: token('radius-lg') },
  states: [
    { name: 'hover', description: 'Interactive card rows step to the active surface; divided rows use the lighter hover wash.', tokens: { background: token('active') } },
    { name: 'focus-visible', description: 'Interactive rows receive an accent focus ring.', tokens: { ring: token('focus-ring') } },
    { name: 'selected', description: 'Selected rows use the accent-soft surface, an accent border, and accent text.', tokens: { background: token('accent-soft'), border: token('accent-border'), text: token('accent-text') } },
    { name: 'disabled', description: 'Disabled rows use the disabled text token and block button activation.', tokens: { text: token('text-disabled') } },
  ],
  tokens: [
    'space-1', 'space-2', 'space-3', 'space-4', 'font-size-xs', 'leading-sm', 'radius-lg',
    'hover', 'active', 'surface-raised', 'border-subtle', 'accent-border', 'focus-ring', 'accent-soft', 'accent-text', 'text', 'text-muted', 'text-disabled',
  ],
  a11y: {
    role: 'listitem',
    notes: [
      'Renders a native li. When href is supplied the row content is a native anchor; when onClick is supplied it is a native button.',
      'Do not place another interactive control in the row title when the whole row is already actionable.',
    ],
  },
  motion: { description: 'Interactive row colors ease through native hover and focus states.', transition: { speed: 'fast', ease: 'out' } },
};