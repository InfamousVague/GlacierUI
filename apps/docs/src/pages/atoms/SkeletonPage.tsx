import { Button, Card, IconButton, Skeleton, Stack, Text, Heading, Size, TextTone, Variant, SkeletonVariant } from '@glacier/react';
import { useState } from 'react';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { Example, PropsTable } from '../../docs-ui.tsx';

export function SkeletonPage() {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <Heading level={1}>Skeleton</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        The kit's one loading-placeholder primitive. Every atom and molecule exposes a skeleton
        prop that renders through it with the component's exact geometry, so layouts never shift
        when content arrives.
      </Text>

      <Heading level={2}>Anatomy</Heading>
      <Text tone={TextTone.Muted}>An inspection with the exact spec measurements labelled on the box.</Text>
      <ComponentBlueprint specId="skeleton" />

      <Heading level={2}>Examples</Heading>

      <Example
        title="Shapes"
        description="Three variants cover every placeholder: a 1em text line, a rounded rect, and a circle."
        code={`import { Skeleton } from '@glacier/react';

<Skeleton variant={SkeletonVariant.Text} width="14ch" />
<Skeleton variant={SkeletonVariant.Rect} width="8rem" height="2.75rem" />
<Skeleton variant={SkeletonVariant.Circle} width="2.5rem" />`}
      >
        <Skeleton variant={SkeletonVariant.Text} width="14ch" />
        <Skeleton variant={SkeletonVariant.Rect} width="8rem" height="2.75rem" />
        <Skeleton variant={SkeletonVariant.Circle} width="2.5rem" />
      </Example>

      <Example
        title="Component skeletons"
        description="Prefer the skeleton prop on components over hand-built shapes: the placeholder reuses the same tokens, so it always matches."
        code={`<Button skeleton />
<Button skeleton size={Size.Large} />
<IconButton skeleton aria-label="Add" />`}
      >
        <Button skeleton />
        <Button skeleton size={Size.Large} />
        <IconButton skeleton aria-label="Add" />
      </Example>

      <Example
        title="Swap on load"
        description="Skeletons hold the exact space of the loaded state. Toggle this demo and watch nothing move."
        code={`const [loaded, setLoaded] = useState(false);

// Each component's own skeleton prop holds its exact geometry, so one structure
// covers both states and nothing shifts on load.
<Card style={{ width: '18rem' }}>
  <Stack gap={2}>
    <Text weight="semibold" skeleton={!loaded}>Quarterly report</Text>
    <Text size={Size.Small} tone={TextTone.Muted} skeleton={!loaded}>Ready to review and share.</Text>
  </Stack>
</Card>`}
      >
        <Stack gap={4}>
          <Card style={{ width: '18rem' }}>
            <Stack gap={2}>
              <Text weight="semibold" skeleton={!loaded}>
                Quarterly report
              </Text>
              <Text size={Size.Small} tone={TextTone.Muted} skeleton={!loaded}>
                Ready to review and share.
              </Text>
            </Stack>
          </Card>
          <div>
            <Button size={Size.Small} variant={Variant.Soft} onClick={() => setLoaded((v) => !v)}>
              {loaded ? 'Show skeleton' : 'Load content'}
            </Button>
          </div>
        </Stack>
      </Example>

      <Heading level={2}>Props</Heading>
      <PropsTable
        props={[
          { name: 'variant', type: "'text' | 'rect' | 'circle'", default: "'rect'", description: 'text is a 1em line that scales with font size; circle defaults its height to its width.' },
          { name: 'width', type: 'string | number', description: 'Any CSS width, including token vars and ch units.' },
          { name: 'height', type: 'string | number', description: 'Any CSS height. Defaults to 1em for text and to width for circles.' },
          { name: 'radius', type: 'string', description: 'Corner radius override, e.g. var(--glacier-control-radius).' },
        ]}
      />

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>Skeletons are decorative: aria-hidden, no roles, no labels. Component skeleton modes render no interactive elements.</li>
        <li>Mark the loading region itself with aria-busy and announce completion at the app level; individual placeholders stay silent.</li>
        <li>The shimmer becomes a gentle opacity pulse under prefers-reduced-motion.</li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>Use the skeleton prop on components first; reach for raw shapes only for custom layouts.</li>
        <li>Skeletons suit content-shaped waits like cards, lists, and text. Use Spinner for short indeterminate actions and ProgressBar when progress is measurable.</li>
        <li>Match counts to reality: two lines for a two-line result. Guessing tall wastes the no-shift guarantee.</li>
      </ul>
    </>
  );
}
