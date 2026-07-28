import type { ComponentSpec, PaintSpec } from '../schema.ts';
import { compactSizes, token } from '../vocab.ts';

/**
 * The five things a call can know about its link, in order. `unknown` is a
 * first-class value, not a null: before the first probe lands there IS no
 * measurement, and showing zero bars would be a lie that reads as "about to
 * drop" when the truth is "not measured yet".
 */
export const connectionQualityLevels = ['unknown', '0', '1', '2', '3', '4'] as const;

/** Bar fill per graded tone, transcribed by the CSS and read by the native binding. */
const qualityTonePaint: Record<string, PaintSpec> = {
  neutral: { background: token('text-subtle') },
  danger: { background: token('danger-solid') },
  warning: { background: token('warning-solid') },
  success: { background: token('success-solid') },
};

export const connectionQualitySpec: ComponentSpec = {
  name: 'ConnectionQuality',
  id: 'connection-quality',
  category: 'atom',
  status: 'draft',
  summary: 'Four stepped bars showing link quality from 0 to 4, plus an unknown state for before the first measurement lands.',
  element: 'div',
  anatomy: [
    { name: 'bars', description: 'Four bars of increasing height; the filled run takes the graded tone and the rest paint the track.', required: true },
  ],
  props: [
    { name: 'level', type: 'enum', values: connectionQualityLevels, default: 'unknown', description: 'How good the link is, 0 (dropping) to 4 (excellent), or unknown before the first measurement.' },
    { name: 'size', type: 'enum', values: compactSizes, default: 'md', description: 'Compact size step; the bars scale with the box height.' },
    { name: 'label', type: 'string', description: 'Accessible name. Falls back to a generated description of the level.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
  ],
  // Graded rather than a single accent: quality is a judgement, so the color
  // must carry it. 0-1 danger, 2 warning, 3-4 success, unknown neutral. The
  // grading itself lives in @glacier/logic so both bindings grade alike.
  tones: [
    { name: 'neutral', description: 'Unknown: nothing has been measured yet.', paint: qualityTonePaint.neutral },
    { name: 'danger', description: 'Levels 0 and 1: the call is degrading or about to drop.', paint: qualityTonePaint.danger },
    { name: 'warning', description: 'Level 2: usable, but the user should know.', paint: qualityTonePaint.warning },
    { name: 'success', description: 'Levels 3 and 4: healthy.', paint: qualityTonePaint.success },
  ],
  sizes: [
    { name: 'sm', height: token('size-sm') },
    { name: 'md', height: token('size-md') },
  ],
  defaults: { level: 'unknown', size: 'md', skeleton: false },
  dimensions: {
    barWidth: token('space-1'),
    // Off the space scale on purpose: a 4px gutter between 4px bars reads as
    // four separate marks rather than one signal indicator.
    gap: '2px',
    radius: token('radius-xs'),
  },
  states: [
    { name: 'empty', description: 'Bars above the level paint the track, so the indicator keeps its full width at every level.', paint: { background: token('segment-track') } },
    {
      name: 'unknown',
      description: 'Every bar paints the track at half opacity with a neutral cap on the first bar, so the widget reads as "no reading" rather than "no signal".',
      paint: { background: token('segment-track') },
      tokens: { cap: token('text-subtle') },
    },
    { name: 'skeleton', description: 'Four placeholder bars at the exact stepped heights.' },
  ],
  transition: { duration: token('duration-normal'), ease: token('ease-out') },
  tokens: [
    'space-1', 'radius-xs', 'size-sm', 'size-md', 'segment-track', 'text-subtle',
    'danger-solid', 'warning-solid', 'success-solid', 'duration-normal', 'ease-out',
  ],
  a11y: {
    role: 'img',
    focusable: false,
    notes: [
      'One labelled image, not four bars: a screen reader should hear "Connection: good", never "bar, bar, bar, bar".',
      'The label always names the level in words. Color alone carries the grading visually, so the text is what makes it accessible to a user who cannot see the hue.',
      'Unknown announces as unknown rather than as zero, because the two mean opposite things to someone deciding whether to keep talking.',
    ],
  },
  motion: {
    description: 'Bars ease their fill color when the level changes, over the normal duration rather than the fast one — a link indicator that snapped would flicker on every probe.',
    transition: { speed: 'normal', ease: 'out' },
  },
};
