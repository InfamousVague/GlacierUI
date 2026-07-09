import type { ComponentSpec } from '../schema.ts';

export const tableSpec: ComponentSpec = {
  name: 'Table',
  id: 'table',
  category: 'organism',
  status: 'stable',
  summary: 'A simple data table for rows of structured content.',
  element: 'table',
  anatomy: [
    { name: 'header', description: 'The table header row.', required: true },
    { name: 'row', description: 'A table row containing cells.', required: true },
    { name: 'cell', description: 'A table cell.', required: true },
  ],
  props: [
    { name: 'columns', type: 'element', required: true, description: 'Column definitions for the header and cell rendering.' },
    { name: 'data', type: 'element', required: true, description: 'Rows of data to render.' },
    { name: 'caption', type: 'element', description: 'Optional caption shown above the table.' },
    { name: 'emptyState', type: 'element', description: 'Content shown when there are no rows.' },
  ],
  a11y: {
    role: 'table',
    focusable: false,
    notes: ['The table uses semantic thead/tbody/tr/th/td elements and a caption when provided.']
  },
};
