import { useState } from 'react';
import { Button, Pill, Row, Stack, Text, Heading, Size, TextTone, Tone, Variant, useT } from '@glacier/react';
import { BookOpen, Hash } from '@glacier/icons';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

const GENRES = ['Fiction', 'History', 'Sci-Fi', 'Poetry'];

function RemovableTags() {
  const t = useT();
  const [tags, setTags] = useState(GENRES);
  return (
    <Row gap={4} wrap>
      {tags.map((tag) => (
        <Pill key={tag} tone={Tone.Accent} onRemove={() => setTags((prev) => prev.filter((t) => t !== tag))}>
          {tag}
        </Pill>
      ))}
      {tags.length === 0 && (
        <Button variant={Variant.Ghost} size={Size.Small} onClick={() => setTags(GENRES)}>
          {t(m.pillReset)}
        </Button>
      )}
    </Row>
  );
}

export function PillPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.pillName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.pillLede))}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.pillAnatomyIntro)}</Text>
      <ComponentBlueprint specId="pill" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.secTones)}
        description={prose(t(m.pillEx1Desc))}
        component="Pill"
        render={(K) => (
          <Row gap={4} wrap>
            <K.Pill>{t(m.pillNeutral)}</K.Pill>
            <K.Pill tone={Tone.Accent}>{t(m.pillAccent)}</K.Pill>
            <K.Pill tone={Tone.Success}>{t(m.pillSuccess)}</K.Pill>
            <K.Pill tone={Tone.Warning}>{t(m.pillWarning)}</K.Pill>
            <K.Pill tone={Tone.Danger}>{t(m.pillDanger)}</K.Pill>
            <K.Pill tone={Tone.Info}>{t(m.pillInfo)}</K.Pill>
          </Row>
        )}
        code={`import { Pill } from '@glacier/react';

<Pill>Neutral</Pill>
<Pill tone={Tone.Accent}>Accent</Pill>
<Pill tone={Tone.Success}>Success</Pill>
<Pill tone={Tone.Warning}>Warning</Pill>
<Pill tone={Tone.Danger}>Danger</Pill>
<Pill tone={Tone.Info}>Info</Pill>`}
      />

      <Example
        title={t(m.secVariants)}
        description={prose(t(m.pillEx2Desc))}
        component="Pill"
        render={(K) => (
          <Stack gap={4}>
            <Row gap={4} wrap>
              <K.Pill tone={Tone.Accent} variant={Variant.Soft}>
                {t(m.pillSoft)}
              </K.Pill>
              <K.Pill tone={Tone.Accent} variant={Variant.Solid}>
                {t(m.pillSolid)}
              </K.Pill>
              <K.Pill tone={Tone.Accent} variant={Variant.Outline}>
                {t(m.pillOutline)}
              </K.Pill>
            </Row>
            <Row gap={4} wrap>
              <K.Pill tone={Tone.Danger} variant={Variant.Soft}>
                {t(m.pillSoft)}
              </K.Pill>
              <K.Pill tone={Tone.Danger} variant={Variant.Solid}>
                {t(m.pillSolid)}
              </K.Pill>
              <K.Pill tone={Tone.Danger} variant={Variant.Outline}>
                {t(m.pillOutline)}
              </K.Pill>
            </Row>
          </Stack>
        )}
        code={`<Pill tone={Tone.Accent} variant={Variant.Soft}>Soft</Pill>
<Pill tone={Tone.Accent} variant={Variant.Solid}>Solid</Pill>
<Pill tone={Tone.Accent} variant={Variant.Outline}>Outline</Pill>

<Pill tone={Tone.Danger} variant={Variant.Soft}>Soft</Pill>
<Pill tone={Tone.Danger} variant={Variant.Solid}>Solid</Pill>
<Pill tone={Tone.Danger} variant={Variant.Outline}>Outline</Pill>`}
      />

      <Example
        title={t(m.secSizes)}
        description={prose(t(m.pillEx3Desc))}
        component="Pill"
        render={(K) => (
          <Row gap={4} wrap>
            <K.Pill size={Size.Small} tone={Tone.Info}>
              {t(m.pillSm)}
            </K.Pill>
            <K.Pill size={Size.Medium} tone={Tone.Info}>
              {t(m.pillMd)}
            </K.Pill>
            <K.Pill size={Size.Small} tone={Tone.Accent} variant={Variant.Solid}>
              {t(m.pillX3New)}
            </K.Pill>
          </Row>
        )}
        code={`<Pill size={Size.Small} tone={Tone.Info}>sm</Pill>
<Pill size={Size.Medium} tone={Tone.Info}>md</Pill>
<Pill size={Size.Small} tone={Tone.Accent} variant={Variant.Solid}>3 new</Pill>`}
      />

      <Example
        title={t(m.pillEx4Title)}
        description={prose(t(m.pillEx4Desc))}
        component="Pill"
        render={(K) => (
          <Row gap={4} wrap>
            <K.Pill icon={<Hash size={12} />} tone={Tone.Info}>
              {t(m.pillTagged)}
            </K.Pill>
            <K.Pill icon={<BookOpen size={12} />} tone={Tone.Accent}>
              {t(m.pillFiction)}
            </K.Pill>
          </Row>
        )}
        code={`import { Hash, BookOpen } from '@glacier/icons';

<Pill icon={<Hash size={12} />} tone={Tone.Info}>Tagged</Pill>
<Pill icon={<BookOpen size={12} />} tone={Tone.Accent}>Fiction</Pill>`}
      />

      <Example
        title={t(m.pillEx5Title)}
        description={prose(t(m.pillEx5Desc))}
        code={`const [tags, setTags] = useState(genres);

{tags.map((tag) => (
  <Pill key={tag} tone={Tone.Accent} onRemove={() => setTags((p) => p.filter((t) => t !== tag))}>
    {tag}
  </Pill>
))}`}
      >
        <RemovableTags />
      </Example>

      <Example
        title={t(m.pillEx6Title)}
        description={t(m.pillEx6Desc)}
        code={`<Row gap={4} wrap>
  <Text as="span" weight="medium">api-server</Text>
  <Pill tone={Tone.Success} size={Size.Small}>Build passing</Pill>
  <Text as="span" size={Size.Small} tone={TextTone.Muted}>Deployed 4 minutes ago</Text>
</Row>`}
      >
        <Stack gap={4}>
          <Row gap={4} wrap>
            <Text as="span" weight="medium">
              {t(m.pillApiServer)}
            </Text>
            <Pill tone={Tone.Success} size={Size.Small}>
              {t(m.pillDemoBuildPassing)}
            </Pill>
            <Text as="span" size={Size.Small} tone={TextTone.Muted}>
              {t(m.pillDemoDeployed)}
            </Text>
          </Row>
          <Row gap={4} wrap>
            <Text as="span" weight="medium">
              {t(m.pillWorkerQueue)}
            </Text>
            <Pill tone={Tone.Warning} size={Size.Small}>
              {t(m.pillDegraded)}
            </Pill>
            <Text as="span" size={Size.Small} tone={TextTone.Muted}>
              {t(m.pillDemoRetrying)}
            </Text>
          </Row>
        </Stack>
      </Example>

      <Example
        title={t(m.exSkeleton)}
        description={prose(t(m.pillEx7Desc))}
        code={`<Pill skeleton size={Size.Small} />
<Pill size={Size.Small} tone={Tone.Success}>Build passing</Pill>
<Pill skeleton />
<Pill tone={Tone.Info}>In review</Pill>`}
      >
        <Row gap={4} wrap>
          <Pill skeleton size={Size.Small} />
          <Pill size={Size.Small} tone={Tone.Success}>
            {t(m.pillDemoBuildPassing)}
          </Pill>
          <Pill skeleton />
          <Pill tone={Tone.Info}>{t(m.pillDemoInReview)}</Pill>
        </Row>
      </Example>

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          {
            name: 'tone',
            type: "'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info'",
            default: "'neutral'",
            description: t(m.pillPropTone),
          },
          {
            name: 'variant',
            type: "'soft' | 'solid' | 'outline'",
            default: "'soft'",
            description: t(m.pillPropVariant),
          },
          {
            name: 'size',
            type: "'sm' | 'md'",
            default: "'md'",
            description: t(m.pillPropSize),
          },
          {
            name: 'icon',
            type: 'ReactNode',
            description: t(m.pillPropIcon),
          },
          {
            name: 'onRemove',
            type: '() => void',
            description: t(m.pillPropOnRemove),
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: t(m.pillPropSkeleton),
          },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.pillA11y1))}</li>
        <li>{prose(t(m.pillA11y2))}</li>
        <li>{prose(t(m.pillA11y3))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.pillUse1))}</li>
        <li>{prose(t(m.pillUse2))}</li>
        <li>{prose(t(m.pillUse3))}</li>
      </ul>
    </>
  );
}
