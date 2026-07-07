import { Box, Button, EmptyState } from '@perfect/react';
import { Example, PropsTable } from '../docs-ui.tsx';

export function EmptyStatePage() {
  return (
    <>
      <h1>Empty State</h1>
      <p className="lede">
        A centered icon, title, description, and optional action for a view with nothing to show.
        Use it in place of a blank list, table, or search result so the reader knows what happened
        and what to do next.
      </p>

      <h2>Examples</h2>

      <Example
        title="With an action"
        description={
          <>
            The full pattern: an <code>icon</code> in a muted disc, a <code>title</code>, a{' '}
            <code>description</code>, and an <code>action</code> that moves the reader forward.
          </>
        }
        code={`import { Button, EmptyState } from '@perfect/react';

<EmptyState
  icon={
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 13l2.5-8.5A2 2 0 017.4 3h9.2a2 2 0 011.9 1.5L21 13v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M3 13h5l1 2h6l1-2h5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  }
  title="Your inbox is empty"
  description="New messages will appear here as they arrive."
  action={<Button variant="solid">Compose message</Button>}
/>`}
      >
        <Box width="full" maxWidth="sm">
          <EmptyState
            icon={
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M3 13l2.5-8.5A2 2 0 017.4 3h9.2a2 2 0 011.9 1.5L21 13v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 13h5l1 2h6l1-2h5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
            }
            title="Your inbox is empty"
            description="New messages will appear here as they arrive."
            action={<Button variant="solid">Compose message</Button>}
          />
        </Box>
      </Example>

      <Example
        title="No search results"
        description={
          <>
            When a query returns nothing, drop the <code>action</code>. There is no next step to
            offer, so the state explains the result and leaves the reader to adjust the search.
          </>
        }
        code={`<EmptyState
  icon={
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path d="M16 16l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  }
  title="No results for “quarterly”"
  description="Check the spelling or try a broader term."
/>`}
      >
        <Box width="full" maxWidth="sm">
          <EmptyState
            icon={
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
                <path d="M16 16l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            }
            title="No results for “quarterly”"
            description="Check the spelling or try a broader term."
          />
        </Box>
      </Example>

      <Example
        title="Inside a card"
        description={
          <>
            The component fills its container and centers within it, so it sits cleanly inside a
            bordered <code>Box</code> that stands in for an empty panel or table.
          </>
        }
        code={`<Box border radius="lg" background="surface" width="full" maxWidth="md">
  <EmptyState
    title="No team members yet"
    description="Invite people to start collaborating on this project."
    action={<Button variant="soft">Invite people</Button>}
  />
</Box>`}
      >
        <Box border radius="lg" background="surface" width="full" maxWidth="md">
          <EmptyState
            title="No team members yet"
            description="Invite people to start collaborating on this project."
            action={<Button variant="soft">Invite people</Button>}
          />
        </Box>
      </Example>

      <h2>Props</h2>
      <PropsTable
        props={[
          {
            name: 'title',
            type: 'ReactNode',
            description: 'Required heading that names the empty condition.',
          },
          {
            name: 'icon',
            type: 'ReactNode',
            description: 'Optional glyph shown above the title in a muted disc. Rendered decorative.',
          },
          {
            name: 'description',
            type: 'ReactNode',
            description: 'Optional muted line under the title that explains the state or next step.',
          },
          {
            name: 'action',
            type: 'ReactNode',
            description: 'Optional primary action, such as a Button, shown below the text.',
          },
          {
            name: 'className',
            type: 'string',
            description: 'Class applied to the outer centered wrapper.',
          },
        ]}
      />

      <h2>Accessibility</h2>
      <ul>
        <li>
          The <code>title</code> renders as a level-3 heading, so it joins the page outline and can
          be reached by heading navigation.
        </li>
        <li>
          The <code>icon</code> is marked <code>aria-hidden</code> and carries no meaning on its own.
          Keep the message in the title and description text.
        </li>
        <li>
          When you pass an <code>action</code>, use a real Button or link so it is focusable and
          announced with its role.
        </li>
      </ul>

      <h2>Usage</h2>
      <ul>
        <li>
          Use an empty state for zero-data lists, tables, and searches instead of leaving the region
          blank.
        </li>
        <li>
          Include an <code>action</code> when there is a clear next step, such as creating the first
          record. Omit it for search and filter results, where the reader adjusts the query.
        </li>
        <li>
          Keep the title to a few words and the description to a sentence. State the condition, then
          the way out.
        </li>
        <li>
          Place it inside the container it stands in for, a panel, card, or table body, so it centers
          within that space.
        </li>
      </ul>
    </>
  );
}
