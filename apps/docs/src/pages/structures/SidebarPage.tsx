import { Box, CounterBadge, SegmentedControl, Sidebar, SidebarItem, SidebarSection, Stack, Heading, Text, Size, TextTone, Tone, useT } from '@glacier/react';
import { BarChart2, House, Inbox, Settings, Users } from '@glacier/icons';
import { Spring } from '@glacier/motion';
import { useState, type ReactNode } from 'react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { m } from '../../i18n.ts';

// A mock app window so each example shows the sidebar at its real width beside a
// content pane, filling the demo instead of floating in a narrow card.
function Frame({ children }: { children: ReactNode }) {
  const t = useT();
  return (
    <Box border radius="lg" width="full" style={{ height: '20rem', overflow: 'hidden', display: 'flex' }}>
      <div
        style={{
          width: '15rem',
          flex: 'none',
          borderRight: 'var(--glacier-hairline) solid var(--glacier-border-subtle)',
        }}
      >
        {children}
      </div>
      <div
        aria-hidden="true"
        style={{
          flex: 1,
          minWidth: 0,
          padding: 'var(--glacier-space-6)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--glacier-space-3)',
        }}
      >
        <div style={{ fontSize: 'var(--glacier-font-size-lg)', fontWeight: 'var(--glacier-font-weight-semibold)', color: 'var(--glacier-text-muted)' }}>
          {t(m.sidebarOverview)}
        </div>
        <p style={{ margin: 0, color: 'var(--glacier-text-subtle)', fontSize: 'var(--glacier-font-size-sm)', lineHeight: 'var(--glacier-leading-md)' }}>
          {t(m.sbFrameLine1)}
        </p>
        <p style={{ margin: 0, color: 'var(--glacier-text-subtle)', fontSize: 'var(--glacier-font-size-sm)', lineHeight: 'var(--glacier-leading-md)' }}>
          {t(m.sbFrameLine2)}
        </p>
      </div>
    </Box>
  );
}

const homeIcon = <House size={18} />;
const inboxIcon = <Inbox size={18} />;
const usersIcon = <Users size={18} />;
const chartIcon = <BarChart2 size={18} />;
const settingsIcon = <Settings size={18} />;

// Interactive: click items to slide the pill, and switch the spring style.
function SlideDemo() {
  const t = useT();
  const [active, setActive] = useState('home');
  const [spring, setSpring] = useState<Spring>(Spring.Snappy);
  return (
    <Stack gap={4} align="start">
      <SegmentedControl
        size={Size.Small}
        aria-label={t(m.sbAriaAnimStyle)}
        value={spring}
        onValueChange={(value) => setSpring(value as Spring)}
        options={[
          { value: Spring.Smooth, label: t(m.sidebarSmooth) },
          { value: Spring.Snappy, label: t(m.sidebarSnappy) },
          { value: Spring.Bouncy, label: t(m.sidebarBounce) },
        ]}
      />
      <Frame>
        <Sidebar spring={spring}>
          <SidebarSection title={t(m.sidebarWorkspace)}>
            <SidebarItem icon={homeIcon} active={active === 'home'} onClick={() => setActive('home')}>
              {t(m.sidebarHome)}
            </SidebarItem>
            <SidebarItem icon={inboxIcon} active={active === 'inbox'} onClick={() => setActive('inbox')}>
              {t(m.sidebarInbox)}
            </SidebarItem>
            <SidebarItem icon={usersIcon} active={active === 'people'} onClick={() => setActive('people')}>
              {t(m.sidebarPeople)}
            </SidebarItem>
          </SidebarSection>
          <SidebarSection title={t(m.sidebarInsights)}>
            <SidebarItem icon={chartIcon} active={active === 'reports'} onClick={() => setActive('reports')}>
              {t(m.sidebarReports)}
            </SidebarItem>
          </SidebarSection>
        </Sidebar>
      </Frame>
    </Stack>
  );
}

