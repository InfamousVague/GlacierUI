import { useState } from 'react';
import { AudioEqualizer, Heading, Size, Stack, Text, TextTone } from '@glacier/react';
import { Example, PropsTable } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';

const BANDS = [
  { id: '32', label: '32Hz' },
  { id: '64', label: '64Hz' },
  { id: '125', label: '125Hz' },
  { id: '250', label: '250Hz' },
  { id: '500', label: '500Hz' },
  { id: '1k', label: '1kHz' },
  { id: '2k', label: '2kHz' },
  { id: '4k', label: '4kHz' },
] as const;

function ControlledEqDemo() {
  const [values, setValues] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0]);
  return (
    <Stack gap={3} width="full" maxWidth="2xl">
      <AudioEqualizer aria-label="Playback equalizer" value={values} onValueChange={setValues} bands={BANDS} />
      <Text size="xs" tone="subtle" mono>
        {JSON.stringify(values)}
      </Text>
    </Stack>
  );
}

export function AudioEqualizerPage() {
  return (
    <>
      <Heading level={1}>Audio Equalizer</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        A multi-band equalizer for playback tuning. It exposes per-band dB control
        with optional presets and a reset path. The curve above the faders is
        live: press anywhere in a band&rsquo;s column to take its node, then drag
        up or down to set the gain. Each fader keeps step with it.
      </Text>

      <Heading level={2}>Anatomy</Heading>
      <Text tone={TextTone.Muted}>
        A measured blueprint of the preset row, the draggable response curve,
        per-band vertical faders, gain readouts, and frequency labels.
      </Text>
      <ComponentBlueprint specId="audio-equalizer" />

      <Heading level={2}>Examples</Heading>

      <Example
        title="Default"
        description="The default 8-band equalizer with preset switching."
        component="AudioEqualizer"
        code={`<AudioEqualizer aria-label="Playback equalizer" />`}
      >
        <AudioEqualizer aria-label="Playback equalizer" />
      </Example>

      <Example
        title="Controlled gains"
        description="Lift the full gain curve into state to persist custom tuning."
        component="AudioEqualizer"
        code={`const [values, setValues] = useState([0, 0, 0, 0, 0, 0, 0, 0]);

<AudioEqualizer
  aria-label="Playback equalizer"
  value={values}
  onValueChange={setValues}
/>`}
      >
        <ControlledEqDemo />
      </Example>

      <Example
        title="Compact and custom range"
        description="Use compact density and a narrower gain window for subtle tone shaping."
        component="AudioEqualizer"
        code={`<AudioEqualizer
  aria-label="Playback equalizer"
  size="sm"
  min={-6}
  max={6}
  step={0.5}
/>`}
      >
        <AudioEqualizer aria-label="Playback equalizer" size="sm" min={-6} max={6} step={0.5} />
      </Example>

      <Heading level={2}>Props</Heading>
      <PropsTable
        props={[
          { name: 'value', type: 'number[]', description: 'Controlled per-band gains in dB.' },
          { name: 'defaultValue', type: 'number[]', description: 'Initial gains when uncontrolled.' },
          { name: 'onValueChange', type: '(gains: number[]) => void', description: 'Called with the full gain array when any band changes.' },
          { name: 'bands', type: '{ id: string; label: string }[]', description: 'Frequency bands in low-to-high order.' },
          { name: 'presets', type: '{ id: string; label: string; gains: number[] }[]', description: 'Preset options rendered above the bands.' },
          { name: 'preset', type: 'string', description: 'Controlled selected preset id.' },
          { name: 'defaultPreset', type: 'string', description: 'Initial selected preset id when uncontrolled.' },
          { name: 'onPresetChange', type: '(id?: string) => void', description: 'Called when preset selection changes.' },
          { name: 'min', type: 'number', default: '-12', description: 'Per-band minimum gain in dB.' },
          { name: 'max', type: 'number', default: '12', description: 'Per-band maximum gain in dB.' },
          { name: 'step', type: 'number', default: '1', description: 'Gain step in dB.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Control density and slider travel.' },
          { name: 'hidePresets', type: 'boolean', default: 'false', description: 'Hides the preset selector row.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Blocks all controls and dims the component.' },
          { name: 'labels', type: 'Partial<AudioEqualizerLabels>', description: 'Localization overrides.' },
        ]}
      />
    </>
  );
}
