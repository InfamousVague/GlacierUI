import { Box, Button, ProgressBar, Row, Stack, Text, Heading, Size, TextTone, Tone, Variant } from '@glacier/react';
import { useEffect, useState } from 'react';
import { Example, PropsTable } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';

export function ProgressBarPage() {
  return (
    <>
      <Heading level={1}>Progress Bar</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        Shows how far a known task has gotten. When the duration is unknown, use the indeterminate
        sweep, or reach for Spinner. For a level rather than progress, use Meter.
      </Text>

      <Heading level={2}>Anatomy</Heading>
      <Text tone={TextTone.Muted}>An inspection with the exact spec measurements labelled on the box.</Text>
      <ComponentBlueprint specId="progress-bar" />

      <Heading level={2}>Examples</Heading>

      <Example
        title="Determinate"
        description="Pass value from 0 to max. The fill animates between values on the motion tokens."
        code={`import { ProgressBar } from '@glacier/react';

<ProgressBar aria-label="Course progress" value={65} />`}
      >
        <LiveProgress />
      </Example>

      <Example
        title="Indeterminate"
        description="Set indeterminate (or omit value) when the duration is unknown. The bar sweeps until you switch it to a value."
        code={`<ProgressBar aria-label="Preparing" indeterminate />`}
      >
        <Box maxWidth="xs" width="full">
          <ProgressBar aria-label="Preparing" indeterminate />
        </Box>
      </Example>

      <Example
        title="Sizes and tones"
        description="Two thicknesses and four tones. The accent tone follows the active accent ramp."
        code={`<ProgressBar aria-label="Accent" value={70} size={Size.Small} />
<ProgressBar aria-label="Success" value={100} tone={Tone.Success} />
<ProgressBar aria-label="Warning" value={45} tone={Tone.Warning} />
<ProgressBar aria-label="Danger" value={15} tone={Tone.Danger} />`}
      >
        <Stack gap={4} maxWidth="xs" width="full">
          <ProgressBar aria-label="Accent" value={70} size={Size.Small} />
          <ProgressBar aria-label="Success" value={100} tone={Tone.Success} />
          <ProgressBar aria-label="Warning" value={45} tone={Tone.Warning} />
          <ProgressBar aria-label="Danger" value={15} tone={Tone.Danger} />
        </Stack>
      </Example>

      <Example
        title="Steps with a custom max"
        description="max recalibrates the range, which suits lesson or wizard steps."
        code={`<ProgressBar aria-label="Lesson 3 of 4" value={3} max={4} />`}
      >
        <Stack gap={4} maxWidth="xs" width="full">
          <ProgressBar aria-label="Lesson 3 of 4" value={3} max={4} />
          <Text size={Size.Small} tone={TextTone.Muted}>
            Lesson 3 of 4
          </Text>
        </Stack>
      </Example>

      <Example
        title="Skeleton"
        description="Set skeleton while the value is still loading. The placeholder keeps the track geometry for the size, so nothing shifts when the real bar arrives."
        code={`<ProgressBar skeleton />
<ProgressBar aria-label="Course progress" value={65} />
<ProgressBar skeleton size={Size.Small} />`}
      >
        <Stack gap={4} maxWidth="xs" width="full">
          <ProgressBar skeleton />
          <ProgressBar aria-label="Course progress" value={65} />
          <ProgressBar skeleton size={Size.Small} />
        </Stack>
      </Example>

      <Heading level={2}>Props</Heading>
      <PropsTable
        props={[
          { name: 'value', type: 'number', description: 'Progress from 0 to max. Omit for indeterminate.' },
          { name: 'max', type: 'number', default: '100', description: 'Upper bound of the range.' },
          { name: 'indeterminate', type: 'boolean', default: 'false', description: 'Sweeping animation for unknown durations.' },
          { name: 'size', type: "'sm' | 'md'", default: "'md'", description: 'Track thickness.' },
          { name: 'tone', type: "'accent' | 'success' | 'warning' | 'danger'", default: "'accent'", description: 'Fill color from the status ramps.' },
          { name: 'skeleton', type: 'boolean', default: 'false', description: "Renders a placeholder with the component's exact geometry." },
          { name: 'aria-label', type: 'string', description: 'Accessible name for the bar.' },
        ]}
      />

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>
          Renders <code>role="progressbar"</code> with <code>aria-valuemin</code>,{' '}
          <code>aria-valuemax</code>, and <code>aria-valuenow</code>. Indeterminate bars omit{' '}
          <code>aria-valuenow</code>, which is the signal for an unknown amount.
        </li>
        <li>
          Under prefers-reduced-motion the sweep becomes an opacity pulse, so state is still visible
          without movement.
        </li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>Prefer a determinate bar whenever real progress is measurable.</li>
        <li>Use the indeterminate sweep, or a Spinner, when you cannot measure progress.</li>
        <li>Values clamp to the range, so feed raw numbers without guarding.</li>
      </ul>
    </>
  );
}

function LiveProgress() {
  const [value, setValue] = useState(65);

  useEffect(() => {
    if (value < 100) return;
    const timer = setTimeout(() => setValue(0), 1200);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <Stack gap={4} maxWidth="xs" width="full">
      <ProgressBar aria-label="Course progress" value={value} />
      <Row gap={4} wrap>
        <Button size={Size.Small} variant={Variant.Soft} onClick={() => setValue((v) => Math.min(v + 15, 100))}>
          Advance
        </Button>
        <Text as="span" size={Size.Small} tone={TextTone.Muted}>
          {value}%
        </Text>
      </Row>
    </Stack>
  );
}
