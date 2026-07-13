import { Button, Row, Spinner, Text, Heading, Size, TextTone, Tone, Variant, useT } from '@glacier/react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

export function SpinnerPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.spnName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.spnLede))}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.spnAnatomyIntro)}</Text>
      <ComponentBlueprint specId="spinner" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.secSizes)}
        description={t(m.spnEx1Desc)}
        component="Spinner"
        render={(K) => (
          <Row gap={4}>
            <K.Spinner size={Size.Small} aria-label={t(m.spinnerLoadingSmall)} />
            <K.Spinner size={Size.Medium} aria-label={t(m.spinnerLoadingMedium)} />
            <K.Spinner size={Size.Large} aria-label={t(m.spinnerLoadingLarge)} />
          </Row>
        )}
        code={`import { Spinner } from '@glacier/react';

<Spinner size={Size.Small} />
<Spinner size={Size.Medium} />
<Spinner size={Size.Large} />`}
      />

      <Example
        title={t(m.secTones)}
        description={t(m.spnEx2Desc)}
        component="Spinner"
        render={(K) => (
          <Row gap={4}>
            <K.Spinner tone={Tone.Subtle} aria-label={t(m.spinnerLoading)} />
            <K.Spinner tone={Tone.Accent} aria-label={t(m.spinnerLoading)} />
            <Text
              as="span"
              tone={TextTone.Danger}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--glacier-space-2)' }}
            >
              <K.Spinner tone={Tone.Inherit} size={Size.Small} aria-label="" />
              {t(m.spinnerRetrying)}
            </Text>
          </Row>
        )}
        code={`<Spinner tone={Tone.Subtle} />
<Spinner tone={Tone.Accent} />
{/* a flex group centers the spinner with the label */}
<Text tone={TextTone.Danger} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
  <Spinner tone={Tone.Inherit} size={Size.Small} /> Retrying
</Text>`}
      />

      <Example
        title={t(m.spnEx3Title)}
        description={t(m.spnEx3Desc)}
        code={`<Button loading>Saving</Button>
<Button variant={Variant.Soft} loading>Syncing</Button>`}
      >
        <Button loading>{t(m.spinnerSaving)}</Button>
        <Button variant={Variant.Soft} loading>
          {t(m.spinnerSyncing)}
        </Button>
      </Example>

      <Example
        title={t(m.exSkeleton)}
        description={t(m.spnEx4Desc)}
        component="Spinner"
        render={(K) => (
          <Row gap={4}>
            <K.Spinner skeleton size={Size.Small} />
            <K.Spinner skeleton size={Size.Medium} />
            <K.Spinner skeleton size={Size.Large} />
          </Row>
        )}
        code={`<Spinner skeleton size={Size.Small} />
<Spinner skeleton size={Size.Medium} />
<Spinner skeleton size={Size.Large} />`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: t(m.spnPropSize) },
          { name: 'tone', type: "'subtle' | 'accent' | 'inherit'", default: "'subtle'", description: t(m.spnPropTone) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(m.spnPropSkeleton) },
          { name: 'aria-label', type: 'string', default: "'Loading'", description: t(m.spnPropAriaLabel) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.spnA11y1))}</li>
        <li>{prose(t(m.spnA11y2))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.spnUse1))}</li>
        <li>{prose(t(m.spnUse2))}</li>
        <li>{prose(t(m.spnUse3))}</li>
      </ul>
    </>
  );
}
