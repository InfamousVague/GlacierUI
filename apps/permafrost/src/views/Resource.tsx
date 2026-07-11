import { StatTile, TimeSeriesChart, type TimeSeriesChartSeries } from '@glacier/react';
import { useMemo, useState } from 'react';
import { DetailPanel } from '../components/DetailPanel.tsx';
import { ProcessTable, type ResourceKey } from '../components/ProcessTable.tsx';
import { fmtBytes, fmtPct, fmtRate } from '../core/format.ts';
import { useTelemetry } from '../core/telemetry.tsx';
import type { SystemSample } from '../core/types.ts';

const CHART_TICKS = 300;

interface ResourceSpec {
  title: string;
  series: (h: readonly SystemSample[]) => TimeSeriesChartSeries[];
  shape?: 'line' | 'area';
  max?: (memTotal: number) => number | undefined;
  format: (v: number) => string;
  tiles: (s: SystemSample, memTotal: number) => { label: string; value: string }[];
}

const SPECS: Record<ResourceKey, ResourceSpec> = {
  cpu: {
    title: 'CPU · last 5 minutes',
    series: (h) => [
      { id: 'user', label: 'User', values: h.map((s) => s.cpuUser) },
      { id: 'system', label: 'System', values: h.map((s) => s.cpuSystem) },
    ],
    shape: 'area',
    max: () => 100,
    format: (v) => `${Math.round(v)}%`,
    tiles: (s) => [
      { label: 'User', value: fmtPct(s.cpuUser) },
      { label: 'System', value: fmtPct(s.cpuSystem) },
      { label: 'Idle', value: fmtPct(Math.max(100 - s.cpuUser - s.cpuSystem, 0)) },
    ],
  },
  memory: {
    title: 'Memory · last 5 minutes',
    series: (h) => [{ id: 'used', label: 'Used', values: h.map((s) => s.memUsed) }],
    shape: 'area',
    max: (memTotal) => memTotal,
    format: fmtBytes,
    tiles: (s, memTotal) => [
      { label: 'Used', value: fmtBytes(s.memUsed) },
      { label: 'Free', value: fmtBytes(Math.max(memTotal - s.memUsed, 0)) },
      { label: 'Pressure', value: fmtPct(s.memPressure * 100) },
      { label: 'Swap', value: fmtBytes(s.swapUsed) },
    ],
  },
  disk: {
    title: 'Disk · last 5 minutes',
    series: (h) => [
      { id: 'read', label: 'Read', values: h.map((s) => s.diskRead) },
      { id: 'write', label: 'Written', values: h.map((s) => s.diskWrite) },
    ],
    format: fmtRate,
    tiles: (s) => [
      { label: 'Read', value: fmtRate(s.diskRead) },
      { label: 'Written', value: fmtRate(s.diskWrite) },
    ],
  },
  network: {
    title: 'Network · last 5 minutes',
    series: (h) => [
      { id: 'in', label: 'Received', values: h.map((s) => s.netIn) },
      { id: 'out', label: 'Sent', values: h.map((s) => s.netOut) },
    ],
    format: fmtRate,
    tiles: (s) => [
      { label: 'Received', value: fmtRate(s.netIn) },
      { label: 'Sent', value: fmtRate(s.netOut) },
    ],
  },
};

export function Resource({ resource }: { resource: ResourceKey }) {
  const { current, trail, sensor } = useTelemetry();
  const [selected, setSelected] = useState<number | null>(null);
  const spec = SPECS[resource];
  const history = trail(CHART_TICKS);

  const times = useMemo(() => history.map((s) => s.time), [history]);
  const series = useMemo(() => spec.series(history), [spec, history]);

  return (
    <>
      <div className="pfTiles">
        {spec.tiles(current, sensor.machine.memTotal).map((tile) => (
          <StatTile key={tile.label} value={tile.value} label={tile.label} />
        ))}
      </div>

      <section className="pfPanel">
        <h2 className="pfPanelTitle">{spec.title}</h2>
        <TimeSeriesChart
          times={times}
          series={series}
          shape={spec.shape ?? 'line'}
          max={spec.max?.(sensor.machine.memTotal)}
          formatValue={spec.format}
          height="11rem"
          aria-label={spec.title}
        />
      </section>

      <div className="pfSplit" data-detail={selected !== null || undefined}>
        <ProcessTable resource={resource} selected={selected} onSelect={setSelected} />
        {selected !== null && <DetailPanel pid={selected} onClose={() => setSelected(null)} />}
      </div>
    </>
  );
}
