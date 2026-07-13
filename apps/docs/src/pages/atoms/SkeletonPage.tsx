import { Button, Card, IconButton, Stack, Text, Heading, Size, TextTone, Variant, SkeletonVariant, useT } from '@glacier/react';
import { useState } from 'react';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { Example, PropsTable } from '../../docs-ui.tsx';
import { m } from '../../i18n.ts';

export function SkeletonPage() {
  const t = useT();
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <Heading level={1}>{t(m.skelName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(m.skelLede)}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.skelAnatomyIntro)}</Text>
      <ComponentBlueprint specId="skeleton" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.skelEx1Title)}
        description={t(m.skelEx1Desc)}
        component="Skeleton"
        render={(K) => (
          <>
            <K.Skeleton variant={SkeletonVariant.Text} width="14ch" />
            <K.Skeleton variant={SkeletonVariant.Rect} width="8rem" height="2.75rem" />
            <K.Skeleton variant={SkeletonVariant.Circle} width="2.5rem" />
          </>
        )}
        code={`import { Skeleton } from '@glacier/react';

<Skeleton variant={SkeletonVariant.Text} width="14ch" />
<Skeleton variant={SkeletonVariant.Rect} width="8rem" height="2.75rem" />
<Skeleton variant={SkeletonVariant.Circle} width="2.5rem" />`}
      />

      <Example
        title={t(m.skelEx2Title)}
        description={t(m.skelEx2Desc)}
        code={`<Button skeleton />
<Button skeleton size={Size.Large} />
<IconButton skeleton aria-label="Add" />`}
      >
        <Button skeleton />
        <Button skeleton size={Size.Large} />
        <IconButton skeleton aria-label={t(m.skeletonAdd)} />
      </Example>

      <Example
        title={t(m.skelEx3Title)}
        description={t(m.skelEx3Desc)}
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
                {t(m.skelDemoTitle)}
              </Text>
              <Text size={Size.Small} tone={TextTone.Muted} skeleton={!loaded}>
                {t(m.skelDemoBody)}
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

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'variant', type: "'text' | 'rect' | 'circle'", default: "'rect'", description: t(m.skelPropVariant) },
          { name: 'width', type: 'string | number', description: t(m.skelPropWidth) },
          { name: 'height', type: 'string | number', description: t(m.skelPropHeight) },
          { name: 'radius', type: 'string', description: t(m.skelPropRadius) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{t(m.skelA11y1)}</li>
        <li>{t(m.skelA11y2)}</li>
        <li>{t(m.skelA11y3)}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{t(m.skelUse1)}</li>
        <li>{t(m.skelUse2)}</li>
        <li>{t(m.skelUse3)}</li>
      </ul>
    </>
  );
}
