/**
 * TimeSeriesChart — the @glacier/native binding of the web organism.
 *
 * The web kit canvas-renders the plot with uPlot; react-native has no canvas, so
 * this redraws the same picture with react-native-svg. The line/area series, the
 * horizontal gridlines, and the axes are a normalized `viewBox="0 0 100 100"
 * preserveAspectRatio="none"` SVG (exactly the fluid, container-following geometry
 * uPlot produces), with `vectorEffect="non-scaling-stroke"` holding the 2px series
 * and hairline grid strokes constant despite the non-uniform scale — the same
 * technique the native Sparkline uses. Axis tick labels are plain <Text> overlays
 * (react-native-svg's <Text> is not in the kit's SVG shim) positioned in the same
 * fractional space, so labels and marks stay aligned without measuring pixels.
 *
 * Paint and geometry are read from `timeSeriesChartSpec` through the resolvers;
 * stroke/fill take `t("token")` strings (react-native-web resolves the custom
 * property; a device build swaps in a concrete token map).
 *
 * Web-only affordances that do not survive the port, all accepted-but-noop:
 *   - the hover crosshair + value readout row (a device follow-up: needs pointer
 *     tracking; the readout slot is rendered empty),
 *   - the runtime accent-collision de-dup (the web reads getComputedStyle to drop
 *     the ramp the accent aliases; native uses the plain positional tone order),
 *   - the glass backdrop-blur and inset highlight (native paints the resting tint,
 *     hairline border, and radius only).
 */

import { Fragment, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, type ViewProps, type StyleProp } from 'react-native';
import { Svg, Path, Line } from 'react-native-svg';
import { chartSeriesTones, timeSeriesChartShapes, timeSeriesChartSpec } from '@glacier/spec';
import { t } from './tokens.ts';
import { paintFor, dimensionsFor } from './resolve.ts';
import { Skeleton } from './Skeleton.tsx';

// Derived from the spec so the unions cannot drift from the web kit.
export type ChartSeriesTone = (typeof chartSeriesTones)[number];
export type TimeSeriesChartShape = (typeof timeSeriesChartShapes)[number];

export interface TimeSeriesChartSeries {
  /** Stable identity; keeps color and toggle state across data updates. */
  id: string;
  /** Name shown in the legend and readout. */
  label: string;
  /** The samples, aligned index-for-index with times. */
  values: (number | null)[];
  /** Ink assignment. Defaults to the fixed categorical order by position. */
  tone?: ChartSeriesTone;
}

export interface TimeSeriesChartProps extends Omit<ViewProps, 'style' | 'children' | 'aria-label'> {
  /** The shared time axis in epoch milliseconds, oldest first. */
  times: number[];
  /** The plotted series. Keep it to a handful; roll the tail into an "other" series in gray. */
  series: TimeSeriesChartSeries[];
  /** Thin lines, or lines over a translucent soft fill. */
  shape?: TimeSeriesChartShape;
  /** Fixed lower bound of the value axis. Defaults to 0. */
  min?: number;
  /** Fixed upper bound of the value axis. Defaults to the data maximum. */
  max?: number;
  /** Formats a value for the y axis and the readout. Defaults to a compact number. */
  formatValue?: (value: number) => string;
  /** Formats a timestamp for the x axis and the readout. */
  formatTime?: (time: number) => string;
  /** Shows the legend when two or more series are plotted. */
  showLegend?: boolean;
  /** Plot height as a CSS length; the width is fluid and follows the container. */
  height?: string;
  /** Message shown while times is empty. */
  emptyLabel?: string;
  /** Frames the plot on the frosted glass material. */
  glass?: boolean;
  /** Renders a placeholder with the exact geometry. */
  skeleton?: boolean;
  /** Optional style, merged over the component's own root style. */
  style?: StyleProp;
  /** Accessible name describing what the chart plots. */
  'aria-label': string;
}

