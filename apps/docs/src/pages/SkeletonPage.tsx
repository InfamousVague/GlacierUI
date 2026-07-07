import { Button, Card, IconButton, Skeleton, Stack, Text } from '@perfect/react';
import { useState } from 'react';
import { ComponentBlueprint } from '../Blueprint.tsx';
import { Example, PropsTable } from '../docs-ui.tsx';

export function SkeletonPage() {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <h1>Skeleton</h1>
      <p className="lede">
        The kit's one loading-placeholder primitive. Every atom and molecule exposes a skeleton
        prop that renders through it with the component's exact geometry, so layouts never shift
        when content arrives.
      </p>

      <h2>Anatomy</h2>
      <p>An inspection with the exact spec measurements labelled on the box.</p>
      <ComponentBlueprint specId="skeleton" />

      <h2>Examples</h2>

      <Example
        title="Shapes"
        description="Three variants cover every placeholder: a 1em text line, a rounded rect, and a circle."
        code={`import { Skeleton } from '@perfect/react';

<Skeleton variant="text" width="14ch" />
<Skeleton variant="rect" width="8rem" height="2.75rem" />
<Skeleton variant="circle" width="2.5rem" />`}
      >
        <Skeleton variant="text" width="14ch" />
        <Skeleton variant="rect" width="8rem" height="2.75rem" />
        <Skeleton variant="circle" width="2.5rem" />
      </Example>

      <Example
        title="Component skeletons"
        description="Prefer the skeleton prop on components over hand-built shapes: the placeholder reuses the same tokens, so it always matches."
        code={`<Button skeleton />
<Button skeleton size="lg" />
<IconButton skeleton aria-label="Add" />`}
      >
        <Button skeleton />
        <Button skeleton size="lg" />
        <IconButton skeleton aria-label="Add" />
      </Example>

      <Example
        title="Swap on load"
        description="Skeletons hold the exact space of the loaded state. Toggle this demo and watch nothing move."
        code={`const [loaded, setLoaded] = useState(false);

<Card style={{ width: '18rem' }}>
  {loaded ? (
    <>
      <Text weight="semibold">Quarterly report</Text>
      <Text size="sm" tone="muted">Ready to review and share.</Text>
    </>
  ) : (
    <Stack gap={2}>
      <Skeleton variant="text" width="10ch" />
      <Skeleton variant="text" width="100%" />
    </Stack>
  )}
</Card>`}
      >
        <Stack gap={4}>
          <Card style={{ width: '18rem' }}>
            {loaded ? (
              <>
                <Text weight="semibold">Quarterly report</Text>
                <Text size="sm" tone="muted">
                  Ready to review and share.
                </Text>
              </>
            ) : (
              <Stack gap={2}>
                <Skeleton variant="text" width="10ch" />
                <Skeleton variant="text" width="100%" />
              </Stack>
            )}
          </Card>
          <div>
            <Button size="sm" variant="soft" onClick={() => setLoaded((v) => !v)}>
              {loaded ? 'Show skeleton' : 'Load content'}
            </Button>
          </div>
        </Stack>
      </Example>

      <h2>Props</h2>
      <PropsTable
        props={[
          { name: 'variant', type: "'text' | 'rect' | 'circle'", default: "'rect'", description: 'text is a 1em line that scales with font size; circle defaults its height to its width.' },
          { name: 'width', type: 'string | number', description: 'Any CSS width, including token vars and ch units.' },
          { name: 'height', type: 'string | number', description: 'Any CSS height. Defaults to 1em for text and to width for circles.' },
          { name: 'radius', type: 'string', description: 'Corner radius override, e.g. var(--perfect-control-radius).' },
        ]}
      />

      <h2>Accessibility</h2>
      <ul>
        <li>Skeletons are decorative: aria-hidden, no roles, no labels. Component skeleton modes render no interactive elements.</li>
        <li>Mark the loading region itself with aria-busy and announce completion at the app level; individual placeholders stay silent.</li>
        <li>The shimmer becomes a gentle opacity pulse under prefers-reduced-motion.</li>
      </ul>

      <h2>Usage</h2>
      <ul>
        <li>Use the skeleton prop on components first; reach for raw shapes only for custom layouts.</li>
        <li>Skeletons suit content-shaped waits like cards, lists, and text. Use Spinner for short indeterminate actions and ProgressBar when progress is measurable.</li>
        <li>Match counts to reality: two lines for a two-line result. Guessing tall wastes the no-shift guarantee.</li>
      </ul>
    </>
  );
}
