import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

export const appShellSpec: ComponentSpec = {
  name: 'AppShell',
  id: 'app-shell',
  category: 'organism',
  status: 'stable',
  summary: 'The app frame: a sticky sidebar beside a scrollable main column, with an optional mobile mode that uses an off-canvas drawer.',
  element: 'div',
  anatomy: [
    { name: 'sidebar', description: 'The persistent side navigation landmark; sticky in desktop mode and an off-canvas drawer in mobile mode.', required: true },
    { name: 'backdrop', description: 'The scrim rendered behind the open mobile drawer; clicking it closes the drawer.' },
    { name: 'main', description: 'The main column: header stacked above scrollable content.' },
    { name: 'header', description: 'Sticky top bar holding the responsive sidebar toggle and optional header content.' },
    { name: 'menuButton', description: 'The built-in IconButton that collapses the desktop sidebar or opens the mobile drawer.' },
    { name: 'closeButton', description: 'The explicit X button inside the expanded mobile drawer.' },
    { name: 'resizer', description: 'Optional role="separator" drag strip on the sidebar\'s inline-end edge with a centered grip; rendered only when resizable is set, desktop only.' },
    { name: 'headerContent', description: 'Wrapper for the caller-supplied header slot, placed right of the menu button.' },
    { name: 'content', description: 'The scrollable region that renders children.' },
    { name: 'bottomNav', description: 'Optional primary navigation pinned below mobile content and at the bottom of the desktop sidebar.' },
  ],
  props: [
    { name: 'sidebar', type: 'node', required: true, description: 'The persistent side navigation content.' },
    { name: 'header', type: 'node', description: 'Optional top bar content, placed to the right of the mobile menu button.' },
    { name: 'bottomNav', type: 'node', description: 'Optional primary navigation shown below mobile content and at the bottom of the desktop sidebar.' },
    { name: 'sidebarWidth', type: 'string', default: '16rem', description: 'Sidebar width on desktop, set on the --shell-sidebar custom property.' },
    { name: 'sidebarLabel', type: 'string', default: 'Navigation', description: 'Accessible name for the sidebar landmark.' },
    { name: 'floating', type: 'boolean', default: false, description: 'Detaches the sidebar, header, and mobile bottom navigation into rounded cards with a gutter.' },
    { name: 'isMobile', type: 'boolean', description: 'Forces the mobile or desktop layout. When omitted, follows the lg viewport breakpoint.' },
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
    { name: 'open', description: 'The mobile drawer is open: the sidebar slides in, gains a shadow, and the backdrop appears.', tokens: { shadow: token('shadow-5'), scrim: token('overlay') } },
    { name: 'sidebar-collapsed', description: 'The desktop sidebar, resizer, and sidebar bottom navigation are hidden while the main column fills the frame.', behavioral: true },
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
        'With no header content the mobile header strips its chrome to literals; on desktop the header remains visible so the sidebar toggle stays available.',
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
      'The built-in responsive toggle carries aria-expanded and a state-aware Open navigation or Close navigation label.',
      'In mobile mode, the explicit X button, backdrop, or any link or button inside the sidebar closes the drawer.',
      'The drawer is not a focus trap and does not use dialog semantics; it is a persistent aside that becomes off-canvas.',
      'The optional resizer is a keyboard-reachable role="separator" (aria-orientation="vertical") labeled from the kit\'s translatable Resize sidebar message; it is hidden below the lg breakpoint.',
    ],
  },
  motion: {
    description: 'In mobile mode the drawer slides in and out via a transform transition; it respects reduced motion.',
    transition: { speed: 'normal', ease: 'out' },
  },
};
