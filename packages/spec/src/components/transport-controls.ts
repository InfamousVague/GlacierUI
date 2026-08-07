import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';
import { playerDensities, playerRepeatModes } from './player-card.ts';

/**
 * How loudly the primary control is drawn.
 *
 * - `solid` - a filled button, the way a card draws it: the row has the room,
 *   and a filled disc says which of six glyphs is the one to press.
 * - `quiet` - the same glyph a step larger than its neighbours and in the full
 *   text colour, with nothing behind it. What a docked strip wants, where a
 *   filled disc is the loudest thing on a chrome bar it is not the subject of.
 */
export const transportEmphases = ['solid', 'quiet'] as const;

export const transportControlsSpec: ComponentSpec = {
  name: 'TransportControls',
  id: 'transport-controls',
  category: 'molecule',
  status: 'draft',
  summary:
    'The row of buttons that drives playback: shuffle, previous, stop, play/pause, next, and repeat, in the order every player puts them.',
  element: 'div',
  anatomy: [
    { name: 'row', description: 'The control row itself.', required: true },
    { name: 'shuffle', description: 'Toggles shuffle; tints when engaged.' },
    { name: 'skip-back', description: 'Previous track.' },
    { name: 'stop', description: 'Stops playback and returns to the start - a separate idea from pausing, so it is a separate button.' },
    { name: 'play', description: 'The play/pause control: one button whose glyph and label change, so focus survives the toggle.', required: true },
    { name: 'skip-forward', description: 'Next track.' },
    { name: 'repeat', description: 'Cycles off, all, one; tints on the two engaged modes.' },
  ],
  props: [
    { name: 'playing', type: 'boolean', description: 'Controlled play state.' },
    { name: 'defaultPlaying', type: 'boolean', default: false, description: 'Initial play state when uncontrolled.' },
    { name: 'onPlayingChange', type: 'handler', description: 'Called with the new play state when the play/pause control is pressed.' },
    { name: 'onStop', type: 'handler', description: 'Called when stop is pressed. Omit it and the control is not rendered.' },
    { name: 'onSkipBack', type: 'handler', description: 'Called when previous is pressed. Omit it and the control is not rendered.' },
    { name: 'onSkipForward', type: 'handler', description: 'Called when next is pressed. Omit it and the control is not rendered.' },
    { name: 'shuffle', type: 'boolean', description: 'Controlled shuffle state.' },
    { name: 'defaultShuffle', type: 'boolean', default: false, description: 'Initial shuffle state when uncontrolled.' },
    { name: 'onShuffleChange', type: 'handler', description: 'Called with the new shuffle state. Omit both this and shuffle to drop the control.' },
    { name: 'repeat', type: 'enum', values: playerRepeatModes, description: 'Controlled repeat mode.' },
    { name: 'defaultRepeat', type: 'enum', values: playerRepeatModes, default: 'off', description: 'Initial repeat mode when uncontrolled.' },
    { name: 'onRepeatChange', type: 'handler', description: 'Called with the next mode as repeat cycles off, all, one. Omit both this and repeat to drop the control.' },
    {
      name: 'density',
      type: 'enum',
      values: playerDensities,
      default: 'comfortable',
      description: 'How tightly the row is packed: the gap, button sizes, and glyph sizes all step together, on the same scale a PlayerCard reads.',
    },
    {
      name: 'emphasis',
      type: 'enum',
      values: transportEmphases,
      default: 'solid',
      description: 'How loudly the play control is drawn: a filled disc on a surface that is about the player, a bare larger glyph on a strip that is not.',
    },
    { name: 'disabled', type: 'boolean', default: false, description: 'Dims the row and blocks every control.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Loads each button as its own placeholder, so the row keeps its exact footprint.' },
  ],
  defaults: { defaultPlaying: false, defaultShuffle: false, defaultRepeat: 'off', density: 'comfortable', emphasis: 'solid', disabled: false, skeleton: false },
  dimensions: { gap: token('space-1') },
  states: [
    { name: 'default', description: 'Paused, shuffle off, repeat off. Only the controls that were given something to do are drawn at all.' },
    {
      name: 'playing',
      description: 'The play control shows a pause glyph; nothing else changes, so the row cannot reflow as it toggles.',
      tokens: { play: token('accent-solid'), glyph: token('accent-contrast') },
    },
    {
      name: 'active',
      description: 'Shuffle on, or repeat on all or one, tints its own control so an engaged mode is visible without comparing it to its neighbours.',
      tokens: { on: token('accent-text') },
    },
    { name: 'disabled', description: 'Halved opacity; every control ignores input.' },
    { name: 'skeleton', description: 'One bone per button at that button\'s own size, so the row loads at the width it will settle into.' },
  ],
  // the buttons carry the paint
  paint: {},
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: ['space-0', 'space-1', 'space-3', 'accent-solid', 'accent-contrast', 'accent-text', 'text', 'text-muted', 'duration-fast', 'ease-out'],
  a11y: {
    role: 'group',
    focusable: false,
    keyboard: [
      { keys: 'Tab', action: 'Moves through the controls in reading order.' },
      { keys: 'Space, Enter', action: 'Activates the focused control.' },
    ],
    notes: [
      'The row is a labelled group, so a screen reader says what the buttons belong to before reading them.',
      'Play/pause is one button whose label changes with the state rather than two that swap, so focus survives the toggle.',
      'Shuffle reports itself with aria-pressed; repeat also names its mode in the label, since a three-state control cannot be described by pressed alone.',
      'Stop is offered separately from pause because they are different requests - one gives up the position, the other keeps it.',
    ],
  },
  motion: {
    description: 'Only the buttons animate, on press and hover; the row itself never moves, so a control never shifts out from under a finger.',
    press: true,
    transition: { speed: 'fast', ease: 'out' },
  },
};
