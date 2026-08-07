import type { ComponentSpec } from '../schema.ts';
import { compactSizes, token } from '../vocab.ts';

/**
 * How the bar paints progress, exported so both kits derive their union from
 * here. The geometry behind each shape lives in `@glacier/logic`.
 */
export const seekBarShapes = [
  'line',
  'wave',
  'waveform',
  'swell',
  'zigzag',
  'spikes',
  'bars',
  'mirror',
] as const;

/** Colour family the played run paints from. Every entry resolves to tokens. */
export const seekBarTones = ['accent', 'success', 'warning', 'danger', 'info', 'neutral'] as const;

/** How the played run is filled: one flat token, or a ramp between two. */
export const seekBarFills = ['solid', 'tonal', 'blend', 'fade'] as const;

/** How visible the run ahead of the playhead is. */
export const seekBarRails = ['muted', 'contrast'] as const;

export const seekBarSpec: ComponentSpec = {
  name: 'SeekBar',
  id: 'seek-bar',
  category: 'atom',
  status: 'draft',
  summary:
    'The transport scrubber for audio: a draggable position bar that can paint itself as a plain rail, a smooth or sharp wave behind the playhead, or a waveform of the track\'s levels.',
  element: 'div',
  anatomy: [
    { name: 'track', description: 'The full duration; takes the pointer so a press anywhere seeks there.', required: true },
    { name: 'played', description: 'The stroked run behind the playhead, in the accent. Level shapes butt their caps so an equalizer reads flat-topped; wave shapes round theirs.', required: true },
    { name: 'ahead', description: 'The stroked run still to play, in the muted track color.', required: true },
    { name: 'thumb', description: 'The draggable playhead on the continuous shapes: a slim vertical pill, kept narrow so it never hides the wave underneath it. The mark shapes (bars, mirror) omit it - the break between painted and unpainted marks already lands the position on a gap, which reads cleaner than a pill covering a mark.', required: false },
  ],
  props: [
    { name: 'duration', type: 'number', required: true, description: 'Track length in seconds.' },
    { name: 'value', type: 'number', description: 'Controlled playhead position in seconds.' },
    { name: 'defaultValue', type: 'number', default: 0, description: 'Initial position when uncontrolled.' },
    { name: 'onValueChange', type: 'handler', description: 'Called with the position in seconds as the user scrubs or keys.' },
    { name: 'onSeekEnd', type: 'handler', description: 'Called once with the final position when the scrub is released, for players that seek on commit rather than continuously.' },
    { name: 'shape', type: 'enum', values: seekBarShapes, default: 'swell', description: 'How progress is painted.' },
    { name: 'rail', type: 'enum', values: seekBarRails, default: 'muted', description: 'How visible the run ahead of the playhead is. Muted suits the page surface; contrast lifts it for raised surfaces like a card, where the segment track is close enough to the surface underneath to vanish.' },
    { name: 'tone', type: 'enum', values: seekBarTones, default: 'accent', description: 'Colour family the played run paints from; the run ahead stays the muted track colour in every tone.' },
    { name: 'fill', type: 'enum', values: seekBarFills, default: 'solid', description: 'Solid lays one token flat. The ramps all carry an OKLCH-mixed midpoint derived from their two ends: tonal stays inside the tone\'s family, blend travels to another family so the hue visibly moves, and fade dissolves the tone toward transparent.' },
    {
      name: 'levels',
      type: 'array',
      item: { type: 'number', description: 'One normalized 0-1 loudness sample; samples spread evenly across the duration.' },
      description: 'Loudness samples read by the waveform, spikes, bars, and mirror shapes. Omitted, every sample reads as full, so the modulated shapes degrade to their even counterparts and the level shapes to an even comb.',
    },
    { name: 'beat', type: 'object', description: 'Live beat state - a 0-1 pulse and the hits still travelling as ripples. The squiggle swells with the pulse and each ripple bumps it as it passes, so the bar deforms in time with what is playing. The plain line ignores it, and reduced motion drops it entirely.' },
    { name: 'intensity', type: 'number', default: 1, description: 'How hard the beat deforms the bar, from 0 (still) to 3. The default of 1 is the tuned baseline: the beat reads as the music without the bar drawing attention to itself. Scales the swell and the ripples together, so turning it up reads as a more emphatic bar rather than a different effect, and 0 holds the bar still without the caller tearing down its meter.' },
    { name: 'tracer', type: 'boolean', default: false, description: "Draws a tracer under the played run: a half-opacity copy of the bar in its own tone, lagging the beat by a fixed slice of time. It holds its shape only as long as the beat it trails does, sinking back toward the flat rail between hits and being thrown out again by the next one, so it reads as something settling behind the bar rather than a second copy of it. Needs a beat to lag behind; without one there is nothing to hold it out, so nothing is drawn." },
    { name: 'step', type: 'number', default: 5, description: 'Arrow-key step in seconds; Page keys move by ten steps.' },
    { name: 'formatTime', type: 'handler', description: 'Formats a position for aria-valuetext. Defaults to m:ss.' },
    { name: 'size', type: 'enum', values: compactSizes, default: 'md', description: 'Bar height step.' },
    { name: 'disabled', type: 'boolean', default: false, description: 'Dims the bar and blocks pointer and keyboard input.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
  ],
  defaults: { defaultValue: 0, shape: 'swell', rail: 'muted', tone: 'accent', fill: 'solid', intensity: 1, tracer: false, step: 5, size: 'md', disabled: false, skeleton: false },
  dimensions: {
    height: '2rem',
    strokeWidth: '3px',
    barStrokeWidth: '2px',
    thumbWidth: '4px',
    radius: token('radius-full'),
    gap: token('space-2'),
  },
  sizes: [
    { name: 'sm', height: '1.5rem' },
    { name: 'md', height: '2rem' },
  ],
  states: [
    { name: 'default', description: 'The played run strokes in the tone\'s solid token, the run ahead in the muted track color.' },
    {
      name: 'gradient',
      description:
        'A ramp along the played run, its midpoint mixed in OKLCH from the two ends rather than left to the renderer. Tonal stays in family (accent-solid to accent-text); blend crosses to another family so the hue travels; fade dissolves toward transparent. The thumb keeps the solid either way, so the playhead stays a definite edge.',
      tokens: { from: token('accent-solid'), to: token('accent-text'), blend: token('success-solid') },
    },
    {
      name: 'scrubbing',
      description: 'While dragging, the thumb grows and the played run tracks the pointer continuously.',
      tokens: { thumb: token('accent-solid') },
    },
    {
      name: 'hover',
      description: 'The bar lifts its ahead run toward the strong border so the whole control reads as grabbable.',
      tokens: { ahead: token('border-strong') },
    },
    {
      name: 'beat',
      description: 'Fed live beat state, the squiggle breathes with the music: the pulse swells the whole run by up to a third of its height, and each hit rises as a crest at the playhead and travels outward, thinning as it goes. Geometry only - no colour changes - so the bar still reads as one control. How far it goes is the intensity prop\'s to set.',
      behavioral: true,
    },
    {
      name: 'tracer',
      description: "A second copy of the played run, drawn underneath in the tone's own solid colour at half opacity and lagging the beat by a fixed slice of time. Unlike the bar, which always draws its full body, the tracer keeps only as much of its resting shape as the beat it trails still carries: each hit throws it out and it settles back toward the rail until the next one catches it. The solid token even under a gradient: a second ramp would drift out of family with the run it is trailing.",
      tokens: { tracer: token('accent-solid') },
    },
    { name: 'focus-visible', description: 'A 2px accent ring outlines the track.', tokens: { ring: token('focus-ring') } },
    { name: 'disabled', description: 'Halved opacity, pointer and keyboard input ignored.' },
    { name: 'skeleton', description: 'A pulse placeholder with the exact bar geometry.' },
  ],
  // the played, ahead, and thumb children carry the paint
  paint: {},
  focusRing: { ring: token('focus-ring'), offset: '2px' },
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'accent-solid', 'accent-text', 'success-solid', 'success-text', 'warning-solid', 'warning-text',
    'danger-solid', 'danger-text', 'info-solid', 'info-text', 'text-subtle', 'text-muted',
    'segment-track', 'border-strong', 'text-subtle', 'radius-full', 'space-2',
    'focus-ring', 'duration-fast', 'ease-out',
  ],
  a11y: {
    role: 'slider',
    focusable: true,
    keyboard: [
      { keys: 'ArrowLeft, ArrowDown', action: 'Steps back by one step.' },
      { keys: 'ArrowRight, ArrowUp', action: 'Steps forward by one step.' },
      { keys: 'PageUp, PageDown', action: 'Moves by ten steps.' },
      { keys: 'Home', action: 'Jumps to the start of the track.' },
      { keys: 'End', action: 'Jumps to the end of the track.' },
    ],
    notes: [
      'The track is the slider: aria-valuemin is 0, aria-valuemax is the duration, and aria-valuetext speaks the formatted position so a screen reader hears "1:24", not "84".',
      'The waveform is decoration and is hidden from assistive tech; the position is carried entirely by the slider value.',
      'Give the bar an aria-label naming what it scrubs, e.g. "Seek".',
    ],
  },
  motion: {
    description:
      'Position never eases. The played run is an SVG path that repaints the instant progress changes and cannot be transitioned, so easing the thumb alone would let the paint arrive ahead of its own playhead on every jump; the two are drawn from one value and move as one. Only size animates - the thumb thickens while the pointer is down - and that snaps under reduced motion. The beat deformation is not a transition either: the shape is redrawn per frame from live audio, which is why reduced motion drops it rather than shortening it.',
    transition: { speed: 'fast', ease: 'out' },
  },
};
