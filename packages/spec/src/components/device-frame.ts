import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/** Size steps, exported so the React kit derives its union from here. */
export const deviceFrameSizes = ['sm', 'md', 'lg'] as const;

export const deviceFrameSpec: ComponentSpec = {
  name: 'DeviceFrame',
  id: 'device-frame',
  category: 'atom',
  status: 'stable',
  summary:
    'A decorative phone bezel with a fixed-aspect, inset screen that hosts arbitrary children — a preview, a screenshot, or an iframe — in three preset widths or an explicit width.',
  element: 'div',
  anatomy: [
    { name: 'bezel', description: 'The decorative outer shell and inner rim; aria-hidden.' },
    { name: 'notch', description: 'The top cutout with speaker and camera dots; aria-hidden and optional.' },
    { name: 'buttons', description: 'Decorative side buttons on the shell; aria-hidden.' },
    { name: 'screen', description: 'The fixed aspect-ratio inset region that clips and hosts the children.', required: true },
    { name: 'content', description: 'The children slot; a single child stretches to fill the screen.' },
  ],
  props: [
    { name: 'size', type: 'enum', values: deviceFrameSizes, default: 'md', description: 'Preset screen width; ignored when width is set.' },
    { name: 'width', type: 'string', description: 'Explicit screen width overriding size, e.g. 320 or "20rem".' },
    { name: 'aspect', type: 'string', default: '9 / 19.5', description: 'Screen aspect ratio as width / height.' },
    { name: 'hideNotch', type: 'boolean', default: false, description: 'Hides the decorative notch for a full-bleed slab.' },
    { name: 'aria-label', type: 'string', description: 'Accessible name for the frame region.' },
    { name: 'children', type: 'node', description: 'The preview or iframe that fills the screen.' },
  ],
  sizes: [
    { name: 'sm', diameter: '13.5rem' },
    { name: 'md', diameter: '17rem' },
    { name: 'lg', diameter: '21rem' },
  ],
  defaults: { size: 'md', aspect: '9 / 19.5', hideNotch: false },
  dimensions: {
    radius: token('radius-2xl'),
    screenRadius: token('radius-xl'),
    bezel: token('space-2'),
  },
  tokens: [
    'gray-9', 'surface-sunken', 'border', 'border-strong', 'hairline',
    'radius-2xl', 'radius-xl', 'radius-md', 'radius-full',
    'space-2', 'space-3', 'space-4', 'space-5', 'space-6', 'space-8',
    'shadow-4', 'font-sans',
  ],
  a11y: {
    role: 'group',
    focusable: false,
    notes: [
      'The frame is a role="group"; give it an aria-label to name what it presents.',
      'The bezel, notch, and side buttons are decorative and marked aria-hidden — only the screen contents carry meaning.',
      'An embedded iframe still needs its own title for assistive tech.',
    ],
  },
};
