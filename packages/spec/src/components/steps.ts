import type { ComponentSpec } from '../schema.ts';
import { toneSpecs, token } from '../vocab.ts';

/** Dot tones, exported so the React kit derives its union from here. */
export const stepsTones = ['accent', 'success', 'warning', 'danger', 'neutral', 'info'] as const;

/** Visual treatments, exported so the React kit derives its union from here. */
export const stepsVariants = ['dots', 'connected'] as const;

/** Dot size steps, exported so the React kit derives its union from here. */
export const stepsSizes = ['sm', 'md'] as const;

export const stepsSpec: ComponentSpec = {
  name: 'Steps',
  id: 'steps',
  category: 'atom',
  status: 'stable',
  summary: 'A row of step markers for tours, wizards, and quizzes: compact dots, or connected circles joined by lines with checks on completed steps and optional numbering.',
  element: 'div',
  anatomy: [
    { name: 'track', description: 'The inline-flex dot row, centered on its cross axis and laid out with a size-scaled gap.', required: true },
    { name: 'dot', description: 'One step marker; painted completed, current, or upcoming by its index relative to active.', required: true },
    { name: 'marker', description: 'In the connected variant, the circular step marker holding a check, a number, or the current dot.' },
    { name: 'connector', description: 'In the connected variant, the line joining neighboring markers; filled in the tone once the step before it completes.' },
    { name: 'check', description: 'The check glyph inside a completed connected marker, hidden from assistive tech.' },
    { name: 'skeleton', description: 'In the skeleton branch, the track holds one circular Skeleton placeholder per step at the exact dot diameter, plus connector bones in the connected variant.' },
  ],
  props: [
    { name: 'variant', type: 'enum', values: stepsVariants, default: 'dots', description: 'dots renders the compact dot row; connected renders larger circular markers joined by connector lines, with a check on each completed step.' },
    { name: 'numbered', type: 'boolean', default: false, description: 'Numbers the connected markers from 1; completed markers keep the check. Ignored by the dots variant.' },
    { name: 'count', type: 'number', required: true, description: 'Total number of steps; renders this many dots. Coerced with floor and clamped to at least zero.' },
    { name: 'active', type: 'number', default: 0, description: 'Zero-based index of the current step. Earlier dots read as completed, later ones as upcoming; the value is clamped into the [0, count - 1] range.' },
    { name: 'tone', type: 'enum', values: [...toneSpecs(stepsTones).map((t) => t.name)], default: 'accent', description: 'Semantic color family for completed and current dots; upcoming dots are tone-agnostic.' },
    { name: 'size', type: 'enum', values: stepsSizes, default: 'md', description: 'Compact size step; sets dot diameter and the gap between dots.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders an aria-hidden placeholder row of circular skeletons with the component\'s exact geometry.' },
  ],
  variants: [
    // each variant's paint is its rest (upcoming) marker rendering; completed
    // and current markers repaint per tone (see tones and states)
    { name: 'dots', description: 'The compact dot row, the default. An upcoming dot sits hollow on the surface with an inset hairline border.', paint: { background: token('surface'), border: token('border') } },
    {
      name: 'connected',
      description: 'Circular markers joined by connector lines, with checks on completed steps. An upcoming marker sits hollow on the surface with an inset hairline border and subtle text; connectors rest in the border color.',
      paint: { background: token('surface'), text: token('text-subtle'), border: token('border') },
      tokens: { 'connector-background': token('border') },
    },
  ],
  tones: [
    // tone.paint is the completed/current dot fill under the default dots
    // variant; the connected variant's marker and connector renderings ride
    // along in each tone's tokens map
    {
      name: 'accent',
      description: 'The brand accent family, for primary emphasis.',
      paint: { background: token('accent-solid') },
      tokens: { 'connected-done-background': token('accent-solid'), 'connected-done-text': token('accent-contrast'), 'connected-now-ring': token('accent-solid'), 'connected-now-text': token('accent-text'), 'connected-connector-background': token('accent-solid') },
    },
    {
      name: 'success',
      description: 'Positive or complete states.',
      paint: { background: token('success-solid') },
      tokens: { 'connected-done-background': token('success-solid'), 'connected-done-text': token('success-contrast'), 'connected-now-ring': token('success-solid'), 'connected-now-text': token('success-text'), 'connected-connector-background': token('success-solid') },
    },
    {
      name: 'warning',
      description: 'Caution states that still let the user proceed.',
      paint: { background: token('warning-solid') },
      tokens: { 'connected-done-background': token('warning-solid'), 'connected-done-text': token('warning-contrast'), 'connected-now-ring': token('warning-solid'), 'connected-now-text': token('warning-text'), 'connected-connector-background': token('warning-solid') },
    },
    {
      name: 'danger',
      description: 'Errors and destructive states.',
      paint: { background: token('danger-solid') },
      tokens: { 'connected-done-background': token('danger-solid'), 'connected-done-text': token('danger-contrast'), 'connected-now-ring': token('danger-solid'), 'connected-now-text': token('danger-text'), 'connected-connector-background': token('danger-solid') },
    },
    {
      name: 'neutral',
      description: 'The default, low-emphasis gray family; fills with the subtle text color, and the current connected marker rings in the strong border color instead.',
      paint: { background: token('text-subtle') },
      tokens: { 'connected-done-background': token('text-subtle'), 'connected-done-text': token('surface'), 'connected-now-ring': token('border-strong'), 'connected-now-text': token('text'), 'connected-connector-background': token('text-subtle') },
    },
    {
      name: 'info',
      description: 'Neutral-informational callouts.',
      paint: { background: token('info-solid') },
      tokens: { 'connected-done-background': token('info-solid'), 'connected-done-text': token('info-contrast'), 'connected-now-ring': token('info-solid'), 'connected-now-text': token('info-text'), 'connected-connector-background': token('info-solid') },
    },
  ],
  sizes: [
    { name: 'sm', diameter: '0.375rem', gap: token('space-1') },
    { name: 'md', diameter: '0.5rem', gap: token('space-2') },
  ],
  defaults: { variant: 'dots', numbered: false, active: 0, tone: 'accent', size: 'md', skeleton: false },
  dimensions: { radius: token('radius-full'), border: token('hairline'), currentScale: '1.5', markerSm: '1.25rem', markerMd: '1.5rem', connector: '2px', connectorMinWidth: token('space-4') },
  states: [
    { name: 'completed', description: 'A dot at an index below active, filled solid in the tone (accent by default); neutral falls back to the subtle text color. A completed connected marker draws the check in the tone contrast and fills the connector after it.', tokens: { background: token('accent-solid') } },
    { name: 'current', description: 'The dot at the clamped active index, filled solid in the tone (accent by default) and enlarged via transform: scale(1.5) so it marks position without shifting its neighbors. The current connected marker instead sits on the surface with an inset 2px ring in the tone and the tone text color.', tokens: { background: token('accent-solid'), 'connected-ring': token('accent-solid') } },
    { name: 'upcoming', description: 'A dot at an index above active, painted on the surface with an inset hairline border and no fill; tone-agnostic.', tokens: { background: token('surface'), border: token('border') } },
  ],
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'radius-full', 'space-1', 'space-2', 'space-4', 'hairline', 'border', 'border-strong', 'surface', 'text',
    'accent-solid', 'success-solid', 'warning-solid', 'danger-solid', 'text-subtle', 'info-solid',
    'accent-contrast', 'success-contrast', 'warning-contrast', 'danger-contrast', 'info-contrast',
    'accent-text', 'success-text', 'warning-text', 'danger-text', 'info-text',
    'font-sans', 'font-weight-semibold',
    'duration-fast', 'ease-out',
  ],
  a11y: {
    role: 'group',
    focusable: false,
    notes: [
      'The row is a group with an aria-label of "Step {n} of {count}", where n is the clamped current index plus one; individual dots are aria-hidden and decorative.',
      'Position is conveyed by the label text, not color alone, so completed and current dots need no per-dot semantics.',
      'In the skeleton branch the whole track is aria-hidden and carries no group role or label.',
    ],
  },
  motion: {
    description: 'The current dot eases its enlarging transform in on step change; only transform animates, so neighbors never shift. The transition is removed under reduced motion.',
    transition: { speed: 'fast', ease: 'out' },
  },
};
