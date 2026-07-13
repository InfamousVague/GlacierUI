import { useState } from 'react';
import { type TabStripItem, Heading, Text, Size, TextTone, useT } from '@glacier/react';
import { File } from '@glacier/icons';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { type PlatformKit } from '../../platforms.tsx';
import { m } from '../../i18n.ts';

const fileIcon = <File size={14} />;

function ControlledStrip({ K }: { K: PlatformKit }) {
  const t = useT();
  const [tabs, setTabs] = useState<TabStripItem[]>([
    { id: 'index', label: t(m.tabstripIndexTsx), icon: fileIcon },
    { id: 'styles', label: t(m.tabstripStylesCss), icon: fileIcon },
    { id: 'readme', label: t(m.tabstripReadmeMd), icon: fileIcon },
  ]);
  const [active, setActive] = useState('index');

  return (
    <K.TabStrip
      aria-label={t(m.tstAriaOpenFiles)}
      tabs={tabs}
      value={active}
      onValueChange={setActive}
      onClose={(id: string) => {
        setTabs((prev) => {
          const next = prev.filter((tab) => tab.id !== id);
          if (id === active && next.length) setActive(next[0]!.id);
          return next;
        });
      }}
    />
  );
}

export function TabStripPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.tstName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.tstLede))}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.tstAnatomyIntro)}</Text>
      <ComponentBlueprint specId="tab-strip" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.tstEx1Title)}
        description={t(m.tstEx1Desc)}
        component="TabStrip"
        render={(K) => <ControlledStrip K={K} />}
        code={`import { useState } from 'react';
import { TabStrip, type TabStripItem } from '@glacier/react';

const [tabs, setTabs] = useState<TabStripItem[]>([
  { id: 'index', label: 'index.tsx', icon: fileIcon },
  { id: 'styles', label: 'styles.css', icon: fileIcon },
  { id: 'readme', label: 'README.md', icon: fileIcon },
]);
const [active, setActive] = useState('index');

<TabStrip
  aria-label="Open files"
  tabs={tabs}
  value={active}
  onValueChange={setActive}
  onClose={(id) => {
    setTabs((prev) => {
      const next = prev.filter((tab) => tab.id !== id);
      if (id === active && next.length) setActive(next[0].id);
      return next;
    });
  }}
/>`}
      />

      <Example
        title={t(m.tstEx2Title)}
        description={t(m.tstEx2Desc)}
        component="TabStrip"
        render={(K) => (
          <div style={{ maxWidth: '20rem' }}>
            <K.TabStrip
              aria-label={t(m.tstAriaSheets)}
              defaultValue="jan"
              tabs={[
                { id: 'jan', label: t(m.tabstripJanuary) },
                { id: 'feb', label: t(m.tabstripFebruary) },
                { id: 'mar', label: t(m.tabstripMarch) },
                { id: 'apr', label: t(m.tabstripApril) },
                { id: 'may', label: t(m.tabstripMay) },
                { id: 'jun', label: t(m.tabstripJune) },
              ]}
              onClose={() => {}}
            />
          </div>
        )}
        code={`<div style={{ maxWidth: '20rem' }}>
  <TabStrip
    aria-label="Sheets"
    defaultValue="jan"
    tabs={[
      { id: 'jan', label: 'January' },
      { id: 'feb', label: 'February' },
      { id: 'mar', label: 'March' },
      { id: 'apr', label: 'April' },
      { id: 'may', label: 'May' },
      { id: 'jun', label: 'June' },
    ]}
    onClose={() => {}}
  />
</div>`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'tabs', type: '{ id: string; label: ReactNode; icon?: ReactNode }[]', description: t(m.tstPropTabs) },
          { name: 'value', type: 'string', description: t(m.tstPropValue) },
          { name: 'defaultValue', type: 'string', default: 'first tab', description: t(m.tstPropDefaultValue) },
          { name: 'onValueChange', type: '(id: string) => void', description: t(m.tstPropOnValueChange) },
          { name: 'onClose', type: '(id: string) => void', description: t(m.tstPropOnClose) },
          { name: 'spring', type: 'Spring', default: 'Spring.Snappy', description: t(m.tstPropSpring) },
          { name: 'aria-label', type: 'string', description: t(m.tstPropAriaLabel) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.tstA11y1))}</li>
        <li>{prose(t(m.tstA11y2))}</li>
        <li>{prose(t(m.tstA11y3))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.tstUse1))}</li>
        <li>{prose(t(m.tstUse2))}</li>
        <li>{prose(t(m.tstUse3))}</li>
      </ul>
    </>
  );
}
