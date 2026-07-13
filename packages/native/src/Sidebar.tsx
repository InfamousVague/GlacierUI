// Sidebar — the @glacier/native binding of the web structure. A vertical nav
// column (optional pinned header, a scrollable body of SidebarSection groups,
// optional pinned footer) composed from View/Text/Pressable/ScrollView, painted
// and sized from `sidebarSpec` through the shared resolvers so it cannot drift
// from Sidebar.module.css.

import { type ReactNode } from 'react';
import { View, Text, Pressable, ScrollView, type ViewProps, type PressableProps } from 'react-native';
import { sidebarSpec, sidebarSprings } from '@glacier/spec';
import { t } from './tokens.ts';
import { paintFor, dimensionsFor, type NativeStyle } from './resolve.ts';

// Size-independent geometry read once from the spec (regionPadding, bodyGap,
// itemGap, itemPaddingBlock/Inline, itemRadius, border), and the active pill's
// paint (accent-soft fill + accent-text label). All tokenized in the spec.
const BOX = dimensionsFor(sidebarSpec);
const ACTIVE = paintFor(sidebarSpec, 'states', 'active');

/**
 * A resolved measurement. The resolvers hand back bare token names for
 * tokenized values and raw CSS lengths for the rest; wrap a token name in its
 * custom property and let a raw length — anything starting with a digit or dot —
 * pass straight through so it never becomes `var(--glacier-1.125rem)`.
 */
function metric(value: string | undefined, fallback: string): string {
  const v = value ?? fallback;
  return /^[.\d]/.test(v) ? v : t(v);
}

/** Spring presets for the active pill, derived from the spec so the union cannot drift. */
export type SidebarSpring = (typeof sidebarSprings)[number];

export interface SidebarProps extends Omit<ViewProps, 'children' | 'style'> {
  /** Pinned region at the top, for a brand or a search field. */
  header?: ReactNode;
  /** Pinned region at the bottom, for a profile or settings link. */
  footer?: ReactNode;
  /** Spring preset for the active pill. Accepted for parity; no motion runtime on this binding. */
  spring?: SidebarSpring;
  children?: ReactNode;
  /** Escape hatch merged last onto the root View (native style object). */
  style?: NativeStyle;
  /** Web-only class hook. Accepted for parity and ignored on native. */
  className?: string;
}

export interface SidebarSectionProps extends Omit<ViewProps, 'children' | 'style'> {
  /** Optional uppercase group heading. */
  title?: ReactNode;
  children?: ReactNode;
  /** Escape hatch merged last onto the section View. */
  style?: NativeStyle;
  /** Web-only class hook. Accepted for parity and ignored on native. */
  className?: string;
}

export interface SidebarItemProps extends Omit<PressableProps, 'children' | 'style'> {
  /**
   * Web-only: the rendered element ('a' for links). Accepted for parity; on
   * native the row is always a Pressable, and 'a'/href only flip the a11y role.
   */
  as?: unknown;
  /** Web-only anchor href. Flips the a11y role to link; no navigation on native. */
  href?: string;
  /** Web-only anchor target. Accepted for parity; no effect on native. */
  target?: string;
  /** Web-only anchor rel. Accepted for parity; no effect on native. */
  rel?: string;
  /** Leading glyph. A currentColor SVG picks up the row's label color on react-native-web. */
  icon?: ReactNode;
  /** Highlights the item as the current location. */
  active?: boolean;
  /** Trailing content such as a CounterBadge. */
  trailing?: ReactNode;
  /** Halves opacity and blocks the press. */
  disabled?: boolean;
  children?: ReactNode;
  /** Escape hatch merged last onto the item Pressable. */
  style?: NativeStyle;
  /** Web-only class hook. Accepted for parity and ignored on native. */
  className?: string;
}

/**
 * The Glacier Sidebar, rendered with React Native primitives. An outer column
 * holds an optional header region (bottom hairline), a flexible <ScrollView>
 * body that stacks its SidebarSection groups with the spec's `bodyGap`, and an
 * optional footer region (top hairline, pinned to the bottom). Region padding
 * and the hairline come from the sidebar spec so it stays visually identical to
 * @glacier/react's Sidebar.
 *
 * Web-only, accepted-but-noop on this binding (reported in the wave notes):
 *   - spring / the sliding pill — the web pill is one shared framer-motion layout
 *     element that slides between items on the chosen spring. There is no motion
 *     runtime here, so each active item paints its own RESTING accent-soft pill
 *     and `spring` has no animated effect (kept for a 1:1 contract).
 *   - hover wash + focus ring — resting visuals only; the item hover background
 *     and the :focus-visible accent ring are not run.
 *   - themed scrollbar — the body's thin themed scrollbar becomes the platform
 *     scroll indicator (RN exposes only show/hide, not its tint/width).
 *   - font-family cascade / className — the container's `font-sans` does not
 *     cascade to RN <Text> (content brings its own), and `className` is ignored.
 * The Sidebar is a plain container: give it a nav landmark and an aria-label at
 * the call site, exactly as on the web.
 */
