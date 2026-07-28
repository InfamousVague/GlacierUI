import { Heading, Size, Text, TextTone, useT } from '@glacier/react';
import { useState } from 'react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { type PlatformKit } from '../../platforms.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

function EditorDemo({ K, ...props }: { K: PlatformKit } & Record<string, unknown>) {
  const t = useT();
  const [value, setValue] = useState(t(m.rteSample));
  return (
    <div style={{ width: '100%' }}>
      <K.RichTextEditor
        value={value}
        onValueChange={setValue}
        placeholder={t(m.rtePlaceholder)}
        aria-label={t(m.rteName)}
        rows={6}
        {...props}
      />
    </div>
  );
}

export function RichTextEditorPage() {
  const t = useT();

  return (
    <>
      <Heading level={1}>{t(m.rteName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(m.rteLede)}
      </Text>
      <Text tone={TextTone.Muted}>{prose(t(m.rteWhyMarkdown))}</Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.rteAnatomy)}</Text>
      <ComponentBlueprint specId="rich-text-editor" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.exBasic)}
        description={t(m.rteExBasicDesc)}
        component="RichTextEditor"
        render={(K) => <EditorDemo K={K} />}
        code={`import { RichTextEditor } from '@glacier/react';

const [value, setValue] = useState('');

<RichTextEditor
  value={value}
  onValueChange={setValue}
  placeholder="Write something…"
  aria-label="Notes"
/>

// ⌘B / ⌘I / ⌘E toggle bold, italic, and inline code.`}
      />

      <Example
        title={t(m.rteExBlocksTitle)}
        description={t(m.rteExBlocksDesc)}
        component="RichTextEditor"
        render={(K) => <EditorDemo K={K} marks={['bold', 'italic']} />}
        code={`// Offer only what your renderer supports.
<RichTextEditor
  marks={['bold', 'italic']}
  blocks={['heading', 'quote', 'bullet', 'number']}
/>`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'value', type: 'string', description: t(m.rtePropValue) },
          { name: 'defaultValue', type: 'string', default: "''", description: t(m.rtePropValue) },
          { name: 'onValueChange', type: '(value: string) => void', description: t(m.rtePropValue) },
          { name: 'marks', type: "('bold' | 'italic' | 'code' | 'strike')[]", description: t(m.rtePropMarks) },
          { name: 'blocks', type: "('heading' | 'quote' | 'bullet' | 'number')[]", description: t(m.rtePropBlocks) },
          { name: 'rows', type: 'number', default: '8', description: t(m.rtePropRows) },
          { name: 'maxLength', type: 'number', description: t(m.rtePropMaxLength) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.rteA11y1))}</li>
        <li>{prose(t(m.rteA11y2))}</li>
        <li>{prose(t(m.rteA11y3))}</li>
        <li>{prose(t(m.rteA11y4))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.rteUse1))}</li>
        <li>{prose(t(m.rteUse2))}</li>
        <li>{prose(t(m.rteUse3))}</li>
      </ul>
    </>
  );
}