// Size-independent metrics read once from the spec.
const BOX = dimensionsFor(timeSeriesChartSpec);
// Series stroke, e.g. '2px' -> 2.
const STROKE_WIDTH = Number.parseFloat(BOX.strokeWidth ?? '2px') || 2;

// Axis gutters, mirroring uPlot's reserved axis sizes (y size 56, a compact x
// band). Layout constants, not spec tokens: the web hardcodes these in the
// component too. rem so react-native-web resolves against the root font size.
const GUTTER_LEFT = '3.5rem';
const PLOT_TOP_INSET = '0.5rem';
const X_AXIS_HEIGHT = '3.125rem';

const defaultFormatValue = (value: number) =>
  Math.abs(value) >= 1000
    ? Intl.NumberFormat(undefined, { notation: 'compact' }).format(value)
    : String(Math.round(value * 10) / 10);

const defaultFormatTime = (time: number) =>
  new Date(time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

/** "Nice" value-axis ticks inside [min, max], mirroring uPlot's split choice. */
function niceTicks(min: number, max: number, count: number): number[] {
  const span = max - min;
  if (!(span > 0)) return [min];
  const step0 = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(step0)));
  const norm = step0 / mag;
  const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
  const ticks: number[] = [];
  const start = Math.ceil(min / step) * step;
  for (let v = start; v <= max + step * 1e-6; v += step) ticks.push(Math.round(v * 1e6) / 1e6);
  return ticks.length >= 2 ? ticks : [min, max];
}

/** Evenly spaced sample indices for the sparse time axis (always the endpoints). */
function timeTickIndices(length: number, count: number): number[] {
  if (length <= 1) return length === 1 ? [0] : [];
  const n = Math.max(2, Math.min(count, length));
  const out: number[] = [];
  for (let i = 0; i < n; i++) out.push(Math.round((i / (n - 1)) * (length - 1)));
  return Array.from(new Set(out));
}

/**
 * A streaming time-series plot for telemetry: one shared time axis and a handful
 * of series as thin lines or soft areas. Series colors follow the fixed
 * categorical order from the spec (never cycled, never re-ranked); pin `max`
 * (e.g. 100 for percentages) so successive frames share one scale.
 */
