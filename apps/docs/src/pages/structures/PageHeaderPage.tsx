import {
  Box,
  Breadcrumbs,
  Button,
  Heading,
  PageHeader,
  Pill,
  Size,
  StatusDot,
  Text,
  TextTone,
  Variant,
} from '@glacier/react';
import { Example, PropsTable } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';

const CRUMBS = [
  { label: 'Acme', href: '#' },
  { label: 'Platform', href: '#' },
  { label: 'Deployments' },
];

export function PageHeaderPage() {
  return (
    <>
      <Heading level={1}>PageHeader</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        The page masthead: breadcrumbs over an <code>h1</code> or <code>h2</code> title with a muted
        description and metadata row, primary actions end-aligned, and an overflow menu of secondary
        actions behind an ellipsis button. The title block and the actions share one wrapping row,
        so the actions drop below the title on narrow widths without any JS measurement.
      </Text>

      <Heading level={2}>Anatomy</Heading>
      <Text tone={TextTone.Muted}>An inspection with the exact spec measurements labelled on the figure.</Text>
      <ComponentBlueprint specId="page-header" />

      <Heading level={2}>Examples</Heading>

      <Example
        title="Operational header"
        description="The full arrangement: breadcrumbs, title, description, meta pills, primary actions, and an overflow menu."
        code={`<PageHeader
  breadcrumbs={
    <Breadcrumbs
      items={[
        { label: 'Acme', href: '#' },
        { label: 'Platform', href: '#' },
        { label: 'Deployments' },
      ]}
    />
  }
  title="Deployments"
  headingLevel={2}
  description="Everything the platform team has shipped to production, newest first."
  meta={
    <>
      <Pill tone="success" size={Size.Small}>Healthy</Pill>
      <Pill size={Size.Small}>12 environments</Pill>
      <StatusDot tone="success" label="All systems live" />
    </>
  }
  actions={
    <>
      <Button variant={Variant.Ghost}>Export</Button>
      <Button>New deployment</Button>
    </>
  }
  secondaryActions={[
    { id: 'settings', label: 'Pipeline settings' },
    { id: 'archive', label: 'Archive project' },
    { id: 'delete', label: 'Delete project', disabled: true },
  ]}
/>`}
      >
        <Box width="full" border radius="lg" paddingX={6}>
          <PageHeader
            breadcrumbs={<Breadcrumbs items={CRUMBS} />}
            title="Deployments"
            headingLevel={2}
            description="Everything the platform team has shipped to production, newest first."
            meta={
              <>
                <Pill tone="success" size={Size.Small}>Healthy</Pill>
                <Pill size={Size.Small}>12 environments</Pill>
                <StatusDot tone="success" label="All systems live" />
              </>
            }
            actions={
              <>
                <Button variant={Variant.Ghost}>Export</Button>
                <Button>New deployment</Button>
              </>
            }
            secondaryActions={[
              { id: 'settings', label: 'Pipeline settings' },
              { id: 'archive', label: 'Archive project' },
              { id: 'delete', label: 'Delete project', disabled: true },
            ]}
          />
        </Box>
      </Example>

      <Example
        title="Compact density"
        description="Compact trims the block padding and stack gap for dense or nested screens, keeping the same type scale. Use headingLevel={2} when the page already owns its h1."
        code={`<PageHeader
  density="compact"
  headingLevel={2}
  title="Environment variables"
  meta={<Pill size={Size.Small}>48 keys</Pill>}
  actions={<Button variant={Variant.Soft}>Add variable</Button>}
  secondaryActions={[
    { id: 'import', label: 'Import .env' },
    { id: 'export', label: 'Export as JSON' },
  ]}
/>`}
      >
        <Box width="full" border radius="lg" paddingX={6}>
          <PageHeader
            density="compact"
            headingLevel={2}
            title="Environment variables"
            meta={<Pill size={Size.Small}>48 keys</Pill>}
            actions={<Button variant={Variant.Soft}>Add variable</Button>}
            secondaryActions={[
              { id: 'import', label: 'Import .env' },
              { id: 'export', label: 'Export as JSON' },
            ]}
          />
        </Box>
      </Example>

      <Example
        title="Title and actions"
        description="The minimum useful header: a title with its primary action. The title block grows, so the action hugs the trailing edge, then wraps below on narrow widths."
        code={`<PageHeader title="Billing" headingLevel={2} actions={<Button>Upgrade plan</Button>} />`}
      >
        <Box width="full" border radius="lg" paddingX={6}>
          <PageHeader title="Billing" headingLevel={2} actions={<Button>Upgrade plan</Button>} />
        </Box>
      </Example>

      <Example
        title="Skeleton"
        description="skeleton mirrors each provided slot with a placeholder line in the same container, so nothing shifts when the real content arrives. The placeholder is aria-hidden."
        code={`<PageHeader
  skeleton
  title="Deployments"
  description="Loading"
  breadcrumbs={<Breadcrumbs items={crumbs} />}
  meta={<Pill size={Size.Small}>meta</Pill>}
  actions={<Button>Action</Button>}
/>`}
      >
        <Box width="full" border radius="lg" paddingX={6}>
          <PageHeader
            skeleton
            title="Deployments"
            description="Loading"
            breadcrumbs={<Breadcrumbs items={CRUMBS} />}
            meta={<Pill size={Size.Small}>meta</Pill>}
            actions={<Button>Action</Button>}
          />
        </Box>
      </Example>

      <Heading level={2}>Props</Heading>
      <PropsTable
        props={[
          { name: 'title', type: 'ReactNode', description: 'Required. The page title, rendered as an h1 or h2 per headingLevel.' },
          { name: 'description', type: 'ReactNode', description: 'Muted supporting copy under the title.' },
          { name: 'breadcrumbs', type: 'ReactNode', description: 'Slot above the title; compose the kit Breadcrumbs.' },
          { name: 'meta', type: 'ReactNode', description: 'Inline metadata row under the title and description: pills, status dots, counts.' },
          { name: 'actions', type: 'ReactNode', description: 'Primary actions, end-aligned on wide layouts and wrapping below the title on narrow widths.' },
          { name: 'secondaryActions', type: 'PageHeaderAction[]', description: 'Secondary actions in an overflow menu behind a localized ellipsis button: { id, label, onSelect?, disabled? }. The button is omitted when empty.' },
          { name: 'headingLevel', type: '1 | 2', default: '1', description: 'The heading element used for the title. The visual size stays the same.' },
          { name: 'density', type: "'comfortable' | 'compact'", default: "'comfortable'", description: 'Vertical rhythm; compact trims the block padding and stack gap.' },
          { name: 'skeleton', type: 'boolean', default: 'false', description: 'Renders a placeholder with the header exact geometry.' },
        ]}
      />

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>
          The host is a <code>header</code> element: a banner landmark at the top of the page, or a
          plain group when nested inside <code>main</code>, <code>article</code>, or{' '}
          <code>section</code>.
        </li>
        <li>
          The title renders as a real <code>h1</code> or <code>h2</code> per{' '}
          <code>headingLevel</code>, so the document outline stays honest. Keep one h1 per page and
          switch to <code>headingLevel={'{'}2{'}'}</code> when the page already owns its h1.
        </li>
        <li>
          The overflow trigger is an icon-only button with a localized "More actions" name, and Menu
          wires its <code>aria-haspopup</code>, <code>aria-expanded</code>, and{' '}
          <code>aria-controls</code>.
        </li>
        <li>
          Overflow keyboard behavior is inherited from Menu: the arrow keys rove the rows, Home and
          End jump to the edges, Enter or Space selects, and Escape closes and restores focus to the
          trigger.
        </li>
        <li>
          The skeleton placeholder is <code>aria-hidden</code>; mark the loading region{' '}
          <code>aria-busy</code> at the app level.
        </li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>Use one PageHeader per page, at the top of the content region; reach for Toolbar when you need a slim control bar instead of a masthead.</li>
        <li>Keep one or two primary actions in <code>actions</code> and move everything else into <code>secondaryActions</code> so the header stays scannable.</li>
        <li>Put short, glanceable facts in <code>meta</code> (pills, status dots, counts), and full sentences in <code>description</code>.</li>
        <li>Use compact density on dashboards and nested screens where vertical space is scarce.</li>
      </ul>
    </>
  );
}
