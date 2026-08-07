import { controlSizes } from '@glacier/spec';
import { area as d3Area, curveCatmullRom, line as d3Line } from 'd3-shape';
import { useId, useMemo, useRef, useState, type ComponentProps, type PointerEvent } from 'react';
import { cx } from '../../internal/cx.ts';
import { useControlled } from '../../internal/useControlled.ts';
import { Button } from '../../atoms/inputs/Button/Button.tsx';
import { Slider } from '../../atoms/inputs/Slider/Slider.tsx';
import { Text } from '../../atoms/display/Typography/Text.tsx';
import { SegmentedControl } from '../Segmented/SegmentedControl.tsx';
import styles from './AudioEqualizer.module.css';

export type AudioEqualizerSize = (typeof controlSizes)[number];

export interface AudioEqualizerBand {
  id: string;
  /** Visible label for the band, usually a frequency like 1kHz. */
  label: string;
}

export interface AudioEqualizerPreset {
  id: string;
  label: string;
  /** Per-band gain values in dB, one value per rendered band. */
  gains: readonly number[];
}

export interface AudioEqualizerLabels {
  equalizer: string;
  presets: string;
  reset: string;
  gainUnit: string;
  band: string;
}

const DEFAULT_BANDS: readonly AudioEqualizerBand[] = [
  { id: 'sub', label: '32Hz' },
  { id: 'bass', label: '64Hz' },
  { id: 'low-mid', label: '125Hz' },
  { id: 'mid', label: '250Hz' },
  { id: 'presence', label: '500Hz' },
  { id: 'high-mid', label: '1kHz' },
  { id: 'high', label: '2kHz' },
  { id: 'air', label: '4kHz' },
];

const DEFAULT_PRESETS: readonly AudioEqualizerPreset[] = [
  { id: 'flat', label: 'Flat', gains: [0, 0, 0, 0, 0, 0, 0, 0] },
  { id: 'bass-boost', label: 'Bass boost', gains: [6, 5, 4, 2, 0, -2, -3, -4] },
  { id: 'vocal', label: 'Vocal', gains: [-2, -1, 1, 3, 4, 3, 1, -1] },
  { id: 'air', label: 'Air', gains: [-4, -2, -1, 0, 1, 3, 5, 6] },
];

