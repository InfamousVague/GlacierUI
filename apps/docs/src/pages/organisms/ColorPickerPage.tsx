import { Heading, Size, Text, TextTone, useT } from '@glacier/react';
import { useState } from 'react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { type PlatformKit } from '../../platforms.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

/** The kit's own accent ramp, so the presets are a real palette. */
const PRESETS = [
  'oklch(0.64 0.162 228)',
  'oklch(0.68 0.15 150)',
  'oklch(0.75 0.15 75)',
  'oklch(0.62 0.19 25)',
  'oklch(0.55 0.16 300)',
  'oklch(0.5 0.02 260)',
];

function PickerDemo({ K, ...props }: { K: PlatformKit } & Record<string, unknown>) {
  const t = useT();
  const [value, setValue] = useState('oklch(0.64 0.162 228)');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--glacier-space-2)', width: '100%' }}>
      <K.ColorPicker value={value} onValueChange={setValue} aria-label={t(m.cpkName)} {...props} />
      <Text tone={TextTone.Muted} size={Size.Small} mono>
        {value}
      </Text>
    </div>
  );
}

export function ColorPickerPage() {
  const t = useT();

  return (
    <>
      <Heading level={1}>{t(m.cpkName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(m.cpkLede)}
      </Text>
      <Text tone={TextTone.Muted}>{prose(t(m.cpkWhyOklch))}</Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.cpkAnatomy)}</Text>
      <ComponentBlueprint specId="color-picker" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.exBasic)}
        description={t(m.cpkExBasicDesc)}
        component="ColorPicker"
        render={(K) => <PickerDemo K={K} />}
        code={`import { ColorPicker } from '@glacier/react';

const [color, setColor] = useState('oklch(0.64 0.162 228)');

<ColorPicker value={color} onValueChange={setColor} aria-label="Brand colour" />

// Or report hex, which is what most APIs still want:
<ColorPicker format="hex" onValueChange={save} />`}
      />

      <Example
        title={t(m.cpkExPresetsTitle)}
        description={t(m.cpkExPresetsDesc)}
        component="ColorPicker"
        render={(K) => <PickerDemo K={K} presets={PRESETS} alpha />}
        code={`<ColorPicker
  presets={[
    'oklch(0.64 0.162 228)',
    'oklch(0.68 0.15 150)',
    'oklch(0.62 0.19 25)',
  ]}
  alpha
/>`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'value', type: 'string', description: t(m.cpkPropValue) },
          { name: 'defaultValue', type: 'string', default: "'oklch(0.64 0.162 228)'", description: t(m.cpkPropValue) },
          { name: 'onValueChange', type: '(value: string) => void', description: t(m.cpkPropValue) },
          { name: 'format', type: "'oklch' | 'hex'", default: "'oklch'", description: t(m.cpkPropFormat) },
          { name: 'presets', type: 'string[]', description: t(m.cpkPropPresets) },
          { name: 'alpha', type: 'boolean', default: 'false', description: t(m.cpkPropAlpha) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.cpkA11y1))}</li>
        <li>{prose(t(m.cpkA11y2))}</li>
        <li>{prose(t(m.cpkA11y3))}</li>
        <li>{prose(t(m.cpkA11y4))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.cpkUse1))}</li>
        <li>{prose(t(m.cpkUse2))}</li>
        <li>{prose(t(m.cpkUse3))}</li>
      </ul>
    </>
  );
}
