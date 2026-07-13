import { Fragment, type ReactNode } from 'react';
import { View, Text, type ViewProps } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { stepsSpec, stepsSizes, stepsTones, stepsVariants } from '@glacier/spec';
import { t } from './tokens.ts';
import { sizeFor, dimensionsFor, paintFor } from './resolve.ts';
import { Skeleton } from './Skeleton.tsx';

// Derived from the spec so the tone, size, and variant unions cannot drift.
export type StepsTone = (typeof stepsTones)[number];
export type StepsSize = (typeof stepsSizes)[number];
export type StepsVariant = (typeof stepsVariants)[number];

// Size-independent box metrics (radius, hairline, current scale, marker
// diameters, connector) read once from the spec.
const BOX = dimensionsFor(stepsSpec);

/**
 * A resolved measurement value. `sizeFor`/`dimensionsFor` return token names
 * (e.g. `space-2`) alongside raw CSS lengths (the dot's `0.5rem` diameter is
 * declared inline in the spec, not as a token). Token names get wrapped in the
 * custom property; a raw length — anything that starts with a digit or dot —
 * passes straight through so it never becomes `var(--glacier-0.5rem)`.
 */
function metric(value: string | undefined, fallback: string): string {
  const v = value ?? fallback;
  return /^[.\d]/.test(v) ? v : t(v);
}

/**
 * Marker font-size and check-glyph size per size step. The web keeps these as
 * raw rems in Steps.module.css (not tokenized in the spec), so — like the web
 * Steps component's own DIAMETER/MARKER maps — they are mirrored verbatim here.
 */
const MARKER_FONT: Record<StepsSize, string> = { sm: '0.625rem', md: '0.6875rem' };
const CHECK_REM: Record<StepsSize, string> = { sm: '0.625rem', md: '0.75rem' };
// Connected marker diameters come from the spec dimensions (markerSm/markerMd).
const MARKER_REM: Record<StepsSize, string> = {
  sm: BOX.markerSm ?? '1.25rem',
  md: BOX.markerMd ?? '1.5rem',
};

export interface StepsProps extends Omit<ViewProps, 'children' | 'style'> {
  /** Total number of steps; renders this many dots. */
  count: number;
  /** Zero-based index of the current step. Earlier dots read completed, later ones upcoming. */
  active?: number;
  /** Semantic color family for completed and current dots. */
  tone?: StepsTone;
  /** Compact size step; sets dot diameter and gap. */
  size?: StepsSize;
  /** dots is the compact dot row; connected joins circular markers with lines and checks. */
  variant?: StepsVariant;
  /** Numbers the connected markers from 1; completed markers keep the check. */
  numbered?: boolean;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
}

/** The check glyph inside a completed connected marker (react-native-svg so it
 * matches the DOM kit's <svg> on web and renders on device). RN does not
 * inherit `currentColor`, so the tone's contrast color is passed in as stroke. */
