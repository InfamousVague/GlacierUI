import { Box, CounterBadge, SegmentedControl, Sidebar, SidebarItem, SidebarSection, Stack } from '@perfect/react';
import { Spring } from '@perfect/motion';
import { useState, type ReactNode } from 'react';
import { Example, PropsTable } from '../docs-ui.tsx';

// A mock app window so each example shows the sidebar at its real width beside a
// content pane, filling the demo instead of floating in a narrow card.
function Frame({ children }: { children: ReactNode }) {
  const bar = (width: string) => (
    <div
      style={{
        width,
        height: '0.6rem',
        borderRadius: 'var(--perfect-radius-full)',
        background: 'var(--perfect-surface-sunken)',
      }}
    />
  );
  return (
    <Box border radius="lg" width="full" style={{ height: '20rem', overflow: 'hidden', display: 'flex' }}>
      <div
        style={{
          width: '15rem',
          flex: 'none',
          borderRight: 'var(--perfect-hairline) solid var(--perfect-border-subtle)',
        }}
      >
        {children}
      </div>
      <div
        aria-hidden="true"
        style={{
          flex: 1,
          minWidth: 0,
          padding: 'var(--perfect-space-6)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--perfect-space-4)',
        }}
      >
        <div style={{ width: '38%', height: '0.9rem', borderRadius: 'var(--perfect-radius-full)', background: 'var(--perfect-surface-sunken)' }} />
        {bar('86%')}
        {bar('72%')}
        {bar('80%')}
      </div>
    </Box>
  );
}

const homeIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 10.5 12 4l9 6.5" />
    <path d="M5 9.5V20h14V9.5" />
  </svg>
);

const inboxIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 13h4l2 3h4l2-3h4" />
    <path d="M5 6h14l1 7v5H4v-5z" />
  </svg>
);

const usersIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="9" cy="8" r="3" />
    <path d="M3 20a6 6 0 0 1 12 0" />
    <path d="M16 5a3 3 0 0 1 0 6" />
    <path d="M21 20a6 6 0 0 0-4-5.6" />
  </svg>
);

const chartIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 20V4" />
    <path d="M4 20h16" />
    <path d="M8 16v-4M13 16V8M18 16v-6" />
  </svg>
);

const settingsIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
  </svg>
);

// Interactive: click items to slide the pill, and switch the spring style.
function SlideDemo() {
  const [active, setActive] = useState('home');
  const [spring, setSpring] = useState<Spring>(Spring.Smooth);
  return (
    <Stack gap={4} align="start">
      <SegmentedControl
        size="sm"
        aria-label="Animation style"
        value={spring}
        onValueChange={(value) => setSpring(value as Spring)}
        options={[
          { value: Spring.Smooth, label: 'Smooth' },
          { value: Spring.Snappy, label: 'Snappy' },
          { value: Spring.Bouncy, label: 'Bounce' },
        ]}
      />
      <Frame>
        <Sidebar spring={spring}>
          <SidebarSection title="Workspace">
            <SidebarItem icon={homeIcon} active={active === 'home'} onClick={() => setActive('home')}>
              Home
            </SidebarItem>
            <SidebarItem icon={inboxIcon} active={active === 'inbox'} onClick={() => setActive('inbox')}>
              Inbox
            </SidebarItem>
            <SidebarItem icon={usersIcon} active={active === 'people'} onClick={() => setActive('people')}>
              People
            </SidebarItem>
          </SidebarSection>
          <SidebarSection title="Insights">
            <SidebarItem icon={chartIcon} active={active === 'reports'} onClick={() => setActive('reports')}>
              Reports
            </SidebarItem>
          </SidebarSection>
        </Sidebar>
      </Frame>
    </Stack>
  );
}

