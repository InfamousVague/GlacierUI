import { type ReactNode } from 'react';
import { View, ScrollView, type ViewProps } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { carouselSpec, iconButtonSpec } from '@glacier/spec';
import { t } from './tokens.ts';
import { dimensionsFor, paintFor } from './resolve.ts';
import { IconButton } from './IconButton.tsx';

// Size-independent box metrics (gap, radius, control shadow) read once from the
// spec so they cannot drift from the web kit.
const BOX = dimensionsFor(carouselSpec);
// The prev/next controls are Soft IconButtons; react-native-svg does not inherit
// `currentColor` on device, so the chevron stroke is the resolved Soft-variant
// text color (accent-text) rather than a currentColor glyph.
const CHEVRON_COLOR = t(paintFor(iconButtonSpec, 'variants', 'soft').text ?? 'accent-text');
const CONTROL_SHADOW = t(BOX.controlShadow ?? 'shadow-3');

export interface CarouselProps extends Omit<ViewProps, 'children'> {
  /** The card children laid out in a horizontal snap-scroll strip. */
  children?: ReactNode;
  /** Shows prev/next controls that appear when the strip overflows. */
  showControls?: boolean;
  /** Space between cards; any CSS length or a `var(--glacier-space-*)`. */
  gap?: string;
  /** Accessible label for the scrollable region. */
  'aria-label'?: string;
  /** Web-only escape hatch; accepted for parity and ignored on native. */
  className?: string;
}

/**
 * The chevron glyph inside a prev/next control, drawn with react-native-svg so it
 * matches the DOM kit's inline <svg> on web and renders on device. Both paths
 * mirror the web glyphs; RTL mirroring (`[dir='rtl'] scaleX(-1)`) is a DOM-only
 * concern and is not reproduced here.
 */
function Chevron({ direction, color }: { direction: 'left' | 'right'; color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden={true}>
      <Path
        d={direction === 'left' ? 'M10 3.5 5.5 8l4.5 4.5' : 'M6 3.5 10.5 8 6 12.5'}
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * The Glacier Carousel, rendered with React Native primitives. Geometry (gap,
 * padding, control shadow) is read from the carousel spec through the shared
 * resolvers, so it stays visually identical to @glacier/react's Carousel and
 * cannot drift from it. The scrollable region is a real horizontal <ScrollView>
 * hosting arbitrary card children; each child keeps its intrinsic width and the
 * gap sits on the content container. The optional prev/next controls are Soft
 * IconButtons overlaid at the inline edges via absolutely-positioned slots that
 * let touches fall through to the strip behind them.
 *
 * Resting visuals only, and several web behaviors are device follow-ups the type
 * shim cannot express cleanly:
 * - CSS scroll-snap per-card stops, the vertical-wheel→horizontal-scroll mapping,
 *   and the `scroll-behavior: smooth` paging are DOM/pointer concerns; native
 *   drag-scrolls the ScrollView directly.
 * - The web measures overflow (ResizeObserver) to hide the controls when the
 *   strip fits and to disable each control at its end. Without imperative
 *   ScrollView measurement/`scrollTo`, this binding paints the resting overflowing
 *   state: when `showControls` is set both controls are shown, with the prev
 *   control disabled at the start edge and the next control enabled.
 * - `className` and the DOM focus-ring are web-only and accepted-but-noop; the
 *   "Previous"/"Next" labels use the English fallback (no locale runtime), the
 *   same fallback the native Pagination/Steps bindings use.
 */
export function Carousel({
  children,
  showControls = false,
  gap = t(BOX.gap ?? 'space-4'),
  className: _className,
  'aria-label': ariaLabel,
  style,
  ...rest
}: CarouselProps) {
  return (
    <View {...rest} style={[{ position: 'relative', minWidth: 0 }, style as never]}>
      {showControls && (
        // Prev slot: full-height, inline-start edge, vertically centering the
        // control; box-none lets the strip stay scrollable behind the slot while
        // the button itself receives taps.
        <View
          pointerEvents="box-none"
          style={{ position: 'absolute', top: 0, bottom: 0, left: 0, zIndex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <View style={{ boxShadow: CONTROL_SHADOW }}>
            <IconButton variant="soft" aria-label="Previous" disabled>
              <Chevron direction="left" color={CHEVRON_COLOR} />
            </IconButton>
          </View>
        </View>
      )}
      <ScrollView
        horizontal
        accessibilityRole="group"
        aria-label={ariaLabel}
        showsHorizontalScrollIndicator={false}
        // Pad so cards clear the overlaid controls without clipping shadows, then
        // pull the frame back by the same amount (web `.scroller` padding/margin).
        style={{ margin: `calc(-1 * ${t('space-1')})` as never }}
        contentContainerStyle={{ flexDirection: 'row', columnGap: gap, padding: t('space-1') }}
      >
        {children}
      </ScrollView>
      {showControls && (
        // Next slot: inline-end edge, enabled at rest (resting scroll is the start).
        <View
          pointerEvents="box-none"
          style={{ position: 'absolute', top: 0, bottom: 0, right: 0, zIndex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <View style={{ boxShadow: CONTROL_SHADOW }}>
            <IconButton variant="soft" aria-label="Next">
              <Chevron direction="right" color={CHEVRON_COLOR} />
            </IconButton>
          </View>
        </View>
      )}
    </View>
  );
}
