import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/** Tone families the ring arc supports, a subset of the shared tones. */
export const progressRingTones = ['accent', 'success', 'warning', 'danger'] as const;

export const progressRingSpec: ComponentSpec = {
  name: 'ProgressRing',
  id: 'progress-ring',
  category: 'atom',
  status: 'stable',
  summary: 'A circular progress indicator: a track ring with a toned arc filling from the top, optionally centered with a label or percentage.',
  element: 'div',
  anatomy: [
    { name: 'track', description: 'The full background circle stroked with the track color.' },
    { name: 'arc', description: 'The foreground arc stroked in the tone color, its length set by value/max.' },
    { name: 'center', description: 'Optional centered content: a label node or the rounded percentage.' },
  ],
  props: [
    { name: 'value', type: 'number', required: true, description: '0 to max, clamped into range.' },
    { name: 'max', type: 'number', default: 100, description: 'Upper bound of the value range.' },
    { name: 'size', type: 'number', default: 48, description: 'Pixel diameter of the ring.' },
    { name: 'thickness', type: 'number', default: 4, description: 'Stroke width of the track and arc in pixels.' },
    { name: 'tone', type: 'enum', values: progressRingTones, default: 'accent', description: 'Semantic color family for the arc.' },
    { name: 'label', type: 'node', description: 'Centered content; takes priority over showValue.' },
    { name: 'showValue', type: 'boolean', default: false, description: 'With no label, renders the rounded percentage in the center.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a circular placeholder with the exact geometry.' },
    { name: 'aria-label', type: 'string', description: 'Accessible name for the ring.' },
  ],
  tones: [
    // the tone paints the arc: background here is the arc's SVG stroke color,
    // while the track circle always strokes segment-track
    { name: 'accent', description: 'The brand accent family, for primary emphasis.', paint: { background: token('accent-solid') }, tokens: { stroke: token('accent-solid') } },
    { name: 'success', description: 'Positive or complete states.', paint: { background: token('success-solid') }, tokens: { stroke: token('success-solid') } },
    { name: 'warning', description: 'Caution states that still let the user proceed.', paint: { background: token('warning-solid') }, tokens: { stroke: token('warning-solid') } },
    { name: 'danger', description: 'Errors and destructive states.', paint: { background: token('danger-solid') }, tokens: { stroke: token('danger-solid') } },
  ],
  defaults: { max: 100, size: 48, thickness: 4, tone: 'accent', showValue: false, skeleton: false },
  dimensions: { fontSize: token('font-size-sm') },
  transition: { duration: token('duration-normal'), ease: token('ease-out') },
  tokens: [
    'segment-track', 'accent-solid', 'success-solid', 'warning-solid', 'danger-solid',
    'text', 'font-size-sm', 'duration-normal', 'ease-out',
  ],
  a11y: {
    role: 'progressbar',
    focusable: false,
    notes: [
      'Sets aria-valuemin=0, aria-valuemax=max, and aria-valuenow to the clamped value.',
      'Pass aria-label for an accessible name; the centered percentage is aria-hidden.',
    ],
  },
  motion: {
    description: 'The arc eases its length when the value changes; respects reduced motion.',
    transition: { speed: 'normal', ease: 'out' },
  },
};
