import { CodeBlock } from '@perfect/react';
import { Example, PropsTable } from '../docs-ui.tsx';

const sample = `import { Button } from '@perfect/react';

export function Save() {
  return <Button variant="primary">Save</Button>;
}`;

export function CodeBlockPage() {
  return (
    <>
      <h1>CodeBlock</h1>
      <p className="lede">
        A styled code surface with a copy button. CodeBlock renders plain monospace text on a sunken
        surface, with an optional header for a filename and language label. It ships no syntax
        highlighter, so it stays dependency-light.
      </p>

      <h2>Examples</h2>

      <Example
        title="Filename and language"
        description={
          <>
            Set <code>filename</code> and <code>language</code> to label the block. Both appear in the
            header alongside the copy button.
          </>
        }
        code={`import { CodeBlock } from '@perfect/react';

<CodeBlock filename="Save.tsx" language="tsx" code={source} />`}
      >
        <div style={{ width: '100%', maxWidth: '34rem' }}>
          <CodeBlock filename="Save.tsx" language="tsx" code={sample} />
        </div>
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
        code={`<CodeBlock code="npm install @perfect/react" />`}
      >
        <div style={{ width: '100%', maxWidth: '34rem' }}>
          <CodeBlock code="npm install @perfect/react" />
        </div>
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
        <div style={{ width: '100%', maxWidth: '34rem' }}>
          <CodeBlock showCopy={false} code="GET /v1/status  200 OK" />
        </div>
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
        <div className="stack" style={{ width: '100%', maxWidth: '34rem' }}>
          <CodeBlock skeleton code="" />
          <CodeBlock filename="Save.tsx" language="tsx" code={sample} />
        </div>
      </Example>

      <h2>Props</h2>
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
            name: 'showCopy',
            type: 'boolean',
            default: 'true',
            description: 'Whether to render the copy button in the header.',
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: "Renders a placeholder with the component's exact geometry.",
          },
        ]}
      />

      <h2>Accessibility</h2>
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

      <h2>Usage</h2>
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
          For rich syntax highlighting in documentation, layer a highlighter at the app level.
          CodeBlock itself stays dependency-light on purpose.
        </li>
      </ul>
    </>
  );
}
