import type { ComponentSpec, PaintSpec } from '../schema.ts';
import { compactSizes, token } from '../vocab.ts';

/**
 * The five states a sent message can be in, named here so the spec is readable
 * on its own. The union itself is `DeliveryStatus` in @glacier/logic, which is
 * also where the ordering (`deliveryRank`) and the shape table
 * (`deliveryGlyph`) live — this file owns only the paint.
 */
const statusNames = ['sending', 'sent', 'delivered', 'read', 'failed'] as const;

/**
 * Quiet greys until it matters. A transcript is a column of these marks, and
 * tinting every one of them turns the sender's own messages into a light show;
 * only `read` (the transition the sender is waiting for) and `failed` (the one
 * that needs acting on) spend colour.
 */
const deliveryPaint: Record<string, PaintSpec> = {
  sending: { text: token('text-subtle') },
  sent: { text: token('text-muted') },
  delivered: { text: token('text-muted') },
  read: { text: token('accent-text') },
  failed: { text: token('danger-text') },
};

const DELIVERY_DESCRIPTION: Record<string, string> = {
  sending: 'Queued on the device: an outline clock in the subtle text colour.',
  sent: 'The server has it: a single tick.',
  delivered: 'Their device has it: two ticks.',
  read: 'They read it: a tick enclosed in a solid disc, in the accent family — solid mass against the bare strokes of delivered, so the two differ in fill as well as hue.',
  failed: 'It did not send: a warning triangle in the danger family. Deliberately not a tick, so a failure can never be read as a variation on success.',
};

export const deliveryStatusSpec: ComponentSpec = {
  name: 'DeliveryStatus',
  id: 'delivery-status',
  category: 'atom',
  status: 'draft',
  summary:
    'How far a sent message got, as a glyph that differs in shape at every step — clock, tick, double tick, enclosed tick, warning triangle — so the state survives a monochrome display and a colour-blind reader.',
  element: 'span',
  anatomy: [
    { name: 'glyph', description: 'The mark itself, sized to the surrounding text rather than to a control.', required: true },
  ],
  props: [
    { name: 'status', type: 'enum', values: statusNames, description: 'How far the message got. Omit it, or pass statuses instead, and nothing is drawn.' },
    { name: 'statuses', type: 'array', item: { type: 'enum', values: statusNames, description: 'One message’s delivery state.' }, description: 'A stack of messages’ states, resolved to the least advanced one — so a run holding a failed send shows failed. Ignored when status is set.' },
    { name: 'size', type: 'enum', values: compactSizes, default: 'md', description: 'Compact size step, matched to the timestamp it sits beside.' },
    { name: 'label', type: 'string', description: 'Overrides the text alternative; defaults to the status’s own name.' },
    { name: 'decorative', type: 'boolean', default: false, description: 'Hides the glyph from assistive tech. Only for a row whose visible text already states the delivery, otherwise the mark becomes shape-and-colour-only to a screen reader.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
  ],
  defaults: { size: 'md', decorative: false, skeleton: false },
  tones: statusNames.map((name) => ({
    name,
    description: DELIVERY_DESCRIPTION[name] ?? '',
    paint: deliveryPaint[name],
  })),
  sizes: [
    { name: 'sm', iconSize: token('size-sm'), fontSize: token('font-size-xs') },
    { name: 'md', iconSize: token('size-md'), fontSize: token('font-size-sm') },
  ],
  states: [
    {
      name: 'decorative',
      description: 'Hidden from assistive tech; the caller has promised adjacent text already names the state. Paints exactly as it does at rest.',
      behavioral: true,
    },
    { name: 'skeleton', description: 'A placeholder at the glyph’s exact footprint, with no mark and no announcement.' },
  ],
  dimensions: { stroke: '1.75' },
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'size-sm', 'size-md', 'font-size-xs', 'font-size-sm',
    'text-subtle', 'text-muted', 'accent-text', 'danger-text',
    'duration-fast', 'ease-out',
  ],
  a11y: {
    role: 'img',
    focusable: false,
    notes: [
      'Never colour-only: every state draws a different silhouette (clock, one tick, two ticks, tick in a disc, triangle), which is the part that survives greyscale, a bad display, and the eight percent of men who cannot separate the red from the blue.',
      'role="img" with a label naming the state, not role="status": a transcript holds hundreds of these, and hundreds of live regions would re-read the conversation every time a receipt landed.',
      'decorative is the deliberate opt-out for a bubble whose own accessible name already reports the state.',
      'Retrying a failed send is the bubble’s job, not this glyph’s — the mark reports, it does not act, so it never becomes a tap target the size of a letter.',
    ],
  },
  motion: {
    description:
      'The glyph swaps outright as the state advances. No cross-fade: a tick dissolving into two ticks reads as a rendering fault, and the states are already ordered so they only ever move forward.',
    transition: { speed: 'fast', ease: 'out' },
  },
};
