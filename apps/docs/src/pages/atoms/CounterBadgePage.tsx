import { CounterBadge, Row, Heading, Text, Size, TextTone, Tone } from '@glacier/react';
import { Example, PropsTable } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';

export function CounterBadgePage() {
  return (
    <>
      <Heading level={1}>CounterBadge</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        A small numeric badge for unread or attention counts on nav icons and tabs. Solid tone fill
        with contrast text, pill-shaped so single digits stay circular, tabular figures so the width
        does not jitter as the count changes.
      </Text>

      <Heading level={2}>Anatomy</Heading>
      <Text tone={TextTone.Muted}>An inspection with the exact spec measurements labelled on the box.</Text>
      <ComponentBlueprint specId="counter-badge" />

      <Heading level={2}>Examples</Heading>

      <Example
        title="Basic"
        description="Pass a count. Single digits render as a circle; the badge stretches for wider values."
        code={`import { CounterBadge } from '@glacier/react';

<CounterBadge count={3} />
<CounterBadge count={12} />`}
      >
        <Row gap={3} wrap>
          <CounterBadge count={3} />
          <CounterBadge count={12} />
        </Row>
      </Example>

      <Example
        title="Overflow"
        description="Counts past max render as `${max}+`. The default cap is 99."
        code={`<CounterBadge count={128} />
<CounterBadge count={12} max={9} />`}
      >
        <Row gap={3} wrap>
          <CounterBadge count={128} />
          <CounterBadge count={12} max={9} />
        </Row>
      </Example>

      <Example
        title="Tones"
        description="Four solid tones for different signals. Danger is the default for unread and errors."
        code={`<CounterBadge count={5} tone={Tone.Danger} />
<CounterBadge count={5} tone={Tone.Accent} />
<CounterBadge count={5} tone={Tone.Neutral} />
<CounterBadge count={5} tone={Tone.Success} />`}
      >
        <Row gap={3} wrap>
          <CounterBadge count={5} tone={Tone.Danger} />
          <CounterBadge count={5} tone={Tone.Accent} />
          <CounterBadge count={5} tone={Tone.Neutral} />
          <CounterBadge count={5} tone={Tone.Success} />
        </Row>
      </Example>

      <Example
        title="Dot"
        description="Set dot for a numberless presence marker. Give it an aria-label since there is no visible text."
        code={`<CounterBadge count={0} dot aria-label="Unread messages" />
<CounterBadge count={0} dot tone={Tone.Accent} aria-label="New activity" />`}
      >
        <Row gap={3} wrap>
          <CounterBadge count={0} dot aria-label="Unread messages" />
          <CounterBadge count={0} dot tone={Tone.Accent} aria-label="New activity" />
        </Row>
      </Example>

      <Example
        title="Skeleton"
        description="Set skeleton while the count loads. The placeholder is a circle the size of a single-digit badge, so the icon it sits on does not shift."
        code={`<CounterBadge count={0} skeleton />
<CounterBadge count={5} />`}
      >
        <Row gap={3} wrap>
          <CounterBadge count={0} skeleton />
          <CounterBadge count={5} />
        </Row>
      </Example>

      <Heading level={2}>Props</Heading>
      <PropsTable
        props={[
          { name: 'count', type: 'number', description: 'The number to show. A count of 0 or less renders nothing unless dot is set.' },
          { name: 'max', type: 'number', default: '99', description: 'Cap above which the badge renders `${max}+`.' },
          { name: 'tone', type: "'danger' | 'accent' | 'neutral' | 'success'", default: "'danger'", description: 'Solid fill color.' },
          { name: 'dot', type: 'boolean', default: 'false', description: 'Render a numberless dot instead of a count.' },
          { name: 'size', type: "'sm' | 'md'", default: "'md'", description: 'Badge size.' },
          { name: 'skeleton', type: 'boolean', default: 'false', description: "Renders a placeholder with the component's exact geometry." },
          { name: 'aria-label', type: 'string', description: 'Accessible name. Required for the dot form; counts default to `${count} items`.' },
        ]}
      />

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>The badge is a status region with an accessible name, so a screen reader can announce the count.</li>
        <li>Pass aria-label to phrase the count in context, e.g. "5 unread messages"; the dot form needs one since it has no text.</li>
        <li>The rendered digits are aria-hidden so the label reads once, not twice.</li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>Overlay it on a nav icon or tab to flag unread or pending items; keep the number small and let overflow collapse to 99+.</li>
        <li>Use the dot form when presence matters but the exact count does not.</li>
        <li>Reserve danger for things that need attention; use neutral for informational counts.</li>
      </ul>
    </>
  );
}