export function Sidebar({ header, footer, spring: _spring, className: _className, style, children, ...rest }: SidebarProps) {
  const regionPadding = metric(BOX.regionPadding, 'space-4');
  const bodyGap = metric(BOX.bodyGap, 'space-5');
  const hairline = t(BOX.border ?? 'hairline');
  const borderColor = t('border-subtle');

  return (
    <View
      {...rest}
      style={[
        { flexDirection: 'column', alignItems: 'flex-start', width: '100%', height: '100%', minHeight: 0 },
        style as never,
      ]}
    >
      {header != null && header !== false && (
        <View
          style={{
            flexGrow: 0,
            flexShrink: 0,
            width: '100%',
            padding: regionPadding,
            borderBottomWidth: hairline,
            borderBottomColor: borderColor,
            borderStyle: 'solid',
          }}
        >
          {header}
        </View>
      )}
      <ScrollView
        style={{ flex: 1, width: '100%', minHeight: 0 }}
        contentContainerStyle={{
          flexDirection: 'column',
          alignItems: 'flex-start',
          rowGap: bodyGap,
          padding: regionPadding,
        }}
      >
        {children}
      </ScrollView>
      {footer != null && footer !== false && (
        <View
          style={{
            flexGrow: 0,
            flexShrink: 0,
            width: '100%',
            padding: regionPadding,
            marginTop: 'auto',
            borderTopWidth: hairline,
            borderTopColor: borderColor,
            borderStyle: 'solid',
          }}
        >
          {footer}
        </View>
      )}
    </View>
  );
}

/**
 * A titled group of SidebarItems. The optional heading is the web's uppercase,
 * letter-spaced, semibold `text-subtle` caption; the items stack in a tight
 * column (the web's 0.125rem gap, a raw length declared inline in the CSS).
 */
export function SidebarSection({ title, className: _className, style, children, ...rest }: SidebarSectionProps) {
  return (
    <View {...rest} style={[{ width: '100%' }, style as never]}>
      {title != null && title !== false && (
        <Text
          style={{
            paddingHorizontal: t('space-3'),
            marginBottom: t('space-2'),
            fontSize: t('font-size-xs'),
            fontWeight: t('font-weight-semibold') as never,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: t('text-subtle'),
            fontFamily: t('font-sans'),
          }}
        >
          {title}
        </Text>
      )}
      <View style={{ flexDirection: 'column', rowGap: '0.125rem' }}>{children}</View>
    </View>
  );
}

/**
 * A navigation row: an optional leading icon, an ellipsized label, and an
 * optional trailing slot. The active row shows the resting accent-soft pill
 * (an absolute fill behind the content) and accent-text label; a disabled row
 * dims to half opacity and cannot be pressed. Tapping fires `onPress`. Label
 * and icon color live on the <Text>/icon wrapper (RN does not inherit color),
 * and geometry (gap, padding, radius) is read from the sidebar spec.
 */
export function SidebarItem({
  as: _as,
  href,
  target: _target,
  rel: _rel,
  icon,
  active = false,
  trailing,
  disabled = false,
  className: _className,
  style,
  children,
  ...rest
}: SidebarItemProps) {
  const itemGap = metric(BOX.itemGap, 'space-2');
  const padBlock = metric(BOX.itemPaddingBlock, 'space-2');
  const padInline = metric(BOX.itemPaddingInline, 'space-3');
  const radius = metric(BOX.itemRadius, 'radius-md');

  // Resting label/icon color washes to the accent-text role when active; the
  // pill fill is the active accent-soft background.
  const labelColor = active ? t(ACTIVE.text ?? 'accent-text') : t('text-muted');
  const pillColor = t(ACTIVE.background ?? 'accent-soft');
  const isLink = href != null || _as === 'a';

  return (
    <Pressable
      accessibilityRole={isLink ? 'link' : 'button'}
      accessibilityState={{ selected: active, disabled }}
      disabled={disabled}
      {...rest}
      style={[
        {
          position: 'relative',
          flexDirection: 'row',
          alignItems: 'center',
          columnGap: itemGap,
          width: '100%',
          paddingVertical: padBlock,
          paddingHorizontal: padInline,
          borderRadius: radius,
          backgroundColor: 'transparent',
          opacity: disabled ? 0.5 : 1,
        },
        style as never,
      ]}
    >
      {active && (
        // The active pill: an absolute fill behind the row content (web z-index 0).
        <View
          aria-hidden={true}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            zIndex: 0,
            backgroundColor: pillColor,
            borderRadius: radius,
          }}
        />
      )}
      {icon != null && (
        <View
          aria-hidden={true}
          style={{
            position: 'relative',
            zIndex: 1,
            flexShrink: 0,
            width: '1.125rem',
            height: '1.125rem',
            alignItems: 'center',
            justifyContent: 'center',
            // A currentColor SVG picks up this color on react-native-web, matching
            // the web icon inheriting the row's text color.
            color: labelColor,
          }}
        >
          {icon}
        </View>
      )}
      <Text
        numberOfLines={1}
        style={{
          position: 'relative',
          zIndex: 1,
          flex: 1,
          minWidth: 0,
          color: labelColor,
          fontSize: t('font-size-sm'),
          lineHeight: '1.2em',
          fontFamily: t('font-sans'),
          // Active rows use font-weight-medium; resting rows inherit the regular weight.
          fontWeight: (active ? t('font-weight-medium') : t('font-weight-regular')) as never,
          textAlign: 'left',
        }}
      >
        {children}
      </Text>
      {trailing != null && (
        <View style={{ position: 'relative', zIndex: 1, flexShrink: 0, flexDirection: 'row', alignItems: 'center' }}>
          {trailing}
        </View>
      )}
    </Pressable>
  );
}
