import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/** Elevation levels, exported so the React kit derives its union from here. */
export const surfaceLevels = ['0', '1', '2', 'sunken'] as const;

export const surfaceSpec: ComponentSpec = {
  name: 'Surface',
  id: 'surface',
  category: 'atom',
  status: 'stable',
  summary: 'A plain background plane at one of four elevation levels, the base layer other atoms sit on.',
  element: 'div',
  props: [
    {
      name: 'level',
      type: 'enum',
      values: surfaceLevels,
      default: '1',
      description: '0 = app background, 1 = surface, 2 = raised, sunken = inset well.',
    },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
    { name: 'glass', type: 'boolean', default: false, description: 'Renders the frosted glass material instead of a solid surface.' },
    { name: 'children', type: 'node', description: 'Surface content.' },
  ],
  variants: [
    { name: '0', description: 'App background plane.', tokens: { background: token('bg') } },
    { name: '1', description: 'Default surface, one step above the background.', tokens: { background: token('surface') } },
    { name: '2', description: 'Raised surface for layered content.', tokens: { background: token('surface-raised') } },
    { name: 'sunken', description: 'Inset well recessed below the surface.', tokens: { background: token('surface-sunken') } },
  ],
  defaults: { level: '1', skeleton: false, glass: false },
  tokens: ['font-sans', 'text', 'bg', 'surface', 'surface-raised', 'surface-sunken', 'radius-lg'],
  a11y: {
    focusable: false,
    notes: ['A presentational container with no role of its own; carries whatever role its content sets.'],
  },
};
