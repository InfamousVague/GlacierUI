import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

export const wizardSpec: ComponentSpec = {
  name: 'Wizard',
  id: 'wizard',
  category: 'organism',
  status: 'stable',
  summary:
    'A stepped flow that breaks a long task into short gated steps - a connected progress header, one labelled panel at a time, and Previous/Next actions where Next runs the step\'s validation gate before advancing.',
  element: 'div',
  anatomy: [
    { name: 'progress', description: 'The connected, numbered Steps header (count = steps, active = current); announces position as its own group label.', required: true },
    { name: 'heading', description: 'The active step label as an h2 or h3, prefixed by a visually hidden localized "Step X of Y"; its id labels the panel.', required: true },
    { name: 'panel', description: 'The role="group" step body, aria-labelledby the heading and tabIndex -1 so committed navigation can move focus into it; hosts the crossfading content.', required: true },
    { name: 'error', description: 'An always-present polite live region (role="status") under the panel that voices a blocking gate message; one line of height stays reserved so a short message never shoves the footer; a longer wrapped message grows the region.', required: true },
    { name: 'footer', description: 'The action row: Previous on the leading edge, Next/Finish on the trailing edge.', required: true },
    { name: 'previous', description: 'Ghost button: always allowed, never gated, clears any error; disabled on the first step and while an async gate settles.', required: true },
    { name: 'next', description: 'Solid button: runs the active step\'s validate, then saves and advances - or completes from the last step; wears its loading state while an async gate settles.', required: true },
  ],
  props: [
    {
      name: 'steps',
      type: 'array',
      required: true,
      description: 'The wizard steps, in order.',
      item: {
        type: 'object',
        description: 'One step.',
        fields: [
          { name: 'id', type: 'string', required: true, description: 'Stable identity; keys the panel transition.' },
          { name: 'label', type: 'node', required: true, description: 'Step name: shown as the panel heading and used for accessible labelling.' },
          { name: 'content', type: 'node', required: true, description: 'The panel body for this step.' },
          {
            name: 'validate',
            type: 'handler',
            description:
              'The forward gate, run when Next/Finish is pressed on this step: true passes; false blocks silently (the step\'s own fields display their errors); a string blocks AND shows that message in the wizard\'s error live region. May return a Promise of the same: Next shows its loading state and the footer is inert until it settles; a rejection is a silent block and must not leave the footer stuck.',
          },
        ],
      },
    },
    { name: 'aria-label', type: 'string', required: true, description: 'Required accessible name for the wizard region.' },
    { name: 'activeStep', type: 'number', description: 'Controlled zero-based index of the active step; clamped into range when rendering.' },
    { name: 'defaultActiveStep', type: 'number', default: 0, description: 'Uncontrolled start - the resume point when restoring a saved draft.' },
    { name: 'onStepChange', type: 'handler', description: 'Called with the new index on every committed navigation, forward or back.' },
    { name: 'onSave', type: 'handler', description: 'Called with the index being left when its gate passes on forward navigation; the parent persists it and resumes via defaultActiveStep.' },
    { name: 'onComplete', type: 'handler', description: 'Called when Finish is pressed on the last step and its gate passes.' },
    { name: 'previousLabel', type: 'node', description: 'Previous action label; defaults to the localized kit Previous message.' },
    { name: 'nextLabel', type: 'node', description: 'Next action label; defaults to the localized kit Next message.' },
    { name: 'finishLabel', type: 'node', description: 'Finish action label shown on the last step; defaults to the localized kit Done message.' },
    { name: 'headingLevel', type: 'enum', values: ['2', '3'], default: '2', description: 'Heading element for the step label.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the component exact geometry: Steps skeleton, a heading-width line, three content lines, the reserved error line, and two control-height button blocks.' },
  ],
  defaults: {
    defaultActiveStep: 0,
    headingLevel: '2',
    skeleton: false,
  },
  dimensions: {
    gap: token('space-5'),
    footerGap: token('space-3'),
    skeletonContentGap: token('space-2'),
    panelRadius: token('radius-md'),
    errorFontSize: token('font-size-sm'),
    // Reserved height of the live region: exactly one line of its own text.
    errorMinHeight: '1lh',
  },
  states: [
    {
      name: 'error',
      description: 'A gate returned a message: the wizard stays on the step and the polite live region voices the message in danger text.',
      paint: { text: token('danger-text') },
    },
    {
      name: 'validating',
      description: 'An async gate is settling: the Next button wears its loading spinner, both footer actions are inert, and the panel is aria-busy; resolution advances, rejection blocks silently and re-enables the footer.',
      behavioral: true,
    },
    {
      name: 'skeleton',
      description: 'Exact-geometry placeholders, aria-hidden: the Steps skeleton, a heading line, three content lines, and two button blocks; nothing shifts when content arrives.',
    },
  ],
  // Painted on the panel when navigation moves focus into it, not on the host.
  paint: { text: '$text' },
  focusRing: { ring: token('focus-ring'), offset: '2px' },
  tokens: [
    'text', 'danger-text', 'font-size-sm',
    'space-2', 'space-3', 'space-5',
    'radius-md', 'focus-ring',
    'duration-fast', 'ease-out',
  ],
  a11y: {
    role: 'region',
    // The container itself never takes focus; the footer buttons (and the
    // step's own fields) are the tab stops, each with native button focus
    // semantics and the kit focus ring.
    focusable: false,
    keyboard: [
      { keys: 'Tab', action: 'Moves through the step\'s fields and then the footer actions in document order; the wizard adds no roving behavior of its own.' },
      { keys: 'Enter, Space', action: 'Activates the focused Previous or Next/Finish button through native button semantics.' },
    ],
    notes: [
      'The root is a labelled role="region"; the active panel is a role="group" aria-labelledby the step heading, which begins with a visually hidden localized "Step X of Y" so the panel name carries position.',
      'After a committed navigation (forward or back) focus moves to the panel (tabIndex -1) so keyboard and screen reader users land at the top of the new step; focus is never stolen on initial mount.',
      'A blocking gate message is announced by an always-present polite live region (role="status"); focus stays where it is.',
      'The footer buttons are native buttons with their own focus rings, loading, and disabled semantics: Previous is disabled on the first step, and both go inert while an async gate settles.',
      'The Steps progress header is numbered and announces position as a group label, so progress never relies on color alone.',
    ],
  },
  motion: {
    description:
      'The panel content crossfades with a small directional x shift - forward enters from the trailing side, back from the leading side - on the fast/out token pair; reduced motion collapses the shift to no transform.',
    transition: { speed: 'fast', ease: 'out' },
  },
};
