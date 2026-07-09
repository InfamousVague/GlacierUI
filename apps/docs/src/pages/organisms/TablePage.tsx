import { Heading, Table, Text, Size, TextTone } from '@glacier/react';
import { Example, PropsTable } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';

export function TablePage() {
  return (
    <>
      <Heading level={1}>Table</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        A simple semantic table for displaying rows of structured data.
      </Text>
      <Heading level={2}>Anatomy</Heading>
      <ComponentBlueprint specId="table" />
      <Heading level={2}>Examples</Heading>
      <Example title="Basic" description="Render a compact data table with a caption." code={`<Table caption="Members" columns={[{ key: 'name', header: 'Name' }, { key: 'role', header: 'Role' }]} data={[{ name: 'Ada', role: 'Engineer' }]} />`}>
        <Table caption="Members" columns={[{ key: 'name', header: 'Name' }, { key: 'role', header: 'Role' }]} data={[{ name: 'Ada', role: 'Engineer' }]} />
      </Example>
      <Heading level={2}>Props</Heading>
      <PropsTable props={[{ name: 'columns', type: 'TableColumn[]', description: 'Column definitions that drive headers and cell rendering.' }, { name: 'data', type: 'Record<string, unknown>[]', description: 'Rows of data to render.' }, { name: 'caption', type: 'ReactNode', description: 'Optional caption shown above the table.' }, { name: 'emptyState', type: 'ReactNode', description: 'Message shown when there are no rows.' }]} />
    </>
  );
}