const DEFAULT_LABELS: AudioEqualizerLabels = {
  equalizer: 'Audio equalizer',
  presets: 'EQ presets',
  reset: 'Reset',
  gainUnit: 'dB',
  band: 'band',
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function normalizeGains(values: readonly number[] | undefined, count: number, min: number, max: number): number[] {
  return Array.from({ length: count }, (_, index) => clamp(values?.[index] ?? 0, min, max));
}

function formatGain(gain: number, unit: string): string {
  return `${gain > 0 ? '+' : ''}${gain}${unit}`;
}

const CURVE_WIDTH = 320;
const CURVE_HEIGHT = 108;
const CURVE_PADDING_X = 8;
const CURVE_PADDING_Y = 12;

interface CurvePoint {
  x: number;
  y: number;
}

function normalizeGain(gain: number, min: number, max: number): number {
  const safe = max === min ? 1 : max - min;
  return (max - clamp(gain, min, max)) / safe;
}

export interface AudioEqualizerProps
  extends Omit<ComponentProps<'div'>, 'onChange' | 'defaultValue'> {
  /** Controlled per-band gain values in decibels. */
  value?: readonly number[];
  /** Initial gains when uncontrolled; missing entries default to 0dB. */
  defaultValue?: readonly number[];
  /** Called whenever any band gain changes. */
  onValueChange?: (gains: number[]) => void;
  /** Frequency bands, in visual order from low to high. */
  bands?: readonly AudioEqualizerBand[];
  /** Presets shown above the bands. */
  presets?: readonly AudioEqualizerPreset[];
  /** Controlled selected preset id. */
  preset?: string;
  /** Initial selected preset when uncontrolled. */
  defaultPreset?: string;
  /** Called when the preset selection changes. */
  onPresetChange?: (presetId: string | undefined) => void;
  /** Lowest gain per band, in dB. */
  min?: number;
  /** Highest gain per band, in dB. */
  max?: number;
  /** Gain step in dB. */
  step?: number;
  /** Layout density for slider travel and labels. */
  size?: AudioEqualizerSize;
  /** Dims the control and blocks interaction. */
  disabled?: boolean;
  /** Hides the presets row while keeping band controls. */
  hidePresets?: boolean;
  /** Label overrides for localization. */
  labels?: Partial<AudioEqualizerLabels>;
}

/**
 * Multi-band equalizer with optional presets. Each band is a vertical slider in
 * decibels so gain edits are symmetric around 0dB and easy to compare.
 *
 * The curve above the sliders is the same gains read a second way, and it is
 * draggable: a node can be pulled up or down to set its band directly, which is
 * how a curve is shaped when the shape - rather than any one number - is what
 * you are after. It is a pointer affordance only, and stays out of the
 * accessibility tree: every band it edits is a real slider a few pixels below,
 * already keyboard-operable and already announced, so exposing the nodes as
 * well would put each band in the tab order twice to say the same thing.
 */
export function AudioEqualizer({
  value,
  defaultValue,
  onValueChange,
  bands = DEFAULT_BANDS,
  presets = DEFAULT_PRESETS,
  preset,
  defaultPreset,
  onPresetChange,
  min = -12,
  max = 12,
  step = 1,
  size = 'md',
  disabled = false,
  hidePresets = false,
  labels,
  className,
  style,
  ...rest
}: AudioEqualizerProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const gradientId = `eq-curve-${useId().replaceAll(':', '')}`;
  const [selectedPreset, setSelectedPreset] = useControlled(preset, defaultPreset);

  const bandCount = bands.length;
  const initial = normalizeGains(defaultValue, bandCount, min, max);
  const [rawGains, setRawGains] = useControlled(value, initial);
  const gains = normalizeGains(rawGains, bandCount, min, max);
  const chart = useMemo(() => {
    const innerWidth = CURVE_WIDTH - CURVE_PADDING_X * 2;
    const innerHeight = CURVE_HEIGHT - CURVE_PADDING_Y * 2;
    const points = gains.map((gain, index) => {
      const ratioX = bandCount <= 1 ? 0.5 : index / (bandCount - 1);
      return {
        x: CURVE_PADDING_X + ratioX * innerWidth,
        y: CURVE_PADDING_Y + normalizeGain(gain, min, max) * innerHeight,
      };
    });
    const zeroY = CURVE_PADDING_Y + normalizeGain(0, min, max) * innerHeight;
    const linePath =
      d3Line<CurvePoint>()
        .x((point) => point.x)
        .y((point) => point.y)
        .curve(curveCatmullRom.alpha(0.45))(points) ?? '';
    const areaPath =
      d3Area<CurvePoint>()
        .x((point) => point.x)
        .y0(zeroY)
        .y1((point) => point.y)
        .curve(curveCatmullRom.alpha(0.45))(points) ?? '';
    return { points, zeroY, linePath, areaPath };
  }, [gains, bandCount, min, max]);

  const applyGains = (next: number[]) => {
    setRawGains(next);
    onValueChange?.(next);
  };

  const clearPreset = () => {
    if (selectedPreset === undefined) return;
    setSelectedPreset(undefined);
    onPresetChange?.(undefined);
  };

  /** One band's gain, from wherever the edit came from. */
  const setBandGain = (index: number, next: number) => {
    if (gains[index] === next) return;
    clearPreset();
    const nextGains = gains.slice();
    nextGains[index] = next;
    applyGains(nextGains);
  };

  /**
   * The curve reads continuously but the bands do not, so a dragged node lands
   * on the same values the slider beside it can hold - otherwise the readout
   * under a dragged band would show a number its own slider could not produce.
   * The rounding at the end is for the float error a fractional step leaves
   * behind (0.1 * 3 is not 0.3), which would otherwise reach the readout.
   */
  const snapGain = (gain: number) => {
    const stepped = step > 0 ? min + Math.round((gain - min) / step) * step : gain;
    return clamp(Math.round(stepped * 1e6) / 1e6, min, max);
  };

  /**
   * Where a pointer is, in the chart's own units. The chart is stretched to its
   * box rather than fitted to it (`preserveAspectRatio="none"`), so the two axes
   * scale independently and the box maps onto the viewBox directly.
   */
  const pointFromEvent = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    return {
      x: ((event.clientX - rect.left) / rect.width) * CURVE_WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * CURVE_HEIGHT,
    };
  };

  const gainFromY = (y: number) => {
    const innerHeight = CURVE_HEIGHT - CURVE_PADDING_Y * 2;
    const ratio = clamp((y - CURVE_PADDING_Y) / innerHeight, 0, 1);
    return snapGain(max - ratio * (max - min));
  };

  /** The node a press belongs to: the nearest one along the frequency axis. */
  const bandFromX = (x: number) =>
    chart.points.reduce(
      (nearest, point, index) =>
        Math.abs(point.x - x) < Math.abs(chart.points[nearest]!.x - x) ? index : nearest,
      0,
    );

  // Which node the pointer is holding. Null between drags: the press picks the
  // node, and every move until release belongs to that one, so a steep drag
  // past a neighbour cannot hand the drag over mid-gesture.
  const [dragBand, setDragBand] = useState<number | null>(null);
  // The band the pointer is over while it is not holding anything, so a node
  // grows before it is grabbed rather than only once it has been.
  const [hoverBand, setHoverBand] = useState<number | null>(null);
  // Held so a release outside the chart can still be told from a stale one.
  const draggingRef = useRef(false);

  const handleCurveDown = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    const point = pointFromEvent(event);
    if (!point) return;
    const index = bandFromX(point.x);
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // jsdom and some synthetic events have no active pointer to capture
    }
    draggingRef.current = true;
    setDragBand(index);
    setHoverBand(index);
    setBandGain(index, gainFromY(point.y));
  };

  const handleCurveMove = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    const point = pointFromEvent(event);
    if (!point) return;
    if (!draggingRef.current) {
      setHoverBand(bandFromX(point.x));
      return;
    }
    if (dragBand === null) return;
    setBandGain(dragBand, gainFromY(point.y));
  };

  const endCurveDrag = () => {
    draggingRef.current = false;
    setDragBand(null);
  };

  const reset = () => {
    clearPreset();
    applyGains(Array.from({ length: bandCount }, () => 0));
  };

  const showPresets = !hidePresets && presets.length > 0;

  return (
    <div
      className={cx(styles.eq, className)}
      data-size={size}
      data-disabled={disabled || undefined}
      role="group"
      aria-label={text.equalizer}
      style={{ '--eq-band-count': String(bandCount), ...style } as ComponentProps<'div'>['style']}
      {...rest}
    >
      {showPresets && (
        <div className={styles.header}>
          <div className={styles.presets}>
            <SegmentedControl
              size={size}
              aria-label={text.presets}
              value={selectedPreset}
              defaultValue={defaultPreset ?? presets[0]?.id}
              disabled={disabled}
              options={presets.map((option) => ({ value: option.id, label: option.label }))}
              onValueChange={(presetId) => {
                setSelectedPreset(presetId);
                onPresetChange?.(presetId);
                const picked = presets.find((candidate) => candidate.id === presetId);
                if (!picked) return;
                applyGains(normalizeGains(picked.gains, bandCount, min, max));
              }}
            />
          </div>
          <Button variant="ghost" size={size} disabled={disabled} onClick={reset}>
            {text.reset}
          </Button>
        </div>
      )}

      {bandCount > 0 && (
        <div className={styles.curve} aria-hidden="true">
          <div className={styles.stage}>
            {/* The chart is stretched to its box rather than fitted to it, so
                everything drawn in here is scaled by a different factor on each
                axis. That is right for a curve - it is a shape, and it should
                fill the block - and wrong for anything meant to read as a
                fixed form, which is why the nodes are not in here. */}
            <svg
              viewBox={`0 0 ${CURVE_WIDTH} ${CURVE_HEIGHT}`}
              preserveAspectRatio="none"
              className={styles.curveSvg}
            >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--glacier-accent-solid)" stopOpacity="0.42" />
                <stop offset="65%" stopColor="var(--glacier-accent-solid)" stopOpacity="0.14" />
                <stop offset="100%" stopColor="var(--glacier-accent-solid)" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            {chart.points.map((point, index) => (
              <line
                key={bands[index]?.id ?? String(index)}
                x1={point.x}
                y1={CURVE_PADDING_Y}
                x2={point.x}
                y2={CURVE_HEIGHT - CURVE_PADDING_Y}
                className={styles.curveGuide}
              />
            ))}
            <line
              x1={CURVE_PADDING_X}
              y1={chart.zeroY}
              x2={CURVE_WIDTH - CURVE_PADDING_X}
              y2={chart.zeroY}
              className={styles.curveZero}
            />
            <path d={chart.areaPath} fill={`url(#${gradientId})`} className={styles.curveArea} />
            <path data-testid="eq-curve" d={chart.linePath} className={styles.curveLine} />
            </svg>

            {/* The nodes sit over the chart rather than inside it: laid out in
                percentages they land on the same points the curve does, but
                they are drawn in the page's own units, so a node is round at
                every width the block is ever given. This layer is also the drag
                surface - it covers the chart exactly, and a press anywhere on
                it takes the band it lands over. */}
            <div
              className={styles.nodes}
              data-testid="eq-curve-surface"
              data-dragging={dragBand !== null || undefined}
              onPointerDown={handleCurveDown}
              onPointerMove={handleCurveMove}
              onPointerUp={endCurveDrag}
              onPointerCancel={endCurveDrag}
              onPointerLeave={() => {
                if (!draggingRef.current) setHoverBand(null);
              }}
            >
              {chart.points.map((point, index) => {
                const held = dragBand === index;
                return (
                  <span
                    key={bands[index]?.id ?? `dot-${index}`}
                    className={styles.curveNode}
                    data-active={held || hoverBand === index || undefined}
                    data-held={held || undefined}
                    data-testid={`eq-curve-node-${index}`}
                    style={{
                      left: `${(point.x / CURVE_WIDTH) * 100}%`,
                      top: `${(point.y / CURVE_HEIGHT) * 100}%`,
                    }}
                  >
                    <span className={styles.curveDot} />
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className={styles.bands}>
        {bands.map((band, index) => {
          const gain = gains[index] ?? 0;
          return (
            <div key={band.id} className={styles.band}>
              <Text className={styles.gain} size="xs" tone={gain === 0 ? 'subtle' : 'muted'} mono>
                {formatGain(gain, text.gainUnit)}
              </Text>
              <Slider
                className={styles.slider}
                orientation="vertical"
                min={min}
                max={max}
                step={step}
                value={gain}
                disabled={disabled}
                aria-label={`${band.label} ${text.band}`}
                aria-valuetext={formatGain(gain, text.gainUnit)}
                onValueChange={(next) => setBandGain(index, clamp(next, min, max))}
              />
              <Text className={styles.freq} size="xs" tone="subtle">
                {band.label}
              </Text>
            </div>
          );
        })}
      </div>
    </div>
  );
}
