import { Field, NumberInput, Row, Stack, Text, Heading, Size, TextTone, useT } from '@glacier/react';
import { useState } from 'react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

export function NumberInputPage() {
  const t = useT();
  const [quantity, setQuantity] = useState(1);

  return (
    <>
      <Heading level={1}>{t(m.niName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.niLede))}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.niAnatomyIntro)}</Text>
      <ComponentBlueprint specId="number-input" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.exBasic)}
        description={t(m.niEx1Desc)}
        component="NumberInput"
        render={(K) => <K.NumberInput aria-label={t(m.numberinputQuantity)} defaultValue={1} />}
        code={`import { NumberInput } from '@glacier/react';

<NumberInput aria-label="Quantity" defaultValue={1} />`}
      />

      <Example
        title={t(m.niEx2Title)}
        description={t(m.niEx2Desc)}
        code={`const [quantity, setQuantity] = useState(1);

<NumberInput aria-label="Quantity" value={quantity} onValueChange={setQuantity} />
<Text as="span" size={Size.Small} tone={TextTone.Muted} mono>{quantity} in cart</Text>`}
      >
        <NumberInput aria-label={t(m.numberinputQuantity)} value={quantity} onValueChange={setQuantity} />
        <Text as="span" size={Size.Small} tone={TextTone.Muted} mono>
          {quantity} {t(m.numberinputInCart)}
        </Text>
      </Example>

      <Example
        title={t(m.niEx3Title)}
        description={t(m.niEx3Desc)}
        component="NumberInput"
        render={(K) => <K.NumberInput aria-label={t(m.numberinputServings)} defaultValue={2} min={1} max={8} step={1} />}
        code={`<NumberInput aria-label="Servings" defaultValue={2} min={1} max={8} step={1} />`}
      />

      <Example
        title={t(m.niEx4Title)}
        description={t(m.niEx4Desc)}
        component="NumberInput"
        render={(K) => <K.NumberInput aria-label={t(m.numberinputAmount)} defaultValue={0} min={0} max={500} />}
        code={`<NumberInput aria-label="Amount" defaultValue={0} min={0} max={500} />`}
      />

      <Example
        title={t(m.secSizes)}
        description={t(m.niEx5Desc)}
        component="NumberInput"
        render={(K) => (
          <Row gap={3} wrap>
            <K.NumberInput aria-label={t(m.numberinputSmall)} size={Size.Small} defaultValue={1} />
            <K.NumberInput aria-label={t(m.numberinputMedium)} size={Size.Medium} defaultValue={1} />
            <K.NumberInput aria-label={t(m.numberinputLarge)} size={Size.Large} defaultValue={1} />
          </Row>
        )}
        code={`<NumberInput aria-label="Small" size={Size.Small} defaultValue={1} />
<NumberInput aria-label="Medium" size={Size.Medium} defaultValue={1} />
<NumberInput aria-label="Large" size={Size.Large} defaultValue={1} />`}
      />

      <Example
        title={t(m.niEx6Title)}
        description={t(m.niEx6Desc)}
        code={`<Field label="Guests" hint="Up to eight per reservation.">
  <NumberInput defaultValue={2} min={1} max={8} />
</Field>`}
      >
        <Field label={t(m.numberinputGuests)} hint={t(m.niHintGuests)}>
          <NumberInput defaultValue={2} min={1} max={8} />
        </Field>
      </Example>

      <Example
        title={t(m.exSkeleton)}
        description={t(m.niEx7Desc)}
        component="NumberInput"
        render={(K) => (
          <Stack gap={4}>
            <K.NumberInput skeleton />
            <K.NumberInput aria-label={t(m.numberinputQuantity)} defaultValue={1} />
          </Stack>
        )}
        code={`<NumberInput skeleton />
<NumberInput aria-label="Quantity" defaultValue={1} />`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'value', type: 'number', description: t(m.niPropValue) },
          { name: 'defaultValue', type: 'number', default: '0', description: t(m.niPropDefaultValue) },
          { name: 'min', type: 'number', description: t(m.niPropMin) },
          { name: 'max', type: 'number', description: t(m.niPropMax) },
          { name: 'step', type: 'number', default: '1', description: t(m.niPropStep) },
          { name: 'onValueChange', type: '(value: number) => void', description: t(m.niPropOnValueChange) },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: t(m.niPropSize) },
          { name: 'disabled', type: 'boolean', default: 'false', description: t(m.niPropDisabled) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(m.niPropSkeleton) },
          { name: 'aria-label', type: 'string', description: t(m.niPropAriaLabel) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.niA11y1))}</li>
        <li>{prose(t(m.niA11y2))}</li>
        <li>{prose(t(m.niA11y3))}</li>
      </ul>

      <Heading level={2}>{t(m.niSecHaptics)}</Heading>
      <ul>
        <li>{prose(t(m.niHap1))}</li>
        <li>{prose(t(m.niHap2))}</li>
        <li>{prose(t(m.niHap3))}</li>
        <li>{prose(t(m.niHap4))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.niUse1))}</li>
        <li>{prose(t(m.niUse2))}</li>
        <li>{prose(t(m.niUse3))}</li>
      </ul>
    </>
  );
}
