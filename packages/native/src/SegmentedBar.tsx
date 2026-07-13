import { segmentedBarSizes, segmentedBarTones, segmentedBarSpec } from '@glacier/spec';
import { View, type ViewProps } from 'react-native';
import { t } from './tokens.ts';
import { paintFor, sizeFor, dimensionsFor } from './resolve.ts';
import { Skeleton } from './Skeleton.tsx';

// Derived from the spec so the tone and size unions cannot drift from the web kit.
export type SegmentedBarTone = (typeof segmentedBarTones)[number];
export type SegmentedBarSize = (typeof segmentedBarSizes)[number];

export interface SegmentedBarSegment {
  value: number;
  tone?: SegmentedBarTone;
  label?: string;
}

export interface SegmentedBarProps extends Omit<ViewProps, 'children' | 'style'> {
  /** Slices sized by proportion of the total. Zero-value slices are omitted. */
  data: SegmentedBarSegment[];
  /** Bar thickness: sm 0.375rem, md 0.625rem. */
  size?: SegmentedBarSize;
  /** Round the bar ends with a full radius. */
  rounded?: boolean;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Accessible name for the bar. Falls back to a generated breakdown. */
  'aria-label'?: string;
}

// Size-independent box metrics (radius, gap, slice radius) read once from the spec.
const BOX = dimensionsFor(segmentedBarSpec);

/**
 * A resolved measurement value. The resolvers return token names (e.g. `space-1`)
 * for tokenized values and raw CSS lengths for the rest (the bar's `height:
 * 0.625rem` and the slice's `2px` micro radius are declared inline, not as
 * tokens). A token name gets wrapped in its custom property; a raw length —
 * anything starting with a digit or dot — passes straight through so it never
 * becomes `var(--glacier-0.625rem)`.
 */
function metric(value: string | undefined, fallback: string): string {
  const v = value ?? fallback;
  return /^[.\d]/.test(v) ? v : t(v);
}

/**
 * The fill for one slice tone, read from the spec so it stays pixel-identical to
 * SegmentedBar.module.css. Every tone maps to its `-solid` paint except neutral,
 * which paints the track color and reads as part of the empty remainder.
 */
function sliceFill(tone: SegmentedBarTone): string {
  const p = paintFor(segmentedBarSpec, 'tones', tone);
  return metric(p.background, 'segment-track');
}

/** The generated fallback alt: a comma-joined percentage breakdown. */
function summarize(data: SegmentedBarSegment[]): string {
  const total = data.reduce((sum, seg) => sum + Math.max(seg.value, 0), 0);
  if (total <= 0) return 'Segmented bar';
  const parts = data
    .filter((seg) => seg.value > 0)
    .map((seg) => {
      const percent = Math.round((seg.value / total) * 100);
      return seg.label ? `${seg.label} ${percent}%` : `${percent}%`;
    });
  return parts.join(', ');
}

/**
 * The Glacier SegmentedBar, rendered with React Native primitives. The track is a
 * flex-row View that clips its slices and paints the empty remainder with the
 * segment-track token; each slice is a View whose width is its share of the total
 * and whose fill comes from its tone. Paint and geometry are read from the
 * segmented-bar spec through the shared resolvers, so it is visually identical to
 * @glacier/react's SegmentedBar and cannot drift from it. This is a resting-only
 * render (there is no animation); the whole bar is one `img` with a text alt and
 * the slices are decorative, matching the web a11y contract.
 */
export function SegmentedBar({
  data,
  size = 'md',
  rounded = true,
  skeleton = false,
  'aria-label': ariaLabel,
  ...rest
}: SegmentedBarProps) {
  const dims = sizeFor(segmentedBarSpec, size);
  const height = metric(dims.height, '0.625rem');
  const gap = metric(BOX.gap, 'space-1');
  const sliceRadius = metric(BOX.sliceRadius, '2px');
  const radius = rounded ? metric(BOX.radius, 'radius-full') : undefined;

  if (skeleton) {
    // A representative three-way split, so the placeholder reads as a breakdown.
    const slices = ['42%', '30%', '18%'];
    return (
      <View
        aria-hidden={true}
        style={{
          flexDirection: 'row',
          width: '100%',
          columnGap: gap,
          overflow: 'hidden',
          height,
          borderRadius: radius,
        }}
      >
        {slices.map((width) => (
          <Skeleton key={width} width={width} height="100%" radius={sliceRadius} />
        ))}
      </View>
    );
  }

  const total = data.reduce((sum, seg) => sum + Math.max(seg.value, 0), 0);

  return (
    <View
      accessibilityRole="image"
      aria-label={ariaLabel ?? summarize(data)}
      style={{
        flexDirection: 'row',
        width: '100%',
        columnGap: gap,
        overflow: 'hidden',
        height,
        borderRadius: radius,
        backgroundColor: t('segment-track'),
      }}
      {...rest}
    >
      {total > 0 &&
        data
          .filter((seg) => seg.value > 0)
          .map((seg, i) => (
            <View
              key={i}
              style={{
                height: '100%',
                borderRadius: sliceRadius,
                backgroundColor: sliceFill(seg.tone ?? 'accent'),
                width: `${(seg.value / total) * 100}%`,
              }}
            />
          ))}
    </View>
  );
}
