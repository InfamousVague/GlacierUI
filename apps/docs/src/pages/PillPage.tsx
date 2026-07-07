import { Pill, Text } from '@perfect/react';
import { Example, PropsTable } from '../docs-ui.tsx';

export function PillPage() {
  return (
    <>
      <h1>Pill</h1>
      <p className="lede">
        A small inline badge for statuses, counts, and categories. Pills are read-only. For anything
        the user can activate, use a Button.
      </p>

      <h2>Examples</h2>

      <Example
        title="Tones"
        description={
          <>
            Six tones map to the semantic color ramps. <code>neutral</code> is the default and fits
            most metadata. The others carry meaning: <code>success</code>, <code>warning</code>, and{' '}
            <code>danger</code> report state, <code>accent</code> and <code>info</code> highlight and
            annotate.
          </>
        }
        code={`import { Pill } from '@perfect/react';

<Pill>Neutral</Pill>
<Pill tone="accent">Accent</Pill>
<Pill tone="success">Success</Pill>
<Pill tone="warning">Warning</Pill>
<Pill tone="danger">Danger</Pill>
<Pill tone="info">Info</Pill>`}
      >
        <div className="row">
          <Pill>Neutral</Pill>
          <Pill tone="accent">Accent</Pill>
          <Pill tone="success">Success</Pill>
          <Pill tone="warning">Warning</Pill>
          <Pill tone="danger">Danger</Pill>
          <Pill tone="info">Info</Pill>
        </div>
      </Example>

      <Example
        title="Variants"
        description={
          <>
            Three variants set the emphasis. <code>soft</code> is the default tinted fill,{' '}
            <code>solid</code> uses the full tone color, and <code>outline</code> keeps only a
            border. Every variant works with every tone.
          </>
        }
        code={`<Pill tone="accent" variant="soft">Soft</Pill>
<Pill tone="accent" variant="solid">Solid</Pill>
<Pill tone="accent" variant="outline">Outline</Pill>

<Pill tone="danger" variant="soft">Soft</Pill>
<Pill tone="danger" variant="solid">Solid</Pill>
<Pill tone="danger" variant="outline">Outline</Pill>`}
      >
        <div className="stack">
          <div className="row">
            <Pill tone="accent" variant="soft">
              Soft
            </Pill>
            <Pill tone="accent" variant="solid">
              Solid
            </Pill>
            <Pill tone="accent" variant="outline">
              Outline
            </Pill>
          </div>
          <div className="row">
            <Pill tone="danger" variant="soft">
              Soft
            </Pill>
            <Pill tone="danger" variant="solid">
              Solid
            </Pill>
            <Pill tone="danger" variant="outline">
              Outline
            </Pill>
          </div>
        </div>
      </Example>

      <Example
        title="Sizes"
        description={
          <>
            Two sizes. <code>md</code> is the default. Use <code>sm</code> inside table rows, list
            items, and other tight lines of text.
          </>
        }
        code={`<Pill size="sm" tone="info">sm</Pill>
<Pill size="md" tone="info">md</Pill>
<Pill size="sm" tone="accent" variant="solid">3 new</Pill>`}
      >
        <div className="row" style={{ alignItems: 'center' }}>
          <Pill size="sm" tone="info">
            sm
          </Pill>
          <Pill size="md" tone="info">
            md
          </Pill>
          <Pill size="sm" tone="accent" variant="solid">
            3 new
          </Pill>
        </div>
      </Example>

      <Example
        title="Status row"
        description={
          <>
            The most common composition: a name, a pill that reports state, and muted detail text.
            The pill label carries the meaning, so the row stays readable without color.
          </>
        }
        code={`<div className="row" style={{ alignItems: 'center' }}>
  <Text as="span" weight="medium">api-server</Text>
  <Pill tone="success" size="sm">Build passing</Pill>
  <Text as="span" size="sm" tone="muted">Deployed 4 minutes ago</Text>
</div>`}
      >
        <div className="stack">
          <div className="row" style={{ alignItems: 'center' }}>
            <Text as="span" weight="medium">
              api-server
            </Text>
            <Pill tone="success" size="sm">
              Build passing
            </Pill>
            <Text as="span" size="sm" tone="muted">
              Deployed 4 minutes ago
            </Text>
          </div>
          <div className="row" style={{ alignItems: 'center' }}>
            <Text as="span" weight="medium">
              worker-queue
            </Text>
            <Pill tone="warning" size="sm">
              Degraded
            </Pill>
            <Text as="span" size="sm" tone="muted">
              Retrying 3 jobs
            </Text>
          </div>
        </div>
      </Example>

      <Example
        title="Skeleton"
        description={
          <>
            <code>skeleton</code> renders a shimmer placeholder with the pill's height and full
            radius, sized per <code>size</code>, so surrounding text does not shift when the label
            loads.
          </>
        }
        code={`<Pill skeleton size="sm" />
<Pill size="sm" tone="success">Build passing</Pill>
<Pill skeleton />
<Pill tone="info">In review</Pill>`}
      >
        <div className="row" style={{ alignItems: 'center' }}>
          <Pill skeleton size="sm" />
          <Pill size="sm" tone="success">
            Build passing
          </Pill>
          <Pill skeleton />
          <Pill tone="info">In review</Pill>
        </div>
      </Example>

      <h2>Props</h2>
      <PropsTable
        props={[
          {
            name: 'tone',
            type: "'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info'",
            default: "'neutral'",
            description: 'Semantic color of the pill.',
          },
          {
            name: 'variant',
            type: "'soft' | 'solid' | 'outline'",
            default: "'soft'",
            description: 'Fill style: tinted background, full tone color, or border only.',
          },
          {
            name: 'size',
            type: "'sm' | 'md'",
            default: "'md'",
            description: 'Text size and padding. All other native span props are forwarded.',
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: "Renders a placeholder with the component's exact geometry.",
          },
        ]}
      />

      <h2>Accessibility</h2>
      <ul>
        <li>
          Pill renders a plain <code>span</code> with no implicit role. Screen readers announce only
          its text, so the label must state the status on its own. Do not rely on tone color to
          carry meaning.
        </li>
        <li>
          Pills are not focusable and receive no keyboard interaction. Wrap content in a{' '}
          <code>Button</code> instead of adding click handlers to a pill.
        </li>
      </ul>

      <h2>Usage</h2>
      <ul>
        <li>
          Use pills for statuses, counts, and categories. They are read-only. For anything the user
          can activate, use a <code>Button</code>.
        </li>
        <li>
          Prefer <code>soft</code> in dense UI such as tables and lists. Reserve <code>solid</code>{' '}
          for the one state per view that must stand out.
        </li>
        <li>
          Keep pill labels to one or two words. Move detail into adjacent <code>Text</code>, as in
          the status row example.
        </li>
      </ul>
    </>
  );
}
