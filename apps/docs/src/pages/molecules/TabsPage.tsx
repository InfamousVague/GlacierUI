import { Spring } from '@glacier/motion';
import { Pill, Stack, Text, Heading, Size, TextTone, Tone, useT } from '@glacier/react';
import { useState } from 'react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { type PlatformKit } from '../../platforms.tsx';
import { m } from '../../i18n.ts';

/**
 * A controlled Tabs demo. Selection is lifted into state here — not into the
 * Example's `render` (which runs once per pane and cannot hold hooks) — so each
 * comparison pane manages its own selection and the status line stays in sync.
 * `K` is the platform kit (the DOM kit or the RN kit) the demo renders through.
 */
function TabsControlledDemo({ K }: { K: PlatformKit }) {
  const t = useT();
  const [section, setSection] = useState('activity');
  return (
    <Stack gap={4} style={{ width: '100%', maxWidth: '28rem' }}>
      <K.Tabs
        aria-label={t(m.tabsAriaProfile)}
        value={section}
        onValueChange={setSection}
        tabs={[
          { value: 'posts', label: t(m.tabsPosts), content: <Text>{t(m.tabsCtrlPosts)}</Text> },
          { value: 'activity', label: t(m.tabsActivity), content: <Text>{t(m.tabsCtrlActivity)}</Text> },
        ]}
      />
      <Text size={Size.XSmall} tone={TextTone.Subtle}>
        {t(m.tabsActive)}{' '}
        <Text as="span" size={Size.XSmall} mono>
          {section}
        </Text>
      </Text>
    </Stack>
  );
}

