import { Carousel, Card, Heading, Text } from '@perfect/react';
import { Example, PropsTable } from '../docs-ui.tsx';

const cards = ['Nebula', 'Aurora', 'Comet', 'Eclipse', 'Meridian', 'Quasar', 'Zephyr'];

function DemoCard({ title }: { title: string }) {
  return (
    <Card style={{ width: '12rem' }}>
      <Heading level={4}>{title}</Heading>
      <Text tone="muted" size="sm">
        A card in the strip.
      </Text>
    </Card>
  );
}

export function CarouselPage() {
  return (
    <>
      <h1>Carousel</h1>
      <p className="lede">
        A horizontal snap-scroll strip for arbitrary card children. It uses CSS scroll-snap for tidy
        per-card stops, turns vertical wheel gestures into horizontal scroll, and can overlay prev/next
        controls that appear only while the strip overflows.
      </p>

      <h2>Examples</h2>

      <Example
        title="Basic"
        description="Drop any cards in as children. The strip scrolls horizontally and snaps to each card; the scrollbar is hidden."
        code={`import { Carousel, Card } from '@perfect/react';

<Carousel aria-label="Featured">
  <Card style={{ width: '12rem' }}>Nebula</Card>
  <Card style={{ width: '12rem' }}>Aurora</Card>
  <Card style={{ width: '12rem' }}>Comet</Card>
</Carousel>`}
      >
        <Carousel aria-label="Featured">
          {cards.map((title) => (
            <DemoCard key={title} title={title} />
          ))}
        </Carousel>
      </Example>

      <Example
        title="With controls"
        description="Set showControls to overlay prev/next buttons. They appear only while the strip overflows and disable at each end."
        code={`<Carousel showControls aria-label="Featured">
  {items.map((item) => (
    <Card key={item.id} style={{ width: '12rem' }}>{item.title}</Card>
  ))}
</Carousel>`}
      >
        <Carousel showControls aria-label="Featured with controls">
          {cards.map((title) => (
            <DemoCard key={title} title={title} />
          ))}
        </Carousel>
      </Example>

      <Example
        title="Custom gap"
        description="Tune the space between cards with the gap prop — any CSS length or a space token."
        code={`<Carousel gap="var(--perfect-space-6)" aria-label="Roomy">
  {/* cards */}
</Carousel>`}
      >
        <Carousel gap="var(--perfect-space-6)" aria-label="Roomy strip">
          {cards.map((title) => (
            <DemoCard key={title} title={title} />
          ))}
        </Carousel>
      </Example>

      <h2>Props</h2>
      <PropsTable
        props={[
          { name: 'children', type: 'ReactNode', description: 'Required. The card children; each becomes a snap target that keeps its intrinsic width.' },
          { name: 'showControls', type: 'boolean', default: 'false', description: 'Overlays prev/next controls that appear when the strip overflows and disable at each end.' },
          { name: 'gap', type: 'string', default: "'var(--perfect-space-4)'", description: 'Space between cards; any CSS length or a space token.' },
          { name: 'aria-label', type: 'string', description: 'Accessible name for the scrollable region.' },
          { name: 'className', type: 'string', description: 'Extra class on the root wrapper.' },
        ]}
      />

      <h2>Accessibility</h2>
      <ul>
        <li>
          The track is a focusable <code>role="group"</code>, so keyboard users can Tab to it, scroll it with
          the arrow keys, and reach cards that are off screen.
        </li>
        <li>
          Prev/next controls are labelled IconButtons kept out of the tab order — the scroller is the keyboard
          entry point — and they disable at each end.
        </li>
        <li>The scrollbar is visually hidden for a clean strip, but pointer, trackpad, and keyboard scrolling all remain available.</li>
      </ul>

      <h2>Usage</h2>
      <ul>
        <li>Give each card an explicit or intrinsic width; the strip does not stretch children to fill.</li>
        <li>Always pass an <code>aria-label</code> describing the collection, e.g. "Featured shows".</li>
        <li>Reach for controls on pointer-first surfaces with many items; a short strip can rely on native scroll alone.</li>
      </ul>
    </>
  );
}
