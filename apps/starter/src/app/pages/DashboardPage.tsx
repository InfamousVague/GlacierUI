import { CardGroup, Heading, Pill, Size, StatTile, Text, TextTone, Timeline } from '@glacier/react';
import { Activity, GitCommitHorizontal, Rocket, TriangleAlert, Users } from '@glacier/icons';

const STATS = [
  { icon: <Users size={18} />, value: '2,481', label: 'Active users', hint: <Pill tone="success" size={Size.Small}>+12%</Pill> },
  { icon: <Activity size={18} />, value: '98.9%', label: 'Uptime', hint: <Pill tone="success" size={Size.Small}>30d</Pill> },
  { icon: <GitCommitHorizontal size={18} />, value: '342', label: 'Commits', hint: <Pill size={Size.Small}>this week</Pill> },
  { icon: <TriangleAlert size={18} />, value: '3', label: 'Open incidents', hint: <Pill tone="warning" size={Size.Small}>attention</Pill> },
];

const ACTIVITY = [
  { id: 1, tone: 'success' as const, icon: <Rocket size={13} />, title: 'Deployed v2.4.0 to production', description: 'All checks passed. Rollout completed in 4 minutes.', timestamp: '2h ago' },
  { id: 2, tone: 'accent' as const, title: 'Merged "Sidebar resize" pull request', description: 'Reviewed and approved by two maintainers.', timestamp: '5h ago' },
  { id: 3, tone: 'warning' as const, icon: <TriangleAlert size={13} />, title: 'Latency spike on the API gateway', description: 'p95 briefly crossed 800ms, then recovered.', timestamp: 'Yesterday' },
  { id: 4, tone: 'neutral' as const, title: 'Nightly backup completed', description: 'Snapshot stored and verified.', timestamp: 'Yesterday' },
];

export function DashboardPage() {
  return (
    <div className="page">
      <div>
        <Heading level={1}>Good morning</Heading>
        <Text size={Size.Large} tone={TextTone.Muted} className="pageLede">
          A quick read on how things are trending. Swap these tiles and the feed for your own data;
          the layout and every component come from Glacier.
        </Text>
      </div>

      <div className="statRow">
        {STATS.map((stat) => (
          <StatTile key={stat.label} icon={stat.icon} value={stat.value} label={stat.label} hint={stat.hint} />
        ))}
      </div>

      <div className="split">
        <section>
          <Heading level={2}>Recent activity</Heading>
          <Timeline aria-label="Recent activity" items={ACTIVITY} />
        </section>
        <section>
          <Heading level={2}>Shortcuts</Heading>
          <CardGroup minItemWidth="12rem">
            <StatTile value="Docs" label="Read the guides" />
            <StatTile value="API" label="Reference and SDKs" />
            <StatTile value="Status" label="All systems live" hint={<Pill tone="success" size={Size.Small}>ok</Pill>} />
            <StatTile value="Support" label="Reach the team" />
          </CardGroup>
        </section>
      </div>
    </div>
  );
}
