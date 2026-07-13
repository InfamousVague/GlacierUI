import { Field, Stack, Textarea, Heading, Text, Size, TextTone, useT } from '@glacier/react';
import { useState } from 'react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

export function TextareaPage() {
  const t = useT();
  const [bio, setBio] = useState('');

  return (
    <>
      <Heading level={1}>{t(m.txaName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.txaLede))}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.txaAnatomyIntro)}</Text>
      <ComponentBlueprint specId="textarea" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.exBasic)}
        description={t(m.txaEx1Desc)}
        component="Textarea"
        render={(K) => (
          <div style={{ width: '22rem' }}>
            <K.Textarea aria-label={t(m.textareaMessage)} placeholder={t(m.textareaWriteAMessage)} />
          </div>
        )}
        code={`import { Textarea } from '@glacier/react';

<Textarea aria-label="Message" placeholder="Write a message" />`}
      />

      <Example
        title={t(m.secSizes)}
        description={t(m.txaEx2Desc)}
        component="Textarea"
        render={(K) => (
          <Stack gap={4} style={{ width: '22rem' }}>
            <K.Textarea aria-label={t(m.textareaSmall)} size={Size.Small} placeholder={t(m.textareaSmall)} />
            <K.Textarea aria-label={t(m.textareaMedium)} size={Size.Medium} placeholder={t(m.textareaMedium)} />
            <K.Textarea aria-label={t(m.textareaLarge)} size={Size.Large} placeholder={t(m.textareaLarge)} />
          </Stack>
        )}
        code={`<Textarea aria-label="Small" size={Size.Small} placeholder="Small" />
<Textarea aria-label="Medium" size={Size.Medium} placeholder="Medium" />
<Textarea aria-label="Large" size={Size.Large} placeholder="Large" />`}
      />

      <Example
        title={t(m.txaEx3Title)}
        description={t(m.txaEx3Desc)}
        code={`const [bio, setBio] = useState('');

<Textarea
  aria-label="Bio"
  value={bio}
  onChange={(event) => setBio(event.target.value)}
  placeholder="Tell us about yourself"
/>`}
      >
        <div style={{ width: '22rem' }}>
          <Textarea
            aria-label={t(m.textareaBio)}
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            placeholder={t(m.textareaTellUsAboutYourself)}
          />
        </div>
      </Example>

      <Example
        title={t(m.txaEx4Title)}
        description={t(m.txaEx4Desc)}
        code={`<Field label="Feedback" hint="Tell us what could be better.">
  <Textarea placeholder="Your thoughts" />
</Field>`}
      >
        <div style={{ width: '22rem' }}>
          <Field label={t(m.textareaFeedback)} hint={t(m.textareaTellUsWhatCouldBe)}>
            <Textarea placeholder={t(m.textareaYourThoughts)} />
          </Field>
        </div>
      </Example>

      <Example
        title={t(m.exSkeleton)}
        description={t(m.txaEx5Desc)}
        component="Textarea"
        render={(K) => (
          <Stack gap={4} style={{ width: '22rem' }}>
            <K.Textarea skeleton />
            <K.Textarea aria-label={t(m.textareaMessage)} placeholder={t(m.textareaWriteAMessage)} />
          </Stack>
        )}
        code={`<Textarea skeleton />
<Textarea aria-label="Message" placeholder="Write a message" />`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          {
            name: 'size',
            type: "'sm' | 'md' | 'lg'",
            default: "'md'",
            description: t(m.txaPropSize),
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: t(m.txaPropSkeleton),
          },
          {
            name: 'value',
            type: 'string',
            description: t(m.txaPropValue),
          },
          {
            name: 'disabled',
            type: 'boolean',
            default: 'false',
            description: t(m.txaPropDisabled),
          },
          {
            name: 'aria-label',
            type: 'string',
            description: t(m.txaPropAriaLabel),
          },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.txaA11y1))}</li>
        <li>{prose(t(m.txaA11y2))}</li>
        <li>{prose(t(m.txaA11y3))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.txaUse1))}</li>
        <li>{prose(t(m.txaUse2))}</li>
        <li>{prose(t(m.txaUse3))}</li>
      </ul>
    </>
  );
}
