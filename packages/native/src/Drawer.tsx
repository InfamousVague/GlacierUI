import { type ReactNode } from 'react';
import { View, Pressable, ScrollView, Modal, type ViewProps, type StyleProp } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { drawerSides, drawerSizes, drawerSpec } from '@glacier/spec';
import { paintFor } from '@glacier/commons';
import { t } from './tokens.ts';
import { dimensionsFor, sizeFor } from './resolve.ts';
import { Heading } from './Heading.tsx';
import { Text } from './Text.tsx';
import { IconButton } from './IconButton.tsx';

// Derived from the spec so the unions cannot drift from the web kit.
export type DrawerSide = (typeof drawerSides)[number];
export type DrawerSize = (typeof drawerSizes)[number];

export interface DrawerProps extends Omit<ViewProps, 'children' | 'style'> {
  /** Whether the drawer is mounted and shown. Fully controlled, like the web. */
  open: boolean;
  /** Called by the close action, backdrop press, and Android back (when dismissible). */
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  /** Viewport edge the sheet is pinned to. */
  side?: DrawerSide;
  /** Maximum width step for left and right sheets. */
  size?: DrawerSize;
  /** Detaches the sheet into a floating card with a gutter on every edge and all corners rounded. */
  floating?: boolean;
  footer?: ReactNode;
  /** Enables the backdrop press, Android back, and the close action. */
  dismissible?: boolean;
  children?: ReactNode;
  /** Accepted for parity with @glacier/react; the DOM className has no native equivalent (noop). */
  className?: string;
  /** Extra style merged onto the panel surface (applied after the component's own style). */
  style?: StyleProp;
}

// Size-independent box metrics read once from the spec (radius, border, gutter,
// the header/body/footer paddings and the footer gap).
const BOX = dimensionsFor(drawerSpec);

// Base panel paint from the spec's `paint` role map ($glass-thick / $glass-border),
// stripped of the leading `$` exactly as the shared resolvers do so it cannot drift.
const bare = (v?: string): string | undefined => (v?.startsWith('$') ? v.slice(1) : v);
const BASE = (drawerSpec.paint ?? {}) as { background?: string; text?: string; border?: string };
const PANEL_BG = t(bare(BASE.background) ?? 'glass-thick');
const PANEL_BORDER = t(bare(BASE.border) ?? 'glass-border');
// The blurred backdrop scrim from the `open` state's token map (overlay).
const OPEN = paintFor(drawerSpec, 'states', 'open');
const SCRIM = t(OPEN.overlay ?? 'overlay');

// A resolved measurement: bare token names get wrapped in the custom property; a
// raw CSS length (the size steps' `22rem`/`28rem`/`36rem` diameters) passes
// straight through so it never becomes `var(--glacier-22rem)`.
const len = (value: string): string => (/^[.\d]/.test(value) ? value : t(value));

// The close glyph, a currentColor SVG that inherits the IconButton's text color
// on react-native-web (matching the web `CloseIcon`).
const CloseIcon = (
  <Svg width={14} height={14} viewBox="0 0 14 14" fill="none" aria-hidden={true}>
    <Path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" />
  </Svg>
);

/**
 * The Glacier Drawer, rendered with React Native primitives. A modal sheet that
 * pins to a viewport edge: a full-screen <Modal> hosts a blurred-scrim backdrop
 * (a Pressable that closes on press) plus the panel, whose paint (glass-thick
 * surface, glass-border hairline, `overlay` scrim) and geometry (radius-2xl, the
 * per-size widths, the header/body/footer paddings) are read from the drawer spec
 * through the shared resolvers, so it stays identical to @glacier/react's Drawer
 * and cannot drift from it.
 *
 * Web-parity notes:
 * - `side` is physical: left/right are full-height edge panels (overlay stretches
 *   them vertically); bottom is a full-width sheet pinned to the lower edge.
 * - `floating` insets the sheet with a gutter (space-3) on every edge via overlay
 *   padding and rounds all four corners, matching the web `.floating` rules. Unset,
 *   it follows a root `data-layout='floating'` attribute on react-native-web (and
 *   is simply flush on device, where there is no document).
 * - Fully controlled: `open` is required with no uncontrolled fallback, exactly as
 *   the web is, so there is no useControlled seam here — the render is driven by
 *   `open` and dismissal calls `onClose`.
 *
 * Resting visuals only. The web's backdrop fade + edge spring-in (and the reduced
 * motion path) are a device follow-up — the resting OPEN state is pixel-matched
 * and the Modal appears without a mismatched half-animation (`animationType="none"`).
 * The overlay/panel `backdrop-filter` blur and the panel's inset-highlight + shadow-5
 * have no React Native equivalent and are dropped. Focus trapping, body-scroll lock,
 * opener focus restore, and the aria-labelledby/aria-describedby id wiring are
 * web-only DOM behaviors; on device the Modal provides its own focus containment.
 * `className` is a DOM attribute with no native equivalent and is accepted-but-noop.
 */
