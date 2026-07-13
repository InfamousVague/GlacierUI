import { Box, CodeBlock, Stack, Heading, Text, Size, TextTone, useT } from '@glacier/react';
import { Example, HighlightedCode, PropsTable, prose, useHighlighted } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { type PlatformKit } from '../../platforms.tsx';
import { m } from '../../i18n.ts';

const sample = `import { Button } from '@glacier/react';

export function Save() {
  return <Button variant="primary">Save</Button>;
}`;

/**
 * A highlighted CodeBlock rendered by both bindings. The DOM kit needs
 * pre-highlighted markup, so the web pane is fed Shiki's HTML as children; the
 * native kit highlights `code` itself from the `language`, so its `children` are
 * ignored. Both resolve the same `--shiki-*` theme, so the two panes match.
 */
function HighlightedCodeDemo({ K }: { K: PlatformKit }) {
  const html = useHighlighted(sample);
  return (
    <Box style={{ width: '100%', maxWidth: '34rem' }}>
      <K.CodeBlock filename="Save.tsx" language="tsx" lineNumbers code={sample}>
        {html != null ? <div dangerouslySetInnerHTML={{ __html: html }} /> : undefined}
      </K.CodeBlock>
    </Box>
  );
}

export function CodeBlockPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.cbName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(m.cbLede)}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.anatomyIntroBox)}</Text>
      <ComponentBlueprint specId="code-block" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.cbEx1Title)}
        description={prose(t(m.cbEx1Desc))}
        component="CodeBlock"
        render={(K) => <HighlightedCodeDemo K={K} />}
        code={`import { CodeBlock } from '@glacier/react';

<CodeBlock filename="Save.tsx" language="tsx" code={source} />`}
      />

      <Example
        title={t(m.cbEx2Title)}
        description={prose(t(m.cbEx2Desc))}
        component="CodeBlock"
        render={(K) => (
          <Box style={{ width: '100%', maxWidth: '34rem' }}>
            <K.CodeBlock code="npm install @glacier/react" />
          </Box>
        )}
        code={`<CodeBlock code="npm install @glacier/react" />`}
      />

      <Example
        title={t(m.cbEx3Title)}
        description={prose(t(m.cbEx3Desc))}
        component="CodeBlock"
        render={(K) => (
          <Box style={{ width: '100%', maxWidth: '34rem' }}>
            <K.CodeBlock showCopy={false} code="GET /v1/status  200 OK" />
          </Box>
        )}
        code={`<CodeBlock showCopy={false} code="GET /v1/status  200 OK" />`}
      />

      <Example
        title={t(m.exSkeleton)}
        description={prose(t(m.cbEx4Desc))}
        code={`<CodeBlock skeleton code="" />
<CodeBlock filename="Save.tsx" language="tsx" code={source} />`}
      >
        <Stack gap={4} style={{ width: '100%', maxWidth: '34rem' }}>
          <CodeBlock skeleton code="" />
          <HighlightedCode filename="Save.tsx" language="tsx" code={sample} />
        </Stack>
      </Example>

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          {
            name: 'code',
            type: 'string',
            description: t(m.cbPropCode),
          },
          {
            name: 'language',
            type: 'string',
            description: t(m.cbPropLanguage),
          },
          {
            name: 'filename',
            type: 'string',
            description: t(m.cbPropFilename),
          },
          {
            name: 'children',
            type: 'ReactNode',
            description: t(m.cbPropChildren),
          },
          {
            name: 'showCopy',
            type: 'boolean',
            default: 'true',
            description: t(m.cbPropShowCopy),
          },
          {
            name: 'lineNumbers',
            type: 'boolean',
            default: 'false',
            description: t(m.cbPropLineNumbers),
          },
          {
            name: 'attached',
            type: 'boolean',
            default: 'false',
            description: t(m.cbPropAttached),
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: t(m.cbPropSkeleton),
          },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.cbA11y1))}</li>
        <li>{prose(t(m.cbA11y2))}</li>
        <li>{prose(t(m.cbA11y3))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.cbUse1))}</li>
        <li>{prose(t(m.cbUse2))}</li>
        <li>{prose(t(m.cbUse3))}</li>
        <li>{prose(t(m.cbUse4))}</li>
      </ul>
    </>
  );
}
