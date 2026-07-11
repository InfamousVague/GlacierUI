import { useState, type ComponentProps, type ReactNode } from 'react';
import { cx } from '../../../internal/cx.ts';
import { useT } from '../../../i18n/LocaleProvider.tsx';
import { kitMessages } from '../../../i18n/messages.ts';
import { Skeleton } from '../../feedback/Skeleton/Skeleton.tsx';
import styles from './CodeBlock.module.css';

export interface CodeBlockProps extends Omit<ComponentProps<'div'>, 'children'> {
  /** The source text: the accessible content, what the copy button copies, and the plain fallback. */
  code: string;
  /**
   * A pre-highlighted rendering of `code`, e.g. syntax-highlighted markup from a
   * highlighter. The kit ships no highlighter itself, so an app passes the
   * highlighted nodes here; without them the plain `code` renders.
   */
  children?: ReactNode;
  /** Shown as a label in the header. */
  language?: string;
  /** Shown in the header. */
  filename?: string;
  showCopy?: boolean;
  /** Renders a line-number gutter down the left edge. */
  lineNumbers?: boolean;
  /** Drops the top border and top corners so the block docks beneath the element above it. */
  attached?: boolean;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Renders the frosted glass material instead of a solid surface. */
  glass?: boolean;
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

export function CodeBlock({
  code,
  children,
  language,
  filename,
  showCopy = true,
  lineNumbers = false,
  attached = false,
  skeleton = false,
  glass = false,
  className,
  ...rest
}: CodeBlockProps) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  if (skeleton) {
    return (
      <Skeleton
        width="100%"
        height="6rem"
        radius="var(--glacier-radius-lg)"
        className={className}
      />
    );
  }
  const showHeader = showCopy || filename != null || language != null;
  const preClass = cx(styles.pre, lineNumbers && styles.numbered);
  return (
    <div
      className={cx(styles.codeBlock, glass && styles.glass, attached && styles.attached, className)}
      {...rest}
    >
      {showHeader && (
        <div className={styles.header}>
          <span className={styles.meta}>
            {filename != null && <span className={styles.filename}>{filename}</span>}
            {language != null && <span className={styles.language}>{language}</span>}
          </span>
          {showCopy && (
            <button
              type="button"
              className={styles.copy}
              onClick={() => {
                copyText(code).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                });
              }}
            >
              {copied ? t(kitMessages.copied) : t(kitMessages.copy)}
            </button>
          )}
        </div>
      )}
      {children != null ? (
        // The app supplies the highlighted markup; .pre lays it out, the inner
        // highlighter <pre> is reset to inherit spacing and background. Source
        // code is inherently left-to-right, so the sample is pinned dir=ltr and
        // never bidi-reorders inside an RTL page.
        <div className={preClass} dir="ltr">
          {children}
        </div>
      ) : (
        <pre className={preClass} dir="ltr">
          <code>
            {lineNumbers
              ? code.split('\n').map((line, i, all) => (
                  <span className="line" key={i}>
                    {line}
                    {i < all.length - 1 ? '\n' : ''}
                  </span>
                ))
              : code}
          </code>
        </pre>
      )}
    </div>
  );
}
