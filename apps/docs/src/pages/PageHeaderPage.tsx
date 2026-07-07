import { Box, Button, Link, PageHeader, Row, Text } from '@perfect/react';
import { Example, PropsTable } from '../docs-ui.tsx';

export function PageHeaderPage() {
  return (
    <>
      <h1>Page Header</h1>
      <p className="lede">
        The title block that opens a page or a panel: a heading, an optional description, and trailing
        actions. Use one PageHeader at the top of a view to name it and to anchor its primary action.
      </p>

      <h2>Examples</h2>

      <Example
        title="Title and description"
        description="The base form is a heading with a muted line beneath it. The heading renders as an h1 sized to match an h2, so it sits at the top of the document outline without overpowering the page."
        code={`import { PageHeader } from '@perfect/react';

<PageHeader
  title="Team members"
  description="People who can access this workspace and their roles."
/>`}
      >
        <Box style={{ width: '100%', maxWidth: '40rem' }}>
          <PageHeader
            title="Team members"
            description="People who can access this workspace and their roles."
          />
        </Box>
      </Example>

      <Example
        title="With actions"
        description="Pass buttons as actions to pin them to the trailing edge. They stay aligned to the top of the title block and wrap below the text on narrow screens. Lead with a soft button for secondary work and a solid button for the primary action."
        code={`<PageHeader
  title="Team members"
  description="People who can access this workspace and their roles."
  actions={
    <>
      <Button variant="soft">Import</Button>
      <Button variant="solid">Invite member</Button>
    </>
  }
/>`}
      >
        <Box style={{ width: '100%', maxWidth: '40rem' }}>
          <PageHeader
            title="Team members"
            description="People who can access this workspace and their roles."
            actions={
              <>
                <Button variant="soft">Import</Button>
                <Button variant="solid">Invite member</Button>
              </>
            }
          />
        </Box>
      </Example>

      <Example
        title="With breadcrumbs"
        description="Pass a trail as breadcrumbs to render it above the title. Any node works: here a Row of Links separated by a muted slash marks the path back to the parent views."
        code={`<PageHeader
  breadcrumbs={
    <Row gap={2} align="center">
      <Link href="#">Workspace</Link>
      <Text tone="muted">/</Text>
      <Link href="#">Settings</Link>
    </Row>
  }
  title="Team members"
  description="People who can access this workspace and their roles."
/>`}
      >
        <Box style={{ width: '100%', maxWidth: '40rem' }}>
          <PageHeader
            breadcrumbs={
              <Row gap={2} align="center">
                <Link href="#">Workspace</Link>
                <Text tone="muted">/</Text>
                <Link href="#">Settings</Link>
              </Row>
            }
            title="Team members"
            description="People who can access this workspace and their roles."
          />
        </Box>
      </Example>

      <Example
        title="Everything together"
        description="Breadcrumbs, title, description, and actions compose into one block. The heading and its description grow to fill the row while the actions hold the trailing edge."
        code={`<PageHeader
  breadcrumbs={
    <Row gap={2} align="center">
      <Link href="#">Workspace</Link>
      <Text tone="muted">/</Text>
      <Link href="#">Settings</Link>
    </Row>
  }
  title="Billing"
  description="Manage your plan, payment method, and invoices."
  actions={
    <>
      <Button variant="soft">View invoices</Button>
      <Button variant="solid">Change plan</Button>
    </>
  }
/>`}
      >
        <Box style={{ width: '100%', maxWidth: '40rem' }}>
          <PageHeader
            breadcrumbs={
              <Row gap={2} align="center">
                <Link href="#">Workspace</Link>
                <Text tone="muted">/</Text>
                <Link href="#">Settings</Link>
              </Row>
            }
            title="Billing"
            description="Manage your plan, payment method, and invoices."
            actions={
              <>
                <Button variant="soft">View invoices</Button>
                <Button variant="solid">Change plan</Button>
              </>
            }
          />
        </Box>
      </Example>

      <h2>Props</h2>
      <PropsTable
        props={[
          {
            name: 'title',
            type: 'ReactNode',
            description: 'The page title. Rendered as an h1 sized to match an h2.',
          },
          {
            name: 'description',
            type: 'ReactNode',
            description: 'Optional muted line beneath the title.',
          },
          {
            name: 'actions',
            type: 'ReactNode',
            description:
              'Trailing controls pinned to the edge, such as a primary button. Wraps below the text on narrow screens.',
          },
          {
            name: 'breadcrumbs',
            type: 'ReactNode',
            description: 'Optional trail rendered above the title.',
          },
          {
            name: 'className',
            type: 'string',
            description: 'Class applied to the outer container.',
          },
        ]}
      />

      <h2>Accessibility</h2>
      <ul>
        <li>
          The title renders as a real <code>h1</code>, so it is the top level of the page outline for
          screen readers even though it is sized like an h2.
        </li>
        <li>
          Use one PageHeader, and one <code>h1</code>, per page. Section titles below it should be{' '}
          <code>h2</code> and lower so the heading order stays unbroken.
        </li>
        <li>
          When breadcrumbs form a navigation trail, wrap them in a <code>nav</code> with an{' '}
          <code>aria-label</code> such as Breadcrumb so assistive technology can announce and skip the
          region.
        </li>
      </ul>

      <h2>Usage</h2>
      <ul>
        <li>
          Place one PageHeader at the top of each page or panel. It names the view and gives its
          actions a fixed home.
        </li>
        <li>
          Keep actions to the page-level tasks that apply to the whole view. Put the primary action
          last as a solid button, and set secondary actions to soft or outline.
        </li>
        <li>
          Keep the description to a sentence that states what the page is for. Longer explanation
          belongs in the body, not the header.
        </li>
        <li>
          Reserve breadcrumbs for views nested inside a hierarchy. A top-level page does not need
          them.
        </li>
      </ul>
    </>
  );
}
