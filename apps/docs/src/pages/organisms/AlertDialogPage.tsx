import { Button, Heading, Row, Size, Stack, Text, TextTone, Variant, useT } from '@glacier/react';
import { useState } from 'react';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { type PlatformKit } from '../../platforms.tsx';
import { m } from '../../i18n.ts';

export function AlertDialogPage() {
  const t = useT();

  return (
    <>
      <Heading level={1}>{t(m.adName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(m.adLede)}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.adAnatomyIntro)}</Text>
      <ComponentBlueprint specId="alert-dialog" />

      <Heading level={2}>{t(m.secExamples)}</Heading>
      <Example
        title={t(m.adEx1Title)}
        description={t(m.adEx1Desc)}
        component="AlertDialog"
        render={(K) => <ArchiveAlertExample K={K} />}
        code={`const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>Archive project</Button>
<AlertDialog
  open={open}
  onClose={() => setOpen(false)}
  title="Archive project?"
  description="Archived projects remain searchable but become read-only."
  actionLabel="Archive project"
  onAction={() => setOpen(false)}
/>`}
      />

      <Example
        title={t(m.adEx2Title)}
        description={t(m.adEx2Desc)}
        component="AlertDialog"
        render={(K) => <DeleteAlertExample K={K} />}
        code={`<AlertDialog
  open={open}
  onClose={() => setOpen(false)}
  title="Delete workspace?"
  description="This removes all projects and members. There is no undo."
  actionLabel="Delete workspace"
  onAction={deleteWorkspace}
  tone="danger"
/>`}
      />

      <Example
        title={t(m.adEx3Title)}
        description={t(m.adEx3Desc)}
        component="AlertDialog"
        render={(K) => <DismissibleAlertExample K={K} />}
        code={`<AlertDialog
  open={open}
  onClose={() => setOpen(false)}
  title="Continue setup?"
  description="You can resume setup later from project settings."
  actionLabel="Continue"
  onAction={continueSetup}
  dismissible
/>`}
      />

      <Example
        title={t(m.adEx4Title)}
        description={t(m.adEx4Desc)}
        component="AlertDialog"
        render={(K) => <SupportingAlertExample K={K} />}
        code={`<AlertDialog ...>
  <Text>3 members will lose access immediately.</Text>
</AlertDialog>`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'open', type: 'boolean', description: t(m.adPropOpen) },
          { name: 'onClose', type: '() => void', description: t(m.adPropOnClose) },
          { name: 'title', type: 'ReactNode', description: t(m.adPropTitle) },
          { name: 'description', type: 'ReactNode', description: t(m.adPropDescription) },
          { name: 'actionLabel', type: 'ReactNode', description: t(m.adPropActionLabel) },
          { name: 'onAction', type: '() => void', description: t(m.adPropOnAction) },
          { name: 'cancelLabel', type: 'ReactNode', default: "'Cancel'", description: t(m.adPropCancelLabel) },
          { name: 'tone', type: "'neutral' | 'danger'", default: "'neutral'", description: t(m.adPropTone) },
          { name: 'dismissible', type: 'boolean', default: 'false', description: t(m.adPropDismissible) },
          { name: 'actionLoading', type: 'boolean', default: 'false', description: t(m.adPropActionLoading) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.adA11y1))}</li>
        <li>{prose(t(m.adA11y2))}</li>
        <li>{prose(t(m.adA11y3))}</li>
        <li>{prose(t(m.adA11y4))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.adUse1))}</li>
        <li>{prose(t(m.adUse2))}</li>
        <li>{prose(t(m.adUse3))}</li>
      </ul>
    </>
  );
}

function ArchiveAlertExample({ K }: { K: PlatformKit }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>{t(m.adArchiveBtn)}</Button>
      <K.AlertDialog
        open={open}
        onClose={() => setOpen(false)}
        title={t(m.adArchiveTitle)}
        description={t(m.adArchiveDesc)}
        actionLabel={t(m.adArchiveBtn)}
        onAction={() => setOpen(false)}
      />
    </>
  );
}

function DeleteAlertExample({ K }: { K: PlatformKit }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant={Variant.Danger} onClick={() => setOpen(true)}>{t(m.adDeleteBtn)}</Button>
      <K.AlertDialog
        open={open}
        onClose={() => setOpen(false)}
        title={t(m.adDeleteTitle)}
        description={t(m.adDeleteDesc)}
        actionLabel={t(m.adDeleteBtn)}
        onAction={() => setOpen(false)}
        tone="danger"
      />
    </>
  );
}

function DismissibleAlertExample({ K }: { K: PlatformKit }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(0);
  return (
    <>
      <Row gap={4} wrap>
        <Button variant={Variant.Outline} onClick={() => setOpen(true)}>{t(m.adContinueBtn)}</Button>
        <Text size={Size.Small} tone={TextTone.Muted}>{t(m.adConfirmedLabel)} {confirmed}</Text>
      </Row>
      <K.AlertDialog
        open={open}
        onClose={() => setOpen(false)}
        title={t(m.adContinueTitle)}
        description={t(m.adContinueDesc)}
        actionLabel={t(m.adContinueAction)}
        onAction={() => {
          setConfirmed((count) => count + 1);
          setOpen(false);
        }}
        dismissible
      />
    </>
  );
}

function SupportingAlertExample({ K }: { K: PlatformKit }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>{t(m.adRemoveBtn)}</Button>
      <K.AlertDialog
        open={open}
        onClose={() => setOpen(false)}
        title={t(m.adRemoveTitle)}
        description={t(m.adRemoveDesc)}
        actionLabel={t(m.adRemoveBtn)}
        onAction={() => setOpen(false)}
        tone="danger"
      >
        <Stack gap={2} width="full">
          <Text size={Size.Small}>{t(m.adRemoveEvidence)}</Text>
        </Stack>
      </K.AlertDialog>
    </>
  );
}
