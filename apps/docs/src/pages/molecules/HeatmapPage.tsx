import { Heatmap, Heading, Text, Size, TextTone } from '@glacier/react';
import { Example, PropsTable } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';

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
  return (
    <>
      <Heading level={1}>Heatmap</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        A GitHub-contribution-style intensity grid. It takes values - a 2D array or a flat list of{' '}
        <code>{'{ date, value }'}</code> points - and buckets each onto the accent ramp, from a bare
        track at level 0 up through saturated tiles. Every cell is titled with its value, and an
        optional legend spells out the less→more scale.
      </Text>

      <Heading level={2}>Anatomy</Heading>
      <Text tone={TextTone.Muted}>A schematic of the anatomy with the exact spec measurements labelled.</Text>
      <ComponentBlueprint specId="heatmap" />

      <Heading level={2}>Examples</Heading>

      <Example
        title="Contribution grid"
        description="A flat { date, value } list chunks into weekly columns of seven cells. Hover a cell to read its date and count."
        code={`import { Heatmap } from '@glacier/react';

const days = [
  { date: '2026-01-01', value: 0 },
  { date: '2026-01-02', value: 4 },
  { date: '2026-01-03', value: 9 },
  // …one entry per day
];

<Heatmap aria-label="Contributions in the last 26 weeks" data={days} legend />`}
      >
        <Heatmap aria-label="Contributions in the last 26 weeks" data={days} legend />
      </Example>

      <Example
        title="2D array"
        description="A number[][] grid reads across (a row per series) and down (a column per bucket); the top value in the data sets full intensity."
        code={`const grid = [
  [0, 2, 5, 9, 6, 3],
  [1, 1, 4, 8, 12, 7],
  [0, 0, 2, 3, 5, 4],
  [3, 6, 6, 9, 11, 10],
];

<Heatmap aria-label="Activity by metric and week" data={grid} legend />`}
      >
        <Heatmap aria-label="Activity by metric and week" data={grid} legend />
      </Example>

      <Example
        title="Fewer levels"
        description="levels controls how many buckets the scale is quantised into - three here for a coarse cold / warm / hot read."
        code={`<Heatmap aria-label="Load" data={grid} levels={3} legend />`}
      >
        <Heatmap aria-label="Load" data={grid} levels={3} legend />
      </Example>

      <Heading level={2}>Props</Heading>
      <PropsTable
        props={[
          { name: 'data', type: 'number[][] | { date: string; value: number }[]', description: 'Required. Values to plot: a 2D grid or a flat dated list.' },
          { name: 'levels', type: 'number', default: '5', description: 'Number of intensity steps, including the empty step 0.' },
          { name: 'legend', type: 'boolean', default: 'false', description: 'Show a less→more legend under the grid.' },
          { name: 'rows', type: 'number', default: '7', description: 'Cells per column when data is a flat list.' },
          { name: 'aria-label', type: 'string', description: 'Accessible name for the grid.' },
        ]}
      />

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>
          The grid is a single <code>role="img"</code> named by <code>aria-label</code>; pass one so the
          picture has a name. When a legend is shown it describes the grid via <code>aria-describedby</code>.
        </li>
        <li>
          Every cell carries a native <code>title</code> and a visually-hidden text node, so its date and
          value are legible to both pointer and screen-reader users.
        </li>
        <li>
          Intensity is never conveyed by colour alone - the underlying value is always available as text.
        </li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>Reach for a Heatmap to show the shape of activity over time or across two axes, not exact figures.</li>
        <li>Use a flat dated list for a calendar-style grid; use a 2D array when rows and columns are your own axes.</li>
        <li>Keep the level count low (3–5) so the buckets stay distinguishable; the legend then reads at a glance.</li>
      </ul>
    </>
  );
}
