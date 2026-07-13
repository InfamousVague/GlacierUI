import {
  Avatar,
  Button,
  Heading,
  Pill,
  Size,
  Text,
  TextTone,
  useT,
  type TimelineItem,
} from '@glacier/react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

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

export function TimelinePage() {
  const t = useT();

  const DEPLOY_FEED: TimelineItem[] = [
    {
      id: 1,
      title: t(m.tlDeploy1Title),
      tone: 'success',
      icon: <CheckIcon />,
      timestamp: t(m.tlDeploy1Time),
      description: t(m.tlDeploy1Desc),
    },
    {
      id: 2,
      title: t(m.tlDeploy2Title),
      tone: 'accent',
      icon: <RocketIcon />,
      timestamp: t(m.tlDeploy2Time),
      description: t(m.tlDeploy2Desc),
    },
    {
      id: 3,
      title: t(m.tlDeploy3Title),
      tone: 'warning',
      icon: <AlertIcon />,
      timestamp: t(m.tlDeploy3Time),
      description: t(m.tlDeploy3Desc),
    },
    {
      id: 4,
      title: t(m.tlDeploy4Title),
      timestamp: t(m.tlDeploy4Time),
    },
  ];

  const COMMENT_THREAD: TimelineItem[] = [
    {
      id: 'c1',
      title: 'Ada Lovelace',
      actor: <Avatar size="sm" name="Ada Lovelace" />,
      timestamp: <time dateTime="2026-07-11T09:30">9:30</time>,
      description: t(m.tlComment1Desc),
      tone: 'accent',
    },
    {
      id: 'c2',
      title: 'Grace Hopper',
      actor: <Avatar size="sm" name="Grace Hopper" />,
      timestamp: <time dateTime="2026-07-11T09:41">9:41</time>,
      description: t(m.tlComment2Desc),
      tone: 'accent',
    },
    {
      id: 'c3',
      title: 'Alan Turing',
      actor: <Avatar size="sm" name="Alan Turing" />,
      timestamp: <time dateTime="2026-07-11T10:02">10:02</time>,
      description: t(m.tlComment3Desc),
      tone: 'success',
    },
  ];

  const RICH_FEED: TimelineItem[] = [
    {
      id: 'r1',
      title: t(m.tlRich1Title),
      actor: <Avatar size="sm" name="Ada Lovelace" />,
      tone: 'info',
      timestamp: t(m.tlRich1Time),
      description: t(m.tlRich1Desc),
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
          {t(m.tlMediaPreview)}
        </div>
      ),
      actions: (
        <>
          <Button size="sm" variant="soft">
            {t(m.timelineReply)}
          </Button>
          <Button size="sm" variant="ghost">
            {t(m.timelineAssign)}
          </Button>
        </>
      ),
    },
    {
      id: 'r2',
      title: t(m.tlRich2Title),
      tone: 'neutral',
      timestamp: t(m.tlRich2Time),
      actions: (
        <>
          <Pill size={Size.Small} tone="danger">
            {t(m.timelineBug)}
          </Pill>
          <Pill size={Size.Small} tone="info">
            {t(m.timelineUi)}
          </Pill>
        </>
      ),
    },
  ];

  return (
    <>
      <Heading level={1}>{t(m.tlName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(m.tlLede)}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.anatomyIntro)}</Text>
      <ComponentBlueprint specId="timeline" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.tlEx1Title)}
        description={t(m.tlEx1Desc)}
        component="Timeline"
        render={(K) => (
          <div style={{ width: '100%', maxWidth: '32rem' }}>
            <K.Timeline aria-label={t(m.tlAriaDeploy)} items={DEPLOY_FEED} />
          </div>
        )}
        code={`const items: TimelineItem[] = [
  { id: 1, title: 'Deployed v2.1.0 to production', tone: 'success', icon: <CheckIcon />, timestamp: '2h ago' },
  { id: 2, title: 'Canary released', tone: 'accent', icon: <RocketIcon />, timestamp: '3h ago' },
  { id: 3, title: 'Error budget warning', tone: 'warning', icon: <AlertIcon />, timestamp: '5h ago' },
  { id: 4, title: 'Build #4127 queued', timestamp: 'yesterday' },
];

<Timeline aria-label="Deploy activity" items={items} />`}
      />

      <Example
        title={t(m.tlEx2Title)}
        description={t(m.tlEx2Desc)}
        component="Timeline"
        render={(K) => (
          <div style={{ width: '100%', maxWidth: '32rem' }}>
            <K.Timeline aria-label={t(m.tlAriaReview)} items={COMMENT_THREAD} density="compact" />
          </div>
        )}
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
      />

      <Example
        title={t(m.tlEx3Title)}
        description={t(m.tlEx3Desc)}
        component="Timeline"
        render={(K) => (
          <div style={{ width: '100%', maxWidth: '32rem' }}>
            <K.Timeline aria-label={t(m.tlAriaIssue)} items={RICH_FEED} />
          </div>
        )}
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
      />

      <Example
        title={t(m.exSkeleton)}
        description={t(m.tlEx4Desc)}
        component="Timeline"
        render={(K) => (
          <div style={{ width: '100%', maxWidth: '32rem' }}>
            <K.Timeline aria-label={t(m.tlAriaLoading)} items={[]} skeleton skeletonCount={3} />
          </div>
        )}
        code={`<Timeline aria-label="Activity" items={[]} skeleton skeletonCount={3} />`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'items', type: 'TimelineItem[]', description: t(m.tlPropItems) },
          { name: 'aria-label', type: 'string', description: t(m.tlPropAriaLabel) },
          { name: 'density', type: "'comfortable' | 'compact'", default: "'comfortable'", description: t(m.tlPropDensity) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(m.tlPropSkeleton) },
          { name: 'skeletonCount', type: 'number', default: '4', description: t(m.tlPropSkeletonCount) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.tlA11y1))}</li>
        <li>{prose(t(m.tlA11y2))}</li>
        <li>{prose(t(m.tlA11y3))}</li>
        <li>{prose(t(m.tlA11y4))}</li>
        <li>{prose(t(m.tlA11y5))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.tlUse1))}</li>
        <li>{prose(t(m.tlUse2))}</li>
        <li>{prose(t(m.tlUse3))}</li>
        <li>{prose(t(m.tlUse4))}</li>
        <li>{prose(t(m.tlUse5))}</li>
        <li>{prose(t(m.tlUse6))}</li>
      </ul>
    </>
  );
}
