import { Row, Stack, StatusDot, Text, Heading, Size, TextTone, Tone } from '@glacier/react';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { Example, PropsTable } from '../../docs-ui.tsx';

export function StatusDotPage() {
  return (
    <>
      <Heading level={1}>StatusDot</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        A tiny colored dot for run, connection, and sync states. It reads at a glance next to a
        label, and can pulse to signal a live or in-progress state.
      </Text>

      <Heading level={2}>Anatomy</Heading>
      <Text tone={TextTone.Muted}>An inspection with the exact spec measurements labelled on the box.</Text>
      <ComponentBlueprint specId="status-dot" />

      <Heading level={2}>Examples</Heading>

      <Example
        title="Tones"
        description={
          <>
            Six tones map to the semantic ramps. <code>neutral</code> is the default idle state; the
            others carry meaning, from <code>success</code> for healthy to <code>danger</code> for
            down.
          </>
        }
        code={`import { StatusDot } from '@glacier/react';

<StatusDot />
<StatusDot tone={Tone.Accent} />
<StatusDot tone={Tone.Success} />
<StatusDot tone={Tone.Warning} />
<StatusDot tone={Tone.Danger} />
<StatusDot tone={Tone.Info} />`}
      >
        <Row gap={4}>
          <StatusDot />
          <StatusDot tone={Tone.Accent} />
          <StatusDot tone={Tone.Success} />
          <StatusDot tone={Tone.Warning} />
          <StatusDot tone={Tone.Danger} />
          <StatusDot tone={Tone.Info} />
        </Row>
      </Example>

      <Example
        title="Pulse"
        description={
          <>
            <code>pulse</code> adds an expanding ring for live states such as an active run or an
            open connection. The animation is disabled under reduced-motion.
          </>
        }
        code={`<StatusDot tone={Tone.Success} pulse />
<StatusDot tone={Tone.Info} pulse />`}
      >
        <Row gap={4}>
          <StatusDot tone={Tone.Success} pulse />
          <StatusDot tone={Tone.Info} pulse />
        </Row>
      </Example>

      <Example
        title="Sizes"
        description={
          <>
            Two sizes. <code>md</code> is the default; use <code>sm</code> inside tight lines of
            text such as table rows.
          </>
        }
        code={`<StatusDot size={Size.Small} tone={Tone.Success} />
<StatusDot size={Size.Medium} tone={Tone.Success} />`}
      >
        <Row gap={4}>
          <StatusDot size={Size.Small} tone={Tone.Success} />
          <StatusDot size={Size.Medium} tone={Tone.Success} />
        </Row>
      </Example>

      <Example
        title="Status row"
        description={
          <>
            The common composition: a labeled dot beside a name. Pass <code>label</code> so the state
            is announced; keep the visible text for sighted users.
          </>
        }
        code={`<Row gap={4}>
  <StatusDot tone={Tone.Success} pulse label="Running" />
  <Text as="span" weight="medium">api-server</Text>
</Row>`}
      >
        <Stack gap={4}>
          <Row gap={4}>
            <StatusDot tone={Tone.Success} pulse label="Running" />
            <Text as="span" weight="medium">
              api-server
            </Text>
          </Row>
          <Row gap={4}>
            <StatusDot tone={Tone.Danger} label="Down" />
            <Text as="span" weight="medium">
              worker-queue
            </Text>
          </Row>
        </Stack>
      </Example>

      <Example
        title="Skeleton"
        description={
          <>
            <code>skeleton</code> renders a shimmer disc with the dot's exact diameter, sized per{' '}
            <code>size</code>, so a loading status list holds its layout.
          </>
        }
        code={`<StatusDot skeleton size={Size.Small} />
<StatusDot skeleton />`}
      >
        <Row gap={4}>
          <StatusDot skeleton size={Size.Small} />
          <StatusDot skeleton />
        </Row>
      </Example>

      <Heading level={2}>Props</Heading>
      <PropsTable
        props={[
          {
            name: 'tone',
            type: "'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info'",
            default: "'neutral'",
            description: 'Semantic color of the dot.',
          },
          {
            name: 'pulse',
            type: 'boolean',
            default: 'false',
            description: 'Adds an animated expanding ring for live states.',
          },
          {
            name: 'size',
            type: "'sm' | 'md'",
            default: "'md'",
            description: 'Diameter of the dot.',
          },
          {
            name: 'label',
            type: 'string',
            description:
              'Accessible name. When set, the dot becomes a status region; otherwise it is decorative.',
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: "Renders a placeholder with the component's exact geometry.",
          },
        ]}
      />

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>
          With a <code>label</code>, the dot exposes <code>role="status"</code> and that accessible
          name, so a screen reader announces the state. Do not rely on tone color alone to convey
          meaning.
        </li>
        <li>
          Without a <code>label</code>, the dot is marked decorative and skipped. Use this when an
          adjacent text label already states the status.
        </li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>
          Pair the dot with a text label whenever the state matters. Reserve the bare, decorative
          dot for cases where nearby text already names the state.
        </li>
        <li>
          Use <code>pulse</code> sparingly, for genuinely live states. A page full of pulsing dots
          reads as noise.
        </li>
        <li>
          For a state that also carries a short word, such as "Degraded" or "3 new", reach for a{' '}
          <code>Pill</code> instead.
        </li>
      </ul>
    </>
  );
}
