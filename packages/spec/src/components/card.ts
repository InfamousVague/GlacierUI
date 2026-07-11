import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/** Visual materials, exported so the React kit derives its union from here. */
export const cardVariants = ['solid', 'glass'] as const;

/** The elevation steps, one per shadow token. Exported for a binding's union. */
export const cardElevations = [0, 1, 2, 3, 4, 5] as const;

export const cardSpec: ComponentSpec = {
  name: 'Card',
  id: 'card',
  category: 'atom',
  status: 'stable',
  summary: 'A raised surface panel with six elevation steps, an optional glass material, and an interactive lift.',
  element: 'div',
  props: [
    { name: 'elevation', type: 'enum', values: cardElevations.map(String), default: 1, description: 'Shadow depth, 0 through 5.' },
    { name: 'interactive', type: 'boolean', default: false, description: 'Adds a hover lift and shadow bump for clickable cards.' },
    { name: 'variant', type: 'enum', values: cardVariants, default: 'solid', description: 'Surface material; glass renders a translucent blurred pane.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
    { name: 'children', type: 'node', description: 'Card content.' },
  ],
  variants: [
    { name: 'solid', description: 'Opaque raised surface with a subtle hairline border.', paint: { background: token('surface-raised'), border: token('border-subtle'), text: token('text') } },
    { name: 'glass', description: 'Translucent blurred material for chrome over content.', paint: { background: token('glass-regular'), border: token('glass-border'), text: token('text') }, tokens: { highlight: token('glass-highlight') } },
  ],
  defaults: { elevation: 1, interactive: false, variant: 'solid', skeleton: false },
  dimensions: { radius: token('radius-xl'), padding: token('space-6'), border: token('hairline') },
  states: [
    { name: 'elevation-0', description: 'Flat, no shadow.', tokens: { shadow: token('shadow-0') } },
    { name: 'elevation-1', description: 'The default resting depth.', tokens: { shadow: token('shadow-1') } },
    { name: 'elevation-2', description: 'Raised.', tokens: { shadow: token('shadow-2') } },
    { name: 'elevation-3', description: 'Floating.', tokens: { shadow: token('shadow-3') } },
    { name: 'elevation-4', description: 'Overlay depth.', tokens: { shadow: token('shadow-4') } },
    { name: 'elevation-5', description: 'Top layer.', tokens: { shadow: token('shadow-5') } },
    {
      name: 'hover',
      description: 'When interactive, the shadow bumps one step and the card lifts 2px.',
      // keyed by resting elevation: the shadow each step hovers to
      tokens: {
        'elevation-0': token('shadow-1'),
        'elevation-1': token('shadow-2'),
        'elevation-2': token('shadow-3'),
        'elevation-3': token('shadow-4'),
        'elevation-4': token('shadow-5'),
        'elevation-5': token('shadow-5'),
      },
    },
  ],
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'surface-raised', 'hairline', 'border-subtle', 'radius-xl', 'space-6', 'space-2', 'font-sans', 'text',
    'duration-fast', 'ease-out',
    'glass-regular', 'glass-border', 'glass-highlight', 'blur-md', 'glass-saturate',
    'shadow-0', 'shadow-1', 'shadow-2', 'shadow-3', 'shadow-4', 'shadow-5',
    'elevation-overlay-0', 'elevation-overlay-1', 'elevation-overlay-2',
    'elevation-overlay-3', 'elevation-overlay-4', 'elevation-overlay-5',
  ],
  a11y: {
    focusable: false,
    notes: ['A plain container with no implicit role; wire up role and keyboard handling when used as an interactive card.'],
  },
  motion: {
    description: 'When interactive, lifts on hover and presses inward on tap, and eases its shadow; both respect reduced motion.',
    press: true,
    transition: { speed: 'fast', ease: 'out' },
  },
};
