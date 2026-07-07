import { Button, Row, Spinner, Text } from '@perfect/react';
import { Example, PropsTable } from '../docs-ui.tsx';

export function SpinnerPage() {
  return (
    <>
      <h1>Spinner</h1>
      <p className="lede">
        An indeterminate loading indicator for short waits. When progress is measurable, use a
        Progress Bar instead. Button uses a Spinner for its own loading state.
      </p>

      <h2>Examples</h2>

      <Example
        title="Sizes"
        description="Three sizes. sm is 1em and tracks the surrounding font size; md and lg are fixed."
        code={`import { Spinner } from '@perfect/react';

<Spinner size="sm" />
<Spinner size="md" />
<Spinner size="lg" />`}
      >
        <Row gap={4}>
          <Spinner size="sm" aria-label="Loading small" />
          <Spinner size="md" aria-label="Loading medium" />
          <Spinner size="lg" aria-label="Loading large" />
        </Row>
      </Example>

      <Example
        title="Tones"
        description="subtle is the default. accent uses the accent ramp; inherit takes the surrounding text color, which is how Button tints it."
        code={`<Spinner tone="subtle" />
<Spinner tone="accent" />
<Text tone="danger"><Spinner tone="inherit" size="sm" /> Retrying</Text>`}
      >
        <Row gap={4}>
          <Spinner tone="subtle" aria-label="Loading" />
          <Spinner tone="accent" aria-label="Loading" />
          <Text as="span" tone="danger">
            <Spinner tone="inherit" size="sm" aria-label="" /> Retrying
          </Text>
        </Row>
      </Example>

      <Example
        title="In a button"
        description="Use the Button loading prop rather than placing a Spinner next to it: the button sizes and tints the spinner and blocks clicks while pending."
        code={`<Button loading>Saving</Button>
<Button variant="soft" loading>Syncing</Button>`}
      >
        <Button loading>Saving</Button>
        <Button variant="soft" loading>
          Syncing
        </Button>
      </Example>

      <Example
        title="Skeleton"
        description="The skeleton prop renders a disc at the spinner's size, for placeholders that will resolve into a spinner or an icon."
        code={`<Spinner skeleton size="sm" />
<Spinner skeleton size="md" />
<Spinner skeleton size="lg" />`}
      >
        <Row gap={4}>
          <Spinner skeleton size="sm" />
          <Spinner skeleton size="md" />
          <Spinner skeleton size="lg" />
        </Row>
      </Example>

      <h2>Props</h2>
      <PropsTable
        props={[
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'sm is 1em and scales with text; md and lg are fixed.' },
          { name: 'tone', type: "'subtle' | 'accent' | 'inherit'", default: "'subtle'", description: 'inherit takes the surrounding text color.' },
          { name: 'skeleton', type: 'boolean', default: 'false', description: "Renders a placeholder with the component's exact geometry." },
          { name: 'aria-label', type: 'string', default: "'Loading'", description: 'Accessible name. Pass an empty string to hide it when a parent announces loading.' },
        ]}
      />

      <h2>Accessibility</h2>
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

      <h2>Usage</h2>
      <ul>
        <li>Use Spinner for waits under a few seconds; switch to a Progress Bar for longer work.</li>
        <li>For button-triggered work, use the Button loading prop instead of a standalone Spinner.</li>
        <li>Give a bare Spinner a meaningful aria-label, or an empty one when a parent announces the load.</li>
      </ul>
    </>
  );
}
