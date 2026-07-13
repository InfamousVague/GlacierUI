import { Button, ProgressRing, Row, Text, Heading, Size, TextTone, Tone, Variant, useT } from '@glacier/react';
import { useEffect, useState } from 'react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

export function ProgressRingPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.prName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.prLede))}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.prAnatomyIntro)}</Text>
      <ComponentBlueprint specId="progress-ring" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.prEx1Title)}
        description={t(m.prEx1Desc)}
        code={`import { ProgressRing } from '@glacier/react';

<ProgressRing aria-label="Sync progress" value={value} showValue />`}
      >
        <LiveRing />
      </Example>

      <Example
        title={t(m.prEx2Title)}
        description={t(m.prEx2Desc)}
        code={`<ProgressRing aria-label="Storage used" value={72} showValue />`}
      >
        <ProgressRing aria-label={t(m.prAriaStorageUsed)} value={72} showValue />
      </Example>

      <Example
        title={t(m.prEx3Title)}
        description={t(m.prEx3Desc)}
        component="ProgressRing"
        render={(K) => (
          <>
            <K.ProgressRing aria-label={t(m.progressringAccent)} value={70} />
            <K.ProgressRing aria-label={t(m.progressringSuccess)} value={100} tone={Tone.Success} size={64} />
            <K.ProgressRing aria-label={t(m.progressringWarning)} value={45} tone={Tone.Warning} size={80} thickness={8} />
            <K.ProgressRing aria-label={t(m.progressringDanger)} value={20} tone={Tone.Danger} size={32} thickness={3} />
          </>
        )}
        code={`<ProgressRing aria-label="Accent" value={70} />
<ProgressRing aria-label="Success" value={100} tone={Tone.Success} size={64} />
<ProgressRing aria-label="Warning" value={45} tone={Tone.Warning} size={80} thickness={8} />
<ProgressRing aria-label="Danger" value={20} tone={Tone.Danger} size={32} thickness={3} />`}
      />

      <Example
        title={t(m.prEx4Title)}
        description={t(m.prEx4Desc)}
        code={`<ProgressRing aria-label="Lesson 3 of 4" value={3} max={4} size={64} label={<Text size={Size.Small} tone={TextTone.Muted}>3/4</Text>} />`}
      >
        <ProgressRing
          aria-label={t(m.prLesson)}
          value={3}
          max={4}
          size={64}
          label={
            <Text as="span" size={Size.Small} tone={TextTone.Muted}>
              3/4
            </Text>
          }
        />
      </Example>

      <Example
        title={t(m.exSkeleton)}
        description={t(m.prEx5Desc)}
        code={`<ProgressRing skeleton value={0} />
<ProgressRing aria-label="Sync progress" value={64} showValue />`}
      >
        <Row gap={4} wrap>
          <ProgressRing skeleton value={0} />
          <ProgressRing aria-label={t(m.prAriaSyncProgress)} value={64} showValue />
        </Row>
      </Example>

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'value', type: 'number', description: t(m.prPropValue) },
          { name: 'max', type: 'number', default: '100', description: t(m.prPropMax) },
          { name: 'size', type: 'number', default: '48', description: t(m.prPropSize) },
          { name: 'thickness', type: 'number', default: '4', description: t(m.prPropThickness) },
          { name: 'tone', type: "'accent' | 'success' | 'warning' | 'danger'", default: "'accent'", description: t(m.prPropTone) },
          { name: 'label', type: 'ReactNode', description: t(m.prPropLabel) },
          { name: 'showValue', type: 'boolean', default: 'false', description: t(m.prPropShowValue) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(m.prPropSkeleton) },
          { name: 'aria-label', type: 'string', description: t(m.prPropAriaLabel) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.prA11y1))}</li>
        <li>{prose(t(m.prA11y2))}</li>
        <li>{prose(t(m.prA11y3))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.prUse1))}</li>
        <li>{prose(t(m.prUse2))}</li>
        <li>{prose(t(m.prUse3))}</li>
        <li>{prose(t(m.prUse4))}</li>
      </ul>
    </>
  );
}

function LiveRing() {
  const t = useT();
  const [value, setValue] = useState(64);

  useEffect(() => {
    if (value < 100) return;
    const timer = setTimeout(() => setValue(0), 1200);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <Row gap={4} wrap>
      <ProgressRing aria-label={t(m.prAriaSyncProgress)} value={value} showValue />
      <Row gap={4} wrap>
        <Button size={Size.Small} variant={Variant.Soft} onClick={() => setValue((v) => Math.min(v + 15, 100))}>
          {t(m.progressringAdvance)}
        </Button>
      </Row>
    </Row>
  );
}
