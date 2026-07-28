import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/**
 * The three-way visual state a call control carries.
 *
 * This is NOT a two-state toggle wearing a third coat of paint. In a call the
 * meaning of "on" depends on the control:
 *
 * - `idle` — the control is available and nothing unusual is happening.
 * - `engaged` — a feature the user turned ON is running (speaker, screen share,
 *   raised hand). Reassuring: the accent fill says "this is working".
 * - `danger` — the user has CUT something OFF (mic muted, camera stopped), or
 *   the control ends the call. Alarming: the danger fill says "you are not
 *   being heard".
 *
 * So a mute button's engaged state is `danger`, not `engaged` — the toggled
 * state is the alarming one, the inverse of a normal toggle. `@glacier/logic`
 * owns that mapping (`callControlState`) so neither binding can get it backwards.
 */
export const callControlStates = ['idle', 'engaged', 'danger'] as const;

/**
 * Touch-first size steps. Deliberately only two, and deliberately NOT the
 * kit-wide `controlSizes`: see the note on `sizes` below.
 */
export const callControlSizes = ['md', 'lg'] as const;

export const callControlButtonSpec: ComponentSpec = {
  name: 'CallControlButton',
  id: 'call-control-button',
  category: 'atom',
  status: 'draft',
  summary:
    'The round control in a call: a large touch target carrying one glyph, an optional caption, and a three-way idle / engaged / danger state where "engaged" may mean the user has cut something off.',
  element: 'button',
  anatomy: [
    { name: 'glyph', description: 'The single centered icon.', required: true },
    { name: 'caption', description: 'An optional word under the glyph ("Mute", "Camera"), so the row reads without hovering.' },
    { name: 'ring', description: 'A slot behind the glyph for a live indicator, used by MicToggle for its level ring.' },
  ],
  props: [
    { name: 'aria-label', type: 'string', required: true, description: 'Accessible name; required because the glyph carries no name and the caption is optional.' },
    { name: 'state', type: 'enum', values: callControlStates, default: 'idle', description: 'The three-way visual state. Danger is for a control that has cut something off or ends the call.' },
    { name: 'size', type: 'enum', values: callControlSizes, default: 'md', description: 'Touch-first size step; both steps clear the 48px hit-target floor.' },
    { name: 'pressed', type: 'boolean', description: 'Toggle state, reported as aria-pressed. Kept separate from `state`, because a muted mic is pressed AND danger while a live speaker is pressed AND engaged.' },
    { name: 'caption', type: 'node', description: 'A short word under the glyph.' },
    { name: 'disabled', type: 'boolean', default: false, description: 'Dims the control and blocks interaction.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
    { name: 'children', type: 'node', required: true, description: 'The icon glyph.' },
    { name: 'onPress', type: 'handler', description: 'Called when the control is activated.' },
  ],
  variants: [
    {
      name: 'idle',
      description: 'Available, nothing unusual. A quiet raised disc so the row of controls reads as one material.',
      paint: { background: token('surface-raised'), text: token('text') },
      tokens: { hover: token('hover'), active: token('active') },
    },
    {
      name: 'engaged',
      description: 'A feature the user turned on is running. Filled accent: reassuring, "this is working".',
      paint: { background: token('accent-solid'), text: token('accent-contrast') },
      tokens: { hover: token('accent-solid-hover') },
    },
    {
      name: 'danger',
      description:
        'The user has cut something off (muted, camera stopped) or this control ends the call. Filled danger: alarming on purpose, because a silently muted mic is the single most common call failure.',
      paint: { background: token('danger-solid'), text: token('danger-contrast') },
      tokens: { hover: token('danger-solid-hover') },
    },
  ],
  /**
   * The hit-target floor is `size-3xl` (3rem / 48px), matching the WCAG 2.2
   * "Target Size (Minimum)" enhanced guidance and the platform touch minimums.
   *
   * It deliberately does NOT use `control-height-*` like every other control in
   * the kit: those tokens are density-scaled, and at the extra-compact density
   * `control-height-lg` drops to 2.5rem (40px) — under the floor. A call control
   * is often the only thing on screen and is pressed with a thumb while walking;
   * it must not shrink because the user likes dense tables. The `size-*` ramp is
   * fixed rem with no density multiplier, so 48/64px hold at every density.
   */
  sizes: [
    { name: 'md', height: token('size-3xl'), diameter: token('size-3xl'), paddingInline: '0', iconSize: '20px', fontSize: token('font-size-xs') },
    { name: 'lg', height: token('size-4xl'), diameter: token('size-4xl'), paddingInline: '0', iconSize: '24px', fontSize: token('font-size-sm') },
  ],
  defaults: { state: 'idle', size: 'md', disabled: false, skeleton: false },
  dimensions: { radius: token('radius-full'), gap: token('space-1'), border: token('hairline') },
  states: [
    { name: 'hover', description: 'The disc lifts to its variant hover token.', tokens: { idle: token('hover'), engaged: token('accent-solid-hover'), danger: token('danger-solid-hover') } },
    { name: 'active', description: 'Idle presses to the active token; the filled states rely on the tap scale.', tokens: { idle: token('active') } },
    { name: 'focus-visible', description: 'A 2px accent focus ring blooms outward.', tokens: { ring: token('focus-ring') } },
    { name: 'disabled', description: 'Halved opacity and not-allowed cursor.' },
    { name: 'skeleton', description: 'A circle placeholder at the exact diameter, so a connecting call holds the bar it will settle into.' },
  ],
  focusRing: { ring: token('focus-ring'), offset: '2px' },
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'size-3xl', 'size-4xl', 'radius-full', 'space-1', 'hairline',
    'surface-raised', 'text', 'hover', 'active',
    'accent-solid', 'accent-solid-hover', 'accent-contrast',
    'danger-solid', 'danger-solid-hover', 'danger-contrast',
    'text-muted', 'font-size-xs', 'font-size-sm', 'font-weight-medium',
    'focus-ring', 'duration-fast', 'ease-out',
  ],
  a11y: {
    role: 'button',
    focusable: true,
    keyboard: [{ keys: 'Enter, Space', action: 'Activates the control.' }],
    notes: [
      'aria-label is required. The caption is a visual affordance and is aria-hidden, so a caption of "Mute" never fights a label of "Unmute".',
      'A toggle reports aria-pressed from `pressed`, never from `state`: pressed says WHAT the control did, state says how alarming that is. A muted mic is pressed=true, state=danger; a live speaker is pressed=true, state=engaged.',
      'The label must describe the ACTION, not the state ("Unmute" while muted), because a screen reader already announces the pressed state.',
      'The leave/hangup control takes state=danger and no aria-pressed: it is an action, not a toggle.',
    ],
  },
  motion: {
    description: 'Presses inward to 0.94 on tap and eases its fill between states; both respect reduced motion.',
    press: true,
    transition: { speed: 'fast', ease: 'out' },
  },
};
