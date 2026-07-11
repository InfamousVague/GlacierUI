import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

export const pageHeaderSpec: ComponentSpec = {
  name: 'PageHeader',
  id: 'page-header',
  category: 'structure',
  status: 'stable',
  summary:
    'The page masthead: breadcrumbs over an h1/h2 title with a muted description and metadata row, primary actions end-aligned, and an overflow menu of secondary actions behind an ellipsis button.',
  element: 'header',
  anatomy: [
    { name: 'breadcrumbs', description: 'Optional trail above the title; compose the kit Breadcrumbs.' },
    { name: 'title', required: true, description: 'The page title, a real h1 or h2 per headingLevel, set at the 2xl type step.' },
    { name: 'description', description: 'Muted supporting copy directly under the title.' },
    { name: 'meta', description: 'Inline wrapping metadata row under the title and description: pills, status dots, counts.' },
    { name: 'actions', description: 'Primary actions sharing one wrapping row with the title block; end-aligned on wide layouts, dropping below the title on narrow widths.' },
    { name: 'overflowMenu', description: 'Secondary actions behind a localized ellipsis icon button, rendered as Menu rows; omitted entirely when there are none.' },
  ],
  props: [
    { name: 'title', type: 'node', required: true, description: 'The page title, rendered as an h1 or h2 per headingLevel.' },
    { name: 'description', type: 'node', description: 'Muted supporting copy under the title.' },
    { name: 'breadcrumbs', type: 'node', description: 'Slot above the title; compose the kit Breadcrumbs.' },
    { name: 'meta', type: 'node', description: 'Inline metadata row under the title and description.' },
    { name: 'actions', type: 'node', description: 'Primary actions, end-aligned on wide layouts.' },
    {
      name: 'secondaryActions',
      type: 'array',
      description: 'Secondary actions collected into an overflow Menu behind a localized ellipsis button; the button is omitted when the list is empty.',
      item: {
        type: 'object',
        description: 'One overflow menu row.',
        fields: [
          { name: 'id', type: 'string', required: true, description: 'Stable identity for the row.' },
          { name: 'label', type: 'node', required: true, description: 'The row label.' },
          { name: 'onSelect', type: 'handler', description: 'Called when the row is chosen; the menu then closes.' },
          { name: 'disabled', type: 'boolean', description: 'Dims the row and ignores selection.' },
        ],
      },
    },
    { name: 'headingLevel', type: 'enum', values: ['1', '2'], default: 1, description: 'The heading element used for the title. The visual size stays the same; only the semantics change.' },
    { name: 'density', type: 'enum', values: ['comfortable', 'compact'], default: 'comfortable', description: 'Vertical rhythm; compact trims the block padding and stack gap.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the component exact geometry.' },
  ],
  defaults: { headingLevel: 1, density: 'comfortable', skeleton: false },
  dimensions: {
    paddingBlock: token('space-6'),
    compactPaddingBlock: token('space-4'),
    // gap between the breadcrumbs and the title/actions row
    sectionGap: token('space-3'),
    compactSectionGap: token('space-2'),
    // the shared wrapping row: block gap when the actions wrap under the title
    rowGapBlock: token('space-3'),
    rowGapInline: token('space-4'),
    // title block internals and the two inline clusters
    titleGap: token('space-2'),
    metaGap: token('space-2'),
    actionsGap: token('space-2'),
    // flex-basis of the title block: the no-JS wrap threshold for the actions
    // row, deliberately off the space scale like other layout breakpoints
    wrapBasis: '20rem',
  },
  states: [
    {
      name: 'skeleton',
      description: 'Replaces each provided slot with a Skeleton line in the same container inside an aria-hidden header; the actions collapse to one control-height block.',
    },
  ],
  tokens: [
    'text', 'text-muted', 'font-sans',
    'font-size-2xl', 'leading-2xl', 'tracking-2xl', 'font-weight-semibold',
    'font-size-md', 'leading-md', 'font-size-sm', 'leading-sm',
    'space-2', 'space-3', 'space-4', 'space-6',
    'control-height-md', 'control-radius',
  ],
  a11y: {
    focusable: false,
    notes: [
      'The host is a header element: a banner landmark at the top of the page, or a plain group when nested inside main, article, or section.',
      'The title renders as a real h1 or h2 per headingLevel so the document outline stays honest; keep one h1 per page and use headingLevel 2 when the page already owns its h1.',
      'The overflow trigger is an icon-only IconButton with a localized "More actions" name; Menu wires its aria-haspopup, aria-expanded, and aria-controls.',
      'Overflow keyboard behavior is inherited from Menu: ArrowUp/ArrowDown rove the rows, Home and End jump to the edges, Enter or Space selects, and Escape closes and restores focus to the trigger.',
      'The header itself is not focusable; focus behavior belongs to the composed controls in the actions slot and the overflow trigger.',
      'The skeleton placeholder is aria-hidden; mark the loading region aria-busy at the app level.',
    ],
  },
};
