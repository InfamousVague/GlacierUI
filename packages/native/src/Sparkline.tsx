import { View, type ViewProps } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { sparklineShapes, sparklineTones, sparklineSpec, controlSizes } from '@glacier/spec';
import { t } from './tokens.ts';
import { paintFor, sizeFor, dimensionsFor } from './resolve.ts';
import { Skeleton } from './Skeleton.tsx';

// Derived from the spec so the unions cannot drift from the web kit.
export type SparklineShape = (typeof sparklineShapes)[number];
export type SparklineTone = (typeof sparklineTones)[number];
export type SparklineSize = (typeof controlSizes)[number];

export interface SparklineProps extends Omit<ViewProps, 'style' | 'children'> {
  /** The series, oldest first. The sparkline renders whatever slice it is given. */
  data: number[];
  /** Fixed lower bound of the value domain. Defaults to the data minimum. */
  min?: number;
  /** Fixed upper bound of the value domain. Defaults to the data maximum. */
  max?: number;
  /** Draws a dashed reference line at this value when it sits inside the domain. */
  baseline?: number;
  /** How the series is marked: a thin line, a line over a soft fill, or micro bars. */
  shape?: SparklineShape;
  /** Ink family for the mark. */
  tone?: SparklineTone;
  /** Height step; the width is fluid and follows the container. */
  size?: SparklineSize;
  /** Marks the newest sample with an emphasis dot. */
  endPoint?: boolean;
  /** Mounts the mark on the frosted glass material: a rounded tile. */
  glass?: boolean;
  /** Renders a placeholder with the exact geometry. */
  skeleton?: boolean;
  /** Accessible name; describe the trend, not the pixels. */
  'aria-label': string;
}

// Size-independent metrics (bar gap, baseline width, point diameter, glass tile)
// read once from the spec. Token names get wrapped by t(); raw CSS lengths
// (pointDiameter) pass straight through via metric().
const BOX = dimensionsFor(sparklineSpec);

/**
 * A resolved measurement value. `sizeFor`/`dimensionsFor` return token names
 * (e.g. `space-2`) alongside raw CSS lengths (the sizes' `1.5rem` height and
 * `1.5px` thickness are declared inline, not as tokens). Token names get the
 * custom property; a raw length — anything starting with a digit or dot — passes
 * through so it never becomes `var(--glacier-1.5rem)`.
 */
function metric(value: string | undefined, fallback: string): string {
  const v = value ?? fallback;
  return /^[.\d]/.test(v) ? v : t(v);
}

/** Map samples into the 0-100 viewBox, y inverted so larger values sit higher. */
function project(data: number[], min: number, max: number): { x: number; y: number }[] {
  const span = max - min || 1;
  const lastIndex = Math.max(data.length - 1, 1);
  return data.map((v, i) => ({
    x: (i / lastIndex) * 100,
    y: 100 - ((Math.min(Math.max(v, min), max) - min) / span) * 100,
  }));
}

/**
 * The Glacier Sparkline, rendered with react-native-svg. The line/area marks are
 * the exact same `<svg viewBox="0 0 100 100" preserveAspectRatio="none">` path
 * geometry the DOM kit draws (react-native-svg resolves to a real DOM <svg> on
 * react-native-web, and stroke/fill accept the `var(--glacier-*)` token strings),
 * with `vectorEffect="non-scaling-stroke"` keeping the stroke a constant width
 * despite the non-uniform viewBox scaling — pixel-identical to @glacier/react's
 * Sparkline and unable to drift from it. Bars, the dashed baseline, and the
 * end-point dot are absolutely-positioned Views mirroring the CSS spans.
 *
 * Resting visual only: the web mark redraws without animation, so there is
 * nothing to animate here. The `glass` tile paints its resting tint (fill,
 * hairline border, radius); the DOM backdrop-blur and inset highlight shadow are
 * not reproducible natively and are accepted-but-noop.
 */
