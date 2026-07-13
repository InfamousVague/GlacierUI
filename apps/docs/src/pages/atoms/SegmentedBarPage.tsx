import { SegmentedBar, Stack, Text, Heading, Size, TextTone, useT } from '@glacier/react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

export function SegmentedBarPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.segName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(m.segLede)}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.segAnatomyIntro)}</Text>
      <ComponentBlueprint specId="segmented-bar" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.segEx1Title)}
        description={t(m.segEx1Desc)}
        component="SegmentedBar"
        render={(K) => (
          <Stack gap={4} maxWidth="xs" width="full">
            <K.SegmentedBar
              aria-label={t(m.segmentedbarStorageByType)}
              data={[
                { value: 40, tone: 'accent', label: t(m.segmentedbarPhotos) },
                { value: 25, tone: 'success', label: t(m.segmentedbarVideo) },
                { value: 15, tone: 'warning', label: t(m.segmentedbarDocs) },
              ]}
            />
            <Text size={Size.XSmall} tone={TextTone.Subtle}>
              {t(m.segDemoUsage)}
            </Text>
          </Stack>
        )}
        code={`import { SegmentedBar } from '@glacier/react';

<SegmentedBar
  aria-label="Storage by type"
  data={[
    { value: 40, tone: 'accent', label: 'Photos' },
    { value: 25, tone: 'success', label: 'Video' },
    { value: 15, tone: 'warning', label: 'Docs' },
  ]}
/>`}
      />

      <Example
        title={t(m.segEx2Title)}
        description={t(m.segEx2Desc)}
        component="SegmentedBar"
        render={(K) => (
          <Stack gap={4} maxWidth="xs" width="full">
            <K.SegmentedBar
              aria-label={t(m.segmentedbarBudgetSpent)}
              data={[
                { value: 60, tone: 'accent', label: t(m.segmentedbarSpent) },
                { value: 40, tone: 'neutral', label: t(m.segmentedbarRemaining) },
              ]}
            />
          </Stack>
        )}
        code={`<SegmentedBar
  aria-label="Budget spent"
  data={[
    { value: 60, tone: 'accent', label: 'Spent' },
    { value: 40, tone: 'neutral', label: 'Remaining' },
  ]}
/>`}
      />

      <Example
        title={t(m.segEx3Title)}
        description={t(m.segEx3Desc)}
        component="SegmentedBar"
        render={(K) => (
          <Stack gap={4} maxWidth="xs" width="full">
            <K.SegmentedBar
              aria-label={t(m.segmentedbarSmallBreakdown)}
              size={Size.Small}
              data={[
                { value: 50, tone: 'success' },
                { value: 30, tone: 'warning' },
                { value: 20, tone: 'danger' },
              ]}
            />
            <K.SegmentedBar
              aria-label={t(m.segmentedbarSquareBreakdown)}
              rounded={false}
              data={[
                { value: 50, tone: 'success' },
                { value: 30, tone: 'warning' },
                { value: 20, tone: 'danger' },
              ]}
            />
          </Stack>
        )}
        code={`<SegmentedBar aria-label="Small" size={Size.Small} data={data} />
<SegmentedBar aria-label="Square" rounded={false} data={data} />`}
      />

      <Example
        title={t(m.exSkeleton)}
        description={t(m.segEx4Desc)}
        component="SegmentedBar"
        render={(K) => (
          <Stack gap={4} maxWidth="xs" width="full">
            <K.SegmentedBar skeleton data={[]} />
            <K.SegmentedBar skeleton size={Size.Small} data={[]} />
          </Stack>
        )}
        code={`<SegmentedBar skeleton data={[]} />
<SegmentedBar skeleton size={Size.Small} data={[]} />`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'data', type: 'Array<{ value: number; tone?: SegmentedBarTone; label?: string }>', description: t(m.segPropData) },
          { name: 'size', type: "'sm' | 'md'", default: "'md'", description: t(m.segPropSize) },
          { name: 'rounded', type: 'boolean', default: 'true', description: t(m.segPropRounded) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(m.segPropSkeleton) },
          { name: 'aria-label', type: 'string', description: t(m.segPropAriaLabel) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.segA11y1))}</li>
        <li>{t(m.segA11y2)}</li>
        <li>{t(m.segA11y3)}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{t(m.segUse1)}</li>
        <li>{t(m.segUse2)}</li>
        <li>{t(m.segUse3)}</li>
        <li>{t(m.segUse4)}</li>
      </ul>
    </>
  );
}
