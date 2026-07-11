import { Heading, Sparkline, StatTile, Text, TextTone, Size } from '@glacier/react';
import { useEffect, useState } from 'react';
import { Example, PropsTable } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';

/** A deterministic wavy series so every reload draws the same docs. */
function wave(count: number, seed: number): number[] {
  return Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1);
    return 50 + 32 * Math.sin(t * Math.PI * 2 + seed) + 12 * Math.sin(t * Math.PI * 7 + seed * 3);
  });
}

const TREND = wave(32, 1.2);
const SPIKY = wave(32, 4.1).map((v, i) => (i % 9 === 4 ? v + 28 : v));
const CLIMB = Array.from({ length: 32 }, (_, i) => 18 + i * 2.2 + 8 * Math.sin(i / 2.5));

function StreamingSparkline() {
  const [data, setData] = useState(() => wave(40, 2.5));
  useEffect(() => {
    const id = setInterval(() => {
      setData((prev) => {
        const t = prev.length;
        const next = 50 + 32 * Math.sin(t / 6.4) + 12 * Math.sin(t / 1.9);
        return [...prev.slice(1), next];
      });
    }, 500);
    return () => clearInterval(id);
  }, []);
  return <Sparkline data={data} min={0} max={100} endPoint aria-label="Live signal, last 20 seconds" />;
}

