import { Spring } from '@perfect/motion';
import { Pill, Tabs, Text } from '@perfect/react';
import { useState } from 'react';
import { Example, PropsTable } from '../docs-ui.tsx';

export function TabsPage() {
  const [section, setSection] = useState('activity');

  return (
    <>
      <h1>Tabs</h1>
      <p className="lede">
        A tab menu for switching between content panels. The underline indicator is a shared
        layout element, so it springs between tabs with the same physics as the segmented
        control's thumb.
      </p>

      <h2>Examples</h2>

      <Example
        title="Basic"
        description="Pass tabs with a value, label, and content. Arrow keys move and activate, wrapping at the ends."
        code={`import { Tabs } from '@perfect/react';

<Tabs
  aria-label="Project sections"
  tabs={[
    { value: 'overview', label: 'Overview', content: <Text>The project at a glance.</Text> },
    { value: 'files', label: 'Files', content: <Text>Everything checked in.</Text> },
    { value: 'settings', label: 'Settings', content: <Text>Configuration and access.</Text> },
  ]}
/>`}
      >
        <div style={{ width: '100%', maxWidth: '28rem' }}>
          <Tabs
            aria-label="Project sections"
            tabs={[
              { value: 'overview', label: 'Overview', content: <Text>The project at a glance.</Text> },
              { value: 'files', label: 'Files', content: <Text>Everything checked in.</Text> },
              { value: 'settings', label: 'Settings', content: <Text>Configuration and access.</Text> },
            ]}
          />
        </div>
      </Example>

      <Example
        title="Rich labels"
        description="Labels take any content, so counts and status ride along as Pills."
        code={`<Tabs
  aria-label="Inbox"
  tabs={[
    { value: 'open', label: <>Open <Pill size="sm" tone="accent">12</Pill></>, content: <Text>Twelve open items.</Text> },
    { value: 'done', label: <>Done <Pill size="sm">248</Pill></>, content: <Text>Closed out.</Text> },
    { value: 'failed', label: <>Failed <Pill size="sm" tone="danger">3</Pill></>, content: <Text>Needs attention.</Text> },
  ]}
/>`}
      >
        <div style={{ width: '100%', maxWidth: '28rem' }}>
          <Tabs
            aria-label="Inbox"
            tabs={[
              {
                value: 'open',
                label: (
                  <>
                    Open{' '}
                    <Pill size="sm" tone="accent">
                      12
                    </Pill>
                  </>
                ),
                content: <Text>Twelve open items.</Text>,
              },
              {
                value: 'done',
                label: (
                  <>
                    Done <Pill size="sm">248</Pill>
                  </>
                ),
                content: <Text>Closed out.</Text>,
              },
              {
                value: 'failed',
                label: (
                  <>
                    Failed{' '}
                    <Pill size="sm" tone="danger">
                      3
                    </Pill>
                  </>
                ),
                content: <Text>Needs attention.</Text>,
              },
            ]}
          />
        </div>
      </Example>

      <Example
        title="Controlled"
        description="Drive the active tab with state through value and onValueChange."
        code={`const [section, setSection] = useState('activity');

<Tabs
  aria-label="Profile"
  value={section}
  onValueChange={setSection}
  tabs={[
    { value: 'posts', label: 'Posts', content: <Text>Recent posts.</Text> },
    { value: 'activity', label: 'Activity', content: <Text>This week's activity.</Text> },
  ]}
/>`}
      >
        <div className="stack" style={{ width: '100%', maxWidth: '28rem' }}>
          <Tabs
            aria-label="Profile"
            value={section}
            onValueChange={setSection}
            tabs={[
              { value: 'posts', label: 'Posts', content: <Text>Recent posts.</Text> },
              { value: 'activity', label: 'Activity', content: <Text>This week's activity.</Text> },
            ]}
          />
          <Text size="xs" tone="subtle">
            Active: <Text as="span" size="xs" mono>{section}</Text>
          </Text>
        </div>
      </Example>

      <Example
        title="Full width and disabled"
        description="fullWidth stretches tabs evenly; disabled tabs are skipped by the arrow keys."
        code={`<Tabs
  aria-label="Billing"
  fullWidth
  spring={Spring.Bouncy}
  tabs={[
    { value: 'plan', label: 'Plan', content: <Text>Current plan.</Text> },
    { value: 'invoices', label: 'Invoices', content: <Text>Past invoices.</Text> },
    { value: 'tax', label: 'Tax', disabled: true, content: null },
  ]}
/>`}
      >
        <div style={{ width: '100%', maxWidth: '28rem' }}>
          <Tabs
            aria-label="Billing"
            fullWidth
            spring={Spring.Bouncy}
            tabs={[
              { value: 'plan', label: 'Plan', content: <Text>Current plan.</Text> },
              { value: 'invoices', label: 'Invoices', content: <Text>Past invoices.</Text> },
              { value: 'tax', label: 'Tax', disabled: true, content: null },
            ]}
          />
        </div>
      </Example>

      <Example
        title="Skeleton"
        description="The skeleton prop renders a placeholder tab list on the same hairline plus two panel text lines, so the layout holds while tab data loads."
        code={`<Tabs skeleton aria-label="Project sections" tabs={[]} />`}
      >
        <div style={{ width: '100%', maxWidth: '28rem' }}>
          <Tabs skeleton aria-label="Project sections" tabs={[]} />
        </div>
      </Example>

      <h2>Props</h2>
      <h3>Tabs</h3>
      <PropsTable
        props={[
          { name: 'tabs', type: 'TabItem[]', description: 'The tabs and their panel content.' },
          { name: 'value', type: 'string', description: 'Controlled active tab.' },
          { name: 'defaultValue', type: 'string', description: 'Initial tab for uncontrolled usage. Defaults to the first enabled tab.' },
          { name: 'onValueChange', type: '(value: string) => void', description: 'Called with the new value when the active tab changes.' },
          { name: 'spring', type: 'Spring', default: 'Spring.Snappy', description: 'Physics preset for the underline indicator.' },
          { name: 'fullWidth', type: 'boolean', default: 'false', description: 'Stretches tabs to fill the list.' },
          { name: 'skeleton', type: 'boolean', default: 'false', description: "Renders a placeholder with the component's exact geometry." },
          { name: 'aria-label', type: 'string', description: 'Accessible name for the tab list.' },
        ]}
      />
      <h3>tabs entries</h3>
      <PropsTable
        props={[
          { name: 'value', type: 'string', description: 'Unique value reported through onValueChange.' },
          { name: 'label', type: 'ReactNode', description: 'Tab content; text, or text with Pills and icons.' },
          { name: 'content', type: 'ReactNode', description: 'Panel content shown while the tab is active.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Renders the tab but prevents activating it.' },
        ]}
      />

      <h2>Accessibility</h2>
      <ul>
        <li>
          Follows the WAI-ARIA tabs pattern: <code>role="tablist"</code>, <code>role="tab"</code>{' '}
          with <code>aria-selected</code> and roving tabindex, and a <code>role="tabpanel"</code>{' '}
          labeled by its tab.
        </li>
        <li>
          Activation is automatic: arrow keys move focus and select in one step, wrapping at the
          ends and skipping disabled tabs. Home and End jump to the extremes.
        </li>
        <li>The panel is focusable, so keyboard users can scroll long content.</li>
        <li>The indicator spring and panel fade collapse under prefers-reduced-motion.</li>
      </ul>

      <h2>Usage</h2>
      <ul>
        <li>Use Tabs when panels hold different content; use SegmentedControl for compact view toggles inside toolbars and forms.</li>
        <li>Keep labels to one or two words so the underline reads as one gesture.</li>
        <li>Panels mount on activation, so avoid heavy work in panel render paths.</li>
        <li>2 to 6 tabs work best; beyond that, consider a Select or sidebar navigation.</li>
      </ul>
    </>
  );
}
