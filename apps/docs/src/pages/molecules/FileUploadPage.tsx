import { useState } from 'react';
import { Field, Heading, Text, Size, TextTone, useT, type FileUploadRejection } from '@glacier/react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { type PlatformKit } from '../../platforms.tsx';
import { m } from '../../i18n.ts';

function ValidationDemo({ K }: { K: PlatformKit }) {
  const t = useT();
  const REASON_LABEL: Record<FileUploadRejection['reason'], string> = {
    type: t(m.fuReasonType),
    size: t(m.fuReasonSize),
    count: t(m.fuReasonCount),
  };
  const [rejections, setRejections] = useState<FileUploadRejection[]>([]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--glacier-space-3)' }}>
      <K.FileUpload
        aria-label={t(m.fuAriaImages)}
        multiple
        accept="image/*"
        maxSize={1024 * 1024}
        maxFiles={3}
        hint={t(m.fuHintImages)}
        onReject={setRejections}
      />
      {rejections.length > 0 && (
        <ul style={{ margin: 0, paddingInlineStart: 'var(--glacier-space-5)' }}>
          {rejections.map((rejection, index) => (
            <li key={index}>
              <Text tone={TextTone.Muted}>
                {rejection.file.name} {t(m.fuRejectedLabel)} {REASON_LABEL[rejection.reason]}.
              </Text>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ControlledDemo({ K }: { K: PlatformKit }) {
  const t = useT();
  const [files, setFiles] = useState<File[]>([]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--glacier-space-3)' }}>
      <K.FileUpload aria-label={t(m.fuAriaAttachments)} multiple value={files} onFilesChange={setFiles} />
      <Text tone={TextTone.Muted}>
        {files.length === 0 ? t(m.fuNoFiles) : `${t(m.fuHoldingPrefix)}${files.length}${t(m.fuHoldingSuffix)}`}
      </Text>
    </div>
  );
}

export function FileUploadPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.fuName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.fuLede))}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.anatomyIntro)}</Text>
      <ComponentBlueprint specId="file-upload" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.exBasic)}
        description={t(m.fuEx1Desc)}
        component="FileUpload"
        render={(K) => <K.FileUpload aria-label={t(m.fuAriaAttachments)} multiple />}
        code={`import { FileUpload } from '@glacier/react';

<FileUpload aria-label="Attachments" multiple />`}
      />

      <Example
        title={t(m.fuEx2Title)}
        description={t(m.fuEx2Desc)}
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
        component="FileUpload"
        render={(K) => <ValidationDemo K={K} />}
      />

      <Example
        title={t(m.fuEx3Title)}
        description={t(m.fuEx3Desc)}
        code={`const [files, setFiles] = useState<File[]>([]);

<FileUpload aria-label="Attachments" multiple value={files} onFilesChange={setFiles} />`}
        component="FileUpload"
        render={(K) => <ControlledDemo K={K} />}
      />

      <Example
        title={t(m.fuEx4Title)}
        description={t(m.fuEx4Desc)}
        code={`<Field label="Contract" hint="One PDF, up to 2 MB.">
  <FileUpload accept="application/pdf" maxSize={2 * 1024 * 1024} />
</Field>`}
        component="FileUpload"
        render={(K) => (
          <Field label={t(m.fuLabelContract)} hint={t(m.fuHintContract)}>
            <K.FileUpload accept="application/pdf" maxSize={2 * 1024 * 1024} />
          </Field>
        )}
      />

      <Example
        title={t(m.fuEx5Title)}
        description={t(m.fuEx5Desc)}
        component="FileUpload"
        render={(K) => <K.FileUpload aria-label={t(m.fuAriaAttachments)} disabled />}
        code={`<FileUpload aria-label="Attachments" disabled />`}
      />

      <Example
        title={t(m.exSkeleton)}
        description={t(m.fuEx6Desc)}
        component="FileUpload"
        render={(K) => <K.FileUpload aria-label={t(m.fuAriaAttachments)} skeleton />}
        code={`<FileUpload aria-label="Attachments" skeleton />`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'accept', type: 'string', description: t(m.fuPropAccept) },
          { name: 'maxSize', type: 'number', description: t(m.fuPropMaxSize) },
          { name: 'maxFiles', type: 'number', description: t(m.fuPropMaxFiles) },
          { name: 'multiple', type: 'boolean', default: 'false', description: t(m.fuPropMultiple) },
          { name: 'disabled', type: 'boolean', default: 'false', description: t(m.fuPropDisabled) },
          { name: 'name', type: 'string', description: t(m.fuPropName) },
          { name: 'value', type: 'File[]', description: t(m.fuPropValue) },
          { name: 'defaultValue', type: 'File[]', description: t(m.fuPropDefaultValue) },
          { name: 'onFilesChange', type: '(files: File[]) => void', description: t(m.fuPropOnFilesChange) },
          { name: 'onReject', type: '(rejections: FileUploadRejection[]) => void', description: t(m.fuPropOnReject) },
          { name: 'label', type: 'string', description: t(m.fuPropLabel) },
          { name: 'hint', type: 'string', description: t(m.fuPropHint) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(m.fuPropSkeleton) },
          { name: 'glass', type: 'boolean', default: 'false', description: t(m.fuPropGlass) },
          { name: 'id', type: 'string', description: t(m.fuPropId) },
          { name: 'aria-label', type: 'string', description: t(m.fuPropAriaLabel) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.fuA11y1))}</li>
        <li>{t(m.fuA11y2)}</li>
        <li>{prose(t(m.fuA11y3))}</li>
        <li>{t(m.fuA11y4)}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.fuUse1))}</li>
        <li>{prose(t(m.fuUse2))}</li>
        <li>{prose(t(m.fuUse3))}</li>
      </ul>
    </>
  );
}
