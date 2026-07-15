import { Announcements, Heading, Stack, Text, Size, TextTone, Tone, useT } from '@glacier/react';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { m } from '../../i18n.ts';

const updates = [
  { id: 'release', label: 'Release', content: 'GlacierUI 2.1 is now available.' },
  { id: 'maintenance', label: 'Maintenance', content: 'Scheduled maintenance begins Friday at 02:00 UTC.' },
  { id: 'status', label: 'Status', content: 'All services are operating normally.' },
];

export function AnnouncementsPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.anName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(m.anLede)}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.anAnatomyIntro)}</Text>
      <ComponentBlueprint specId="announcements" />

      <Heading level={2}>{t(m.secExamples)}</Heading>
      <Example
        title={t(m.anEx1Title)}
        description={prose(t(m.anEx1Desc))}
        component="Announcements"
        render={(K) => <K.Announcements items={updates} interval={4500} />}
        code={`import { Announcements } from '@glacier/react';

const updates = [
  { id: 'release', label: 'Release', content: 'GlacierUI 2.1 is now available.' },
  { id: 'maintenance', label: 'Maintenance', content: 'Scheduled maintenance begins Friday at 02:00 UTC.' },
];

<Announcements items={updates} />`}
      />

      <Example
        title={t(m.secTones)}
        description={prose(t(m.anEx2Desc))}
        component="Announcements"
        render={(K) => (
          <Stack gap={3} style={{ width: '100%', maxWidth: '42rem' }}>
            <K.Announcements items={updates} tone={Tone.Info} autoPlay={false} />
            <K.Announcements items={updates} tone={Tone.Success} autoPlay={false} />
            <K.Announcements items={updates} tone={Tone.Warning} autoPlay={false} />
          </Stack>
        )}
        code={`<Announcements items={updates} tone={Tone.Info} />
<Announcements items={updates} tone={Tone.Success} />
<Announcements items={updates} tone={Tone.Warning} />`}
      />

      <Example
        title={t(m.anEx3Title)}
        description={prose(t(m.anEx3Desc))}
        code={`<Announcements
  items={updates}
  autoPlay={false}
  defaultIndex={1}
  onIndexChange={(index) => analytics.track('announcement_seen', { index })}
/>`}
      >
        <div style={{ width: '100%', maxWidth: '42rem' }}>
          <Announcements items={updates} autoPlay={false} defaultIndex={1} />
        </div>
      </Example>

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'items', type: 'AnnouncementItem[]', description: t(m.anPropItems) },
          { name: 'tone', type: "'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info'", default: "'info'", description: t(m.anPropTone) },
          { name: 'index', type: 'number', description: t(m.anPropIndex) },
          { name: 'defaultIndex', type: 'number', default: '0', description: t(m.anPropDefaultIndex) },
          { name: 'onIndexChange', type: '(index: number) => void', description: t(m.anPropOnIndexChange) },
          { name: 'autoPlay', type: 'boolean', default: 'true', description: t(m.anPropAutoPlay) },
          { name: 'interval', type: 'number', default: '7000', description: t(m.anPropInterval) },
          { name: 'aria-label', type: 'string', default: "'Announcements'", description: t(m.anPropAriaLabel) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.anA11y1))}</li>
        <li>{prose(t(m.anA11y2))}</li>
        <li>{prose(t(m.anA11y3))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.anUse1))}</li>
        <li>{prose(t(m.anUse2))}</li>
        <li>{prose(t(m.anUse3))}</li>
      </ul>
    </>
  );
}