import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/** Tone families, exported so the React kit derives its union from here. */
export const toastTones = ['neutral', 'info', 'success', 'warning', 'danger'] as const;

export const toastSpec: ComponentSpec = {
  name: 'Toast',
  id: 'toast',
  category: 'molecule',
  status: 'stable',
  summary:
    'A single-slot, latest-wins notification pill portalled to the bottom center of the document, with a per-tone auto-dismiss timer, an optional leading icon, and an optional dismiss control. The pill can also render standalone as a static notification.',
  element: 'div',
  anatomy: [
    { name: 'viewport', description: 'The fixed, bottom-center region the provider portals the current toast into; it ignores pointer events so only the pill is interactive.' },
    { name: 'pill', description: 'The rounded surface holding the icon, message, and dismiss control; the whole pill is clickable to dismiss.', required: true },
    { name: 'icon', description: 'Optional leading glyph, vertically centered with the message.' },
    { name: 'message', description: 'The notification text; wraps and breaks long words rather than overflowing.', required: true },
    { name: 'dismiss', description: 'An optional trailing close button, shown when the toast is dismissible; carries an accessible label.' },
  ],
  props: [
    { name: 'tone', type: 'enum', values: toastTones, default: 'neutral', description: 'Semantic color family; danger announces as an alert, every other tone as a status.' },
    { name: 'message', type: 'node', required: true, description: 'The notification content.' },
    { name: 'icon', type: 'node', description: 'Optional leading glyph rendered before the message.' },
    { name: 'duration', type: 'number', description: 'Auto-dismiss delay in milliseconds, read by the provider. When omitted it defaults by tone (success 3500, danger 7000, every other tone 4500); 0 disables auto-dismiss so the toast stays until replaced or dismissed.' },
    { name: 'dismissible', type: 'boolean', default: true, description: 'Whether a trailing close control is shown.' },
    { name: 'onDismiss', type: 'handler', description: 'Called when the pill or its dismiss control is pressed; the provider wires this to clear the current toast.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact pill geometry instead of content.' },
    { name: 'glass', type: 'boolean', default: false, description: 'Renders the frosted glass material instead of the solid tone surface.' },
  ],
  tones: [
    { name: 'neutral', description: 'The default, low-emphasis raised surface; announces as a status.', tokens: { background: token('surface-raised'), border: token('border-subtle'), text: token('text') } },
    { name: 'info', description: 'Neutral-informational tint; announces as a status.', tokens: { background: token('info-soft'), border: token('info-border'), text: token('info-text') } },
    { name: 'success', description: 'Positive or complete states; announces as a status and auto-dismisses fastest.', tokens: { background: token('success-soft'), border: token('success-border'), text: token('success-text') } },
    { name: 'warning', description: 'Caution states; announces as a status.', tokens: { background: token('warning-soft'), border: token('warning-border'), text: token('warning-text') } },
    { name: 'danger', description: 'Errors and destructive states; announces as an alert and lingers longest before auto-dismiss.', tokens: { background: token('danger-soft'), border: token('danger-border'), text: token('danger-text') } },
  ],
  defaults: { tone: 'neutral', dismissible: true, skeleton: false, glass: false },
  dimensions: {
    radius: token('radius-full'),
    gap: token('space-3'),
    border: token('hairline'),
    paddingInline: token('space-5'),
    paddingBlock: token('space-3'),
    dismissGap: token('space-2'),
    dismissSize: '1.25rem',
    viewportInset: token('space-6'),
    viewportPaddingInline: token('space-4'),
    maxWidth: '28rem',
    skeletonWidth: '18rem',
    skeletonHeight: '2.75rem',
    fontSize: token('font-size-sm'),
  },
  states: [
    { name: 'enter', description: 'The pill slides up and fades in from y 12 on a snappy spring when it mounts.' },
    { name: 'exit', description: 'The pill fades and drops back to y 12 as it is replaced, dismissed, or times out.' },
    { name: 'replaced', description: 'A new toast takes the single slot immediately; there is no queue, latest wins, and the auto-dismiss timer re-arms for the new pill.' },
    { name: 'auto-dismiss', description: 'After its duration elapses the provider clears the toast unless a newer one already replaced it; a duration of 0 disables the timer.' },
    { name: 'dismiss-hover', description: 'Hovering the dismiss control raises its opacity from 0.6 to 1.', tokens: { text: token('text') } },
    { name: 'dismiss-focus', description: 'The dismiss button shows a hairline currentColor outline offset 2px on keyboard focus, and its opacity goes to 1.' },
  ],
  tokens: [
    'space-2', 'space-3', 'space-4', 'space-5', 'space-6',
    'hairline', 'radius-full', 'shadow-4',
    'font-sans', 'font-size-sm', 'leading-md', 'font-weight-medium',
    'surface-raised', 'border-subtle', 'text',
    'glass-regular', 'glass-border', 'glass-highlight', 'glass-saturate', 'blur-sm',
    'info-soft', 'info-border', 'info-text',
    'success-soft', 'success-border', 'success-text',
    'warning-soft', 'warning-border', 'warning-text',
    'danger-soft', 'danger-border', 'danger-text',
  ],
  a11y: {
    role: 'status',
    focusable: false,
    keyboard: [{ keys: 'Enter, Space', action: 'Activates the dismiss button when it holds focus, clearing the toast; the pill itself is not in the tab order.' }],
    notes: [
      'A danger toast uses role="alert" with aria-live="assertive"; every other tone uses role="status" with aria-live="polite".',
      'The pill is portalled to document.body so it escapes any clipping or stacking context.',
      'Only one toast exists at a time; a new toast replaces the current one rather than stacking.',
      'The pill has no tabIndex and is not focusable; the only focusable descendant is the dismiss button, which as a native button activates on Enter or Space.',
      'There is no Escape-to-dismiss handler; dismissal is via the dismiss button, a click anywhere on the pill, the imperative dismiss() control, or the auto-dismiss timer.',
      'The dismiss control carries aria-label="Dismiss"; clicking it stops propagation but still dismisses, and clicking the surrounding pill dismisses as well.',
      'Do not rely on tone color alone to carry meaning; the message text should state it on its own.',
    ],
  },
  motion: {
    description: 'The pill springs up from y 12 and fades in on entry, then fades and drops back to y 12 on exit, driven by AnimatePresence. Under reduced motion both transitions collapse to a plain opacity fade with no translate and zero duration. There is no press-scale feedback.',
    press: false,
    transition: { spring: 'snappy' },
  },
};
