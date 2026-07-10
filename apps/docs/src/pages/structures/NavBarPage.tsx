import { useState } from 'react';
import { Box, NavBar, NavBarItem, Text, Heading, Size, TextTone } from '@glacier/react';
import { Award, Compass, Library, Route, Settings } from '@glacier/icons';
import { Example, PropsTable } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';

const libraryIcon = <Library size={18} />;
const compassIcon = <Compass size={18} />;
const routeIcon = <Route size={18} />;
const awardIcon = <Award size={18} />;
const settingsIcon = <Settings size={18} />;

/** A live demo bar whose active item follows clicks, so the pill slides. */
function DemoNav({ orientation }: { orientation?: 'horizontal' | 'vertical' }) {
  const [active, setActive] = useState('library');
  const item = (id: string, icon: typeof libraryIcon, label: string, badge?: number) => (
    <NavBarItem
      icon={icon}
      label={label}
      badge={badge}
      active={active === id}
      onClick={() => setActive(id)}
    />
  );
  return (
    <Box style={orientation === 'vertical' ? { height: '18rem' } : undefined}>
      <NavBar orientation={orientation} aria-label="Primary" end={item('settings', settingsIcon, 'Settings')}>
        {item('library', libraryIcon, 'Library')}
        {item('discover', compassIcon, 'Discover', 3)}
        {item('paths', routeIcon, 'Paths')}
        {item('certificates', awardIcon, 'Certificates')}
      </NavBar>
    </Box>
  );
}

export function NavBarPage() {
  return (
    <>
      <Heading level={1}>NavBar</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        An app-level primary navigation bar. Horizontal it is a row of icon-and-label items for a
        top nav or a bottom tab bar; vertical it is a slim icon rail of square buttons whose labels
        collapse into tooltips. The active pill slides between items, and an <code>end</code> slot
        pins a settings item to the far edge.
      </Text>

      <Heading level={2}>Anatomy</Heading>
      <Text tone={TextTone.Muted}>An inspection with the exact spec measurements labelled on the figure.</Text>
      <ComponentBlueprint specId="nav-bar" />

      <Heading level={2}>Examples</Heading>

      <Example
        title="Horizontal"
        description="A row of destinations with visible labels. Click around: one shared pill slides to the active item."
        code={`import { NavBar, NavBarItem } from '@glacier/react';

<NavBar aria-label="Primary" end={<NavBarItem icon={settingsIcon} label="Settings" />}>
  <NavBarItem icon={libraryIcon} label="Library" active />
  <NavBarItem icon={compassIcon} label="Discover" badge={3} />
  <NavBarItem icon={routeIcon} label="Paths" />
</NavBar>`}
      >
        <DemoNav />
      </Example>

      <Example
        title="Vertical rail"
        description="orientation vertical turns the bar into a slim icon rail: items become square icon buttons, labels move into right-placed tooltips, and badges pin to the icon corner. The end slot pins to the bottom."
        code={`<NavBar orientation="vertical" aria-label="Primary"
  end={<NavBarItem icon={settingsIcon} label="Settings" />}>
  <NavBarItem icon={libraryIcon} label="Library" active />
  <NavBarItem icon={compassIcon} label="Discover" badge={3} />
</NavBar>`}
      >
        <DemoNav orientation="vertical" />
      </Example>

      <Example
        title="Skeleton"
        description="The loading placeholder keeps the bar's geometry: item-sized bones plus the pinned end slot."
        code={`<NavBar skeleton aria-label="Primary" />
<NavBar skeleton orientation="vertical" aria-label="Primary" />`}
      >
        <div style={{ display: 'flex', gap: 'var(--glacier-space-6)', alignItems: 'flex-start' }}>
          <NavBar skeleton aria-label="Primary" />
          <Box style={{ height: '14rem' }}>
            <NavBar skeleton orientation="vertical" aria-label="Primary" />
          </Box>
        </div>
      </Example>

      <Heading level={2}>Props</Heading>
      <PropsTable
        props={[
          { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Row of labeled items, or a slim vertical icon rail.' },
          { name: 'aria-label', type: 'string', description: 'Required. Names the nav landmark; apps often carry more than one.' },
          { name: 'end', type: 'ReactNode', description: 'Pinned to the far end: bottom when vertical, trailing edge when horizontal.' },
          { name: 'spring', type: 'Spring', default: 'Spring.Snappy', description: 'Spring preset for the active pill as it slides.' },
          { name: 'skeleton', type: 'boolean', default: 'false', description: 'Renders a placeholder with the exact geometry.' },
        ]}
      />
      <Heading level={3}>NavBarItem</Heading>
      <PropsTable
        props={[
          { name: 'icon', type: 'ReactNode', description: 'Required leading glyph, hidden from assistive tech.' },
          { name: 'label', type: 'string', description: 'Required. Visible text when horizontal; aria-label plus tooltip when vertical.' },
          { name: 'active', type: 'boolean', default: 'false', description: 'Marks the current destination and hosts the sliding pill.' },
          { name: 'badge', type: 'number', description: 'Count rendered as a CounterBadge: icon-corner when vertical, inline when horizontal.' },
          { name: 'as / href', type: "ElementType / string", description: "Render as 'a' with an href for real links; defaults to a button." },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Dims the item and blocks activation.' },
        ]}
      />

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>
          The bar is a <code>nav</code> landmark named by the required <code>aria-label</code>; the
          active item carries <code>aria-current="page"</code>.
        </li>
        <li>
          In the vertical rail each item keeps its label as an <code>aria-label</code> and shows it
          in a tooltip on hover and focus, so icon-only never means unlabeled.
        </li>
        <li>The sliding pill is decorative and hidden from assistive tech; reduced motion renders it without animation.</li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>Use NavBar for app-level destinations; use Tabs to switch content panels within a page, and Sidebar when destinations need grouping under headings.</li>
        <li>Vertical rails pair well with a Sidebar beside them: the rail holds top-level sections, the sidebar holds the section's contents.</li>
        <li>Reserve badges for actionable counts, and pin utility destinations like Settings in the <code>end</code> slot.</li>
      </ul>
    </>
  );
}
