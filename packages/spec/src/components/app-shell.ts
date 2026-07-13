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
    { name: 'resizer', description: 'Optional role="separator" drag strip on the sidebar\'s inline-end edge with a centered grip; rendered only when resizable is set, desktop only.' },
    { name: 'headerContent', description: 'Wrapper for the caller-supplied header slot, placed right of the menu button.' },
    { name: 'content', description: 'The scrollable region that renders children.' },
  ],
  props: [
    { name: 'sidebar', type: 'node', required: true, description: 'The persistent side navigation content.' },
    { name: 'header', type: 'node', description: 'Optional top bar content, placed to the right of the mobile menu button.' },
    { name: 'sidebarWidth', type: 'string', default: '16rem', description: 'Sidebar width on desktop, set on the --shell-sidebar custom property.' },
    { name: 'sidebarLabel', type: 'string', default: 'Navigation', description: 'Accessible name for the sidebar landmark.' },
    { name: 'floating', type: 'boolean', default: false, description: 'Detaches the desktop sidebar and header into floating, rounded cards with a gutter.' },
    { name: 'resizable', type: 'boolean', default: false, description: 'Lets the user drag the divider (or arrow-key it) to resize the sidebar.' },
    { name: 'onSidebarWidthChange', type: 'handler', description: 'Called with the next sidebar width (a px string) while resizing.' },
    { name: 'minSidebarWidth', type: 'number', default: 200, description: 'Lower clamp for the resize drag, in pixels.' },
    { name: 'maxSidebarWidth', type: 'number', default: 460, description: 'Upper clamp for the resize drag, in pixels.' },
    { name: 'children', type: 'node', description: 'The main content rendered in the scrollable column.' },
  ],
  defaults: { sidebarWidth: '16rem', sidebarLabel: 'Navigation', floating: false, resizable: false, minSidebarWidth: 200, maxSidebarWidth: 460 },
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
    {
      name: 'sticky',
      description:
        'The sidebar and header stick to the top of the viewport as the content scrolls (position: sticky, top 0). Pure positioning with zero paint of its own - their constant surface and glass-thin paints are bound on the component tokens.',
      behavioral: true,
    },
    { name: 'floating', description: 'The sidebar and header detach into rounded, shadowed cards inset by the gutter.', tokens: { background: token('surface'), border: token('glass-border'), radius: token('radius-xl'), shadow: token('shadow-3') } },
    {
      name: 'empty-header',
      description:
        'With no header content the header strips its chrome to literals - background: transparent, border-bottom: none, backdrop-filter: none (no tokens involved) - and on desktop it is hidden entirely (display: none).',
      behavioral: true,
    },
    {
      name: 'resizer-hover',
      description:
        'Hovering or focusing the resize divider recolors its grip from border-strong to accent-solid and grows it from space-6 to space-8 tall; the divider itself suppresses its focus outline (outline: none) in favor of the grip highlight.',
      tokens: { grip: token('accent-solid'), 'grip-rest': token('border-strong') },
    },
  ],
  // the sidebar and main children paint
  paint: {},
  transition: { duration: token('duration-normal'), ease: token('ease-out') },
  tokens: [
    'space-2', 'space-3', 'space-4', 'space-6', 'space-8',
    'radius-xl', 'radius-full', 'hairline',
    'surface', 'glass-thin', 'glass-border', 'glass-saturate', 'overlay',
    'blur-sm', 'blur-md',
    'shadow-3', 'shadow-5',
    'border-strong', 'accent-solid',
    'duration-fast', 'duration-normal', 'ease-out',
  ],
  a11y: {
    role: 'complementary',
    focusable: false,
    keyboard: [
      { keys: 'Escape', action: 'Closes the open drawer.' },
      { keys: 'ArrowLeft, ArrowRight', action: 'On the focused resizer, moves the divider by 16px steps toward or away from the sidebar (direction-aware in RTL).' },
      { keys: 'Home, End', action: 'On the focused resizer, jumps the sidebar to its minimum or maximum width.' },
    ],
    notes: [
      'The sidebar is an aside landmark named by sidebarLabel (default "Navigation").',
      'The built-in menu button carries aria-label "Open navigation" and is visible only below the lg breakpoint.',
      'On small screens, clicking the backdrop or any link or button inside the sidebar closes the drawer.',
      'The drawer is not a focus trap and does not use dialog semantics; it is a persistent aside that becomes off-canvas.',
      'The optional resizer is a keyboard-reachable role="separator" (aria-orientation="vertical") labeled from the kit\'s translatable Resize sidebar message; it is hidden below the lg breakpoint.',
    ],
  },
  motion: {
    description: 'On small screens the drawer slides in and out via a transform transition; it respects reduced motion.',
    transition: { speed: 'normal', ease: 'out' },
  },
};
