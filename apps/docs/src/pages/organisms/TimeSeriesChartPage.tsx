import { Heading, Text, TextTone, Size, useT } from '@glacier/react';
import { useEffect, useState } from 'react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { type PlatformKit } from '../../platforms.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

const DOC_END = Date.UTC(2026, 6, 11, 14, 30, 0);

/** A deterministic minute of second-resolution samples. */
function samples(count: number, seed: number, base: number, swing: number): number[] {
  return Array.from({ length: count }, (_, i) => {
    const v = base + swing * Math.sin(i / 8 + seed) + (swing / 3) * Math.sin(i / 2.1 + seed * 7);
    return Math.max(Math.round(v * 10) / 10, 0);
  });
}

const TIMES = Array.from({ length: 60 }, (_, i) => DOC_END - (59 - i) * 1000);
const USER = samples(60, 1.3, 32, 14);
const SYSTEM = samples(60, 4.7, 12, 6);
const NET_IN = samples(60, 2.2, 42, 30).map((v) => v * 1024 * 128);
const NET_OUT = samples(60, 5.9, 12, 9).map((v) => v * 1024 * 128);

function formatBytesPerSecond(v: number): string {
  if (v >= 1 << 20) return `${(v / (1 << 20)).toFixed(1)} MB/s`;
  if (v >= 1 << 10) return `${(v / (1 << 10)).toFixed(0)} KB/s`;
  return `${Math.round(v)} B/s`;
}

function StreamingDemo({ K }: { K: PlatformKit }) {
  const t = useT();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const now = DOC_END + tick * 1000;
  const times = Array.from({ length: 60 }, (_, i) => now - (59 - i) * 1000);
  const shift = (arr: number[]) => arr.map((_, i) => arr[(i + tick) % arr.length] ?? 0);
  return (
    <K.TimeSeriesChart
      times={times}
      series={[
        { id: 'user', label: t(m.timeseriesUser), values: shift(USER) },
        { id: 'system', label: t(m.timeseriesSystem), values: shift(SYSTEM) },
      ]}
      max={60}
      formatValue={(v) => `${v}%`}
      height="10rem"
      aria-label={t(m.tscAriaStreaming)}
    />
  );
}

export function TimeSeriesChartPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.tscName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.tscLede))}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.anatomyIntro)}</Text>
      <ComponentBlueprint specId="time-series-chart" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.tscEx1Title)}
        description={t(m.tscEx1Desc)}
        component="TimeSeriesChart"
        render={(K) => <StreamingDemo K={K} />}
        code={`<TimeSeriesChart
  times={lastMinute}
  series={[
    { id: 'user', label: 'User', values: user },
    { id: 'system', label: 'System', values: system },
  ]}
  max={60}
  formatValue={(v) => \`\${v}%\`}
  aria-label="CPU usage, last minute"
/>`}
      />

      <Example
        title={t(m.tscEx2Title)}
        description={t(m.tscEx2Desc)}
        component="TimeSeriesChart"
        render={(K) => (
          <K.TimeSeriesChart
            times={TIMES}
            series={[
              { id: 'in', label: t(m.timeseriesReceived), values: NET_IN },
              { id: 'out', label: t(m.timeseriesSent), values: NET_OUT },
            ]}
            shape="area"
            formatValue={formatBytesPerSecond}
            height="10rem"
            aria-label={t(m.tscAriaNetwork)}
          />
        )}
        code={`<TimeSeriesChart
  times={times}
  series={[
    { id: 'in', label: 'Received', values: bytesIn },
    { id: 'out', label: 'Sent', values: bytesOut },
  ]}
  shape="area"
  formatValue={formatBytesPerSecond}
  aria-label="Network throughput, last minute"
/>`}
      />

      <Example
        title={t(m.exGlass)}
        description={t(m.tscEx3Desc)}
        component="TimeSeriesChart"
        render={(K) => (
          <div
            style={{
              width: '100%',
              padding: 'var(--glacier-space-5)',
              borderRadius: 'var(--glacier-radius-lg)',
              background: 'linear-gradient(120deg, var(--glacier-accent-soft), var(--glacier-purple-4), var(--glacier-teal-4))',
            }}
          >
            <K.TimeSeriesChart
              times={TIMES}
              series={[
                { id: 'user', label: t(m.timeseriesUser), values: USER },
                { id: 'system', label: t(m.timeseriesSystem), values: SYSTEM },
              ]}
              max={60}
              formatValue={(v) => `${v}%`}
              height="9rem"
              glass
              aria-label={t(m.tscAriaGlass)}
            />
          </div>
        )}
        code={`<TimeSeriesChart times={times} series={series} glass aria-label="CPU usage" />`}
      />

      <Example
        title={t(m.tscEx4Title)}
        description={t(m.tscEx4Desc)}
        component="TimeSeriesChart"
        render={(K) => (
          <div style={{ display: 'grid', gap: 'var(--glacier-space-4)', width: '100%' }}>
            <K.TimeSeriesChart times={[]} series={[]} height="6rem" emptyLabel={t(m.tscDemoEmptyLabel)} aria-label={t(m.tscAriaEmpty)} />
            <K.TimeSeriesChart times={[]} series={[]} height="6rem" skeleton aria-label={t(m.tscAriaLoading)} />
          </div>
        )}
        code={`<TimeSeriesChart times={[]} series={[]} emptyLabel="No samples yet" aria-label="CPU usage" />
<TimeSeriesChart times={[]} series={[]} skeleton aria-label="CPU usage" />`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'times', type: 'number[]', description: t(m.tscPropTimes) },
          { name: 'series', type: '{ id, label, values, tone? }[]', description: t(m.tscPropSeries) },
          { name: 'shape', type: "'line' | 'area'", default: "'line'", description: t(m.tscPropShape) },
          { name: 'min', type: 'number', default: '0', description: t(m.tscPropMin) },
          { name: 'max', type: 'number', description: t(m.tscPropMax) },
          { name: 'formatValue', type: '(v: number) => string', description: t(m.tscPropFormatValue) },
          { name: 'formatTime', type: '(t: number) => string', description: t(m.tscPropFormatTime) },
          { name: 'showLegend', type: 'boolean', default: 'true', description: t(m.tscPropShowLegend) },
          { name: 'height', type: 'string', default: "'12rem'", description: t(m.tscPropHeight) },
          { name: 'emptyLabel', type: 'string', default: "'No samples yet'", description: t(m.tscPropEmptyLabel) },
          { name: 'glass', type: 'boolean', default: 'false', description: t(m.tscPropGlass) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(m.tscPropSkeleton) },
          { name: 'aria-label', type: 'string', description: t(m.tscPropAriaLabel) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.tscA11y1))}</li>
        <li>{prose(t(m.tscA11y2))}</li>
        <li>{prose(t(m.tscA11y3))}</li>
        <li>{prose(t(m.tscA11y4))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.tscUse1))}</li>
        <li>{prose(t(m.tscUse2))}</li>
        <li>{prose(t(m.tscUse3))}</li>
        <li>{prose(t(m.tscUse4))}</li>
      </ul>
    </>
  );
}
