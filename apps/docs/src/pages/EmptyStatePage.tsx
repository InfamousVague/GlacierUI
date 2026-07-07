import { Box, Button, EmptyState, Stack } from '@perfect/react';
import { ComponentBlueprint } from '../Blueprint.tsx';
import { Example, PropsTable } from '../docs-ui.tsx';

export function EmptyStatePage() {
  return (
    <>
      <h1>EmptyState</h1>
      <p className="lede">
        A centered placeholder for a view with nothing in it yet. An EmptyState names what is
        missing and, when the user can act, points the way forward, so a blank screen reads as a
        deliberate stop rather than a bug.
      </p>

      <h2>Anatomy</h2>
      <p>An inspection with the exact spec measurements labelled on the box.</p>
      <ComponentBlueprint specId="empty-state" />

      <h2>Examples</h2>

      <Example
        title="Icon, title, and description"
        description={
          <>
            The common shape: a glyph in a sunken disc, a short <code>title</code>, and a muted{' '}
            <code>description</code> that wraps within a comfortable measure.
          </>
        }
        code={`import { EmptyState } from '@perfect/react';

<EmptyState
  icon={<span aria-hidden>📥</span>}
  title="No messages yet"
  description="When someone sends you a message, it will show up here."
/>`}
      >
        <Box style={{ width: '100%', maxWidth: '34rem' }}>
          <EmptyState
            icon={<span aria-hidden>📥</span>}
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
  icon={<span aria-hidden>📁</span>}
  title="No projects"
  description="Create your first project to start organizing your work."
  action={<Button>New project</Button>}
/>`}
      >
        <Box style={{ width: '100%', maxWidth: '34rem' }}>
          <EmptyState
            icon={<span aria-hidden>📁</span>}
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
  icon={<span aria-hidden>📥</span>}
  title="No messages yet"
  description="When someone sends you a message, it will show up here."
/>`}
      >
        <Stack gap={6} align="center" style={{ width: '100%', maxWidth: '34rem' }}>
          <EmptyState skeleton title="" />
          <EmptyState
            icon={<span aria-hidden>📥</span>}
            title="No messages yet"
            description="When someone sends you a message, it will show up here."
          />
        </Stack>
      </Example>

      <h2>Props</h2>
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

      <h2>Accessibility</h2>
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

      <h2>Usage</h2>
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
