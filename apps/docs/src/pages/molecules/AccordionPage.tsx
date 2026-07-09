import { Accordion, Heading, Text, Size, TextTone } from '@glacier/react';
import { Example, PropsTable } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';

export function AccordionPage() {
  return (
    <>
      <Heading level={1}>Accordion</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        A set of disclosure panels for progressively revealing content without leaving the current view.
      </Text>
      <Heading level={2}>Anatomy</Heading>
      <ComponentBlueprint specId="accordion" />
      <Heading level={2}>Examples</Heading>
      <Example title="Basic" description="Toggle panels open and closed." code={`<Accordion items={[{ id: 'one', title: 'Overview', content: <div>Details</div> }, { id: 'two', title: 'Specs', content: <div>More details</div> }]} />`}>
        <Accordion items={[{ id: 'one', title: 'Overview', content: <div>Details</div> }, { id: 'two', title: 'Specs', content: <div>More details</div> }]} />
      </Example>
      <Heading level={2}>Props</Heading>
      <PropsTable props={[{ name: 'items', type: 'AccordionItem[]', description: 'The accordion items to render.' }, { name: 'defaultOpen', type: 'string | string[]', description: 'Initial open item or items.' }, { name: 'allowMultiple', type: 'boolean', default: 'false', description: 'Allows more than one panel to remain open.' }]} />
    </>
  );
}
