import type { ComponentSpec } from '../schema.ts';
import { compactSizes, token } from '../vocab.ts';

export const recordingIndicatorSpec: ComponentSpec = {
  name: 'RecordingIndicator',
  id: 'recording-indicator',
  category: 'molecule',
  status: 'draft',
  summary: 'A pulsing danger dot with a label, and optionally how long the recording has been running, so nobody in the call can miss that it is being recorded.',
  element: 'div',
  anatomy: [
    { name: 'dot', description: 'A StatusDot in the danger tone, pulsing while the recording runs.', required: true },
    { name: 'label', description: 'What is happening, in words: "Recording".', required: true },
    { name: 'elapsed', description: 'How long it has been running, when a start time is given.' },
  ],
  props: [
    { name: 'recording', type: 'boolean', default: true, description: 'Whether a recording is running. False stops the pulse and quiets the label rather than unmounting, so the row does not reflow when a recording ends.' },
    { name: 'paused', type: 'boolean', default: false, description: 'A recording that is running but paused: the dot holds still and the label says so.' },
    { name: 'label', type: 'node', description: 'What is happening. Defaults to "Recording".' },
    { name: 'seconds', type: 'number', description: 'Controlled elapsed seconds for the readout.' },
    { name: 'startedAt', type: 'number', description: 'Epoch milliseconds the recording started; the component then ticks its own clock.' },
    { name: 'size', type: 'enum', values: compactSizes, default: 'md', description: 'Compact size step.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
  ],
  defaults: { recording: true, paused: false, size: 'md', skeleton: false },
  sizes: [
    { name: 'sm', fontSize: token('font-size-xs'), gap: token('space-1') },
    { name: 'md', fontSize: token('font-size-sm'), gap: token('space-2') },
  ],
  paint: { text: token('danger-text') },
  states: [
    {
      name: 'recording',
      description: 'The dot pulses: an expanding, fading ring in the danger tone, the same loop StatusDot draws. Disabled under reduced motion, where the solid dot alone carries the state.',
      paint: { text: token('danger-text') },
      tokens: { dot: token('danger-solid') },
    },
    {
      name: 'paused',
      description: 'The dot holds still and drops to the muted text tone; the label names the pause, because a still red dot and a live red dot are indistinguishable at a glance.',
      paint: { text: token('text-muted') },
      tokens: { dot: token('text-subtle') },
    },
    {
      name: 'stopped',
      description: 'Not recording. The dot goes neutral and the label quiets rather than the row unmounting, so the header keeps its width.',
      paint: { text: token('text-subtle') },
      tokens: { dot: token('text-subtle') },
    },
    { name: 'skeleton', description: 'A circle and a text placeholder at the exact geometry.' },
  ],
  dimensions: { radius: token('radius-full') },
  tokens: [
    'space-1', 'space-2', 'radius-full', 'danger-solid', 'danger-text',
    'text-muted', 'text-subtle', 'font-size-xs', 'font-size-sm', 'font-mono', 'font-weight-medium',
  ],
  a11y: {
    role: 'status',
    focusable: false,
    notes: [
      'role="status" with aria-live="polite": starting or stopping a recording IS worth interrupting for, unlike the call clock, and polite means it lands at the next pause rather than cutting across speech.',
      'The elapsed readout is aria-hidden, so the live region announces "Recording" once instead of re-announcing every second.',
      'The pulse is decoration; the state is carried by the label text, so it survives reduced motion and greyscale alike.',
    ],
  },
  motion: {
    description: 'An expanding, fading ring loops while recording. Disabled under reduced motion — a looping pulse for the whole length of a call is precisely what that setting is for.',
  },
};
