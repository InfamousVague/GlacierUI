import { useEffect, useState } from 'react';

/**
 * Native syntax highlighting for CodeBlock.
 *
 * React Native has no DOM, so the web kit's `codeToHtml` (which emits `<span>`
 * markup) cannot be used. Shiki also exposes `codeToTokens`, which returns pure
 * data — an array of lines, each an array of `{ content, color }` tokens — with
 * no renderer assumptions. The CodeBlock renders each token as a nested <Text>,
 * so the same highlighter drives both platforms.
 *
 * The theme is Shiki's CSS-variables theme with the SAME `--shiki-*` prefix the
 * docs use, so a token's color is `var(--shiki-…)`: on react-native-web the
 * browser resolves it against the docs' palette (identical to the web CodeBlock,
 * and theme-reactive). On a device a token→color swap resolves those vars — the
 * device follow-up — but the tokenization itself runs anywhere (Shiki ships a
 * pure-JS engine, no WASM/DOM). Shiki is a lazy, optional import: if it is not
 * installed the hook returns null and CodeBlock falls back to plain monospace.
 */
export interface CodeToken {
  content: string;
  color?: string;
}

// One highlighter for the whole app, created on first use. `any` because Shiki
// is an optional dependency with no types guaranteed at the device layer.
let highlighterPromise: Promise<unknown> | null = null;

// The language grammars the docs actually use, preloaded together.
const LANGS = ['tsx', 'ts', 'jsx', 'js', 'json', 'bash', 'css', 'html'];

function getHighlighter(): Promise<unknown> {
  highlighterPromise ??= import('shiki').then((shiki) => {
    const theme = shiki.createCssVariablesTheme({
      name: 'glacier',
      variablePrefix: '--shiki-',
      fontStyle: true,
    });
    return shiki.createHighlighter({ themes: [theme], langs: LANGS });
  });
  return highlighterPromise;
}

/**
 * Tokenize `code` for `language` into colored lines, or null while loading /
 * when there is no language / when the highlighter is unavailable (plain-text
 * fallback). Recomputes when the code or language changes.
 */
export function useHighlightedLines(code: string, language?: string): CodeToken[][] | null {
  const [lines, setLines] = useState<CodeToken[][] | null>(null);

  useEffect(() => {
    const lang = language?.toLowerCase();
    if (!lang || !LANGS.includes(lang)) {
      setLines(null);
      return;
    }
    let alive = true;
    getHighlighter()
      .then((h) => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const result = (h as any).codeToTokens(code, { lang, theme: 'glacier' });
          const tokens: CodeToken[][] = result.tokens.map((line: CodeToken[]) =>
            line.map((tk) => ({ content: tk.content, color: tk.color })),
          );
          if (alive) setLines(tokens);
        } catch {
          if (alive) setLines(null);
        }
      })
      .catch(() => {
        if (alive) setLines(null);
      });
    return () => {
      alive = false;
    };
  }, [code, language]);

  return lines;
}
