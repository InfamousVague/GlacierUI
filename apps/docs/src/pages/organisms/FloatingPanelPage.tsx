import { Button, FloatingPanel, Row, Text, Heading, Size, TextTone, Variant, useT } from '@glacier/react';
import { useState } from 'react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

export function FloatingPanelPage() {
  const t = useT();
  const [basicOpen, setBasicOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);

  return (
    <>
      <Heading level={1}>{t(m.fpName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(m.fpLede)}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.fpAnatomy)}</Text>
      <ComponentBlueprint specId="floating-panel" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.exBasic)}
        description={t(m.fpExBasicDesc)}
        code={`import { Button, FloatingPanel, Text } from '@glacier/react';

const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>Open panel</Button>
<FloatingPanel open={open} title="Notes" onClose={() => setOpen(false)}>
  <Text>Drag me by the header bar. I stay inside the viewport.</Text>
</FloatingPanel>`}
      >
        <Row gap={4} wrap>
          <Button onClick={() => setBasicOpen(true)}>{t(m.fpOpenPanel)}</Button>
          <FloatingPanel open={basicOpen} title={t(m.fpTitleNotes)} onClose={() => setBasicOpen(false)}>
            <Text>{t(m.fpBasicBody)}</Text>
          </FloatingPanel>
        </Row>
      </Example>

      <Example
        title={t(m.fpExPositionTitle)}
        description={t(m.fpExPositionDesc)}
        code={`<FloatingPanel
  open={open}
  title="Inspector"
  defaultPosition={{ x: 480, y: 120 }}
  onClose={() => setOpen(false)}
>
  <Text>A non-modal inspector you can keep open while editing.</Text>
</FloatingPanel>`}
      >
        <Row gap={4} wrap>
          <Button variant={Variant.Soft} onClick={() => setInspectorOpen(true)}>
            {t(m.fpOpenInspector)}
          </Button>
          <FloatingPanel
            open={inspectorOpen}
            title={t(m.fpTitleInspector)}
            defaultPosition={{ x: 480, y: 120 }}
            onClose={() => setInspectorOpen(false)}
          >
            <Text>{t(m.fpInspectorBody)}</Text>
          </FloatingPanel>
        </Row>
      </Example>

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'open', type: 'boolean', description: t(m.fpPropOpen) },
          { name: 'title', type: 'ReactNode', description: t(m.fpPropTitle) },
          { name: 'onClose', type: '() => void', description: t(m.fpPropOnClose) },
          { name: 'defaultPosition', type: '{ x: number; y: number }', default: '{ x: 24, y: 24 }', description: t(m.fpPropDefaultPosition) },
          { name: 'className', type: 'string', description: t(m.fpPropClassName) },
          { name: 'children', type: 'ReactNode', description: t(m.fpPropChildren) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.fpA11y1))}</li>
        <li>
          {t(m.fpA11y2Lead)} <strong>{t(m.fpA11y2Term)}</strong>{prose(t(m.fpA11y2Rest))}
        </li>
        <li>{prose(t(m.fpA11y3))}</li>
        <li>{prose(t(m.fpA11y4))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.fpUse1))}</li>
        <li>{prose(t(m.fpUse2))}</li>
        <li>{prose(t(m.fpUse3))}</li>
      </ul>
    </>
  );
}
