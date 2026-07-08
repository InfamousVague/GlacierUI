import type { ComponentSpec } from '../schema.ts';
import { compactSizes, toneSpecs, token } from '../vocab.ts';

export const statusDotSpec: ComponentSpec = {
  name: 'StatusDot',
  id: 'status-dot',
  category: 'atom',
  status: 'stable',
  summary: 'A small colored dot for presence and status, optionally pulsing for live states.',
  element: 'span',
  props: [
    { name: 'tone', type: 'enum', values: [...toneSpecs().map((t) => t.name)], default: 'neutral', description: 'Semantic color family.' },
    { name: 'size', type: 'enum', values: compactSizes, default: 'md', description: 'Compact size step.' },
    { name: 'pulse', type: 'boolean', default: false, description: 'Adds an expanding ring for live states.' },
    { name: 'label', type: 'string', description: 'Accessible name; when set the dot becomes a status region, otherwise it is decorative.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
  ],
  tones: toneSpecs(),
  sizes: [
    { name: 'sm', diameter: token('size-2xs') },
    { name: 'md', diameter: token('size-xs') },
  ],
  defaults: { tone: 'neutral', size: 'md', pulse: false, skeleton: false },
  dimensions: { radius: token('radius-full') },
  states: [{ name: 'pulse', description: 'An expanding, fading ring in the dot color loops while pulse is set.' }],
  tokens: [
    'radius-full', 'text-subtle', 'accent-solid', 'success-solid', 'warning-solid', 'danger-solid', 'info-solid',
  ],
  a11y: {
    notes: [
      'With a label the dot is role="status"; without one it is aria-hidden and decorative.',
      'The pulse ring is disabled under reduced motion.',
    ],
  },
  motion: { description: 'A looping expand-and-fade ring while pulse is set; disabled under reduced motion.' },
};
