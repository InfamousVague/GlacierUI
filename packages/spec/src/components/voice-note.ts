import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/** How tightly the row is packed; the same two words the bubble uses. */
export const voiceNoteDensities = ['compact', 'comfortable'] as const;

export const voiceNoteSpec: ComponentSpec = {
  name: 'VoiceNote',
  id: 'voice-note',
  category: 'molecule',
  status: 'draft',
  summary:
    'A voice message in a bubble: play/pause, the SeekBar drawing the recording\'s waveform, and the running time. A bubble-sized assembly of parts that already exist, not a second audio player.',
  element: 'div',
  anatomy: [
    { name: 'row', description: 'The transport strip: control, bar, readout.', required: true },
    { name: 'play', description: 'The play/pause control — one button whose label changes, so focus survives the toggle.', required: true },
    { name: 'seek-bar', description: 'The SeekBar itself, scrubbing the recording and drawing its levels.', required: true },
    { name: 'time', description: 'Elapsed while playing, total at rest, in tabular figures so the row does not jitter.', required: true },
  ],
  props: [
    { name: 'duration', type: 'number', required: true, description: 'Recording length in seconds.' },
    { name: 'levels', type: 'array', item: { type: 'number', description: 'One normalized 0-1 loudness sample.' }, description: 'The recorded waveform; without it the bar draws an even swell.' },
    { name: 'value', type: 'number', description: 'Controlled playhead position in seconds.' },
    { name: 'defaultValue', type: 'number', default: 0, description: 'Initial position when uncontrolled.' },
    { name: 'onValueChange', type: 'handler', description: 'Called with the position in seconds as the listener scrubs or keys.' },
    { name: 'onSeekEnd', type: 'handler', description: 'Called once with the final position when a scrub is released.' },
    { name: 'playing', type: 'boolean', description: 'Controlled play state.' },
    { name: 'defaultPlaying', type: 'boolean', default: false, description: 'Initial play state when uncontrolled.' },
    { name: 'onPlayingChange', type: 'handler', description: 'Called with the new play state when the control is pressed.' },
    { name: 'density', type: 'enum', values: voiceNoteDensities, default: 'comfortable', description: 'How tightly the row is packed; steps the control and glyph sizes together.' },
    { name: 'shape', type: 'string', default: 'waveform', description: 'The seek bar\'s shape; forwarded straight through.' },
    { name: 'tone', type: 'string', description: 'The seek bar\'s colour family; forwarded straight through.' },
    { name: 'rail', type: 'string', description: 'How visible the run ahead is; forwarded straight through.' },
    { name: 'formatTime', type: 'handler', description: 'Formats the readout. Defaults to m:ss, or h:mm:ss past an hour.' },
    { name: 'disabled', type: 'boolean', default: false, description: 'Dims the row and blocks the control and the bar.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the row\'s exact geometry.' },
    { name: 'labels', type: 'object', description: 'Localized strings for the controls.', fields: [
      { name: 'play', type: 'string', description: 'The play action.' },
      { name: 'pause', type: 'string', description: 'The pause action.' },
      { name: 'seek', type: 'string', description: 'The scrubber\'s name, e.g. "Seek".' },
    ] },
  ],
  defaults: { defaultValue: 0, defaultPlaying: false, density: 'comfortable', shape: 'waveform', disabled: false, skeleton: false },
  dimensions: {
    gap: token('space-2'),
    radius: token('radius-full'),
  },
  states: [
    {
      name: 'playing',
      description: 'The control shows a pause glyph and the readout counts elapsed instead of total; nothing changes width, so the row does not reflow as it plays.',
      tokens: { play: token('accent-solid'), glyph: token('accent-contrast') },
    },
    { name: 'disabled', description: 'Halved opacity; the control and the bar ignore input.' },
    { name: 'skeleton', description: 'The control, the bar, and the readout each load as their own placeholder, at the row\'s final geometry.' },
  ],
  paint: {},
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'space-2', 'radius-full', 'accent-solid', 'accent-contrast',
    'text-muted', 'font-size-xs', 'font-mono', 'duration-fast', 'ease-out',
  ],
  a11y: {
    role: 'group',
    focusable: false,
    keyboard: [
      { keys: 'Tab', action: 'Moves through the play control and the bar.' },
      { keys: 'Space, Enter', action: 'Toggles play when the control holds focus.' },
      { keys: 'Arrows, Home, End', action: 'Scrub the bar when it holds focus.' },
    ],
    notes: [
      'The row is a group named as a voice message, so the two controls are announced as belonging to one thing.',
      'Play/pause is one button whose label changes rather than two that swap, so focus survives the toggle.',
      'The visible readout is decorative: the SeekBar already speaks the position through its value text, and announcing both reads the clock twice.',
    ],
  },
  motion: {
    description: 'Only the control animates, on press and hover; the bar and the readout never ease, so the clock cannot appear to lag the audio.',
    press: true,
    transition: { speed: 'fast', ease: 'out' },
  },
};
