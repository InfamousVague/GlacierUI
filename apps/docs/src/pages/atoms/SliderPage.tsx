import { Box, Field, Slider, Stack, Text, Heading, Size, TextTone } from '@glacier/react';
import { useState, type CSSProperties } from 'react';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { Example, PropsTable } from '../../docs-ui.tsx';

export function SliderPage() {
  const [volume, setVolume] = useState(40);
  const [scale, setScale] = useState(1);

  return (
    <>
      <Heading level={1}>Slider</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        A styled native range input with a filled leading track and an iOS-style thumb. The
        Preferences dialog uses it for corner rounding.
      </Text>

      <Heading level={2}>Anatomy</Heading>
      <Text tone={TextTone.Muted}>An inspection with the exact spec measurements labelled on the box.</Text>
      <ComponentBlueprint specId="slider" />

      <Heading level={2}>Examples</Heading>

      <Example
        title="Basic"
        description="A range from min to max. The filled track follows the value."
        code={`import { Slider } from '@glacier/react';

<Slider aria-label="Brightness" defaultValue={60} />`}
      >
        <Box style={{ width: '18rem' }}>
          <Slider aria-label="Brightness" defaultValue={60} />
        </Box>
      </Example>

      <Example
        title="Controlled with a value readout"
        description="Drive it with state through value and onValueChange. Use mono Text for the readout so digits do not shift."
        code={`const [volume, setVolume] = useState(40);

<Slider aria-label="Volume" value={volume} onValueChange={setVolume} />
<Text as="span" size={Size.Small} tone={TextTone.Muted} mono>{volume}%</Text>`}
      >
        <Box style={{ width: '18rem' }}>
          <Slider aria-label="Volume" value={volume} onValueChange={setVolume} />
        </Box>
        <Text as="span" size={Size.Small} tone={TextTone.Muted} mono>
          {volume}%
        </Text>
      </Example>

      <Example
        title="Vertical"
        description={'orientation="vertical" stands the rail up and fills from the bottom, for volume-style controls. Set the height with the --slider-length custom property.'}
        code={`<Slider
  aria-label="Volume"
  orientation="vertical"
  value={volume}
  onValueChange={setVolume}
  style={{ '--slider-length': '10rem' }}
/>`}
      >
        <Box style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--glacier-space-4)' }}>
          <Slider
            aria-label="Volume"
            orientation="vertical"
            value={volume}
            onValueChange={setVolume}
            style={{ '--slider-length': '10rem' } as CSSProperties}
          />
          <Text as="span" size={Size.Small} tone={TextTone.Muted} mono>
            {volume}%
          </Text>
        </Box>
      </Example>

      <Example
        title="Steps and bounds"
        description="min, max, and step map straight to the native attributes. Arrow keys nudge by one step."
        code={`const [scale, setScale] = useState(1);

<Slider aria-label="Radius scale" min={0} max={2} step={0.05} value={scale} onValueChange={setScale} />
<Text as="span" size={Size.Small} mono>{scale.toFixed(2)}x</Text>`}
      >
        <Box style={{ width: '18rem' }}>
          <Slider aria-label="Radius scale" min={0} max={2} step={0.05} value={scale} onValueChange={setScale} />
        </Box>
        <Text as="span" size={Size.Small} mono>
          {scale.toFixed(2)}x
        </Text>
      </Example>

      <Example
        title="In a Field"
        description="Inside a Field the slider picks up the label and hint wiring."
        code={`<Field label="Animation speed" hint="Applies to every kit transition.">
  <Slider min={0} max={2} step={0.1} defaultValue={1} />
</Field>`}
      >
        <Box style={{ width: '18rem' }}>
          <Field label="Animation speed" hint="Applies to every kit transition.">
            <Slider min={0} max={2} step={0.1} defaultValue={1} />
          </Field>
        </Box>
      </Example>

      <Example
        title="Disabled"
        code={`<Slider aria-label="Locked" defaultValue={30} disabled />`}
      >
        <Box style={{ width: '18rem' }}>
          <Slider aria-label="Locked" defaultValue={30} disabled />
        </Box>
      </Example>

      <Example
        title="Skeleton"
        description="Set skeleton while the backing value loads. The placeholder is the full-width track shape, so the control does not shift when the real slider arrives."
        code={`<Slider skeleton />
<Slider aria-label="Brightness" defaultValue={60} />`}
      >
        <Stack gap={4} style={{ width: '18rem' }}>
          <Slider skeleton />
          <Slider aria-label="Brightness" defaultValue={60} />
        </Stack>
      </Example>

      <Heading level={2}>Props</Heading>
      <PropsTable
        props={[
          { name: 'value', type: 'number', description: 'Controlled value.' },
          { name: 'defaultValue', type: 'number', default: 'min', description: 'Initial value for uncontrolled usage.' },
          { name: 'min', type: 'number', default: '0', description: 'Lower bound.' },
          { name: 'max', type: 'number', default: '100', description: 'Upper bound.' },
          { name: 'step', type: 'number', default: '1', description: 'Increment for drags and arrow keys.' },
          { name: 'onValueChange', type: '(value: number) => void', description: 'Called with the numeric value on every change.' },
          { name: 'skeleton', type: 'boolean', default: 'false', description: "Renders a placeholder with the component's exact geometry." },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the control.' },
          { name: 'aria-label', type: 'string', description: 'Accessible name. Not needed inside a Field with a label.' },
        ]}
      />

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>
          Renders a native <code>input type="range"</code>, so it exposes the slider role, value,
          and bounds without extra wiring.
        </li>
        <li>Arrow keys nudge by step; Home and End jump to the bounds; Page Up and Page Down take larger steps.</li>
        <li>Inside a Field the input inherits the label and hint ids.</li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>Show the current value next to the slider, in mono Text, whenever precision matters.</li>
        <li>Use a Select or number input instead when exact entry is the common case.</li>
        <li>Keep ranges short; a 0 to 2 scale with 0.05 steps beats a 0 to 200 scale with unit steps.</li>
      </ul>
    </>
  );
}
