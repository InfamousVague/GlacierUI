import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

export const splitOrientations = ['horizontal', 'vertical'] as const;

export const resizableSplitPaneSpec: ComponentSpec = {
  name: 'ResizableSplitPane',
  id: 'resizable-split-pane',
  category: 'organism',
  status: 'stable',
  summary:
    'A container that splits into two panes with a draggable divider: horizontal or vertical, min/max clamped, double-click to reset, and a controlled-or-uncontrolled ratio a consumer can persist.',
  element: 'div',
  anatomy: [
    { name: 'root', description: 'The grid container sizing the start pane by a ratio of the whole.', required: true },
    { name: 'start', description: 'The first pane; its size is the ratio.', required: true },
    { name: 'divider', description: 'The role="separator" drag handle between the panes.', required: true },
    { name: 'end', description: 'The second pane; it fills the remaining space.', required: true },
  ],
  props: [
    { name: 'children', type: 'node', required: true, description: 'Exactly two children: the start pane and the end pane.' },
    { name: 'orientation', type: 'enum', values: splitOrientations, default: 'horizontal', description: 'Split direction; horizontal is side by side, vertical is stacked.' },
    { name: 'ratio', type: 'number', description: 'Controlled start-pane fraction of the container, 0–1.' },
    { name: 'defaultRatio', type: 'number', default: 0.5, description: 'Initial start-pane fraction when uncontrolled.' },
    { name: 'onRatioChange', type: 'handler', description: 'Called with the next ratio on drag, keyboard step, or reset.' },
    { name: 'min', type: 'number', default: 0.1, description: 'Smallest start-pane fraction the divider can reach.' },
    { name: 'max', type: 'number', default: 0.9, description: 'Largest start-pane fraction the divider can reach.' },
    { name: 'resetRatio', type: 'number', description: 'Fraction the divider snaps back to on double-click; defaults to defaultRatio.' },
    { name: 'step', type: 'number', default: 0.02, description: 'Fraction the divider moves per arrow-key press.' },
    { name: 'aria-label', type: 'string', description: 'Accessible name for the divider.' },
  ],
  defaults: { orientation: 'horizontal', defaultRatio: 0.5, min: 0.1, max: 0.9, step: 0.02 },
  dimensions: {
    radius: token('radius-lg'),
    thickness: token('hairline'),
    gripHeight: token('space-6'),
  },
  a11y: {
    role: 'separator',
    focusable: true,
    keyboard: [
      { keys: 'ArrowLeft, ArrowRight', action: 'Moves a horizontal divider toward the start or end by one step.' },
      { keys: 'ArrowUp, ArrowDown', action: 'Moves a vertical divider toward the start or end by one step.' },
      { keys: 'Home, End', action: 'Jumps the divider to its min or max clamp.' },
    ],
    notes: [
      'The divider is a role="separator" with aria-orientation and aria-valuemin/valuemax/valuenow expressed as percentages.',
      'Double-clicking the divider resets the ratio to resetRatio (or defaultRatio).',
      'Sizes are clamped to [min, max] on every drag, keyboard step, and reset.',
    ],
  },
  motion: {
    description: 'The divider and its grip cross-fade on hover and focus; the resize itself is instant. Respects reduced motion.',
    transition: { speed: 'fast', ease: 'out' },
  },
};
