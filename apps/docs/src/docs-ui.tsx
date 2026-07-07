import { useEffect, useState, type ReactNode } from 'react';
import { createCssVariablesTheme, createHighlighter, type Highlighter } from 'shiki';

/**
 * Shared building blocks for component documentation pages: live examples
 * with copy-paste code, and props tables.
 */

// Shiki with a CSS-variables theme: token colors are defined in docs.css from
// the kit's own ramps, so highlighting follows the light/dark theme for free.
const perfectTheme = createCssVariablesTheme({
  name: 'perfect',
  variablePrefix: '--shiki-',
  fontStyle: true,
});

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  highlighterPromise ??= createHighlighter({ themes: [perfectTheme], langs: ['tsx'] });
  return highlighterPromise;
}

function useHighlighted(code: string): string | null {
  const [html, setHtml] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    getHighlighter().then((h) => {
      if (alive) setHtml(h.codeToHtml(code, { lang: 'tsx', theme: 'perfect' }));
    });
    return () => {
      alive = false;
    };
  }, [code]);
  return html;
}

function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).catch(() => copyViaTextarea(text));
  }
  return Promise.resolve(copyViaTextarea(text));
}

function copyViaTextarea(text: string): void {
  const el = document.createElement('textarea');
  el.value = text;
  el.style.position = 'fixed';
  el.style.opacity = '0';
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  el.remove();
}

export function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const html = useHighlighted(code);
  return (
    <div className="codeBlock">
      <button
        type="button"
        className="copyButton"
        onClick={() => {
          copyText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          });
        }}
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
      {html ? (
        <div dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <pre>
          <code>{code}</code>
        </pre>
      )}
    </div>
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
      <div className="exampleDemo">{children}</div>
      <CodeBlock code={code} />
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
