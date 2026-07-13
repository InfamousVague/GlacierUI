import { Callout, Heading, Text, Size, TextTone, useT } from '@glacier/react';
import type { CSSProperties } from 'react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

// A small static illustration of the shell layout. AppShell itself is a
// full-height frame (min-height 100vh with its own sticky sidebar), so it can
// not be nested inside a bounded doc example, and this page already lives
// inside one. This mock shows the composition; the living example is the site.
function ShellMock({ floating = false }: { floating?: boolean }) {
  const t = useT();
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
      <div style={{ ...block, borderRight: floating ? block.border : 'var(--glacier-hairline) solid var(--glacier-border-subtle)' }}>{t(m.appshellSidebar)}</div>
      <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr', gap, minWidth: 0 }}>
        <div style={{ ...block, height: '2.25rem', borderBottom: floating ? block.border : 'var(--glacier-hairline) solid var(--glacier-border-subtle)' }}>{t(m.appshellHeader)}</div>
        <div style={block}>{t(m.appshellMain)}</div>
      </div>
    </div>
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
      <ComponentBlueprint specId="app-shell" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.shellEx1Title)}
        description={t(m.shellEx1Desc)}
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
        title={t(m.shellEx2Title)}
        description={t(m.shellEx2Desc)}
        code={`<AppShell floating sidebar={sidebar} header={header}>
  {content}
</AppShell>`}
      >
        <ShellMock floating />
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
          { name: 'sidebarWidth', type: 'string', default: "'16rem'", description: t(m.shellPropSidebarWidth) },
          { name: 'sidebarLabel', type: 'string', default: "'Navigation'", description: t(m.shellPropSidebarLabel) },
          { name: 'floating', type: 'boolean', default: 'false', description: t(m.shellPropFloating) },
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
