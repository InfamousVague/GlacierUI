import { StatusDot, TimelineScrubber } from '@glacier/react';
import { useMemo } from 'react';
import { fmtClock } from '../core/format.ts';
import { useTelemetry } from '../core/telemetry.tsx';

/** How many activity points the scrubber backdrop carries. */
const ACTIVITY_POINTS = 160;

/**
 * The recorder bar: the app-wide flight recorder pinned under every view.
 * Scrubbing repaints the entire surface to that moment; the Live button (or
 * the End key) returns to now.
 */
export function ScrubberBar() {
  const { sensor, scrub, setScrub, live } = useTelemetry();
  const { start, end } = sensor.window();
  const ring = sensor.samples();
  const newest = ring[ring.length - 1]?.time;

  const activity = useMemo(() => {
    if (ring.length < 2) return undefined;
    return Array.from({ length: ACTIVITY_POINTS }, (_, i) => {
      const s = ring[Math.round((i / (ACTIVITY_POINTS - 1)) * (ring.length - 1))];
      return (s.cpuUser + s.cpuSystem) / 100;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the ring mutates in place; the newest timestamp is its version
  }, [sensor, newest]);

  const markers = useMemo(() => sensor.markers().map((m) => ({ time: m.time, tone: m.tone, label: m.label })), [sensor, newest]);

  const minutes = Math.round((end - start) / 60_000);

  return (
    <div className="pfRecorder">
      <div className="pfRecorderMeta">
        <StatusDot tone={live ? 'danger' : 'neutral'} aria-label={live ? 'Recording' : 'Paused on history'} />
        <span>
          {live ? 'REC' : fmtClock(scrub!)} · {minutes} min window
        </span>
      </div>
      <div className="pfRecorderScrubber">
        <TimelineScrubber
          start={start}
          end={end}
          value={scrub ?? undefined}
          onChange={setScrub}
          activity={activity}
          markers={markers}
          formatTime={fmtClock}
          size="sm"
          aria-label="Recorded system activity"
        />
      </div>
    </div>
  );
}