export function SidebarPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.sbName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.sbLede))}
      </Text>

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.exBasic)}
        description={t(m.sbEx1Desc)}
        code={`import { Sidebar, SidebarItem, SidebarSection } from '@glacier/react';

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
        component="Sidebar"
        render={(K) => (
          <Frame>
            <K.Sidebar>
              <K.SidebarSection title={t(m.sidebarWorkspace)}>
                <K.SidebarItem icon={homeIcon} active>
                  {t(m.sidebarHome)}
                </K.SidebarItem>
                <K.SidebarItem icon={inboxIcon}>{t(m.sidebarInbox)}</K.SidebarItem>
                <K.SidebarItem icon={usersIcon}>{t(m.sidebarPeople)}</K.SidebarItem>
              </K.SidebarSection>
              <K.SidebarSection title={t(m.sidebarInsights)}>
                <K.SidebarItem icon={chartIcon}>{t(m.sidebarReports)}</K.SidebarItem>
              </K.SidebarSection>
            </K.Sidebar>
          </Frame>
        )}
      />

      <Example
        title={t(m.sbEx2Title)}
        description={t(m.sbEx2Desc)}
        code={`import { Sidebar, SidebarItem, SidebarSection } from '@glacier/react';
import { Spring } from '@glacier/motion';

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
        title={t(m.sbEx3Title)}
        description={t(m.sbEx3Desc)}
        code={`import { CounterBadge } from '@glacier/react';

<SidebarItem icon={inboxIcon} trailing={<CounterBadge count={8} />}>
  Inbox
</SidebarItem>`}
        component="Sidebar"
        render={(K) => (
          <Frame>
            <K.Sidebar>
              <K.SidebarSection title={t(m.sidebarWorkspace)}>
                <K.SidebarItem icon={homeIcon}>{t(m.sidebarHome)}</K.SidebarItem>
                <K.SidebarItem icon={inboxIcon} active trailing={<CounterBadge count={8} />}>
                  {t(m.sidebarInbox)}
                </K.SidebarItem>
                <K.SidebarItem icon={usersIcon} trailing={<CounterBadge count={128} tone={Tone.Neutral} />}>
                  {t(m.sidebarPeople)}
                </K.SidebarItem>
              </K.SidebarSection>
            </K.Sidebar>
          </Frame>
        )}
      />

      <Example
        title={t(m.sbEx4Title)}
        description={t(m.sbEx4Desc)}
        code={`<Sidebar
  header={<div style={{ fontWeight: 700, fontSize: '1.125rem' }}>GlacierUI</div>}
  footer={<SidebarItem icon={settingsIcon}>Settings</SidebarItem>}
>
  <SidebarSection title="Workspace">
    <SidebarItem icon={homeIcon} active>Home</SidebarItem>
    <SidebarItem icon={inboxIcon}>Inbox</SidebarItem>
  </SidebarSection>
</Sidebar>`}
        component="Sidebar"
        render={(K) => (
          <Frame>
            <K.Sidebar
              header={<div style={{ fontWeight: 700, fontSize: '1.125rem' }}>{t(m.sidebarGlacierui)}</div>}
              footer={<K.SidebarItem icon={settingsIcon}>{t(m.sidebarSettings)}</K.SidebarItem>}
            >
              <K.SidebarSection title={t(m.sidebarWorkspace)}>
                <K.SidebarItem icon={homeIcon} active>
                  {t(m.sidebarHome)}
                </K.SidebarItem>
                <K.SidebarItem icon={inboxIcon}>{t(m.sidebarInbox)}</K.SidebarItem>
                <K.SidebarItem icon={usersIcon}>{t(m.sidebarPeople)}</K.SidebarItem>
                <K.SidebarItem icon={chartIcon}>{t(m.sidebarReports)}</K.SidebarItem>
              </K.SidebarSection>
            </K.Sidebar>
          </Frame>
        )}
      />

      <Example
        title={t(m.sbEx5Title)}
        description={t(m.sbEx5Desc)}
        code={`<SidebarItem as="a" href="/reports" icon={chartIcon}>Reports</SidebarItem>
<SidebarItem icon={usersIcon} disabled>People</SidebarItem>`}
        component="Sidebar"
        render={(K) => (
          <Frame>
            <K.Sidebar>
              <K.SidebarSection title={t(m.sidebarInsights)}>
                <K.SidebarItem as="a" href="#reports" icon={chartIcon} active>
                  {t(m.sidebarReports)}
                </K.SidebarItem>
                <K.SidebarItem as="a" href="#inbox" icon={inboxIcon}>
                  {t(m.sidebarInbox)}
                </K.SidebarItem>
                <K.SidebarItem icon={usersIcon} disabled>
                  {t(m.sidebarPeople)}
                </K.SidebarItem>
              </K.SidebarSection>
            </K.Sidebar>
          </Frame>
        )}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>

      <Heading level={3}>{t(m.sbGroupSidebar)}</Heading>
      <PropsTable
        props={[
          { name: 'header', type: 'ReactNode', description: t(m.sbPropHeader) },
          { name: 'footer', type: 'ReactNode', description: t(m.sbPropFooter) },
          { name: 'spring', type: 'Spring', default: 'Spring.Snappy', description: t(m.sbPropSpring) },
          { name: 'children', type: 'ReactNode', description: t(m.sbPropChildren) },
        ]}
      />

      <Heading level={3}>{t(m.sbGroupSection)}</Heading>
      <PropsTable
        props={[
          { name: 'title', type: 'ReactNode', description: t(m.sbSectionTitle) },
          { name: 'children', type: 'ReactNode', description: t(m.sbSectionChildren) },
        ]}
      />

      <Heading level={3}>{t(m.sbGroupItem)}</Heading>
      <PropsTable
        props={[
          { name: 'as', type: 'ElementType', default: "'button'", description: t(m.sbItemAs) },
          { name: 'href', type: 'string', description: t(m.sbItemHref) },
          { name: 'icon', type: 'ReactNode', description: t(m.sbItemIcon) },
          { name: 'active', type: 'boolean', default: 'false', description: t(m.sbItemActive) },
          { name: 'trailing', type: 'ReactNode', description: t(m.sbItemTrailing) },
          { name: 'disabled', type: 'boolean', default: 'false', description: t(m.sbItemDisabled) },
          { name: 'onClick', type: '(event) => void', description: t(m.sbItemOnClick) },
          { name: 'children', type: 'ReactNode', description: t(m.sbItemChildren) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.sbA11y1))}</li>
        <li>{prose(t(m.sbA11y2))}</li>
        <li>{prose(t(m.sbA11y3))}</li>
        <li>{prose(t(m.sbA11y4))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.sbUse1))}</li>
        <li>{prose(t(m.sbUse2))}</li>
        <li>{prose(t(m.sbUse3))}</li>
        <li>{prose(t(m.sbUse4))}</li>
        <li>{prose(t(m.sbUse5))}</li>
      </ul>
    </>
  );
}
