// FloatingPanel — the @glacier/native binding of @glacier/react's FloatingPanel
// organism. A non-modal floating glass panel: a header grab-bar with a title and
// close button sits above a scrollable body. Paint (glass-thick surface,
// glass-border hairline, border-subtle handle divider) and geometry (min/max
// width, max height, radius-lg, the handle/body paddings and gap) are read from
// the floating-panel spec through the shared resolvers, so it cannot drift from
// the web kit. The spec declares no variant/size/tone families (panel metrics are
// fixed), so there are no derived unions here.
//
// React Native has no document.body portal and no `position: fixed`, so the panel
// is approximated as an absolutely-positioned View placed at `defaultPosition`
// (top/left), rendered inline where it is mounted rather than portalled to the
// screen root — non-modal, so the page underneath stays interactive (no Modal,
// which would cover/trap the screen). A true body portal + viewport-fixed
// positioning + collision clamping is a device follow-up.
//
// Web-only bits, accepted as documented approximations:
// - Pointer-drag on the grab-bar to move the panel (and the grab→grabbing cursor,
//   the resize re-clamp, and viewport clamping): pointer-only, web-only. RN has no
//   PanResponder in these primitives, so the panel is static at `defaultPosition`;
//   dragging is a device follow-up. Its position is never load-bearing.
// - Escape-to-close: there is no hardware Escape on device; the close button still
//   calls onClose. Accepted-but-noop.
// - `className` (no RN className) and the aria-labelledby id wiring: accepted-but-
//   noop; the panel exposes accessibilityRole="dialog" and, when the title is a
//   string, an accessibilityLabel.
// - The panel's backdrop-filter blur, layered inset glass highlight and drop
//   shadow have no React Native equivalent and are dropped (resting paint only).
// - The open fade/scale-in motion (and its reduced-motion path): the panel renders
//   at its resting open geometry; the spring is a device follow-up.
// - The body's font-size (sm) inheritance is web-only — RN text sizing lives on
//   each Text — so body content supplies its own type.
import { type ReactNode } from 'react';
import { View, ScrollView, type ViewProps, type StyleProp } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { floatingPanelSpec } from '@glacier/spec';
import { paintFor } from '@glacier/commons';
import { t } from './tokens.ts';
import { dimensionsFor } from './resolve.ts';
import { Heading } from './Heading.tsx';
import { IconButton } from './IconButton.tsx';

/** A top-left position in pixels, matching the web contract. */
export interface Point {
  x: number;
  y: number;
}

export interface FloatingPanelProps extends Omit<ViewProps, 'children' | 'style'> {
  /** Whether the panel is shown; it unmounts when false. */
  open: boolean;
  /** Title rendered in the drag handle bar; labels the dialog. */
  title: ReactNode;
  /** Called when dismissed via the close button (Escape is web-only). */
  onClose: () => void;
  /** Initial top-left position in pixels ({ x, y }); defaults to { x: 24, y: 24 }. */
  defaultPosition?: Point;
  /** Accepted for parity with @glacier/react; the DOM className has no native equivalent (noop). */
  className?: string;
  /** Extra style merged onto the panel surface (applied after the component's own style). */
  style?: StyleProp;
  /** The panel body content. */
  children?: ReactNode;
}

// Size-independent metrics read once from the spec. minWidth/maxWidth/maxHeight
// are raw CSS lengths (resolved by react-native-web; a device build caps via a
// measured size) and pass through verbatim; radius/border/gap are token names
// wrapped by t().
const DIMS = dimensionsFor(floatingPanelSpec);
// The open-state paint carries the glass surface + border (the shadow token has
// no RN equivalent). The base `paint` map's text color is web-only inheritance —
// RN has none, and per the kit rules color lives on <Text>, so the Heading/body
// content carry their own color rather than the panel View.
const OPEN = paintFor(floatingPanelSpec, 'states', 'open');

// The close glyph, a currentColor SVG that inherits the IconButton's text color
// on react-native-web (matching the web `CloseIcon`).
const CloseIcon = (
  <Svg width={14} height={14} viewBox="0 0 14 14" fill="none" aria-hidden={true}>
    <Path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" />
  </Svg>
);

/**
 * The Glacier FloatingPanel, rendered with React Native primitives. Fully
 * controlled: `open` is required with no uncontrolled fallback, mirroring the
 * web `if (!open) return null`, so there is no useControlled seam — the render is
 * driven by `open` and dismissal calls `onClose`.
 */
export function FloatingPanel({
  open,
  title,
  onClose,
  defaultPosition = { x: 24, y: 24 },
  className: _className,
  style,
  children,
  ...rest
}: FloatingPanelProps) {
  if (!open) return null;

  const panelStyle = {
    // No portal / fixed positioning in RN: float via an absolutely-positioned
    // View at the given point. z-index 200 matches the web stacking order (a raw
    // layout value the spec does not tokenize).
    position: 'absolute' as const,
    top: defaultPosition.y,
    left: defaultPosition.x,
    zIndex: 200,
    flexDirection: 'column' as const,
    minWidth: DIMS.minWidth ?? '16rem',
    maxWidth: DIMS.maxWidth ?? 'min(28rem, calc(100vw - 2rem))',
    maxHeight: DIMS.maxHeight ?? 'calc(100vh - 2rem)',
    overflow: 'hidden' as const,
    borderWidth: t(DIMS.border ?? 'hairline'),
    borderStyle: 'solid' as const,
    borderColor: t(OPEN.border ?? 'glass-border'),
    borderRadius: t(DIMS.radius ?? 'radius-lg'),
    backgroundColor: t(OPEN.background ?? 'glass-thick'),
  };

  return (
    <View
      {...rest}
      accessibilityRole="dialog"
      accessibilityLabel={typeof title === 'string' ? title : undefined}
      // `style` last so a caller can augment the surface without clobbering its
      // paint/geometry, and `...rest` can never override the component style.
      style={[panelStyle, style as never]}
    >
      {/* Header grab-bar. The drag behavior is web-only; here it is a static
          divider row carrying the title and close control. padding-inline
          space-4/space-2 → roomier before the title, tighter around the close. */}
      <View
        style={{
          flexDirection: 'row',
          flex: 0,
          alignItems: 'center',
          gap: t(DIMS.gap ?? 'space-3'),
          paddingVertical: t('space-2'),
          paddingLeft: t('space-4'),
          paddingRight: t('space-2'),
          borderBottomWidth: t('hairline'),
          borderBottomColor: t('border-subtle'),
          borderStyle: 'solid',
        }}
      >
        <View style={{ flex: 1, minWidth: 0 }}>
          <Heading level={2} visualLevel={6} numberOfLines={1}>
            {title}
          </Heading>
        </View>
        <IconButton aria-label="Close" size="sm" onPress={onClose}>
          {CloseIcon}
        </IconButton>
      </View>
      {/* Scrollable body. The web body's font-size (sm) inheritance is web-only;
          body content supplies its own type on device. */}
      <ScrollView
        style={{ flexShrink: 1 }}
        contentContainerStyle={{ padding: t('space-4') }}
      >
        {children}
      </ScrollView>
    </View>
  );
}
