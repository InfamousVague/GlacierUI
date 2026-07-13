import type { ComponentSpec } from '../schema.ts';

export const paginationSpec: ComponentSpec = {
  name: 'Pagination',
  id: 'pagination',
  category: 'molecule',
  status: 'stable',
  summary: 'A compact navigator for moving between pages of results or content.',
  element: 'nav',
  anatomy: [
    { name: 'previous', description: 'The previous-page control.', required: true },
    { name: 'page', description: 'A page-number button.', required: true },
    { name: 'next', description: 'The next-page control.', required: true },
  ],
  props: [
    { name: 'page', type: 'number', required: true, description: 'The current page number, one-based.' },
    { name: 'total', type: 'number', required: true, description: 'Total number of rows or items across all pages.' },
    { name: 'pageSize', type: 'number', default: 10, description: 'Items shown per page.' },
    { name: 'onPageChange', type: 'handler', required: true, description: 'Invoked with the clicked page number.' },
    { name: 'siblingCount', type: 'number', default: 1, description: 'How many pages to show around the active one.' },
    { name: 'boundaryCount', type: 'number', default: 1, description: 'How many pages to keep visible at the start and end for very large ranges.' },
  ],
  defaults: { pageSize: 10, siblingCount: 1, boundaryCount: 1 },
  // the page buttons paint
  paint: {},
  a11y: {
    role: 'navigation',
    focusable: false,
    notes: ['The pager uses a nav landmark and exposes the current page through aria-current on the active button.']
  },
};
