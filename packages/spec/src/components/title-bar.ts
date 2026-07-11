import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

export const titleBarSpec: ComponentSpec = {
  name: 'TitleBar',
  id: 'title-bar',
  category: 'structure',
  status: 'stable',
  summary:
    'The desktop window bar for Tauri and Electron shells: it owns window dragging, centers a one-line title, and can reserve the macOS traffic-light gutter.',
  element: 'header',
  anatomy: [
    { name: 'gutter', description: 'Optional 88px inline-start inset reserved for the macOS close, minimize, and zoom buttons an overlay window paints there.' },
    { name: 'start', description: 'Leading slot after the gutter, for a back control or an app menu. Its controls stay clickable.' },
    { name: 'center', description: 'The centered middle: the one-line title plus any extra content such as a search field.', required: true },
    { name: 'end', description: 'Trailing slot for window-level actions. Its controls stay clickable.' },
  ],
  props: [
    { name: 'title', type: 'node', description: 'One-line centered title, small and muted. It truncates instead of wrapping.' },
    { name: 'start', type: 'node', description: 'Content pinned to the start, after the traffic-light gutter.' },
    { name: 'end', type: 'node', description: 'Content pinned to the end, such as window-level actions.' },
    {
      name: 'trafficLightInset',
      type: 'boolean',
      default: false,
      description: 'Reserve an 88px inline-start gutter for the macOS window controls that a titleBarStyle Overlay window paints over the bar.',
    },
    { name: 'surface', type: 'boolean', default: true, description: 'The translucent glass background with backdrop blur, like the app header.' },
    { name: 'border', type: 'boolean', default: true, description: 'A bottom hairline separating the bar from the window content.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact bar geometry.' },
    { name: 'children', type: 'node', description: 'Extra centered content beside the title, such as a search field.' },
  ],
  defaults: { trafficLightInset: false, surface: true, border: true, skeleton: false },
  // the height sits off the space scale on purpose: window chrome must not
  // breathe with density, so it is a fixed 3.25rem (52px)
  dimensions: {
    height: '3.25rem',
    paddingInline: token('space-3'),
    gap: token('space-3'),
    slotGap: token('space-2'),
    trafficLightInset: '88px',
    border: token('hairline'),
  },
  states: [
    { name: 'surface', description: 'Paints the translucent glass-thin background with a blur-md, glass-saturate backdrop filter.', paint: { background: token('glass-thin') }, tokens: { blur: token('blur-md'), saturate: token('glass-saturate') } },
    { name: 'border', description: 'Adds the hairline border-subtle bottom rule.', paint: { border: token('border-subtle') } },
    {
      name: 'trafficLightInset',
      description:
        'Pads the inline start by the fixed 88px gutter (padding-inline-start: 88px) so content clears the macOS window controls. Pure layout - it moves content without repainting anything, so behavioral is the closest schema fit.',
      behavioral: true,
    },
  ],
  tokens: [
    'font-sans', 'font-size-sm', 'font-weight-medium', 'text-muted',
    'space-2', 'space-3',
    'hairline', 'border-subtle',
    'glass-thin', 'blur-md', 'glass-saturate',
  ],
  a11y: {
    role: 'banner',
    notes: [
      'The bar is a banner landmark by default; pass a role to override it when the window already has one.',
      'The bar and the title carry data-tauri-drag-region so the window drags from them; slot controls do not, so they keep receiving clicks.',
      'Give an icon-only control in the start or end slot an aria-label; the bar adds no labels of its own.',
      'Text selection is disabled on the bar because it is window chrome; never put body copy in it.',
    ],
  },
};
