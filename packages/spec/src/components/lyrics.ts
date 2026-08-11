import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/**
 * Synced lyrics as a followable, seekable surface. The lines are the timeline
 * of the song made legible: the active one is lit, the rest stand back, and a
 * press on any line is a seek to its moment - the component's whole reason to
 * be interactive rather than a paragraph of text.
 */
export const lyricsSpec: ComponentSpec = {
  name: 'Lyrics',
  id: 'lyrics',
  category: 'molecule',
  status: 'draft',
  summary:
    'Time-synced lyrics that light the active line as playback passes it, follow it at a readable pace, and seek on press.',
  element: 'div',
  anatomy: [
    {
      name: 'scroller',
      description:
        'The scrolling column of lines. It follows the active line - centring it as playback moves - and yields the scroll to the user the moment they take it, resuming a beat after they let go.',
      required: true,
    },
    {
      name: 'line',
      description:
        'One lyric line. A button when the host can seek (pressing it jumps playback to its time), plain text otherwise.',
      required: true,
    },
    { name: 'empty', description: 'What stands in when the track has no lines to show.' },
  ],
  props: [
    {
      name: 'lines',
      type: 'array',
      item: { type: 'object', description: '{ time, text } - seconds from the top of the track, and the line.' },
      description: 'The synced lines in time order. Empty renders the empty message.',
    },
    {
      name: 'position',
      type: 'number',
      description:
        'Playback position in seconds; the last line at or before it is active. Omit for unsynced text - no line lights.',
    },
    {
      name: 'onLineSelect',
      type: 'handler',
      description:
        'Called with the pressed line; the host seeks its player to line.time. Omitted, the lines render as text rather than buttons.',
    },
    {
      name: 'emptyLabel',
      type: 'string',
      default: 'No lyrics for this track',
      description: 'The empty message, replaceable for localization.',
    },
    { name: 'aria-label', type: 'string', description: 'Accessible name for the scroller region.' },
  ],
  defaults: { emptyLabel: 'No lyrics for this track' },
  dimensions: {
    lineGap: token('space-2'),
    padding: token('space-4'),
  },
  states: [
    {
      name: 'default',
      description: 'Lines at rest stand back in the subtle text tone so the active one has somewhere to stand out from.',
      paint: { text: token('text-subtle') },
    },
    {
      name: 'active',
      description:
        'The line playback is inside: lit in the accent text colour, marked aria-current, and kept centred while the user leaves the scroll alone.',
      paint: { text: token('accent-text') },
    },
    {
      name: 'hover',
      description: 'A seekable line under the pointer lifts to the muted tone - a nudge that lines are targets here.',
      paint: { text: token('text-muted') },
    },
    {
      name: 'browsing',
      description:
        'The user has taken the scroll (wheel, touch, drag). Following pauses so the surface never fights the hand, and resumes a beat after the last touch.',
      behavioral: true,
    },
    {
      name: 'empty',
      description: 'No lines: the empty message, centred, in the subtle tone.',
      paint: { text: token('text-subtle') },
    },
  ],
  paint: { text: token('text-subtle') },
  transition: { duration: token('duration-normal'), ease: token('ease-out') },
  tokens: [
    'space-2',
    'space-4',
    'accent-text',
    'text-muted',
    'text-subtle',
    'font-size-md',
    'leading-md',
    'duration-normal',
    'ease-out',
    'focus-ring',
  ],
  focusRing: { ring: token('focus-ring'), offset: '2px' },
  a11y: {
    focusable: true,
    keyboard: [
      { keys: 'Tab', action: 'Moves through the seekable lines in order.' },
      { keys: 'Enter, Space', action: 'Seeks playback to the focused line.' },
    ],
    notes: [
      'Each seekable line is a real button, so keyboard and screen reader activation come from the platform.',
      'The active line carries aria-current, so the position is announced rather than merely painted.',
      'Auto-follow is a smooth scroll only when motion is welcome; under prefers-reduced-motion the surface snaps.',
    ],
  },
  motion: {
    description:
      'The follow is a smooth centring scroll and the highlight a colour transition; both are instant under reduced motion.',
    press: false,
    transition: { speed: 'normal', ease: 'out' },
  },
};
