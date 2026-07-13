import { type ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';
import { deviceFrameSizes, deviceFrameSpec } from '@glacier/spec';
import { t } from './tokens.ts';
import { sizeFor, dimensionsFor } from './resolve.ts';

// Derived from the spec so the size union cannot drift from the web kit.
export type DeviceFrameSize = (typeof deviceFrameSizes)[number];

export interface DeviceFrameProps extends Omit<ViewProps, 'style' | 'children'> {
  /** Preset screen width. Ignored when `width` is set. */
  size?: DeviceFrameSize;
  /** Explicit screen width, overriding `size`, e.g. `320` or `'20rem'`. */
  width?: string | number;
  /**
   * Screen aspect ratio as width / height. Defaults to a modern phone.
   * A number like `9 / 19.5`, or a CSS ratio string like `'9 / 19.5'`.
   */
  aspect?: string | number;
  /** Hides the decorative notch, for a full-bleed slab. */
  hideNotch?: boolean;
  /** Accessible label for the frame region. */
  'aria-label'?: string;
  /** The preview or iframe that fills the screen. */
  children?: ReactNode;
}

// Size-independent box metrics read once from the spec. Only `bezel` is a real
// token here; `radius`/`screenRadius` are declared in the spec as prose
// ("14% of frame width", "…minus the bezel") because they are computed from the
// frame width, not a fixed token — so the two constants below mirror the CSS
// (`calc(width * 0.14)` and `radius - bezel`) rather than the resolver.
const BOX = dimensionsFor(deviceFrameSpec);
const BEZEL = t(BOX.bezel ?? 'space-2');
/** Corner curve as a fraction of the frame width, matching DeviceFrame.module.css. */
const RADIUS_RATIO = 0.14;

function toLength(value: string | number): string {
  return typeof value === 'number' ? `${value}px` : value;
}

/** RN's `aspectRatio` is a numeric width/height; parse the CSS ratio to it. */
function toAspectRatio(value: string | number): number {
  if (typeof value === 'number') return value;
  const [w, h] = value.split('/');
  const width = parseFloat(w ?? value);
  const height = h !== undefined ? parseFloat(h) : NaN;
  return Number.isFinite(height) && height !== 0 ? width / height : parseFloat(value);
}

/**
 * The Glacier DeviceFrame, rendered with React Native primitives. A decorative
 * phone bezel with a fixed-aspect, inset screen that hosts arbitrary children.
 * Geometry is read from the device-frame spec through the shared resolvers (the
 * preset width comes from `sizeFor(...).diameter`, the bezel from the spec's
 * dimensions) so it cannot drift from @glacier/react's DeviceFrame; the corner
 * radii mirror the CSS `calc()` chain the spec documents as prose. Paint is the
 * literal black shell and the sunken screen, matching the web CSS (the spec's
 * `paint` is intentionally empty). The bezel, notch, and side buttons are
 * decorative and hidden from assistive tech; only the screen contents carry
 * meaning.
 *
 * Web-only fidelity (accepted-but-noop on a real device build): the frame's
 * `box-shadow` (inset accent ring + elevation), the `content > :only-child`
 * fill-the-screen rule (no RN descendant selector), `overflow: auto` scrolling
 * (needs a ScrollView), and `corner-shape: squircle`.
 */
export function DeviceFrame({
  size = 'md',
  width,
  aspect = '9 / 19.5',
  hideNotch = false,
  children,
  ...rest
}: DeviceFrameProps) {
  const dims = sizeFor(deviceFrameSpec, size);
  // `diameter` is a raw length (e.g. `17rem`), not a token — used directly.
  const screenWidth = width !== undefined ? toLength(width) : (dims.diameter ?? '17rem');
  const radius = `calc(${screenWidth} * ${RADIUS_RATIO})`;
  // Concentric inner radii: the inner rim insets by half a bezel, the screen by
  // a full bezel (see the CSS `calc(radius - bezel …)` rules).
  const rimRadius = `calc(${radius} - ${BEZEL} / 2)`;
  const screenRadius = `calc(${radius} - ${BEZEL})`;
  const rimInset = `calc(${BEZEL} / 2)`;
  // Buttons protrude two hairlines beyond the shell edge.
  const buttonOffset = `calc(-2 * ${t('hairline')})`;

  return (
    <View
      accessibilityRole="group"
      style={{
        position: 'relative',
        alignSelf: 'flex-start', // display: inline-block — shrink to content.
        width: screenWidth,
        padding: BEZEL,
        borderRadius: radius,
        backgroundColor: '#000',
        // Inset accent ring + elevation; resolved by react-native-web, noop on a
        // device build.
        boxShadow: `inset 0 0 0 ${t('hairline')} ${t('accent-7')}, ${t('shadow-4')}`,
      }}
      {...rest}
    >
      {/* Subtle inner rim between the shell and the screen; decorative. */}
      <View
        aria-hidden={true}
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: rimInset,
          right: rimInset,
          bottom: rimInset,
          left: rimInset,
          borderRadius: rimRadius,
        }}
      />

      {/* Decorative side buttons on the shell. */}
      <View
        aria-hidden={true}
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: buttonOffset,
          top: '16%',
          width: 2,
          height: t('space-4'),
          borderTopLeftRadius: t('radius-full'),
          borderBottomLeftRadius: t('radius-full'),
          backgroundColor: t('accent-10'),
        }}
      />
      <View
        aria-hidden={true}
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: buttonOffset,
          top: '26%',
          width: 2,
          height: t('space-6'),
          borderTopLeftRadius: t('radius-full'),
          borderBottomLeftRadius: t('radius-full'),
          backgroundColor: t('accent-10'),
        }}
      />
      <View
        aria-hidden={true}
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: buttonOffset,
          top: '38%',
          width: 2,
          height: t('space-6'),
          borderTopLeftRadius: t('radius-full'),
          borderBottomLeftRadius: t('radius-full'),
          backgroundColor: t('accent-10'),
        }}
      />
      <View
        aria-hidden={true}
        pointerEvents="none"
        style={{
          position: 'absolute',
          right: buttonOffset,
          top: '28%',
          width: 2,
          height: t('space-8'),
          borderTopRightRadius: t('radius-full'),
          borderBottomRightRadius: t('radius-full'),
          backgroundColor: t('accent-10'),
        }}
      />

      {/* The fixed aspect-ratio inset region that clips and hosts the children. */}
      <View
        style={{
          position: 'relative',
          aspectRatio: toAspectRatio(aspect),
          overflow: 'hidden',
          borderRadius: screenRadius,
          backgroundColor: t('surface-sunken'),
        }}
      >
        {!hideNotch && (
          <View
            aria-hidden={true}
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              zIndex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              columnGap: t('space-2'),
              minWidth: '38%',
              height: t('space-5'),
              paddingHorizontal: t('space-3'),
              transform: [{ translateX: '-50%' }],
              borderBottomLeftRadius: t('radius-md'),
              borderBottomRightRadius: t('radius-md'),
              backgroundColor: '#000',
            }}
          >
            {/* speaker slit */}
            <View
              style={{
                width: t('space-6'),
                height: t('hairline'),
                borderRadius: t('radius-full'),
                backgroundColor: t('accent-8'),
              }}
            />
            {/* camera dot */}
            <View
              style={{
                width: t('space-2'),
                height: t('space-2'),
                borderRadius: t('radius-full'),
                backgroundColor: t('accent-10'),
              }}
            />
          </View>
        )}

        {/* The children slot, filling the screen. */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            overflow: 'hidden',
          }}
        >
          {children}
        </View>
      </View>
    </View>
  );
}
