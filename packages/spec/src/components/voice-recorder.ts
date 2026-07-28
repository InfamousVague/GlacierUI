import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/**
 * What a hold-to-record control is doing.
 *
 * `armed` is the resting microphone, `recording` is the held state with the
 * live waveform, `canceling` is the held state past the slide threshold — still
 * recording, but committed to being thrown away — and `locked` is a recording
 * that outlived the finger, for a message too long to hold through.
 */
export const voiceRecorderStates = ['armed', 'recording', 'canceling', 'locked'] as const;

export const voiceRecorderSpec: ComponentSpec = {
  name: 'VoiceRecorder',
  id: 'voice-recorder',
  category: 'molecule',
  status: 'draft',
  summary:
    'Hold the microphone to record: the compose bar becomes a live waveform with a running clock, and sliding toward the start edge throws the take away.',
  element: 'div',
  anatomy: [
    { name: 'root', description: 'The strip that replaces the input while recording.', required: true },
    { name: 'mic', description: 'The press-and-hold control. It is the only thing showing at rest.', required: true },
    { name: 'pulse', description: 'The danger-tinted dot that marks a live recording, beside the clock.' },
    { name: 'clock', description: 'Elapsed time in tabular figures, the same m:ss the player uses.' },
    { name: 'waveform', description: 'The live level trace. It is the kit SeekBar in its bars shape, fed by useLiveLevels — not a second waveform renderer.' },
    { name: 'slideHint', description: 'The "slide to cancel" affordance, which travels with the finger and fades as the threshold nears.' },
  ],
  props: [
    { name: 'state', type: 'enum', values: voiceRecorderStates, description: 'Controlled state. Left off, the component owns it.' },
    { name: 'defaultState', type: 'enum', values: voiceRecorderStates, default: 'armed', description: 'Initial state when uncontrolled.' },
    { name: 'onStateChange', type: 'handler', description: 'Called with each new state as the hold begins, crosses the cancel threshold, locks, or ends.' },
    {
      name: 'meter',
      type: 'handler',
      description:
        'Reads the current input loudness as 0..1. The component never opens a microphone itself: the host owns that permission prompt and its audio graph, and hands the reading in.',
    },
    { name: 'onStart', type: 'handler', description: 'Called when the hold begins and recording should start.' },
    { name: 'onSend', type: 'handler', description: 'Called with the elapsed seconds when the hold is released outside the cancel zone.' },
    { name: 'onCancel', type: 'handler', description: 'Called when the take is thrown away, by sliding past the threshold or by pressing cancel while locked.' },
    { name: 'maxDuration', type: 'number', default: 300, description: 'Seconds after which the recording stops itself and offers the take.' },
    {
      name: 'cancelThreshold',
      type: 'number',
      default: 96,
      description: 'How far toward the inline start the finger must travel to cancel, in CSS pixels. Measured toward the start edge, so it flips under RTL.',
    },
    { name: 'lockable', type: 'boolean', default: true, description: 'Lets a hold be locked into a hands-free recording by sliding away from the cancel direction.' },
    { name: 'disabled', type: 'boolean', default: false, description: 'Dims the control and blocks recording.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the control geometry.' },
  ],
  defaults: { defaultState: 'armed', maxDuration: 300, cancelThreshold: 96, lockable: true, disabled: false, skeleton: false },
  dimensions: { gap: token('space-2'), radius: token('radius-full'), paddingInline: token('space-3') },
  states: [
    { name: 'armed', description: 'At rest: a quiet microphone icon button, the same footprint as the send control it sits beside.', paint: { text: token('text-muted') } },
    {
      name: 'recording',
      description: 'Held: the strip takes the bar, the pulse and clock run, and the waveform fills from the live levels.',
      paint: { text: token('danger-text') },
      tokens: { pulse: token('danger-solid') },
    },
    {
      name: 'canceling',
      description:
        'Held past the threshold: everything turns danger and the hint reads that releasing will discard. Still recording — the user can slide back and keep the take.',
      paint: { background: token('danger-soft'), text: token('danger-text') },
    },
    {
      name: 'locked',
      description: 'Recording without the finger: the mic becomes a stop control and an explicit cancel appears, because there is no release gesture left to mean either.',
      paint: { text: token('danger-text') },
      tokens: { lock: token('accent-text') },
    },
    { name: 'disabled', description: 'Halved opacity; the hold does nothing.' },
  ],
  paint: { text: token('text-muted') },
  focusRing: { ring: token('focus-ring'), offset: '2px' },
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'danger-soft', 'danger-solid', 'danger-text', 'accent-text', 'text-muted', 'text-subtle',
    'radius-full', 'space-2', 'space-3', 'font-size-xs', 'font-mono',
    'focus-ring', 'duration-fast', 'duration-normal', 'ease-out',
  ],
  a11y: {
    focusable: true,
    keyboard: [
      { keys: 'Space, Enter', action: 'Starts a locked recording. A hold gesture has no keyboard equivalent, so the keyboard route goes straight to the hands-free state.' },
      { keys: 'Escape', action: 'Discards a locked recording.' },
    ],
    notes: [
      'Hold-to-record is a pointer gesture with no keyboard analogue, so keyboard and switch users get the locked recording directly: press to start, press to stop, Escape to discard. The gesture is an accelerator, never the only route.',
      'The elapsed clock is a polite live region announced at whole seconds; the waveform is decorative and hidden from readers, since a level trace has nothing to say aloud.',
      'Crossing into the cancel zone is announced, because a user who cannot see the hint travelling has no other signal that releasing would now discard.',
      'The cancel direction is toward the inline start, so it follows the writing direction rather than always being leftward.',
    ],
  },
  motion: {
    description:
      'The pulse breathes at the normal duration while recording; the slide hint tracks the finger with no easing at all, because a lagging hint would misreport how close the cancel is.',
    transition: { speed: 'fast', ease: 'out' },
  },
};
