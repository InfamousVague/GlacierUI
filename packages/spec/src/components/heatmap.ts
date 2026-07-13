import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

export const heatmapSpec: ComponentSpec = {
  name: 'Heatmap',
  id: 'heatmap',
  category: 'molecule',
  status: 'stable',
  summary:
    'A GitHub-contribution-style intensity grid: values (a 2D array or a flat {date,value} list) are bucketed onto the accent ramp, each cell titled with its value, with an optional less→more legend.',
  element: 'div',
  anatomy: [
    { name: 'grid', description: 'The columns of cells; a 2D array reads across then down, a flat list chunks into columns of `rows` height.', required: true },
    { name: 'cell', description: 'One tile, shaded by its level as a fraction of the data max; carries a title with its date and value.', required: true },
    { name: 'legend', description: 'An optional less→more row of swatches spanning the level scale.' },
  ],
  props: [
    { name: 'data', type: 'node', required: true, description: 'Values to plot: a 2D number[][] grid or a flat { date, value }[] list.' },
    { name: 'levels', type: 'number', default: 5, description: 'Number of intensity steps including the empty step 0.' },
    { name: 'legend', type: 'boolean', default: false, description: 'Show a less→more legend under the grid.' },
    { name: 'rows', type: 'number', default: 7, description: 'Cells per column when data is a flat list.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders an aria-hidden placeholder: one square Skeleton per cell at the exact cell size and gap, plus legend bones when legend is set.' },
    { name: 'skeletonColumns', type: 'number', default: 12, description: 'Columns the skeleton grid renders while there is no data; rows follow the rows prop.' },
    { name: 'aria-label', type: 'string', description: 'Accessible name for the grid.' },
  ],
  defaults: { levels: 5, legend: false, rows: 7, skeleton: false, skeletonColumns: 12 },
  dimensions: {
    radius: token('radius-xs'),
    gap: token('space-1'),
    cell: token('space-4'),
  },
  paint: { text: '$text-subtle' },
  tokens: [
    'surface-sunken',
    'border-subtle',
    'accent-9',
    'accent-border',
    'radius-xs',
    'space-1',
    'space-4',
    'hairline',
    'text-subtle',
  ],
  a11y: {
    role: 'img',
    focusable: false,
    notes: [
      'The grid is a single role="img" labelled by aria-label; the legend, when shown, describes it via aria-describedby.',
      'Every cell carries a native title and a visually-hidden text node so its date and value are legible to pointer and assistive tech.',
      'Colour is a redundant channel: the underlying value is always available as text, so intensity is not conveyed by hue alone.',
    ],
  },
};
