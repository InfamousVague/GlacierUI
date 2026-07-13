import { Box, Button, ProgressBar, Row, Stack, Text, Heading, Size, TextTone, Tone, Variant, useT } from '@glacier/react';
import { useEffect, useState } from 'react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

export function ProgressBarPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.pbName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.pbLede))}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.pbAnatomyIntro)}</Text>
      <ComponentBlueprint specId="progress-bar" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.pbEx1Title)}
        description={t(m.pbEx1Desc)}
        code={`import { ProgressBar } from '@glacier/react';

<ProgressBar aria-label="Course progress" value={65} />`}
      >
        <LiveProgress />
      </Example>

      <Example
        title={t(m.pbEx2Title)}
        description={t(m.pbEx2Desc)}
        code={`<ProgressBar aria-label="Preparing" indeterminate />`}
      >
        <Box maxWidth="xs" width="full">
          <ProgressBar aria-label={t(m.progressbarPreparing)} indeterminate />
        </Box>
      </Example>

      <Example
        title={t(m.pbEx3Title)}
        description={t(m.pbEx3Desc)}
        component="ProgressBar"
        render={(K) => (
          <Stack gap={4} maxWidth="xs" width="full">
            <K.ProgressBar aria-label={t(m.progressbarAccent)} value={70} size={Size.Small} />
            <K.ProgressBar aria-label={t(m.progressbarSuccess)} value={100} tone={Tone.Success} />
            <K.ProgressBar aria-label={t(m.progressbarWarning)} value={45} tone={Tone.Warning} />
            <K.ProgressBar aria-label={t(m.progressbarDanger)} value={15} tone={Tone.Danger} />
          </Stack>
        )}
        code={`<ProgressBar aria-label="Accent" value={70} size={Size.Small} />
<ProgressBar aria-label="Success" value={100} tone={Tone.Success} />
<ProgressBar aria-label="Warning" value={45} tone={Tone.Warning} />
<ProgressBar aria-label="Danger" value={15} tone={Tone.Danger} />`}
      />

      <Example
        title={t(m.pbEx4Title)}
        description={t(m.pbEx4Desc)}
        code={`<ProgressBar aria-label="Lesson 3 of 4" value={3} max={4} />`}
      >
        <Stack gap={4} maxWidth="xs" width="full">
          <ProgressBar aria-label={t(m.pbLesson)} value={3} max={4} />
          <Text size={Size.Small} tone={TextTone.Muted}>
            {t(m.pbLesson)}
          </Text>
        </Stack>
      </Example>

      <Example
        title={t(m.exSkeleton)}
        description={t(m.pbEx5Desc)}
        code={`<ProgressBar skeleton />
<ProgressBar aria-label="Course progress" value={65} />
<ProgressBar skeleton size={Size.Small} />`}
      >
        <Stack gap={4} maxWidth="xs" width="full">
          <ProgressBar skeleton />
          <ProgressBar aria-label={t(m.pbAriaCourseProgress)} value={65} />
          <ProgressBar skeleton size={Size.Small} />
        </Stack>
      </Example>

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'value', type: 'number', description: t(m.pbPropValue) },
          { name: 'max', type: 'number', default: '100', description: t(m.pbPropMax) },
          { name: 'indeterminate', type: 'boolean', default: 'false', description: t(m.pbPropIndeterminate) },
          { name: 'size', type: "'sm' | 'md'", default: "'md'", description: t(m.pbPropSize) },
          { name: 'tone', type: "'accent' | 'success' | 'warning' | 'danger'", default: "'accent'", description: t(m.pbPropTone) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(m.pbPropSkeleton) },
          { name: 'aria-label', type: 'string', description: t(m.pbPropAriaLabel) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.pbA11y1))}</li>
        <li>{prose(t(m.pbA11y2))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.pbUse1))}</li>
        <li>{prose(t(m.pbUse2))}</li>
        <li>{prose(t(m.pbUse3))}</li>
      </ul>
    </>
  );
}

function LiveProgress() {
  const t = useT();
  const [value, setValue] = useState(65);

  useEffect(() => {
    if (value < 100) return;
    const timer = setTimeout(() => setValue(0), 1200);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <Stack gap={4} maxWidth="xs" width="full">
      <ProgressBar aria-label={t(m.pbAriaCourseProgress)} value={value} />
      <Row gap={4} wrap>
        <Button size={Size.Small} variant={Variant.Soft} onClick={() => setValue((v) => Math.min(v + 15, 100))}>
          {t(m.progressbarAdvance)}
        </Button>
        <Text as="span" size={Size.Small} tone={TextTone.Muted}>
          {value}%
        </Text>
      </Row>
    </Stack>
  );
}
