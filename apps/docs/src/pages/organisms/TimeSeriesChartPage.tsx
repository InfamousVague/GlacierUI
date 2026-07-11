import { Heading, Text, TextTone, TimeSeriesChart, Size } from '@glacier/react';
import { useEffect, useState } from 'react';
import { Example, PropsTable } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';

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

function StreamingDemo() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const now = DOC_END + tick * 1000;
  const times = Array.from({ length: 60 }, (_, i) => now - (59 - i) * 1000);
  const shift = (arr: number[]) => arr.map((_, i) => arr[(i + tick) % arr.length]);
  return (
    <TimeSeriesChart
      times={times}
      series={[
        { id: 'user', label: 'User', values: shift(USER) },
        { id: 'system', label: 'System', values: shift(SYSTEM) },
      ]}
      max={60}
      formatValue={(v) => `${v}%`}
      height="10rem"
      aria-label="CPU usage, streaming, last minute"
    />
  );
}

export function TimeSeriesChartPage() {
  return (
    <>
      <Heading level={1}>Time Series Chart</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        A streaming time-series plot for telemetry: one shared time axis, a handful of series drawn
        as thin lines or soft areas, a crosshair with a value readout on hover, and a legend that
        never repaints survivors when series toggle. Canvas-rendered via uPlot, so a one-second
        feed stays cheap. For a word-sized trend with no axes, use Sparkline instead.
      </Text>

      <Heading level={2}>Anatomy</Heading>
      <Text tone={TextTone.Muted}>An inspection with the exact spec measurements labelled on the figure.</Text>
      <ComponentBlueprint specId="time-series-chart" />

      <Heading level={2}>Examples</Heading>

      <Example
        title="Streaming"
        description="New samples slide in without rebuilding the plot. Pin max (here 60%) so successive frames share one scale — a calm minute and a busy one must not look identical. Hover for the crosshair and per-series readout."
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
      >
        <StreamingDemo />
      </Example>

      <Example
        title="Areas and unit formatting"
        description="The area shape grounds a dominant series; formatValue owns the axis and readout units. Series take inks from the fixed categorical order — hiding one never recolors the rest."
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
      >
        <TimeSeriesChart
          times={TIMES}
          series={[
            { id: 'in', label: 'Received', values: NET_IN },
            { id: 'out', label: 'Sent', values: NET_OUT },
          ]}
          shape="area"
          formatValue={formatBytesPerSecond}
          height="10rem"
          aria-label="Network throughput, last minute"
        />
      </Example>

      <Example
        title="Empty and skeleton"
        description="Before the first sample the plot keeps its box and says so; skeleton mirrors the exact geometry while a recording loads."
        code={`<TimeSeriesChart times={[]} series={[]} emptyLabel="No samples yet" aria-label="CPU usage" />
<TimeSeriesChart times={[]} series={[]} skeleton aria-label="CPU usage" />`}
      >
        <div style={{ display: 'grid', gap: 'var(--glacier-space-4)', width: '100%' }}>
          <TimeSeriesChart times={[]} series={[]} height="6rem" emptyLabel="No samples yet" aria-label="Empty chart" />
          <TimeSeriesChart times={[]} series={[]} height="6rem" skeleton aria-label="Loading chart" />
        </div>
      </Example>

      <Heading level={2}>Props</Heading>
      <PropsTable
        props={[
          { name: 'times', type: 'number[]', description: 'Required. Shared time axis, epoch ms, oldest first.' },
          { name: 'series', type: '{ id, label, values, tone? }[]', description: 'Required. The plotted series, values aligned to times (null for gaps).' },
          { name: 'shape', type: "'line' | 'area'", default: "'line'", description: 'Thin lines, or lines over a translucent soft fill.' },
          { name: 'min', type: 'number', default: '0', description: 'Fixed lower bound of the value axis.' },
          { name: 'max', type: 'number', description: 'Fixed upper bound; pin it so frames share one scale.' },
          { name: 'formatValue', type: '(v: number) => string', description: 'Formats the y axis and readout values.' },
          { name: 'formatTime', type: '(t: number) => string', description: 'Formats the x axis and readout times.' },
          { name: 'showLegend', type: 'boolean', default: 'true', description: 'Legend appears for two or more series.' },
          { name: 'height', type: 'string', default: "'12rem'", description: 'Plot height; width follows the container.' },
          { name: 'emptyLabel', type: 'string', default: "'No samples yet'", description: 'Message while times is empty.' },
          { name: 'skeleton', type: 'boolean', default: 'false', description: 'Renders a placeholder with the exact geometry.' },
          { name: 'aria-label', type: 'string', description: 'Required. What the chart plots.' },
        ]}
      />

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>The plot is a single <code>img</code>-role graphic named by the required <code>aria-label</code>; the hover readout is a visual affordance, not the accessible surface.</li>
        <li>Values must be reachable without the pointer — pair the chart with stat tiles or a table carrying the current figures.</li>
        <li>Series identity never rides on color alone: the legend and readout name every series.</li>
        <li>Legend toggles are real buttons with <code>aria-pressed</code>; hiding a series never recolors the others.</li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>Keep it to a handful of series; roll the tail into an "other" series in gray.</li>
        <li>Never plot two units on one chart — two measures of different scale want two charts, not a second axis.</li>
        <li>Pin <code>max</code> for bounded units (percent), and let unbounded units (bytes/s) autoscale from zero.</li>
        <li>One-second feeds: keep <code>times</code> a sliding window (a few hundred samples) rather than an unbounded array.</li>
      </ul>
    </>
  );
}
