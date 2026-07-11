import {
  Avatar,
  Button,
  Heading,
  Pill,
  Size,
  Text,
  TextTone,
  Timeline,
  type TimelineItem,
} from '@glacier/react';
import { Example, PropsTable } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';

function RocketIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4.5 11.5 2 14m4-5L3.5 6.5C5 3 9 1.5 13.5 2.5 14.5 7 13 11 9.5 12.5L7 10Z" />
      <circle cx="10" cy="6" r="1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m3 8.5 3.5 3.5L13 4.5" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 2 1.5 13.5h13L8 2Zm0 4.5V9m0 2.5v.01" />
    </svg>
  );
}

const DEPLOY_FEED: TimelineItem[] = [
  {
    id: 1,
    title: 'Deployed v2.1.0 to production',
    tone: 'success',
    icon: <CheckIcon />,
    timestamp: '2h ago',
    description: 'Rolled out to all regions in 4 minutes.',
  },
  {
    id: 2,
    title: 'Canary released',
    tone: 'accent',
    icon: <RocketIcon />,
    timestamp: '3h ago',
    description: '5% of traffic routed to the new build.',
  },
  {
    id: 3,
    title: 'Error budget warning',
    tone: 'warning',
    icon: <AlertIcon />,
    timestamp: '5h ago',
    description: 'p99 latency crossed the alert threshold for 10 minutes, then recovered.',
  },
  {
    id: 4,
    title: 'Build #4127 queued',
    timestamp: 'yesterday',
  },
];

const COMMENT_THREAD: TimelineItem[] = [
  {
    id: 'c1',
    title: 'Ada Lovelace',
    actor: <Avatar size="sm" name="Ada Lovelace" />,
    timestamp: <time dateTime="2026-07-11T09:30">9:30</time>,
    description: 'The migration plan looks right, but stage the index build first.',
    tone: 'accent',
  },
  {
    id: 'c2',
    title: 'Grace Hopper',
    actor: <Avatar size="sm" name="Grace Hopper" />,
    timestamp: <time dateTime="2026-07-11T09:41">9:41</time>,
    description: 'Agreed. I split it into two migrations and re-ran the benchmark.',
    tone: 'accent',
  },
  {
    id: 'c3',
    title: 'Alan Turing',
    actor: <Avatar size="sm" name="Alan Turing" />,
    timestamp: <time dateTime="2026-07-11T10:02">10:02</time>,
    description: 'Benchmarks are flat. Shipping it.',
    tone: 'success',
  },
];

const RICH_FEED: TimelineItem[] = [
  {
    id: 'r1',
    title: 'Screenshot attached to the bug report',
    actor: <Avatar size="sm" name="Ada Lovelace" />,
    tone: 'info',
    timestamp: '10m ago',
    description: 'The overflow happens on narrow viewports only.',
    media: (
      <div
        style={{
          display: 'grid',
          placeItems: 'center',
          height: '6rem',
          maxWidth: '20rem',
          background: 'var(--glacier-accent-soft)',
          color: 'var(--glacier-accent-text)',
          fontSize: 'var(--glacier-font-size-sm)',
        }}
      >
        media preview
      </div>
    ),
    actions: (
      <>
        <Button size="sm" variant="soft">
          Reply
        </Button>
        <Button size="sm" variant="ghost">
          Assign
        </Button>
      </>
    ),
  },
  {
    id: 'r2',
    title: 'Issue labelled',
    tone: 'neutral',
    timestamp: '1h ago',
    actions: (
      <>
        <Pill size={Size.Small} tone="danger">
          bug
        </Pill>
        <Pill size={Size.Small} tone="info">
          ui
        </Pill>
      </>
    ),
  },
];