export function TabsPage() {
  const t = useT();

  return (
    <>
      <Heading level={1}>{t(m.tabsName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(m.tabsLede)}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.tabsAnatomyIntro)}</Text>
      <ComponentBlueprint specId="tabs" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.exBasic)}
        description={t(m.tabsEx1Desc)}
        component="Tabs"
        render={(K) => (
          <div style={{ width: '100%', maxWidth: '28rem' }}>
            <K.Tabs
              aria-label={t(m.tabsAriaProjectSections)}
              tabs={[
                { value: 'overview', label: t(m.tabsOverview), content: <Text>{t(m.tabsBasicOverview)}</Text> },
                { value: 'files', label: t(m.tabsFiles), content: <Text>{t(m.tabsBasicFiles)}</Text> },
                { value: 'settings', label: t(m.tabsSettings), content: <Text>{t(m.tabsBasicSettings)}</Text> },
              ]}
            />
          </div>
        )}
        code={`import { Tabs } from '@glacier/react';

<Tabs
  aria-label="Project sections"
  tabs={[
    { value: 'overview', label: 'Overview', content: <Text>The project at a glance.</Text> },
    { value: 'files', label: 'Files', content: <Text>Everything checked in.</Text> },
    { value: 'settings', label: 'Settings', content: <Text>Configuration and access.</Text> },
  ]}
/>`}
      />

      <Example
        title={t(m.tabsEx2Title)}
        description={t(m.tabsEx2Desc)}
        component="Tabs"
        render={(K) => (
          <div style={{ width: '100%', maxWidth: '28rem' }}>
            <K.Tabs
              aria-label={t(m.tabsAriaInbox)}
              tabs={[
                {
                  value: 'open',
                  label: (
                    <>
                      {t(m.tabsOpen)}{' '}
                      <Pill size={Size.Small} tone={Tone.Accent}>
                        12
                      </Pill>
                    </>
                  ),
                  content: <Text>{t(m.tabsRichOpen)}</Text>,
                },
                {
                  value: 'done',
                  label: (
                    <>
                      {t(m.tabsDone)} <Pill size={Size.Small}>248</Pill>
                    </>
                  ),
                  content: <Text>{t(m.tabsRichDone)}</Text>,
                },
                {
                  value: 'failed',
                  label: (
                    <>
                      {t(m.tabsFailed)}{' '}
                      <Pill size={Size.Small} tone={Tone.Danger}>
                        3
                      </Pill>
                    </>
                  ),
                  content: <Text>{t(m.tabsRichFailed)}</Text>,
                },
              ]}
            />
          </div>
        )}
        code={`<Tabs
  aria-label="Inbox"
  tabs={[
    { value: 'open', label: <>Open <Pill size={Size.Small} tone={Tone.Accent}>12</Pill></>, content: <Text>Twelve open items.</Text> },
    { value: 'done', label: <>Done <Pill size={Size.Small}>248</Pill></>, content: <Text>Closed out.</Text> },
    { value: 'failed', label: <>Failed <Pill size={Size.Small} tone={Tone.Danger}>3</Pill></>, content: <Text>Needs attention.</Text> },
  ]}
/>`}
      />

      <Example
        title={t(m.tabsEx3Title)}
        description={t(m.tabsEx3Desc)}
        component="Tabs"
        render={(K) => <TabsControlledDemo K={K} />}
        code={`const [section, setSection] = useState('activity');

<Tabs
  aria-label="Profile"
  value={section}
  onValueChange={setSection}
  tabs={[
    { value: 'posts', label: 'Posts', content: <Text>Recent posts.</Text> },
    { value: 'activity', label: 'Activity', content: <Text>This week's activity.</Text> },
  ]}
/>`}
      />

      <Example
        title={t(m.tabsEx4Title)}
        description={t(m.tabsEx4Desc)}
        component="Tabs"
        render={(K) => (
          <div style={{ width: '100%', maxWidth: '28rem' }}>
            <K.Tabs
              aria-label={t(m.tabsAriaBilling)}
              fullWidth
              spring={Spring.Bouncy}
              tabs={[
                { value: 'plan', label: t(m.tabsPlan), content: <Text>{t(m.tabsFullPlan)}</Text> },
                { value: 'invoices', label: t(m.tabsInvoices), content: <Text>{t(m.tabsFullInvoices)}</Text> },
                { value: 'tax', label: t(m.tabsTax), disabled: true, content: null },
              ]}
            />
          </div>
        )}
        code={`<Tabs
  aria-label="Billing"
  fullWidth
  spring={Spring.Bouncy}
  tabs={[
    { value: 'plan', label: 'Plan', content: <Text>Current plan.</Text> },
    { value: 'invoices', label: 'Invoices', content: <Text>Past invoices.</Text> },
    { value: 'tax', label: 'Tax', disabled: true, content: null },
  ]}
/>`}
      />

      <Example
        title={t(m.exSkeleton)}
        description={t(m.tabsEx5Desc)}
        component="Tabs"
        render={(K) => (
          <div style={{ width: '100%', maxWidth: '28rem' }}>
            <K.Tabs skeleton aria-label={t(m.tabsAriaProjectSections)} tabs={[]} />
          </div>
        )}
        code={`<Tabs skeleton aria-label="Project sections" tabs={[]} />`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <Heading level={3}>{t(m.tabsPropsGroupTabs)}</Heading>
      <PropsTable
        props={[
          { name: 'tabs', type: 'TabItem[]', description: t(m.tabsPropTabs) },
          { name: 'value', type: 'string', description: t(m.tabsPropValue) },
          { name: 'defaultValue', type: 'string', description: t(m.tabsPropDefaultValue) },
          { name: 'onValueChange', type: '(value: string) => void', description: t(m.tabsPropOnValueChange) },
          { name: 'spring', type: 'Spring', default: 'Spring.Snappy', description: t(m.tabsPropSpring) },
          { name: 'fullWidth', type: 'boolean', default: 'false', description: t(m.tabsPropFullWidth) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(m.tabsPropSkeleton) },
          { name: 'aria-label', type: 'string', description: t(m.tabsPropAriaLabel) },
        ]}
      />
      <Heading level={3}>{t(m.tabsPropsGroupEntries)}</Heading>
      <PropsTable
        props={[
          { name: 'value', type: 'string', description: t(m.tabsEntryValue) },
          { name: 'label', type: 'ReactNode', description: t(m.tabsEntryLabel) },
          { name: 'content', type: 'ReactNode', description: t(m.tabsEntryContent) },
          { name: 'disabled', type: 'boolean', default: 'false', description: t(m.tabsEntryDisabled) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.tabsA11y1))}</li>
        <li>{prose(t(m.tabsA11y2))}</li>
        <li>{prose(t(m.tabsA11y3))}</li>
        <li>{prose(t(m.tabsA11y4))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.tabsUse1))}</li>
        <li>{prose(t(m.tabsUse2))}</li>
        <li>{prose(t(m.tabsUse3))}</li>
        <li>{prose(t(m.tabsUse4))}</li>
      </ul>
    </>
  );
}
