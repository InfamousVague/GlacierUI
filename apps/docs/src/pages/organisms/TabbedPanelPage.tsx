import { useState } from 'react';
import { Button, TabbedPanel, Heading, Text, Size, TextTone, Variant } from '@glacier/react';
import { Example, PropsTable } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';

const overview = <Text tone={TextTone.Muted}>Traffic is up 12% week over week, with mobile leading the gain.</Text>;
const activity = <Text tone={TextTone.Muted}>Six new comments and two mentions since you last checked in.</Text>;
const settings = <Text tone={TextTone.Muted}>Notifications, visibility, and export options live here.</Text>;

function ControlledExample() {
  const [value, setValue] = useState('inbox');
  return (
    <TabbedPanel
      aria-label="Messages"
      value={value}
      onValueChange={setValue}
      tabs={[
        { id: 'inbox', label: 'Inbox', count: 8, content: <Text tone={TextTone.Muted}>Eight unread threads.</Text> },
        { id: 'archive', label: 'Archive', content: <Text tone={TextTone.Muted}>Everything you have filed away.</Text> },
        { id: 'spam', label: 'Spam', count: 132, content: <Text tone={TextTone.Muted}>Filtered senders.</Text> },
      ]}
    />
  );
}

export function TabbedPanelPage() {
  return (
    <>
      <Heading level={1}>TabbedPanel</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        A framed panel with a header row of tabs and a bounded content body that switches per active
        tab. Each tab can carry a count as a CounterBadge, and the header keeps an end slot for
        actions. It follows the WAI-ARIA tabs pattern with automatic activation.
      </Text>

      <Heading level={2}>Anatomy</Heading>
      <Text tone={TextTone.Muted}>A schematic of the anatomy with the exact spec measurements labelled.</Text>
      <ComponentBlueprint specId="tabbed-panel" />

      <Heading level={2}>Examples</Heading>

      <Example
        title="Basic"
        description="A list of tabs and their content. The first enabled tab is active by default."
        code={`import { TabbedPanel } from '@glacier/react';

<TabbedPanel
  aria-label="Report"
  tabs={[
    { id: 'overview', label: 'Overview', content: overview },
    { id: 'activity', label: 'Activity', content: activity },
    { id: 'settings', label: 'Settings', content: settings },
  ]}
/>`}
      >
        <TabbedPanel
          aria-label="Report"
          tabs={[
            { id: 'overview', label: 'Overview', content: overview },
            { id: 'activity', label: 'Activity', content: activity },
            { id: 'settings', label: 'Settings', content: settings },
          ]}
        />
      </Example>

      <Example
        title="Counts and actions"
        description="Give a tab a count to render a CounterBadge, and pass actions for the header end slot."
        code={`<TabbedPanel
  aria-label="Queue"
  actions={<Button variant={Variant.Soft} size={Size.Small}>Refresh</Button>}
  tabs={[
    { id: 'open', label: 'Open', count: 3, content: openWork },
    { id: 'done', label: 'Done', count: 128, content: doneWork },
  ]}
/>`}
      >
        <TabbedPanel
          aria-label="Queue"
          actions={
            <Button variant={Variant.Soft} size={Size.Small}>
              Refresh
            </Button>
          }
          tabs={[
            { id: 'open', label: 'Open', count: 3, content: <Text tone={TextTone.Muted}>Three items need attention.</Text> },
            { id: 'done', label: 'Done', count: 128, content: <Text tone={TextTone.Muted}>Completed this week.</Text> },
          ]}
        />
      </Example>

      <Example
        title="Controlled"
        description="Drive the active tab from your own state with value and onValueChange."
        code={`const [value, setValue] = useState('inbox');

<TabbedPanel
  aria-label="Messages"
  value={value}
  onValueChange={setValue}
  tabs={[
    { id: 'inbox', label: 'Inbox', count: 8, content: inbox },
    { id: 'archive', label: 'Archive', content: archive },
    { id: 'spam', label: 'Spam', count: 132, content: spam },
  ]}
/>`}
      >
        <ControlledExample />
      </Example>

      <Example
        title="Disabled tab"
        description="A disabled tab stays visible for discoverability but is skipped by pointer and arrow navigation."
        code={`<TabbedPanel
  aria-label="Plan"
  tabs={[
    { id: 'usage', label: 'Usage', content: usage },
    { id: 'billing', label: 'Billing', disabled: true, content: billing },
  ]}
/>`}
      >
        <TabbedPanel
          aria-label="Plan"
          tabs={[
            { id: 'usage', label: 'Usage', content: <Text tone={TextTone.Muted}>Current period usage.</Text> },
            { id: 'billing', label: 'Billing', disabled: true, content: <Text tone={TextTone.Muted}>Upgrade to manage billing.</Text> },
          ]}
        />
      </Example>

      <Heading level={2}>Props</Heading>
      <PropsTable
        props={[
          { name: 'tabs', type: 'TabbedPanelTab[]', description: 'Required. Each tab is { id, label, count?, content, disabled? }.' },
          { name: 'value', type: 'string', description: 'Controlled active tab id.' },
          { name: 'defaultValue', type: 'string', description: 'Initial active tab id when uncontrolled; defaults to the first enabled tab.' },
          { name: 'onValueChange', type: '(id: string) => void', description: 'Called with the id of the newly activated tab.' },
          { name: 'actions', type: 'ReactNode', description: 'Content for the header end slot, e.g. a Button or Menu.' },
          { name: 'aria-label', type: 'string', description: 'Accessible name for the tab list.' },
        ]}
      />

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>
          The header is a <code>role="tablist"</code> of <code>role="tab"</code> buttons; the body is a{' '}
          <code>role="tabpanel"</code> linked to its tab with <code>aria-controls</code> and{' '}
          <code>aria-labelledby</code>.
        </li>
        <li>
          Activation is automatic: Arrow Left/Right move and activate tabs, wrapping and skipping
          disabled ones; Home and End jump to the extremes.
        </li>
        <li>Only the active tab is in the tab order; Tab then moves focus into the content body.</li>
        <li>A tab's count renders as a CounterBadge inside the button, so its number is announced with the tab.</li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>Reach for a TabbedPanel when related views share a frame and you want the surrounding chrome to persist; use plain Tabs when you need bare tabs with no panel.</li>
        <li>Keep tab labels to a word or two, and lead with the view users land on most.</li>
        <li>Use the count for at-a-glance backlogs (unread, open, flagged); hide it when the count is zero.</li>
        <li>Put panel-wide controls - refresh, filter, an overflow Menu - in the actions slot, not inside every tab body.</li>
      </ul>
    </>
  );
}
