import type { ComponentSpec, PaintSpec, TokenRef } from '../schema.ts';
import { compactSizes, token } from '../vocab.ts';

/**
 * PresenceDot is a sibling of StatusDot, not a preset of it.
 *
 * StatusDot carries the kit's OPEN tone scale: six colour families a caller
 * picks from to mean whatever the screen needs, always drawn as one solid
 * circle, decorative unless the caller writes a label. Presence is the opposite
 * shape of problem — a CLOSED vocabulary of five reachability states, each of
 * which must (a) map to one agreed colour so two screens cannot disagree about
 * amber, (b) differ in outline as well as hue, because a 10px dot is exactly
 * where colour-only meaning fails, and (c) speak its name by default rather
 * than on request. None of those three are expressible as a StatusDot prop
 * combination, and encoding them as caller-side conventions is how the mapping
 * drifts. So this is its own contract, sized and rounded to match the StatusDot
 * family so the two still read as one idea.
 *
 * The `PresenceStatus` union and the shape-per-status table live in
 * @glacier/logic (they are logic, and both bindings resolve them), which is
 * why this spec lists the status names inline rather than exporting an enum.
 */
const presencePaint: Record<string, PaintSpec> = {
  online: { background: token('success-solid'), text: token('success-contrast') },
  away: { background: token('warning-solid'), text: token('warning-contrast') },
  busy: { background: token('danger-solid'), text: token('danger-contrast') },
  // hollow: the ring is the border, and nothing fills it
  offline: { border: token('text-subtle'), text: token('text-subtle') },
  invisible: { border: token('text-subtle'), text: token('text-subtle') },
};

const PRESENCE_DESCRIPTION: Record<string, string> = {
  online: 'Reachable now: a solid disc in the success family.',
  away: 'Signed in but idle: a disc with a crescent bitten out of it.',
  busy: 'Do not disturb: a disc crossed by a bar in the danger family.',
  offline: 'Not signed in: a hollow ring in the subtle text colour.',
  invisible: 'Signed in but appearing offline, shown only to the person themselves: a hollow ring around a small core.',
};

const statusNames = ['online', 'away', 'busy', 'offline', 'invisible'] as const;

export const presenceDotSpec: ComponentSpec = {
  name: 'PresenceDot',
  id: 'presence-dot',
  category: 'atom',
  status: 'draft',
  summary:
    'A person’s reachability as a small dot, in a closed five-state vocabulary where every state differs in shape as well as colour and names itself to assistive tech.',
  element: 'span',
  anatomy: [
    { name: 'dot', description: 'The circle itself: filled for the signed-in states, hollow for the rest.', required: true },
    { name: 'mark', description: 'The shape drawn inside the circle — the crescent bite, the do-not-disturb bar, or the invisible core — in the status’s contrast colour.' },
    { name: 'halo', description: 'An optional surface-coloured ring behind the dot, so it stays legible pinned to the corner of an avatar.' },
  ],
  props: [
    { name: 'status', type: 'enum', values: statusNames, default: 'offline', description: 'Which of the five reachability states the dot reports.' },
    { name: 'size', type: 'enum', values: compactSizes, default: 'md', description: 'Compact size step; the mark holds its proportions at both.' },
    { name: 'ring', type: 'boolean', default: false, description: 'Draws a surface-coloured halo behind the dot, for pinning it to an avatar.' },
    { name: 'label', type: 'string', description: 'Overrides the text alternative; defaults to the status’s own name.' },
    { name: 'decorative', type: 'boolean', default: false, description: 'Hides the dot from assistive tech. Only for when adjacent visible text already states the presence, otherwise the dot becomes colour-only.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
  ],
  tones: statusNames.map((name) => ({
    name,
    description: PRESENCE_DESCRIPTION[name] ?? '',
    paint: presencePaint[name],
  })),
  sizes: [
    // A step above StatusDot: the dot has to hold a legible mark, not just a hue.
    { name: 'sm', diameter: token('size-xs') },
    { name: 'md', diameter: token('size-sm') },
  ],
  defaults: { status: 'offline', size: 'md', ring: false, decorative: false, skeleton: false },
  dimensions: { radius: token('radius-full') },
  states: [
    {
      name: 'ring',
      description: 'A surface-coloured halo is drawn behind the dot so its edge survives being pinned over a photograph.',
      tokens: { halo: token('surface') },
    },
    {
      name: 'decorative',
      description: 'The dot is hidden from assistive tech; the caller has promised adjacent text already states the presence.',
      // an announcement change only: the dot paints exactly as it does at rest
      behavioral: true,
    },
    { name: 'skeleton', description: 'A placeholder circle at the exact geometry, with no mark and no announcement.' },
  ],
  tokens: [
    'size-xs', 'size-sm', 'radius-full', 'surface',
    'success-solid', 'success-contrast', 'warning-solid', 'warning-contrast',
    'danger-solid', 'danger-contrast', 'text-subtle',
  ],
  a11y: {
    role: 'img',
    focusable: false,
    notes: [
      'Presence is never colour-only. Every status draws a different shape (solid, crescent, bar, ring, ring with a core), and the dot carries a text alternative naming the status by default.',
      'The dot is role="img" with an aria-label rather than role="status": a member list holds dozens of them, and dozens of live regions would announce a roster every time anyone signed in.',
      'decorative is the deliberate opt-out, for a row whose visible text already names the presence; it is the only way to render the dot without a text alternative.',
      'The English labels are the fallbacks from @glacier/logic; pass labels to translate them.',
    ],
  },
  motion: { description: 'Static. Presence changes are data, not an animation; a pulsing roster is noise.' },
};
