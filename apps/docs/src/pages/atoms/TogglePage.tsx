import { Field, Input, Text, Toggle, Heading, Size, TextTone, useT } from '@glacier/react';
import { Eye, Grid2x2, List } from '@glacier/icons';
import { useState } from 'react';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { m } from '../../i18n.ts';

const EyeIcon = <Eye size={16} />;
const GridIcon = <Grid2x2 size={16} />;
const ListIcon = <List size={16} />;

export function TogglePage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.togName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.togLede))}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.anatomyIntroBox)}</Text>
      <ComponentBlueprint specId="toggle" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.exBasic)}
        description={t(m.togEx1Desc)}
        component="Toggle"
        render={(K) => (
          <>
            <K.Toggle>{t(m.toggleReveal)}</K.Toggle>
            <K.Toggle defaultPressed>{t(m.togglePinned)}</K.Toggle>
            <K.Toggle disabled>{t(m.toggleLocked)}</K.Toggle>
          </>
        )}
        code={`import { Toggle } from '@glacier/react';

<Toggle>Reveal</Toggle>
<Toggle defaultPressed>Pinned</Toggle>
<Toggle disabled>Locked</Toggle>`}
      />

      <Example
        title={t(m.togEx2Title)}
        description={t(m.togEx2Desc)}
        component="Toggle"
        render={(K) => (
          <>
            <K.Toggle iconOnly aria-label={t(m.toggleGridView)} defaultPressed>
              {GridIcon}
            </K.Toggle>
            <K.Toggle iconOnly aria-label={t(m.toggleListView)}>
              {ListIcon}
            </K.Toggle>
          </>
        )}
        code={`<Toggle iconOnly aria-label="Grid view" defaultPressed>{GridIcon}</Toggle>
<Toggle iconOnly aria-label="List view">{ListIcon}</Toggle>`}
      />

      <Example
        title={t(m.togEx3Title)}
        description={t(m.togEx3Desc)}
        code={`const [visible, setVisible] = useState(false);

<Field label="Password">
  <div style={{ position: 'relative' }}>
    <Input type={visible ? 'text' : 'password'} defaultValue="hunter2" style={{ paddingInlineEnd: '3.25rem' }} />
    <Toggle
      iconOnly
      size={Size.Small}
      aria-label="Show password"
      pressed={visible}
      onPressedChange={setVisible}
      style={{ position: 'absolute', top: '50%', right: '0.375rem', translate: '0 -50%' }}
    >
      {EyeIcon}
    </Toggle>
  </div>
</Field>`}
      >
        <RevealDemo />
      </Example>

      <Example
        title={t(m.exSkeleton)}
        description={t(m.togEx4Desc)}
        component="Toggle"
        render={(K) => (
          <>
            <K.Toggle defaultPressed>{t(m.togglePinned)}</K.Toggle>
            <K.Toggle skeleton />
            <K.Toggle skeleton iconOnly />
          </>
        )}
        code={`<Toggle skeleton />
<Toggle skeleton iconOnly />`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'pressed', type: 'boolean', description: t(m.togPropPressed) },
          { name: 'defaultPressed', type: 'boolean', default: 'false', description: t(m.togPropDefaultPressed) },
          { name: 'onPressedChange', type: '(pressed: boolean) => void', description: t(m.togPropOnPressedChange) },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: t(m.togPropSize) },
          { name: 'iconOnly', type: 'boolean', default: 'false', description: t(m.togPropIconOnly) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(m.togPropSkeleton) },
          { name: 'disabled', type: 'boolean', default: 'false', description: t(m.togPropDisabled) },
          { name: 'aria-label', type: 'string', description: t(m.togPropAriaLabel) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.togA11y1))}</li>
        <li>{prose(t(m.togA11y2))}</li>
        <li>{prose(t(m.togA11y3))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.togUse1))}</li>
        <li>{prose(t(m.togUse2))}</li>
        <li>{prose(t(m.togUse3))}</li>
        <li>{prose(t(m.togUse4))}</li>
      </ul>
    </>
  );
}

function RevealDemo() {
  const t = useT();
  const [visible, setVisible] = useState(false);
  return (
    <div style={{ width: '20rem' }}>
      <Field label={t(m.togglePassword)}>
        <div style={{ position: 'relative' }}>
          <Input
            type={visible ? 'text' : 'password'}
            defaultValue="hunter2"
            style={{ paddingInlineEnd: '3.25rem' }}
          />
          <Toggle
            iconOnly
            size={Size.Small}
            aria-label={t(m.toggleShowPassword)}
            pressed={visible}
            onPressedChange={setVisible}
            style={{ position: 'absolute', top: '50%', right: '0.375rem', translate: '0 -50%' }}
          >
            {EyeIcon}
          </Toggle>
        </div>
      </Field>
      <Text size={Size.XSmall} tone={TextTone.Subtle} style={{ marginTop: 'var(--glacier-space-2)' }}>
        {t(m.toggleShowing)} <Text as="span" size={Size.XSmall} mono>{visible ? 'text' : 'password'}</Text>
      </Text>
    </div>
  );
}
