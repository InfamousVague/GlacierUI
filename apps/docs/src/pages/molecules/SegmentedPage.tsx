import { useState } from 'react';
import { Box, Row, Stack, Heading, Text, Size, TextTone, useT } from '@glacier/react';
import { Spring } from '@glacier/motion';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { type PlatformKit } from '../../platforms.tsx';
import { m } from '../../i18n.ts';

/**
 * A controlled SegmentedControl paired with a live readout of the selected
 * value. Selection is lifted into this wrapper so each comparison pane owns its
 * own state — the render prop is run once per pane and cannot hold hooks itself.
 * `K` is the platform kit (the DOM kit or the RN kit) the demo renders through.
 */
function SegmentedViewDemo({ K }: { K: PlatformKit }) {
  const t = useT();
  const [view, setView] = useState('week');
  return (
    <Row gap={4} wrap>
      <K.SegmentedControl
        aria-label={t(m.segAriaCalendarView)}
        value={view}
        onValueChange={setView}
        options={[
          { value: 'day', label: t(m.segmentedDay) },
          { value: 'week', label: t(m.segmentedWeek) },
          { value: 'month', label: t(m.segmentedMonth) },
        ]}
      />
      <span>{t(m.segmentedShowingThe)} {view} {t(m.segmentedView)}</span>
    </Row>
  );
}

