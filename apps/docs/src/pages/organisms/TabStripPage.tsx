import { useState } from 'react';
import { TabStrip, type TabStripItem, Heading, Text, Size, TextTone } from '@glacier/react';
import { File } from '@glacier/icons';
import { Example, PropsTable } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';

const fileIcon = <File size={14} />;

function ControlledStrip() {
  const [tabs, setTabs] = useState<TabStripItem[]>([
    { id: 'index', label: 'index.tsx', icon: fileIcon },
    { id: 'styles', label: 'styles.css', icon: fileIcon },
    { id: 'readme', label: 'README.md', icon: fileIcon },
  ]);
  const [active, setActive] = useState('index');

  return (
    <TabStrip
      aria-label="Open files"
      tabs={tabs}
      value={active}
      onValueChange={setActive}
      onClose={(id: string) => {
        setTabs((prev) => {
          const next = prev.filter((tab) => tab.id !== id);
          if (id === active && next.length) setActive(next[0]!.id);
          return next;
        });
      }}
    />
  );
}

export function TabStripPage() {
  return (
    <>
      <Heading level={1}>TabStrip</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        A horizontal strip of closable document tabs, like the ones across the top of an editor or a
        browser. The active tab carries a springing underline, the strip scrolls when its tabs
        overflow, and every tab has its own close button.
      </Text>

      <Heading level={2}>Anatomy</Heading>
      <Text tone={TextTone.Muted}>A schematic of the anatomy with the exact spec measurements labelled.</Text>
      <ComponentBlueprint specId="tab-strip" />

      <Heading level={2}>Examples</Heading>

      <Example
        title="Closable tabs"
        description="Wire value + onValueChange for the active tab and onClose to drop one. Here the parent owns the tab list, so closing actually removes the tab."
        code={`import { useState } from 'react';
import { TabStrip, type TabStripItem } from '@glacier/react';

const [tabs, setTabs] = useState<TabStripItem[]>([
  { id: 'index', label: 'index.tsx', icon: fileIcon },
  { id: 'styles', label: 'styles.css', icon: fileIcon },
  { id: 'readme', label: 'README.md', icon: fileIcon },
]);
const [active, setActive] = useState('index');

<TabStrip
  aria-label="Open files"
  tabs={tabs}
  value={active}
  onValueChange={setActive}
  onClose={(id) => {
    setTabs((prev) => {
      const next = prev.filter((tab) => tab.id !== id);
      if (id === active && next.length) setActive(next[0].id);
      return next;
    });
  }}
/>`}
      >
        <ControlledStrip />
      </Example>

      <Example
        title="Overflow scroll"
        description="When the tabs are wider than the strip, it scrolls horizontally rather than wrapping. Constrain the width to see the scrollbar."
        code={`<div style={{ maxWidth: '20rem' }}>
  <TabStrip
    aria-label="Sheets"
    defaultValue="jan"
    tabs={[
      { id: 'jan', label: 'January' },
      { id: 'feb', label: 'February' },
      { id: 'mar', label: 'March' },
      { id: 'apr', label: 'April' },
      { id: 'may', label: 'May' },
      { id: 'jun', label: 'June' },
    ]}
    onClose={() => {}}
  />
</div>`}
      >
        <div style={{ maxWidth: '20rem' }}>
          <TabStrip
            aria-label="Sheets"
            defaultValue="jan"
            tabs={[
              { id: 'jan', label: 'January' },
              { id: 'feb', label: 'February' },
              { id: 'mar', label: 'March' },
              { id: 'apr', label: 'April' },
              { id: 'may', label: 'May' },
              { id: 'jun', label: 'June' },
            ]}
            onClose={() => {}}
          />
        </div>
      </Example>

      <Heading level={2}>Props</Heading>
      <PropsTable
        props={[
          { name: 'tabs', type: '{ id: string; label: ReactNode; icon?: ReactNode }[]', description: 'Required. The tabs to render.' },
          { name: 'value', type: 'string', description: 'Controlled active tab id.' },
          { name: 'defaultValue', type: 'string', default: 'first tab', description: 'Initial active tab id when uncontrolled.' },
          { name: 'onValueChange', type: '(id: string) => void', description: 'Called with the id of the tab that becomes active.' },
          { name: 'onClose', type: '(id: string) => void', description: 'Called with the id of the tab whose close button is pressed.' },
          { name: 'spring', type: 'Spring', default: 'Spring.Snappy', description: 'Spring preset for the active indicator.' },
          { name: 'aria-label', type: 'string', description: 'Accessible name for the strip.' },
        ]}
      />

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>
          The strip is a <code>role="tablist"</code> of <code>role="tab"</code> chips; a roving
          tabindex keeps only the active tab in the tab order.
        </li>
        <li>Arrow Left/Right move the active tab and wrap; Home and End jump to the first or last tab.</li>
        <li>Delete or Backspace closes the focused tab. Each tab also carries a close control labelled <code>Close &lt;label&gt;</code>, whose click does not also activate the tab.</li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>Own the <code>tabs</code> array in the parent and mutate it in <code>onClose</code>; TabStrip reports intent but does not remove tabs itself.</li>
        <li>When you close the active tab, move the active id to a neighbour so focus and the indicator have somewhere to land.</li>
        <li>Reorder-by-drag is out of scope for v1; if you need it, sort the <code>tabs</code> array yourself.</li>
      </ul>
    </>
  );
}
