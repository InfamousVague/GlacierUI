import type { ComponentSpec } from '../schema.ts';
import { controlSizes, token } from '../vocab.ts';

/** Control size steps, exported so the React kit derives its union from here. */
export const segmentedControlSizes = controlSizes;

/** Thumb spring presets, exported so the React kit derives its union from here. */
export const segmentedControlSprings = ['snappy', 'smooth', 'bouncy'] as const;

export const segmentedControlSpec: ComponentSpec = {
  name: 'SegmentedControl',
  id: 'segmented-control',
  category: 'molecule',
  status: 'stable',
  summary: 'An iOS-style segmented toggle for a one-of-many choice; the selected thumb springs between segments.',
  element: 'div',
  anatomy: [
    { name: 'track', description: 'The glass container that holds the segments and clips the thumb.', required: true },
    { name: 'segment', description: 'One option: a label wrapping a visually hidden radio input.', required: true },
    { name: 'thumb', description: 'The shared layout element that slides under the selected segment.' },
    { name: 'label', description: 'The option content shown above the thumb.', required: true },
  ],
  props: [
    { name: 'options', type: 'node', required: true, description: 'The choices, each a value plus a label node and optional disabled flag.' },
    { name: 'value', type: 'string', description: 'Controlled selected value.' },
    { name: 'defaultValue', type: 'string', description: 'Initial selected value when uncontrolled; falls back to the first enabled option.' },
    { name: 'onValueChange', type: 'handler', description: 'Fires with the new value when the selection changes.' },
    { name: 'size', type: 'enum', values: segmentedControlSizes, default: 'md', description: 'Control size step.' },
    { name: 'fullWidth', type: 'boolean', default: false, description: 'Stretches the track to the container width with equal-width segments.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
    { name: 'spring', type: 'enum', values: segmentedControlSprings, default: 'snappy', description: 'Spring preset for the thumb.' },
    { name: 'disabled', type: 'boolean', default: false, description: 'Dims every segment and blocks interaction.' },
    { name: 'aria-label', type: 'string', description: 'Accessible name for the radio group.' },
    { name: 'className', type: 'string', description: 'Extra class on the track.' },
  ],
  sizes: [
    { name: 'sm', height: 'calc(var(--glacier-control-height-sm) - 0.375rem)', paddingInline: token('space-3'), fontSize: token('font-size-xs') },
    { name: 'md', height: 'calc(var(--glacier-control-height-md) - 0.375rem)', paddingInline: token('space-4'), fontSize: token('font-size-sm') },
    { name: 'lg', height: 'calc(var(--glacier-control-height-lg) - 0.375rem)', paddingInline: token('space-5'), fontSize: token('font-size-md') },
  ],
  defaults: { size: 'md', fullWidth: false, skeleton: false, spring: 'snappy', disabled: false },
  // track padding is an off-scale 0.1875rem so the segment plus padding equals the control height
  dimensions: { radius: token('control-radius'), padding: '0.1875rem', gap: token('space-2'), border: token('hairline') },
  states: [
    { name: 'selected', description: 'The thumb slides under the segment and its label goes to full text weight and color.', tokens: { thumb: token('segment-thumb'), text: token('text') } },
    { name: 'active', description: 'The pressed segment label scales down to 0.96, easing its transform on the fast/out pair; no repaint.', tokens: { duration: token('duration-fast'), ease: token('ease-out') } },
    { name: 'focus-visible', description: 'A 2px accent ring outlines the focused segment label.', tokens: { ring: token('focus-ring') } },
    { name: 'disabled', description: 'Muted label color and a not-allowed cursor; the input is blocked.', tokens: { text: token('text-disabled') } },
  ],
  // a 2px focus-ring outline drawn by the label's ::after, offset 1px
  paint: { background: '$segment-track', border: '$glass-border' },
  focusRing: { ring: token('focus-ring'), offset: '1px' },
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'space-1', 'space-2', 'space-3', 'space-4', 'space-5',
    'control-height-sm', 'control-height-md', 'control-height-lg', 'control-radius',
    'hairline', 'font-sans', 'font-weight-medium', 'font-weight-semibold',
    'font-size-xs', 'font-size-sm', 'font-size-md',
    'segment-track', 'segment-thumb', 'glass-border', 'glass-highlight', 'glass-saturate', 'blur-sm', 'shadow-2',
    'text', 'text-muted', 'text-disabled', 'focus-ring', 'duration-fast', 'ease-out',
  ],
  a11y: {
    role: 'radiogroup',
    focusable: true,
    keyboard: [
      { keys: 'Arrow keys', action: 'Moves selection to the adjacent segment (native radio behavior).' },
      { keys: 'Space', action: 'Selects the focused segment.' },
      { keys: 'Tab', action: 'Enters the group at the selected segment and leaves it.' },
    ],
    notes: [
      'The track is a radiogroup; each segment is a label wrapping a visually hidden native radio input that carries the accessible state.',
      'The thumb is aria-hidden and purely decorative.',
      'Pass aria-label to name the group; the skeleton track is aria-hidden.',
    ],
  },
  motion: {
    description: 'The selected thumb is a shared Motion layout element, so it springs between segments instead of jumping; reduced motion collapses the spring to an instant move. Pressing a segment scales its label down.',
    press: true,
    transition: { spring: 'snappy' },
  },
};
