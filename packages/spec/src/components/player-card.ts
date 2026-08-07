import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/** Repeat modes, in the order the button cycles through them. */
export const playerRepeatModes = ['off', 'all', 'one'] as const;

/** How the card arranges what it holds. */
export const playerLayouts = ['stacked', 'inline', 'square', 'bar'] as const;

/** How tightly the card is packed; a subset of the app-wide density words. */
export const playerDensities = ['compact', 'comfortable', 'spacious'] as const;

export const playerCardSpec: ComponentSpec = {
  name: 'PlayerCard',
  id: 'player-card',
  category: 'molecule',
  status: 'draft',
  summary:
    'An audio transport in a card: what is playing, a seek bar with its elapsed and remaining times, and the play, skip, shuffle, and repeat controls under it.',
  element: 'div',
  anatomy: [
    { name: 'card', description: 'The surface everything sits on.', required: true },
    { name: 'artwork', description: 'Album art, sized and placed by the layout.' },
    { name: 'heading', description: 'What is playing: the title, and optional artist and album lines under it.' },
    { name: 'seek-bar', description: 'The SeekBar itself, scrubbing the track.', required: true },
    { name: 'times', description: 'Elapsed on the leading edge, total on the trailing edge, in tabular figures so they do not jitter as the seconds tick.', required: true },
    { name: 'transport', description: 'The control row: shuffle, skip back, play/pause, skip forward, repeat.', required: true },
    { name: 'play', description: 'The play/pause control, the one solid button in a row of quiet ones so the primary action is obvious.', required: true },
  ],
  props: [
    { name: 'artwork', type: 'node', description: 'Album art. A thumbnail beside the heading when stacked, on the leading edge when inline, the square hero when square, and a small chip in the row when bar.' },
    { name: 'layout', type: 'enum', values: playerLayouts, default: 'stacked', description: 'How the card arranges what it holds. Inline top-aligns the artwork beside the title, artist, and album, then breaks so the seek bar spans the card\'s full width. Bar puts the whole card on one line, with the transport leading and the mode toggles closing it out.' },
    { name: 'density', type: 'enum', values: playerDensities, default: 'comfortable', description: 'How tightly it is packed: the row gaps, control sizes, and glyph sizes all step together.' },
    { name: 'title', type: 'node', description: 'What is playing.' },
    { name: 'subtitle', type: 'node', description: 'A second line, usually the artist.' },
    { name: 'album', type: 'node', description: 'A third line naming the album or source.' },
    { name: 'duration', type: 'number', required: true, description: 'Track length in seconds.' },
    { name: 'value', type: 'number', description: 'Controlled playhead position in seconds.' },
    { name: 'defaultValue', type: 'number', default: 0, description: 'Initial position when uncontrolled.' },
    { name: 'onValueChange', type: 'handler', description: 'Called with the position in seconds as the user scrubs or keys.' },
    { name: 'onSeekEnd', type: 'handler', description: 'Called once with the final position when a scrub is released.' },
    { name: 'playing', type: 'boolean', description: 'Controlled play state.' },
    { name: 'defaultPlaying', type: 'boolean', default: false, description: 'Initial play state when uncontrolled.' },
    { name: 'onPlayingChange', type: 'handler', description: 'Called with the new play state when the play/pause control is pressed.' },
    { name: 'onSkipBack', type: 'handler', description: 'Called when skip back is pressed. Omit it and the control is not rendered.' },
    { name: 'onSkipForward', type: 'handler', description: 'Called when skip forward is pressed. Omit it and the control is not rendered.' },
    { name: 'shuffle', type: 'boolean', description: 'Controlled shuffle state.' },
    { name: 'defaultShuffle', type: 'boolean', default: false, description: 'Initial shuffle state when uncontrolled.' },
    { name: 'onShuffleChange', type: 'handler', description: 'Called with the new shuffle state. Omit both this and shuffle to drop the control.' },
    { name: 'repeat', type: 'enum', values: playerRepeatModes, description: 'Controlled repeat mode.' },
    { name: 'defaultRepeat', type: 'enum', values: playerRepeatModes, default: 'off', description: 'Initial repeat mode when uncontrolled.' },
    { name: 'onRepeatChange', type: 'handler', description: 'Called with the next mode as the repeat control cycles off, all, one. Omit both this and repeat to drop the control.' },
    { name: 'shape', type: 'string', description: "The seek bar's shape; forwarded straight through." },
    { name: 'tone', type: 'string', description: "The seek bar's colour family; forwarded straight through." },
    { name: 'fill', type: 'string', description: "How the seek bar's played run is filled; forwarded straight through." },
    { name: 'levels', type: 'array', item: { type: 'number', description: 'One normalized 0-1 loudness sample.' }, description: "The seek bar's loudness samples; forwarded straight through." },
    { name: 'beat', type: 'object', description: "The seek bar's live beat state; forwarded straight through, so a card's bar deforms with the music like a bare one does." },
    { name: 'intensity', type: 'number', description: "How hard the beat deforms the seek bar, from 0 (still) to 3; forwarded straight through, so the bar's own default stands unless the card overrides it." },
    { name: 'tracer', type: 'boolean', default: true, description: "Draws the seek bar's tracer - the shadow trailing the beat. On in a card, unlike on a bare bar: the card is a now-playing surface, where the bar is what is being looked at. Idle without a `beat`." },
    { name: 'formatTime', type: 'handler', description: 'Formats the elapsed and total readouts. Defaults to m:ss, or h:mm:ss past an hour.' },
    { name: 'disabled', type: 'boolean', default: false, description: 'Dims the card and blocks every control.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
  ],
  defaults: { layout: 'stacked', density: 'comfortable', defaultValue: 0, defaultPlaying: false, defaultShuffle: false, defaultRepeat: 'off', disabled: false, skeleton: false },
  dimensions: {
    gap: token('space-4'),
    transportGap: token('space-1'),
    radius: token('radius-xl'),
  },
  states: [
    { name: 'default', description: 'Paused, at the start of the track, with shuffle off and repeat off.' },
    {
      name: 'playing',
      description:
        'The play control shows a pause glyph; nothing else changes, so the row does not reflow as it toggles. It keeps the solid fill either way, since the button is the primary action in both states.',
      tokens: { play: token('accent-solid'), glyph: token('accent-contrast') },
    },
    {
      name: 'active',
      description: 'Shuffle on, or repeat set to all or one, tints its control in the accent so an engaged mode is visible at a glance.',
      tokens: { on: token('accent-text') },
    },
    { name: 'disabled', description: 'Halved opacity; the seek bar and every control ignore input.' },
    { name: 'skeleton', description: 'Every part loads as its own placeholder - the bar traces its shape and each control keeps its own footprint - so the card holds the exact layout it will settle into rather than collapsing to a block.' },
  ],
  // the card, seek bar, and buttons carry the paint
  paint: {},
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'space-1', 'space-4', 'radius-xl', 'accent-solid', 'accent-contrast', 'accent-text',
    'text', 'text-muted', 'text-subtle',
    'font-size-sm', 'font-size-xs', 'duration-fast', 'ease-out',
  ],
  a11y: {
    role: 'group',
    focusable: false,
    keyboard: [
      { keys: 'Tab', action: 'Moves through the seek bar and each control in reading order.' },
      { keys: 'Space, Enter', action: 'Activates the focused control.' },
      { keys: 'Arrows, Home, End', action: 'Scrub the seek bar when it holds focus.' },
    ],
    notes: [
      'The card is a group labelled by its title, so a screen reader announces what the controls belong to before reading them.',
      'Play/pause is one button whose label changes with the state rather than two swapped buttons, so focus survives the toggle.',
      'Shuffle and repeat report their state with aria-pressed; repeat also names the mode in its label, since a three-state control cannot be described by pressed alone.',
      'The elapsed and total readouts are decorative - the seek bar already speaks the position through aria-valuetext.',
    ],
  },
  motion: {
    description: 'Only the controls animate, on press and hover; the readouts and seek bar never ease, so the clock cannot appear to lag the audio.',
    transition: { speed: 'fast', ease: 'out' },
  },
};