export function TimeSeriesChart({
  times,
  series,
  shape = 'line',
  min,
  max,
  formatValue = defaultFormatValue,
  formatTime = defaultFormatTime,
  showLegend = true,
  height = '12rem',
  emptyLabel = 'No samples yet',
  glass = false,
  skeleton = false,
  style,
  'aria-label': ariaLabel,
  ...rest
}: TimeSeriesChartProps) {
  const [hidden, setHidden] = useState<Set<string>>(() => new Set());
  const [tonePool, setTonePool] = useState<readonly ChartSeriesTone[]>(chartSeriesTones);

  // The accent can alias one of the categorical ramps (blue in the current
  // docs theme). Resolve the mounted CSS tokens on native-web and omit that
  // duplicate from implicit positional assignment, as the DOM binding does.
  useEffect(() => {
    if (typeof document === 'undefined' || typeof getComputedStyle !== 'function') return;
    const styles = getComputedStyle(document.documentElement);
    const resolvedInk = (tone: ChartSeriesTone) => {
      const token = paintFor(timeSeriesChartSpec, 'tones', tone).text ?? 'accent-solid';
      return styles.getPropertyValue(`--glacier-${token}`).trim();
    };
    const accentInk = resolvedInk('accent');
    if (!accentInk) return;
    setTonePool(chartSeriesTones.filter((tone) => tone === 'accent' || resolvedInk(tone) !== accentInk));
  }, []);

  const toggle = (id: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // Positional tone order after the accent collision check. Explicit tones win.
  const tones: ChartSeriesTone[] = series.map((s, i) => s.tone ?? tonePool[i % tonePool.length] ?? 'accent');
  const ink = (tone: ChartSeriesTone) => t(paintFor(timeSeriesChartSpec, 'tones', tone).text ?? 'accent-solid');
  const soft = (tone: ChartSeriesTone) => t(paintFor(timeSeriesChartSpec, 'tones', tone).fill ?? 'accent-soft');

  const rootStyle = { width: '100%', flexDirection: 'column' as const, rowGap: t('space-3') };

  if (skeleton) {
    return (
      <View {...rest} style={[rootStyle, style as never]}>
        <Skeleton height={height} width="100%" radius={t('radius-md')} />
      </View>
    );
  }

  const showLegendRow = showLegend && series.length >= 2;

  // Value + time domains. y defaults to [0, dataMax]; x spans the sample range.
  const flat = series.flatMap((s) => s.values.filter((v): v is number => v != null));
  const dataMax = flat.length ? Math.max(...flat) : 1;
  const yMin = min ?? 0;
  const yMax = max ?? Math.max(dataMax, 1);
  const ySpan = yMax - yMin || 1;
  const xMin = times[0] ?? 0;
  const xMax = times[times.length - 1] ?? 0;
  const xSpan = xMax - xMin || 1;

  const xFrac = (time: number) => (time - xMin) / xSpan; // 0..1 left to right
  const yFrac = (value: number) => 1 - (value - yMin) / ySpan; // 0..1 top to bottom (inverted)

  const yTicks = niceTicks(yMin, yMax, 4).filter((v) => v >= yMin - 1e-6 && v <= yMax + 1e-6);
  const xTicks = timeTickIndices(times.length, 4);

  // Build one line path per contiguous (non-null) run so gaps break the line,
  // and — for area — a filled polygon dropped to the value floor.
  const buildPaths = (values: (number | null)[]) => {
    const segments: { x: number; y: number }[][] = [];
    let current: { x: number; y: number }[] = [];
    for (let i = 0; i < times.length; i++) {
      const v = values[i];
      if (v == null || times[i] == null) {
        if (current.length) segments.push(current);
        current = [];
        continue;
      }
      current.push({ x: xFrac(times[i]!) * 100, y: yFrac(v) * 100 });
    }
    if (current.length) segments.push(current);

    let line = '';
    let area = '';
    for (const seg of segments) {
      if (seg.length < 2) continue;
      const d = `M ${seg.map((p) => `${p.x} ${p.y}`).join(' L ')}`;
      line += `${line ? ' ' : ''}${d}`;
      const first = seg[0]!;
      const last = seg[seg.length - 1]!;
      area += `${area ? ' ' : ''}${d} L ${last.x} 100 L ${first.x} 100 Z`;
    }
    return { line, area };
  };

  return (
    <View {...rest} style={[rootStyle, style as never]}>
      {/* Header: readout slot (hover value row — a device follow-up) + legend. */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', columnGap: t('space-3'), minHeight: '1.25rem' }}>
        <View aria-hidden={true} style={{ flexShrink: 1, overflow: 'hidden' }} />
        {showLegendRow && (
          <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: t('space-2'), flexShrink: 0 }}>
            {series.map((s, i) => {
              const off = hidden.has(s.id);
              return (
                <Pressable
                  key={s.id}
                  accessibilityRole="button"
                  aria-checked={!off}
                  accessibilityState={{ selected: !off }}
                  onPress={() => toggle(s.id)}
                  style={{ flexDirection: 'row', alignItems: 'center', columnGap: t('space-1'), paddingHorizontal: t('space-2'), borderRadius: t('radius-sm') }}
                >
                  <View style={{ width: BOX.swatchDiameter ?? '0.5rem', height: BOX.swatchDiameter ?? '0.5rem', borderRadius: t('radius-full'), backgroundColor: ink(tones[i] ?? 'accent'), opacity: off ? 0.35 : 1 }} />
                  <Text style={{ fontSize: t('font-size-xs'), color: t(off ? 'text-disabled' : 'text-subtle') } as never}>{s.label}</Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      {/* Plot region. */}
      <View
        accessibilityRole="image"
        aria-label={ariaLabel}
        style={[
          { position: 'relative', width: '100%', height },
          glass && {
            padding: t('space-3'),
            borderRadius: t('radius-md'),
            borderWidth: t('hairline'),
            borderStyle: 'solid' as const,
            borderColor: t('glass-border'),
            backgroundColor: t('glass-regular'),
          },
        ]}
      >
        {times.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', borderWidth: t('hairline'), borderStyle: 'dashed', borderColor: t('border'), borderRadius: t('radius-md') }}>
            <Text style={{ fontSize: t('font-size-sm'), color: t('text-muted') } as never}>{emptyLabel}</Text>
          </View>
        ) : (
          <View style={{ flex: 1, flexDirection: 'column', paddingTop: PLOT_TOP_INSET, paddingRight: PLOT_TOP_INSET }}>
            {/* Plotting band: y-axis labels beside the fluid SVG. */}
            <View style={{ flex: 1, flexDirection: 'row' }}>
              <View style={{ width: GUTTER_LEFT, position: 'relative' }}>
                {yTicks.map((v) => (
                  <Text
                    key={v}
                    aria-hidden={true}
                    numberOfLines={1}
                    style={{
                      position: 'absolute',
                      top: `${yFrac(v) * 100}%`,
                      right: t('space-1'),
                      transform: [{ translateY: '-50%' }],
                      textAlign: 'right',
                      fontSize: t('font-size-xs'),
                      color: t('text-muted'),
                      fontVariant: ['tabular-nums'],
                    } as never}
                  >
                    {formatValue(v)}
                  </Text>
                ))}
              </View>
              <View style={{ flex: 1, position: 'relative', minWidth: 0 }}>
                <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', overflow: 'visible' }}>
                  {/* Horizontal gridlines at each value tick. */}
                  {yTicks.map((v) => {
                    const y = yFrac(v) * 100;
                    return <Line key={v} x1={0} x2={100} y1={y} y2={y} stroke={t('border')} strokeWidth={StyleSheet.hairlineWidth} vectorEffect="non-scaling-stroke" />;
                  })}
                  {/* uPlot paints each series as fill then stroke. Later series
                      intentionally cover earlier areas, while their own stroke
                      remains crisp above its fill. */}
                  {series.map((s, i) => {
                    if (hidden.has(s.id)) return null;
                    const tone = tones[i] ?? 'accent';
                    const { line, area } = buildPaths(s.values);
                    if (!line) return null;
                    return (
                      <Fragment key={s.id}>
                        {shape === 'area' && area && <Path d={area} fill={soft(tone)} stroke="none" />}
                        <Path d={line} fill="none" stroke={ink(tone)} strokeWidth={STROKE_WIDTH} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                      </Fragment>
                    );
                  })}
                </Svg>
              </View>
            </View>
            {/* Time-axis band: sparse labels under the SVG column. */}
            <View style={{ height: X_AXIS_HEIGHT, flexDirection: 'row' }}>
              <View style={{ width: GUTTER_LEFT }} />
              <View style={{ flex: 1, position: 'relative', minWidth: 0 }}>
                {xTicks.map((idx) => {
                  const frac = xFrac(times[idx]!);
                  const atStart = frac <= 0.02;
                  const atEnd = frac >= 0.98;
                  const anchor = atStart
                    ? { left: '0%', textAlign: 'left' as const }
                    : atEnd
                      ? { right: '0%', textAlign: 'right' as const }
                      : { left: `${frac * 100}%`, transform: [{ translateX: '-50%' }], textAlign: 'center' as const };
                  return (
                    <Text
                      key={idx}
                      aria-hidden={true}
                      numberOfLines={1}
                      style={{ position: 'absolute', top: t('space-1'), fontSize: t('font-size-xs'), color: t('text-muted'), fontVariant: ['tabular-nums'], ...anchor } as never}
                    >
                      {formatTime(times[idx]!)}
                    </Text>
                  );
                })}
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
