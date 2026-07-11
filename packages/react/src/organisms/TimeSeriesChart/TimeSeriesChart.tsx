import { chartSeriesTones, timeSeriesChartShapes } from '@glacier/spec';
import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';
import { useEffect, useMemo, useRef, useState, type ComponentProps } from 'react';
import { cx } from '../../internal/cx.ts';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import styles from './TimeSeriesChart.module.css';

// Derived from the spec so the unions cannot drift.
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

export interface TimeSeriesChartProps extends ComponentProps<'div'> {
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
  /** Accessible name describing what the chart plots. */
  'aria-label': string;
}

/** The token pair each series tone paints with: [ink, soft fill]. */
const TONE_TOKENS: Record<ChartSeriesTone, [string, string]> = {
  accent: ['--glacier-accent-solid', '--glacier-accent-soft'],
  blue: ['--glacier-blue-9', '--glacier-blue-4'],
  amber: ['--glacier-amber-9', '--glacier-amber-4'],
  purple: ['--glacier-purple-9', '--glacier-purple-4'],
  teal: ['--glacier-teal-9', '--glacier-teal-4'],
  red: ['--glacier-red-9', '--glacier-red-4'],
  green: ['--glacier-green-9', '--glacier-green-4'],
  gray: ['--glacier-gray-9', '--glacier-gray-4'],
};

/**
 * uPlot needs a real 2d canvas; jsdom (and some headless embedders) return
 * null from getContext, and uPlot's deferred draw then crashes outside any
 * try/catch. Probe once and cache, so unsupported hosts keep the shell.
 */
let canvas2d: boolean | undefined;
function hasCanvas2d(): boolean {
  if (canvas2d === undefined) {
    try {
      canvas2d = document.createElement('canvas').getContext('2d') != null;
    } catch {
      canvas2d = false;
    }
  }
  return canvas2d;
}

const defaultFormatValue = (value: number) =>
  Math.abs(value) >= 1000 ? Intl.NumberFormat(undefined, { notation: 'compact' }).format(value) : String(Math.round(value * 10) / 10);

