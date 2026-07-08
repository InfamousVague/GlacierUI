import { Button, Row, Spinner, Text, Heading, Size, TextTone, Tone, Variant } from '@glacier/react';
import { Example, PropsTable } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';

export function SpinnerPage() {
  return (
    <>
      <Heading level={1}>Spinner</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        An indeterminate loading indicator for short waits. When progress is measurable, use a
        Progress Bar instead. Button uses a Spinner for its own loading state.
      </Text>

      <Heading level={2}>Anatomy</Heading>
      <Text tone={TextTone.Muted}>An inspection with the exact spec measurements labelled on the box.</Text>
      <ComponentBlueprint specId="spinner" />

      <Heading level={2}>Examples</Heading>

      <Example
        title="Sizes"
        description="Three sizes. sm is 1em and tracks the surrounding font size; md and lg are fixed."
        code={`import { Spinner } from '@glacier/react';

<Spinner size={Size.Small} />
<Spinner size={Size.Medium} />
<Spinner size={Size.Large} />`}
      >
        <Row gap={4}>
          <Spinner size={Size.Small} aria-label="Loading small" />
          <Spinner size={Size.Medium} aria-label="Loading medium" />
          <Spinner size={Size.Large} aria-label="Loading large" />
        </Row>
      </Example>

      <Example
        title="Tones"
        description="subtle is the default. accent uses the accent ramp; inherit takes the surrounding text color, which is how Button tints it."
        code={`<Spinner tone={Tone.Subtle} />
<Spinner tone={Tone.Accent} />
{/* a flex group centers the spinner with the label */}
<Text tone={TextTone.Danger} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
  <Spinner tone={Tone.Inherit} size={Size.Small} /> Retrying
</Text>`}
      >
        <Row gap={4}>
          <Spinner tone={Tone.Subtle} aria-label="Loading" />
          <Spinner tone={Tone.Accent} aria-label="Loading" />
          <Text
            as="span"
            tone={TextTone.Danger}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--glacier-space-2)' }}
          >
            <Spinner tone={Tone.Inherit} size={Size.Small} aria-label="" />
            Retrying
          </Text>
        </Row>
      </Example>

      <Example
        title="In a button"
        description="Use the Button loading prop rather than placing a Spinner next to it: the button sizes and tints the spinner and blocks clicks while pending."
        code={`<Button loading>Saving</Button>
<Button variant={Variant.Soft} loading>Syncing</Button>`}
      >
        <Button loading>Saving</Button>
        <Button variant={Variant.Soft} loading>
          Syncing
        </Button>
      </Example>

      <Example
        title="Skeleton"
        description="The skeleton prop renders a disc at the spinner's size, for placeholders that will resolve into a spinner or an icon."
        code={`<Spinner skeleton size={Size.Small} />
<Spinner skeleton size={Size.Medium} />
<Spinner skeleton size={Size.Large} />`}
      >
        <Row gap={4}>
          <Spinner skeleton size={Size.Small} />
          <Spinner skeleton size={Size.Medium} />
          <Spinner skeleton size={Size.Large} />
        </Row>
      </Example>

      <Heading level={2}>Props</Heading>
      <PropsTable
        props={[
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'sm is 1em and scales with text; md and lg are fixed.' },
          { name: 'tone', type: "'subtle' | 'accent' | 'inherit'", default: "'subtle'", description: 'inherit takes the surrounding text color.' },
          { name: 'skeleton', type: 'boolean', default: 'false', description: "Renders a placeholder with the component's exact geometry." },
          { name: 'aria-label', type: 'string', default: "'Loading'", description: 'Accessible name. Pass an empty string to hide it when a parent announces loading.' },
        ]}
      />

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>
          Renders <code>role="status"</code> named Loading by default. An empty{' '}
          <code>aria-label</code> hides it when the surrounding component already announces the
          state, which is what Button does.
        </li>
        <li>
          Under prefers-reduced-motion the spin becomes an opacity pulse, so state is still visible
          without movement.
        </li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>Use Spinner for waits under a few seconds; switch to a Progress Bar for longer work.</li>
        <li>For button-triggered work, use the Button loading prop instead of a standalone Spinner.</li>
        <li>Give a bare Spinner a meaningful aria-label, or an empty one when a parent announces the load.</li>
      </ul>
    </>
  );
}
