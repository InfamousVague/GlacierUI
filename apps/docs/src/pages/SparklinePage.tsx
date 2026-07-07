import { Sparkline, Text } from '@perfect/react';
import { Example, PropsTable } from '../docs-ui.tsx';

const REVENUE = [12, 18, 9, 22, 17, 28, 24, 31];
const TRAFFIC = [4, 6, 5, 9, 7, 12, 10, 14, 11, 16];

export function SparklinePage() {
  return (
    <>
      <h1>Sparkline</h1>
      <p className="lede">
        A minimal inline chart: a compact trend with no axes, labels, or grid. Set it beside a
        number to show shape at a glance, such as a metric's recent history. For a single level use
        Meter, and for task progress use ProgressBar.
      </p>

      <h2>Examples</h2>

      <Example
        title="Line"
        description="The default line variant draws a polyline normalized to the height. Give it an aria-label, since the series carries no text."
        code={`import { Sparkline } from '@perfect/react';

<Sparkline aria-label="Weekly revenue" data={[12, 18, 9, 22, 17, 28, 24, 31]} />`}
      >
        <div className="row" style={{ alignItems: 'center', gap: '0.75rem' }}>
          <Sparkline aria-label="Weekly revenue" data={REVENUE} />
          <Text size="sm" mono>
            +31
          </Text>
        </div>
      </Example>

      <Example
        title="Bar"
        description="The bar variant draws evenly spaced columns. Both variants take a width and height in pixels."
        code={`<Sparkline aria-label="Daily traffic" data={[4, 6, 5, 9, 7, 12, 10, 14, 11, 16]} variant="bar" width={140} />`}
      >
        <Sparkline aria-label="Daily traffic" data={TRAFFIC} variant="bar" width={140} />
      </Example>

      <Example
        title="Tones"
        description="Four tones follow the status ramps. Pin one when the trend has fixed meaning."
        code={`<Sparkline aria-label="Accent" data={data} />
<Sparkline aria-label="Success" data={data} tone="success" />
<Sparkline aria-label="Warning" data={data} tone="warning" />
<Sparkline aria-label="Danger" data={data} tone="danger" variant="bar" />`}
      >
        <div className="row" style={{ alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Sparkline aria-label="Accent trend" data={REVENUE} />
          <Sparkline aria-label="Success trend" data={REVENUE} tone="success" />
          <Sparkline aria-label="Warning trend" data={REVENUE} tone="warning" />
          <Sparkline aria-label="Danger trend" data={REVENUE} tone="danger" variant="bar" />
        </div>
      </Example>

      <Example
        title="Sparse data"
        description="Empty and single-point series render without crashing: an empty chart holds its space and a lone point sits centered."
        code={`<Sparkline aria-label="No data yet" data={[]} />
<Sparkline aria-label="One reading" data={[5]} />`}
      >
        <div className="row" style={{ alignItems: 'center', gap: '1rem' }}>
          <Sparkline aria-label="No data yet" data={[]} />
          <Sparkline aria-label="One reading" data={[5]} />
        </div>
      </Example>

      <Example
        title="Skeleton"
        description="The skeleton prop reserves the same width and height, so the chart holds its space while data loads."
        code={`<Sparkline skeleton data={[]} />
<Sparkline skeleton data={[]} variant="bar" width={140} />`}
      >
        <div className="row" style={{ alignItems: 'center', gap: '1rem' }}>
          <Sparkline aria-label="Weekly revenue" data={REVENUE} />
          <Sparkline skeleton data={[]} />
          <Sparkline skeleton data={[]} width={140} />
        </div>
      </Example>

      <h2>Props</h2>
      <PropsTable
        props={[
          { name: 'data', type: 'number[]', description: 'The series to plot. Empty and single-point data render gracefully.' },
          { name: 'variant', type: "'line' | 'bar'", default: "'line'", description: 'line draws a polyline; bar draws evenly spaced columns.' },
          { name: 'width', type: 'number', default: '120', description: 'SVG width in pixels.' },
          { name: 'height', type: 'number', default: '32', description: 'SVG height in pixels. Data is normalized to this height.' },
          { name: 'tone', type: "'accent' | 'success' | 'warning' | 'danger'", default: "'accent'", description: 'Stroke or fill color from the status ramps.' },
          { name: 'skeleton', type: 'boolean', default: 'false', description: "Renders a placeholder with the component's exact geometry." },
          { name: 'aria-label', type: 'string', default: "'Sparkline'", description: 'Accessible name for the chart.' },
        ]}
      />

      <h2>Accessibility</h2>
      <ul>
        <li>
          Sparkline renders <code>role="img"</code> with the <code>aria-label</code>; the SVG
          contents are decorative.
        </li>
        <li>Pass a descriptive aria-label, since the trend carries no text of its own.</li>
        <li>
          Do not rely on the chart alone to convey a critical value; pair it with the number it
          summarizes.
        </li>
      </ul>

      <h2>Usage</h2>
      <ul>
        <li>Use a Sparkline to show trend and shape, not exact values; place the precise figure next to it.</li>
        <li>Keep the series short so the shape stays legible at inline size.</li>
        <li>Reach for the bar variant for discrete counts and the line variant for continuous series.</li>
        <li>Sparkline stays presentation-only: fetching and shaping the data belongs to the app.</li>
      </ul>
    </>
  );
}
