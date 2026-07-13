import { useState } from 'react';
import { Rating, Heading, Text, Size, TextTone, useT } from '@glacier/react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

function ControlledRating() {
  const t = useT();
  const [value, setValue] = useState(3);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--glacier-space-3)' }}>
      <Rating value={value} onChange={setValue} aria-label={t(m.ratAriaRateBook)} />
      <span style={{ color: 'var(--glacier-text-muted)', fontVariantNumeric: 'tabular-nums' }}>
        {value} / 5
      </span>
    </div>
  );
}

export function RatingPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.ratName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.ratLede))}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.anatomyIntro)}</Text>
      <ComponentBlueprint specId="rating" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.ratEx1Title)}
        description={t(m.ratEx1Desc)}
        component="Rating"
        render={(K) => (
          <>
            <K.Rating defaultValue={4} aria-label={t(m.ratAriaRateTitle)} />
          </>
        )}
        code={`import { Rating } from '@glacier/react';

<Rating defaultValue={4} aria-label="Rate this title" />`}
      />

      <Example
        title={t(m.ratEx2Title)}
        description={t(m.ratEx2Desc)}
        code={`const [value, setValue] = useState(3);

<Rating value={value} onChange={setValue} aria-label="Rate this book" />`}
      >
        <ControlledRating />
      </Example>

      <Example
        title={t(m.ratEx3Title)}
        description={t(m.ratEx3Desc)}
        component="Rating"
        render={(K) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--glacier-space-2)' }}>
            <K.Rating readOnly value={4.3} aria-label={t(m.ratAriaRated43)} />
            <K.Rating readOnly value={2.5} aria-label={t(m.ratAriaRated25)} />
            <K.Rating readOnly value={5} aria-label={t(m.ratAriaRated5)} />
          </div>
        )}
        code={`<Rating readOnly value={4.3} aria-label="Rated 4.3 of 5" />
<Rating readOnly value={5} aria-label="Rated 5 of 5" />`}
      />

      <Example
        title={t(m.secSizes)}
        description={t(m.ratEx4Desc)}
        component="Rating"
        render={(K) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--glacier-space-2)' }}>
            <K.Rating readOnly value={4} size={Size.Small} aria-label={t(m.ratAriaRated4)} />
            <K.Rating readOnly value={4} size={Size.Medium} aria-label={t(m.ratAriaRated4)} />
            <K.Rating readOnly value={4} size={Size.Large} aria-label={t(m.ratAriaRated4)} />
          </div>
        )}
        code={`<Rating readOnly value={4} size={Size.Small} aria-label="Rated 4 of 5" />
<Rating readOnly value={4} size={Size.Medium} aria-label="Rated 4 of 5" />
<Rating readOnly value={4} size={Size.Large} aria-label="Rated 4 of 5" />`}
      />

      <Example
        title={t(m.ratEx5Title)}
        description={t(m.ratEx5Desc)}
        component="Rating"
        render={(K) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--glacier-space-2)' }}>
            <K.Rating readOnly value={7} max={10} aria-label={t(m.ratAriaRated7of10)} />
            <K.Rating defaultValue={3} disabled aria-label={t(m.ratAriaRatingDisabled)} />
            <K.Rating skeleton />
          </div>
        )}
        code={`<Rating readOnly value={7} max={10} aria-label="Rated 7 of 10" />
<Rating defaultValue={3} disabled aria-label="Rating (disabled)" />
<Rating skeleton />`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'value', type: 'number', description: t(m.ratPropValue) },
          { name: 'defaultValue', type: 'number', description: t(m.ratPropDefaultValue) },
          { name: 'max', type: 'number', default: '5', description: t(m.ratPropMax) },
          { name: 'onChange', type: '(value: number) => void', description: t(m.ratPropOnChange) },
          { name: 'readOnly', type: 'boolean', default: 'false', description: t(m.ratPropReadOnly) },
          { name: 'disabled', type: 'boolean', default: 'false', description: t(m.ratPropDisabled) },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: t(m.ratPropSize) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(m.ratPropSkeleton) },
          { name: 'aria-label', type: 'string', description: t(m.ratPropAriaLabel) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.ratA11y1))}</li>
        <li>{prose(t(m.ratA11y2))}</li>
        <li>{prose(t(m.ratA11y3))}</li>
      </ul>

      <Heading level={2}>{t(m.ratSecHaptics)}</Heading>
      <ul>
        <li>{prose(t(m.ratHap1))}</li>
        <li>{prose(t(m.ratHap2))}</li>
        <li>{prose(t(m.ratHap3))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.ratUse1))}</li>
        <li>{prose(t(m.ratUse2))}</li>
        <li>{prose(t(m.ratUse3))}</li>
      </ul>
    </>
  );
}
