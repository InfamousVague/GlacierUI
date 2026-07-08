import { useEffect, useState, type ReactNode } from 'react';
import { CodeBlock, Row, type CodeBlockProps } from '@glacier/react';
import { createCssVariablesTheme, createHighlighter, type Highlighter } from 'shiki';

/**
 * Shared building blocks for component documentation pages: live examples
 * with copy-paste code, and props tables.
 */

// Shiki with a CSS-variables theme: token colors are defined in docs.css from
// the kit's own ramps, so highlighting follows the light/dark theme for free.
const glacierTheme = createCssVariablesTheme({
  name: 'glacier',
  variablePrefix: '--shiki-',
  fontStyle: true,
});

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  highlighterPromise ??= createHighlighter({ themes: [glacierTheme], langs: ['tsx'] });
  return highlighterPromise;
}

function useHighlighted(code: string): string | null {
  const [html, setHtml] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    getHighlighter().then((h) => {
      if (alive) setHtml(h.codeToHtml(code, { lang: 'tsx', theme: 'glacier' }));
    });
    return () => {
      alive = false;
    };
  }, [code]);
  return html;
}

/**
 * A syntax-highlighted code block. Highlights with Shiki, then renders through
 * the kit's own CodeBlock so the docs dogfood the real component: the kit owns
 * the frame, header, copy button, and line-number gutter; the app supplies the
 * highlighted markup. Falls back to plain text until the highlighter loads.
 */
export function HighlightedCode({ code, ...props }: Omit<CodeBlockProps, 'children'>) {
  const html = useHighlighted(code);
  return (
    <CodeBlock code={code} {...props}>
      {html != null ? <div dangerouslySetInnerHTML={{ __html: html }} /> : undefined}
    </CodeBlock>
  );
}

export interface ExampleProps {
  title?: string;
  description?: ReactNode;
  /** Copy-paste source shown under the demo. */
  code: string;
  children: ReactNode;
}

export function Example({ title, description, code, children }: ExampleProps) {
  return (
    <section className="example">
      {title && <h3 className="exampleTitle">{title}</h3>}
      {description && <p className="exampleDescription">{description}</p>}
      <Row wrap gap={4} padding={8} className="exampleDemo">
        {children}
      </Row>
      <HighlightedCode code={code} language="tsx" lineNumbers attached />
    </section>
  );
}

export interface PropDef {
  name: string;
  type: string;
  default?: string;
  description: string;
}

export function PropsTable({ props }: { props: PropDef[] }) {
  return (
    <div className="propsTableWrap">
      <table className="tokenTable">
        <thead>
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>Default</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {props.map((p) => (
            <tr key={p.name}>
              <td>
                <code>{p.name}</code>
              </td>
              <td>
                <code>{p.type}</code>
              </td>
              <td>{p.default ? <code>{p.default}</code> : 'n/a'}</td>
              <td>{p.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