export function SegmentedPage() {
  const t = useT();

  return (
    <>
      <Heading level={1}>{t(m.segName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.segLede))}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.segAnatomyIntro)}</Text>
      <ComponentBlueprint specId="segmented-control" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.exBasic)}
        description={prose(t(m.segEx1Desc))}
        component="SegmentedControl"
        render={(K) => (
          <K.SegmentedControl
            aria-label={t(m.segAriaChartRange)}
            options={[
              { value: 'day', label: t(m.segmentedDay) },
              { value: 'week', label: t(m.segmentedWeek) },
              { value: 'month', label: t(m.segmentedMonth) },
            ]}
          />
        )}
        code={`import { SegmentedControl } from '@glacier/react';

<SegmentedControl
  aria-label="Chart range"
  options={[
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
  ]}
/>`}
      />

      <Example
        title={t(m.segEx2Title)}
        description={prose(t(m.segEx2Desc))}
        component="SegmentedControl"
        render={(K) => <SegmentedViewDemo K={K} />}
        code={`const [view, setView] = useState('week');

<Row gap={4} wrap>
  <SegmentedControl
    aria-label="Calendar view"
    value={view}
    onValueChange={setView}
    options={[
      { value: 'day', label: 'Day' },
      { value: 'week', label: 'Week' },
      { value: 'month', label: 'Month' },
    ]}
  />
  <span>Showing the {view} view</span>
</Row>`}
      />

      <Example
        title={t(m.segEx3Title)}
        description={prose(t(m.segEx3Desc))}
        component="SegmentedControl"
        render={(K) => (
          <Stack gap={4}>
            {(
              [
                { name: 'Snappy', label: t(m.segmentedSnappy), preset: Spring.Snappy },
                { name: 'Smooth', label: t(m.segmentedSmooth), preset: Spring.Smooth },
                { name: 'Bouncy', label: t(m.segmentedBouncy), preset: Spring.Bouncy },
              ]
            ).map(({ name, label, preset }) => (
              <Row key={name} gap={4} wrap>
                <span style={{ width: '4.5rem' }}>{label}</span>
                <K.SegmentedControl
                  aria-label={`${label} ${t(m.segmentedSpringDemo)}`}
                  spring={preset}
                  options={[
                    { value: 'one', label: t(m.segmentedOne) },
                    { value: 'two', label: t(m.segmentedTwo) },
                    { value: 'three', label: t(m.segmentedThree) },
                  ]}
                />
              </Row>
            ))}
          </Stack>
        )}
        code={`import { Spring } from '@glacier/motion';

<SegmentedControl spring={Spring.Snappy} aria-label="Snappy demo" options={options} />
<SegmentedControl spring={Spring.Smooth} aria-label="Smooth demo" options={options} />
<SegmentedControl spring={Spring.Bouncy} aria-label="Bouncy demo" options={options} />`}
      />

      <Example
        title={t(m.secSizes)}
        description={prose(t(m.segEx4Desc))}
        component="SegmentedControl"
        render={(K) => (
          <Stack gap={4}>
            {(['sm', 'md', 'lg'] as const).map((size) => (
              <div key={size}>
                <K.SegmentedControl
                  size={size}
                  aria-label={`${t(m.segmentedSize)} ${size}`}
                  options={[
                    { value: 'list', label: t(m.segmentedList) },
                    { value: 'grid', label: t(m.segmentedGrid) },
                  ]}
                />
              </div>
            ))}
          </Stack>
        )}
        code={`<SegmentedControl size={Size.Small} aria-label="Small" options={options} />
<SegmentedControl size={Size.Medium} aria-label="Medium" options={options} />
<SegmentedControl size={Size.Large} aria-label="Large" options={options} />`}
      />

      <Example
        title={t(m.segEx5Title)}
        description={prose(t(m.segEx5Desc))}
        component="SegmentedControl"
        render={(K) => (
          <Box width="full" style={{ maxWidth: 320 }}>
            <K.SegmentedControl
              fullWidth
              aria-label={t(m.segAriaPlaybackSource)}
              options={[
                { value: 'library', label: t(m.segmentedLibrary) },
                { value: 'radio', label: t(m.segmentedRadio) },
                { value: 'search', label: t(m.segmentedSearch) },
              ]}
            />
          </Box>
        )}
        code={`<div style={{ maxWidth: 320 }}>
  <SegmentedControl
    fullWidth
    aria-label="Playback source"
    options={[
      { value: 'library', label: 'Library' },
      { value: 'radio', label: 'Radio' },
      { value: 'search', label: 'Search' },
    ]}
  />
</div>`}
      />

      <Example
        title={t(m.segEx6Title)}
        description={prose(t(m.segEx6Desc))}
        component="SegmentedControl"
        render={(K) => (
          <K.SegmentedControl
            aria-label={t(m.segAriaExportFormat)}
            options={[
              { value: 'png', label: t(m.segmentedPng) },
              { value: 'svg', label: t(m.segmentedSvg), disabled: true },
              { value: 'pdf', label: t(m.segmentedPdf) },
            ]}
          />
        )}
        code={`<SegmentedControl
  aria-label="Export format"
  options={[
    { value: 'png', label: 'PNG' },
    { value: 'svg', label: 'SVG', disabled: true },
    { value: 'pdf', label: 'PDF' },
  ]}
/>`}
      />

      <Example
        title={t(m.exSkeleton)}
        description={prose(t(m.segEx7Desc))}
        component="SegmentedControl"
        render={(K) => (
          <Stack gap={4}>
            <K.SegmentedControl
              skeleton
              aria-label={t(m.segAriaChartRange)}
              options={[
                { value: 'day', label: t(m.segmentedDay) },
                { value: 'week', label: t(m.segmentedWeek) },
                { value: 'month', label: t(m.segmentedMonth) },
              ]}
            />
            <K.SegmentedControl
              aria-label={t(m.segAriaChartRange)}
              options={[
                { value: 'day', label: t(m.segmentedDay) },
                { value: 'week', label: t(m.segmentedWeek) },
                { value: 'month', label: t(m.segmentedMonth) },
              ]}
            />
          </Stack>
        )}
        code={`<SegmentedControl skeleton aria-label="Chart range" options={options} />
<SegmentedControl
  aria-label="Chart range"
  options={[
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
  ]}
/>`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <Heading level={3}>{t(m.segmentedSegmentedcontrol)}</Heading>
      <PropsTable
        props={[
          {
            name: 'options',
            type: 'SegmentedOption[]',
            description: t(m.segPropOptions),
          },
          {
            name: 'value',
            type: 'string',
            description: t(m.segPropValue),
          },
          {
            name: 'defaultValue',
            type: 'string',
            description: t(m.segPropDefaultValue),
          },
          {
            name: 'onValueChange',
            type: '(value: string) => void',
            description: t(m.segPropOnValueChange),
          },
          {
            name: 'size',
            type: "'sm' | 'md' | 'lg'",
            default: "'md'",
            description: t(m.segPropSize),
          },
          {
            name: 'fullWidth',
            type: 'boolean',
            default: 'false',
            description: t(m.segPropFullWidth),
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: t(m.segPropSkeleton),
          },
          {
            name: 'spring',
            type: 'Spring',
            default: 'Spring.Snappy',
            description: t(m.segPropSpring),
          },
          {
            name: 'disabled',
            type: 'boolean',
            default: 'false',
            description: t(m.segPropDisabled),
          },
          {
            name: 'aria-label',
            type: 'string',
            description: t(m.segPropAriaLabel),
          },
          {
            name: 'className',
            type: 'string',
            description: t(m.segPropClassName),
          },
        ]}
      />

      <Heading level={3}>{t(m.segOptionsEntries)} {t(m.segmentedSegmentedoption)}</Heading>
      <PropsTable
        props={[
          {
            name: 'value',
            type: 'string',
            description: t(m.segOptValue),
          },
          {
            name: 'label',
            type: 'ReactNode',
            description: t(m.segOptLabel),
          },
          {
            name: 'disabled',
            type: 'boolean',
            default: 'false',
            description: t(m.segOptDisabled),
          },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.segA11y1))}</li>
        <li>{prose(t(m.segA11y2))}</li>
        <li>{prose(t(m.segA11y3))}</li>
        <li>{prose(t(m.segA11y4))}</li>
        <li>{prose(t(m.segA11y5))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.segUse1))}</li>
        <li>{prose(t(m.segUse2))}</li>
        <li>{prose(t(m.segUse3))}</li>
        <li>{prose(t(m.segUse4))}</li>
        <li>{prose(t(m.segUse5))}</li>
      </ul>
    </>
  );
}
