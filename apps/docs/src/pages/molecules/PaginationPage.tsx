import { Heading, Text, Size, TextTone, useT } from '@glacier/react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

export function PaginationPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.pagName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.pagLede))}
      </Text>
      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <ComponentBlueprint specId="pagination" />
      <Heading level={2}>{t(m.secExamples)}</Heading>
      <Example title={t(m.exBasic)} description={t(m.pagEx1Desc)}
        component="Pagination"
        render={(K) => (<K.Pagination page={2} total={42} pageSize={10} onPageChange={() => {}} />)}
        code={`<Pagination page={2} total={42} pageSize={10} onPageChange={() => {}} />`}
      />
      <Example title={t(m.pagEx2Title)} description={t(m.pagEx2Desc)}
        component="Pagination"
        render={(K) => (<K.Pagination page={5000} total={100000} pageSize={10} boundaryCount={2} siblingCount={1} onPageChange={() => {}} />)}
        code={`<Pagination page={5000} total={100000} pageSize={10} boundaryCount={2} siblingCount={1} onPageChange={() => {}} />`}
      />
      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable props={[{ name: 'page', type: 'number', description: t(m.pagPropPage) }, { name: 'total', type: 'number', description: t(m.pagPropTotal) }, { name: 'pageSize', type: 'number', default: '10', description: t(m.pagPropPageSize) }, { name: 'onPageChange', type: 'function', description: t(m.pagPropOnPageChange) }, { name: 'siblingCount', type: 'number', default: '1', description: t(m.pagPropSiblingCount) }, { name: 'boundaryCount', type: 'number', default: '1', description: t(m.pagPropBoundaryCount) }]} />
    </>
  );
}
