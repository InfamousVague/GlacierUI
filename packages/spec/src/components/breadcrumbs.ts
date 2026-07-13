import type { ComponentSpec } from '../schema.ts';

export const breadcrumbsSpec: ComponentSpec = {
  name: 'Breadcrumbs',
  id: 'breadcrumbs',
  category: 'molecule',
  status: 'stable',
  summary: 'A compact path trail that shows where the current view sits in a hierarchy.',
  element: 'nav',
  anatomy: [
    { name: 'list', description: 'The ordered breadcrumb trail.', required: true },
    { name: 'item', description: 'One crumb in the trail.', required: true },
    { name: 'current', description: 'The active crumb, rendered as the current page.', required: true },
  ],
  props: [
    { name: 'items', type: 'element', required: true, description: 'Breadcrumb entries, each with a label and optional link/current state.' },
    { name: 'separator', type: 'element', default: '/', description: 'Separator rendered between items.' },
  ],
  defaults: { separator: '/' },
  // the links and separators paint
  paint: {},
  a11y: {
    role: 'navigation',
    focusable: false,
    notes: ['The component renders a nav landmark with an implicit Breadcrumb label.']
  },
};
