import { AlertDialog, Button, Heading, Row, Size, Stack, Text, TextTone, Variant } from '@glacier/react';
import { useState } from 'react';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { Example, PropsTable } from '../../docs-ui.tsx';

export function AlertDialogPage() {
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [dismissibleOpen, setDismissibleOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(0);

  return (
    <>
      <Heading level={1}>AlertDialog</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        AlertDialog asks for an explicit confirmation before a consequential action. It focuses
        Cancel first, blocks accidental Escape and backdrop dismissal by default, and makes
        destructive choices visually unmistakable.
      </Text>

      <Heading level={2}>Anatomy</Heading>
      <Text tone={TextTone.Muted}>A schematic of the required title, consequence text, cancel path, and explicit confirmation action.</Text>
      <ComponentBlueprint specId="alert-dialog" />

      <Heading level={2}>Examples</Heading>
      <Example
        title="Neutral confirmation"
        description="Cancel receives initial focus, so an accidental Enter cannot immediately commit the action after the dialog appears."
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
      >
        <Button onClick={() => setArchiveOpen(true)}>Archive project</Button>
        <AlertDialog
          open={archiveOpen}
          onClose={() => setArchiveOpen(false)}
          title="Archive project?"
          description="Archived projects remain searchable but become read-only."
          actionLabel="Archive project"
          onAction={() => {
            setConfirmed((count) => count + 1);
            setArchiveOpen(false);
          }}
        />
      </Example>

      <Example
        title="Destructive confirmation"
        description="Use the danger tone only for irreversible or materially harmful actions. Repeat the exact verb in the confirmation button."
        code={`<AlertDialog
  open={open}
  onClose={() => setOpen(false)}
  title="Delete workspace?"
  description="This removes all projects and members. There is no undo."
  actionLabel="Delete workspace"
  onAction={deleteWorkspace}
  tone="danger"
/>`}
      >
        <Button variant={Variant.Danger} onClick={() => setDeleteOpen(true)}>Delete workspace</Button>
        <AlertDialog
          open={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          title="Delete workspace?"
          description="This removes all projects and members. There is no undo."
          actionLabel="Delete workspace"
          onAction={() => {
            setConfirmed((count) => count + 1);
            setDeleteOpen(false);
          }}
          tone="danger"
        />
      </Example>

      <Example
        title="Dismissible notice"
        description="Only allow backdrop or Escape dismissal when abandoning the choice is safe and easy to recover from."
        code={`<AlertDialog
  open={open}
  onClose={() => setOpen(false)}
  title="Continue setup?"
  description="You can resume setup later from project settings."
  actionLabel="Continue"
  onAction={continueSetup}
  dismissible
/>`}
      >
        <Row gap={4} wrap>
          <Button variant={Variant.Outline} onClick={() => setDismissibleOpen(true)}>Continue setup</Button>
          <Text size={Size.Small} tone={TextTone.Muted}>Confirmed actions: {confirmed}</Text>
        </Row>
        <AlertDialog
          open={dismissibleOpen}
          onClose={() => setDismissibleOpen(false)}
          title="Continue setup?"
          description="You can resume setup later from project settings."
          actionLabel="Continue"
          onAction={() => {
            setConfirmed((count) => count + 1);
            setDismissibleOpen(false);
          }}
          dismissible
        />
      </Example>

      <Example
        title="Supporting content"
        description="Use the body only for concise evidence that helps people make the decision."
        code={`<AlertDialog ...>
  <Text>3 members will lose access immediately.</Text>
</AlertDialog>`}
      >
        <SupportingAlertExample />
      </Example>

      <Heading level={2}>Props</Heading>
      <PropsTable
        props={[
          { name: 'open', type: 'boolean', description: 'Whether the alert dialog is mounted and shown.' },
          { name: 'onClose', type: '() => void', description: 'Called by Cancel and allowed dismissal paths.' },
          { name: 'title', type: 'ReactNode', description: 'Required heading that names the dialog.' },
          { name: 'description', type: 'ReactNode', description: 'Consequence text below the title.' },
          { name: 'actionLabel', type: 'ReactNode', description: 'Visible confirmation action label.' },
          { name: 'onAction', type: '() => void', description: 'Called when confirmation is activated.' },
          { name: 'cancelLabel', type: 'ReactNode', default: "'Cancel'", description: 'Visible cancel action label.' },
          { name: 'tone', type: "'neutral' | 'danger'", default: "'neutral'", description: 'Semantic confirmation tone.' },
          { name: 'dismissible', type: 'boolean', default: 'false', description: 'Allows Escape and backdrop dismissal.' },
          { name: 'actionLoading', type: 'boolean', default: 'false', description: 'Shows a spinner and blocks confirmation.' },
        ]}
      />

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>The surface uses <code>role="alertdialog"</code>, <code>aria-modal="true"</code>, and a required labelled title.</li>
        <li>Focus begins on Cancel, protecting against accidental confirmation after the dialog opens.</li>
        <li>Backdrop and Escape dismissal are disabled by default; Cancel remains the explicit exit path.</li>
        <li>The dialog traps Tab focus, locks page scrolling, and restores focus to the opener when it closes.</li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>Use AlertDialog for one consequential decision. Use Modal for a form or a group of related controls.</li>
        <li>Write a specific confirmation label such as <code>Delete workspace</code>, never a generic <code>Confirm</code>.</li>
        <li>Reserve the danger tone for real irreversible loss or harm.</li>
      </ul>
    </>
  );
}

function SupportingAlertExample() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Remove member</Button>
      <AlertDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Remove Mina from the workspace?"
        description="Mina will lose access immediately."
        actionLabel="Remove member"
        onAction={() => setOpen(false)}
        tone="danger"
      >
        <Stack gap={2} width="full">
          <Text size={Size.Small}>Mina owns 2 projects and has 14 assigned issues.</Text>
        </Stack>
      </AlertDialog>
    </>
  );
}