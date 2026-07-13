import { Button, Field, Input, Row, Text, Heading, Size, TextTone, Variant, useT } from '@glacier/react';
import { useState } from 'react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { type PlatformKit } from '../../platforms.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

/**
 * Each Modal demo owns its own open state, so it is lifted into a module-level
 * wrapper component the render function mounts once per pane (a render callback
 * cannot hold hooks). The trigger and the footer/body content stay on the web
 * kit — they are token-identical across bindings and their `onClick` fires in
 * both panes — while only the overlay under test swaps to `K.Modal`, so the
 * Native pane exercises the real react-native <Modal> shell. `K` is the platform
 * kit (the DOM kit or the RN kit) the demo renders through.
 */
function BasicModalDemo({ K }: { K: PlatformKit }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <Row gap={4} wrap>
      <Button onClick={() => setOpen(true)}>{t(m.modReleaseNotes)}</Button>
      <K.Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t(m.modReleaseNotes)}
        description={t(m.modDescV24)}
        footer={<Button onClick={() => setOpen(false)}>{t(m.modalDone)}</Button>}
      >
        <Text>{t(m.modBasicBody)}</Text>
      </K.Modal>
    </Row>
  );
}

function SizeModalDemo({ K }: { K: PlatformKit }) {
  const t = useT();
  const [size, setSize] = useState<'sm' | 'md' | 'lg' | null>(null);
  return (
    <Row gap={4} wrap>
      <Button onClick={() => setSize('sm')}>{t(m.modalSmall)}</Button>
      <Button onClick={() => setSize('md')}>{t(m.modalMedium)}</Button>
      <Button onClick={() => setSize('lg')}>{t(m.modalLarge)}</Button>
      <K.Modal
        open={size !== null}
        onClose={() => setSize(null)}
        size={size ?? 'md'}
        title={'Size: ' + size}
        footer={<Button onClick={() => setSize(null)}>{t(m.modalDone)}</Button>}
      >
        <Text>{t(m.modSizesBody)}</Text>
      </K.Modal>
    </Row>
  );
}

function FormModalDemo({ K }: { K: PlatformKit }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [projectName, setProjectName] = useState('GlacierUI Kit');
  return (
    <Row gap={4} wrap>
      <Button onClick={() => setOpen(true)}>{t(m.modRenameProject)}</Button>
      <K.Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t(m.modRenameProject)}
        description={t(m.modDescRename)}
        footer={
          <>
            <Button variant={Variant.Ghost} onClick={() => setOpen(false)}>
              {t(m.modalCancel)}
            </Button>
            <Button onClick={() => setOpen(false)}>{t(m.modalSave)}</Button>
          </>
        }
      >
        <Field label={t(m.modFieldProjectName)} hint={t(m.modHint60Chars)}>
          <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} />
        </Field>
      </K.Modal>
    </Row>
  );
}

function ConfirmModalDemo({ K }: { K: PlatformKit }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <Row gap={4} wrap>
      <Button variant={Variant.Danger} onClick={() => setOpen(true)}>
        {t(m.modDeleteWorkspace)}
      </Button>
      <K.Modal
        open={open}
        onClose={() => setOpen(false)}
        size={Size.Small}
        title={t(m.modTitleDeleteWorkspace)}
        description={t(m.modDescDelete)}
        footer={
          <>
            <Button variant={Variant.Ghost} onClick={() => setOpen(false)}>
              {t(m.modalCancel)}
            </Button>
            <Button variant={Variant.Danger} onClick={() => setOpen(false)}>
              {t(m.modalDelete)}
            </Button>
          </>
        }
      />
    </Row>
  );
}

