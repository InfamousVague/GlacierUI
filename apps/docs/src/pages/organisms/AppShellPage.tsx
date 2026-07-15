import { Callout, Heading, NavBar, NavBarItem, Text, Size, TextTone, useT } from '@glacier/react';
import { Box, House, Menu, Palette, PanelLeft, X } from '@glacier/icons';
import { useState, type CSSProperties } from 'react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

// Small fixed-layout illustrations of the shell. AppShell itself is a
// full-height frame (min-height 100vh with its own sticky sidebar), so it can
// not be nested inside a bounded doc example, and this page already lives
// inside one. These mocks show both responsive layouts; the living example is
// the site.
function ShellMock({ floating = false, isMobile = false }: { floating?: boolean; isMobile?: boolean }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
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
      className="shellMock"
      data-layout={isMobile ? 'mobile' : 'desktop'}
      data-floating={floating || undefined}
      data-open={open || undefined}
      data-collapsed={collapsed || undefined}
      style={{
        gap,
        padding: floating ? 'var(--glacier-space-3)' : '0',
      }}
    >
      <button className="shellMockBackdrop" aria-label="Close navigation" onClick={() => setOpen(false)} />
      <aside className="shellMockSidebar" style={{ ...block, borderRight: floating ? block.border : 'var(--glacier-hairline) solid var(--glacier-border-subtle)' }}>
        {isMobile && open && (
          <button className="shellMockClose" aria-label="Close navigation" onClick={() => setOpen(false)}>
            <X size={16} aria-hidden="true" />
          </button>
        )}
        <span>{t(m.appshellSidebar)}</span>
        {!isMobile && (
          <ShellNav className="shellMockSidebarNav" label={t(m.shellBottomNav)} />
        )}
      </aside>
      <div className="shellMockMain" style={{ gap }}>
        <div className="shellMockHeader" style={{ ...block, height: '2.25rem', borderBottom: floating ? block.border : 'var(--glacier-hairline) solid var(--glacier-border-subtle)' }}>
          <button
            className="shellMockMenu"
            aria-label="Open navigation"
            aria-expanded={isMobile ? open : !collapsed}
            onClick={() => isMobile ? setOpen(true) : setCollapsed((value) => !value)}
          >
            <Menu size={16} aria-hidden="true" />
          </button>
          <span>{t(m.appshellHeader)}</span>
        </div>
        <div style={block}>{t(m.appshellMain)}</div>
        {isMobile && (
          <ShellNav className="shellMockBottomNav" label={t(m.shellBottomNav)} />
        )}
      </div>
    </div>
  );
}

function ShellNav({ className, label }: { className: string; label: string }) {
  const [active, setActive] = useState('home');
  const destinations = [
    { id: 'home', icon: <House size={16} />, label: 'Home' },
    { id: 'colors', icon: <Palette size={16} />, label: 'Colors' },
    { id: 'ui', icon: <Box size={16} />, label: 'UI' },
    { id: 'shell', icon: <PanelLeft size={16} />, label: 'Shell' },
  ];
  return (
    <NavBar className={className} aria-label={label}>
      {destinations.map((destination) => (
        <NavBarItem
          key={destination.id}
          icon={destination.icon}
          label={destination.label}
          active={active === destination.id}
          onClick={() => setActive(destination.id)}
        />
      ))}
    </NavBar>
  );
}

export function AppShellPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.shellName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(m.shellLede)}
      </Text>

      <Callout tone="info" title={t(m.shellCalloutTitle)} style={{ marginBlockStart: 'var(--glacier-space-6)' }}>
        {t(m.shellCalloutBody)}
      </Callout>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.shellAnatomyIntro)}</Text>
      <Heading level={3}>{t(m.shellDesktop)}</Heading>
      <ComponentBlueprint specId="app-shell" />
      <Heading level={3}>{t(m.shellMobile)}</Heading>
      <ComponentBlueprint specId="app-shell" variant="mobile" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.shellEx1Title)}
        description={t(m.shellEx1Desc)}
        code={`import { AppShell, Sidebar, SidebarItem, Toolbar } from '@glacier/react';

<AppShell
  isMobile={isMobile}
  sidebar={
    <Sidebar>
      <SidebarItem active>Home</SidebarItem>
      <SidebarItem>Settings</SidebarItem>
    </Sidebar>
  }
  header={<Toolbar end={<button>Account</button>}>Dashboard</Toolbar>}
  bottomNav={<NavBar aria-label="Primary">…</NavBar>}
>
  <main>Page content</main>
</AppShell>`}
      >
        <div className="shellMockPair">
          <div className="shellMockExample" data-layout="desktop">
            <span className="shellMockLabel">{t(m.shellDesktop)}</span>
            <ShellMock />
          </div>
          <div className="shellMockExample" data-layout="mobile">
            <span className="shellMockLabel">{t(m.shellMobile)}</span>
            <ShellMock isMobile />
          </div>
        </div>
      </Example>

      <Example
        title={t(m.shellEx2Title)}
        description={t(m.shellEx2Desc)}
        code={`<AppShell isMobile={isMobile} floating sidebar={sidebar} header={header} bottomNav={bottomNav}>
  {content}
</AppShell>`}
      >
        <div className="shellMockPair">
          <div className="shellMockExample" data-layout="desktop">
            <span className="shellMockLabel">{t(m.shellDesktop)}</span>
            <ShellMock floating />
          </div>
          <div className="shellMockExample" data-layout="mobile">
            <span className="shellMockLabel">{t(m.shellMobile)}</span>
            <ShellMock floating isMobile />
          </div>
        </div>
      </Example>

      <Example
        title={t(m.shellEx3Title)}
        description={t(m.shellEx3Desc)}
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

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'sidebar', type: 'ReactNode', description: t(m.shellPropSidebar) },
          { name: 'header', type: 'ReactNode', description: t(m.shellPropHeader) },
          { name: 'bottomNav', type: 'ReactNode', description: t(m.shellPropBottomNav) },
          { name: 'sidebarWidth', type: 'string', default: "'16rem'", description: t(m.shellPropSidebarWidth) },
          { name: 'sidebarLabel', type: 'string', default: "'Navigation'", description: t(m.shellPropSidebarLabel) },
          { name: 'floating', type: 'boolean', default: 'false', description: t(m.shellPropFloating) },
          { name: 'isMobile', type: 'boolean', description: t(m.shellPropIsMobile) },
          { name: 'resizable', type: 'boolean', default: 'false', description: t(m.shellPropResizable) },
          { name: 'onSidebarWidthChange', type: '(width: string) => void', description: t(m.shellPropOnWidthChange) },
          { name: 'minSidebarWidth', type: 'number', description: t(m.shellPropMinWidth) },
          { name: 'maxSidebarWidth', type: 'number', description: t(m.shellPropMaxWidth) },
          { name: 'children', type: 'ReactNode', description: t(m.shellPropChildren) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.shellA11y1))}</li>
        <li>{prose(t(m.shellA11y2))}</li>
        <li>{prose(t(m.shellA11y3))}</li>
        <li>{prose(t(m.shellA11y4))}</li>
        <li>{prose(t(m.shellA11y5))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.shellUse1))}</li>
        <li>{prose(t(m.shellUse2))}</li>
        <li>{prose(t(m.shellUse3))}</li>
      </ul>
    </>
  );
}
