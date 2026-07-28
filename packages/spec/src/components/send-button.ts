import type { ComponentSpec } from '../schema.ts';
import { controlHeightToken, controlSizes, token } from '../vocab.ts';

/**
 * The four things a send control can be, in the order a message walks through
 * them. `empty` is the resting state of a composer nobody has typed in yet.
 */
export const sendButtonStates = ['empty', 'ready', 'sending', 'failed'] as const;

export const sendButtonSpec: ComponentSpec = {
  name: 'SendButton',
  id: 'send-button',
  category: 'atom',
  status: 'draft',
  summary:
    'The send affordance of a compose bar, in four states: nothing to send, ready, in flight, and failed — the failed one offering the retry.',
  element: 'button',
  anatomy: [
    { name: 'button', description: 'The square control itself.', required: true },
    {
      name: 'glyph',
      description:
        'The single icon: a paper plane when ready, a spinner in flight, a warning triangle after a failure. One control whose glyph and label change, never three swapped buttons, so focus survives every transition.',
      required: true,
    },
  ],
  props: [
    {
      name: 'state',
      type: 'enum',
      values: sendButtonStates,
      default: 'empty',
      description:
        'What the control currently is. Derive it with composeSendState in @glacier/logic rather than tracking it by hand.',
    },
    {
      name: 'blockReason',
      type: 'enum',
      values: ['empty', 'uploading', 'over-limit', 'sending', 'disabled'],
      description:
        'Why send is refused, from canSendCompose. It never changes the paint — a refused control looks the same whichever fix is outstanding — but it does change the accessible name, so a user who presses and nothing happens is told which of the four things to do.',
    },
    { name: 'onSend', type: 'handler', description: 'Called on activation while ready. Ignored in every other state.' },
    {
      name: 'onRetry',
      type: 'handler',
      description: 'Called on activation while failed. Falls back to onSend when omitted, since a retry is a second send.',
    },
    { name: 'size', type: 'enum', values: controlSizes, default: 'md', description: 'Size step.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the control geometry.' },
    { name: 'labels', type: 'object', description: 'Per-state accessible names, merged over the localized kit strings.', fields: [
      { name: 'send', type: 'string', description: 'Name while ready.' },
      { name: 'empty', type: 'string', description: 'Name while there is nothing to send; it must say why, not just "Send".' },
      { name: 'sending', type: 'string', description: 'Name while in flight.' },
      { name: 'failed', type: 'string', description: 'Name after a failure; it offers the retry.' },
    ] },
  ],
  defaults: { state: 'empty', size: 'md', skeleton: false },
  sizes: [
    { name: 'sm', height: controlHeightToken.sm, paddingInline: token('space-0'), diameter: controlHeightToken.sm, iconSize: '1rem' },
    { name: 'md', height: controlHeightToken.md, paddingInline: token('space-0'), diameter: controlHeightToken.md, iconSize: '1.125rem' },
    { name: 'lg', height: controlHeightToken.lg, paddingInline: token('space-0'), diameter: controlHeightToken.lg, iconSize: '1.25rem' },
  ],
  dimensions: { radius: token('radius-full') },
  states: [
    {
      name: 'empty',
      description:
        'Nothing to send. The control keeps its place and its size and drops to the sunken surface with subtle text — it is NEVER hidden. Hiding it would reflow the action row under a thumb already travelling toward it, and on a touch device, where Enter writes a newline, it is the only route to send: a screen-reader user who cannot find it has no way to send at all. It stays focusable and announces why it will not act instead of vanishing from the tab order.',
      paint: { background: token('surface-sunken'), text: token('text-subtle') },
    },
    {
      name: 'ready',
      description: 'There is something to send: the one solid, accent-filled control in a row of quiet ones.',
      paint: { background: token('accent-solid'), text: token('accent-contrast') },
    },
    {
      name: 'sending',
      description:
        'In flight. It keeps the solid accent fill and swaps the glyph for a spinner, so the control does not appear to switch off at the moment it is working.',
      paint: { background: token('accent-solid'), text: token('accent-contrast') },
    },
    {
      name: 'failed',
      description: 'The send did not land. The control turns danger and becomes the retry, so the recovery is where the action already was.',
      paint: { background: token('danger-solid'), text: token('danger-contrast') },
    },
  ],
  // The rest paint is the empty state's: a composer nobody has typed in yet is
  // where this control spends most of its life, and the other three are deltas
  // applied over it.
  paint: { background: token('surface-sunken'), text: token('text-subtle') },
  focusRing: { ring: token('focus-ring'), offset: '2px' },
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'control-height-sm', 'control-height-md', 'control-height-lg', 'radius-full', 'space-0',
    'accent-solid', 'accent-solid-hover', 'accent-contrast',
    'danger-solid', 'danger-solid-hover', 'danger-contrast',
    'surface-sunken', 'text-subtle', 'focus-ring', 'duration-fast', 'ease-out',
  ],
  a11y: {
    role: 'button',
    focusable: true,
    keyboard: [{ keys: 'Enter, Space', action: 'Sends while ready, retries while failed, and does nothing otherwise.' }],
    notes: [
      'The empty state is aria-disabled rather than disabled: a disabled button leaves the tab order, and a user who tabs past a control that is not there never learns it exists.',
      'The accessible name carries the state — "Nothing to send yet", "Sending", "Send failed. Try again" — because the glyph change alone is silent.',
      'The in-flight state announces through aria-busy, so a reader knows the press was heard.',
    ],
  },
  motion: {
    description: 'Fill and glyph cross-fade at the fast duration; the spinner is the only continuous motion, and it stops the moment the state leaves sending.',
    press: true,
    transition: { speed: 'fast', ease: 'out' },
  },
};