export function SparklinePage() {
  return (
    <>
      <Heading level={1}>Sparkline</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        A word-sized trend graphic: a single series drawn as a thin line, a soft-filled area, or
        micro bars, for table cells, stat tiles, and dense monitoring rows. It carries no axes or
        labels — the surrounding text does the naming — and it is an impression, not a reading:
        pair it with a text value that carries the actual figure.
      </Text>

      <Heading level={2}>Anatomy</Heading>
      <Text tone={TextTone.Muted}>An inspection with the exact spec measurements labelled on the figure.</Text>
      <ComponentBlueprint specId="sparkline" />

      <Heading level={2}>Examples</Heading>

      <Example
        title="Shapes"
        description="A thin line for most rows; an area when the series is the star of its tile; micro bars when samples are discrete (requests per minute, dropped frames)."
        code={`<Sparkline data={cpu} aria-label="CPU, last 5 minutes" />
<Sparkline data={cpu} shape="area" aria-label="CPU, last 5 minutes" />
<Sparkline data={cpu} shape="bars" aria-label="CPU, last 5 minutes" />`}
      >
        <div style={{ display: 'grid', gap: 'var(--glacier-space-4)', width: '14rem' }}>
          <Sparkline data={TREND} aria-label="CPU, line" />
          <Sparkline data={TREND} shape="area" aria-label="CPU, area" />
          <Sparkline data={TREND} shape="bars" aria-label="CPU, bars" />
        </div>
      </Example>

      <Example
        title="Pinned domain and a baseline"
        description="Pin min/max so rows in a column share one scale (a flat line at 100% should hug the top, not the middle), and draw a dashed baseline at a limit worth watching."
        code={`<Sparkline data={memory} min={0} max={100} baseline={80} tone="warning" aria-label="Memory, last hour" />`}
      >
        <div style={{ width: '14rem' }}>
          <Sparkline data={SPIKY} min={0} max={130} baseline={100} tone="warning" size="lg" aria-label="Memory with limit" />
        </div>
      </Example>

      <Example
        title="Streaming with an end point"
        description="endPoint marks the newest sample. New data redraws without animation, so a one-second feed never shimmers."
        code={`<Sparkline data={window} min={0} max={100} endPoint aria-label="Live signal" />`}
      >
        <div style={{ width: '14rem' }}>
          <StreamingSparkline />
        </div>
      </Example>

      <Example
        title="In a stat tile"
        description="The classic pairing: the tile's value carries the reading, the sparkline carries the shape of the last hour."
        code={`<StatTile
  value="42%"
  label="CPU"
  hint={<Sparkline data={cpu} min={0} max={100} aria-label="CPU, last hour" style={{ width: '5rem' }} />}
/>`}
      >
        <div style={{ display: 'flex', gap: 'var(--glacier-space-4)' }}>
          <StatTile value="42%" label="CPU" hint={<Sparkline data={TREND} min={0} max={100} aria-label="CPU trend" style={{ width: '5rem' }} />} />
          <StatTile value="6.1 GB" label="Memory" hint={<Sparkline data={CLIMB} tone="danger" aria-label="Memory trend" style={{ width: '5rem' }} />} />
        </div>
      </Example>

      <Example
        title="Glass"
        description="glass mounts the mark on the frosted material - a word-sized frosted tile for HUDs and overlays."
        code={`<Sparkline data={cpu} min={0} max={100} glass aria-label="CPU, last hour" />`}
      >
        <div
          style={{
            width: '18rem',
            padding: 'var(--glacier-space-5)',
            borderRadius: 'var(--glacier-radius-lg)',
            background: 'linear-gradient(120deg, var(--glacier-accent-soft), var(--glacier-purple-4), var(--glacier-teal-4))',
            display: 'grid',
            gap: 'var(--glacier-space-3)',
          }}
        >
          <Sparkline data={TREND} min={0} max={100} glass aria-label="CPU, glass" />
          <Sparkline data={SPIKY} min={0} max={130} shape="area" glass aria-label="Memory, glass" />
        </div>
      </Example>

      <Example
        title="Skeleton"
        description="skeleton renders a placeholder with the exact height of the chosen size."
        code={`<Sparkline data={[]} skeleton aria-label="Loading trend" />`}
      >
        <div style={{ width: '14rem' }}>
          <Sparkline data={[]} skeleton aria-label="Loading trend" />
        </div>
      </Example>

      <Heading level={2}>Props</Heading>
      <PropsTable
        props={[
          { name: 'data', type: 'number[]', description: 'Required. The series, oldest first; window it yourself.' },
          { name: 'min', type: 'number', description: 'Fixed lower bound. Defaults to the data minimum.' },
          { name: 'max', type: 'number', description: 'Fixed upper bound. Defaults to the data maximum.' },
          { name: 'baseline', type: 'number', description: 'Dashed reference line at this value when inside the domain.' },
          { name: 'shape', type: "'line' | 'area' | 'bars'", default: "'line'", description: 'How the series is marked.' },
          { name: 'tone', type: "'accent' | 'neutral' | 'success' | 'warning' | 'danger' | 'info'", default: "'accent'", description: 'Ink family for the mark.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Height step; width follows the container.' },
          { name: 'endPoint', type: 'boolean', default: 'false', description: 'Marks the newest sample with a dot.' },
          { name: 'glass', type: 'boolean', default: 'false', description: 'Mounts the mark on the frosted glass material.' },
          { name: 'skeleton', type: 'boolean', default: 'false', description: 'Renders a placeholder with the exact geometry.' },
          { name: 'aria-label', type: 'string', description: 'Required. Describe the trend, not the pixels.' },
        ]}
      />

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>The drawing is a single <code>img</code>-role graphic named by the required <code>aria-label</code>; individual samples are not exposed.</li>
        <li>Never let the sparkline be the only carrier of a fact: pair it with a text value, and never encode meaning in color alone.</li>
        <li>Static by design — no animation, so there are no reduced-motion concerns.</li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>Pin <code>min</code>/<code>max</code> whenever sparklines sit in a column, so every row shares one scale.</li>
        <li>Keep it word-sized: a sparkline that needs axes, a legend, or a tooltip wants to be a TimeSeriesChart instead.</li>
        <li>Reserve non-accent tones for meaning (danger for over-limit, neutral for secondary rows), not decoration.</li>
        <li>Use bars for discrete counts and line/area for continuous signals.</li>
      </ul>
    </>
  );
}