export function SidebarPage() {
  return (
    <>
      <h1>Sidebar</h1>
      <p className="lede">
        The frame of a side navigation: an optional pinned header, a scrollable body of grouped
        items, and an optional pinned footer. Fill it with SidebarSection and SidebarItem, and drop
        it into AppShell's sidebar slot.
      </p>

      <h2>Examples</h2>

      <Example
        title="Basic"
        description="Group items with SidebarSection and give each SidebarItem an icon and a label. Mark the current location with active."
        code={`import { Sidebar, SidebarItem, SidebarSection } from '@perfect/react';

<Sidebar>
  <SidebarSection title="Workspace">
    <SidebarItem icon={homeIcon} active>Home</SidebarItem>
    <SidebarItem icon={inboxIcon}>Inbox</SidebarItem>
    <SidebarItem icon={usersIcon}>People</SidebarItem>
  </SidebarSection>
  <SidebarSection title="Insights">
    <SidebarItem icon={chartIcon}>Reports</SidebarItem>
  </SidebarSection>
</Sidebar>`}
      >
        <Frame>
          <Sidebar>
            <SidebarSection title="Workspace">
              <SidebarItem icon={homeIcon} active>
                Home
              </SidebarItem>
              <SidebarItem icon={inboxIcon}>Inbox</SidebarItem>
              <SidebarItem icon={usersIcon}>People</SidebarItem>
            </SidebarSection>
            <SidebarSection title="Insights">
              <SidebarItem icon={chartIcon}>Reports</SidebarItem>
            </SidebarSection>
          </Sidebar>
        </Frame>
      </Example>

      <Example
        title="Sliding active pill"
        description="The active pill is one layout element that slides between items as the active one changes, even across sections. Choose the spring: smooth, snappy, or bounce. Click the items to move it."
        code={`import { Sidebar, SidebarItem, SidebarSection } from '@perfect/react';
import { Spring } from '@perfect/motion';

<Sidebar spring={Spring.Bouncy}>
  <SidebarSection title="Workspace">
    <SidebarItem icon={homeIcon} active={active === 'home'} onClick={() => setActive('home')}>Home</SidebarItem>
    <SidebarItem icon={inboxIcon} active={active === 'inbox'} onClick={() => setActive('inbox')}>Inbox</SidebarItem>
    <SidebarItem icon={usersIcon} active={active === 'people'} onClick={() => setActive('people')}>People</SidebarItem>
  </SidebarSection>
</Sidebar>`}
      >
        <SlideDemo />
      </Example>

      <Example
        title="Trailing count"
        description="Put a CounterBadge in an item's trailing slot to flag unread or pending work. The label and count stay on one row."
        code={`import { CounterBadge } from '@perfect/react';

<SidebarItem icon={inboxIcon} trailing={<CounterBadge count={8} />}>
  Inbox
</SidebarItem>`}
      >
        <Frame>
          <Sidebar>
            <SidebarSection title="Workspace">
              <SidebarItem icon={homeIcon}>Home</SidebarItem>
              <SidebarItem icon={inboxIcon} active trailing={<CounterBadge count={8} />}>
                Inbox
              </SidebarItem>
              <SidebarItem icon={usersIcon} trailing={<CounterBadge count={128} tone="neutral" />}>
                People
              </SidebarItem>
            </SidebarSection>
          </Sidebar>
        </Frame>
      </Example>

      <Example
        title="Header and footer"
        description="The header and footer slots stay pinned while the body scrolls. Use them for a brand mark up top and a settings link at the bottom."
        code={`<Sidebar
  header={<div style={{ fontWeight: 700, fontSize: '1.125rem' }}>Perfect</div>}
  footer={<SidebarItem icon={settingsIcon}>Settings</SidebarItem>}
>
  <SidebarSection title="Workspace">
    <SidebarItem icon={homeIcon} active>Home</SidebarItem>
    <SidebarItem icon={inboxIcon}>Inbox</SidebarItem>
  </SidebarSection>
</Sidebar>`}
      >
        <Frame>
          <Sidebar
            header={<div style={{ fontWeight: 700, fontSize: '1.125rem' }}>Perfect</div>}
            footer={<SidebarItem icon={settingsIcon}>Settings</SidebarItem>}
          >
            <SidebarSection title="Workspace">
              <SidebarItem icon={homeIcon} active>
                Home
              </SidebarItem>
              <SidebarItem icon={inboxIcon}>Inbox</SidebarItem>
              <SidebarItem icon={usersIcon}>People</SidebarItem>
              <SidebarItem icon={chartIcon}>Reports</SidebarItem>
            </SidebarSection>
          </Sidebar>
        </Frame>
      </Example>

      <Example
        title="Links and disabled"
        description="Set as='a' with an href to render an item as a real anchor. A disabled item is dimmed and skipped by pointer and keyboard."
        code={`<SidebarItem as="a" href="/reports" icon={chartIcon}>Reports</SidebarItem>
<SidebarItem icon={usersIcon} disabled>People</SidebarItem>`}
      >
        <Frame>
          <Sidebar>
            <SidebarSection title="Insights">
              <SidebarItem as="a" href="#reports" icon={chartIcon} active>
                Reports
              </SidebarItem>
              <SidebarItem as="a" href="#inbox" icon={inboxIcon}>
                Inbox
              </SidebarItem>
              <SidebarItem icon={usersIcon} disabled>
                People
              </SidebarItem>
            </SidebarSection>
          </Sidebar>
        </Frame>
      </Example>

      <h2>Props</h2>

      <h3>Sidebar</h3>
      <PropsTable
        props={[
          { name: 'header', type: 'ReactNode', description: 'Pinned region at the top, for a brand mark or a search field.' },
          { name: 'footer', type: 'ReactNode', description: 'Pinned region at the bottom, for a profile or settings link.' },
          { name: 'spring', type: 'Spring', default: 'Spring.Smooth', description: 'Spring preset for the active pill as it slides between items.' },
          { name: 'children', type: 'ReactNode', description: 'The scrollable body, usually one or more SidebarSection.' },
        ]}
      />

      <h3>SidebarSection</h3>
      <PropsTable
        props={[
          { name: 'title', type: 'ReactNode', description: 'Optional uppercase group heading shown above the items.' },
          { name: 'children', type: 'ReactNode', description: 'The rows in the group, usually SidebarItem.' },
        ]}
      />

      <h3>SidebarItem</h3>
      <PropsTable
        props={[
          { name: 'as', type: 'ElementType', default: "'button'", description: "Rendered element. Use 'a' for links." },
          { name: 'href', type: 'string', description: 'Anchor href when rendered as a link.' },
          { name: 'icon', type: 'ReactNode', description: 'Leading icon, marked aria-hidden.' },
          { name: 'active', type: 'boolean', default: 'false', description: 'Highlights the item and sets aria-current="page".' },
          { name: 'trailing', type: 'ReactNode', description: 'Trailing slot, such as a CounterBadge.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Dims the item and blocks interaction. Only applies to the button form.' },
          { name: 'onClick', type: '(event) => void', description: 'Handler for a button item.' },
          { name: 'children', type: 'ReactNode', description: 'The item label.' },
        ]}
      />

      <h2>Accessibility</h2>
      <ul>
        <li>The active item sets aria-current="page", so assistive tech announces the current location.</li>
        <li>Item icons are marked aria-hidden, so the label is the accessible name.</li>
        <li>A disabled button item sets aria-disabled and is removed from the tab order.</li>
        <li>Render links with as="a" and an href so they behave as real anchors: focusable, openable in a new tab, and read as links.</li>
      </ul>

      <h2>Usage</h2>
      <ul>
        <li>Sidebar fills AppShell's sidebar slot; give that slot a width and let the body scroll.</li>
        <li>Group related items with SidebarSection and a short uppercase title; keep one section untitled for top-level links.</li>
        <li>Keep exactly one item active per view to reflect the current route.</li>
        <li>Use the trailing slot for a CounterBadge; keep it to a count or a small status, not a second action.</li>
        <li>Pin persistent controls like a brand mark or settings link in the header and footer so they stay visible as the body scrolls.</li>
      </ul>
    </>
  );
}
