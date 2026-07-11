import { Heading, Text, TextTone, TimelineScrubber, Size, Pill } from '@glacier/react';
import { useEffect, useRef, useState } from 'react';
import { Example, PropsTable } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';

/** A deterministic activity silhouette so every reload draws the same docs. */
const ACTIVITY = Array.from({ length: 120 }, (_, i) => {
  const calm = 0.18 + 0.1 * Math.sin(i / 9);
  const burst = i > 40 && i < 52 ? 0.55 : i > 88 && i < 96 ? 0.4 : 0;
  return Math.min(calm + burst + 0.06 * Math.sin(i * 2.7), 1);
});

const WINDOW_MS = 15 * 60 * 1000;
const DOC_END = Date.UTC(2026, 6, 11, 14, 30, 0);
const DOC_START = DOC_END - WINDOW_MS;

const MARKERS = [
  { time: DOC_START + WINDOW_MS * 0.37, tone: 'danger' as const, label: 'CPU spike: WindowServer 340%' },
  { time: DOC_START + WINDOW_MS * 0.43, tone: 'warning' as const, label: 'Memory pressure turned yellow' },
  { time: DOC_START + WINDOW_MS * 0.75, tone: 'accent' as const, label: 'Build started' },
];

function ScrubberDemo() {
  const [value, setValue] = useState<number | undefined>(undefined);
  return (
    <div style={{ display: 'grid', gap: 'var(--glacier-space-3)', width: '100%' }}>
      <TimelineScrubber
        start={DOC_START}
        end={DOC_END}
        value={value}
        onChange={(t) => setValue(t ?? undefined)}
        activity={ACTIVITY}
        markers={MARKERS}
        aria-label="Recorded activity"
      />
      <Text size={Size.XSmall} tone={TextTone.Muted}>
        Inspecting: {value === undefined ? 'live' : new Date(value).toLocaleTimeString()}
      </Text>
    </div>
  );
}