function Check({ size, color }: { size: string; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden={true}>
      <Path
        d="M2.5 6.5 L5 8.75 L9.5 3.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * The Glacier Steps, rendered with React Native primitives. Paint and geometry
 * are read from the steps spec through the shared resolvers, so it is visually
 * identical to @glacier/react's Steps and cannot drift from it.
 *
 * The dots variant is a row of circular Views: completed and current dots fill
 * solid in the tone (the current one enlarged via `transform: scale`), upcoming
 * dots sit hollow on the surface with a hairline ring. The connected variant
 * joins larger circular markers with connector lines — a check on completed
 * markers, an inset ring on the current one, optional numbers.
 *
 * Resting visuals only: the web eases the current dot's enlarging transform on
 * step change; the static scaled dot is pixel-matched here (no animation runtime
 * on this binding). The web builds its group label through the React i18n
 * provider (t(stepOf, …)); this binding has no locale runtime, so it emits the
 * default "Step {n} of {count}" string directly.
 */
export function Steps({
  count,
  active = 0,
  tone = 'accent',
  size = 'md',
  variant = 'dots',
  numbered = false,
  skeleton = false,
  ...rest
}: StepsProps) {
  const dots = Math.max(0, Math.floor(count));
  const connected = variant === 'connected';

  // Paint families read from the spec (bare token names, wrapped by t()).
  const tonePaint = paintFor(stepsSpec, 'tones', tone);
  const dotsPaint = paintFor(stepsSpec, 'variants', 'dots');
  const connPaint = paintFor(stepsSpec, 'variants', 'connected');

  const fillColor = t(tonePaint.background ?? 'text-subtle'); // completed/current dot fill
  const doneBg = t(tonePaint['connected-done-background'] ?? 'accent-solid');
  const doneText = t(tonePaint['connected-done-text'] ?? 'accent-contrast');
  const nowRing = t(tonePaint['connected-now-ring'] ?? 'accent-solid');
  const nowText = t(tonePaint['connected-now-text'] ?? 'accent-text');
  const connectorDoneBg = t(tonePaint['connected-connector-background'] ?? 'accent-solid');
  const surface = t(dotsPaint.background ?? 'surface');
  const borderCol = t(dotsPaint.border ?? 'border');
  const connectorRestBg = t(connPaint['connector-background'] ?? 'border');
  const upcomingMarkerText = t(connPaint.text ?? 'text-subtle');

  // Geometry read from the spec.
  const dims = sizeFor(stepsSpec, size);
  const gap = metric(dims.gap, 'space-2');
  const dotDiameter = metric(dims.diameter, '0.5rem');
  const markerDiameter = metric(MARKER_REM[size], '1.5rem');
  const radius = metric(BOX.radius, 'radius-full');
  const hairline = metric(BOX.border, 'hairline');
  const currentScale = parseFloat(BOX.currentScale ?? '1.5');
  const connectorH = metric(BOX.connector, '2px');
  const connectorMin = metric(BOX.connectorMinWidth, 'space-4');

  // The track lays its markers out in a content-sized centered row (the web
  // `.track` is inline-flex); both variants inherit the size-scaled gap.
  const track = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    alignSelf: 'flex-start' as const,
    columnGap: gap,
  };

  if (skeleton) {
    // The whole track is decorative here (matches the web aria-hidden branch);
    // one circular Skeleton per step at the exact dot/marker diameter, plus
    // connector bones in the connected variant.
    const diameter = connected ? markerDiameter : dotDiameter;
    return (
      <View aria-hidden={true} style={track}>
        {Array.from({ length: dots }, (_, i) => (
          <Fragment key={i}>
            <Skeleton variant="circle" width={diameter} />
            {connected && i < dots - 1 && <Skeleton width={connectorMin} height="2px" />}
          </Fragment>
        ))}
      </View>
    );
  }

  const current = Math.min(Math.max(active, 0), Math.max(dots - 1, 0));
  const label = `Step ${Math.min(current + 1, dots)} of ${dots}`;

  if (!connected) {
    return (
      <View accessibilityRole="group" aria-label={label} style={track} {...rest}>
        {Array.from({ length: dots }, (_, i) => {
          const filled = i <= current; // completed (i < current) or current (i === current)
          const isCurrent = i === current;
          return (
            <View
              key={i}
              aria-hidden={true}
              style={{
                width: dotDiameter,
                height: dotDiameter,
                borderRadius: radius,
                // Completed and current dots fill solid in the tone; upcoming
                // dots are hollow on the surface with a hairline ring.
                ...(filled
                  ? { backgroundColor: fillColor }
                  : {
                      backgroundColor: surface,
                      borderWidth: hairline,
                      borderColor: borderCol,
                      borderStyle: 'solid',
                    }),
                // The current dot is enlarged so it marks position without
                // shifting its neighbors (transform scales from center).
                ...(isCurrent ? { transform: [{ scale: currentScale }] } : null),
              }}
            />
          );
        })}
      </View>
    );
  }

  return (
    <View accessibilityRole="group" aria-label={label} style={track} {...rest}>
      {Array.from({ length: dots }, (_, i) => {
        const isCompleted = i < current;
        const isCurrent = i === current;

        // Marker paint per state and the color its content (check/number/dot)
        // inherits, straight from the spec's tone tokens.
        let paint: Record<string, string | number>;
        let contentColor: string;
        if (isCompleted) {
          paint = { backgroundColor: doneBg };
          contentColor = doneText;
        } else if (isCurrent) {
          // The current marker rings itself in the tone on the plain surface.
          paint = { backgroundColor: surface, borderWidth: 2, borderColor: nowRing, borderStyle: 'solid' };
          contentColor = nowText;
        } else {
          // Upcoming markers are hollow with a hairline border, tone-agnostic.
          paint = { backgroundColor: surface, borderWidth: hairline, borderColor: borderCol, borderStyle: 'solid' };
          contentColor = upcomingMarkerText;
        }

        let content: ReactNode = null;
        if (isCompleted) {
          content = <Check size={metric(CHECK_REM[size], '0.75rem')} color={contentColor} />;
        } else if (numbered) {
          content = (
            <Text
              style={{
                color: contentColor,
                fontSize: MARKER_FONT[size],
                fontFamily: t('font-sans'),
                fontWeight: t('font-weight-semibold') as never,
                fontVariant: ['tabular-nums'],
              }}
            >
              {i + 1}
            </Text>
          );
        } else if (isCurrent) {
          // The unnumbered current marker carries a small dot in the tone text color.
          content = (
            <View
              aria-hidden={true}
              style={{ width: '0.375rem', height: '0.375rem', borderRadius: radius, backgroundColor: contentColor }}
            />
          );
        }

        return (
          <Fragment key={i}>
            <View
              aria-hidden={true}
              style={{
                width: markerDiameter,
                height: markerDiameter,
                borderRadius: radius,
                alignItems: 'center',
                justifyContent: 'center',
                ...paint,
              }}
            >
              {content}
            </View>
            {i < dots - 1 && (
              <View
                aria-hidden={true}
                style={{
                  flexGrow: 1,
                  flexShrink: 1,
                  flexBasis: 'auto',
                  minWidth: connectorMin,
                  height: connectorH,
                  borderRadius: radius,
                  // Connectors fill in the tone once the step before them completes.
                  backgroundColor: isCompleted ? connectorDoneBg : connectorRestBg,
                }}
              />
            )}
          </Fragment>
        );
      })}
    </View>
  );
}
