import { Box, Button, Pill, SearchField, Stack, Heading, Text, Size, TextTone, useT } from '@glacier/react';
import {
  Folder,
  Inbox,
  Lock,
  MousePointerClick,
  SearchX,
  Sparkles,
  TriangleAlert,
  WifiOff,
} from '@glacier/icons';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { m } from '../../i18n.ts';

export function EmptyStatePage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.esName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(m.esLede)}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.anatomyIntroBox)}</Text>
      <ComponentBlueprint specId="empty-state" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.esEx1Title)}
        description={prose(t(m.esEx1Desc))}
        component="EmptyState"
        render={(K) => (
          <Box style={{ width: '100%', maxWidth: '34rem' }}>
            <K.EmptyState
              icon={<Inbox size={28} />}
              title={t(m.esDemoNoMsgTitle)}
              description={t(m.esDemoNoMsgDesc)}
            />
          </Box>
        )}
        code={`import { EmptyState } from '@glacier/react';

<EmptyState
  icon={<Inbox size={28} />}
  title="No messages yet"
  description="When someone sends you a message, it will show up here."
/>`}
      />

      <Example
        title={t(m.esEx2Title)}
        description={prose(t(m.esEx2Desc))}
        component="EmptyState"
        render={(K) => (
          <Box style={{ width: '100%', maxWidth: '34rem' }}>
            <K.EmptyState
              icon={<Folder size={28} />}
              title={t(m.esDemoNoProjTitle)}
              description={t(m.esDemoNoProjDesc)}
              action={<Button>{t(m.esDemoNewProject)}</Button>}
            />
          </Box>
        )}
        code={`<EmptyState
  icon={<Folder size={28} />}
  title="No projects"
  description="Create your first project to start organizing your work."
  action={<Button>New project</Button>}
/>`}
      />

      <Example
        title={t(m.esEx3Title)}
        description={t(m.esEx3Desc)}
        component="EmptyState"
        render={(K) => (
          <Box style={{ width: '100%', maxWidth: '34rem' }}>
            <K.EmptyState title={t(m.esDemoNoResults)} />
          </Box>
        )}
        code={`<EmptyState title="No results" />`}
      />

      <Example
        title={t(m.exSkeleton)}
        description={prose(t(m.esEx4Desc))}
        component="EmptyState"
        render={(K) => (
          <Stack gap={6} align="center" style={{ width: '100%', maxWidth: '34rem' }}>
            <K.EmptyState skeleton title="" />
            <K.EmptyState
              icon={<Inbox size={28} />}
              title={t(m.esDemoNoMsgTitle)}
              description={t(m.esDemoNoMsgDesc)}
            />
          </Stack>
        )}
        code={`<EmptyState skeleton title="" />
<EmptyState
  icon={<Inbox size={28} />}
  title="No messages yet"
  description="When someone sends you a message, it will show up here."
/>`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          {
            name: 'title',
            type: 'ReactNode',
            description: t(m.esPropTitle),
          },
          {
            name: 'icon',
            type: 'ReactNode',
            description: t(m.esPropIcon),
          },
          {
            name: 'description',
            type: 'ReactNode',
            description: t(m.esPropDescription),
          },
          {
            name: 'action',
            type: 'ReactNode',
            description: t(m.esPropAction),
          },
          {
            name: 'children',
            type: 'ReactNode',
            description: t(m.esPropChildren),
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: t(m.esPropSkeleton),
          },
        ]}
      />

      <Heading level={2}>{t(m.esRecipes)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.esRecipesIntro)}</Text>

      <Example
        title={t(m.esRecipe1Title)}
        description={t(m.esRecipe1Desc)}
        component="EmptyState"
        render={(K) => (
          <Box style={{ width: '100%', maxWidth: '34rem' }}>
            <K.EmptyState
              icon={<Sparkles size={28} />}
              title={t(m.esDemoFirstTitle)}
              description={t(m.esDemoFirstDesc)}
              action={<Button>{t(m.esDemoNewProject)}</Button>}
            />
          </Box>
        )}
        code={`<EmptyState
  icon={<Sparkles size={28} />}
  title="Create your first project"
  description="Projects keep related documents, tasks, and people in one place."
  action={<Button>New project</Button>}
/>`}
      />

      <Example
        title={t(m.esRecipe2Title)}
        description={t(m.esRecipe2Desc)}
        component="EmptyState"
        render={(K) => (
          <Stack gap={4} style={{ width: '100%', maxWidth: '34rem' }}>
            <SearchField defaultValue="quarterly report" aria-label={t(m.esDemoSearchAria)} />
            <K.EmptyState
              icon={<SearchX size={28} />}
              title={t(m.esDemoSearchTitle)}
              description={t(m.esDemoSearchDesc)}
              action={<Button variant="ghost">{t(m.esDemoClearFilters)}</Button>}
            />
          </Stack>
        )}
        code={`<Stack gap={4}>
  <SearchField defaultValue="quarterly report" aria-label="Search documents" />
  <EmptyState
    icon={<SearchX size={28} />}
    title='No results for "quarterly report"'
    description="Check the spelling, or clear the filters to widen the search."
    action={<Button variant="ghost">Clear filters</Button>}
  />
</Stack>`}
      />

      <Example
        title={t(m.esRecipe3Title)}
        description={t(m.esRecipe3Desc)}
        component="EmptyState"
        render={(K) => (
          <Box style={{ width: '100%', maxWidth: '34rem' }}>
            <K.EmptyState
              icon={<TriangleAlert size={28} color="var(--glacier-danger-text)" />}
              title={t(m.esDemoFailTitle)}
              description={t(m.esDemoFailDesc)}
              action={<Button>{t(m.emptystateRetry)}</Button>}
            >
              <Pill tone="danger" variant="soft">{t(m.emptystateError503)}</Pill>
            </K.EmptyState>
          </Box>
        )}
        code={`<EmptyState
  icon={<TriangleAlert size={28} color="var(--glacier-danger-text)" />}
  title="Couldn't load activity"
  description="The request didn't go through. Your data is safe, this view just needs another try."
  action={<Button>Retry</Button>}
>
  <Pill tone="danger" variant="soft">Error 503</Pill>
</EmptyState>`}
      />

      <Example
        title={t(m.esRecipe4Title)}
        description={t(m.esRecipe4Desc)}
        component="EmptyState"
        render={(K) => (
          <Box style={{ width: '100%', maxWidth: '34rem' }}>
            <K.EmptyState
              icon={<Lock size={28} />}
              title={t(m.esDemoPrivTitle)}
              description={t(m.esDemoPrivDesc)}
              action={<Button variant="outline">{t(m.esDemoRequestAccess)}</Button>}
            />
          </Box>
        )}
        code={`<EmptyState
  icon={<Lock size={28} />}
  title="This space is private"
  description="You need an invitation from a space admin to view these documents."
  action={<Button variant="outline">Request access</Button>}
/>`}
      />

      <Example
        title={t(m.esRecipe5Title)}
        description={t(m.esRecipe5Desc)}
        component="EmptyState"
        render={(K) => (
          <Box style={{ width: '100%', maxWidth: '34rem' }}>
            <K.EmptyState
              icon={<WifiOff size={28} />}
              title={t(m.esDemoOfflineTitle)}
              description={t(m.esDemoOfflineDesc)}
              action={<Button variant="soft">{t(m.esDemoTryAgain)}</Button>}
            />
          </Box>
        )}
        code={`<EmptyState
  icon={<WifiOff size={28} />}
  title="You're offline"
  description="Check your connection. This view refreshes automatically when you're back online."
  action={<Button variant="soft">Try again</Button>}
/>`}
      />

      <Example
        title={t(m.esRecipe6Title)}
        description={t(m.esRecipe6Desc)}
        component="EmptyState"
        render={(K) => (
          <Box
            style={{
              width: '100%',
              maxWidth: '34rem',
              border: '1px dashed var(--glacier-border)',
              borderRadius: 'var(--glacier-radius-md)',
            }}
          >
            <K.EmptyState
              icon={<MousePointerClick size={28} />}
              title={t(m.esDemoSelTitle)}
              description={t(m.esDemoSelDesc)}
            />
          </Box>
        )}
        code={`<Box
  style={{
    border: '1px dashed var(--glacier-border)',
    borderRadius: 'var(--glacier-radius-md)',
  }}
>
  <EmptyState
    icon={<MousePointerClick size={28} />}
    title="Nothing selected"
    description="Choose a conversation from the list to read it here."
  />
</Box>`}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.esA11y1))}</li>
        <li>{prose(t(m.esA11y2))}</li>
        <li>{prose(t(m.esA11y3))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.esUse1))}</li>
        <li>{prose(t(m.esUse2))}</li>
        <li>{prose(t(m.esUse3))}</li>
      </ul>
    </>
  );
}