export function ModalPage() {
  const t = useT();

  return (
    <>
      <Heading level={1}>{t(m.modName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(m.modLede)}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.modAnatomy)}</Text>
      <ComponentBlueprint specId="modal" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.exBasic)}
        description={t(m.modExBasicDesc)}
        component="Modal"
        render={(K) => <BasicModalDemo K={K} />}
        code={`import { Button, Modal, Text } from '@glacier/react';

const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>Release notes</Button>
<Modal
  open={open}
  onClose={() => setOpen(false)}
  title="Release notes"
  description="What changed in version 2.4."
  footer={<Button onClick={() => setOpen(false)}>Done</Button>}
>
  <Text>
    The spacing scale now uses fluid clamp values, and every color ramp
    gained a dedicated hover step.
  </Text>
</Modal>`}
      />

      <Example
        title={t(m.secSizes)}
        description={t(m.modExSizesDesc)}
        component="Modal"
        render={(K) => <SizeModalDemo K={K} />}
        code={`const [size, setSize] = useState<'sm' | 'md' | 'lg' | null>(null);

<Button onClick={() => setSize('sm')}>Small</Button>
<Button onClick={() => setSize('md')}>Medium</Button>
<Button onClick={() => setSize('lg')}>Large</Button>
<Modal
  open={size !== null}
  onClose={() => setSize(null)}
  size={size ?? 'md'}
  title={'Size: ' + size}
  footer={<Button onClick={() => setSize(null)}>Done</Button>}
>
  <Text>The size prop only changes the panel width.</Text>
</Modal>`}
      />

      <Example
        title={t(m.modExFormTitle)}
        description={t(m.modExFormDesc)}
        component="Modal"
        render={(K) => <FormModalDemo K={K} />}
        code={`const [open, setOpen] = useState(false);
const [name, setName] = useState('GlacierUI Kit');

<Button onClick={() => setOpen(true)}>Rename project</Button>
<Modal
  open={open}
  onClose={() => setOpen(false)}
  title="Rename project"
  description="The new name appears everywhere the project is listed."
  footer={
    <>
      <Button variant={Variant.Ghost} onClick={() => setOpen(false)}>Cancel</Button>
      <Button onClick={() => setOpen(false)}>Save</Button>
    </>
  }
>
  <Field label="Project name" hint="Up to 60 characters.">
    <Input value={name} onChange={(e) => setName(e.target.value)} />
  </Field>
</Modal>`}
      />

      <Example
        title={t(m.modExConfirmTitle)}
        description={t(m.modExConfirmDesc)}
        component="Modal"
        render={(K) => <ConfirmModalDemo K={K} />}
        code={`const [open, setOpen] = useState(false);

<Button variant={Variant.Danger} onClick={() => setOpen(true)}>Delete workspace</Button>
<Modal
  open={open}
  onClose={() => setOpen(false)}
  size={Size.Small}
  title="Delete workspace?"
  description="This removes all projects and members. There is no undo."
  footer={
    <>
      <Button variant={Variant.Ghost} onClick={() => setOpen(false)}>Cancel</Button>
      <Button variant={Variant.Danger} onClick={() => setOpen(false)}>Delete</Button>
    </>
  }
/>`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'open', type: 'boolean', description: t(m.modPropOpen) },
          { name: 'onClose', type: '() => void', description: t(m.modPropOnClose) },
          { name: 'title', type: 'ReactNode', description: t(m.modPropTitle) },
          { name: 'description', type: 'ReactNode', description: t(m.modPropDescription) },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: t(m.modPropSize) },
          { name: 'footer', type: 'ReactNode', description: t(m.modPropFooter) },
          { name: 'children', type: 'ReactNode', description: t(m.modPropChildren) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.modA11y1))}</li>
        <li>{prose(t(m.modA11y2))}</li>
        <li>{prose(t(m.modA11y3))}</li>
        <li>{prose(t(m.modA11y4))}</li>
        <li>{prose(t(m.modA11y5))}</li>
        <li>{prose(t(m.modA11y6))}</li>
        <li>{prose(t(m.modA11y7))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.modUse1))}</li>
        <li>{prose(t(m.modUse2))}</li>
        <li>{prose(t(m.modUse3))}</li>
        <li>{prose(t(m.modUse4))}</li>
        <li>{prose(t(m.modUse5))}</li>
      </ul>
    </>
  );
}
