import { Badge } from '@perfect/react';
import { Example, PropsTable } from '../docs-ui.tsx';

export function BadgePage() {
  return (
    <>
      <h1>Badge</h1>
      <p className="lede">
        A small labeled status badge: an inline-flex text pill that carries a short status word in a
        semantic tone. Choose a soft tint or a solid fill, in one of two compact sizes. For counts,
        reach for CounterBadge instead.
      </p>

      <h2>Examples</h2>

      <Example
        title="Tones"
        description="Every tone in the default soft variant. The text carries the meaning; the tone reinforces it."
        code={`import { Badge } from '@perfect/react';

<Badge>Draft</Badge>
<Badge tone="accent">New</Badge>
<Badge tone="success">Live</Badge>
<Badge tone="warning">Pending</Badge>
<Badge tone="danger">Failed</Badge>
<Badge tone="info">Beta</Badge>`}
      >
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <Badge>Draft</Badge>
          <Badge tone="accent">New</Badge>
          <Badge tone="success">Live</Badge>
          <Badge tone="warning">Pending</Badge>
          <Badge tone="danger">Failed</Badge>
          <Badge tone="info">Beta</Badge>
        </div>
      </Example>

      <Example
        title="Solid variant"
        description="Solid fills the badge with the tone color and contrast text, for higher emphasis."
        code={`<Badge variant="solid" tone="accent">New</Badge>
<Badge variant="solid" tone="success">Live</Badge>
<Badge variant="solid" tone="danger">Failed</Badge>`}
      >
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <Badge variant="solid">Draft</Badge>
          <Badge variant="solid" tone="accent">New</Badge>
          <Badge variant="solid" tone="success">Live</Badge>
          <Badge variant="solid" tone="warning">Pending</Badge>
          <Badge variant="solid" tone="danger">Failed</Badge>
          <Badge variant="solid" tone="info">Beta</Badge>
        </div>
      </Example>

      <Example
        title="Sizes"
        description="Two compact steps: sm for dense rows and tables, md as the default."
        code={`<Badge size="sm" tone="success">Live</Badge>
<Badge size="md" tone="success">Live</Badge>`}
      >
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Badge size="sm" tone="success">Live</Badge>
          <Badge size="md" tone="success">Live</Badge>
        </div>
      </Example>

      <h2>Props</h2>
      <PropsTable
        props={[
          { name: 'tone', type: "'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info'", default: "'neutral'", description: 'Semantic color family.' },
          { name: 'variant', type: "'soft' | 'solid'", default: "'soft'", description: 'Fill treatment: a tinted soft fill or a solid tone fill.' },
          { name: 'size', type: "'sm' | 'md'", default: "'md'", description: 'Compact size step.' },
          { name: 'children', type: 'ReactNode', description: 'Required. Badge label, kept to one short line.' },
        ]}
      />

      <h2>Accessibility</h2>
      <ul>
        <li>The badge is decorative by default; its text carries the meaning, so it needs no role.</li>
        <li>
          When the tone alone conveys status (a color with a bare glyph or abbreviation), add an{' '}
          <code>aria-label</code> so assistive tech announces the state.
        </li>
        <li>Keep the text high-contrast against the fill — the built-in tone pairings already meet contrast.</li>
      </ul>

      <h2>Usage</h2>
      <ul>
        <li>Use a Badge for a short status word on an object: a verb or adjective like Live, Draft, or Failed.</li>
        <li>Reach for CounterBadge when the value is a number, and a Pill for a removable tag or a longer label.</li>
        <li>Prefer soft in dense lists and reserve solid for the one status that must stand out.</li>
      </ul>
    </>
  );
}