function LiveDemo() {
  const [now, setNow] = useState(() => Date.now());
  const [value, setValue] = useState<number | undefined>(undefined);
  const activityRef = useRef<number[]>(Array.from({ length: 90 }, (_, i) => 0.25 + 0.15 * Math.sin(i / 7)));
  useEffect(() => {
    const id = setInterval(() => {
      setNow(Date.now());
      const a = activityRef.current;
      activityRef.current = [...a.slice(1), Math.min(Math.max(a[a.length - 1] + (Math.sin(Date.now() / 3000) * 0.08), 0.05), 1)];
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <TimelineScrubber
      start={now - 90_000}
      end={now}
      value={value}
      onChange={(t) => setValue(t ?? undefined)}
      activity={activityRef.current}
      size="sm"
      aria-label="Last 90 seconds"
    />
  );
}

export function TimelineScrubberPage() {
  return (
    <>
      <Heading level={1}>Timeline Scrubber</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        A flight-recorder control: a horizontal band over a recorded time window with an activity
        backdrop, event markers, and a draggable playhead. Scrub to inspect any recorded moment, or
        pin the playhead to the live edge and let new time stream in. Built for monitoring
        surfaces where "what just happened?" matters as much as "what is happening?".
      </Text>

      <Heading level={2}>Anatomy</Heading>
      <Text tone={TextTone.Muted}>An inspection with the exact spec measurements labelled on the figure.</Text>
      <ComponentBlueprint specId="timeline-scrubber" />

      <Heading level={2}>Examples</Heading>

      <Example
        title="Scrubbing a recording"
        description="The activity silhouette shows where the interesting moments are; markers flag them precisely. Drag the playhead, click anywhere on the track, or use the arrow keys. The component is controlled: value is the inspected time, and onChange reports null when the user returns to live."
        code={`const [value, setValue] = useState<number | undefined>();

<TimelineScrubber
  start={windowStart}
  end={windowEnd}
  value={value}
  onChange={(t) => setValue(t ?? undefined)}
  activity={overallLoad}          // normalized 0-1 samples
  markers={[{ time: spikeAt, tone: 'danger', label: 'CPU spike' }]}
  aria-label="Recorded activity"
/>`}
      >
        <ScrubberDemo />
      </Example>

      <Example
        title="Live and compact"
        description="While live, the window advances every second and the playhead rides the trailing edge; the live button fills solid. Scrub back and it hollows, inviting the jump back. The sm size suits a status-bar placement."
        code={`<TimelineScrubber
  start={now - 90_000}
  end={now}
  value={value}
  onChange={(t) => setValue(t ?? undefined)}
  activity={recentLoad}
  size="sm"
  aria-label="Last 90 seconds"
/>`}
      >
        <LiveDemo />
      </Example>

      <Example
        title="Glass"
        description="glass swaps the sunken track and soft button for the frosted material - for scrubbers floating over content, like a video surface or a dashboard backdrop."
        code={`<TimelineScrubber start={start} end={end} activity={activity} glass aria-label="Recorded activity" />`}
      >
        <div
          style={{
            width: '100%',
            padding: 'var(--glacier-space-5)',
            borderRadius: 'var(--glacier-radius-lg)',
            background: 'linear-gradient(120deg, var(--glacier-accent-soft), var(--glacier-purple-4), var(--glacier-teal-4))',
          }}
        >
          <TimelineScrubber start={DOC_START} end={DOC_END} activity={ACTIVITY} markers={MARKERS} glass aria-label="Recorded activity, glass" />
        </div>
      </Example>

      <Example
        title="Skeleton"
        description="skeleton renders the exact track and button geometry while the recording loads."
        code={`<TimelineScrubber start={0} end={1} skeleton aria-label="Recorded activity" />`}
      >
        <TimelineScrubber start={0} end={1} skeleton aria-label="Recorded activity loading" />
      </Example>

      <Heading level={2}>Props</Heading>
      <PropsTable
        props={[
          { name: 'start', type: 'number', description: 'Required. Window start, epoch ms.' },
          { name: 'end', type: 'number', description: 'Required. Window end, epoch ms; advances while live.' },
          { name: 'value', type: 'number', description: 'The inspected time. Omit to pin to the live edge.' },
          { name: 'onChange', type: '(time: number | null) => void', description: 'Scrub reports; null means "back to live".' },
          { name: 'activity', type: 'number[]', description: 'Normalized 0-1 context series drawn as the track backdrop.' },
          { name: 'markers', type: '{ time, tone?, label? }[]', description: 'Flagged instants drawn as thin ticks.' },
          { name: 'step', type: 'number', default: '1000', description: 'Arrow-key step in ms; PageUp/Down move ten steps.' },
          { name: 'formatTime', type: '(time: number) => string', description: 'Formats the readout, ticks, and aria-valuetext.' },
          { name: 'liveLabel', type: 'string', default: "'Live'", description: 'Label for the live button.' },
          { name: 'size', type: "'sm' | 'md'", default: "'md'", description: 'Track height step; the handle adds its overhang above the track.' },
          { name: 'glass', type: 'boolean', default: 'false', description: 'Renders the track and live button on the frosted glass material.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Blocks scrubbing and dims the control.' },
          { name: 'skeleton', type: 'boolean', default: 'false', description: 'Renders a placeholder with the exact geometry.' },
          { name: 'aria-label', type: 'string', description: 'Required. Accessible name for the scrubber.' },
        ]}
      />

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>The playhead is a real <code>slider</code>: <code>aria-valuemin/max</code> are the window bounds, and <code>aria-valuetext</code> speaks the formatted time — or the live label when pinned.</li>
        <li>ArrowLeft/ArrowRight step, PageUp/PageDown leap, Home jumps to the window start, End returns to live. Stepping past the trailing edge also pins to live.</li>
        <li>Markers are decorative ticks with tooltips; surface the flagged events somewhere textual too (a list, a feed) for non-pointer users.</li>
        <li>The live button is a plain button reflecting its state with <code>aria-pressed</code>.</li>
        <li>Playhead motion respects reduced motion: glides become snaps.</li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>Feed <code>activity</code> a cheap aggregate (overall CPU, event density) — its job is to make anomalies findable before scrubbing, not to be precise.</li>
        <li>Reserve marker tones for severity: <Pill size={Size.Small} tone="danger">danger</Pill> for incidents, <Pill size={Size.Small} tone="warning">warning</Pill> for pressure, accent for lifecycle events.</li>
        <li>Scrubbing should repaint the whole surface to that moment (tables, charts, tiles) — the scrubber is the time authority, not a decoration.</li>
        <li>Keep the window bounded (minutes to hours). For long archives, page the window and let the scrubber work within it.</li>
      </ul>
    </>
  );
}
