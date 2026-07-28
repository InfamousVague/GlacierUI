import type { ComponentSpec } from '../schema.ts';
import { compactSizes, token } from '../vocab.ts';

/** How loudly the readout sits in the layout. */
export const callTimerTones = ['default', 'muted'] as const;

export const callTimerSpec: ComponentSpec = {
  name: 'CallTimer',
  id: 'call-timer',
  category: 'atom',
  status: 'draft',
  summary: 'How long the call has been running, in tabular figures so the digits do not jitter as the seconds tick.',
  element: 'span',
  anatomy: [{ name: 'readout', description: 'The elapsed time, m:ss or h:mm:ss past an hour.', required: true }],
  props: [
    { name: 'seconds', type: 'number', description: 'Controlled elapsed seconds. Wins over startedAt, for a host that already owns the clock.' },
    { name: 'startedAt', type: 'number', description: 'Epoch milliseconds the call connected. The component then ticks its own clock once a second.' },
    { name: 'running', type: 'boolean', default: true, description: 'Stops the clock when false — a held call freezes rather than keeps counting.' },
    { name: 'tone', type: 'enum', values: callTimerTones, default: 'default', description: 'How loudly the readout sits in the layout.' },
    { name: 'size', type: 'enum', values: compactSizes, default: 'md', description: 'Compact size step.' },
    { name: 'label', type: 'string', description: 'Accessible name for the readout, e.g. "Call duration".' },
    { name: 'format', type: 'handler', description: 'Formats the seconds. Defaults to the kit-wide formatDuration: m:ss, or h:mm:ss past an hour.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder the width of a settled readout.' },
  ],
  defaults: { running: true, tone: 'default', size: 'md', skeleton: false },
  sizes: [
    { name: 'sm', fontSize: token('font-size-xs') },
    { name: 'md', fontSize: token('font-size-sm') },
  ],
  paint: { text: token('text') },
  states: [
    { name: 'muted', description: 'The quieter readout, for a timer sitting beside a title rather than carrying its own line.', paint: { text: token('text-muted') } },
    { name: 'skeleton', description: 'A placeholder the width of a settled readout, so the header does not reflow when the call connects.' },
  ],
  dimensions: { minWidth: '5ch' },
  tokens: ['text', 'text-muted', 'font-mono', 'font-size-xs', 'font-size-sm'],
  a11y: {
    role: 'timer',
    focusable: false,
    notes: [
      'The readout is role="timer" with aria-live="off". A clock that announced itself every second would make a screen reader unusable for the length of the call; the user asks for the duration when they want it.',
      'The accessible name is static ("Call duration"), so the announcement on demand is a name plus a value rather than a bare number.',
      'Figures are tabular, so the readout does not jitter as digits change width.',
    ],
  },
  motion: { description: 'None. A clock that eased between values would appear to lag the call.' },
};
