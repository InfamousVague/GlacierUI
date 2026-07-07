import type { ComponentSpec } from '../schema.ts';
import { toneSpecs, token } from '../vocab.ts';

/** Dot tones, exported so the React kit derives its union from here. */
export const stepsTones = ['accent', 'success', 'warning', 'danger', 'neutral', 'info'] as const;

/** Dot size steps, exported so the React kit derives its union from here. */
export const stepsSizes = ['sm', 'md'] as const;

export const stepsSpec: ComponentSpec = {
  name: 'Steps',
  id: 'steps',
  category: 'atom',
  status: 'stable',
  summary: 'A row of progress dots marking position through a tour, wizard, or quiz, with the current step enlarged.',
  element: 'div',
  anatomy: [
    { name: 'track', description: 'The inline-flex dot row, centered on its cross axis and laid out with a size-scaled gap.', required: true },
    { name: 'dot', description: 'One step marker; painted completed, current, or upcoming by its index relative to active.', required: true },
    { name: 'skeleton', description: 'In the skeleton branch, the track holds one circular Skeleton placeholder per step at the exact dot diameter.' },
  ],
  props: [
    { name: 'count', type: 'number', required: true, description: 'Total number of steps; renders this many dots. Coerced with floor and clamped to at least zero.' },
    { name: 'active', type: 'number', default: 0, description: 'Zero-based index of the current step. Earlier dots read as completed, later ones as upcoming; the value is clamped into the [0, count - 1] range.' },
    { name: 'tone', type: 'enum', values: [...toneSpecs(stepsTones).map((t) => t.name)], default: 'accent', description: 'Semantic color family for completed and current dots; upcoming dots are tone-agnostic.' },
    { name: 'size', type: 'enum', values: stepsSizes, default: 'md', description: 'Compact size step; sets dot diameter and the gap between dots.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders an aria-hidden placeholder row of circular skeletons with the component\'s exact geometry.' },
  ],
  tones: toneSpecs(stepsTones),
  sizes: [
    { name: 'sm', diameter: '0.375rem', gap: token('space-1') },
    { name: 'md', diameter: '0.5rem', gap: token('space-2') },
  ],
  defaults: { active: 0, tone: 'accent', size: 'md', skeleton: false },
  dimensions: { radius: token('radius-full'), border: token('hairline'), currentScale: '1.5' },
  states: [
    { name: 'completed', description: 'A dot at an index below active, filled solid in the tone; neutral falls back to the subtle text color.' },
    { name: 'current', description: 'The dot at the clamped active index, filled solid in the tone and enlarged via transform: scale(1.5) so it marks position without shifting its neighbors.' },
    { name: 'upcoming', description: 'A dot at an index above active, painted on the surface with an inset hairline border and no fill; tone-agnostic.', tokens: { background: token('surface'), border: token('border') } },
  ],
  tokens: [
    'radius-full', 'space-1', 'space-2', 'hairline', 'border', 'surface',
    'accent-solid', 'success-solid', 'warning-solid', 'danger-solid', 'text-subtle', 'info-solid',
    'duration-fast', 'ease-out',
  ],
  a11y: {
    role: 'group',
    focusable: false,
    notes: [
      'The row is a group with an aria-label of "Step {n} of {count}", where n is the clamped current index plus one; individual dots are aria-hidden and decorative.',
      'Position is conveyed by the label text, not color alone, so completed and current dots need no per-dot semantics.',
      'In the skeleton branch the whole track is aria-hidden and carries no group role or label.',
    ],
  },
  motion: {
    description: 'The current dot eases its enlarging transform in on step change; only transform animates, so neighbors never shift. The transition is removed under reduced motion.',
    transition: { speed: 'fast', ease: 'out' },
  },
};