export function Drawer({
  open,
  onClose,
  title,
  description,
  side = 'right',
  size = 'md',
  floating,
  footer,
  dismissible = true,
  children,
  className: _className,
  style,
  ...rest
}: DrawerProps) {
  if (!open) return null;

  // Read at open time, mirroring the web: an explicit prop wins, otherwise follow
  // the host layout mode (react-native-web only; on device there is no document).
  const isFloating =
    floating ??
    (typeof document !== 'undefined' &&
      document.documentElement.getAttribute('data-layout') === 'floating');

  const isSide = side === 'left' || side === 'right';
  const diameter = len(sizeFor(drawerSpec, size).diameter ?? '28rem');
  const radius = t(BOX.radius ?? 'radius-2xl');

  // Overlay: full-screen flex that pins the panel to its edge. left/right stretch
  // the panel to full height (row direction); bottom pins it to the lower edge and
  // stretches it full width (column direction). Floating adds the gutter as padding.
  const overlayStyle = {
    flex: 1,
    flexDirection: isSide ? ('row' as const) : ('column' as const),
    justifyContent: side === 'left' ? ('flex-start' as const) : ('flex-end' as const),
    alignItems: 'stretch' as const,
    ...(isFloating ? { padding: t(BOX.gutter ?? 'space-3') } : null),
  };

  // Panel box: base paint + the per-side border/radius, with floating overriding to
  // a full hairline and all-corner radius. The transparent-edge removals mirror the
  // web `.panel.<side>` rules (the sheet's slide-in edge loses its border/rounding).
  const panelStyle: Record<string, unknown> = {
    flexDirection: 'column',
    minWidth: 0,
    maxWidth: '100%',
    borderStyle: 'solid',
    borderWidth: t(BOX.border ?? 'hairline'),
    borderColor: PANEL_BORDER,
    backgroundColor: PANEL_BG,
    ...(isSide
      ? { width: `min(${diameter}, calc(100% - ${t('space-8')}))`, height: '100%', maxHeight: '100%' }
      : { maxHeight: `calc(100% - ${t('space-12')})` }),
  };
  if (isFloating) {
    panelStyle.borderRadius = radius;
  } else if (side === 'left') {
    panelStyle.borderTopRightRadius = radius;
    panelStyle.borderBottomRightRadius = radius;
    panelStyle.borderLeftWidth = 0;
  } else if (side === 'right') {
    panelStyle.borderTopLeftRadius = radius;
    panelStyle.borderBottomLeftRadius = radius;
    panelStyle.borderRightWidth = 0;
  } else {
    panelStyle.borderTopLeftRadius = radius;
    panelStyle.borderTopRightRadius = radius;
    panelStyle.borderLeftWidth = 0;
    panelStyle.borderRightWidth = 0;
    panelStyle.borderBottomWidth = 0;
  }

  const showHeader = title != null || description != null || dismissible;

  return (
    <Modal visible transparent animationType="none" onRequestClose={dismissible ? onClose : undefined}>
      <View style={overlayStyle}>
        {/* Backdrop: a full-bleed scrim behind the panel; a press dismisses when
            allowed. Absolutely positioned so it ignores the overlay's flex layout
            and floating gutter, matching the web overlay's click-to-close area. */}
        <Pressable
          aria-hidden={true}
          onPress={dismissible ? onClose : undefined}
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: SCRIM }}
        />
        <View
          {...rest}
          accessibilityRole="dialog"
          // `style` is applied LAST as an array so a caller's layout style augments
          // the panel without wiping its paint, and `...rest` can never clobber it.
          style={[panelStyle, style as never]}
        >
          {showHeader && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: t('space-4'),
                paddingTop: t(BOX.headerPadding ?? 'space-6'),
                paddingHorizontal: t(BOX.headerPadding ?? 'space-6'),
                paddingBottom: t('space-4'),
              }}
            >
              <View style={{ flexDirection: 'column', minWidth: 0, gap: t('space-2') }}>
                {title != null && (
                  <Heading level={2} visualLevel={3}>
                    {title}
                  </Heading>
                )}
                {description != null && (
                  <Text tone="muted" size="sm">
                    {description}
                  </Text>
                )}
              </View>
              {dismissible && (
                <IconButton aria-label="Close" size="sm" onPress={onClose}>
                  {CloseIcon}
                </IconButton>
              )}
            </View>
          )}
          <ScrollView
            style={{ flex: 1, minHeight: 0 }}
            contentContainerStyle={{
              paddingTop: t('space-2'),
              paddingHorizontal: t(BOX.bodyPadding ?? 'space-6'),
              paddingBottom: t(BOX.bodyPadding ?? 'space-6'),
            }}
          >
            {children}
          </ScrollView>
          {footer != null && (
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'flex-end',
                gap: t(BOX.footerGap ?? 'space-3'),
                paddingTop: t('space-4'),
                paddingHorizontal: t(BOX.footerPadding ?? 'space-6'),
                paddingBottom: t(BOX.footerPadding ?? 'space-6'),
                borderTopWidth: t('hairline'),
                borderTopColor: t('border'),
                borderStyle: 'solid',
              }}
            >
              {footer}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
