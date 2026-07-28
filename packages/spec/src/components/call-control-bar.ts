import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';
import { callControlSizes } from './call-control-button.ts';

/** How the row distributes its controls along the inline axis. */
export const callControlBarAligns = ['center', 'start', 'end', 'between'] as const;

/** What the bar itself is made of, under the controls. */
export const callControlBarVariants = ['bare', 'raised', 'glass'] as const;

export const callControlBarSpec: ComponentSpec = {
  name: 'CallControlBar',
  id: 'call-control-bar',
  category: 'molecule',
  status: 'draft',
  summary:
    'The row of controls in an active call. It owns only layout, spacing, and the surface under the controls; the controls themselves are its children.',
  element: 'div',
  anatomy: [
    { name: 'bar', description: 'The row itself, and the surface it paints (or does not).', required: true },
    { name: 'controls', description: 'The CallControlButtons, in order. The destructive leave control goes last.', required: true },
  ],
  props: [
    { name: 'children', type: 'node', required: true, description: 'The controls, in reading order.' },
    { name: 'variant', type: 'enum', values: callControlBarVariants, default: 'bare', description: 'What the bar is made of: nothing, a raised surface, or frosted glass for a bar floating over video.' },
    { name: 'size', type: 'enum', values: callControlSizes, default: 'md', description: 'Spacing step. Match it to the size given to the controls so the gaps stay proportional to the discs.' },
    { name: 'align', type: 'enum', values: callControlBarAligns, default: 'center', description: 'How the controls distribute along the row.' },
    { name: 'wrap', type: 'boolean', default: true, description: 'Lets the row wrap onto a second line rather than shrinking controls below the hit-target floor on a narrow phone.' },
    { name: 'label', type: 'string', description: 'Accessible name for the group, e.g. "Call controls".' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders the bar with placeholder geometry while the call connects.' },
  ],
  variants: [
    // Bare is the default because the bar most often sits inside a Card or a
    // call screen that already paints a surface; painting a second one stacks
    // two materials for no reason.
    { name: 'bare', description: 'No surface of its own: layout only, for a bar already inside a painted container.', paint: {} },
    { name: 'raised', description: 'A raised surface pill under the controls.', paint: { background: token('surface-raised'), border: token('border-subtle') } },
    { name: 'glass', description: 'Frosted glass, for a bar floating over live video.', paint: { background: token('glass-regular'), border: token('glass-border') } },
  ],
  sizes: [
    { name: 'md', gap: token('space-3'), paddingInline: token('space-4'), paddingBlock: token('space-3') },
    { name: 'lg', gap: token('space-4'), paddingInline: token('space-5'), paddingBlock: token('space-4') },
  ],
  defaults: { variant: 'bare', size: 'md', align: 'center', wrap: true, skeleton: false },
  dimensions: { radius: token('radius-2xl'), border: token('hairline') },
  states: [
    { name: 'skeleton', description: 'The bar keeps its padding and gap while its controls load as circles, so the call screen does not jump when the controls arrive.' },
  ],
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'space-3', 'space-4', 'space-5', 'radius-2xl', 'hairline',
    'surface-raised', 'border-subtle', 'glass-regular', 'glass-border', 'blur-sm', 'glass-saturate', 'shadow-2',
    'duration-fast', 'ease-out',
  ],
  a11y: {
    role: 'group',
    focusable: false,
    keyboard: [{ keys: 'Tab', action: 'Moves through the controls in reading order.' }],
    notes: [
      'The bar is a labelled group, so a screen reader says what the controls belong to before reading them.',
      'It never manages a roving tabindex: in a call every control must be one Tab away, not buried behind arrow keys inside a composite widget.',
      'The row wraps rather than shrinking: a control that drops under the 48px floor is worse than a second line.',
    ],
  },
  motion: {
    description: 'The bar itself does not animate; only its controls do. A control row that slides while you reach for hangup is a mis-tap waiting to happen.',
    transition: { speed: 'fast', ease: 'out' },
  },
};
