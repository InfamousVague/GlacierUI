import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/** The channel sliders the picker offers. */
export const colorPickerChannels = ['lightness', 'chroma', 'hue'] as const;

/** Picker size steps. */
export const colorPickerSizes = ['sm', 'md'] as const;

export const colorPickerSpec: ComponentSpec = {
  name: 'ColorPicker',
  id: 'color-picker',
  category: 'organism',
  status: 'draft',
  summary:
    'An OKLCH colour picker: lightness, chroma, and hue sliders over a live swatch, with a hex field and optional preset row.',
  element: 'div',
  anatomy: [
    { name: 'swatch', description: 'The current colour, large enough to judge.', required: true },
    { name: 'sliders', description: 'The three channel sliders, each painted with the gradient it traverses.', required: true },
    { name: 'slider', description: 'One channel: lightness, chroma, or hue.', required: true },
    { name: 'field', description: 'The hex input, for typing or pasting an exact value.' },
    { name: 'presets', description: 'A row of fixed swatches, usually the palette a product already owns.' },
    { name: 'gamut', description: 'The out-of-gamut warning, shown when the chosen colour is not displayable.' },
  ],
  props: [
    { name: 'value', type: 'string', description: 'Controlled colour, as a CSS oklch() or hex string.' },
    { name: 'defaultValue', type: 'string', default: 'oklch(0.64 0.162 228)', description: 'Initial colour when uncontrolled.' },
    { name: 'onValueChange', type: 'handler', description: 'Called with the new colour in the same notation the value was given in.' },
    { name: 'format', type: 'enum', values: ['oklch', 'hex'], default: 'oklch', description: 'Which notation to report. OKLCH keeps a colour on the same perceptual footing as the kit\'s own ramps; hex is what most APIs still want.' },
    { name: 'presets', type: 'array', item: { type: 'string', description: 'A colour string.' }, description: 'Fixed swatches offered under the sliders.' },
    { name: 'alpha', type: 'boolean', default: false, description: 'Offers an opacity slider as a fourth channel.' },
    { name: 'size', type: 'enum', values: colorPickerSizes, default: 'md', description: 'Swatch and slider size step.' },
    { name: 'disabled', type: 'boolean', default: false, description: 'Freezes every control.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
  ],
  defaults: { defaultValue: 'oklch(0.64 0.162 228)', format: 'oklch', alpha: false, size: 'md', disabled: false, skeleton: false },
  dimensions: {
    radius: token('radius-lg'),
    gap: token('space-3'),
    trackHeight: token('space-3'),
    border: token('hairline'),
  },
  states: [
    { name: 'default', description: 'A displayable colour, with all three sliders on their gradients.' },
    {
      name: 'selected',
      description: 'A preset matching the current colour, ringed so the palette shows which entry is in use.',
      tokens: { border: token('accent-border') },
    },
    {
      name: 'invalid',
      description: 'The chosen colour is outside sRGB, so the swatch is showing a clamped approximation rather than what was asked for. Said plainly instead of silently displaying the wrong colour.',
      tokens: { text: token('warning-text'), border: token('warning-border') },
    },
    { name: 'disabled', description: 'Halved opacity; every slider and the field ignore input.' },
    { name: 'skeleton', description: 'Placeholder swatch and slider tracks at the real geometry.' },
  ],
  paint: {
    background: token('surface'),
    text: token('text'),
    border: token('border'),
  },
  focusRing: { ring: token('accent-soft'), offset: '2px' },
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'surface', 'surface-raised', 'border', 'border-strong', 'text', 'text-muted', 'text-subtle',
    'accent-soft', 'accent-border', 'warning-text', 'warning-border',
    'space-1', 'space-2', 'space-3', 'radius-lg', 'radius-md', 'radius-full', 'hairline',
    'font-size-sm', 'font-size-xs', 'font-mono', 'duration-fast', 'ease-out',
  ],
  a11y: {
    role: 'group',
    focusable: true,
    keyboard: [
      { keys: 'Arrows', action: 'Steps the focused channel slider.' },
      { keys: 'Home, End', action: 'Sends the focused channel to its minimum or maximum.' },
      { keys: 'Tab', action: 'Moves between the sliders, the hex field, and the presets.' },
    ],
    notes: [
      'Each slider is a real range input with aria-valuetext naming the channel and its value, so "lightness 64%" is announced rather than a bare number.',
      'The hex field is the non-visual route to an exact colour: a picker that can only be driven by dragging a gradient cannot be used without sight.',
      'Colour is never the only channel of information - the current value is always shown as text as well as a swatch.',
      'Presets carry their colour in their accessible name, since a row of unlabelled swatches is a row of unlabelled buttons.',
    ],
  },
  motion: {
    description: 'Nothing animates on drag: a swatch that eases toward the new colour is lying about what is selected while it catches up.',
    transition: { speed: 'fast', ease: 'out' },
  },
};
