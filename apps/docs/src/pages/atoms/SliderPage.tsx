import { Box, Field, Slider, Stack, Text, Heading, Size, TextTone, useT } from '@glacier/react';
import { useState, type CSSProperties } from 'react';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { m } from '../../i18n.ts';

export function SliderPage() {
  const t = useT();
  const [volume, setVolume] = useState(40);
  const [scale, setScale] = useState(1);

  return (
    <>
      <Heading level={1}>{t(m.sldName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(m.sldLede)}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.sldAnatomyIntro)}</Text>
      <ComponentBlueprint specId="slider" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.exBasic)}
        description={t(m.sldEx1Desc)}
        component="Slider"
        render={(K) => (
          <Box style={{ width: '18rem' }}>
            <K.Slider aria-label={t(m.sliderBrightness)} defaultValue={60} />
          </Box>
        )}
        code={`import { Slider } from '@glacier/react';

<Slider aria-label="Brightness" defaultValue={60} />`}
      />

      <Example
        title={t(m.sldEx2Title)}
        description={t(m.sldEx2Desc)}
        code={`const [volume, setVolume] = useState(40);

<Slider aria-label="Volume" value={volume} onValueChange={setVolume} />
<Text as="span" size={Size.Small} tone={TextTone.Muted} mono>{volume}%</Text>`}
      >
        <Box style={{ width: '18rem' }}>
          <Slider aria-label={t(m.sliderVolume)} value={volume} onValueChange={setVolume} />
        </Box>
        <Text as="span" size={Size.Small} tone={TextTone.Muted} mono>
          {volume}%
        </Text>
      </Example>

      <Example
        title={t(m.sldEx3Title)}
        description={t(m.sldEx3Desc)}
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
            aria-label={t(m.sliderVolume)}
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
        title={t(m.sldEx4Title)}
        description={t(m.sldEx4Desc)}
        code={`const [scale, setScale] = useState(1);

<Slider aria-label="Radius scale" min={0} max={2} step={0.05} value={scale} onValueChange={setScale} />
<Text as="span" size={Size.Small} mono>{scale.toFixed(2)}x</Text>`}
      >
        <Box style={{ width: '18rem' }}>
          <Slider aria-label={t(m.sliderRadiusScale)} min={0} max={2} step={0.05} value={scale} onValueChange={setScale} />
        </Box>
        <Text as="span" size={Size.Small} mono>
          {scale.toFixed(2)}{t(m.sliderX)}
        </Text>
      </Example>

      <Example
        title={t(m.sldEx5Title)}
        description={t(m.sldEx5Desc)}
        code={`<Field label="Animation speed" hint="Applies to every kit transition.">
  <Slider min={0} max={2} step={0.1} defaultValue={1} />
</Field>`}
      >
        <Box style={{ width: '18rem' }}>
          <Field label={t(m.sliderAnimationSpeed)} hint={t(m.sliderAppliesToEveryKitTransition)}>
            <Slider min={0} max={2} step={0.1} defaultValue={1} />
          </Field>
        </Box>
      </Example>

      <Example
        title={t(m.sldEx6Title)}
        component="Slider"
        render={(K) => (
          <Box style={{ width: '18rem' }}>
            <K.Slider aria-label={t(m.sliderLocked)} defaultValue={30} disabled />
          </Box>
        )}
        code={`<Slider aria-label="Locked" defaultValue={30} disabled />`}
      />

      <Example
        title={t(m.exSkeleton)}
        description={t(m.sldEx7Desc)}
        code={`<Slider skeleton />
<Slider aria-label="Brightness" defaultValue={60} />`}
      >
        <Stack gap={4} style={{ width: '18rem' }}>
          <Slider skeleton />
          <Slider aria-label={t(m.sliderBrightness)} defaultValue={60} />
        </Stack>
      </Example>

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'value', type: 'number', description: t(m.sldPropValue) },
          { name: 'defaultValue', type: 'number', default: 'min', description: t(m.sldPropDefaultValue) },
          { name: 'min', type: 'number', default: '0', description: t(m.sldPropMin) },
          { name: 'max', type: 'number', default: '100', description: t(m.sldPropMax) },
          { name: 'step', type: 'number', default: '1', description: t(m.sldPropStep) },
          { name: 'onValueChange', type: '(value: number) => void', description: t(m.sldPropOnValueChange) },
          { name: 'hapticStep', type: 'number', default: '10', description: t(m.sldPropHapticStep) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(m.sldPropSkeleton) },
          { name: 'disabled', type: 'boolean', default: 'false', description: t(m.sldPropDisabled) },
          { name: 'aria-label', type: 'string', description: t(m.sldPropAriaLabel) },
        ]}
      />

      <Heading level={2}>{t(m.sldSecHaptics)}</Heading>
      <ul>
        <li>{prose(t(m.sldHaptic1))}</li>
        <li>{prose(t(m.sldHaptic2))}</li>
      </ul>

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.sldA11y1))}</li>
        <li>{t(m.sldA11y2)}</li>
        <li>{t(m.sldA11y3)}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{t(m.sldUse1)}</li>
        <li>{t(m.sldUse2)}</li>
        <li>{t(m.sldUse3)}</li>
      </ul>
    </>
  );
}
