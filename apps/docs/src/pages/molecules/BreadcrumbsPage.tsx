import { Breadcrumbs, Heading, Text, Size, TextTone } from '@glacier/react';
import { Example, PropsTable } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';

export function BreadcrumbsPage() {
  return (
    <>
      <Heading level={1}>Breadcrumbs</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        A compact path trail for showing where the current view sits within a hierarchy.
      </Text>
      <Heading level={2}>Anatomy</Heading>
      <ComponentBlueprint specId="breadcrumbs" />
      <Heading level={2}>Examples</Heading>
      <Example title="Basic" description="Show the current path with a simple separator." code={`<Breadcrumbs items={[{ label: 'Home', href: '#' }, { label: 'Docs', href: '#' }, { label: 'Components', current: true }]} />`}>
        <Breadcrumbs items={[{ label: 'Home', href: '#' }, { label: 'Docs', href: '#' }, { label: 'Components', current: true }]} />
      </Example>
      <Heading level={2}>Props</Heading>
      <PropsTable props={[{ name: 'items', type: 'BreadcrumbItem[]', description: 'Breadcrumb entries with label, href, and current state.' }, { name: 'separator', type: 'ReactNode', default: '/', description: 'Separator rendered between items.' }]} />
    </>
  );
}
