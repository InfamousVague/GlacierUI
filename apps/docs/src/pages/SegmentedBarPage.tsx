import { SegmentedBar, Stack, Text } from '@perfect/react';
import { Example, PropsTable } from '../docs-ui.tsx';

export function SegmentedBarPage() {
  return (
    <>
      <h1>Segmented Bar</h1>
      <p className="lede">
        A single proportional bar split into slices sized by share of the total, for a breakdown of
        parts such as a storage or budget split. Unlike Meter, which is discrete equal pips for a
        level, SegmentedBar shows a continuous composition.
      </p>

      <h2>Examples</h2>

      <Example
        title="Proportional slices"
        description="Each slice takes a width equal to its share of the total. The remaining track shows through as the background."
        code={`import { SegmentedBar } from '@perfect/react';

<SegmentedBar
  aria-label="Storage by type"
  data={[
    { value: 40, tone: 'accent', label: 'Photos' },
    { value: 25, tone: 'success', label: 'Video' },
    { value: 15, tone: 'warning', label: 'Docs' },
  ]}
/>`}
      >
        <Stack gap={4} maxWidth="xs" width="full">
          <SegmentedBar
            aria-label="Storage by type"
            data={[
              { value: 40, tone: 'accent', label: 'Photos' },
              { value: 25, tone: 'success', label: 'Video' },
              { value: 15, tone: 'warning', label: 'Docs' },
            ]}
          />
          <Text size="xs" tone="subtle">
            80 of 100 GB used
          </Text>
        </Stack>
      </Example>

      <Example
        title="Neutral remainder"
        description="A neutral slice renders in the track color, which reads as unused or unallocated space alongside the colored parts."
        code={`<SegmentedBar
  aria-label="Budget spent"
  data={[
    { value: 60, tone: 'accent', label: 'Spent' },
    { value: 40, tone: 'neutral', label: 'Remaining' },
  ]}
/>`}
      >
        <Stack gap={4} maxWidth="xs" width="full">
          <SegmentedBar
            aria-label="Budget spent"
            data={[
              { value: 60, tone: 'accent', label: 'Spent' },
              { value: 40, tone: 'neutral', label: 'Remaining' },
            ]}
          />
        </Stack>
      </Example>

      <Example
        title="Sizes and square ends"
        description="size sets the thickness, and rounded toggles the full-radius ends. Slices with a value of 0 are omitted."
        code={`<SegmentedBar aria-label="Small" size="sm" data={data} />
<SegmentedBar aria-label="Square" rounded={false} data={data} />`}
      >
        <Stack gap={4} maxWidth="xs" width="full">
          <SegmentedBar
            aria-label="Small breakdown"
            size="sm"
            data={[
              { value: 50, tone: 'success' },
              { value: 30, tone: 'warning' },
              { value: 20, tone: 'danger' },
            ]}
          />
          <SegmentedBar
            aria-label="Square breakdown"
            rounded={false}
            data={[
              { value: 50, tone: 'success' },
              { value: 30, tone: 'warning' },
              { value: 20, tone: 'danger' },
            ]}
          />
        </Stack>
      </Example>

      <Example
        title="Skeleton"
        description="The skeleton prop reserves a full-width bar at the same thickness, so the row holds its space while data loads."
        code={`<SegmentedBar skeleton data={[]} />
<SegmentedBar skeleton size="sm" data={[]} />`}
      >
        <Stack gap={4} maxWidth="xs" width="full">
          <SegmentedBar skeleton data={[]} />
          <SegmentedBar skeleton size="sm" data={[]} />
        </Stack>
      </Example>

      <h2>Props</h2>
      <PropsTable
        props={[
          { name: 'data', type: 'Array<{ value: number; tone?: SegmentedBarTone; label?: string }>', description: 'Slices sized by proportion of the total. Zero-value slices are omitted.' },
          { name: 'size', type: "'sm' | 'md'", default: "'md'", description: 'Bar thickness: sm 0.375rem, md 0.625rem.' },
          { name: 'rounded', type: 'boolean', default: 'true', description: 'Round the bar ends with a full radius.' },
          { name: 'skeleton', type: 'boolean', default: 'false', description: "Renders a placeholder with the component's exact geometry." },
          { name: 'aria-label', type: 'string', description: 'Accessible name. Falls back to a generated breakdown of the slices.' },
        ]}
      />

      <h2>Accessibility</h2>
      <ul>
        <li>
          SegmentedBar renders <code>role="img"</code> with an <code>aria-label</code>. Without one,
          it generates a summary of the slice percentages.
        </li>
        <li>Label each slice in the data so the generated summary reads meaningfully.</li>
        <li>
          Tone alone should not carry meaning; pair the bar with a legend or the numbers it
          summarizes.
        </li>
      </ul>

      <h2>Usage</h2>
      <ul>
        <li>Use SegmentedBar for a continuous breakdown of parts of a whole, like a storage or budget split.</li>
        <li>Use Meter instead for a single level shown as discrete equal pips, such as password strength.</li>
        <li>Give the neutral tone to a remainder or unallocated slice so it recedes into the track.</li>
        <li>Keep the slice count low so each share stays wide enough to read.</li>
      </ul>
    </>
  );
}
