import { Button, Field, Heading, Input, Row, Size, Stack, Text, TextTone, Variant, useT } from '@glacier/react';
import { useState } from 'react';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { type PlatformKit } from '../../platforms.tsx';
import { m } from '../../i18n.ts';

export function DrawerPage() {
  const t = useT();

  return (
    <>
      <Heading level={1}>{t(m.drwName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(m.drwLede)}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.drwAnatomy)}</Text>
      <ComponentBlueprint specId="drawer" />

      <Heading level={2}>{t(m.secExamples)}</Heading>
      <Example
        title={t(m.exBasic)}
        description={t(m.drwExBasicDesc)}
        component="Drawer"
        render={(K) => <BasicDrawerExample K={K} />}
        code={`import { Button, Drawer, Text } from '@glacier/react';

const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>Open filters</Button>
<Drawer
  open={open}
  onClose={() => setOpen(false)}
  title="Filters"
  description="Narrow the visible results."
  footer={<Button onClick={() => setOpen(false)}>Apply filters</Button>}
>
  <Text>Drawer content scrolls independently from the page.</Text>
</Drawer>`}
      />

      <Example
        title={t(m.drwExFloatingTitle)}
        description={t(m.drwExFloatingDesc)}
        component="Drawer"
        render={(K) => <FloatingDrawerExample K={K} />}
        code={`<Drawer floating open={open} onClose={() => setOpen(false)} title="Filters">
  <Text>The same sheet, floated off the edges.</Text>
</Drawer>`}
      />

      <Example
        title={t(m.drwExSidesTitle)}
        description={t(m.drwExSidesDesc)}
        component="Drawer"
        render={(K) => <SidesDrawerExample K={K} />}
        code={`const [side, setSide] = useState<'left' | 'right' | 'bottom' | null>(null);

<Button onClick={() => setSide('left')}>Left</Button>
<Button onClick={() => setSide('right')}>Right</Button>
<Button onClick={() => setSide('bottom')}>Bottom</Button>
<Drawer open={side !== null} onClose={() => setSide(null)} side={side ?? 'right'} title="Panel">
  <Text>Content</Text>
</Drawer>`}
      />

      <Example
        title={t(m.drwExFormTitle)}
        description={t(m.drwExFormDesc)}
        component="Drawer"
        render={(K) => <FormDrawerExample K={K} />}
        code={`<Drawer
  open={open}
  onClose={() => setOpen(false)}
  title="Save filter"
  footer={
    <>
      <Button variant={Variant.Ghost} onClick={() => setOpen(false)}>Cancel</Button>
      <Button onClick={() => setOpen(false)}>Save filter</Button>
    </>
  }
>
  <Field label="Filter name"><Input /></Field>
</Drawer>`}
      />

      <Example
        title={t(m.drwExPersistTitle)}
        description={t(m.drwExPersistDesc)}
        component="Drawer"
        render={(K) => <PersistentDrawerExample K={K} />}
        code={`<Drawer open={open} onClose={() => setOpen(false)} dismissible={false} title="Finish setup">
  <Button onClick={() => setOpen(false)}>Continue</Button>
</Drawer>`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'open', type: 'boolean', description: t(m.drwPropOpen) },
          { name: 'onClose', type: '() => void', description: t(m.drwPropOnClose) },
          { name: 'title', type: 'ReactNode', description: t(m.drwPropTitle) },
          { name: 'description', type: 'ReactNode', description: t(m.drwPropDescription) },
          { name: 'side', type: "'left' | 'right' | 'bottom'", default: "'right'", description: t(m.drwPropSide) },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: t(m.drwPropSize) },
          { name: 'floating', type: 'boolean', description: t(m.drwPropFloating) },
          { name: 'footer', type: 'ReactNode', description: t(m.drwPropFooter) },
          { name: 'dismissible', type: 'boolean', default: 'true', description: t(m.drwPropDismissible) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.drwA11y1))}</li>
        <li>{prose(t(m.drwA11y2))}</li>
        <li>{prose(t(m.drwA11y3))}</li>
        <li>{prose(t(m.drwA11y4))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.drwUse1))}</li>
        <li>{prose(t(m.drwUse2))}</li>
        <li>{prose(t(m.drwUse3))}</li>
      </ul>
    </>
  );
}

