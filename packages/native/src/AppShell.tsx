/**
 * @glacier/native — AppShell.
 *
 * The React Native binding of @glacier/react's AppShell: the app frame — a
 * persistent sidebar landmark beside a main column that stacks an optional
 * header over a scrollable content region, laid out with flex. Paint (the
 * sidebar `surface` fill, the `glass-thin` header tint, the `glass-border`
 * hairlines, the floating cards' border/radius, the resizer grip) and geometry
 * (the space gaps/paddings, the floating gutter, radius-xl) are read from the
 * app-shell spec through the shared resolvers, so the resting frame stays locked
 * to @glacier/react's AppShell and cannot drift from it. The slot/prop contract
 * (sidebar, header, sidebarWidth, floating, resizable, …) is kept 1:1.
 *
 * Native renders the desktop (lg+) resting layout: the sidebar is an always-
 * visible column next to the main column, which is exactly what the web shows
 * above the lg breakpoint (where the built-in menu button is display:none). The
 * sub-lg RESPONSIVE behavior has no React Native equivalent and is a documented
 * reduction — React Native has no CSS media queries to branch the layout on
 * viewport width, and the web AppShell owns its drawer `open` state internally
 * (there is no open/onOpenChange in the public contract to drive on native):
 *   - The off-canvas drawer, its backdrop scrim, the built-in menu IconButton,
 *     the close-on-Escape / close-on-backdrop / close-on-nav-tap behavior, and
 *     the slide-in transform transition are all sub-lg only and are not rendered.
 *     The sidebar simply renders as the static desktop column.
 *   - `resizable` renders only the resting divider grip (the space-3 strip with
 *     its centered border-strong pill). The pointer-drag resize, the arrow-key /
 *     Home/End keyboard resize, the hover/focus grip highlight, and the
 *     `onSidebarWidthChange` / min/maxSidebarWidth clamp are web-only and no-op
 *     here (no pointer capture, no getBoundingClientRect on device).
 * Resting visuals only. The web's `position: sticky` sidebar/header, the header
 * and drawer `backdrop-filter` blur/saturate (rendered as their resting glass
 * tint), and the floating cards' + open drawer's box-shadows have no React
 * Native equivalent and are dropped. `sidebarWidth` and the `100vh` frame height
 * pass through as CSS lengths (react-native-web resolves them; a device build
 * swaps concrete values). The sticky sidebar + document scroll are approximated
 * by giving the sidebar and the content region their own ScrollViews so each
 * scrolls independently. `className` is a DOM attribute with no native
 * equivalent and is accepted-but-noop.
 */

import { type ReactNode } from 'react';
import { View, ScrollView, type ViewProps, type StyleProp } from 'react-native';
import { appShellSpec } from '@glacier/spec';
import { t } from './tokens.ts';
import { paintFor, dimensionsFor } from './resolve.ts';

export interface AppShellProps extends Omit<ViewProps, 'style' | 'children'> {
  /** The persistent side navigation. */
  sidebar: ReactNode;
  /** Optional top bar content, placed in the header region. */
  header?: ReactNode;
  /** Sidebar width on desktop. Defaults to 16rem. */
  sidebarWidth?: string;
  /** Accessible name for the sidebar landmark. */
  sidebarLabel?: string;
  /** Detach the desktop sidebar and header into floating, rounded cards with a gutter. */
  floating?: boolean;
  /** Render the resting resize divider. The drag/keyboard resize is web-only (no-op here). */
  resizable?: boolean;
  /** Web-only: called with the next sidebar width while resizing. Accepted-but-noop on native. */
  onSidebarWidthChange?: (width: string) => void;
  /** Web-only resize clamp, in pixels. Accepted-but-noop on native. */
  minSidebarWidth?: number;
  /** Web-only resize clamp, in pixels. Accepted-but-noop on native. */
  maxSidebarWidth?: number;
  children?: ReactNode;
  /** Extra style merged onto the outer frame (applied after the component's own style). */
  style?: StyleProp;
  /** Web-only DOM escape hatch; accepted for parity and ignored on native. */
  className?: string;
}

// Size-independent geometry read once from the spec so the frame cannot drift
// from AppShell.module.css: the header gap (space-3) and block padding (space-2),
// the floating gutter (space-4), the card radius (radius-xl), and the hairline.
const DIMS = dimensionsFor(appShellSpec);
const GAP = t(DIMS.gap ?? 'space-3');
const PAD_BLOCK = t(DIMS.padding ?? 'space-2');
// The header's inline padding is roomier than its block padding (web `.header`
// rule: `padding: space-2 space-4`) so the leading title never hugs the edge.
const PAD_INLINE = t('space-4');
const GUTTER = t(DIMS.gutter ?? 'space-4');
const RADIUS = t(DIMS.radius ?? 'radius-xl');
const BORDER = t(DIMS.border ?? 'hairline');

