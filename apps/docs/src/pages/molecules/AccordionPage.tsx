import { Heading, Text, Size, TextTone, useT } from '@glacier/react';
import { Example, PropsTable } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

export function AccordionPage() {
  const t = useT();
  return (
    <>
      <Heading level={1}>{t(m.accName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(m.accLede)}
      </Text>
      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <ComponentBlueprint specId="accordion" />
      <Heading level={2}>{t(m.secExamples)}</Heading>
      <Example title={t(m.exBasic)} description={t(m.accEx1Desc)}
        component="Accordion"
        render={(K) => (<K.Accordion items={[{ id: 'one', title: t(m.accordionOverview), content: <div>{t(m.accordionDetails)}</div> }, { id: 'two', title: t(m.accordionSpecs), content: <div>{t(m.accordionMoreDetails)}</div> }]} />)}
        code={`<Accordion items={[{ id: 'one', title: 'Overview', content: <div>Details</div> }, { id: 'two', title: 'Specs', content: <div>More details</div> }]} />`}
      />
      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable props={[{ name: 'items', type: 'AccordionItem[]', description: t(m.accPropItems) }, { name: 'defaultOpen', type: 'string | string[]', description: t(m.accPropDefaultOpen) }, { name: 'allowMultiple', type: 'boolean', default: 'false', description: t(m.accPropAllowMultiple) }]} />
    </>
  );
}
