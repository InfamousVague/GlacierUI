import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/**
 * How close to the limit the message is.
 *
 * `far` is the silent state: the counter renders nothing at all, because a
 * number that is always on trains the user to ignore it and turns a chat box
 * into a form. It appears at `near`, warns at `close`, and turns danger `over`.
 */
export const characterCounterLevels = ['far', 'near', 'close', 'over'] as const;

export const characterCounterSpec: ComponentSpec = {
  name: 'CharacterCounter',
  id: 'character-counter',
  category: 'atom',
  status: 'draft',
  summary:
    'The remaining-characters readout for a compose bar. It is invisible until the message approaches its limit, and it counts down rather than up.',
  element: 'span',
  anatomy: [
    { name: 'counter', description: 'The number itself, in tabular figures so it does not jitter as it counts down.', required: true },
  ],
  props: [
    { name: 'length', type: 'number', required: true, description: 'Characters used.' },
    { name: 'limit', type: 'number', required: true, description: 'The cap. Zero or less disables the counter entirely.' },
    {
      name: 'threshold',
      type: 'number',
      default: 0.8,
      description: 'The fraction of the limit at which the counter appears. Below it the component renders nothing.',
    },
    {
      name: 'showAlways',
      type: 'boolean',
      default: false,
      description: 'Keeps the counter visible from the first character, for the rare surface with a hard external cap the user must plan around.',
    },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the readout geometry.' },
  ],
  defaults: { threshold: 0.8, showAlways: false, skeleton: false },
  states: [
    {
      name: 'far',
      description: 'Under the threshold: nothing renders and nothing is announced. Not an empty box — no box.',
      behavioral: true,
    },
    { name: 'near', description: 'Past the threshold: the countdown appears in muted text.', paint: { text: token('text-muted') } },
    { name: 'close', description: 'Inside the last tenth of the limit: warning text, still not blocking.', paint: { text: token('warning-text') } },
    {
      name: 'over',
      description: 'Past the limit: danger text and a negative number, and the compose bar refuses to send while it reads this.',
      paint: { text: token('danger-text') },
    },
  ],
  paint: { text: token('text-muted') },
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: ['text-muted', 'warning-text', 'danger-text', 'font-mono', 'font-size-xs', 'duration-fast', 'ease-out'],
  a11y: {
    role: 'status',
    focusable: false,
    notes: [
      'It is NOT a Meter. Meter paints a fixed set of pips for "how full or how good", with role=meter and a value mapped onto segments; this is a countdown of characters whose whole point is that it can go negative and that it is absent most of the time. A meter cannot render -3, and a meter that unmounts is not a meter.',
      'A polite live region: the count is announced as it changes, at a rate a reader can keep up with, and never interrupts typing.',
      'It counts down, not up: what the user needs to act on is how much room is left, not how much has been used.',
      'The number is the only content — the word "characters" lives in the accessible name, so the visible readout stays one short token.',
    ],
  },
  motion: {
    description: 'The colour steps between levels cross-fade at the fast duration; the number itself never animates, so it cannot be read mid-transition.',
    transition: { speed: 'fast', ease: 'out' },
  },
};