// Paint read from the spec states. The `floating` state carries the same tokens
// the flush sidebar uses — `surface` fill and the `glass-border` hairline — so
// the sidebar surface + every hairline (sidebar inline-end rule, header bottom
// rule, floating card borders) come from one source. The header's `glass-thin`
// tint is bound on the component token (per the sticky-state note) with no state
// exposing it as a role, so it is referenced by its bare spec token name. The
// resizer grip's resting color is the `resizer-hover` state's `grip-rest`.
const FLOATING = paintFor(appShellSpec, 'states', 'floating');
const RESIZER = paintFor(appShellSpec, 'states', 'resizer-hover');
const SIDEBAR_BG = t(FLOATING.background ?? 'surface');
const HAIRLINE = t(FLOATING.border ?? 'glass-border');
const HEADER_BG = t('glass-thin');
const GRIP_REST = t(RESIZER['grip-rest'] ?? 'border-strong');

/**
 * The Glacier AppShell, rendered with React Native primitives. See the file
 * header for the responsive/parity contract; the resting desktop frame is
 * visually matched to @glacier/react's AppShell and unable to drift from it.
 */
export function AppShell({
  sidebar,
  header,
  sidebarWidth = '16rem',
  sidebarLabel = 'Navigation',
  floating = false,
  resizable = false,
  // Web-only resize props; kept for a 1:1 contract, no-op on native.
  onSidebarWidthChange: _onSidebarWidthChange,
  minSidebarWidth: _minSidebarWidth = 200,
  maxSidebarWidth: _maxSidebarWidth = 460,
  children,
  style,
  className: _className,
  ...rest
}: AppShellProps) {
  // The sidebar column: fixed width with the `surface` fill. Flush, it carries a
  // single inline-end hairline; floating, it detaches into a rounded card inset
  // by the gutter on every edge with a full hairline border (web `.sidebar` /
  // `.shell[data-floating] .sidebar`). Its box-shadow is dropped.
  const sidebarBox = {
    width: sidebarWidth,
    backgroundColor: SIDEBAR_BG,
    ...(floating
      ? {
          margin: GUTTER,
          borderWidth: BORDER,
          borderColor: HAIRLINE,
          borderStyle: 'solid' as const,
          borderRadius: RADIUS,
          overflow: 'hidden' as const,
        }
      : {
          borderRightWidth: BORDER,
          borderRightColor: HAIRLINE,
          borderStyle: 'solid' as const,
        }),
  };

  // The header bar: a glass-thin row with the space-3 gap and the tight-block /
  // roomy-inline padding. Flush, it carries a bottom hairline; floating, it
  // becomes a rounded card sitting a gutter in from the top and trailing edges
  // with a full border (web `.header` / `.shell[data-floating] .header`). Its
  // backdrop blur + box-shadow are dropped.
  const headerBar = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    columnGap: GAP,
    paddingVertical: PAD_BLOCK,
    paddingHorizontal: PAD_INLINE,
    backgroundColor: HEADER_BG,
    ...(floating
      ? {
          marginTop: GUTTER,
          marginRight: GUTTER,
          borderWidth: BORDER,
          borderColor: HAIRLINE,
          borderStyle: 'solid' as const,
          borderRadius: RADIUS,
        }
      : {
          borderBottomWidth: BORDER,
          borderBottomColor: HAIRLINE,
          borderStyle: 'solid' as const,
        }),
  };

  return (
    <View
      {...rest}
      // `style` is applied LAST as an array so a caller's layout style augments
      // the frame without wiping it, and `...rest` can never clobber it.
      style={[
        { flex: 1, minHeight: '100vh', flexDirection: 'row', alignItems: 'stretch' },
        style as never,
      ]}
    >
      {/* The sidebar landmark. On web this is an <aside> named by sidebarLabel;
          RN has no complementary landmark, so it carries aria-label only. Its
          own ScrollView approximates the web sidebar's independent overflow. */}
      <View aria-label={sidebarLabel} style={sidebarBox}>
        <ScrollView style={{ flex: 1, minHeight: 0 }}>{sidebar}</ScrollView>
      </View>
      {resizable && (
        // Resting divider only: the space-3 hit strip with its centered grip
        // pill (4px wide, space-6 tall, radius-full, border-strong). The
        // pointer-drag + keyboard resize and the hover/focus highlight are
        // web-only and not wired here.
        <View
          aria-orientation="vertical"
          style={{ width: GAP, alignItems: 'center', justifyContent: 'center' }}
        >
          <View
            style={{
              width: 4,
              height: t('space-6'),
              borderRadius: t('radius-full'),
              backgroundColor: GRIP_REST,
            }}
          />
        </View>
      )}
      {/* The main column: the sticky header stacked over the scrollable content.
          The built-in mobile menu button is desktop-hidden on web and omitted. */}
      <View style={{ flex: 1, minWidth: 0, flexDirection: 'column' }}>
        {header != null && header !== false && (
          <View style={headerBar}>
            {/* headerContent: grows to fill the bar beside the (omitted) menu button. */}
            <View style={{ flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center' }}>
              {header}
            </View>
          </View>
        )}
        <ScrollView style={{ flex: 1, minWidth: 0 }} contentContainerStyle={{ flexGrow: 1 }}>
          {children}
        </ScrollView>
      </View>
    </View>
  );
}
