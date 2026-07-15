import { Heading, Text, Size, TextTone, useT } from '@glacier/react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

// A pseudo-random but stable year of daily counts, laid out as weeks (7 rows).
const weeks = 26;
const days = Array.from({ length: weeks * 7 }, (_, i) => {
  const seed = Math.sin(i * 12.9898) * 43758.5453;
  const frac = seed - Math.floor(seed);
  const value = frac < 0.35 ? 0 : Math.round(frac * frac * 14);
  const d = new Date(2026, 0, 1 + i);
  return { date: d.toISOString().slice(0, 10), value };
});

// A small 2D grid: rows are metrics, columns are time buckets.
const grid = [
  [0, 2, 5, 9, 6, 3],
  [1, 1, 4, 8, 12, 7],
  [0, 0, 2, 3, 5, 4],
  [3, 6, 6, 9, 11, 10],
];

export function HeatmapPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.hmName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.hmLede))}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.hmAnatomyIntro)}</Text>
      <ComponentBlueprint specId="heatmap" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.hmEx1Title)}
        description={t(m.hmEx1Desc)}
        component="Heatmap"
        platformLayout="stacked"
        render={(K) => (
          <K.Heatmap aria-label={t(m.hmAriaContributions)} data={days} legend />
        )}
        code={`import { Heatmap } from '@glacier/react';

const days = [
  { date: '2026-01-01', value: 0 },
  { date: '2026-01-02', value: 4 },
  { date: '2026-01-03', value: 9 },
  // …one entry per day
];

<Heatmap aria-label="Contributions in the last 26 weeks" data={days} legend />`}
      />

      <Example
        title={t(m.hmEx2Title)}
        description={t(m.hmEx2Desc)}
        component="Heatmap"
        platformLayout="stacked"
        render={(K) => (
          <K.Heatmap aria-label={t(m.hmAriaActivityMetric)} data={grid} legend />
        )}
        code={`const grid = [
  [0, 2, 5, 9, 6, 3],
  [1, 1, 4, 8, 12, 7],
  [0, 0, 2, 3, 5, 4],
  [3, 6, 6, 9, 11, 10],
];

<Heatmap aria-label="Activity by metric and week" data={grid} legend />`}
      />

      <Example
        title={t(m.hmEx3Title)}
        description={t(m.hmEx3Desc)}
        component="Heatmap"
        platformLayout="stacked"
        render={(K) => (
          <K.Heatmap aria-label={t(m.hmAriaLoad)} data={grid} levels={3} legend />
        )}
        code={`<Heatmap aria-label="Load" data={grid} levels={3} legend />`}
      />

      <Example
        title={t(m.exSkeleton)}
        description={prose(t(m.hmEx4Desc))}
        component="Heatmap"
        platformLayout="stacked"
        render={(K) => (
          <div style={{ display: 'grid', gap: 'var(--glacier-space-4)' }}>
            <K.Heatmap skeleton data={[]} aria-label={t(m.hmAriaActivity)} />
            <K.Heatmap skeleton skeletonColumns={26} rows={5} data={[]} aria-label={t(m.hmAriaHalfYear)} />
          </div>
        )}
        code={`<Heatmap skeleton data={[]} aria-label="Activity" />
<Heatmap skeleton skeletonColumns={26} rows={5} data={[]} aria-label="Half a year" />`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'data', type: 'number[][] | { date: string; value: number }[]', description: t(m.hmPropData) },
          { name: 'levels', type: 'number', default: '5', description: t(m.hmPropLevels) },
          { name: 'legend', type: 'boolean', default: 'false', description: t(m.hmPropLegend) },
          { name: 'rows', type: 'number', default: '7', description: t(m.hmPropRows) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(m.hmPropSkeleton) },
          { name: 'skeletonColumns', type: 'number', default: '12', description: t(m.hmPropSkeletonColumns) },
          { name: 'aria-label', type: 'string', description: t(m.hmPropAriaLabel) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.hmA11y1))}</li>
        <li>{prose(t(m.hmA11y2))}</li>
        <li>{t(m.hmA11y3)}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{t(m.hmUse1)}</li>
        <li>{t(m.hmUse2)}</li>
        <li>{t(m.hmUse3)}</li>
      </ul>
    </>
  );
}
