import type { ComponentSpec } from '../schema.ts';
import { token } from '../vocab.ts';

/**
 * The fixed categorical order for chart series inks, exported so the React kit
 * derives its union from here. Series take colors in this order (never cycled,
 * never re-ranked when a series is hidden): the accent leads, then hues chosen
 * for maximum adjacent-pair separation on the kit ramps. `gray` is reserved
 * for "other" roll-ups.
 */
export const chartSeriesTones = ['accent', 'blue', 'amber', 'purple', 'teal', 'red', 'green', 'gray'] as const;

/** Chart mark shapes, exported so the React kit derives its union from here. */
export const timeSeriesChartShapes = ['line', 'area'] as const;

export const timeSeriesChartSpec: ComponentSpec = {
  name: 'TimeSeriesChart',
  id: 'time-series-chart',
  category: 'organism',
  status: 'draft',
  summary:
    'A streaming time-series plot for telemetry: one shared time axis, up to a handful of series drawn as thin lines or soft areas, a crosshair with a value readout on hover, and a legend that never repaints survivors when series toggle. Canvas-rendered (uPlot) so a one-second feed stays cheap.',
  element: 'div',
  anatomy: [
    { name: 'plot', description: 'The canvas plot region: grid, axes, and series marks.', required: true },
    { name: 'grid', description: 'Recessive horizontal rules on hairline ink; vertical rules only at major time ticks.' },
    { name: 'axis-x', description: 'Sparse time labels along the bottom edge, in the muted text ink.' },
    { name: 'axis-y', description: 'Value labels on the leading edge, formatted by formatValue.' },
    { name: 'series', description: 'One mark per series: a 2px line, optionally over a soft fill.', required: true },
    { name: 'cursor', description: 'The hover crosshair: a vertical hairline snapped to the nearest sample.' },
    { name: 'readout', description: 'The hover readout row above the plot: the cursor time and each series dot, label, and value.' },
    { name: 'legend', description: 'The series key, shown for two or more series; clicking an entry toggles that series.' },
    { name: 'empty', description: 'The placeholder message when there are no samples yet.' },
  ],
  props: [
    {
      name: 'times',
      type: 'array',
      required: true,
      item: { type: 'number', description: 'Epoch milliseconds for one sample column.' },
      description: 'The shared time axis, oldest first. Every series aligns to these timestamps.',
    },
    {
      name: 'series',
      type: 'array',
      required: true,
      item: {
        type: 'object',
        description: 'One plotted series.',
        fields: [
          { name: 'id', type: 'string', required: true, description: 'Stable identity; keeps color and toggle state across data updates.' },
          { name: 'label', type: 'string', required: true, description: 'Name shown in the legend and readout.' },
          { name: 'values', type: 'array', required: true, item: { type: 'number', description: 'One sample; align to times, null-safe for gaps.' }, description: 'The samples, aligned index-for-index with times.' },
          { name: 'tone', type: 'enum', values: chartSeriesTones, description: 'Ink assignment. Defaults to the fixed categorical order by position.' },
        ],
      },
      description: 'The plotted series. Keep it to a handful; roll the tail into an "other" series in gray.',
    },
    { name: 'shape', type: 'enum', values: timeSeriesChartShapes, default: 'line', description: 'Thin lines, or lines over a translucent soft fill to ground a single dominant series.' },
    { name: 'min', type: 'number', description: 'Fixed lower bound of the value axis. Defaults to 0.' },
    { name: 'max', type: 'number', description: 'Fixed upper bound of the value axis. Defaults to the data maximum; pin it (e.g. 100 for percentages) so successive frames share one scale.' },
    { name: 'formatValue', type: 'handler', description: 'Formats a value for the y axis and the readout, e.g. bytes-per-second or percent. Defaults to a compact number.' },
    { name: 'formatTime', type: 'handler', description: 'Formats a timestamp for the x axis and the readout. Defaults to a locale time string.' },
    { name: 'showLegend', type: 'boolean', default: true, description: 'Shows the legend when two or more series are plotted. A single series needs no legend; the surrounding title names it.' },
    { name: 'height', type: 'string', default: '12rem', description: 'Plot height as a CSS length; the width is fluid and follows the container.' },
    { name: 'emptyLabel', type: 'string', default: 'No samples yet', description: 'Message shown while times is empty.' },
    { name: 'skeleton', type: 'boolean', default: false, description: 'Renders a placeholder with the exact geometry.' },
    { name: 'aria-label', type: 'string', required: true, description: 'Accessible name describing what the chart plots, e.g. "CPU usage, last 5 minutes".' },
  ],
  tones: [
    { name: 'accent', description: 'The lead series: the brand accent.', paint: { text: token('accent-solid') }, tokens: { fill: token('accent-soft') } },
    { name: 'blue', description: 'Second series.', paint: { text: token('blue-9') }, tokens: { fill: token('blue-4') } },
    { name: 'amber', description: 'Third series.', paint: { text: token('amber-9') }, tokens: { fill: token('amber-4') } },
    { name: 'purple', description: 'Fourth series.', paint: { text: token('purple-9') }, tokens: { fill: token('purple-4') } },
    { name: 'teal', description: 'Fifth series.', paint: { text: token('teal-9') }, tokens: { fill: token('teal-4') } },
    { name: 'red', description: 'Sixth series. Not a status color here; reserve status meaning for callouts outside the plot.', paint: { text: token('red-9') }, tokens: { fill: token('red-4') } },
    { name: 'green', description: 'Seventh series.', paint: { text: token('green-9') }, tokens: { fill: token('green-4') } },
    { name: 'gray', description: 'The "other" roll-up.', paint: { text: token('gray-9') }, tokens: { fill: token('gray-4') } },
  ],
  defaults: { shape: 'line', showLegend: true, height: '12rem', emptyLabel: 'No samples yet', skeleton: false },
  dimensions: {
    strokeWidth: '2px',
    gridWidth: '1px',
    gap: token('space-3'),
    radius: token('radius-md'),
    axisFontSize: token('font-size-xs'),
    legendFontSize: token('font-size-xs'),
    swatchDiameter: '0.5rem',
  },
  states: [
    { name: 'default', description: 'Grid on the hairline ink, axes in muted text, series in their assigned tones.' },
    { name: 'hover', description: 'The crosshair hairline appears at the cursor and the readout row fills with the nearest sample values.', tokens: { crosshair: token('border-strong') } },
    { name: 'series-hidden', description: 'A toggled-off series dims its legend entry; remaining series keep their inks (color follows the entity, never the rank).', tokens: { 'legend-text': token('text-disabled') } },
    { name: 'empty', description: 'The plot keeps its box and shows emptyLabel in muted text.', paint: { text: token('text-muted') } },
    { name: 'skeleton', description: 'A pulse placeholder with the exact plot geometry.' },
  ],
  transition: { duration: token('duration-fast'), ease: token('ease-out') },
  tokens: [
    'accent-solid', 'accent-soft',
    'blue-9', 'blue-4', 'amber-9', 'amber-4', 'purple-9', 'purple-4',
    'teal-9', 'teal-4', 'red-9', 'red-4', 'green-9', 'green-4', 'gray-9', 'gray-4',
    'border', 'border-strong', 'hairline', 'text-muted', 'text-subtle', 'text-disabled',
    'surface-raised', 'radius-md', 'space-3', 'font-size-xs',
    'duration-fast', 'ease-out',
  ],
  a11y: {
    role: 'img',
    focusable: false,
    notes: [
      'The plot is a single img-role graphic named by the required aria-label; the hover readout is a visual affordance, not the accessible surface.',
      'Values must be reachable without the pointer: pair the chart with stat tiles or a table view carrying the current figures.',
      'Series identity never rides on color alone: the legend and readout name every series, and the readout dot pairs the ink with its label.',
      'Legend toggles are real buttons with aria-pressed; hiding a series never recolors the others.',
    ],
  },
  motion: {
    description: 'Streaming appends redraw without tweening (a moving chart is its own motion); the crosshair and legend hover ease on the fast token. Reduced motion changes nothing because nothing animates.',
    transition: { speed: 'fast', ease: 'out' },
  },
};
