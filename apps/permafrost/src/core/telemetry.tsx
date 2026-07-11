import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { MockSensor } from './mock.ts';
import type { Sensor, SystemSample } from './types.ts';

/**
 * One clock for the whole app. `current` is the sample every surface renders:
 * the newest one while live, or the recorded one under the scrubber. The
 * scrubber is the time authority - views never read the ring directly except
 * to build history windows that end at `current`.
 */
interface Telemetry {
  sensor: Sensor;
  /** The sample the whole UI renders right now. */
  current: SystemSample;
  /** Scrubbed time, or null while riding the live edge. */
  scrub: number | null;
  setScrub: (time: number | null) => void;
  live: boolean;
  /** The last `n` samples ending at `current` (shorter near the window start). */
  trail: (n: number) => readonly SystemSample[];
}

const TelemetryContext = createContext<Telemetry | null>(null);

export function TelemetryProvider({ children }: { children: ReactNode }) {
  // A ref, not a memo: StrictMode double-invokes render, and a memo would
  // build two sensors (each with a live timer). The ref mutation survives the
  // double render, so exactly one engine exists per mount.
  const sensorRef = useRef<MockSensor | null>(null);
  if (!sensorRef.current) sensorRef.current = new MockSensor();
  const sensor = sensorRef.current;
  const [, bump] = useReducer((x: number) => x + 1, 0);
  const [scrub, setScrubState] = useState<number | null>(null);

  useEffect(() => {
    sensor.start();
    const unsubscribe = sensor.subscribe(bump);
    return () => {
      unsubscribe();
      sensor.stop();
    };
  }, [sensor]);

  const setScrub = useCallback((time: number | null) => setScrubState(time), []);

  const current = scrub === null ? sensor.latest() : sensor.at(scrub);

  const trail = useCallback(
    (n: number) => {
      const ring = sensor.samples();
      const end = ring.indexOf(current) + 1 || ring.length;
      return ring.slice(Math.max(end - n, 0), end);
    },
    [sensor, current],
  );

  const value = useMemo<Telemetry>(
    () => ({ sensor, current, scrub, setScrub, live: scrub === null, trail }),
    [sensor, current, scrub, setScrub, trail],
  );

  return <TelemetryContext.Provider value={value}>{children}</TelemetryContext.Provider>;
}

export function useTelemetry(): Telemetry {
  const t = useContext(TelemetryContext);
  if (!t) throw new Error('useTelemetry outside TelemetryProvider');
  return t;
}
