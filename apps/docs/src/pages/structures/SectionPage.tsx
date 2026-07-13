import { Box, Button, Heading, Size, Text, TextTone, Variant, useT } from '@glacier/react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

function ContentBlock({ lines }: { lines: string[] }) {
  return (
    <Box width="full" border radius="lg" padding={4}>
      <div style={{ display: 'grid', gap: 'var(--glacier-space-2)' }}>
        {lines.map((line) => (
          <Text key={line} size={Size.Small} tone={TextTone.Muted}>
            {line}
          </Text>
        ))}
      </div>
    </Box>
  );
}

export function SectionPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.sectName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.sectLede))}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.anatomyIntro)}</Text>
      <ComponentBlueprint specId="section" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.sectEx1Title)}
        description={t(m.sectEx1Desc)}
        component="Section"
        render={(K) => (
          <Box width="full">
            <K.Section
              title={t(m.sectionTeamMembers)}
              description={t(m.sectDemoTeamDesc)}
              actions={<Button size={Size.Small}>{t(m.sectionInvite)}</Button>}
            >
              <ContentBlock lines={['Ada Lovelace, Owner', 'Grace Hopper, Admin', 'Alan Turing, Member']} />
            </K.Section>
          </Box>
        )}
        code={`<Section
  title="Team members"
  description="Everyone with access to this project."
  actions={<Button size={Size.Small}>Invite</Button>}
>
  {content}
</Section>`}
      />

      <Example
        title={t(m.sectEx2Title)}
        description={t(m.sectEx2Desc)}
        component="Section"
        render={(K) => (
          <Box width="full">
            <div style={{ display: 'grid', gap: 'var(--glacier-space-6)' }}>
              <K.Section title={t(m.sectionProfile)} headingLevel={3} description={t(m.sectDemoProfileDesc)}>
                <ContentBlock lines={['Display name', 'Avatar']} />
              </K.Section>
              <K.Section title={t(m.sectionNotifications)} headingLevel={3} divider description={t(m.sectDemoNotifDesc)}>
                <ContentBlock lines={['Mentions', 'Weekly digest']} />
              </K.Section>
              <K.Section
                title={t(m.sectionDangerZone)}
                headingLevel={3}
                divider
                actions={<Button variant={Variant.Ghost} size={Size.Small}>{t(m.sectionDeleteProject)}</Button>}
              >
                <ContentBlock lines={[t(m.sectDemoDanger)]} />
              </K.Section>
            </div>
          </Box>
        )}
        code={`<Section title="Profile" headingLevel={3} description="Name, avatar, and public details.">
  {content}
</Section>
<Section title="Notifications" headingLevel={3} divider description="What we email you about.">
  {content}
</Section>
<Section
  title="Danger zone"
  headingLevel={3}
  divider
  actions={<Button variant={Variant.Ghost} size={Size.Small}>Delete project</Button>}
>
  {content}
</Section>`}
      />

      <Example
        title={t(m.sectEx3Title)}
        description={t(m.sectEx3Desc)}
        component="Section"
        render={(K) => (
          <Box width="full">
            <div style={{ display: 'grid', gap: 'var(--glacier-space-4)' }}>
              <K.Section title={t(m.sectionActivity)} headingLevel={3} density="compact" description={t(m.sectDemoActivityDesc)}>
                <ContentBlock lines={['128 commits', '12 reviews']} />
              </K.Section>
              <K.Section title={t(m.sectionStorage)} headingLevel={3} density="compact" divider>
                <ContentBlock lines={['4.2 GB of 10 GB used']} />
              </K.Section>
            </div>
          </Box>
        )}
        code={`<Section title="Activity" headingLevel={3} density="compact" description="The last 30 days.">
  {content}
</Section>
<Section title="Storage" headingLevel={3} density="compact" divider>
  {content}
</Section>`}
      />

      <Example
        title={t(m.sectEx4Title)}
        description={t(m.sectEx4Desc)}
        component="Section"
        render={(K) => (
          <Box width="full">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: 'var(--glacier-space-6)' }}>
              <K.Section title={t(m.sectionSmall)} headingLevel={3} gap="sm">
                <ContentBlock lines={['space-3 above me']} />
              </K.Section>
              <K.Section title={t(m.sectionMedium)} headingLevel={3} gap="md">
                <ContentBlock lines={['space-5 above me']} />
              </K.Section>
              <K.Section title={t(m.sectionLarge)} headingLevel={3} gap="lg">
                <ContentBlock lines={['space-8 above me']} />
              </K.Section>
            </div>
          </Box>
        )}
        code={`<Section title="Small" gap="sm">{content}</Section>
<Section title="Medium" gap="md">{content}</Section>
<Section title="Large" gap="lg">{content}</Section>`}
      />

      <Example
        title={t(m.exSkeleton)}
        description={t(m.sectEx5Desc)}
        component="Section"
        render={(K) => (
          <Box width="full">
            <K.Section skeleton />
          </Box>
        )}
        code={`<Section skeleton />`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'title', type: 'ReactNode', description: t(m.sectPropTitle) },
          { name: 'description', type: 'ReactNode', description: t(m.sectPropDescription) },
          { name: 'actions', type: 'ReactNode', description: t(m.sectPropActions) },
          { name: 'headingLevel', type: '2 | 3', default: '2', description: t(m.sectPropHeadingLevel) },
          { name: 'gap', type: "'sm' | 'md' | 'lg'", default: "'md'", description: t(m.sectPropGap) },
          { name: 'divider', type: 'boolean', default: 'false', description: t(m.sectPropDivider) },
          { name: 'density', type: "'comfortable' | 'compact'", default: "'comfortable'", description: t(m.sectPropDensity) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(m.sectPropSkeleton) },
          { name: 'children', type: 'ReactNode', description: t(m.sectPropChildren) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.sectA11y1))}</li>
        <li>{prose(t(m.sectA11y2))}</li>
        <li>{prose(t(m.sectA11y3))}</li>
        <li>{prose(t(m.sectA11y4))}</li>
        <li>{prose(t(m.sectA11y5))}</li>
        <li>{prose(t(m.sectA11y6))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.sectUse1))}</li>
        <li>{prose(t(m.sectUse2))}</li>
        <li>{prose(t(m.sectUse3))}</li>
        <li>{prose(t(m.sectUse4))}</li>
        <li>{prose(t(m.sectUse5))}</li>
      </ul>
    </>
  );
}
