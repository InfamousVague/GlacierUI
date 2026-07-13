import { useState } from 'react';
import { Box, Text, Heading, Size, TextTone, useT } from '@glacier/react';
import { Award, Compass, Library, Route, Settings } from '@glacier/icons';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { type PlatformKit } from '../../platforms.tsx';
import { m } from '../../i18n.ts';

const libraryIcon = <Library size={18} />;
const compassIcon = <Compass size={18} />;
const routeIcon = <Route size={18} />;
const awardIcon = <Award size={18} />;
const settingsIcon = <Settings size={18} />;

/** A live demo bar whose active item follows clicks, so the pill slides. */
function DemoNav({ K, orientation }: { K: PlatformKit; orientation?: 'horizontal' | 'vertical' }) {
  const t = useT();
  const [active, setActive] = useState('library');
  const item = (id: string, icon: typeof libraryIcon, label: string, badge?: number) => (
    <K.NavBarItem
      icon={icon}
      label={label}
      badge={badge}
      active={active === id}
      onClick={() => setActive(id)}
    />
  );
  return (
    <Box style={orientation === 'vertical' ? { height: '18rem' } : undefined}>
      <K.NavBar orientation={orientation} aria-label={t(m.navAriaPrimary)} end={item('settings', settingsIcon, 'Settings')}>
        {item('library', libraryIcon, 'Library')}
        {item('discover', compassIcon, 'Discover', 3)}
        {item('paths', routeIcon, 'Paths')}
        {item('certificates', awardIcon, 'Certificates')}
      </K.NavBar>
    </Box>
  );
}

export function NavBarPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.navName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.navLede))}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.anatomyIntro)}</Text>
      <ComponentBlueprint specId="nav-bar" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.navEx1Title)}
        description={t(m.navEx1Desc)}
        component="NavBar"
        render={(K) => <DemoNav K={K} />}
        code={`import { NavBar, NavBarItem } from '@glacier/react';

<NavBar aria-label="Primary" end={<NavBarItem icon={settingsIcon} label="Settings" />}>
  <NavBarItem icon={libraryIcon} label="Library" active />
  <NavBarItem icon={compassIcon} label="Discover" badge={3} />
  <NavBarItem icon={routeIcon} label="Paths" />
</NavBar>`}
      />

      <Example
        title={t(m.navEx2Title)}
        description={t(m.navEx2Desc)}
        component="NavBar"
        render={(K) => <DemoNav K={K} orientation="vertical" />}
        code={`<NavBar orientation="vertical" aria-label="Primary"
  end={<NavBarItem icon={settingsIcon} label="Settings" />}>
  <NavBarItem icon={libraryIcon} label="Library" active />
  <NavBarItem icon={compassIcon} label="Discover" badge={3} />
</NavBar>`}
      />

      <Example
        title={t(m.exSkeleton)}
        description={t(m.navEx3Desc)}
        component="NavBar"
        render={(K) => (
          <div style={{ display: 'flex', gap: 'var(--glacier-space-6)', alignItems: 'flex-start' }}>
            <K.NavBar skeleton aria-label={t(m.navAriaPrimary)} />
            <Box style={{ height: '14rem' }}>
              <K.NavBar skeleton orientation="vertical" aria-label={t(m.navAriaPrimary)} />
            </Box>
          </div>
        )}
        code={`<NavBar skeleton aria-label="Primary" />
<NavBar skeleton orientation="vertical" aria-label="Primary" />`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: t(m.navPropOrientation) },
          { name: 'aria-label', type: 'string', description: t(m.navPropAriaLabel) },
          { name: 'end', type: 'ReactNode', description: t(m.navPropEnd) },
          { name: 'spring', type: 'Spring', default: 'Spring.Snappy', description: t(m.navPropSpring) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(m.navPropSkeleton) },
        ]}
      />
      <Heading level={3}>{t(m.navGroupItem)}</Heading>
      <PropsTable
        props={[
          { name: 'icon', type: 'ReactNode', description: t(m.navItemIcon) },
          { name: 'label', type: 'string', description: t(m.navItemLabel) },
          { name: 'active', type: 'boolean', default: 'false', description: t(m.navItemActive) },
          { name: 'badge', type: 'number', description: t(m.navItemBadge) },
          { name: 'as / href', type: "ElementType / string", description: t(m.navItemAsHref) },
          { name: 'disabled', type: 'boolean', default: 'false', description: t(m.navItemDisabled) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.navA11y1))}</li>
        <li>{prose(t(m.navA11y2))}</li>
        <li>{prose(t(m.navA11y3))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.navUse1))}</li>
        <li>{prose(t(m.navUse2))}</li>
        <li>{prose(t(m.navUse3))}</li>
      </ul>
    </>
  );
}
