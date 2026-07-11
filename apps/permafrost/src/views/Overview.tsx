import { ArrowDownUp, Cpu, Database, MemoryStick } from '@glacier/icons';
import { Meter, Sparkline, StatTile, TimeSeriesChart } from '@glacier/react';
import { useMemo } from 'react';
import { fmtBytes, fmtPct, fmtRate } from '../core/format.ts';
import { useTelemetry } from '../core/telemetry.tsx';

/** Main charts cover the last five minutes; tile sparklines the last two. */
const CHART_TICKS = 300;
const TILE_TICKS = 120;

export function Overview() {
  const { current, trail, sensor } = useTelemetry();
  const history = trail(CHART_TICKS);

  const chart = useMemo(() => {
    const times = history.map((s) => s.time);
    return {
      times,
      user: history.map((s) => s.cpuUser),
      system: history.map((s) => s.cpuSystem),
      netIn: history.map((s) => s.netIn),
      netOut: history.map((s) => s.netOut),
    };
  }, [history]);

  const tiles = useMemo(() => {
    const t = history.slice(-TILE_TICKS);
    return {
      cpu: t.map((s) => s.cpuUser + s.cpuSystem),
      mem: t.map((s) => s.memUsed),
      net: t.map((s) => s.netIn + s.netOut),
      disk: t.map((s) => s.diskRead + s.diskWrite),
    };
  }, [history]);

  const totalCpu = current.cpuUser + current.cpuSystem;
  const spark = (data: number[], label: string, max?: number, tone?: 'warning' | 'accent') => (
    <Sparkline data={data} min={0} max={max} tone={tone ?? 'accent'} size="sm" aria-label={label} style={{ width: '5.5rem' }} />
  );

  return (
    <>
      <div className="pfTiles">
        <StatTile
          icon={<Cpu size={18} />}
          value={fmtPct(totalCpu)}
          label="CPU"
          hint={spark(tiles.cpu, 'CPU, last two minutes', 100)}
        />
        <StatTile
          icon={<MemoryStick size={18} />}
          value={fmtBytes(current.memUsed)}
          label={`Memory of ${fmtBytes(sensor.machine.memTotal)}`}
          hint={spark(tiles.mem, 'Memory, last two minutes', sensor.machine.memTotal, current.memPressure > 0.78 ? 'warning' : 'accent')}
        />
        <StatTile
          icon={<ArrowDownUp size={18} />}
          value={fmtRate(current.netIn + current.netOut)}
          label="Network"
          hint={spark(tiles.net, 'Network, last two minutes')}
        />
        <StatTile
          icon={<Database size={18} />}
          value={fmtRate(current.diskRead + current.diskWrite)}
          label="Disk"
          hint={spark(tiles.disk, 'Disk, last two minutes')}
        />
      </div>

      <div className="pfCharts">
        <section className="pfPanel">
          <h2 className="pfPanelTitle">CPU · last 5 minutes</h2>
          <TimeSeriesChart
            times={chart.times}
            series={[
              { id: 'user', label: 'User', values: chart.user },
              { id: 'system', label: 'System', values: chart.system },
            ]}
            shape="area"
            max={100}
            formatValue={(v) => `${Math.round(v)}%`}
            height="11rem"
            aria-label="CPU usage, user and system, last five minutes"
          />
        </section>
        <section className="pfPanel">
          <h2 className="pfPanelTitle">Network · last 5 minutes</h2>
          <TimeSeriesChart
            times={chart.times}
            series={[
              { id: 'in', label: 'Received', values: chart.netIn },
              { id: 'out', label: 'Sent', values: chart.netOut },
            ]}
            formatValue={fmtRate}
            height="11rem"
            aria-label="Network throughput, last five minutes"
          />
        </section>
      </div>

      <section className="pfPanel">
        <h2 className="pfPanelTitle">Cores</h2>
        <div className="pfCores">
          {current.coreLoads.map((load, i) => (
            <div key={i} className="pfCore">
              <span>
                Core {i + 1} · <strong>{fmtPct(load)}</strong>
              </span>
              <Meter value={load} max={100} segments={12} size="sm" aria-label={`Core ${i + 1} load`} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
