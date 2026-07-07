import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

export const appShellSpec: ComponentSpec = {
  name: 'AppShell',
  id: 'app-shell',
  category: 'organism',
  status: 'stable',
  summary: 'The app frame: a sticky sidebar beside a scrollable main column with an optional sticky header, collapsing to an off-canvas drawer on small screens.',
  element: 'div',
  anatomy: [
    { name: 'sidebar', description: 'The persistent side navigation landmark; sticky on desktop, an off-canvas drawer below the lg breakpoint.', required: true },
    { name: 'backdrop', description: 'The scrim rendered behind the open drawer; clicking it closes the drawer. Present only while open on small screens.' },
    { name: 'main', description: 'The main column: header stacked above scrollable content.' },
    { name: 'header', description: 'Sticky top bar holding the mobile menu button and optional header content.' },
    { name: 'menuButton', description: 'The built-in IconButton that opens the drawer; visible only below the lg breakpoint.' },
    { name: 'headerContent', description: 'Wrapper for the caller-supplied header slot, placed right of the menu button.' },
    { name: 'content', description: 'The scrollable region that renders children.' },
  ],
  props: [
    { name: 'sidebar', type: 'node', required: true, description: 'The persistent side navigation content.' },
    { name: 'header', type: 'node', description: 'Optional top bar content, placed to the right of the mobile menu button.' },
    { name: 'sidebarWidth', type: 'string', default: '16rem', description: 'Sidebar width on desktop, set on the --shell-sidebar custom property.' },
    { name: 'sidebarLabel', type: 'string', default: 'Navigation', description: 'Accessible name for the sidebar landmark.' },
    { name: 'floating', type: 'boolean', default: false, description: 'Detaches the desktop sidebar and header into floating, rounded cards with a gutter.' },
    { name: 'children', type: 'node', description: 'The main content rendered in the scrollable column.' },
  ],
  defaults: { sidebarWidth: '16rem', sidebarLabel: 'Navigation', floating: false },
  // grid gutter for the floating variant; the sidebar and header share the space-4 gutter
  dimensions: {
    gap: token('space-3'),
    padding: token('space-2'),
    gutter: token('space-4'),
    radius: token('radius-xl'),
    border: token('hairline'),
  },
  states: [
    { name: 'open', description: 'The drawer is open: the sidebar slides in, gains a shadow, and the backdrop appears. Small screens only.', tokens: { shadow: token('shadow-5'), scrim: token('overlay') } },
    { name: 'sticky', description: 'The sidebar and header stick to the top of the viewport as the content scrolls.' },
    { name: 'floating', description: 'The sidebar and header detach into rounded, shadowed cards inset by the gutter.', tokens: { background: token('surface'), border: token('glass-border'), radius: token('radius-xl'), shadow: token('shadow-3') } },
    { name: 'empty-header', description: 'With no header content, the header loses its surface, border, and blur; on desktop it is hidden entirely.' },
  ],
  tokens: [
    'space-2', 'space-3', 'space-4',
    'radius-xl', 'hairline',
    'surface', 'glass-thin', 'glass-border', 'glass-saturate', 'overlay',
    'blur-sm', 'blur-md',
    'shadow-3', 'shadow-5',
    'duration-normal', 'ease-out',
  ],
  a11y: {
    role: 'complementary',
    focusable: false,
    keyboard: [{ keys: 'Escape', action: 'Closes the open drawer.' }],
    notes: [
      'The sidebar is an aside landmark named by sidebarLabel (default "Navigation").',
      'The built-in menu button carries aria-label "Open navigation" and is visible only below the lg breakpoint.',
      'On small screens, clicking the backdrop or any link or button inside the sidebar closes the drawer.',
      'The drawer is not a focus trap and does not use dialog semantics; it is a persistent aside that becomes off-canvas.',
    ],
  },
  motion: {
    description: 'On small screens the drawer slides in and out via a transform transition; it respects reduced motion.',
    transition: { speed: 'normal', ease: 'out' },
  },
};
