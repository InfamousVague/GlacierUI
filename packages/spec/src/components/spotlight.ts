import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';
import { popoverPlacements } from './popover.ts';

export const spotlightSpec: ComponentSpec = {
  name: 'Spotlight',
  id: 'spotlight',
  category: 'molecule',
  status: 'stable',
  summary:
    'A guided-tour step: a dimmed full-screen backdrop with a highlighted cutout around a target element, plus an anchored callout with a title, body, step count, and Back/Next/Close controls.',
  element: 'div',
  anatomy: [
    { name: 'backdrop', description: 'The dimmed, full-screen scrim that catches a press to dismiss.', required: true },
    { name: 'cutout', description: 'The click-through highlighted ring punched around the target element.', required: true },
    { name: 'callout', description: 'The portalled role="dialog" anchored to the target, flipping and clamping on screen.', required: true },
    { name: 'title', description: 'The step heading.' },
    { name: 'description', description: 'The step body copy.' },
    { name: 'count', description: 'The current step over the total, e.g. "2 / 4".' },
    { name: 'actions', description: 'The Back and Next controls; a Close button sits in the corner.' },
  ],
  props: [
    { name: 'open', type: 'boolean', required: true, description: 'Whether the tour step is shown.' },
    { name: 'targetRef', type: 'element', required: true, description: 'Ref to the element to highlight; the cutout and callout are positioned against it.' },
    { name: 'title', type: 'node', description: 'Step heading.' },
    { name: 'description', type: 'node', description: 'Step body copy.' },
    { name: 'placement', type: 'enum', values: popoverPlacements, default: 'bottom', description: 'Callout position relative to the target before flipping.' },
    { name: 'cutoutPadding', type: 'number', default: 8, description: 'Padding around the target inside the cutout, in pixels.' },
    { name: 'step', type: 'number', description: '1-based index of this step.' },
    { name: 'total', type: 'number', description: 'Total number of steps in the tour.' },
    { name: 'onNext', type: 'handler', description: 'Advances to the next step; the Next button is hidden when omitted.' },
    { name: 'onBack', type: 'handler', description: 'Returns to the previous step; the Back button is hidden when omitted.' },
    { name: 'onClose', type: 'handler', required: true, description: 'Dismisses the tour, via the close button, Escape, or a backdrop press.' },
  ],
  defaults: { placement: 'bottom', cutoutPadding: 8 },
  dimensions: {
    radius: token('radius-xl'),
    gap: token('space-2'),
    cutoutRadius: token('radius-lg'),
  },
  // the ring belongs to the callout's Button/IconButton controls (2px
  // focus-ring outline, offset 2px); the callout itself takes programmatic
  // focus with its own outline suppressed
  focusRing: { ring: token('focus-ring'), offset: '2px' },
  // the cutout ring eases its box as it tracks between steps
  transition: { duration: token('duration-normal'), ease: token('ease-out') },
  a11y: {
    role: 'dialog',
    focusable: true,
    keyboard: [
      { keys: 'Tab, Shift+Tab', action: 'Cycles focus within the callout controls.' },
      { keys: 'Escape', action: 'Dismisses the tour and restores focus to the opener.' },
    ],
    notes: [
      'The callout is a role="dialog" with aria-modal that labels itself from the title and describes itself from the body.',
      'The step count is announced via aria-label, e.g. "Step 2 of 4".',
      'The highlighted target stays interactive: the cutout ring is click-through while the surrounding backdrop dismisses on press.',
    ],
  },
  motion: {
    description: 'The backdrop fades in and the callout scales and fades from the target edge; the cutout eases as it tracks between steps. Respects reduced motion.',
    transition: { speed: 'fast', ease: 'out' },
  },
};
