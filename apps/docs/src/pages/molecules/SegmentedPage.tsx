import { useState } from 'react';
import { Box, Row, SegmentedControl, Stack, Heading, Text, Size, TextTone } from '@glacier/react';
import { Spring } from '@glacier/motion';
import { Example, PropsTable } from '../../docs-ui.tsx';

export function SegmentedPage() {
  const [view, setView] = useState('week');

  return (
    <>
      <Heading level={1}>Segmented Control</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        A segmented control presents two to five mutually exclusive options as a single track with
        a sliding thumb. Use it to switch between views of the same content, like list and grid or
        day and week.
      </Text>

      <Heading level={2}>Examples</Heading>

      <Example
        title="Basic"
        description={
          <>
            Pass an <code>options</code> array and an <code>aria-label</code> that names the group.
            Without a <code>value</code> or <code>defaultValue</code>, the first enabled option is
            selected.
          </>
        }
        code={`import { SegmentedControl } from '@glacier/react';

<SegmentedControl
  aria-label="Chart range"
  options={[
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
  ]}
/>`}
      >
        <SegmentedControl
          aria-label="Chart range"
          options={[
            { value: 'day', label: 'Day' },
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
          ]}
        />
      </Example>

      <Example
        title="Controlled"
        description={
          <>
            Pair <code>value</code> with <code>onValueChange</code> to own the selection. The
            selected value below drives the text next to the control.
          </>
        }
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
      >
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
        </Row>
      </Example>

      <Example
        title="Spring presets"
        description={
          <>
            The <code>spring</code> prop sets the physics of the thumb transition. Click between
            segments in each row to compare. <code>Spring.Snappy</code> is the default and settles
            fastest, <code>Spring.Smooth</code> is softer and slower, <code>Spring.Bouncy</code>{' '}
            overshoots before settling.
          </>
        }
        code={`import { Spring } from '@glacier/motion';

<SegmentedControl spring={Spring.Snappy} aria-label="Snappy demo" options={options} />
<SegmentedControl spring={Spring.Smooth} aria-label="Smooth demo" options={options} />
<SegmentedControl spring={Spring.Bouncy} aria-label="Bouncy demo" options={options} />`}
      >
        <Stack gap={4}>
          {(
            [
              ['Snappy', Spring.Snappy],
              ['Smooth', Spring.Smooth],
              ['Bouncy', Spring.Bouncy],
            ] as const
          ).map(([name, preset]) => (
            <Row key={name} gap={4} wrap>
              <span style={{ width: '4.5rem' }}>{name}</span>
              <SegmentedControl
                aria-label={`${name} spring demo`}
                spring={preset}
                options={[
                  { value: 'one', label: 'One' },
                  { value: 'two', label: 'Two' },
                  { value: 'three', label: 'Three' },
                ]}
              />
            </Row>
          ))}
        </Stack>
      </Example>

      <Example
        title="Sizes"
        description={
          <>
            Three sizes match the other controls in the kit. <code>md</code> is the default. Use{' '}
            <code>sm</code> in dense toolbars and <code>lg</code> for prominent view switchers.
          </>
        }
        code={`<SegmentedControl size={Size.Small} aria-label="Small" options={options} />
<SegmentedControl size={Size.Medium} aria-label="Medium" options={options} />
<SegmentedControl size={Size.Large} aria-label="Large" options={options} />`}
      >
        <Stack gap={4}>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <div key={size}>
              <SegmentedControl
                size={size}
                aria-label={`Size ${size}`}
                options={[
                  { value: 'list', label: 'List' },
                  { value: 'grid', label: 'Grid' },
                ]}
              />
            </div>
          ))}
        </Stack>
      </Example>

      <Example
        title="Full width"
        description={
          <>
            With <code>fullWidth</code> the track stretches to its container and segments share the
            space evenly. This demo constrains the container to 320px.
          </>
        }
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
      >
        <Box width="full" style={{ maxWidth: 320 }}>
          <SegmentedControl
            fullWidth
            aria-label="Playback source"
            options={[
              { value: 'library', label: 'Library' },
              { value: 'radio', label: 'Radio' },
              { value: 'search', label: 'Search' },
            ]}
          />
        </Box>
      </Example>

      <Example
        title="Disabled option"
        description={
          <>
            Set <code>disabled</code> on an options entry to make a single segment unavailable.
            Pointer and keyboard selection skip it. Set <code>disabled</code> on the control itself
            to disable every segment.
          </>
        }
        code={`<SegmentedControl
  aria-label="Export format"
  options={[
    { value: 'png', label: 'PNG' },
    { value: 'svg', label: 'SVG', disabled: true },
    { value: 'pdf', label: 'PDF' },
  ]}
/>`}
      >
        <SegmentedControl
          aria-label="Export format"
          options={[
            { value: 'png', label: 'PNG' },
            { value: 'svg', label: 'SVG', disabled: true },
            { value: 'pdf', label: 'PDF' },
          ]}
        />
      </Example>

      <Example
        title="Skeleton"
        description={
          <>
            The <code>skeleton</code> prop renders a capsule placeholder at the control's exact
            height and radius, so nothing shifts when the real control mounts. It follows{' '}
            <code>size</code> and <code>fullWidth</code>.
          </>
        }
        code={`<SegmentedControl skeleton aria-label="Chart range" options={options} />
<SegmentedControl
  aria-label="Chart range"
  options={[
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
  ]}
/>`}
      >
        <Stack gap={4}>
          <SegmentedControl
            skeleton
            aria-label="Chart range"
            options={[
              { value: 'day', label: 'Day' },
              { value: 'week', label: 'Week' },
              { value: 'month', label: 'Month' },
            ]}
          />
          <SegmentedControl
            aria-label="Chart range"
            options={[
              { value: 'day', label: 'Day' },
              { value: 'week', label: 'Week' },
              { value: 'month', label: 'Month' },
            ]}
          />
        </Stack>
      </Example>

      <Heading level={2}>Props</Heading>
      <Heading level={3}>SegmentedControl</Heading>
      <PropsTable
        props={[
          {
            name: 'options',
            type: 'SegmentedOption[]',
            description:
              'Segments to render, in order. See the options entries table below for the shape.',
          },
          {
            name: 'value',
            type: 'string',
            description: 'Selected value in controlled mode. Pair with onValueChange.',
          },
          {
            name: 'defaultValue',
            type: 'string',
            description:
              'Initial value in uncontrolled mode. Falls back to the first enabled option.',
          },
          {
            name: 'onValueChange',
            type: '(value: string) => void',
            description: 'Called with the new value when the selection changes.',
          },
          {
            name: 'size',
            type: "'sm' | 'md' | 'lg'",
            default: "'md'",
            description: 'Control height and label type size, matching Button and Input.',
          },
          {
            name: 'fullWidth',
            type: 'boolean',
            default: 'false',
            description: 'Stretch the track to the container width with evenly sized segments.',
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: "Renders a placeholder with the component's exact geometry.",
          },
          {
            name: 'spring',
            type: 'Spring',
            default: 'Spring.Snappy',
            description:
              'Spring preset for the thumb transition. Import Spring from @glacier/motion.',
          },
          {
            name: 'disabled',
            type: 'boolean',
            default: 'false',
            description: 'Disable the entire control.',
          },
          {
            name: 'aria-label',
            type: 'string',
            description: 'Accessible name for the radio group. Provide one on every instance.',
          },
          {
            name: 'className',
            type: 'string',
            description: 'Extra class names for the root element.',
          },
        ]}
      />

      <Heading level={3}>options entries (SegmentedOption)</Heading>
      <PropsTable
        props={[
          {
            name: 'value',
            type: 'string',
            description: 'Unique value reported through value and onValueChange.',
          },
          {
            name: 'label',
            type: 'ReactNode',
            description: 'Visible segment content. Keep it to one or two words or an icon.',
          },
          {
            name: 'disabled',
            type: 'boolean',
            default: 'false',
            description: 'Make this segment unselectable while the rest stay interactive.',
          },
        ]}
      />

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>
          The root has <code>role="radiogroup"</code> and each segment is a native radio input, so
          form semantics and assistive technology support come from the platform.
        </li>
        <li>
          Arrow keys move the selection between enabled segments, standard radio group behavior.
          Tab enters and leaves the group as a single stop.
        </li>
        <li>
          Focus stays on the native input. The visible focus ring renders on the segment that holds
          it.
        </li>
        <li>
          Always pass <code>aria-label</code> so screen readers announce what the group controls.
        </li>
        <li>
          Under <code>prefers-reduced-motion</code> the thumb moves instantly instead of animating
          on a spring.
        </li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>
          Use 2 to 5 segments. More than 5 gets cramped, use a select or tabs instead.
        </li>
        <li>Keep labels to one or two words so segments stay close to equal width.</li>
        <li>
          Use it to switch views of the same content. For actions that do something, use Button.
          For navigation between pages, use tabs or links.
        </li>
        <li>
          Selection should take effect immediately. Do not pair a segmented control with a submit
          button.
        </li>
        <li>
          Prefer <code>Spring.Snappy</code> for controls used frequently. Reserve{' '}
          <code>Spring.Bouncy</code> for playful surfaces where the overshoot fits the tone.
        </li>
      </ul>
    </>
  );
}
