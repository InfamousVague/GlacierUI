import type { ComponentSpec, PaintSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/**
 * The connection states that draw a banner. `online` is deliberately absent: a
 * healthy connection says nothing, and a "Connected" strip that lives at the top
 * of every chat app is a strip nobody reads. The full state union, the machine
 * that moves between the states, and the dwell before the confirmation clears
 * all live in @glacier/logic.
 */
export const connectionBannerStates = ['offline', 'reconnecting', 'reconnected'] as const;

/**
 * ConnectionBanner is a PRESET of Banner, not a second banner.
 *
 * It adds exactly three things Banner cannot know: which tone and glyph each
 * connection state paints, that the recovery confirmation dismisses itself after
 * a dwell, and that only "offline" is worth interrupting a screen reader for.
 * Everything else — the strip, the soft tone wash, the hairline, the icon slot,
 * the trailing action, the dismiss control — is Banner's, and both bindings
 * compose it rather than restyling one.
 */
const connectionPaint: Record<string, PaintSpec> = {
  offline: { background: token('danger-soft'), text: token('danger-text'), border: token('danger-border') },
  reconnecting: { background: token('warning-soft'), text: token('warning-text'), border: token('warning-border') },
  reconnected: { background: token('success-soft'), text: token('success-text'), border: token('success-border') },
};

const CONNECTION_DESCRIPTION: Record<string, string> = {
  offline: 'No connection: the danger family, because anything typed from here is not going anywhere. The only state that offers a retry action, and the only one announced assertively.',
  reconnecting: 'An attempt is in flight: the warning family, with the glyph spinning unless motion is reduced. A progress report on a problem already announced, so it waits for a pause.',
  reconnected: 'Back online: the success family, held long enough to read and then gone. It exists so the banner’s disappearance is an answer rather than a mystery.',
};

export const connectionBannerSpec: ComponentSpec = {
  name: 'ConnectionBanner',
  id: 'connection-banner',
  category: 'molecule',
  status: 'draft',
  summary:
    'The network strip over a conversation: offline, reconnecting, and a recovery confirmation that clears itself — a Banner preset wired to the shared connection state machine.',
  element: 'div',
  anatomy: [
    { name: 'banner', description: 'The Banner itself, in the state’s tone.', required: true },
    { name: 'icon', description: 'The state’s glyph: a struck-through signal, a spinning arrow, a restored signal.', required: true },
    { name: 'message', description: 'What is happening, in words. The state is never carried by colour alone.', required: true },
    { name: 'action', description: 'A retry control, offered only while offline — there is nothing to retry mid-attempt, and nothing to retry once it worked.' },
  ],
  props: [
    { name: 'state', type: 'enum', values: connectionBannerStates, description: 'Which state to show. Online renders nothing at all.' },
    { name: 'online', type: 'boolean', description: 'Convenience for the common case: true renders nothing, false shows the offline banner.' },
    { name: 'onRetry', type: 'handler', description: 'Offers a retry action while offline.' },
    { name: 'onSettle', type: 'handler', description: 'Called once the recovery confirmation has been up long enough, so the owner can move its own state back to online.' },
    { name: 'dwellMs', type: 'number', default: 3000, description: 'How long the recovery confirmation stays. A reading duration, not a motion one, which is why it is a plain number rather than a duration token.' },
    { name: 'labels', type: 'object', fields: [
      { name: 'offline', type: 'string', description: 'Shown while disconnected.' },
      { name: 'reconnecting', type: 'string', description: 'Shown while an attempt is in flight.' },
      { name: 'reconnected', type: 'string', description: 'The recovery confirmation.' },
      { name: 'retry', type: 'string', description: 'The retry action.' },
    ], description: 'Overrides the wording; merged over the shared English fallbacks.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the Banner’s exact geometry.' },
  ],
  defaults: { dwellMs: 3000, skeleton: false },
  tones: connectionBannerStates.map((name) => ({
    name,
    description: CONNECTION_DESCRIPTION[name] ?? '',
    paint: connectionPaint[name],
  })),
  dimensions: { radius: token('radius-lg'), gap: token('space-3') },
  states: [
    {
      name: 'reconnecting',
      description: 'The glyph rotates while an attempt is in flight — the one moving part, and only because "still trying" has no other way to say it. Held still under reduced motion, where the wording alone carries it.',
      tokens: { icon: token('warning-text') },
    },
    {
      name: 'reconnected',
      description: 'Auto-dismisses after the dwell. A behavioural state: it paints exactly as the success tone does, it simply stops existing.',
      behavioral: true,
    },
    { name: 'skeleton', description: 'A full-width placeholder at the Banner’s height.' },
  ],
  transition: { duration: token('duration-normal'), ease: token('ease-out') },
  tokens: [
    'space-3', 'radius-lg',
    'danger-soft', 'danger-text', 'danger-border',
    'warning-soft', 'warning-text', 'warning-border',
    'success-soft', 'success-text', 'success-border',
    'duration-normal', 'duration-slower', 'ease-out',
  ],
  a11y: {
    role: 'status',
    focusable: false,
    notes: [
      'Only offline is assertive. It changes what the user can do — anything typed from here is not going anywhere — while retrying and recovering are progress reports on a problem already announced, and cutting across someone’s reading to say "still trying" is worse than silence.',
      'The state is in the words, never only in the tone: a green strip and a red strip are the same strip in greyscale.',
      'The recovery confirmation is announced before it clears, and the dwell is long enough to read it — an auto-dismissing message that a screen reader never reaches is a message that did not exist.',
      'The retry action appears only in the offline state, so a focused control never disappears out from under the keyboard mid-attempt.',
    ],
  },
  motion: {
    description: 'The strip fades in and out; the reconnecting glyph rotates on a slow loop. Both stop under reduced motion, and the wording carries every state without them.',
    transition: { speed: 'normal', ease: 'out' },
  },
};
