import type { ComponentSpec } from '../schema.ts';
import { controlSizes, token } from '../vocab.ts';

export const audioEqualizerSizes = controlSizes;

export const audioEqualizerSpec: ComponentSpec = {
  name: 'AudioEqualizer',
  id: 'audio-equalizer',
  category: 'molecule',
  status: 'draft',
  summary:
    'A multi-band equalizer: vertical gain sliders centered at 0dB under a draggable response curve, with optional presets for quick tonal profiles.',
  element: 'div',
  anatomy: [
    { name: 'equalizer', description: 'The host group that labels and contains the full control.', required: true },
    { name: 'presets', description: 'An optional segmented preset selector for common EQ curves.' },
    { name: 'reset', description: 'A reset action that clears all band gains back to 0dB.' },
    {
      name: 'curve',
      description:
        'The response curve over the bands: the same gains read as a shape, carrying one draggable node per band.',
    },
    { name: 'bands', description: 'A low-to-high row of vertical gain sliders, one per frequency band.', required: true },
    { name: 'gain', description: 'Per-band gain readout in decibels, using tabular digits for stable width.', required: true },
    { name: 'frequency', description: 'The frequency label under each slider, e.g. 1kHz.', required: true },
  ],
  props: [
    { name: 'value', type: 'array', item: { type: 'number', description: 'Gain for one band in decibels.' }, description: 'Controlled per-band gains.' },
    { name: 'defaultValue', type: 'array', item: { type: 'number', description: 'Gain for one band in decibels.' }, description: 'Initial gains when uncontrolled; missing entries resolve to 0dB.' },
    { name: 'onValueChange', type: 'handler', description: 'Called with the full gain array whenever any band changes.' },
    { name: 'bands', type: 'array', item: { type: 'object', description: '{ id, label } descriptor for one frequency band.' }, description: 'Frequency bands in visual order, low to high.' },
    { name: 'presets', type: 'array', item: { type: 'object', description: '{ id, label, gains } preset descriptor.' }, description: 'Preset options shown above the bands.' },
    { name: 'preset', type: 'string', description: 'Controlled selected preset id.' },
    { name: 'defaultPreset', type: 'string', description: 'Initial selected preset id when uncontrolled.' },
    { name: 'onPresetChange', type: 'handler', description: 'Called with the next preset id, or undefined after manual edits/reset.' },
    { name: 'min', type: 'number', default: -12, description: 'Minimum gain per band, in dB.' },
    { name: 'max', type: 'number', default: 12, description: 'Maximum gain per band, in dB.' },
    { name: 'step', type: 'number', default: 1, description: 'Gain step in dB.' },
    { name: 'size', type: 'enum', values: audioEqualizerSizes, default: 'md', description: 'Control density step for the sliders and labels.' },
    { name: 'disabled', type: 'boolean', default: false, description: 'Dims the control and blocks interaction.' },
    { name: 'hidePresets', type: 'boolean', default: false, description: 'Hides the preset row while keeping the per-band controls.' },
    { name: 'labels', type: 'object', description: 'Localization overrides for equalizer, preset, reset, gain unit, and band labels.' },
    { name: 'aria-label', type: 'string', description: 'Accessible name for the host group.' },
  ],
  sizes: [
    { name: 'sm', height: token('control-height-sm'), gap: token('space-2'), fontSize: token('font-size-xs') },
    { name: 'md', height: token('control-height-md'), gap: token('space-3'), fontSize: token('font-size-xs') },
  ],
  defaults: {
    min: -12,
    max: 12,
    step: 1,
    size: 'md',
    disabled: false,
    hidePresets: false,
  },
  dimensions: {
    sliderLength: '9rem',
    bandWidth: '2.25rem',
    gap: token('space-3'),
  },
  states: [
    { name: 'default', description: 'Bands sit around a 0dB center line, with independent per-band gain control.' },
    {
      name: 'preset',
      description:
        'Selecting a preset applies a full gain curve to every band in one action. Only the gains move; the selected segment paint belongs to SegmentedControl.',
      behavioral: true,
    },
    {
      name: 'edited',
      description:
        'Manual edits clear preset lock and keep a custom curve. Only the selection state changes; the deselected segment paint belongs to SegmentedControl.',
      behavioral: true,
    },
    {
      name: 'dragging',
      description:
        'A curve node held by the pointer. A press anywhere on the chart takes the nearest band and every move until release belongs to that one, so a steep drag past a neighbour cannot hand the band over mid-gesture. The gain snaps to the band step, so a dragged node lands where its slider could.',
      paint: { background: token('accent-solid'), border: token('surface') },
    },
    { name: 'disabled', description: 'Reduced opacity; sliders and actions ignore input.' },
  ],
  paint: {
    text: token('text'),
    subtleText: token('text-subtle'),
    accent: token('accent-solid'),
  },
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'space-2',
    'space-3',
    'text',
    'text-muted',
    'text-subtle',
    'accent-solid',
    'control-height-sm',
    'control-height-md',
    'font-size-xs',
    'duration-fast',
    'ease-out',
  ],
  a11y: {
    role: 'group',
    focusable: false,
    keyboard: [
      { keys: 'Tab', action: 'Moves from presets to each band slider in document order.' },
      { keys: 'Arrow keys', action: 'Adjust the focused band gain by one step.' },
      { keys: 'Home, End', action: 'Jump the focused band to min or max gain.' },
    ],
    notes: [
      'Each band uses a native range input so keyboard and screen reader value behavior come from the platform.',
      'The host is a named group so assistive tech announces the control as one equalizer unit.',
      'Gain readouts are visual; each slider exposes aria-valuetext with the signed dB value.',
      'The curve is a pointer affordance and stays out of the accessibility tree: every node edits a band slider directly below it that is already focusable and announced, so exposing the nodes would place each band in the tab order twice.',
    ],
  },
  motion: {
    description:
      'Band thumbs animate on press and curve nodes grow under the pointer; gain and readout updates are immediate and never eased.',
    press: true,
    transition: { speed: 'fast', ease: 'out' },
  },
};
