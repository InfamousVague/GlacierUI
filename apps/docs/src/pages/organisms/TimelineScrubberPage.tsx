import { Heading, Text, TextTone, Size, Pill, useT } from '@glacier/react';
import { useEffect, useRef, useState } from 'react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { type PlatformKit } from '../../platforms.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

/** A deterministic activity silhouette so every reload draws the same docs. */
const ACTIVITY = Array.from({ length: 120 }, (_, i) => {
  const calm = 0.18 + 0.1 * Math.sin(i / 9);
  const burst = i > 40 && i < 52 ? 0.55 : i > 88 && i < 96 ? 0.4 : 0;
  return Math.min(calm + burst + 0.06 * Math.sin(i * 2.7), 1);
});

const WINDOW_MS = 15 * 60 * 1000;
const DOC_END = Date.UTC(2026, 6, 11, 14, 30, 0);
const DOC_START = DOC_END - WINDOW_MS;

function buildMarkers(t: ReturnType<typeof useT>) {
  return [
    { time: DOC_START + WINDOW_MS * 0.37, tone: 'danger' as const, label: t(m.scrubMarker1) },
    { time: DOC_START + WINDOW_MS * 0.43, tone: 'warning' as const, label: t(m.scrubMarker2) },
    { time: DOC_START + WINDOW_MS * 0.75, tone: 'accent' as const, label: t(m.scrubMarker3) },
  ];
}

function ScrubberDemo({ K }: { K: PlatformKit }) {
  const t = useT();
  const [value, setValue] = useState<number | undefined>(undefined);
  return (
    <div style={{ display: 'grid', gap: 'var(--glacier-space-3)', width: '100%' }}>
      <K.TimelineScrubber
        start={DOC_START}
        end={DOC_END}
        value={value}
        onChange={(t) => setValue(t ?? undefined)}
        activity={ACTIVITY}
        markers={buildMarkers(t)}
        aria-label={t(m.scrubAriaRecorded)}
      />
      <Text size={Size.XSmall} tone={TextTone.Muted}>
        {t(m.scrubInspecting)} {value === undefined ? t(m.scrubLive) : new Date(value).toLocaleTimeString()}
      </Text>
    </div>
  );
}

function LiveDemo({ K }: { K: PlatformKit }) {
  const t = useT();
  const [now, setNow] = useState(() => Date.now());
  const [value, setValue] = useState<number | undefined>(undefined);
  const activityRef = useRef<number[]>(Array.from({ length: 90 }, (_, i) => 0.25 + 0.15 * Math.sin(i / 7)));
  useEffect(() => {
    const id = setInterval(() => {
      setNow(Date.now());
      const a = activityRef.current;
      activityRef.current = [...a.slice(1), Math.min(Math.max((a[a.length - 1] ?? 0.25) + (Math.sin(Date.now() / 3000) * 0.08), 0.05), 1)];
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <K.TimelineScrubber
      start={now - 90_000}
      end={now}
      value={value}
      onChange={(t) => setValue(t ?? undefined)}
      activity={activityRef.current}
      size="sm"
      aria-label={t(m.scrubAriaLast90)}
    />
  );
}

export function TimelineScrubberPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.scrubName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(m.scrubLede)}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.anatomyIntro)}</Text>
      <ComponentBlueprint specId="timeline-scrubber" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.scrubEx1Title)}
        description={t(m.scrubEx1Desc)}
        component="TimelineScrubber"
        render={(K) => <ScrubberDemo K={K} />}
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
      />

      <Example
        title={t(m.scrubEx2Title)}
        description={t(m.scrubEx2ButtonlessDesc)}
        component="TimelineScrubber"
        render={(K) => <LiveDemo K={K} />}
        code={`<TimelineScrubber
  start={now - 90_000}
  end={now}
  value={value}
  onChange={(t) => setValue(t ?? undefined)}
  activity={recentLoad}
  size="sm"
  aria-label="Last 90 seconds"
/>`}
      />

      <Example
        title={t(m.exGlass)}
        description={t(m.scrubEx3ButtonlessDesc)}
        component="TimelineScrubber"
        render={(K) => (
          <div
            style={{
              width: '100%',
              padding: 'var(--glacier-space-5)',
              borderRadius: 'var(--glacier-radius-lg)',
              background: 'linear-gradient(120deg, var(--glacier-accent-soft), var(--glacier-purple-4), var(--glacier-teal-4))',
            }}
          >
            <K.TimelineScrubber start={DOC_START} end={DOC_END} activity={ACTIVITY} markers={buildMarkers(t)} glass aria-label={t(m.scrubAriaRecordedGlass)} />
          </div>
        )}
        code={`<TimelineScrubber start={start} end={end} activity={activity} glass aria-label="Recorded activity" />`}
      />

      <Example
        title={t(m.exSkeleton)}
        description={t(m.scrubEx4ButtonlessDesc)}
        component="TimelineScrubber"
        render={(K) => <K.TimelineScrubber start={0} end={1} skeleton aria-label={t(m.scrubAriaLoading)} />}
        code={`<TimelineScrubber start={0} end={1} skeleton aria-label="Recorded activity" />`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'start', type: 'number', description: t(m.scrubPropStart) },
          { name: 'end', type: 'number', description: t(m.scrubPropEnd) },
          { name: 'value', type: 'number', description: t(m.scrubPropValue) },
          { name: 'onChange', type: '(time: number | null) => void', description: t(m.scrubPropOnChange) },
          { name: 'activity', type: 'number[]', description: t(m.scrubPropActivity) },
          { name: 'markers', type: '{ time, tone?, label? }[]', description: t(m.scrubPropMarkers) },
          { name: 'step', type: 'number', default: '1000', description: t(m.scrubPropStep) },
          { name: 'formatTime', type: '(time: number) => string', description: t(m.scrubPropFormatTime) },
          { name: 'size', type: "'sm' | 'md'", default: "'md'", description: t(m.scrubPropSize) },
          { name: 'glass', type: 'boolean', default: 'false', description: t(m.scrubPropGlassTrack) },
          { name: 'disabled', type: 'boolean', default: 'false', description: t(m.scrubPropDisabled) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(m.scrubPropSkeleton) },
          { name: 'aria-label', type: 'string', description: t(m.scrubPropAriaLabel) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.scrubA11y1Buttonless))}</li>
        <li>{prose(t(m.scrubA11y2))}</li>
        <li>{prose(t(m.scrubA11y3))}</li>
        <li>{prose(t(m.scrubA11y5))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.scrubUse1))}</li>
        <li>
          {t(m.scrubUse2a)} <Pill size={Size.Small} tone="danger">{t(m.timelinescrubberDanger)}</Pill> {t(m.scrubUse2b)}{' '}
          <Pill size={Size.Small} tone="warning">{t(m.timelinescrubberWarning)}</Pill> {t(m.scrubUse2c)}
        </li>
        <li>{prose(t(m.scrubUse3))}</li>
        <li>{prose(t(m.scrubUse4))}</li>
      </ul>
    </>
  );
}
