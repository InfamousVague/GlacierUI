import { Row, Stack, StatusDot, Text, Heading, Size, TextTone, Tone, useT } from '@glacier/react';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { m } from '../../i18n.ts';

export function StatusDotPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.sdotName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.sdotLede))}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.sdotAnatomyIntro)}</Text>
      <ComponentBlueprint specId="status-dot" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.secTones)}
        description={prose(t(m.sdotEx1Desc))}
        component="StatusDot"
        render={(K) => (
          <Row gap={4}>
            <K.StatusDot />
            <K.StatusDot tone={Tone.Accent} />
            <K.StatusDot tone={Tone.Success} />
            <K.StatusDot tone={Tone.Warning} />
            <K.StatusDot tone={Tone.Danger} />
            <K.StatusDot tone={Tone.Info} />
          </Row>
        )}
        code={`import { StatusDot } from '@glacier/react';

<StatusDot />
<StatusDot tone={Tone.Accent} />
<StatusDot tone={Tone.Success} />
<StatusDot tone={Tone.Warning} />
<StatusDot tone={Tone.Danger} />
<StatusDot tone={Tone.Info} />`}
      />

      <Example
        title={t(m.sdotEx2Title)}
        description={prose(t(m.sdotEx2Desc))}
        code={`<StatusDot tone={Tone.Success} pulse />
<StatusDot tone={Tone.Info} pulse />`}
      >
        <Row gap={4}>
          <StatusDot tone={Tone.Success} pulse />
          <StatusDot tone={Tone.Info} pulse />
        </Row>
      </Example>

      <Example
        title={t(m.secSizes)}
        description={prose(t(m.sdotEx3Desc))}
        component="StatusDot"
        render={(K) => (
          <Row gap={4}>
            <K.StatusDot size={Size.Small} tone={Tone.Success} />
            <K.StatusDot size={Size.Medium} tone={Tone.Success} />
          </Row>
        )}
        code={`<StatusDot size={Size.Small} tone={Tone.Success} />
<StatusDot size={Size.Medium} tone={Tone.Success} />`}
      />

      <Example
        title={t(m.sdotEx4Title)}
        description={prose(t(m.sdotEx4Desc))}
        code={`<Row gap={4}>
  <StatusDot tone={Tone.Success} pulse label="Running" />
  <Text as="span" weight="medium">api-server</Text>
</Row>`}
      >
        <Stack gap={4}>
          <Row gap={4}>
            <StatusDot tone={Tone.Success} pulse label={t(m.statusdotRunning)} />
            <Text as="span" weight="medium">
              {t(m.statusdotApiServer)}
            </Text>
          </Row>
          <Row gap={4}>
            <StatusDot tone={Tone.Danger} label={t(m.statusdotDown)} />
            <Text as="span" weight="medium">
              {t(m.statusdotWorkerQueue)}
            </Text>
          </Row>
        </Stack>
      </Example>

      <Example
        title={t(m.exSkeleton)}
        description={prose(t(m.sdotEx5Desc))}
        component="StatusDot"
        render={(K) => (
          <Row gap={4}>
            <K.StatusDot skeleton size={Size.Small} />
            <K.StatusDot skeleton />
          </Row>
        )}
        code={`<StatusDot skeleton size={Size.Small} />
<StatusDot skeleton />`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          {
            name: 'tone',
            type: "'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info'",
            default: "'neutral'",
            description: t(m.sdotPropTone),
          },
          {
            name: 'pulse',
            type: 'boolean',
            default: 'false',
            description: t(m.sdotPropPulse),
          },
          {
            name: 'size',
            type: "'sm' | 'md'",
            default: "'md'",
            description: t(m.sdotPropSize),
          },
          {
            name: 'label',
            type: 'string',
            description: t(m.sdotPropLabel),
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: t(m.sdotPropSkeleton),
          },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.sdotA11y1))}</li>
        <li>{prose(t(m.sdotA11y2))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.sdotUse1))}</li>
        <li>{prose(t(m.sdotUse2))}</li>
        <li>{prose(t(m.sdotUse3))}</li>
      </ul>
    </>
  );
}
