import { Heading, Pagination, Text, Size, TextTone } from '@glacier/react';
import { Example, PropsTable } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';

export function PaginationPage() {
  return (
    <>
      <Heading level={1}>Pagination</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        A compact pager for moving across sets of results or content pages.
      </Text>
      <Heading level={2}>Anatomy</Heading>
      <ComponentBlueprint specId="pagination" />
      <Heading level={2}>Examples</Heading>
      <Example title="Basic" description="Move through pages with previous and next controls." code={`<Pagination page={2} total={42} pageSize={10} onPageChange={() => {}} />`}>
        <Pagination page={2} total={42} pageSize={10} onPageChange={() => {}} />
      </Example>
      <Example title="Large range" description="Keep edge pages visible for very large result sets." code={`<Pagination page={5000} total={100000} pageSize={10} boundaryCount={2} siblingCount={1} onPageChange={() => {}} />`}>
        <Pagination page={5000} total={100000} pageSize={10} boundaryCount={2} siblingCount={1} onPageChange={() => {}} />
      </Example>
      <Heading level={2}>Props</Heading>
      <PropsTable props={[{ name: 'page', type: 'number', description: 'The current page, one-based.' }, { name: 'total', type: 'number', description: 'Total items across all pages.' }, { name: 'pageSize', type: 'number', default: '10', description: 'Items per page.' }, { name: 'onPageChange', type: 'function', description: 'Called with the next selected page.' }, { name: 'siblingCount', type: 'number', default: '1', description: 'Number of pages rendered around the active one.' }, { name: 'boundaryCount', type: 'number', default: '1', description: 'Number of edge pages kept visible for large ranges.' }]} />
    </>
  );
}
