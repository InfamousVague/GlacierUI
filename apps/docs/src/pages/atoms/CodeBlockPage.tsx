import { Box, CodeBlock, Stack, Heading, Text, Size, TextTone } from '@glacier/react';
import { Example, HighlightedCode, PropsTable } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';

const sample = `import { Button } from '@glacier/react';

export function Save() {
  return <Button variant="primary">Save</Button>;
}`;

export function CodeBlockPage() {
  return (
    <>
      <Heading level={1}>CodeBlock</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        A styled code surface with a copy button and an optional line-number gutter. CodeBlock ships
        no syntax highlighter, so it stays dependency-light: pass pre-highlighted markup as children
        for color, as these docs do, or render plain monospace on its own.
      </Text>

      <Heading level={2}>Anatomy</Heading>
      <Text tone={TextTone.Muted}>An inspection with the exact spec measurements labelled on the box.</Text>
      <ComponentBlueprint specId="code-block" />

      <Heading level={2}>Examples</Heading>

      <Example
        title="Filename and language"
        description={
          <>
            Set <code>filename</code> and <code>language</code> to label the block. Both appear in the
            header alongside the copy button.
          </>
        }
        code={`import { CodeBlock } from '@glacier/react';

<CodeBlock filename="Save.tsx" language="tsx" code={source} />`}
      >
        <Box style={{ width: '100%', maxWidth: '34rem' }}>
          <HighlightedCode filename="Save.tsx" language="tsx" lineNumbers code={sample} />
        </Box>
      </Example>

      <Example
        title="Copy only"
        description={
          <>
            With no <code>filename</code> or <code>language</code>, the header holds just the copy
            button. It copies <code>code</code> to the clipboard and shows a transient{' '}
            <code>Copied</code> label.
          </>
        }
        code={`<CodeBlock code="npm install @glacier/react" />`}
      >
        <Box style={{ width: '100%', maxWidth: '34rem' }}>
          <CodeBlock code="npm install @glacier/react" />
        </Box>
      </Example>

      <Example
        title="Without the copy button"
        description={
          <>
            Set <code>showCopy={'{false}'}</code> for read-only snippets. With no header content left,
            the block renders as a bare surface.
          </>
        }
        code={`<CodeBlock showCopy={false} code="GET /v1/status  200 OK" />`}
      >
        <Box style={{ width: '100%', maxWidth: '34rem' }}>
          <CodeBlock showCopy={false} code="GET /v1/status  200 OK" />
        </Box>
      </Example>

      <Example
        title="Skeleton"
        description={
          <>
            <code>skeleton</code> renders a shimmer block at the code surface's radius and a
            representative height, holding space while the snippet loads.
          </>
        }
        code={`<CodeBlock skeleton code="" />
<CodeBlock filename="Save.tsx" language="tsx" code={source} />`}
      >
        <Stack gap={4} style={{ width: '100%', maxWidth: '34rem' }}>
          <CodeBlock skeleton code="" />
          <HighlightedCode filename="Save.tsx" language="tsx" code={sample} />
        </Stack>
      </Example>

      <Heading level={2}>Props</Heading>
      <PropsTable
        props={[
          {
            name: 'code',
            type: 'string',
            description: 'The source text to render and copy. Required.',
          },
          {
            name: 'language',
            type: 'string',
            description: 'Optional label shown in the header. Does not affect rendering.',
          },
          {
            name: 'filename',
            type: 'string',
            description: 'Optional filename shown on the left of the header.',
          },
          {
            name: 'children',
            type: 'ReactNode',
            description: 'Pre-highlighted markup for the code; falls back to plain text when absent.',
          },
          {
            name: 'showCopy',
            type: 'boolean',
            default: 'true',
            description: 'Whether to render the copy button in the header.',
          },
          {
            name: 'lineNumbers',
            type: 'boolean',
            default: 'false',
            description: 'Renders a line-number gutter down the left edge.',
          },
          {
            name: 'attached',
            type: 'boolean',
            default: 'false',
            description: 'Drops the top border and corners so the block docks beneath the element above it.',
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: "Renders a placeholder with the component's exact geometry.",
          },
        ]}
      />

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>
          The copy button is a real <code>button</code> and is keyboard focusable. Its label toggles
          to <code>Copied</code> for a moment after a successful copy, so the confirmation is
          announced to screen readers.
        </li>
        <li>
          Copy uses the asynchronous clipboard API where available and falls back to a hidden
          textarea, so it works in browsers that block clipboard writes.
        </li>
        <li>
          The code renders inside <code>pre</code> and <code>code</code> elements, preserving
          whitespace and line breaks for both sighted users and assistive technology.
        </li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>
          Use CodeBlock for copy-paste snippets: install commands, config, short examples. It renders
          plain text, so pass code that reads clearly without color.
        </li>
        <li>
          Set <code>filename</code> when the snippet belongs to a specific file, and{' '}
          <code>language</code> to hint the syntax. Both are labels only.
        </li>
        <li>
          Turn off <code>showCopy</code> for output the reader would not paste, such as logs or
          terminal responses.
        </li>
        <li>
          For syntax colors, pass pre-highlighted markup as <code>children</code> (these docs feed it
          Shiki output); the kit ships no highlighter itself, so it stays dependency-light.
        </li>
      </ul>
    </>
  );
}
