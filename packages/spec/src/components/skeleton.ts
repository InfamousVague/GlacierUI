import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/** Shape families, exported so the React kit derives its union from here. */
export const skeletonVariants = ['text', 'rect', 'circle'] as const;

export const skeletonSpec: ComponentSpec = {
  name: 'Skeleton',
  id: 'skeleton',
  category: 'atom',
  status: 'stable',
  summary: 'The kit\'s loading placeholder primitive: a shimmering box in three shapes that every component renders through its skeleton prop.',
  element: 'span',
  props: [
    { name: 'variant', type: 'enum', values: skeletonVariants, default: 'rect', description: 'Shape: text is a 1em line, rect a rounded block, circle a disc.' },
    { name: 'width', type: 'string', description: 'Box width, a CSS length or number of pixels.' },
    { name: 'height', type: 'string', description: 'Box height; defaults to the width for circle, otherwise unset.' },
    { name: 'radius', type: 'string', description: 'Corner radius override, e.g. var(--glacier-control-radius).' },
  ],
  // every shape shares the same wash: a hover-token base swept by an active-token highlight band
  variants: [
    { name: 'text', description: 'A 1em-tall line with a small radius, for placeholder text.', paint: { background: token('hover') }, tokens: { highlight: token('active') } },
    { name: 'rect', description: 'A rounded block, the default, for images and cards.', paint: { background: token('hover') }, tokens: { highlight: token('active') } },
    { name: 'circle', description: 'A full-radius disc; height falls back to width.', paint: { background: token('hover') }, tokens: { highlight: token('active') } },
  ],
  defaults: { variant: 'rect' },
  dimensions: {
    textHeight: '1em',
    textRadius: token('radius-sm'),
    rectRadius: token('radius-md'),
    circleRadius: token('radius-full'),
  },
  tokens: ['hover', 'active', 'radius-sm', 'radius-md', 'radius-full'],
  a11y: {
    focusable: false,
    notes: [
      'Decorative: sets aria-hidden="true".',
      'Mark the loading region with aria-busy at the app level; the skeleton itself carries no semantics.',
    ],
  },
  motion: {
    description: 'A viewport-fixed highlight band sweeps across every on-screen skeleton at 1.8s linear. Under prefers-reduced-motion it becomes a 1.6s ease-in-out opacity pulse.',
  },
};
