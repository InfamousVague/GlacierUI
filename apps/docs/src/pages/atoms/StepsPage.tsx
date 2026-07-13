import { Stack, Steps, Heading, Text, Size, TextTone, Tone, useT } from '@glacier/react';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { m } from '../../i18n.ts';

export function StepsPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.stpName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.stpLede))}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.stpAnatomyIntro)}</Text>
      <ComponentBlueprint specId="steps" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.stpEx1Title)}
        description={prose(t(m.stpEx1Desc))}
        component="Steps"
        render={(K) => (
          <Stack gap={4}>
            <K.Steps count={5} active={0} />
            <K.Steps count={5} active={2} />
            <K.Steps count={5} active={4} />
          </Stack>
        )}
        code={`import { Steps } from '@glacier/react';

<Steps count={5} active={0} />
<Steps count={5} active={2} />
<Steps count={5} active={4} />`}
      />

      <Example
        title={t(m.stpEx2Title)}
        description={prose(t(m.stpEx2Desc))}
        code={`<Steps variant="connected" count={4} active={2} />
<Steps variant="connected" numbered count={4} active={2} />`}
      >
        <Stack gap={5} style={{ width: '100%', maxWidth: '24rem' }}>
          <Steps variant="connected" count={4} active={2} style={{ width: '100%' }} />
          <Steps variant="connected" numbered count={4} active={2} style={{ width: '100%' }} />
        </Stack>
      </Example>

      <Example
        title={t(m.secTones)}
        description={prose(t(m.stpEx3Desc))}
        component="Steps"
        render={(K) => (
          <Stack gap={4}>
            <K.Steps count={4} active={2} tone={Tone.Accent} />
            <K.Steps count={4} active={2} tone={Tone.Success} />
            <K.Steps count={4} active={2} tone={Tone.Warning} />
            <K.Steps count={4} active={2} tone={Tone.Danger} />
          </Stack>
        )}
        code={`<Steps count={4} active={2} tone={Tone.Accent} />
<Steps count={4} active={2} tone={Tone.Success} />
<Steps count={4} active={2} tone={Tone.Warning} />
<Steps count={4} active={2} tone={Tone.Danger} />`}
      />

      <Example
        title={t(m.secSizes)}
        description={prose(t(m.stpEx4Desc))}
        component="Steps"
        render={(K) => (
          <Stack gap={4}>
            <K.Steps count={5} active={2} size={Size.Small} />
            <K.Steps count={5} active={2} size={Size.Medium} />
          </Stack>
        )}
        code={`<Steps count={5} active={2} size={Size.Small} />
<Steps count={5} active={2} size={Size.Medium} />`}
      />

      <Example
        title={t(m.exSkeleton)}
        description={prose(t(m.stpEx5Desc))}
        component="Steps"
        render={(K) => (
          <Stack gap={4}>
            <K.Steps count={5} skeleton />
            <K.Steps count={5} active={2} />
          </Stack>
        )}
        code={`<Steps count={5} skeleton />
<Steps count={5} active={2} />`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          {
            name: 'count',
            type: 'number',
            description: t(m.stpPropCount),
          },
          {
            name: 'active',
            type: 'number',
            default: '0',
            description: t(m.stpPropActive),
          },
          {
            name: 'variant',
            type: "'dots' | 'connected'",
            default: "'dots'",
            description: t(m.stpPropVariant),
          },
          {
            name: 'numbered',
            type: 'boolean',
            default: 'false',
            description: t(m.stpPropNumbered),
          },
          {
            name: 'tone',
            type: "'accent' | 'success' | 'warning' | 'danger' | 'neutral' | 'info'",
            default: "'accent'",
            description: t(m.stpPropTone),
          },
          {
            name: 'size',
            type: "'sm' | 'md'",
            default: "'md'",
            description: t(m.stpPropSize),
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: t(m.stpPropSkeleton),
          },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.stpA11y1))}</li>
        <li>{prose(t(m.stpA11y2))}</li>
        <li>{prose(t(m.stpA11y3))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.stpUse1))}</li>
        <li>{prose(t(m.stpUse2))}</li>
        <li>{prose(t(m.stpUse3))}</li>
      </ul>
    </>
  );
}
