import { type ReactNode } from 'react';
import { ScrollView, View, type ViewProps } from 'react-native';
import { scrollAreaOrientations } from '@glacier/spec';

/**
 * ScrollArea — the @glacier/native binding of the web molecule.
 *
 * KIND: scroll. The scrollable region is a real <ScrollView> (vertical by
 * default, `horizontal` when the orientation flips), so wheel / drag / touch
 * scrolling all work exactly as the web viewport does. The outer <View> is the
 * web root wrapper: caller `style` and `...rest` (a11y / testID) land on it,
 * matching where the DOM kit spreads them.
 *
 * The scroll axis is capped with `maxHeight` (a max-height when vertical, a
 * max-width when horizontal) on the ScrollView, and a `max: 100%` baseline keeps
 * the viewport from outgrowing a host that sizes it instead — the same split the
 * web makes between the root and its viewport. The thin themed scrollbar becomes
 * the platform scroll indicator, toggled off by `hideScrollbar`.
 *
 * The orientation union is derived from the spec's `scrollAreaOrientations`, so
 * it cannot drift from @glacier/react's ScrollArea.
 *
 * Web-only, accepted-but-noop on this binding (reported in the wave notes):
 *   - edge fade masks — the transparent-to-opaque CSS `mask-image` ramp (and the
 *     scroll listener + ResizeObserver that toggle it) has no React Native core
 *     runtime; the real scrollable content renders without the decorative fade.
 *     The spec marks the fades purely decorative, exposing no content/state to
 *     assistive tech, so nothing is lost semantically. A masked/gradient-overlay
 *     approximation is a device follow-up.
 *   - themed scrollbar color/thickness — RN exposes only show/hide for the native
 *     indicator, not its `border-strong` tint or `space-2` width.
 *   - focus ring + keyboard scrolling — the viewport's `:focus-visible` accent
 *     ring and Arrow/Page/Home/End scrolling are DOM/keyboard concerns; taps and
 *     drags scroll here.
 *   - text color / font-family — the root's `text` + `font-sans` cascade is
 *     dropped from the container, since RN <Text> does not inherit from a parent
 *     <View> (same as Surface / Card); content brings its own <Text>.
 *   - className — DOM escape hatch, accepted for parity and ignored.
 */

/** Which axis the content overflows and scrolls along. Derived from the spec. */
export type ScrollAreaOrientation = (typeof scrollAreaOrientations)[number];

/** A flat native style object; the escape hatch merged last onto the root View. */
type NativeStyle = Record<string, string | number>;

export interface ScrollAreaProps extends Omit<ViewProps, 'children' | 'style'> {
  /**
   * Caps the viewport along the scroll axis: a CSS length or number of pixels.
   * For a vertical area this is a max-height; for a horizontal one, a max-width.
   */
  maxHeight?: number | string;
  /** Scroll axis. Vertical (the default) scrolls up/down; horizontal scrolls left/right. */
  orientation?: ScrollAreaOrientation;
  /** Hides the scrollbar entirely; wheel, drag, keyboard, and touch scrolling all still work. */
  hideScrollbar?: boolean;
  /** The overflowing content. */
  children?: ReactNode;
  /** Escape hatch merged last onto the root View (native style object). */
  style?: NativeStyle;
  /** Web-only class hook. Accepted for parity and ignored on native. */
  className?: string;
}

/**
 * The Glacier ScrollArea, rendered with React Native primitives. A plain root
 * <View> wraps a <ScrollView> that holds the overflowing content and does the
 * actual scrolling. `orientation` picks the scroll axis, `maxHeight` caps that
 * axis, and `hideScrollbar` drops the platform scroll indicator while every
 * scroll input keeps working — mirroring @glacier/react's ScrollArea.
 */
export function ScrollArea({
  maxHeight,
  orientation = 'vertical',
  hideScrollbar = false,
  className: _className,
  style,
  children,
  ...rest
}: ScrollAreaProps) {
  const horizontal = orientation === 'horizontal';

  // The cap belongs on the viewport (the overflow container): a max:100% baseline
  // so it never outgrows a host that sizes the root, then the scroll-axis cap
  // overrides — max-width when horizontal, max-height when vertical.
  const cap: NativeStyle = { maxHeight: '100%', maxWidth: '100%' };
  if (maxHeight !== undefined) {
    if (horizontal) cap.maxWidth = maxHeight;
    else cap.maxHeight = maxHeight;
  }

  // The native scroll indicator stands in for the thin themed scrollbar; only the
  // active axis can show one, and hideScrollbar drops it entirely.
  const showBar = !hideScrollbar;

  return (
    // rest (a11y / testID) and the caller style land on the root wrapper, exactly
    // where the web spreads them; style goes after rest so it augments, never
    // clobbered by, the spread.
    <View {...rest} style={[{ minHeight: 0, minWidth: 0 }, style as never]}>
      <ScrollView
        accessibilityRole="group"
        horizontal={horizontal}
        showsVerticalScrollIndicator={!horizontal && showBar}
        showsHorizontalScrollIndicator={horizontal && showBar}
        style={cap}
      >
        {children}
      </ScrollView>
    </View>
  );
}
