import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

export const drawerSides = ['left', 'right', 'bottom'] as const;
export const drawerSizes = ['sm', 'md', 'lg'] as const;

export const drawerSpec: ComponentSpec = {
  name: 'Drawer',
  id: 'drawer',
  category: 'organism',
  status: 'draft',
  summary: 'A modal sheet that enters from a viewport edge, traps focus, locks scrolling, and optionally dismisses from the backdrop or Escape.',
  element: 'div',
  anatomy: [
    { name: 'overlay', description: 'The fixed, blurred backdrop behind the sheet; optionally dismisses the drawer on press.' },
    { name: 'panel', description: 'The modal sheet surface that enters from the selected edge.', required: true },
    { name: 'header', description: 'Header row containing title/description and optional close action.' },
    { name: 'title', description: 'Heading that labels the dialog via aria-labelledby.' },
    { name: 'description', description: 'Muted supporting text linked through aria-describedby.' },
    { name: 'close', description: 'Optional IconButton that dismisses the drawer.' },
    { name: 'body', description: 'Scrollable main content slot.' },
    { name: 'footer', description: 'Optional end-aligned action row.' },
  ],
  props: [
    { name: 'open', type: 'boolean', required: true, description: 'Whether the drawer is mounted and shown.' },
    { name: 'onClose', type: 'handler', required: true, description: 'Called by permitted dismissal paths and the close action.' },
    { name: 'title', type: 'node', description: 'Heading content that names the dialog.' },
    { name: 'description', type: 'node', description: 'Supporting content below the title.' },
    { name: 'side', type: 'enum', values: drawerSides, default: 'right', description: 'Viewport edge from which the sheet enters.' },
    { name: 'size', type: 'enum', values: drawerSizes, default: 'md', description: 'Maximum width step for left and right sheets.' },
    { name: 'floating', type: 'boolean', description: 'Detaches the sheet into a floating card with a gutter on every edge and all corners rounded. Unset, it follows the host layout: a root data-layout=\'floating\' attribute floats every drawer; otherwise the sheet sits flush, edge to edge.' },
    { name: 'footer', type: 'node', description: 'Action row shown below the scrollable body.' },
    { name: 'dismissible', type: 'boolean', default: true, description: 'Enables Escape, backdrop press, and the close action.' },
    { name: 'children', type: 'node', description: 'Drawer body content.' },
  ],
  sizes: [
    { name: 'sm', diameter: '22rem' },
    { name: 'md', diameter: '28rem' },
    { name: 'lg', diameter: '36rem' },
  ],
  defaults: { side: 'right', size: 'md', dismissible: true },
  dimensions: {
    gutter: token('space-3'), // floating mode only; the default is edge to edge
    radius: token('radius-2xl'),
    border: token('hairline'),
    headerPadding: token('space-6'),
    bodyPadding: token('space-6'),
    footerPadding: token('space-6'),
    footerGap: token('space-3'),
  },
  states: [
    { name: 'open', description: 'The backdrop fades in and the panel enters from the selected side; body scrolling locks and focus moves into the panel.', tokens: { overlay: token('overlay'), background: token('glass-thick') } },
    {
      name: 'dismissible',
      description: 'Escape, overlay press, and the close action call onClose. Pure dismissal wiring - the sheet renders identically either way apart from the close button being present.',
      behavioral: true,
    },
    {
      name: 'persistent',
      description: 'Backdrop press and Escape do not dismiss the drawer and no close action is rendered; nothing repaints.',
      behavioral: true,
    },
  ],
  // The panel suppresses its own outline (.panel:focus-visible { outline: none };
  // focus is managed on open). The ring belongs to the interior controls - the
  // close IconButton and footer actions draw the kit-wide 2px focus-ring outline
  // at a 2px offset.
  paint: { background: '$glass-thick', text: '$text', border: '$glass-border' },
  focusRing: { ring: token('focus-ring'), offset: '2px' },
  tokens: [
    'space-2', 'space-3', 'space-4', 'space-5', 'space-6', 'space-8', 'space-12',
    'overlay', 'blur-sm', 'blur-lg', 'glass-thick', 'glass-border', 'glass-highlight', 'glass-saturate',
    'hairline', 'radius-2xl', 'shadow-5', 'border', 'text', 'font-sans', 'focus-ring',
  ],
  a11y: {
    role: 'dialog',
    focusable: true,
    keyboard: [
      { keys: 'Tab, Shift+Tab', action: 'Cycles focus within the drawer while it is open.' },
      { keys: 'Escape', action: 'Calls onClose when dismissible is true.' },
    ],
    notes: [
      'Sets aria-modal=true and labels/describes itself from supplied title and description.',
      'Renders into document.body, locks body scrolling, restores focus to the opener, and traps Tab focus.',
      'When dismissible is false, Escape and overlay presses do nothing and the close action is omitted.',
    ],
  },
  motion: {
    description: 'The backdrop fades while the sheet springs from its selected edge; both become instant with reduced motion.',
    transition: { spring: 'snappy' },
  },
};