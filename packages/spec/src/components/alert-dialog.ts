import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

export const alertDialogTones = ['neutral', 'danger'] as const;

export const alertDialogSpec: ComponentSpec = {
  name: 'AlertDialog',
  id: 'alert-dialog',
  category: 'organism',
  status: 'draft',
  summary: 'A deliberate confirmation dialog that focuses its cancel action first and defaults to blocking accidental backdrop or Escape dismissal.',
  element: 'div',
  anatomy: [
    { name: 'overlay', description: 'The fixed, blurred backdrop behind the confirmation dialog.' },
    { name: 'panel', description: 'The centered alert dialog surface.', required: true },
    { name: 'title', description: 'Required heading that labels the alert dialog.' },
    { name: 'description', description: 'Optional consequence text linked through aria-describedby.' },
    { name: 'body', description: 'Optional custom supporting content.' },
    { name: 'cancel', description: 'The least destructive action, focused first on open.' },
    { name: 'action', description: 'The explicit confirmation action, optionally styled as dangerous.' },
  ],
  props: [
    { name: 'open', type: 'boolean', required: true, description: 'Whether the alert dialog is mounted and shown.' },
    { name: 'onClose', type: 'handler', required: true, description: 'Called by Cancel and permitted dismissal paths.' },
    { name: 'title', type: 'node', required: true, description: 'Required heading content that names the alert dialog.' },
    { name: 'description', type: 'node', description: 'Supporting consequence text below the title.' },
    { name: 'actionLabel', type: 'node', required: true, description: 'Visible label for the explicit confirmation action.' },
    { name: 'onAction', type: 'handler', required: true, description: 'Called when the confirmation action is activated.' },
    { name: 'cancelLabel', type: 'node', description: 'Optional visible label for the cancel action.' },
    { name: 'tone', type: 'enum', values: alertDialogTones, default: 'neutral', description: 'Semantic confirmation tone.' },
    { name: 'actionDisabled', type: 'boolean', default: false, description: 'Disables the confirmation action.' },
    { name: 'actionLoading', type: 'boolean', default: false, description: 'Shows a spinner and blocks the confirmation action.' },
    { name: 'dismissible', type: 'boolean', default: false, description: 'Enables Escape and backdrop dismissal.' },
    { name: 'children', type: 'node', description: 'Optional content between the description and actions.' },
  ],
  // Each tone paints the panel border and, through the Button it selects,
  // the confirmation action: neutral renders a solid Button (accent), danger
  // a danger Button. The action-* keys carry that Button's rendering.
  tones: [
    {
      name: 'neutral',
      description: 'Uses the standard glass border and a solid primary confirmation action.',
      paint: { border: token('glass-border') },
      tokens: { 'action-background': token('accent-solid'), 'action-text': token('accent-contrast'), 'action-hover': token('accent-solid-hover') },
    },
    {
      name: 'danger',
      description: 'Uses a danger border and danger confirmation action for irreversible operations.',
      paint: { border: token('danger-border') },
      tokens: { 'action-background': token('danger-solid'), 'action-text': token('danger-contrast'), 'action-hover': token('danger-solid-hover') },
    },
  ],
  defaults: { tone: 'neutral', actionDisabled: false, actionLoading: false, dismissible: false },
  dimensions: {
    radius: token('radius-2xl'),
    border: token('hairline'),
    overlayPadding: token('space-6'),
    panelPadding: token('space-5'),
    footerGap: token('space-3'),
  },
  states: [
    { name: 'open', description: 'The dialog fades and scales in; body scrolling locks and focus moves to Cancel.', tokens: { overlay: token('overlay'), background: token('glass-thick') } },
    { name: 'danger', description: 'The panel border recolors to danger (.danger { border-color }) and the confirmation action renders as a danger Button.', paint: { border: token('danger-border') }, tokens: { 'action-background': token('danger-solid') } },
    {
      name: 'action-disabled',
      description: 'The confirmation Button dims to half opacity (opacity: 0.5, a literal - no token) with a not-allowed cursor and blocks activation; it is the accent-solid (danger tone: danger-solid) fill that dims.',
      tokens: { 'action-background': token('accent-solid'), 'danger-action-background': token('danger-solid') },
    },
    {
      name: 'action-loading',
      description: 'The confirmation Button shows a leading Spinner drawn in the action text color via currentColor and blocks activation.',
      tokens: { spinner: token('accent-contrast'), 'danger-spinner': token('danger-contrast') },
    },
    {
      name: 'dismissible',
      description: 'Escape and overlay press call onClose when explicitly enabled. Pure dismissal wiring - nothing repaints.',
      behavioral: true,
    },
  ],
  // The panel suppresses its own outline (.panel:focus-visible { outline: none };
  // focus is managed onto Cancel on open). The ring belongs to the footer
  // Buttons, which draw the kit-wide 2px focus-ring outline at a 2px offset.
  focusRing: { ring: token('focus-ring'), offset: '2px' },
  tokens: [
    'space-3', 'space-4', 'space-5', 'space-6', 'space-16',
    'overlay', 'blur-sm', 'blur-lg', 'glass-thick', 'glass-border', 'glass-highlight', 'glass-saturate',
    'hairline', 'radius-2xl', 'shadow-5', 'text', 'font-sans', 'focus-ring',
    'accent-solid', 'accent-solid-hover', 'accent-contrast',
    'danger-border', 'danger-solid', 'danger-solid-hover', 'danger-contrast',
  ],
  a11y: {
    role: 'alertdialog',
    focusable: true,
    keyboard: [
      { keys: 'Tab, Shift+Tab', action: 'Cycles focus within the dialog.' },
      { keys: 'Escape', action: 'Calls onClose only when dismissible is true.' },
      { keys: 'Enter, Space', action: 'Activates the focused Cancel or confirmation action.' },
    ],
    notes: [
      'Sets role=alertdialog and aria-modal=true, with required title through aria-labelledby.',
      'Focus starts on the Cancel action to avoid accidental destructive confirmation.',
      'Backdrop and Escape dismissal are disabled by default; Cancel remains an explicit escape path.',
      'Renders into document.body, locks body scrolling, traps Tab focus, and restores focus to the opener on close.',
    ],
  },
  motion: {
    description: 'The overlay fades and the confirmation surface scales in; both become instant with reduced motion.',
    transition: { speed: 'fast', ease: 'out' },
  },
};