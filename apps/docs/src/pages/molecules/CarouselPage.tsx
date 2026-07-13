import { Carousel, Card, Heading, Text, Size, TextTone, useT } from '@glacier/react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

const cards = ['Nebula', 'Aurora', 'Comet', 'Eclipse', 'Meridian', 'Quasar', 'Zephyr'];

export function CarouselPage() {
  const t = useT();

  function DemoCard({ title }: { title: string }) {
    return (
      <Card style={{ width: '12rem' }}>
        <Heading level={4}>{title}</Heading>
        <Text tone={TextTone.Muted} size={Size.Small}>
          {t(m.carDemoCardText)}
        </Text>
      </Card>
    );
  }

  return (
    <>
      <Heading level={1}>{t(m.carName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(m.carLede)}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.carAnatomyIntro)}</Text>
      <ComponentBlueprint specId="carousel" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.exBasic)}
        description={t(m.carEx1Desc)}
        component="Carousel"
        render={(K) => (
          <K.Carousel aria-label={t(m.carAriaFeatured)}>
            {cards.map((title) => (
              <DemoCard key={title} title={title} />
            ))}
          </K.Carousel>
        )}
        code={`import { Carousel, Card } from '@glacier/react';

<Carousel aria-label="Featured">
  <Card style={{ width: '12rem' }}>Nebula</Card>
  <Card style={{ width: '12rem' }}>Aurora</Card>
  <Card style={{ width: '12rem' }}>Comet</Card>
</Carousel>`}
      />

      <Example
        title={t(m.carEx2Title)}
        description={t(m.carEx2Desc)}
        component="Carousel"
        render={(K) => (
          <K.Carousel showControls aria-label={t(m.carAriaFeaturedControls)}>
            {cards.map((title) => (
              <DemoCard key={title} title={title} />
            ))}
          </K.Carousel>
        )}
        code={`<Carousel showControls aria-label="Featured">
  {items.map((item) => (
    <Card key={item.id} style={{ width: '12rem' }}>{item.title}</Card>
  ))}
</Carousel>`}
      />

      <Example
        title={t(m.carEx3Title)}
        description={t(m.carEx3Desc)}
        component="Carousel"
        render={(K) => (
          <K.Carousel gap="var(--glacier-space-6)" aria-label={t(m.carAriaRoomy)}>
            {cards.map((title) => (
              <DemoCard key={title} title={title} />
            ))}
          </K.Carousel>
        )}
        code={`<Carousel gap="var(--glacier-space-6)" aria-label="Roomy">
  {/* cards */}
</Carousel>`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'children', type: 'ReactNode', description: t(m.carPropChildren) },
          { name: 'showControls', type: 'boolean', default: 'false', description: t(m.carPropShowControls) },
          { name: 'gap', type: 'string', default: "'var(--glacier-space-4)'", description: t(m.carPropGap) },
          { name: 'aria-label', type: 'string', description: t(m.carPropAriaLabel) },
          { name: 'className', type: 'string', description: t(m.carPropClassName) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.carA11y1))}</li>
        <li>{t(m.carA11y2)}</li>
        <li>{t(m.carA11y3)}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{t(m.carUse1)}</li>
        <li>{prose(t(m.carUse2))}</li>
        <li>{t(m.carUse3)}</li>
      </ul>
    </>
  );
}
