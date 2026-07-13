/**
 * Kbd — the React Native binding of @glacier/react's Kbd.
 *
 * A monospace key cap with a raised 2px bottom edge. Paint (surface-sunken
 * fill, text-muted label, hairline border) and geometry (radius, padding,
 * font-size) are read from `kbdSpec` through the shared resolvers, so it stays
 * pixel-identical to the DOM kit and cannot drift. The label lives in <Text>
 * (color + fontSize must sit on Text — a View does not inherit them). `glass`
 * swaps in the frosted material tint; the web's backdrop blur/saturate and the
 * inset highlight have no React Native runtime, so they are accepted-but-noop
 * and only the resting tint remains. `skeleton` delegates to the shared
 * Skeleton with the exact key-cap geometry, exactly as the web kit does.
 */
import { type ReactNode } from 'react';
import { View, Text, type ViewProps } from 'react-native';
import { kbdSpec } from '@glacier/spec';
import { t } from './tokens.ts';
import { dimensionsFor } from './resolve.ts';
import { Skeleton } from './Skeleton.tsx';

export interface KbdProps extends Omit<ViewProps, 'children' | 'style'> {
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Renders the frosted glass material instead of a solid surface. */
  glass?: boolean;
  children?: ReactNode;
}

// Size-independent metrics read once from the spec. `radius`/`border` are
// $token refs; `borderBottom`/`fontSize`/`paddingBlock`/`paddingInline` are raw
// CSS lengths (em/px), so they pass straight through.
const DIMS = dimensionsFor(kbdSpec);

// Base paint from the spec (text-muted label, surface-sunken fill, border
// hairline); strip the leading `$` exactly as the shared resolvers do.
const bare = (v?: string): string | undefined => (v?.startsWith('$') ? v.slice(1) : v);
const PAINT = (kbdSpec.paint ?? {}) as { background?: string; text?: string; border?: string };

/**
 * A resolved measurement value. A token name gets wrapped in its custom
 * property; a raw length — anything starting with a digit or dot (`0.8em`,
 * `2px`) — passes straight through so it never becomes `var(--glacier-0.8em)`.
 */
function metric(value: string | undefined, fallback: string): string {
  const v = value ?? fallback;
  return /^[.\d]/.test(v) ? v : t(v);
}

export function Kbd({ skeleton = false, glass = false, children, ...rest }: KbdProps) {
  if (skeleton) {
    // Matches the web Kbd: a 2.25rem x 1.375rem block with the key-cap radius.
    return (
      <Skeleton
        width="2.25rem"
        height="1.375rem"
        radius={metric(DIMS.radius, 'radius-sm')}
        {...rest}
      />
    );
  }

  const fontSize = metric(DIMS.fontSize, '0.8em');
  // The frosted material (glass-regular fill, glass-border hairline, plain
  // text) mirrors the web `.glass` rule; the backdrop blur/saturate and inset
  // highlight have no RN runtime, so only the resting tint remains.
  const backgroundColor = glass ? t('glass-regular') : t(bare(PAINT.background) ?? 'surface-sunken');
  const borderColor = glass ? t('glass-border') : t(bare(PAINT.border) ?? 'border');
  const textColor = glass ? t('text') : t(bare(PAINT.text) ?? 'text-muted');

  return (
    <View
      accessibilityRole="text"
      style={{
        // display: inline-block — shrink to content, never stretch the row.
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: metric(DIMS.paddingBlock, '0.25em'),
        paddingHorizontal: metric(DIMS.paddingInline, '0.5em'),
        backgroundColor,
        borderColor,
        borderStyle: 'solid',
        borderWidth: metric(DIMS.border, 'hairline'),
        // The raised bottom edge — the key-cap tell.
        borderBottomWidth: metric(DIMS.borderBottom, '2px'),
        borderRadius: metric(DIMS.radius, 'radius-sm'),
      }}
      {...rest}
    >
      <Text
        style={{
          color: textColor,
          fontSize,
          // line-height:1 — the glyph box equals the font size (web `.kbd`).
          lineHeight: fontSize as never,
          fontFamily: t('font-mono'),
        }}
      >
        {children}
      </Text>
    </View>
  );
}
