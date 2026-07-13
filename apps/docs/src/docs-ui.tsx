import { useEffect, useState, type ReactNode } from 'react';
import { CodeBlock, Row, useT, type CodeBlockProps } from '@glacier/react';
import { PlatformDemo, type PlatformKit } from './platforms.tsx';
import { m } from './i18n.ts';

/**
 * Renders a translated string as prose, turning `backtick` spans into <code> so
 * inline code survives translation without hardcoding JSX in the message.
 */
export function prose(text: string): ReactNode {
  return text.split(/(`[^`]+`)/g).map((part, i) =>
    part.length > 1 && part.startsWith('`') && part.endsWith('`') ? (
      <code key={i}>{part.slice(1, -1)}</code>
    ) : (
      part
    ),
  );
}
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

export function useHighlighted(code: string): string | null {
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
  /** Web-only demo. Provide this, or `component` + `render` for a cross-platform demo. */
  children?: ReactNode;
  /**
   * Cross-platform mode: the component name whose bindings to compare. When set
   * with `render`, the demo is shown behind a per-platform toggle (Web / Native
   * / ...) instead of the single web `children` row, so the parity story lives
   * on the component's own page.
   */
  component?: string;
  /** The demo written once, rendered by each supporting platform's kit. */
  render?: (kit: PlatformKit) => ReactNode;
}

export function Example({ title, description, code, children, component, render }: ExampleProps) {
  const crossPlatform = component != null && render != null;
  return (
    <section className="example">
      {title && <h3 className="exampleTitle">{title}</h3>}
      {description && <p className="exampleDescription">{description}</p>}
      {crossPlatform ? (
        <div className="exampleDemo" style={{ padding: 'var(--glacier-space-8)' }}>
          <PlatformDemo component={component} render={render} />
        </div>
      ) : (
        <Row wrap gap={4} padding={8} className="exampleDemo">
          {children}
        </Row>
      )}
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
  const t = useT();
  return (
    <div className="propsTableWrap">
      <table className="tokenTable">
        <thead>
          <tr>
            <th>{t(m.tblProp)}</th>
            <th>{t(m.tblType)}</th>
            <th>{t(m.tblDefault)}</th>
            <th>{t(m.tblDescription)}</th>
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
              <td>{p.default ? <code>{p.default}</code> : t(m.tblNa)}</td>
              <td>{p.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
