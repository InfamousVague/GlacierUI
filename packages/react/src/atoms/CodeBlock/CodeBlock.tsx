import { useState, type ComponentProps } from 'react';
import { cx } from '../../internal/cx.ts';
import { Skeleton } from '../Skeleton/Skeleton.tsx';
import styles from './CodeBlock.module.css';

export interface CodeBlockProps extends Omit<ComponentProps<'div'>, 'children'> {
  code: string;
  /** Shown as a label in the header. */
  language?: string;
  /** Shown in the header. */
  filename?: string;
  showCopy?: boolean;
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
  language,
  filename,
  showCopy = true,
  skeleton = false,
  glass = false,
  className,
  ...rest
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  if (skeleton) {
    return (
      <Skeleton
        width="100%"
        height="6rem"
        radius="var(--perfect-radius-lg)"
        className={className}
      />
    );
  }
  const showHeader = showCopy || filename != null || language != null;
  return (
    <div className={cx(styles.codeBlock, glass && styles.glass, className)} {...rest}>
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
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}
        </div>
      )}
      <pre className={styles.pre}>
        <code>{code}</code>
      </pre>
    </div>
  );
}
