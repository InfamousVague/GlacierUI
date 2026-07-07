import type { ComponentSpec } from '../schema.ts';
import { toneSpecs, token } from '../vocab.ts';

/** Size steps, exported so the React kit derives its union from here. */
export const progressBarSizes = ['sm', 'md'] as const;

/** Tones a ProgressBar accepts (a subset of the shared tone families). */
export const progressBarTones = ['accent', 'success', 'warning', 'danger'] as const;

export const progressBarSpec: ComponentSpec = {
  name: 'ProgressBar',
  id: 'progress-bar',
  category: 'atom',
  status: 'stable',
  summary: 'A horizontal track with a tone-filled bar, for determinate progress or an indeterminate sweep.',
  element: 'div',
  anatomy: [
    { name: 'track', description: 'The full-width rounded rail the fill sits in.', required: true },
    { name: 'fill', description: 'The tone-colored bar, sized to the value or swept when indeterminate.', required: true },
  ],
  props: [
    { name: 'value', type: 'number', description: '0 to max. Omit for an unknown duration.' },
    { name: 'max', type: 'number', default: 100, description: 'Upper bound of the value range.' },
    { name: 'indeterminate', type: 'boolean', default: false, description: 'Sweeps continuously for an unknown duration.' },
    { name: 'size', type: 'enum', values: progressBarSizes, default: 'md', description: 'Track thickness step.' },
    { name: 'tone', type: 'enum', values: progressBarTones, default: 'accent', description: 'Fill color family.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
    { name: 'aria-label', type: 'string', description: 'Accessible name for the bar.' },
  ],
  tones: toneSpecs(progressBarTones),
  sizes: [
    { name: 'sm', height: '0.375rem' },
    { name: 'md', height: '0.625rem' },
  ],
  defaults: { max: 100, indeterminate: false, size: 'md', tone: 'accent', skeleton: false },
  dimensions: { radius: token('radius-full') },
  states: [
    { name: 'determinate', description: 'Fill width is (clamped value / max) as a percentage.' },
    { name: 'indeterminate', description: 'A 40%-wide fill sweeps left to right on a loop; value is omitted.' },
  ],
  tokens: [
    'radius-full', 'segment-track', 'accent-solid', 'success-solid', 'warning-solid', 'danger-solid',
    'duration-normal', 'ease-out', 'ease-in-out',
  ],
  a11y: {
    role: 'progressbar',
    focusable: false,
    notes: [
      'Sets aria-valuemin=0, aria-valuemax=max, and aria-valuenow to the clamped value.',
      'Omits aria-valuenow when indeterminate or value is undefined.',
      'Supply aria-label to name the bar.',
    ],
  },
  motion: {
    description: 'Determinate fill eases its width on change; the indeterminate bar sweeps on a loop. Both fall back to an opacity pulse under reduced motion.',
    transition: { speed: 'normal', ease: 'out' },
  },
};
