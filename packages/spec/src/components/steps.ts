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
  summary: 'A row of progress dots marking position through a tour, wizard, or quiz.',
  element: 'div',
  anatomy: [
    { name: 'track', description: 'The dot row, laid out with a size-scaled gap.', required: true },
    { name: 'dot', description: 'One step marker; completed, current, or upcoming by its index relative to active.', required: true },
  ],
  props: [
    { name: 'count', type: 'number', required: true, description: 'Total number of steps; renders this many dots.' },
    { name: 'active', type: 'number', default: 0, description: 'Zero-based index of the current step. Earlier dots read as completed, later ones as upcoming.' },
    { name: 'tone', type: 'enum', values: [...toneSpecs(stepsTones).map((t) => t.name)], default: 'accent', description: 'Semantic color family for completed and current dots.' },
    { name: 'size', type: 'enum', values: stepsSizes, default: 'md', description: 'Compact size step; sets dot diameter and gap.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
  ],
  tones: toneSpecs(stepsTones),
  sizes: [
    { name: 'sm', diameter: '0.375rem', gap: token('space-1') },
    { name: 'md', diameter: '0.5rem', gap: token('space-2') },
  ],
  defaults: { active: 0, tone: 'accent', size: 'md', skeleton: false },
  dimensions: { radius: token('radius-full'), currentScale: '1.5' },
  states: [
    { name: 'completed', description: 'A dot at an index below active, filled solid in the tone.' },
    { name: 'current', description: 'The dot at the active index, filled and enlarged to mark position.' },
    { name: 'upcoming', description: 'A dot at an index above active, painted with a subtle border and no fill.', tokens: { background: token('surface'), border: token('border') } },
  ],
  tokens: [
    'radius-full', 'space-1', 'space-2', 'hairline', 'border', 'surface',
    'accent-solid', 'success-solid', 'warning-solid', 'danger-solid', 'text-subtle', 'info-solid',
  ],
  a11y: {
    role: 'group',
    focusable: false,
    notes: [
      'The row is a group with an aria-label of "Step {active + 1} of {count}"; individual dots are decorative.',
      'Position is conveyed by the label text, not color alone.',
    ],
  },
};
