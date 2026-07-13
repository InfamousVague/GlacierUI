import { useState } from 'react';
import { Button, Heading, Text, Size, TextTone, Variant, useT } from '@glacier/react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { type PlatformKit } from '../../platforms.tsx';
import { m } from '../../i18n.ts';

function ControlledExample({ K }: { K: PlatformKit }) {
  const t = useT();
  const [value, setValue] = useState('inbox');
  return (
    <K.TabbedPanel
      aria-label={t(m.tbpAriaMessages)}
      value={value}
      onValueChange={setValue}
      tabs={[
        { id: 'inbox', label: t(m.tabbedpanelInbox), count: 8, content: <Text tone={TextTone.Muted}>{t(m.tbpInboxBody)}</Text> },
        { id: 'archive', label: t(m.tabbedpanelArchive), content: <Text tone={TextTone.Muted}>{t(m.tbpArchiveBody)}</Text> },
        { id: 'spam', label: t(m.tabbedpanelSpam), count: 132, content: <Text tone={TextTone.Muted}>{t(m.tbpSpamBody)}</Text> },
      ]}
    />
  );
}

export function TabbedPanelPage() {
  const t = useT();
  const overview = <Text tone={TextTone.Muted}>{t(m.tbpOverviewBody)}</Text>;
  const activity = <Text tone={TextTone.Muted}>{t(m.tbpActivityBody)}</Text>;
  const settings = <Text tone={TextTone.Muted}>{t(m.tbpSettingsBody)}</Text>;
  return (
    <>
      <Heading level={1}>{t(m.tbpName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.tbpLede))}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.tbpAnatomyIntro)}</Text>
      <ComponentBlueprint specId="tabbed-panel" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.exBasic)}
        description={t(m.tbpEx1Desc)}
        component="TabbedPanel"
        render={(K) => (
          <K.TabbedPanel
            aria-label={t(m.tbpAriaReport)}
            tabs={[
              { id: 'overview', label: t(m.tabbedpanelOverview), content: overview },
              { id: 'activity', label: t(m.tabbedpanelActivity), content: activity },
              { id: 'settings', label: t(m.tabbedpanelSettings), content: settings },
            ]}
          />
        )}
        code={`import { TabbedPanel } from '@glacier/react';

<TabbedPanel
  aria-label="Report"
  tabs={[
    { id: 'overview', label: 'Overview', content: overview },
    { id: 'activity', label: 'Activity', content: activity },
    { id: 'settings', label: 'Settings', content: settings },
  ]}
/>`}
      />

      <Example
        title={t(m.tbpEx2Title)}
        description={t(m.tbpEx2Desc)}
        component="TabbedPanel"
        render={(K) => (
          <K.TabbedPanel
            aria-label={t(m.tbpAriaQueue)}
            actions={
              <Button variant={Variant.Soft} size={Size.Small}>
                {t(m.tabbedpanelRefresh)}
              </Button>
            }
            tabs={[
              { id: 'open', label: t(m.tabbedpanelOpen), count: 3, content: <Text tone={TextTone.Muted}>{t(m.tbpOpenBody)}</Text> },
              { id: 'done', label: t(m.tabbedpanelDone), count: 128, content: <Text tone={TextTone.Muted}>{t(m.tbpDoneBody)}</Text> },
            ]}
          />
        )}
        code={`<TabbedPanel
  aria-label="Queue"
  actions={<Button variant={Variant.Soft} size={Size.Small}>Refresh</Button>}
  tabs={[
    { id: 'open', label: 'Open', count: 3, content: openWork },
    { id: 'done', label: 'Done', count: 128, content: doneWork },
  ]}
/>`}
      />

      <Example
        title={t(m.tbpEx3Title)}
        description={t(m.tbpEx3Desc)}
        component="TabbedPanel"
        render={(K) => <ControlledExample K={K} />}
        code={`const [value, setValue] = useState('inbox');

<TabbedPanel
  aria-label="Messages"
  value={value}
  onValueChange={setValue}
  tabs={[
    { id: 'inbox', label: 'Inbox', count: 8, content: inbox },
    { id: 'archive', label: 'Archive', content: archive },
    { id: 'spam', label: 'Spam', count: 132, content: spam },
  ]}
/>`}
      />

      <Example
        title={t(m.tbpEx4Title)}
        description={t(m.tbpEx4Desc)}
        component="TabbedPanel"
        render={(K) => (
          <K.TabbedPanel
            aria-label={t(m.tbpAriaPlan)}
            tabs={[
              { id: 'usage', label: t(m.tabbedpanelUsage), content: <Text tone={TextTone.Muted}>{t(m.tbpUsageBody)}</Text> },
              { id: 'billing', label: t(m.tabbedpanelBilling), disabled: true, content: <Text tone={TextTone.Muted}>{t(m.tbpBillingBody)}</Text> },
            ]}
          />
        )}
        code={`<TabbedPanel
  aria-label="Plan"
  tabs={[
    { id: 'usage', label: 'Usage', content: usage },
    { id: 'billing', label: 'Billing', disabled: true, content: billing },
  ]}
/>`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'tabs', type: 'TabbedPanelTab[]', description: t(m.tbpPropTabs) },
          { name: 'value', type: 'string', description: t(m.tbpPropValue) },
          { name: 'defaultValue', type: 'string', description: t(m.tbpPropDefaultValue) },
          { name: 'onValueChange', type: '(id: string) => void', description: t(m.tbpPropOnValueChange) },
          { name: 'actions', type: 'ReactNode', description: t(m.tbpPropActions) },
          { name: 'aria-label', type: 'string', description: t(m.tbpPropAriaLabel) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.tbpA11y1))}</li>
        <li>{prose(t(m.tbpA11y2))}</li>
        <li>{prose(t(m.tbpA11y3))}</li>
        <li>{prose(t(m.tbpA11y4))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.tbpUse1))}</li>
        <li>{prose(t(m.tbpUse2))}</li>
        <li>{prose(t(m.tbpUse3))}</li>
        <li>{prose(t(m.tbpUse4))}</li>
      </ul>
    </>
  );
}
