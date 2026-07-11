import { Callout, Heading, Text, Size, TextTone } from '@glacier/react';
import type { CSSProperties } from 'react';
import { Example, PropsTable } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';

// A small static illustration of the shell layout. AppShell itself is a
// full-height frame (min-height 100vh with its own sticky sidebar), so it can
// not be nested inside a bounded doc example, and this page already lives
// inside one. This mock shows the composition; the living example is the site.
function ShellMock({ floating = false }: { floating?: boolean }) {
  const gap = floating ? 'var(--glacier-space-3)' : '0';
  const block: CSSProperties = {
    background: 'var(--glacier-surface-raised)',
    border: floating ? 'var(--glacier-hairline) solid var(--glacier-border-subtle)' : 'none',
    borderRadius: floating ? 'var(--glacier-radius-lg)' : '0',
    display: 'grid',
    placeItems: 'center',
    color: 'var(--glacier-text-subtle)',
    fontSize: 'var(--glacier-font-size-xs)',
  };
  return (
    <div
      style={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '9rem 1fr',
        gap,
        height: '13rem',
        padding: floating ? 'var(--glacier-space-3)' : '0',
        borderRadius: 'var(--glacier-radius-lg)',
        border: 'var(--glacier-hairline) solid var(--glacier-border-subtle)',
        background: 'var(--glacier-bg)',
        overflow: 'hidden',
      }}
    >
      <div style={{ ...block, borderRight: floating ? block.border : 'var(--glacier-hairline) solid var(--glacier-border-subtle)' }}>sidebar</div>
      <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr', gap, minWidth: 0 }}>
        <div style={{ ...block, height: '2.25rem', borderBottom: floating ? block.border : 'var(--glacier-hairline) solid var(--glacier-border-subtle)' }}>header</div>
        <div style={block}>main</div>
      </div>
    </div>
  );
}

export function AppShellPage() {
  return (
    <>
      <Heading level={1}>AppShell</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        The application frame: a sticky sidebar beside a scrollable main column with an optional
        sticky header. It is the top-level layout you build a whole app inside. Below the lg
        breakpoint the sidebar collapses to an off-canvas drawer with a built-in menu button.
      </Text>

      <Callout tone="info" title="Built on AppShell" style={{ marginBlockStart: 'var(--glacier-space-6)' }}>
        This whole site is a single AppShell: the sidebar, the top bar, and this scrolling column
        are its slots. Resize the window past the lg breakpoint to watch the sidebar collapse into a
        drawer.
      </Callout>

      <Heading level={2}>Anatomy</Heading>
      <Text tone={TextTone.Muted}>A schematic of the desktop grid with the exact spec measurements labelled.</Text>
      <ComponentBlueprint specId="app-shell" />

      <Heading level={2}>Examples</Heading>

      <Example
        title="Composition"
        description="Pass the sidebar and optional header as slots; children fill the scrollable main column. The sidebar sticks as the main content scrolls."
        code={`import { AppShell, Sidebar, SidebarItem, Toolbar } from '@glacier/react';

<AppShell
  sidebar={
    <Sidebar>
      <SidebarItem active>Home</SidebarItem>
      <SidebarItem>Settings</SidebarItem>
    </Sidebar>
  }
  header={<Toolbar end={<button>Account</button>}>Dashboard</Toolbar>}
>
  <main>Page content</main>
</AppShell>`}
      >
        <ShellMock />
      </Example>

      <Example
        title="Floating"
        description="Set floating to detach the desktop sidebar and header into rounded cards inset by a gutter, so the page shows through around the chrome."
        code={`<AppShell floating sidebar={sidebar} header={header}>
  {content}
</AppShell>`}
      >
        <ShellMock floating />
      </Example>

      <Example
        title="Resizable sidebar"
        description="Set resizable to let the user drag the divider, or arrow-key it, to change the sidebar width. Persist the reported width to restore it across sessions."
        code={`const [width, setWidth] = useState('16rem');

<AppShell
  resizable
  sidebarWidth={width}
  onSidebarWidthChange={setWidth}
  minSidebarWidth={220}
  maxSidebarWidth={480}
  sidebar={sidebar}
>
  {content}
</AppShell>`}
      >
        <ShellMock />
      </Example>

      <Heading level={2}>Props</Heading>
      <PropsTable
        props={[
          { name: 'sidebar', type: 'ReactNode', description: 'Required. The persistent side navigation content.' },
          { name: 'header', type: 'ReactNode', description: 'Optional top bar content, placed right of the mobile menu button.' },
          { name: 'sidebarWidth', type: 'string', default: "'16rem'", description: 'Sidebar width on desktop.' },
          { name: 'sidebarLabel', type: 'string', default: "'Navigation'", description: 'Accessible name for the sidebar landmark.' },
          { name: 'floating', type: 'boolean', default: 'false', description: 'Detaches the desktop sidebar and header into floating, rounded cards with a gutter.' },
          { name: 'resizable', type: 'boolean', default: 'false', description: 'Lets the user drag or arrow-key the divider to resize the sidebar.' },
          { name: 'onSidebarWidthChange', type: '(width: string) => void', description: 'Called with the next sidebar width (a px string) while resizing.' },
          { name: 'minSidebarWidth', type: 'number', description: 'Lower clamp for the resize drag, in pixels.' },
          { name: 'maxSidebarWidth', type: 'number', description: 'Upper clamp for the resize drag, in pixels.' },
          { name: 'children', type: 'ReactNode', description: 'The main content rendered in the scrollable column.' },
        ]}
      />

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>The sidebar is an <code>aside</code> landmark named by <code>sidebarLabel</code> (default &ldquo;Navigation&rdquo;).</li>
        <li>The built-in menu button carries <code>aria-label</code> &ldquo;Open navigation&rdquo; and shows only below the lg breakpoint.</li>
        <li>On small screens, clicking the backdrop or any link or button inside the sidebar closes the drawer, and Escape closes it.</li>
        <li>The drawer is a persistent aside that becomes off-canvas, not a modal dialog, so it is not a focus trap.</li>
        <li>The slide animation respects reduced motion.</li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>Use one AppShell at the root of the app; fill its <code>sidebar</code> with a <code>Sidebar</code> structure and its <code>header</code> with a <code>Toolbar</code>.</li>
        <li>Reach for <code>floating</code> when the page has an ambient background worth showing around the chrome; keep it flush (default) for dense, utilitarian apps.</li>
        <li>Turn on <code>resizable</code> for content-heavy sidebars (file trees, long nav) and persist the width so it survives a reload.</li>
      </ul>
    </>
  );
}
