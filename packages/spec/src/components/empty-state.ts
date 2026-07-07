import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

export const emptyStateSpec: ComponentSpec = {
  name: 'EmptyState',
  id: 'empty-state',
  category: 'atom',
  status: 'stable',
  summary:
    'A centered placeholder for an empty, filtered, or not-yet-created view. Stacks an optional icon disc, a title, a muted description, and an action, centered on both axes so it reads as a calm, deliberate stop rather than a broken screen.',
  element: 'div',
  anatomy: [
    { name: 'disc', description: 'Optional round, sunken disc framing a decorative glyph above the title. Omitted when no icon is passed.' },
    { name: 'title', description: 'Short heading naming what is empty or missing; renders as an h2.', required: true },
    { name: 'description', description: 'Optional muted sentence with more context, capped at 28rem and centered.' },
    { name: 'action', description: 'Optional call-to-action row (typically a Button) pulled a touch closer to the text.' },
    { name: 'extra', description: 'Any children passed after the action, rendered below it for custom content.' },
  ],
  props: [
    { name: 'icon', type: 'node', description: 'Decorative glyph rendered inside the leading disc; the disc is omitted when unset.' },
    { name: 'title', type: 'node', required: true, description: 'Heading naming what is empty; the accessible label for the view, rendered as an h2.' },
    { name: 'description', type: 'node', description: 'Muted supporting sentence, centered and capped at 28rem.' },
    { name: 'action', type: 'node', description: 'Call-to-action node, e.g. a Button, rendered below the text.' },
    { name: 'children', type: 'node', description: 'Extra content rendered below the action.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry: a disc plus two text lines.' },
  ],
  defaults: { skeleton: false },
  dimensions: {
    gap: token('space-4'),
    discSize: '4rem',
    discRadius: token('radius-full'),
    iconSize: token('font-size-2xl'),
    paddingBlock: token('space-8'),
    paddingInline: token('space-6'),
    descriptionMaxWidth: '28rem',
    titleFontSize: token('font-size-lg'),
    descriptionFontSize: token('font-size-sm'),
    actionGap: token('space-3'),
    actionOffset: token('space-2'),
  },
  states: [
    { name: 'default', description: 'A centered column: the sunken icon disc, an h2 title in the primary text color, a secondary-text description, then the action.' },
    { name: 'skeleton', description: 'Replaces the content with a 4rem circle placeholder and two text-line placeholders sized to the title (lg) and description (sm), holding the same vertical rhythm.' },
  ],
  tokens: [
    'space-2', 'space-3', 'space-4', 'space-6', 'space-8',
    'radius-full', 'surface-sunken',
    'font-sans', 'font-size-sm', 'font-size-lg', 'font-size-2xl',
    'font-weight-semibold', 'line-height-normal', 'line-height-relaxed',
    'text', 'text-secondary',
  ],
  a11y: {
    focusable: false,
    notes: [
      'The title is the accessible label for the empty view; keep it a short, literal phrase.',
      'The title renders as an h2, so it joins the document outline; place the EmptyState where an h2 fits the surrounding heading hierarchy.',
      'The icon disc is decorative and marked aria-hidden, so it is not announced.',
      'The container is not focusable; provide a real action (a button or link) when the user can resolve the empty state so keyboard users have a next step.',
    ],
  },
  motion: {
    description: 'The component itself is static and does not animate. In skeleton mode the placeholders inherit the shared Skeleton shimmer, which softens to an opacity pulse under reduced motion.',
  },
};
