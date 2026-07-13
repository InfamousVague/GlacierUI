import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/** Heading levels, exported so the React kit derives its level and visualLevel unions from here. */
export const headingLevels = [1, 2, 3, 4, 5, 6] as const;

export const headingSpec: ComponentSpec = {
  name: 'Heading',
  id: 'heading',
  category: 'atom',
  status: 'stable',
  summary: 'A semantic h1 through h6 whose visual size follows its level, with an optional visual override.',
  element: 'h2',
  props: [
    { name: 'level', type: 'enum', values: ['1', '2', '3', '4', '5', '6'], default: 2, description: 'Semantic heading level h1 through h6; also sets the visual size.' },
    { name: 'visualLevel', type: 'enum', values: ['1', '2', '3', '4', '5', '6'], description: 'Visual size override when the semantic level and the looks need to differ.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
    { name: 'noMargin', type: 'boolean', default: false, description: 'Removes the heading margin for compact layouts.' },
    { name: 'children', type: 'node', description: 'Heading content.' },
  ],
  sizes: [
    { name: 'h1', fontSize: token('font-size-3xl') },
    { name: 'h2', fontSize: token('font-size-2xl') },
    { name: 'h3', fontSize: token('font-size-xl') },
    { name: 'h4', fontSize: token('font-size-lg') },
    { name: 'h5', fontSize: token('font-size-md') },
    { name: 'h6', fontSize: token('font-size-sm') },
  ],
  defaults: { level: 2, skeleton: false },
  paint: { text: '$text' },
  tokens: [
    'font-sans', 'font-weight-semibold', 'font-weight-bold', 'text', 'text-subtle',
    'font-size-3xl', 'font-size-2xl', 'font-size-xl', 'font-size-lg', 'font-size-md', 'font-size-sm',
    'leading-3xl', 'leading-2xl', 'leading-xl', 'leading-lg', 'leading-md', 'leading-sm',
    'tracking-3xl', 'tracking-2xl', 'tracking-xl',
  ],
  a11y: {
    role: 'heading',
    focusable: false,
    notes: [
      'Renders the h element matching level, so the accessible heading level tracks the document outline.',
      'visualLevel changes only the size, never the rendered element or the semantic level.',
      'h6 is uppercased with tracked letter-spacing and painted in the subtle text color.',
    ],
  },
};