export function Sparkline({
  data,
  min,
  max,
  baseline,
  shape = 'line',
  tone = 'accent',
  size = 'md',
  endPoint = false,
  glass = false,
  skeleton = false,
  'aria-label': ariaLabel,
  ...rest
}: SparklineProps) {
  const dims = sizeFor(sparklineSpec, size);
  const height = metric(dims.height, '1.5rem');

  // The glass tile paint, mirroring `.glass` in the CSS (blur/highlight omitted).
  const glassStyle = glass
    ? {
        paddingVertical: t(BOX.glassPaddingBlock ?? 'space-1'),
        paddingHorizontal: t(BOX.glassPaddingInline ?? 'space-2'),
        borderRadius: t(BOX.glassRadius ?? 'radius-md'),
        borderWidth: t('hairline'),
        borderStyle: 'solid' as const,
        borderColor: t('glass-border'),
        backgroundColor: t('glass-regular'),
      }
    : null;

  if (skeleton) {
    return (
      <View style={{ flexDirection: 'row', width: '100%', ...glassStyle }} {...rest}>
        <Skeleton height={height} width="100%" radius={t('radius-sm')} />
      </View>
    );
  }

  // Tone paint: `text` is the mark ink, `fill` the soft area fill. Token names
  // from the spec, wrapped for react-native-web to resolve on the DOM.
  const paint = paintFor(sparklineSpec, 'tones', tone);
  const ink = t(paint.text ?? 'accent-solid');
  const fill = t(paint.fill ?? 'accent-soft');
  const strokeWidth = Number.parseFloat(dims.thickness ?? '1.5');

  const lo = min ?? (data.length ? Math.min(...data) : 0);
  const hi = max ?? (data.length ? Math.max(...data) : 1);
  const points = project(data, lo, hi);
  const hasMark = data.length >= 2;
  const span = hi - lo || 1;
  const baselineY =
    baseline !== undefined && baseline >= lo && baseline <= hi
      ? 100 - ((baseline - lo) / span) * 100
      : undefined;
  const last = points[points.length - 1];

  const linePath = hasMark ? `M ${points.map((p) => `${p.x} ${p.y}`).join(' L ')}` : '';
  const areaPath = hasMark ? `${linePath} L 100 100 L 0 100 Z` : '';

  return (
    <View
      accessibilityRole="image"
      aria-label={ariaLabel}
      style={{ flexDirection: 'row', width: '100%', ...glassStyle }}
      {...rest}
    >
      <View aria-hidden={true} style={{ position: 'relative', flex: 1, minWidth: 0, height }}>
        {hasMark && shape !== 'bars' && (
          <Svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', overflow: 'visible' }}
          >
            {shape === 'area' && <Path d={areaPath} fill={fill} />}
            <Path
              d={linePath}
              fill="none"
              stroke={ink}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </Svg>
        )}
        {hasMark && shape === 'bars' && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'flex-end', columnGap: metric(BOX.barGap, 'hairline') }}>
            {points.map((p, i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  minHeight: '4%',
                  height: `${Math.max(100 - p.y, 4)}%`,
                  backgroundColor: ink,
                  borderTopLeftRadius: 1,
                  borderTopRightRadius: 1,
                }}
              />
            ))}
          </View>
        )}
        {baselineY !== undefined && (
          <View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: `${baselineY}%`,
              height: 0,
              borderTopWidth: metric(BOX.baselineWidth, 'hairline'),
              borderStyle: 'dashed',
              borderTopColor: t('border-strong'),
            }}
          />
        )}
        {hasMark && endPoint && shape !== 'bars' && last && (
          <View
            style={{
              position: 'absolute',
              left: `${last.x}%`,
              top: `${last.y}%`,
              width: metric(BOX.pointDiameter, '0.375rem'),
              height: metric(BOX.pointDiameter, '0.375rem'),
              borderRadius: t('radius-full'),
              backgroundColor: ink,
              transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
            }}
          />
        )}
      </View>
    </View>
  );
}
