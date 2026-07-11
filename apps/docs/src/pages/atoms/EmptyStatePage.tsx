import { Box, Button, EmptyState, Pill, SearchField, Stack, Heading, Text, Size, TextTone } from '@glacier/react';
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
import { Example, PropsTable } from '../../docs-ui.tsx';

export function EmptyStatePage() {
  return (
    <>
      <Heading level={1}>EmptyState</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        A centered placeholder for a view with nothing in it yet. An EmptyState names what is
        missing and, when the user can act, points the way forward, so a blank screen reads as a
        deliberate stop rather than a bug.
      </Text>

      <Heading level={2}>Anatomy</Heading>
      <Text tone={TextTone.Muted}>An inspection with the exact spec measurements labelled on the box.</Text>
      <ComponentBlueprint specId="empty-state" />

      <Heading level={2}>Examples</Heading>

      <Example
        title="Icon, title, and description"
        description={
          <>
            The common shape: a glyph in a sunken disc, a short <code>title</code>, and a muted{' '}
            <code>description</code> that wraps within a comfortable measure.
          </>
        }
        code={`import { EmptyState } from '@glacier/react';

<EmptyState
  icon={<Inbox size={28} />}
  title="No messages yet"
  description="When someone sends you a message, it will show up here."
/>`}
      >
        <Box style={{ width: '100%', maxWidth: '34rem' }}>
          <EmptyState
            icon={<Inbox size={28} />}
            title="No messages yet"
            description="When someone sends you a message, it will show up here."
          />
        </Box>
      </Example>

      <Example
        title="With an action"
        description={
          <>
            Pass an <code>action</code> when the user can resolve the empty state. The action sits
            below the text as the clear next step.
          </>
        }
        code={`<EmptyState
  icon={<Folder size={28} />}
  title="No projects"
  description="Create your first project to start organizing your work."
  action={<Button>New project</Button>}
/>`}
      >
        <Box style={{ width: '100%', maxWidth: '34rem' }}>
          <EmptyState
            icon={<Folder size={28} />}
            title="No projects"
            description="Create your first project to start organizing your work."
            action={<Button>New project</Button>}
          />
        </Box>
      </Example>

      <Example
        title="Title only"
        description="The icon and description are optional. Omit them for a terse placeholder where a heading carries the whole message."
        code={`<EmptyState title="No results" />`}
      >
        <Box style={{ width: '100%', maxWidth: '34rem' }}>
          <EmptyState title="No results" />
        </Box>
      </Example>

      <Example
        title="Skeleton"
        description={
          <>
            <code>skeleton</code> renders a disc and two text bars at the same rhythm as the real
            component, so the surrounding layout holds while content loads.
          </>
        }
        code={`<EmptyState skeleton title="" />
<EmptyState
  icon={<Inbox size={28} />}
  title="No messages yet"
  description="When someone sends you a message, it will show up here."
/>`}
      >
        <Stack gap={6} align="center" style={{ width: '100%', maxWidth: '34rem' }}>
          <EmptyState skeleton title="" />
          <EmptyState
            icon={<Inbox size={28} />}
            title="No messages yet"
            description="When someone sends you a message, it will show up here."
          />
        </Stack>
      </Example>

      <Heading level={2}>Props</Heading>
      <PropsTable
        props={[
          {
            name: 'title',
            type: 'ReactNode',
            description: 'Required heading naming what is empty or missing.',
          },
          {
            name: 'icon',
            type: 'ReactNode',
            description: 'Optional decorative glyph rendered inside the sunken disc.',
          },
          {
            name: 'description',
            type: 'ReactNode',
            description: 'Optional muted sentence, centered and capped at a comfortable measure.',
          },
          {
            name: 'action',
            type: 'ReactNode',
            description: 'Optional call-to-action, such as a Button, below the text.',
          },
          {
            name: 'children',
            type: 'ReactNode',
            description: 'Extra content rendered below the action.',
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: "Renders a placeholder with the component's exact geometry.",
          },
        ]}
      />

      <Heading level={2}>Recipes</Heading>
      <Text tone={TextTone.Muted}>
        Ready-made compositions for the empty screens most products hit: first use, no results,
        load failures, locked content, offline, and an unselected detail pane.
      </Text>

      <Example
        title="First use"
        description="Reach for this when the user has never created anything in the feature: a brand new account, a fresh workspace, an untouched tab. Lead with what the feature is for and make the create action the only next step."
        code={`<EmptyState
  icon={<Sparkles size={28} />}
  title="Create your first project"
  description="Projects keep related documents, tasks, and people in one place."
  action={<Button>New project</Button>}
/>`}
      >
        <Box style={{ width: '100%', maxWidth: '34rem' }}>
          <EmptyState
            icon={<Sparkles size={28} />}
            title="Create your first project"
            description="Projects keep related documents, tasks, and people in one place."
            action={<Button>New project</Button>}
          />
        </Box>
      </Example>

      <Example
        title="No search results"
        description="Reach for this when a query or filter set matched nothing. Echo the query in the title so the user can see what was searched, and offer a quiet action that clears the filters rather than leaving a dead end."
        code={`<Stack gap={4}>
  <SearchField defaultValue="quarterly report" aria-label="Search documents" />
  <EmptyState
    icon={<SearchX size={28} />}
    title='No results for "quarterly report"'
    description="Check the spelling, or clear the filters to widen the search."
    action={<Button variant="ghost">Clear filters</Button>}
  />
</Stack>`}
      >
        <Stack gap={4} style={{ width: '100%', maxWidth: '34rem' }}>
          <SearchField defaultValue="quarterly report" aria-label="Search documents" />
          <EmptyState
            icon={<SearchX size={28} />}
            title='No results for "quarterly report"'
            description="Check the spelling, or clear the filters to widen the search."
            action={<Button variant="ghost">Clear filters</Button>}
          />
        </Stack>
      </Example>

      <Example
        title="Failed to load"
        description="Reach for this when a fetch failed, not when the view is truly empty. Keep the danger tone on the framing (the icon and the status pill), and keep the retry button neutral: retrying is safe, so it should not look destructive."
        code={`<EmptyState
  icon={<TriangleAlert size={28} color="var(--glacier-danger-text)" />}
  title="Couldn't load activity"
  description="The request didn't go through. Your data is safe, this view just needs another try."
  action={<Button>Retry</Button>}
>
  <Pill tone="danger" variant="soft">Error 503</Pill>
</EmptyState>`}
      >
        <Box style={{ width: '100%', maxWidth: '34rem' }}>
          <EmptyState
            icon={<TriangleAlert size={28} color="var(--glacier-danger-text)" />}
            title="Couldn't load activity"
            description="The request didn't go through. Your data is safe, this view just needs another try."
            action={<Button>Retry</Button>}
          >
            <Pill tone="danger" variant="soft">Error 503</Pill>
          </EmptyState>
        </Box>
      </Example>

      <Example
        title="Permission denied"
        description="Reach for this when the content exists but the user is not allowed to see it. Name the gate and who controls it, then make requesting access the action so the user is not left hunting for an owner."
        code={`<EmptyState
  icon={<Lock size={28} />}
  title="This space is private"
  description="You need an invitation from a space admin to view these documents."
  action={<Button variant="outline">Request access</Button>}
/>`}
      >
        <Box style={{ width: '100%', maxWidth: '34rem' }}>
          <EmptyState
            icon={<Lock size={28} />}
            title="This space is private"
            description="You need an invitation from a space admin to view these documents."
            action={<Button variant="outline">Request access</Button>}
          />
        </Box>
      </Example>

      <Example
        title="Offline"
        description="Reach for this when the view cannot render without a network. Blame the connection, not the user, give reconnect guidance, and offer a manual retry for anyone who does not want to wait for the automatic refresh."
        code={`<EmptyState
  icon={<WifiOff size={28} />}
  title="You're offline"
  description="Check your connection. This view refreshes automatically when you're back online."
  action={<Button variant="soft">Try again</Button>}
/>`}
      >
        <Box style={{ width: '100%', maxWidth: '34rem' }}>
          <EmptyState
            icon={<WifiOff size={28} />}
            title="You're offline"
            description="Check your connection. This view refreshes automatically when you're back online."
            action={<Button variant="soft">Try again</Button>}
          />
        </Box>
      </Example>

      <Example
        title="Empty selection"
        description="Reach for this in the detail pane of a master-detail layout before anything is chosen. There is no action because the fix lives in the other pane: point the user there instead."
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
      >
        <Box
          style={{
            width: '100%',
            maxWidth: '34rem',
            border: '1px dashed var(--glacier-border)',
            borderRadius: 'var(--glacier-radius-md)',
          }}
        >
          <EmptyState
            icon={<MousePointerClick size={28} />}
            title="Nothing selected"
            description="Choose a conversation from the list to read it here."
          />
        </Box>
      </Example>

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>
          The <code>title</code> is the accessible label for the empty view. Keep it a short,
          literal phrase that reads on its own, such as "No results" or "No projects".
        </li>
        <li>
          The <code>icon</code> is decorative and rendered <code>aria-hidden</code>, so it is never
          announced. Do not rely on it to carry meaning the title and description do not.
        </li>
        <li>
          When the user can resolve the empty state, provide a real <code>action</code> (a Button or
          link) rather than describing the fix in prose. A focusable control is reachable by
          keyboard and assistive technology.
        </li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>
          Use an EmptyState for a view that is legitimately empty: no search results, an unstarted
          list, a cleared inbox. For a view that failed to load, prefer an error state with a retry.
        </li>
        <li>
          Keep the title to a few words and the description to a sentence. If you need more, the
          content belongs on the page, not in the placeholder.
        </li>
        <li>
          Offer exactly one primary action where one exists. Two or more calls to action dilute the
          next step and turn a calm stop into a decision.
        </li>
      </ul>
    </>
  );
}
