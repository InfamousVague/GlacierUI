import type { ComponentSpec } from '../schema.ts';
import { controlSizes, token } from '../vocab.ts';

/** Tone families, exported so the React kit derives its union from here. */
export const spinnerTones = ['subtle', 'accent', 'inherit'] as const;

export const spinnerSpec: ComponentSpec = {
  name: 'Spinner',
  id: 'spinner',
  category: 'atom',
  status: 'stable',
  summary: 'An indeterminate loading indicator: a spinning ring in three sizes and three tones.',
  element: 'span',
  props: [
    { name: 'size', type: 'enum', values: controlSizes, default: 'md', description: 'Ring size; sm tracks the surrounding font size (1em), md and lg are fixed.' },
    { name: 'tone', type: 'enum', values: spinnerTones, default: 'subtle', description: 'Ring color family.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
    { name: 'aria-label', type: 'string', default: 'Loading', description: 'Accessible name; pass an empty string when a parent already announces loading.' },
  ],
  tones: [
    { name: 'subtle', description: 'The default, low-emphasis gray ring.', tokens: { color: token('text-subtle') } },
    { name: 'accent', description: 'The brand accent ring, for primary emphasis.', tokens: { color: token('accent-solid') } },
    { name: 'inherit', description: 'Takes the current text color.' },
  ],
  sizes: [
    { name: 'sm', diameter: '1em', border: '2px' },
    { name: 'md', diameter: '1.25rem', border: '2px' },
    { name: 'lg', diameter: '1.875rem', border: '3px' },
  ],
  defaults: { size: 'md', tone: 'subtle', skeleton: false, 'aria-label': 'Loading' },
  dimensions: { radius: token('radius-full'), border: '2px' },
  tokens: ['radius-full', 'text-subtle', 'accent-solid'],
  a11y: {
    role: 'status',
    focusable: false,
    notes: [
      'Defaults to aria-label="Loading"; an empty aria-label drops the label and sets aria-hidden so a parent can announce loading instead.',
    ],
  },
  motion: {
    description: 'Rotates a ring with a transparent bottom edge continuously; reduced motion swaps to an opacity pulse.',
    transition: { speed: '0.8s', ease: 'linear' },
  },
};
