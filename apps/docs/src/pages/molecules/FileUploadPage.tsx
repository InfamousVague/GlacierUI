import { useState } from 'react';
import { Field, FileUpload, Heading, Text, Size, TextTone, type FileUploadRejection } from '@glacier/react';
import { Example, PropsTable } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';

const REASON_LABEL: Record<FileUploadRejection['reason'], string> = {
  type: 'wrong type',
  size: 'too large',
  count: 'over the file limit',
};

function ValidationDemo() {
  const [rejections, setRejections] = useState<FileUploadRejection[]>([]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--glacier-space-3)' }}>
      <FileUpload
        aria-label="Images"
        multiple
        accept="image/*"
        maxSize={1024 * 1024}
        maxFiles={3}
        hint="Images only, up to 1 MB each, 3 files max"
        onReject={setRejections}
      />
      {rejections.length > 0 && (
        <ul style={{ margin: 0, paddingInlineStart: 'var(--glacier-space-5)' }}>
          {rejections.map((rejection, index) => (
            <li key={index}>
              <Text tone={TextTone.Muted}>
                {rejection.file.name} was rejected: {REASON_LABEL[rejection.reason]}.
              </Text>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ControlledDemo() {
  const [files, setFiles] = useState<File[]>([]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--glacier-space-3)' }}>
      <FileUpload aria-label="Attachments" multiple value={files} onFilesChange={setFiles} />
      <Text tone={TextTone.Muted}>
        {files.length === 0 ? 'No files selected.' : `Holding ${files.length} file(s) in state.`}
      </Text>
    </div>
  );
}

export function FileUploadPage() {
  return (
    <>
      <Heading level={1}>FileUpload</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        A dropzone that chooses, validates, lists, and removes files, and deliberately nothing
        more: it carries no transport policy and never uploads. A visually hidden native{' '}
        <code>input[type=file]</code> inside the zone provides keyboard access, the screen-reader
        name, and form participation; drag-and-drop is a progressive enhancement over it.
      </Text>

      <Heading level={2}>Anatomy</Heading>
      <Text tone={TextTone.Muted}>An inspection with the exact spec measurements labelled on the figure.</Text>
      <ComponentBlueprint specId="file-upload" />

      <Heading level={2}>Examples</Heading>

      <Example
        title="Basic"
        description="Click anywhere in the zone (or Tab to it and press Enter) to open the native chooser, or drag files onto it. Accepted files are listed below the zone with a locale-formatted size and a remove button."
        code={`import { FileUpload } from '@glacier/react';

<FileUpload aria-label="Attachments" multiple />`}
      >
        <FileUpload aria-label="Attachments" multiple />
      </Example>

      <Example
        title="Validation"
        description="accept is applied to the input and re-enforced in JS on drop; maxSize caps each file in bytes; maxFiles caps the total and shows the count summary in the zone. Rejected files never enter the list - they go to onReject with a reason of type, size, or count."
        code={`const [rejections, setRejections] = useState<FileUploadRejection[]>([]);

<FileUpload
  aria-label="Images"
  multiple
  accept="image/*"
  maxSize={1024 * 1024}
  maxFiles={3}
  hint="Images only, up to 1 MB each, 3 files max"
  onReject={setRejections}
/>`}
      >
        <ValidationDemo />
      </Example>

      <Example
        title="Controlled"
        description="Drive the file list from state with value + onFilesChange. Additions from the chooser or a drop and removals from the list all report the next array; the component renders whatever the prop holds."
        code={`const [files, setFiles] = useState<File[]>([]);

<FileUpload aria-label="Attachments" multiple value={files} onFilesChange={setFiles} />`}
      >
        <ControlledDemo />
      </Example>

      <Example
        title="In a Field"
        description="Inside a Field the input inherits the field id, description, and invalid state, so the field label opens the chooser and errors paint the danger border."
        code={`<Field label="Contract" hint="One PDF, up to 2 MB.">
  <FileUpload accept="application/pdf" maxSize={2 * 1024 * 1024} />
</Field>`}
      >
        <Field label="Contract" hint="One PDF, up to 2 MB.">
          <FileUpload accept="application/pdf" maxSize={2 * 1024 * 1024} />
        </Field>
      </Example>

      <Example
        title="Disabled"
        description="A disabled zone dims onto the sunken surface and ignores clicks, keyboard activation, and drops."
        code={`<FileUpload aria-label="Attachments" disabled />`}
      >
        <FileUpload aria-label="Attachments" disabled />
      </Example>

      <Example
        title="Skeleton"
        description="The skeleton placeholder keeps the dropzone geometry so content does not shift when the control arrives."
        code={`<FileUpload aria-label="Attachments" skeleton />`}
      >
        <FileUpload aria-label="Attachments" skeleton />
      </Example>

      <Heading level={2}>Props</Heading>
      <PropsTable
        props={[
          { name: 'accept', type: 'string', description: 'Native accept string (.pdf,image/*); also enforced in JS on drop. Failures reject with reason type.' },
          { name: 'maxSize', type: 'number', description: 'Per-file size cap in bytes; larger files reject with reason size.' },
          { name: 'maxFiles', type: 'number', description: 'Total file cap; files past it reject with reason count. Also shows the count summary in the zone.' },
          { name: 'multiple', type: 'boolean', default: 'false', description: 'Allows picking and keeping more than one file. A single-file zone replaces its selection.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Blocks the chooser, drops, and removal.' },
          { name: 'name', type: 'string', description: 'Submitted with forms through the real file input when set.' },
          { name: 'value', type: 'File[]', description: 'Controlled selected files.' },
          { name: 'defaultValue', type: 'File[]', description: 'Uncontrolled initial files.' },
          { name: 'onFilesChange', type: '(files: File[]) => void', description: 'Called with the next file list after files are added or removed.' },
          { name: 'onReject', type: '(rejections: FileUploadRejection[]) => void', description: 'Called with every refused file and its reason; rejected files never enter the list.' },
          { name: 'label', type: 'string', description: 'Primary line override; defaults to the localized kit string.' },
          { name: 'hint', type: 'string', description: 'Supporting line override; defaults to the localized kit string.' },
          { name: 'skeleton', type: 'boolean', default: 'false', description: 'Renders a placeholder with the dropzone geometry.' },
          { name: 'glass', type: 'boolean', default: 'false', description: 'Uses the frosted glass material for the dropzone surface.' },
          { name: 'id', type: 'string', description: 'Id for the native file input; falls back to the surrounding Field id.' },
          { name: 'aria-label', type: 'string', description: 'Accessible name when no surrounding Field label is present.' },
        ]}
      />

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>
          The zone is a <code>label</code> wrapping a real <code>input[type=file]</code>, so
          clicking anywhere opens the native chooser and assistive tech interacts with the
          platform control, not a re-implementation.
        </li>
        <li>
          Tab reaches the visually hidden input and paints the focus ring on the zone; Enter and
          Space open the chooser. Drag-and-drop is purely an enhancement on top.
        </li>
        <li>
          Inside a Field the input reads <code>id</code>, <code>aria-describedby</code>, and{' '}
          <code>aria-invalid</code> from the field; otherwise give it an <code>aria-label</code>.
        </li>
        <li>Each remove button carries a localized per-file name, and sizes are formatted for the active locale.</li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>
          FileUpload only selects files - transport is your job. Read the list from{' '}
          <code>onFilesChange</code> (or submit the form; the real input carries <code>name</code>)
          and upload with your own client.
        </li>
        <li>
          Always handle <code>onReject</code> when you set <code>accept</code>,{' '}
          <code>maxSize</code>, or <code>maxFiles</code>: silently dropped files feel like a bug to
          the user. A Toast or an inline list next to the zone both work.
        </li>
        <li>
          Put size and type expectations in the <code>hint</code> line so users know the rules
          before they pick.
        </li>
      </ul>
    </>
  );
}