const defaultFormatTime = (time: number) =>
  new Date(time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

/** Resolve the theme colors the canvas needs from the CSS custom properties. */
function resolveTheme(el: HTMLElement) {
  const cs = getComputedStyle(el);
  const read = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
  return {
    grid: read('--glacier-border', '#e5e5e5'),
    axis: read('--glacier-text-muted', '#8a8a8a'),
    font: `11px ${cs.fontFamily || 'sans-serif'}`,
    tone: (tone: ChartSeriesTone): [string, string] => [
      read(TONE_TOKENS[tone][0], '#4a6da7'),
      read(TONE_TOKENS[tone][1], 'rgba(74,109,167,0.2)'),
    ],
  };
}

/**
 * A streaming time-series plot for telemetry: one shared time axis, a handful
 * of series as thin lines or soft areas, a crosshair with a value readout on
 * hover, and a legend that never repaints survivors when series toggle.
 * Canvas-rendered via uPlot, so a one-second feed stays cheap. Series colors
 * follow the fixed categorical order from the spec (never cycled, never
 * re-ranked); pin `max` (e.g. 100 for percentages) so frames share one scale.
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
  className,
  'aria-label': ariaLabel,
  ...rest
}: TimeSeriesChartProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<uPlot | null>(null);
  const [cursorIdx, setCursorIdx] = useState<number | null>(null);
  const [hidden, setHidden] = useState<Set<string>>(() => new Set());
  const [themeEpoch, setThemeEpoch] = useState(0);
  const [tonePool, setTonePool] = useState<readonly ChartSeriesTone[]>(chartSeriesTones);

  // The accent is itself one of the ramps (a blue accent resolves to the blue
  // ramp), so the positional default would hand two adjacent series the same
  // ink. Resolve the actual colors once mounted and drop the colliding ramp
  // from the default pool; explicit tones always win.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const cs = getComputedStyle(root);
    const ink = (tone: ChartSeriesTone) => cs.getPropertyValue(TONE_TOKENS[tone][0]).trim();
    const accentInk = ink('accent');
    if (!accentInk) return;
    setTonePool(chartSeriesTones.filter((tone) => tone === 'accent' || ink(tone) !== accentInk));
  }, [themeEpoch]);

  const tones = useMemo(
    () => series.map((s, i) => s.tone ?? tonePool[i % tonePool.length]),
    [series, tonePool],
  );

  // uPlot wants aligned arrays: [x, ...ys], x in seconds.
  const data = useMemo(
    () => [times.map((t) => t / 1000), ...series.map((s) => s.values)] as uPlot.AlignedData,
    [times, series],
  );

  // Re-theme when the document theme flips (data-theme / class on the root).
  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => setThemeEpoch((e) => e + 1));
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme', 'class', 'style'] });
    return () => observer.disconnect();
  }, []);

  const structureKey = useMemo(
    () => JSON.stringify({ ids: series.map((s) => s.id), tones, shape, min, max, themeEpoch }),
    [series, tones, shape, min, max, themeEpoch],
  );

  // Build (and rebuild on structural change); jsdom has no canvas 2d context,
  // so instantiation failures degrade to the empty shell instead of throwing.
  useEffect(() => {
    const host = hostRef.current;
    if (!host || times.length === 0 || !hasCanvas2d()) return;
    const theme = resolveTheme(host);

    let plot: uPlot;
    try {
      plot = new uPlot(
        {
          width: host.clientWidth || 300,
          height: host.clientHeight || 200,
          padding: [8, 8, 0, 0],
          legend: { show: false },
          cursor: {
            y: false,
            points: { size: 6 },
          },
          scales: {
            x: { time: true },
            y: {
              range: (_u, dataMin, dataMax) => [min ?? 0, max ?? Math.max(dataMax ?? 1, 1)],
            },
          },
          axes: [
            {
              stroke: theme.axis,
              grid: { show: false },
              ticks: { show: false },
              font: theme.font,
              // sparse labels: never let timestamps run into each other
              space: 88,
              values: (_u, splits) => splits.map((s) => formatTime(s * 1000)),
            },
            {
              stroke: theme.axis,
              grid: { stroke: theme.grid, width: 1 },
              ticks: { show: false },
              font: theme.font,
              size: 44,
              values: (_u, splits) => splits.map((s) => formatValue(s)),
            },
          ],
          series: [
            {},
            ...series.map((s, i) => {
              const [ink, soft] = theme.tone(tones[i]);
              return {
                label: s.label,
                stroke: ink,
                width: 2,
                fill: shape === 'area' ? soft : undefined,
                points: { show: false },
                show: !hidden.has(s.id),
              };
            }),
          ],
          hooks: {
            setCursor: [
              (u) => {
                const idx = u.cursor.idx;
                setCursorIdx(typeof idx === 'number' ? idx : null);
              },
            ],
          },
        },
        data,
        host,
      );
    } catch {
      return; // no canvas (jsdom): keep the shell, skip the plot
    }

    plotRef.current = plot;
    const resize = new ResizeObserver(() => {
      plot.setSize({ width: host.clientWidth, height: host.clientHeight });
    });
    resize.observe(host);
    return () => {
      resize.disconnect();
      plotRef.current = null;
      plot.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- structureKey covers series/tones/shape/min/max/theme
  }, [structureKey, times.length === 0]);

  // Streaming path: new samples slide in without rebuilding the plot.
  useEffect(() => {
    plotRef.current?.setData(data);
  }, [data]);

  const toggle = (id: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    const index = series.findIndex((s) => s.id === id);
    if (index >= 0) plotRef.current?.setSeries(index + 1, { show: hidden.has(id) });
  };

  if (skeleton) {
    return (
      <div className={cx(styles.root, className)} {...rest}>
        <Skeleton height={height} width="100%" radius="var(--glacier-radius-md)" />
      </div>
    );
  }

  const readoutIdx = cursorIdx !== null && cursorIdx < times.length ? cursorIdx : null;

  return (
    <div ref={rootRef} className={cx(styles.root, className)} {...rest}>
      <div className={styles.header}>
        <div className={styles.readout} data-active={readoutIdx !== null || undefined} aria-hidden="true">
          {readoutIdx !== null && (
            <>
              <span className={styles.readoutTime}>{formatTime(times[readoutIdx])}</span>
              {series.map(
                (s, i) =>
                  !hidden.has(s.id) && (
                    <span key={s.id} className={styles.readoutEntry}>
                      <span className={styles.swatch} data-tone={tones[i]} />
                      {s.label} <strong>{s.values[readoutIdx] == null ? '–' : formatValue(s.values[readoutIdx]!)}</strong>
                    </span>
                  ),
              )}
            </>
          )}
        </div>
        {showLegend && series.length >= 2 && (
          <div className={styles.legend}>
            {series.map((s, i) => (
              <button
                key={s.id}
                type="button"
                className={styles.legendEntry}
                aria-pressed={!hidden.has(s.id)}
                data-hidden={hidden.has(s.id) || undefined}
                onClick={() => toggle(s.id)}
              >
                <span className={styles.swatch} data-tone={tones[i]} />
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div role="img" aria-label={ariaLabel} className={cx(styles.plot, glass && styles.glass)} style={{ height }}>
        {times.length === 0 ? (
          <div className={styles.empty}>{emptyLabel}</div>
        ) : (
          <div ref={hostRef} className={styles.host} />
        )}
      </div>
    </div>
  );
}
