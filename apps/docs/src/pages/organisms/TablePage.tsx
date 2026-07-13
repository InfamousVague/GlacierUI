import { Heading, Text, Size, TextTone, useT } from '@glacier/react';
import { Example, PropsTable } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

export function TablePage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.tblName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(m.tblLede)}
      </Text>
      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <ComponentBlueprint specId="table" />
      <Heading level={2}>{t(m.secExamples)}</Heading>
      <Example
        title={t(m.exBasic)}
        description={t(m.tblEx1Desc)}
        component="Table"
        render={(K) => (
          <K.Table caption={t(m.tableMembers)} columns={[{ key: 'name', header: 'Name' }, { key: 'role', header: 'Role' }]} data={[{ name: 'Ada', role: 'Engineer' }]} />
        )}
        code={`<Table caption="Members" columns={[{ key: 'name', header: 'Name' }, { key: 'role', header: 'Role' }]} data={[{ name: 'Ada', role: 'Engineer' }]} />`}
      />
      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable props={[{ name: 'columns', type: 'TableColumn[]', description: t(m.tblPropColumns) }, { name: 'data', type: 'Record<string, unknown>[]', description: t(m.tblPropData) }, { name: 'caption', type: 'ReactNode', description: t(m.tblPropCaption) }, { name: 'emptyState', type: 'ReactNode', description: t(m.tblPropEmptyState) }]} />
    </>
  );
}
