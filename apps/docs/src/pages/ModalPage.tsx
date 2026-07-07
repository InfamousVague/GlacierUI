import { Button, Field, Input, Modal, Row, Text } from '@perfect/react';
import { useState } from 'react';
import { Example, PropsTable } from '../docs-ui.tsx';

export function ModalPage() {
  const [basicOpen, setBasicOpen] = useState(false);
  const [sizeOpen, setSizeOpen] = useState<'sm' | 'md' | 'lg' | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [projectName, setProjectName] = useState('Perfect UI Kit');
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <h1>Modal</h1>
      <p className="lede">
        Modal is a glass dialog rendered in a portal. It springs open, closes instantly, locks
        body scroll, traps Tab focus, and returns focus to the element that opened it.
      </p>

      <h2>Examples</h2>

      <Example
        title="Basic"
        description="A controlled dialog. The title and description label the dialog for assistive technology, and the footer holds the actions. A close button is built in."
        code={`import { Button, Modal, Text } from '@perfect/react';

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
      >
        <Row gap={4} wrap>
          <Button onClick={() => setBasicOpen(true)}>Release notes</Button>
          <Modal
            open={basicOpen}
            onClose={() => setBasicOpen(false)}
            title="Release notes"
            description="What changed in version 2.4."
            footer={<Button onClick={() => setBasicOpen(false)}>Done</Button>}
          >
            <Text>
              The spacing scale now uses fluid clamp values, and every color ramp gained a
              dedicated hover step.
            </Text>
          </Modal>
        </Row>
      </Example>

      <Example
        title="Sizes"
        description="Three panel widths. Height always follows the content. One state variable holds which size is open, so a single Modal serves all three buttons."
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
      >
        <Row gap={4} wrap>
          <Button onClick={() => setSizeOpen('sm')}>Small</Button>
          <Button onClick={() => setSizeOpen('md')}>Medium</Button>
          <Button onClick={() => setSizeOpen('lg')}>Large</Button>
          <Modal
            open={sizeOpen !== null}
            onClose={() => setSizeOpen(null)}
            size={sizeOpen ?? 'md'}
            title={'Size: ' + sizeOpen}
            footer={<Button onClick={() => setSizeOpen(null)}>Done</Button>}
          >
            <Text>The size prop only changes the panel width.</Text>
          </Modal>
        </Row>
      </Example>

      <Example
        title="Form"
        description="Field and Input work inside the body without extra wiring. Cancel is a ghost button, and the solid Save button sits rightmost as the primary action."
        code={`const [open, setOpen] = useState(false);
const [name, setName] = useState('Perfect UI Kit');

<Button onClick={() => setOpen(true)}>Rename project</Button>
<Modal
  open={open}
  onClose={() => setOpen(false)}
  title="Rename project"
  description="The new name appears everywhere the project is listed."
  footer={
    <>
      <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      <Button onClick={() => setOpen(false)}>Save</Button>
    </>
  }
>
  <Field label="Project name" hint="Up to 60 characters.">
    <Input value={name} onChange={(e) => setName(e.target.value)} />
  </Field>
</Modal>`}
      >
        <Row gap={4} wrap>
          <Button onClick={() => setFormOpen(true)}>Rename project</Button>
          <Modal
            open={formOpen}
            onClose={() => setFormOpen(false)}
            title="Rename project"
            description="The new name appears everywhere the project is listed."
            footer={
              <>
                <Button variant="ghost" onClick={() => setFormOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setFormOpen(false)}>Save</Button>
              </>
            }
          >
            <Field label="Project name" hint="Up to 60 characters.">
              <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} />
            </Field>
          </Modal>
        </Row>
      </Example>

      <Example
        title="Destructive confirm"
        description="A small dialog for irreversible actions. The description states the consequence, and the danger button repeats the verb from the opener."
        code={`const [open, setOpen] = useState(false);

<Button variant="danger" onClick={() => setOpen(true)}>Delete workspace</Button>
<Modal
  open={open}
  onClose={() => setOpen(false)}
  size="sm"
  title="Delete workspace?"
  description="This removes all projects and members. There is no undo."
  footer={
    <>
      <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      <Button variant="danger" onClick={() => setOpen(false)}>Delete</Button>
    </>
  }
/>`}
      >
        <Row gap={4} wrap>
          <Button variant="danger" onClick={() => setConfirmOpen(true)}>
            Delete workspace
          </Button>
          <Modal
            open={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            size="sm"
            title="Delete workspace?"
            description="This removes all projects and members. There is no undo."
            footer={
              <>
                <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={() => setConfirmOpen(false)}>
                  Delete
                </Button>
              </>
            }
          />
        </Row>
      </Example>

      <h2>Props</h2>
      <PropsTable
        props={[
          {
            name: 'open',
            type: 'boolean',
            description: 'Whether the dialog is shown. The component renders nothing when false.',
          },
          {
            name: 'onClose',
            type: '() => void',
            description:
              'Called when the user dismisses via Escape, the built-in close button, or the overlay. Set your open state to false here.',
          },
          {
            name: 'title',
            type: 'ReactNode',
            description:
              'Heading at the top of the panel. Names the dialog through aria-labelledby.',
          },
          {
            name: 'description',
            type: 'ReactNode',
            description:
              'Muted text under the title. Linked to the dialog through aria-describedby.',
          },
          {
            name: 'size',
            type: "'sm' | 'md' | 'lg'",
            default: "'md'",
            description: 'Panel width. Height follows the content in every size.',
          },
          {
            name: 'footer',
            type: 'ReactNode',
            description:
              'Action row at the bottom of the panel. Place the primary action last so it renders rightmost.',
          },
          {
            name: 'children',
            type: 'ReactNode',
            description: 'Body content between the header and the footer.',
          },
        ]}
      />

      <h2>Accessibility</h2>
      <ul>
        <li>
          The panel renders with <code>role="dialog"</code> and <code>aria-modal="true"</code>.
        </li>
        <li>
          The title labels the dialog through <code>aria-labelledby</code>, and the description is
          linked through <code>aria-describedby</code>.
        </li>
        <li>
          Focus moves into the panel when the dialog opens and returns to the opening element when
          it closes.
        </li>
        <li>Tab and Shift+Tab cycle through the focusable elements inside the panel and cannot
          leave it while the dialog is open.</li>
        <li>Escape, the built-in close button, and a press on the overlay all call
          <code> onClose</code>.</li>
        <li>Body scroll is locked while the dialog is open and restored on close.</li>
        <li>
          Under <code>prefers-reduced-motion</code> the panel appears instantly instead of
          springing open.
        </li>
      </ul>

      <h2>Usage</h2>
      <ul>
        <li>Keep to one modal at a time. If a flow needs a second dialog, close the first before
          opening the next, or move the flow to its own page.</li>
        <li>
          Use <code>sm</code> for confirmations, since a short question and two buttons need no
          more width. Most forms fit <code>md</code>.
        </li>
        <li>Avoid nesting modals. Stacked dialogs break the focus trap expectations and bury the
          original context.</li>
        <li>Make the rightmost footer button the primary action and give secondary actions the
          ghost variant.</li>
        <li>Always pass a title. Without one the dialog has no accessible name.</li>
      </ul>
    </>
  );
}
