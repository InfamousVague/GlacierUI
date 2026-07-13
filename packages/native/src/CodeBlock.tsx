import { type ReactNode } from 'react';
import { View, Text, type ViewProps } from 'react-native';
import { codeBlockSpec } from '@glacier/spec';
import { t } from './tokens.ts';
import { dimensionsFor } from './resolve.ts';
import { useHighlightedLines } from './highlight.ts';
import { Skeleton } from './Skeleton.tsx';

export interface CodeBlockProps extends Omit<ViewProps, 'style' | 'children'> {
  /** The source text: the accessible content and the plain fallback shown here. */
  code: string;
  /**
   * WEB-ONLY. On the DOM kit this is pre-highlighted markup from a syntax
   * highlighter (e.g. Shiki). React Native cannot run the highlighter, so the
   * native binding ignores `children` and always renders the plain `code`. Kept
   * on the prop contract so the docs can compare the frame 1:1.
   */
  children?: ReactNode;
  /** Shown as an uppercase label in the header. */
  language?: string;
  /** Shown in the header (monospace, truncated with an ellipsis when it overflows). */
  filename?: string;
  /** Shows the (non-interactive here) copy chip in the header. */
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

// Size-independent box + header + copy metrics read once from the spec.
const DIMS = dimensionsFor(codeBlockSpec);

// The frame's base paint (surface + hairline border) comes from the spec's
// structured `paint`; strip the leading `$` exactly as the shared resolvers do
// so the tokens cannot drift from the web kit.
const bare = (v?: string): string | undefined => (v?.startsWith('$') ? v.slice(1) : v);
const BASE = (codeBlockSpec.paint ?? {}) as { background?: string; border?: string };
const SURFACE = bare(BASE.background) ?? 'surface-sunken';
const BORDER = bare(BASE.border) ?? 'border-subtle';

// The monospace code area style, matching the web `.pre` rule (font-mono,
// font-size-xs, line-height leading-md, color text). lineHeight takes the
// unitless `leading-md` multiplier — on react-native-web it becomes
// `line-height: var(--glacier-leading-md)` and resolves exactly like the DOM.
const CODE_TEXT = {
  fontFamily: t('font-mono'),
  fontSize: t('font-size-xs'),
  lineHeight: t('leading-md') as never,
  color: t('text'),
};

/**
 * The Glacier CodeBlock, rendered with React Native primitives. The framed
 * surface (background, hairline border, radius), the header bar (filename +
 * language + copy chip), the line-number gutter, and the monospace code area
 * are all painted and sized from the code-block spec through the shared
 * resolvers, so the frame is visually identical to @glacier/react's CodeBlock
 * and cannot drift from it.
 *
 * Syntax highlighting: the web kit takes pre-highlighted `children` (Shiki HTML)
 * because the DOM renders markup; the native binding instead highlights `code`
 * itself via Shiki's `codeToTokens` (see highlight.ts) and paints each token as a
 * colored <Text> span. Same theme, same colors. Shiki is a lazy, optional import
 * — with no `language`, or if it is unavailable, the plain `code` renders.
 *
 * WEB-ONLY features the native binding drops (accepted-but-noop, documented):
 *   - Copy-to-clipboard: the copy chip renders as a resting visual only (no
 *     clipboard write, no "Copied" flip); `showCopy` still toggles it.
 *   - Horizontal scroll of long lines (web `overflow-x: auto`), the glass
 *     backdrop-blur/inset highlight, and the copy-hover wash have no native
 *     runtime equivalent here — the resting visual is matched.
 */
export function CodeBlock({
  code,
  children: _children,
  language,
  filename,
  showCopy = true,
  lineNumbers = false,
  attached = false,
  skeleton = false,
  glass = false,
  ...rest
}: CodeBlockProps) {
  // Colored tokens for `language` (null while loading / no language / Shiki
  // unavailable → the plain-text fallback below). The web kit takes pre-rendered
  // highlight markup as children; the native binding highlights `code` itself.
  const hlLines = useHighlightedLines(code, language);
  if (skeleton) {
    // Same placeholder geometry as the web: full width, 6rem tall, radius-lg.
    return <Skeleton width="100%" height="6rem" radius={t(DIMS.radius ?? 'radius-lg')} {...rest} />;
  }

  const showHeader = showCopy || filename != null || language != null;
  const lines = code.split('\n');

  return (
    <View
      style={{
        borderWidth: t(DIMS.border ?? 'hairline'),
        borderStyle: 'solid',
        // Glass swaps to the frosted tint + border (native cannot blur, so this
        // is the resting material only), matching the web `.glass` rule.
        borderColor: glass ? t('glass-border') : t(BORDER),
        borderRadius: t(DIMS.radius ?? 'radius-lg'),
        backgroundColor: glass ? t('glass-regular') : t(SURFACE),
        overflow: 'hidden',
        // Docked beneath the element above it: no top edge, square top corners.
        ...(attached
          ? { borderTopWidth: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0 }
          : null),
      }}
      {...rest}
    >
      {showHeader && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            columnGap: t(DIMS.gap ?? 'space-3'),
            paddingVertical: t(DIMS.headerPaddingBlock ?? 'space-2'),
            paddingHorizontal: t(DIMS.headerPaddingInline ?? 'space-3'),
            borderBottomWidth: t(DIMS.border ?? 'hairline'),
            borderBottomColor: t(BORDER),
            borderStyle: 'solid',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'baseline',
              columnGap: t('space-2'),
              // min-width:0 on the web; lets the filename truncate.
              flexShrink: 1,
            }}
          >
            {filename != null && (
              <Text
                numberOfLines={1}
                style={{
                  color: t('text'),
                  fontFamily: t('font-mono'),
                  fontSize: t('font-size-xs'),
                  flexShrink: 1,
                }}
              >
                {filename}
              </Text>
            )}
            {language != null && (
              <Text
                numberOfLines={1}
                style={{
                  color: t('text-muted'),
                  fontFamily: t('font-mono'),
                  fontSize: t('font-size-xs'),
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em' as never,
                }}
              >
                {language}
              </Text>
            )}
          </View>
          {showCopy && (
            // Resting-only chip: the clipboard write and the "Copied" label swap
            // are web-only, so this is a static visual to match the frame.
            <View
              style={{
                flexShrink: 0,
                borderWidth: t('hairline'),
                borderColor: t(BORDER),
                borderStyle: 'solid',
                borderRadius: t(DIMS.copyRadius ?? 'radius-sm'),
                paddingVertical: t(DIMS.copyPaddingBlock ?? 'space-1'),
                paddingHorizontal: t(DIMS.copyPaddingInline ?? 'space-2'),
                backgroundColor: 'transparent',
              }}
            >
              <Text
                style={{
                  color: t('text-muted'),
                  fontFamily: t('font-sans'),
                  fontSize: t('font-size-xs'),
                }}
              >
                Copy
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={{ padding: t(DIMS.prePadding ?? 'space-4') }}>
        {hlLines ? (
          // Highlighted: one <Text> per line holding colored nested <Text> token
          // spans (React Native's inline rich-text idiom — preserves whitespace
          // and wraps like text). Each token color is a `var(--shiki-*)` the
          // browser resolves, so it matches the web CodeBlock exactly.
          hlLines.map((tokens, i) => (
            <View key={i} style={{ flexDirection: 'row' }}>
              {lineNumbers && (
                <Text
                  style={{ ...CODE_TEXT, color: t('text-subtle'), minWidth: '2ch' as never, marginRight: t('space-4'), textAlign: 'right' }}
                >
                  {i + 1}
                </Text>
              )}
              <Text style={{ ...CODE_TEXT, flexShrink: 1 }}>
                {tokens.map((tok, j) => (
                  <Text key={j} style={tok.color ? { color: tok.color } : undefined}>
                    {tok.content}
                  </Text>
                ))}
              </Text>
            </View>
          ))
        ) : lineNumbers ? (
          lines.map((line, i) => (
            <View key={i} style={{ flexDirection: 'row' }}>
              <Text
                style={{
                  ...CODE_TEXT,
                  color: t('text-subtle'),
                  // min-width:2ch + margin-inline-end space-4, right-aligned, per
                  // the web `.numbered .line::before` gutter counter.
                  minWidth: '2ch' as never,
                  marginRight: t('space-4'),
                  textAlign: 'right',
                }}
              >
                {i + 1}
              </Text>
              <Text style={{ ...CODE_TEXT, flexShrink: 1 }}>{line}</Text>
            </View>
          ))
        ) : (
          // Plain source; newlines are preserved inside a single Text.
          <Text style={CODE_TEXT}>{code}</Text>
        )}
      </View>
    </View>
  );
}