export function TimelinePage() {
  return (
    <>
      <Heading level={1}>Timeline</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        A vertical activity feed: a semantic ordered list of events, each with a tone-colored
        marker on a connector rail and a content column of actor, title, timestamp, description,
        media, and actions. The DOM order is the reading order, so pass items newest-first or
        oldest-first and that chronology carries straight into assistive tech.
      </Text>

      <Heading level={2}>Anatomy</Heading>
      <Text tone={TextTone.Muted}>An inspection with the exact spec measurements labelled on the figure.</Text>
      <ComponentBlueprint specId="timeline" />

      <Heading level={2}>Examples</Heading>

      <Example
        title="Activity feed with tones and icons"
        description="Each event colors its marker with a semantic tone and can hold a glyph inside the disc. Events without an icon fall back to a plain dot, and events without a tone stay neutral."
        code={`const items: TimelineItem[] = [
  { id: 1, title: 'Deployed v2.1.0 to production', tone: 'success', icon: <CheckIcon />, timestamp: '2h ago' },
  { id: 2, title: 'Canary released', tone: 'accent', icon: <RocketIcon />, timestamp: '3h ago' },
  { id: 3, title: 'Error budget warning', tone: 'warning', icon: <AlertIcon />, timestamp: '5h ago' },
  { id: 4, title: 'Build #4127 queued', timestamp: 'yesterday' },
];

<Timeline aria-label="Deploy activity" items={items} />`}
      >
        <div style={{ width: '100%', maxWidth: '32rem' }}>
          <Timeline aria-label="Deploy activity" items={DEPLOY_FEED} />
        </div>
      </Example>

      <Example
        title="Compact comment thread"
        description="Compose the actor slot from the kit Avatar and pass a time element as the timestamp. Compact density trims the space between events for dense threads."
        code={`const items: TimelineItem[] = [
  {
    id: 'c1',
    title: 'Ada Lovelace',
    actor: <Avatar size="sm" name="Ada Lovelace" />,
    timestamp: <time dateTime="2026-07-11T09:30">9:30</time>,
    description: 'The migration plan looks right, but stage the index build first.',
    tone: 'accent',
  },
  // ...
];

<Timeline aria-label="Review thread" items={items} density="compact" />`}
      >
        <div style={{ width: '100%', maxWidth: '32rem' }}>
          <Timeline aria-label="Review thread" items={COMMENT_THREAD} density="compact" />
        </div>
      </Example>

      <Example
        title="Media and actions"
        description="An event can carry a media block under its description (clipped to the medium radius) and a trailing action row of small buttons, links, or pills."
        code={`{
  id: 'r1',
  title: 'Screenshot attached to the bug report',
  actor: <Avatar size="sm" name="Ada Lovelace" />,
  tone: 'info',
  timestamp: '10m ago',
  description: 'The overflow happens on narrow viewports only.',
  media: <img src={screenshot} alt="Overflow screenshot" />,
  actions: (
    <>
      <Button size="sm" variant="soft">Reply</Button>
      <Button size="sm" variant="ghost">Assign</Button>
    </>
  ),
}`}
      >
        <div style={{ width: '100%', maxWidth: '32rem' }}>
          <Timeline aria-label="Issue activity" items={RICH_FEED} />
        </div>
      </Example>

      <Example
        title="Skeleton"
        description="skeleton renders marker discs and text lines with the exact rail geometry while the feed loads; skeletonCount sets how many placeholder rows it draws."
        code={`<Timeline aria-label="Activity" items={[]} skeleton skeletonCount={3} />`}
      >
        <div style={{ width: '100%', maxWidth: '32rem' }}>
          <Timeline aria-label="Activity loading" items={[]} skeleton skeletonCount={3} />
        </div>
      </Example>

      <Heading level={2}>Props</Heading>
      <PropsTable
        props={[
          { name: 'items', type: 'TimelineItem[]', description: 'Required. The events, in reading order: { id, title, description?, timestamp?, actor?, icon?, tone?, media?, actions? }.' },
          { name: 'aria-label', type: 'string', description: 'Required. Accessible name for the feed.' },
          { name: 'density', type: "'comfortable' | 'compact'", default: "'comfortable'", description: 'Vertical rhythm; compact trims the space between events.' },
          { name: 'skeleton', type: 'boolean', default: 'false', description: 'Renders a placeholder with the component exact geometry.' },
          { name: 'skeletonCount', type: 'number', default: '4', description: 'How many placeholder rows the skeleton draws.' },
        ]}
      />

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>
          The host is a native <code>ol</code> with a required <code>aria-label</code>: the
          ordered-list semantics tell assistive tech the sequence is meaningful, and the DOM order
          is the reading order you choose (newest-first or oldest-first).
        </li>
        <li>
          The marker rail (dot, icon, and connector) is <code>aria-hidden</code> and purely
          decorative. Never encode meaning only in the marker tone; say it in the title or
          description too.
        </li>
        <li>
          Timestamps render as plain text. Pass a <code>time</code> element with a{' '}
          <code>dateTime</code> attribute for machine-readable dates.
        </li>
        <li>
          Interactive content in the actions slot keeps its own semantics and tab order; the
          timeline itself takes no focus.
        </li>
        <li>
          The skeleton placeholder is <code>aria-hidden</code>; mark the surrounding region{' '}
          <code>aria-busy</code> at the app level while it loads.
        </li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>Pick one chronology per feed (newest-first for activity streams, oldest-first for narratives) and keep it consistent; the component renders items exactly in the order given.</li>
        <li>Give every event a stable <code>id</code> so rows keep their identity when the feed grows.</li>
        <li>Reserve tones and icons for events worth scanning for (deploys, failures, approvals); let routine events stay neutral dots.</li>
        <li>Compose the actor slot from the kit Avatar plus a name, and keep titles to a single line where possible; the timestamp hugs the end of the header row.</li>
        <li>Use compact density for dense comment threads and audit logs; keep comfortable for dashboards.</li>
        <li>For long feeds, paginate or window the items yourself; the timeline renders whatever slice it is given.</li>
      </ul>
    </>
  );
}
