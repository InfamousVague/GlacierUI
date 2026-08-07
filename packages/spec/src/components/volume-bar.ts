import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/** What the readout beside the fader prints, if anything. */
export const volumeReadouts = ['gain', 'percent', 'none'] as const;

/** Fader size steps, matching the control scale around it. */
export const volumeBarSizes = ['sm', 'md'] as const;

/**
 * Which way the rail runs.
 *
 * Horizontal is the default, and what a row of controls wants. Vertical stands
 * the rail up for surfaces where height is not the scarce axis, or - as on a
 * docked strip - where width is scarcer still: a standing fader beside the
 * transport costs a column the width of a thumb.
 */
export const volumeBarOrientations = ['horizontal', 'vertical'] as const;

/**
 * Whether the rail is on the surface or behind the speaker button.
 *
 * Inline is the honest one: the level is visible without asking, and it can be
 * changed in a single movement. Popover is for surfaces with no room to spare -
 * a docked strip, a toolbar - where a rail lying across the width would take
 * the space the thing being played needs. The cost is real and worth naming: a
 * level behind a button cannot be read at a glance. The panel is not asked for,
 * though - it opens while the pointer rests on the speaker, and on focus - so
 * the speaker stays the mute button it is in every other layout, and the panel
 * holds the rail and the readout alone.
 */
export const volumeBarLayouts = ['inline', 'popover'] as const;

export const volumeBarSpec: ComponentSpec = {
  name: 'VolumeBar',
  id: 'volume-bar',
  category: 'molecule',
  status: 'draft',
  summary:
    'A fader with a mute toggle on its leading edge and a level readout on its trailing edge, calibrated in decibels so the number means something.',
  element: 'div',
  anatomy: [
    { name: 'mute', description: 'The speaker button, toggling mute. Its glyph names the state: a struck speaker when muted, and otherwise a speaker whose waves step with the level - none at the bottom of the travel, one below half, two above.', required: true },
    { name: 'slider', description: 'The fader itself, linear in decibels rather than in amplitude.', required: true },
    { name: 'readout', description: 'The level, in whole decibels or as a percentage, in tabular figures so it does not jitter as it moves.' },
  ],
  props: [
    { name: 'value', type: 'number', description: 'Controlled fader position, 0-100, where 100 is unity gain and 0 is off.' },
    { name: 'defaultValue', type: 'number', default: 70, description: 'Initial position when uncontrolled - 70, which is -18dB, a normal listening level rather than full scale.' },
    { name: 'onValueChange', type: 'handler', description: 'Called with the 0-100 position as the fader moves. Pass it through `volumeAmplitude` for the multiplier an audio element takes.' },
    { name: 'muted', type: 'boolean', description: 'Controlled mute state.' },
    { name: 'defaultMuted', type: 'boolean', default: false, description: 'Initial mute state when uncontrolled.' },
    { name: 'onMutedChange', type: 'handler', description: 'Called with the new mute state when the speaker button is pressed.' },
    {
      name: 'readout',
      type: 'enum',
      values: volumeReadouts,
      default: 'gain',
      description: 'What the trailing readout prints. Gain is the honest one - decibels are what the ear is linear in - with percent for surfaces whose audience would not read a decibel, and none where the fader position is enough.',
    },
    { name: 'size', type: 'enum', values: volumeBarSizes, default: 'md', description: 'Steps the mute button and the readout together with the controls around it.' },
    {
      name: 'orientation',
      type: 'enum',
      values: volumeBarOrientations,
      default: 'horizontal',
      description: 'Which way the rail runs. Vertical stands it up beside the mute toggle rather than stacking the two, so the whole of the height it is given goes to the travel.',
    },
    {
      name: 'layout',
      type: 'enum',
      values: volumeBarLayouts,
      default: 'inline',
      description: 'Whether the rail sits on the surface or opens over the speaker button. Popover buys back the width of a rail on surfaces that have none to spare, at the price of a level that can no longer be read at a glance; the panel opens on hover and on focus rather than on a press, so the speaker keeps mute, and it carries the rail and the readout alone.',
    },
    { name: 'disabled', type: 'boolean', default: false, description: 'Dims the row and blocks the fader and the mute toggle.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Loads the button, rail, and readout as placeholders at their real sizes.' },
    { name: 'labels', type: 'object', description: 'Overrides the mute, unmute, and fader labels; merged over the English defaults.' },
  ],
  defaults: { defaultValue: 70, defaultMuted: false, readout: 'gain', size: 'md', orientation: 'horizontal', layout: 'inline', disabled: false, skeleton: false },
  dimensions: { gap: token('space-2'), railLength: '6rem', readoutWidth: '3.5rem' },
  states: [
    { name: 'default', description: 'A speaker glyph, a filled rail, and the level in decibels.' },
    {
      name: 'muted',
      description: 'The speaker is struck through and the rail goes quiet - the position is kept, so unmuting returns to the level that was set rather than to a guess.',
      tokens: { glyph: token('text-muted'), fill: token('text-subtle') },
    },
    {
      name: 'off',
      description: 'The fader pulled to the bottom is silent, not quiet, so the readout says so in words rather than printing a very small number, and the speaker drops its waves without being struck - the level is down, not silenced.',
      tokens: { readout: token('text-subtle') },
    },
    { name: 'disabled', description: 'Halved opacity; the fader and the mute toggle ignore input.' },
    { name: 'skeleton', description: 'A bone for the button, one for the rail, and one at the readout\'s width, so the row loads at its settled size.' },
  ],
  // the slider and icon button carry the paint
  paint: {},
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: ['space-1', 'space-2', 'text', 'text-muted', 'text-subtle', 'accent-solid', 'font-size-xs', 'duration-fast', 'ease-out'],
  a11y: {
    role: 'group',
    focusable: false,
    keyboard: [
      { keys: 'Tab', action: 'Moves to the mute button, then the fader.' },
      { keys: 'Arrows', action: 'Move the fader by one step when it holds focus.' },
      { keys: 'Home, End', action: 'Jump the fader to off or to unity.' },
    ],
    notes: [
      'The fader is a native range input, so its value, its steps, and its keyboard all come from the platform rather than being re-implemented.',
      'Mute is a toggle button reporting itself with aria-pressed, not a second fader position: muting and setting the level to zero are different intentions and only one of them is undoable.',
      'The readout is decorative - the fader already speaks its own value - so it is hidden from the accessibility tree rather than announced twice.',
      'Behind a popover the speaker is still that mute toggle: the panel opens on hover and on focus, and Tab from the speaker moves into it, so the fader is reachable without spending the press.',
    ],
  },
  motion: {
    description: 'The thumb and the mute button animate on press and hover; the fill tracks the value with no easing, so the rail can never appear to lag the sound.',
    press: true,
    transition: { speed: 'fast', ease: 'out' },
  },
};
