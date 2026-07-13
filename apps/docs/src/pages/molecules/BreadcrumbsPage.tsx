import { Heading, Text, Size, TextTone, useT } from '@glacier/react';
import { Example, PropsTable } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

export function BreadcrumbsPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.bcName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(m.bcLede)}
      </Text>
      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <ComponentBlueprint specId="breadcrumbs" />
      <Heading level={2}>{t(m.secExamples)}</Heading>
      <Example title={t(m.exBasic)} description={t(m.bcEx1Desc)}
        component="Breadcrumbs"
        render={(K) => (
          <K.Breadcrumbs items={[{ label: t(m.breadcrumbsHome), href: '#' }, { label: t(m.breadcrumbsDocs), href: '#' }, { label: t(m.breadcrumbsComponents), current: true }]} />
        )}
        code={`<Breadcrumbs items={[{ label: 'Home', href: '#' }, { label: 'Docs', href: '#' }, { label: 'Components', current: true }]} />`}
      />
      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable props={[{ name: 'items', type: 'BreadcrumbItem[]', description: t(m.bcPropItems) }, { name: 'separator', type: 'ReactNode', default: '/', description: t(m.bcPropSeparator) }]} />
    </>
  );
}
