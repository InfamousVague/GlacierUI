import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

export const sectionSpec: ComponentSpec = {
  name: 'Section',
  id: 'section',
  category: 'structure',
  status: 'stable',
  summary:
    'A titled page region: a heading row with description and end-aligned actions, a token-driven rhythm gap before the content, and an optional hairline divider for stacking.',
  element: 'section',
  anatomy: [
    {
      name: 'header',
      description:
        'The heading row: title and description stacked at the start, actions at the end; omitted entirely when all three are empty.',
    },
    {
      name: 'title',
      description: 'The section heading (h2 or h3); its generated id labels the section through aria-labelledby.',
    },
    { name: 'description', description: 'A muted supporting line under the title.' },
    { name: 'actions', description: 'End-aligned controls on the heading row; they wrap below the title on narrow widths.' },
    { name: 'content', description: 'The section body, separated from the header by the gap step.', required: true },
  ],
  props: [
    {
      name: 'title',
      type: 'node',
      description: 'Section heading; when present the section is labelled by the heading through aria-labelledby.',
    },
    { name: 'description', type: 'node', description: 'Muted supporting content under the title.' },
    { name: 'actions', type: 'node', description: 'Content aligned to the end of the heading row, such as actions.' },
    {
      name: 'headingLevel',
      type: 'enum',
      values: ['2', '3'],
      default: '2',
      description: 'Semantic heading level for the title: h2 for page sections, h3 for sections nested under an h2.',
    },
    {
      name: 'gap',
      type: 'enum',
      values: ['sm', 'md', 'lg'],
      default: 'md',
      description: 'Vertical rhythm between the header block and the content: space-3, space-5, or space-8.',
    },
    {
      name: 'divider',
      type: 'boolean',
      default: false,
      description: 'Draws a hairline top rule with a leading offset so stacked sections separate cleanly.',
    },
    {
      name: 'density',
      type: 'enum',
      values: ['comfortable', 'compact'],
      default: 'comfortable',
      description: 'Section rhythm; compact trims every gap step one notch down the space scale.',
    },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the component exact geometry.' },
    { name: 'children', type: 'node', required: true, description: 'The section content.' },
  ],
  defaults: { headingLevel: '2', gap: 'md', divider: false, density: 'comfortable', skeleton: false },
  dimensions: {
    // the gap prop steps, comfortable density
    gapSm: token('space-3'),
    gapMd: token('space-5'),
    gapLg: token('space-8'),
    // compact density trims each step one notch down the scale
    compactGapSm: token('space-2'),
    compactGapMd: token('space-3'),
    compactGapLg: token('space-5'),
    // heading row: title block to actions (inline), the row's wrap gap when
    // the actions drop onto their own line (block), title to description,
    // and between actions
    headerGap: token('space-4'),
    headerGapBlock: token('space-2'),
    headerTextGap: token('space-1'),
    actionsGap: token('space-2'),
    // divider rule and its offset before the header
    border: token('hairline'),
    dividerOffset: token('space-6'),
    compactDividerOffset: token('space-4'),
  },
  states: [
    {
      name: 'divider',
      description:
        'A hairline border-subtle top rule with a dividerOffset leading padding (compactDividerOffset under compact density), separating stacked sections.',
      paint: { border: token('border-subtle') },
    },
    {
      name: 'skeleton',
      description:
        'Mirrors each provided header slot (title, description, actions) with a placeholder at the same scale and stands text lines in for the content, so nothing shifts on arrival; the whole placeholder is aria-hidden.',
    },
  ],
  tokens: [
    'font-sans', 'font-size-sm', 'leading-sm', 'text', 'text-muted',
    'hairline', 'border-subtle',
    'space-1', 'space-2', 'space-3', 'space-4', 'space-5', 'space-6', 'space-8',
  ],
  a11y: {
    focusable: false,
    notes: [
      'With a title, the section element carries aria-labelledby pointing at the generated heading id, so it is exposed as a named region landmark.',
      'Without a title the section renders no aria-labelledby and is not a named landmark; pass aria-label when an untitled section should still be a named region.',
      'headingLevel only switches between h2 and h3: pick the level that keeps the page outline sequential, and do not skip levels between nested sections.',
      'The divider is decorative separation between stacked sections; it carries no semantics of its own.',
      'Give icon-only controls in the actions slot an aria-label; the section adds no labels to its slots.',
    ],
  },
};
