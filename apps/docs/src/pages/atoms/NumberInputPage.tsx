import { Field, NumberInput, Row, Stack, Text, Heading, Size, TextTone } from '@glacier/react';
import { useState } from 'react';
import { Example, PropsTable } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';

export function NumberInputPage() {
  const [quantity, setQuantity] = useState(1);

  return (
    <>
      <Heading level={1}>NumberInput</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        A numeric stepper: a minus button, a centered native number input with tabular figures, and a
        plus button, wrapped in one bordered group at control height. Results clamp to the bounds and
        the step buttons disable at the ends.
      </Text>

      <Heading level={2}>Anatomy</Heading>
      <Text tone={TextTone.Muted}>An inspection with the exact spec measurements labelled on the box.</Text>
      <ComponentBlueprint specId="number-input" />

      <Heading level={2}>Examples</Heading>

      <Example
        title="Basic"
        description="An uncontrolled stepper. Click the buttons or type a value directly."
        code={`import { NumberInput } from '@glacier/react';

<NumberInput aria-label="Quantity" defaultValue={1} />`}
      >
        <NumberInput aria-label="Quantity" defaultValue={1} />
      </Example>

      <Example
        title="Controlled with a readout"
        description="Drive it with state through value and onValueChange. Use mono Text for the readout so digits do not shift."
        code={`const [quantity, setQuantity] = useState(1);

<NumberInput aria-label="Quantity" value={quantity} onValueChange={setQuantity} />
<Text as="span" size={Size.Small} tone={TextTone.Muted} mono>{quantity} in cart</Text>`}
      >
        <NumberInput aria-label="Quantity" value={quantity} onValueChange={setQuantity} />
        <Text as="span" size={Size.Small} tone={TextTone.Muted} mono>
          {quantity} in cart
        </Text>
      </Example>

      <Example
        title="Bounds and step"
        description="min, max, and step map straight to the native attributes. The buttons clamp to the range and disable at the ends."
        code={`<NumberInput aria-label="Servings" defaultValue={2} min={1} max={8} step={1} />`}
      >
        <NumberInput aria-label="Servings" defaultValue={2} min={1} max={8} step={1} />
      </Example>

      <Example
        title="Sizes"
        description="sm, md, and lg match the shared control heights, so a stepper lines up with inputs and buttons on the same row."
        code={`<NumberInput aria-label="Small" size={Size.Small} defaultValue={1} />
<NumberInput aria-label="Medium" size={Size.Medium} defaultValue={1} />
<NumberInput aria-label="Large" size={Size.Large} defaultValue={1} />`}
      >
        <Row gap={3} wrap>
          <NumberInput aria-label="Small" size={Size.Small} defaultValue={1} />
          <NumberInput aria-label="Medium" size={Size.Medium} defaultValue={1} />
          <NumberInput aria-label="Large" size={Size.Large} defaultValue={1} />
        </Row>
      </Example>

      <Example
        title="In a Field"
        description="Inside a Field the input picks up the label and hint wiring."
        code={`<Field label="Guests" hint="Up to eight per reservation.">
  <NumberInput defaultValue={2} min={1} max={8} />
</Field>`}
      >
        <Field label="Guests" hint="Up to eight per reservation.">
          <NumberInput defaultValue={2} min={1} max={8} />
        </Field>
      </Example>

      <Example
        title="Skeleton"
        description="Set skeleton while the backing value loads. The placeholder is the stepper's exact geometry, so the control does not shift when the real value arrives."
        code={`<NumberInput skeleton />
<NumberInput aria-label="Quantity" defaultValue={1} />`}
      >
        <Stack gap={4}>
          <NumberInput skeleton />
          <NumberInput aria-label="Quantity" defaultValue={1} />
        </Stack>
      </Example>

      <Heading level={2}>Props</Heading>
      <PropsTable
        props={[
          { name: 'value', type: 'number', description: 'Controlled value.' },
          { name: 'defaultValue', type: 'number', default: '0', description: 'Initial value for uncontrolled usage.' },
          { name: 'min', type: 'number', description: 'Lower bound. Clamps results and disables the minus button.' },
          { name: 'max', type: 'number', description: 'Upper bound. Clamps results and disables the plus button.' },
          { name: 'step', type: 'number', default: '1', description: 'Increment for the step buttons.' },
          { name: 'onValueChange', type: '(value: number) => void', description: 'Called with the clamped number on every change.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Control height.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the input and both buttons.' },
          { name: 'skeleton', type: 'boolean', default: 'false', description: "Renders a placeholder with the component's exact geometry." },
          { name: 'aria-label', type: 'string', description: 'Accessible name. Not needed inside a Field with a label.' },
        ]}
      />

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>
          The centered control is a native <code>input type="number"</code>, so it exposes the
          spinbutton role and value to assistive tech.
        </li>
        <li>The step buttons are plain buttons labeled Decrease and Increase, and disable at the matching bound.</li>
        <li>Inside a Field the input inherits the label and hint ids.</li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>Reach for it when exact numeric entry matters; use a Slider when an approximate value read from position is enough.</li>
        <li>Set min and max whenever the value is bounded, so both entry paths stay in range.</li>
        <li>Keep step meaningful to the unit: whole guests, but tenths of a kilogram.</li>
      </ul>
    </>
  );
}