// The Drawer holds open/selected state, which cannot live in an Example's
// `render` (it runs once per pane and must not call hooks). Each demo lifts its
// state into a small wrapper that takes the platform kit `K`, so every
// comparison pane manages its own drawer through its own binding.

function BasicDrawerExample({ K }: { K: PlatformKit }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>{t(m.drwOpenFilters)}</Button>
      <K.Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={t(m.drwTitleFilters)}
        description={t(m.drwDescNarrow)}
        footer={<Button onClick={() => setOpen(false)}>{t(m.drwApplyFilters)}</Button>}
      >
        <Text>{t(m.drwBasicBody)}</Text>
      </K.Drawer>
    </>
  );
}

function FloatingDrawerExample({ K }: { K: PlatformKit }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>{t(m.drwOpenFloating)}</Button>
      <K.Drawer
        floating
        open={open}
        onClose={() => setOpen(false)}
        title={t(m.drwTitleFilters)}
        description={t(m.drwDescNarrow)}
        footer={<Button onClick={() => setOpen(false)}>{t(m.drwApplyFilters)}</Button>}
      >
        <Text>{t(m.drwFloatingBody)}</Text>
      </K.Drawer>
    </>
  );
}

function SidesDrawerExample({ K }: { K: PlatformKit }) {
  const t = useT();
  const [side, setSide] = useState<'left' | 'right' | 'bottom' | null>(null);
  return (
    <Row gap={4} wrap>
      <Button variant={Variant.Outline} onClick={() => setSide('left')}>{t(m.drawerLeft)}</Button>
      <Button variant={Variant.Outline} onClick={() => setSide('right')}>{t(m.drawerRight)}</Button>
      <Button variant={Variant.Outline} onClick={() => setSide('bottom')}>{t(m.drawerBottom)}</Button>
      <K.Drawer open={side !== null} onClose={() => setSide(null)} side={side ?? 'right'} title={t(m.drwTitlePanel)}>
        <Text>{t(m.drwSidesBody)}</Text>
      </K.Drawer>
    </Row>
  );
}

function FormDrawerExample({ K }: { K: PlatformKit }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [filterName, setFilterName] = useState('');
  return (
    <>
      <Button onClick={() => setOpen(true)}>{t(m.drwSaveAFilter)}</Button>
      <K.Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={t(m.drwSaveFilter)}
        description={t(m.drwDescNameView)}
        footer={
          <>
            <Button variant={Variant.Ghost} onClick={() => setOpen(false)}>{t(m.drawerCancel)}</Button>
            <Button onClick={() => setOpen(false)}>{t(m.drwSaveFilter)}</Button>
          </>
        }
      >
        <Field label={t(m.drwFieldFilterName)} hint={t(m.drwHintVisible)}>
          <Input value={filterName} onChange={(event) => setFilterName(event.target.value)} placeholder={t(m.drawerOpenIssues)} />
        </Field>
      </K.Drawer>
    </>
  );
}

function PersistentDrawerExample({ K }: { K: PlatformKit }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>{t(m.drwOpenRequiredSetup)}</Button>
      <K.Drawer open={open} onClose={() => setOpen(false)} dismissible={false} title={t(m.drwTitleFinishSetup)}>
        <Stack gap={4} width="full">
          <Text>{t(m.drwPersistBody)}</Text>
          <Button onClick={() => setOpen(false)}>{t(m.drawerContinue)}</Button>
        </Stack>
      </K.Drawer>
    </>
  );
}
