import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';
import { callControlSizes } from './call-control-button.ts';

export const micToggleSpec: ComponentSpec = {
  name: 'MicToggle',
  id: 'mic-toggle',
  category: 'molecule',
  status: 'draft',
  summary:
    'A CallControlButton for the microphone, with a ring behind it that swells with the live input level so the user can see they are being heard.',
  element: 'button',
  anatomy: [
    { name: 'button', description: 'The CallControlButton itself; all geometry comes from the call-control-button spec.', required: true },
    { name: 'ring', description: 'The halo behind the disc, scaled by the current input level. Absent while muted.' },
    { name: 'glyph', description: 'A mic, or a struck-through mic while muted.', required: true },
  ],
  props: [
    { name: 'muted', type: 'boolean', description: 'Controlled mute state.' },
    { name: 'defaultMuted', type: 'boolean', default: false, description: 'Initial mute state when uncontrolled.' },
    { name: 'onMutedChange', type: 'handler', description: 'Called with the new mute state when the control is pressed.' },
    { name: 'meter', type: 'handler', description: 'Reads the current input loudness as 0..1. Null or omitted and the ring stays at rest. On the web this comes from createAnalyserMeter; on a device from the platform recorder.' },
    { name: 'level', type: 'number', description: 'Controlled input level 0..1, overriding the meter. For a host that already samples its own audio, and for tests.' },
    { name: 'size', type: 'enum', values: callControlSizes, default: 'md', description: 'Touch-first size step, forwarded to the button.' },
    { name: 'caption', type: 'node', description: 'A short word under the glyph.' },
    { name: 'disabled', type: 'boolean', default: false, description: 'Dims the control and blocks interaction.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
    { name: 'labels', type: 'object', description: 'Overrides the spoken labels.', fields: [
      { name: 'mute', type: 'string', description: 'Label while live — names the action, "Mute".' },
      { name: 'unmute', type: 'string', description: 'Label while muted — names the action, "Unmute".' },
    ] },
  ],
  defaults: { defaultMuted: false, size: 'md', disabled: false, skeleton: false },
  // The rest paint IS the button's idle disc — a live mic is an ordinary
  // available control, and only muting repaints it (see the `muted` state).
  paint: { background: token('surface-raised'), text: token('text') },
  // Geometry is NOT restated here: the control IS a CallControlButton, so its
  // diameter, radius, and glyph size come from the call-control-button spec.
  // Only the ring, which that spec does not know about, is measured here.
  dimensions: { ringWidth: token('space-1') },
  states: [
    {
      name: 'live',
      description:
        'Unmuted. The button is idle-painted and an accent ring behind it scales from 1.0 to 1.34 and fades in from 0.18 to 0.7 opacity with the input level.',
      tokens: { ring: token('accent-solid') },
    },
    {
      name: 'muted',
      description:
        'The button takes the DANGER paint, not an "off" grey. Muting is the alarming state: the most common failure in a call is talking into a muted mic, so the control must read as a warning, not as a disabled feature. The ring is not drawn at all — there is no signal to show.',
      paint: { background: token('danger-solid'), text: token('danger-contrast') },
    },
    { name: 'disabled', description: 'Halved opacity; the ring stops sampling, so a disabled control costs nothing.' },
  ],
  focusRing: { ring: token('focus-ring'), offset: '2px' },
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'space-1', 'radius-full', 'accent-solid', 'danger-solid', 'danger-contrast',
    'surface-raised', 'text', 'focus-ring', 'duration-fast', 'ease-out',
  ],
  a11y: {
    role: 'button',
    focusable: true,
    keyboard: [{ keys: 'Enter, Space', action: 'Toggles the microphone.' }],
    notes: [
      'One button whose label changes, not two that swap, so focus survives the toggle.',
      'The label names the ACTION ("Unmute" while muted); aria-pressed carries the state, so a label that also named the state would double-announce.',
      'The ring is decorative and aria-hidden: it is a live signal, not information a screen reader can act on, and announcing a changing level would flood the buffer.',
      'Muted is reported as aria-pressed=true AND painted danger; the two are independent (see call-control-button), which is why the toggle can be "on" and alarming at once.',
    ],
  },
  motion: {
    description:
      'The ring follows the input level as a rolling peak-hold, so it swells with speech and falls back within about a second of silence. Under reduced motion the ring is frozen at rest and the control is a plain button — a pulsing halo is exactly the sort of continuous motion that setting exists to stop.',
    press: true,
    transition: { speed: 'fast', ease: 'out' },
  },
};
