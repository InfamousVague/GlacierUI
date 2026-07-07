import { CounterBadge, Row } from '@perfect/react';
import { Example, PropsTable } from '../docs-ui.tsx';

export function CounterBadgePage() {
  return (
    <>
      <h1>CounterBadge</h1>
      <p className="lede">
        A small numeric badge for unread or attention counts on nav icons and tabs. Solid tone fill
        with contrast text, pill-shaped so single digits stay circular, tabular figures so the width
        does not jitter as the count changes.
      </p>

      <h2>Examples</h2>

      <Example
        title="Basic"
        description="Pass a count. Single digits render as a circle; the badge stretches for wider values."
        code={`import { CounterBadge } from '@perfect/react';

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
        code={`<CounterBadge count={5} tone="danger" />
<CounterBadge count={5} tone="accent" />
<CounterBadge count={5} tone="neutral" />
<CounterBadge count={5} tone="success" />`}
      >
        <Row gap={3} wrap>
          <CounterBadge count={5} tone="danger" />
          <CounterBadge count={5} tone="accent" />
          <CounterBadge count={5} tone="neutral" />
          <CounterBadge count={5} tone="success" />
        </Row>
      </Example>

      <Example
        title="Dot"
        description="Set dot for a numberless presence marker. Give it an aria-label since there is no visible text."
        code={`<CounterBadge count={0} dot aria-label="Unread messages" />
<CounterBadge count={0} dot tone="accent" aria-label="New activity" />`}
      >
        <Row gap={3} wrap>
          <CounterBadge count={0} dot aria-label="Unread messages" />
          <CounterBadge count={0} dot tone="accent" aria-label="New activity" />
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

      <h2>Props</h2>
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

      <h2>Accessibility</h2>
      <ul>
        <li>The badge is a status region with an accessible name, so a screen reader can announce the count.</li>
        <li>Pass aria-label to phrase the count in context, e.g. "5 unread messages"; the dot form needs one since it has no text.</li>
        <li>The rendered digits are aria-hidden so the label reads once, not twice.</li>
      </ul>

      <h2>Usage</h2>
      <ul>
        <li>Overlay it on a nav icon or tab to flag unread or pending items; keep the number small and let overflow collapse to 99+.</li>
        <li>Use the dot form when presence matters but the exact count does not.</li>
        <li>Reserve danger for things that need attention; use neutral for informational counts.</li>
      </ul>
    </>
  );
}
