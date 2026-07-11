import type { ComponentSpec } from '../schema.ts';
import { compactSizes, token } from '../vocab.ts';

/** Marker tones, exported so the React kit derives its union from here. */
export const timelineScrubberMarkerTones = ['neutral', 'accent', 'success', 'warning', 'danger', 'info'] as const;

export const timelineScrubberSpec: ComponentSpec = {
  name: 'TimelineScrubber',
  id: 'timeline-scrubber',
  category: 'organism',
  status: 'draft',
  summary:
    'A flight-recorder control: a horizontal band over a recorded time window with an activity backdrop, event markers, and a draggable playhead. Scrub to inspect any recorded moment, or pin the playhead to the live edge and let new time stream in.',
  element: 'div',
  anatomy: [
    { name: 'track', description: 'The full recorded window; carries the activity backdrop and receives clicks to jump the playhead.', required: true },
    { name: 'activity', description: 'Optional area silhouette of a normalized series (overall load, event density) so the eye can find the interesting moments before scrubbing to them.' },
    { name: 'marker', description: 'A flagged instant on the track: a thin tone-colored tick, e.g. a spike or an alert.' },
    { name: 'playhead', description: 'The draggable vertical line whose position is the inspected time; its grab handle rides above the track edge, never clipped by it.', required: true },
    { name: 'time-readout', description: 'The formatted time under the playhead while scrubbing.' },
    { name: 'ticks', description: 'Sparse time labels along the bottom edge of the track.' },
    { name: 'live-button', description: 'The return-to-live control at the trailing edge; reflects whether the playhead is pinned to now.', required: true },
  ],
  props: [
    { name: 'start', type: 'number', required: true, description: 'Window start, epoch milliseconds.' },
    { name: 'end', type: 'number', required: true, description: 'Window end, epoch milliseconds. While live this is "now" and advances as new samples arrive.' },
    { name: 'value', type: 'number', description: 'The inspected time. Omit to pin the playhead to the live edge.' },
    {
      name: 'onChange',
      type: 'handler',
      description: 'Called with the scrubbed time (epoch ms) as the playhead moves, or null when the user returns to live.',
    },
    {
      name: 'activity',
      type: 'array',
      item: { type: 'number', description: 'One normalized 0-1 sample; samples spread evenly from start to end.' },
      description: 'Optional context series rendered as the track backdrop.',
    },
    {
      name: 'markers',
      type: 'array',
      item: {
        type: 'object',
        description: 'A flagged instant.',
        fields: [
          { name: 'time', type: 'number', required: true, description: 'Epoch milliseconds; clamped into the window.' },
          { name: 'tone', type: 'enum', values: timelineScrubberMarkerTones, description: 'Tick color family. Defaults to neutral.' },
          { name: 'label', type: 'string', description: 'Accessible description of the event, surfaced as the tick tooltip.' },
        ],
      },
      description: 'Flagged instants drawn as thin ticks over the track.',
    },
    { name: 'step', type: 'number', default: 1000, description: 'Arrow-key step in milliseconds; PageUp/PageDown move by ten steps.' },
    { name: 'formatTime', type: 'handler', description: 'Formats a timestamp for the readout, the ticks, and aria-valuetext. Defaults to a locale time string.' },
    { name: 'liveLabel', type: 'string', default: 'Live', description: 'Label for the live button; replace it for localization.' },
    { name: 'size', type: 'enum', values: compactSizes, default: 'md', description: 'Track height step. The handle adds its overhang above the track.' },
    { name: 'glass', type: 'boolean', default: false, description: 'Renders the track and live button on the frosted glass material.' },
    { name: 'disabled', type: 'boolean', default: false, description: 'Blocks scrubbing and dims the control.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
    { name: 'aria-label', type: 'string', required: true, description: 'Accessible name for the scrubber, e.g. "Recorded activity".' },
  ],
  sizes: [
    { name: 'sm', height: '2.5rem' },
    { name: 'md', height: '3.5rem' },
  ],
  defaults: { step: 1000, liveLabel: 'Live', size: 'md', glass: false, disabled: false, skeleton: false },
  dimensions: {
    radius: token('radius-md'),
    border: token('hairline'),
    playheadWidth: '2px',
    markerWidth: '2px',
    handleDiameter: '0.75rem',
    gap: token('space-2'),
    tickFontSize: token('font-size-xs'),
  },
  states: [
    { name: 'default', description: 'Track on the sunken surface, activity backdrop in the accent soft, playhead line in the accent solid.' },
    {
      name: 'live',
      description: 'The playhead hugs the trailing edge and moves with it; the live button fills solid to say "you are watching now".',
      paint: { background: token('accent-solid'), text: token('accent-contrast') },
    },
    {
      name: 'scrubbing',
      description: 'While dragging, the playhead thickens its glow and the time readout appears under it.',
      tokens: { readout: token('surface-raised'), 'playhead-glow': token('accent-soft') },
    },
    {
      name: 'past',
      description: 'Scrubbed away from the live edge: the live button hollows to its soft form, inviting the jump back.',
      paint: { background: token('accent-soft'), text: token('accent-text') },
    },
    {
      name: 'glass',
      description: 'The track and live button swap their solid surfaces for the frosted material.',
      paint: { background: token('glass-regular'), border: token('glass-border') },
      tokens: { highlight: token('glass-highlight') },
    },
    { name: 'disabled', description: 'Dims to the disabled text color and ignores pointer and keyboard input.' },
    { name: 'skeleton', description: 'A pulse placeholder with the exact track geometry.' },
  ],
  focusRing: { ring: token('focus-ring'), offset: '2px' },
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'surface-sunken', 'surface-raised', 'hairline', 'radius-md', 'space-2',
    'accent-solid', 'accent-soft', 'accent-contrast', 'accent-text',
    'text-subtle', 'text-muted', 'font-size-xs',
    'focus-ring', 'duration-fast', 'ease-out',
    'glass-regular', 'glass-border', 'glass-highlight', 'blur-sm', 'glass-saturate',
  ],
  a11y: {
    role: 'slider',
    focusable: true,
    keyboard: [
      { keys: 'ArrowLeft', action: 'Steps the playhead back by one step.' },
      { keys: 'ArrowRight', action: 'Steps the playhead forward by one step; at the live edge it pins to live.' },
      { keys: 'PageUp, PageDown', action: 'Moves by ten steps.' },
      { keys: 'Home', action: 'Jumps to the window start.' },
      { keys: 'End', action: 'Returns to the live edge.' },
    ],
    notes: [
      'The playhead is the slider: aria-valuemin/max are the window bounds and aria-valuetext speaks the formatted time, or the live label when pinned.',
      'Markers are decorative ticks with tooltips; the flagged events must also exist somewhere textual (a list, a feed) for non-pointer users.',
      'The live button is a plain button named by liveLabel and reflects its state with aria-pressed.',
    ],
  },
  motion: {
    description: 'The playhead glides to clicked positions and the live edge advances smoothly; both snap instantly under reduced motion.',
    transition: { speed: 'fast', ease: 'out' },
  },
};
