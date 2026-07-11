import type { ComponentSpec, PaintSpec } from '../schema.ts';
import { compactSizes, toneSpecs, token } from '../vocab.ts';

/** Per-tone dot fill, transcribed from StatusDot.module.css; only background is painted. */
const dotTonePaint: Record<string, PaintSpec> = {
  neutral: { background: token('text-subtle') },
  accent: { background: token('accent-solid') },
  success: { background: token('success-solid') },
  warning: { background: token('warning-solid') },
  danger: { background: token('danger-solid') },
  info: { background: token('info-solid') },
};

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
  tones: toneSpecs().map((tone) => ({ ...tone, paint: dotTonePaint[tone.name] })),
  sizes: [
    { name: 'sm', diameter: token('size-2xs') },
    { name: 'md', diameter: token('size-xs') },
  ],
  defaults: { tone: 'neutral', size: 'md', pulse: false, skeleton: false },
  dimensions: { radius: token('radius-full') },
  states: [
    {
      name: 'pulse',
      description:
        'An expanding, fading ring loops while pulse is set: a ::after in the dot color (background: inherit) scales 1 to 2.6 and fades 0.55 to 0 over 1.6s ease-out.',
      // keyed by tone: the ring inherits the dot fill, so it takes the tone's background token
      tokens: {
        'neutral-ring': token('text-subtle'),
        'accent-ring': token('accent-solid'),
        'success-ring': token('success-solid'),
        'warning-ring': token('warning-solid'),
        'danger-ring': token('danger-solid'),
        'info-ring': token('info-solid'),
      },
    },
  ],
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
