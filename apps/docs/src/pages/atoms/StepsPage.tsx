import { Stack, Steps, Heading, Text, Size, TextTone, Tone } from '@glacier/react';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { Example, PropsTable } from '../../docs-ui.tsx';

export function StepsPage() {
  return (
    <>
      <Heading level={1}>Steps</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        A row of progress dots that marks how far along a tour, wizard, or quiz has gone. Completed
        steps fill solid, the current step stands out larger, and upcoming steps sit hollow, so a
        glance shows both position and how much is left.
      </Text>

      <Heading level={2}>Anatomy</Heading>
      <Text tone={TextTone.Muted}>An inspection with the exact spec measurements labelled on the box.</Text>
      <ComponentBlueprint specId="steps" />

      <Heading level={2}>Examples</Heading>

      <Example
        title="Progress"
        description={
          <>
            <code>count</code> sets the number of dots and <code>active</code> is the zero-based
            current step. Dots before <code>active</code> read as completed, the one at{' '}
            <code>active</code> is the enlarged current step, and the rest are upcoming.
          </>
        }
        code={`import { Steps } from '@glacier/react';

<Steps count={5} active={0} />
<Steps count={5} active={2} />
<Steps count={5} active={4} />`}
      >
        <Stack gap={4}>
          <Steps count={5} active={0} />
          <Steps count={5} active={2} />
          <Steps count={5} active={4} />
        </Stack>
      </Example>

      <Example
        title="Connected"
        description={
          <>
            The <code>connected</code> variant joins larger circular markers with connector lines.
            Completed steps draw a check, the current step rings itself in the tone, and{' '}
            <code>numbered</code> writes the 1-based step number in the remaining markers.
          </>
        }
        code={`<Steps variant="connected" count={4} active={2} />
<Steps variant="connected" numbered count={4} active={2} />`}
      >
        <Stack gap={5} style={{ width: '100%', maxWidth: '24rem' }}>
          <Steps variant="connected" count={4} active={2} style={{ width: '100%' }} />
          <Steps variant="connected" numbered count={4} active={2} style={{ width: '100%' }} />
        </Stack>
      </Example>

      <Example
        title="Tones"
        description={
          <>
            <code>tone</code> colors the completed and current dots. It defaults to{' '}
            <code>accent</code>; pick a semantic family to match the surrounding flow. Upcoming dots
            stay neutral in every tone.
          </>
        }
        code={`<Steps count={4} active={2} tone={Tone.Accent} />
<Steps count={4} active={2} tone={Tone.Success} />
<Steps count={4} active={2} tone={Tone.Warning} />
<Steps count={4} active={2} tone={Tone.Danger} />`}
      >
        <Stack gap={4}>
          <Steps count={4} active={2} tone={Tone.Accent} />
          <Steps count={4} active={2} tone={Tone.Success} />
          <Steps count={4} active={2} tone={Tone.Warning} />
          <Steps count={4} active={2} tone={Tone.Danger} />
        </Stack>
      </Example>

      <Example
        title="Sizes"
        description={
          <>
            Two size steps set the dot diameter and the gap between dots. <code>sm</code> suits dense
            toolbars and captions; <code>md</code> is the default.
          </>
        }
        code={`<Steps count={5} active={2} size={Size.Small} />
<Steps count={5} active={2} size={Size.Medium} />`}
      >
        <Stack gap={4}>
          <Steps count={5} active={2} size={Size.Small} />
          <Steps count={5} active={2} size={Size.Medium} />
        </Stack>
      </Example>

      <Example
        title="Skeleton"
        description={
          <>
            <code>skeleton</code> renders the same number of dots as shimmer discs at the exact
            diameter and gap, so the row holds its place while content loads.
          </>
        }
        code={`<Steps count={5} skeleton />
<Steps count={5} active={2} />`}
      >
        <Stack gap={4}>
          <Steps count={5} skeleton />
          <Steps count={5} active={2} />
        </Stack>
      </Example>

      <Heading level={2}>Props</Heading>
      <PropsTable
        props={[
          {
            name: 'count',
            type: 'number',
            description: 'Total number of steps. Renders this many dots.',
          },
          {
            name: 'active',
            type: 'number',
            default: '0',
            description:
              'Zero-based index of the current step. Earlier dots read as completed, later ones as upcoming.',
          },
          {
            name: 'variant',
            type: "'dots' | 'connected'",
            default: "'dots'",
            description:
              'dots renders the compact dot row; connected joins circular markers with lines and draws a check on completed steps.',
          },
          {
            name: 'numbered',
            type: 'boolean',
            default: 'false',
            description: 'Numbers the connected markers from 1. Ignored by the dots variant.',
          },
          {
            name: 'tone',
            type: "'accent' | 'success' | 'warning' | 'danger' | 'neutral' | 'info'",
            default: "'accent'",
            description: 'Semantic color of the completed and current dots.',
          },
          {
            name: 'size',
            type: "'sm' | 'md'",
            default: "'md'",
            description: 'Compact size step. Sets the dot diameter and the gap between dots.',
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
          The row is a <code>role="group"</code> labelled <code>Step {'{active + 1}'} of{' '}
          {'{count}'}</code>, so assistive technology announces position without reading each dot.
        </li>
        <li>
          Individual dots are decorative and <code>aria-hidden</code>. Position is carried by the
          group label text, never by color alone.
        </li>
        <li>
          The current dot grows with a transform so it does not nudge its neighbors. That growth is
          removed under reduced motion.
        </li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>
          Reach for Steps to show position in a short, linear sequence: an onboarding tour, a
          multi-step form, a quiz. For a single continuous value, use Progress instead.
        </li>
        <li>
          Keep the count small. Past roughly seven or eight dots the row reads as noise; summarize
          with a Progress bar or a step counter instead.
        </li>
        <li>
          Pair Steps with a heading or caption that names the current step. The dots show where you
          are; the text says what it is.
        </li>
      </ul>
    </>
  );
}
