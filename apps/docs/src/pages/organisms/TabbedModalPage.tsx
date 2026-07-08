import { useState } from 'react';
import { Button, TabbedModal, Heading, Text, Size, TextTone } from '@glacier/react';
import { Bell, Shield, User } from '@glacier/icons';
import { Example, PropsTable } from '../../docs-ui.tsx';

const accountIcon = <User size={18} />;
const bellIcon = <Bell size={18} />;
const shieldIcon = <Shield size={18} />;

const sections = [
  {
    id: 'account',
    label: 'Account',
    icon: accountIcon,
    content: (
      <div>
        <Heading level={3} style={{ marginTop: 0 }}>Account</Heading>
        <Text tone={TextTone.Muted}>Your profile, email, and display name. This pane scrolls when its content overflows.</Text>
      </div>
    ),
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: bellIcon,
    content: (
      <div>
        <Heading level={3} style={{ marginTop: 0 }}>Notifications</Heading>
        <Text tone={TextTone.Muted}>Choose which events send you an email or a push.</Text>
      </div>
    ),
  },
  {
    id: 'privacy',
    label: 'Privacy',
    icon: shieldIcon,
    content: (
      <div>
        <Heading level={3} style={{ marginTop: 0 }}>Privacy</Heading>
        <Text tone={TextTone.Muted}>Control who can see your activity and how your data is used.</Text>
      </div>
    ),
  },
];

function BasicDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open settings</Button>
      <TabbedModal open={open} onClose={() => setOpen(false)} title="Settings" sections={sections} />
    </>
  );
}

function ControlledDemo() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('notifications');
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open on Notifications</Button>
      <TabbedModal
        open={open}
        onClose={() => setOpen(false)}
        title="Preferences"
        sections={sections}
        value={value}
        onValueChange={setValue}
      />
    </>
  );
}

export function TabbedModalPage() {
  return (
    <>
      <Heading level={1}>TabbedModal</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        A settings-style dialog. It composes the kit&rsquo;s Modal - inheriting its portal, focus
        trap, scroll lock, and dismiss behaviour - and lays a fixed left nav rail of sections beside
        a scrollable right pane that shows the active one.
      </Text>

      <Heading level={2}>Examples</Heading>

      <Example
        title="Basic"
        description="A rail of sections and a scrollable pane. Click a section, or use the arrow keys, to switch panes."
        code={`import { Button, TabbedModal } from '@glacier/react';

const sections = [
  { id: 'account', label: 'Account', icon: accountIcon, content: <AccountPane /> },
  { id: 'notifications', label: 'Notifications', icon: bellIcon, content: <NotificationsPane /> },
  { id: 'privacy', label: 'Privacy', icon: shieldIcon, content: <PrivacyPane /> },
];

function Settings() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open settings</Button>
      <TabbedModal open={open} onClose={() => setOpen(false)} title="Settings" sections={sections} />
    </>
  );
}`}
      >
        <BasicDemo />
      </Example>

      <Example
        title="Controlled section"
        description="Drive the active section with value and onValueChange to open straight to a specific pane or sync it with the URL."
        code={`const [value, setValue] = useState('notifications');

<TabbedModal
  open={open}
  onClose={close}
  title="Preferences"
  sections={sections}
  value={value}
  onValueChange={setValue}
/>`}
      >
        <ControlledDemo />
      </Example>

      <Heading level={2}>Props</Heading>
      <PropsTable
        props={[
          { name: 'open', type: 'boolean', description: 'Required. Whether the dialog is shown.' },
          { name: 'onClose', type: '() => void', description: 'Required. Called when the user dismisses via Escape, the close button, or the overlay.' },
          { name: 'sections', type: 'TabbedModalSection[]', description: 'Required. { id, label, icon?, content, disabled? } entries; the active one fills the pane.' },
          { name: 'value', type: 'string', description: 'Controlled active section id.' },
          { name: 'defaultValue', type: 'string', description: 'Initial active section id when uncontrolled.' },
          { name: 'onValueChange', type: '(value: string) => void', description: 'Called with the next active section id.' },
          { name: 'title', type: 'ReactNode', description: 'Heading shown above the two panes.' },
        ]}
      />
      <Heading level={3}>TabbedModalSection</Heading>
      <PropsTable
        props={[
          { name: 'id', type: 'string', description: 'Stable identifier, matched against value.' },
          { name: 'label', type: 'ReactNode', description: 'Nav-rail label.' },
          { name: 'icon', type: 'ReactNode', description: 'Optional leading glyph in the rail.' },
          { name: 'content', type: 'ReactNode', description: 'Body shown in the scrollable pane when active.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Dims the rail entry and skips it in navigation.' },
        ]}
      />

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>
          The left rail is a vertical <code>role="tablist"</code> of <code>role="tab"</code> entries; the right
          pane is the matching <code>role="tabpanel"</code>, labelled by its tab.
        </li>
        <li>
          Only the selected tab is in the tab order (roving <code>tabindex</code>). Arrow Up/Down move and
          activate the rail, wrapping and skipping disabled sections; Home and End jump to the ends.
        </li>
        <li>
          It inherits Modal&rsquo;s dialog semantics: <code>role="dialog"</code>, <code>aria-modal</code>,
          labelled by the title, a Tab focus trap, body scroll lock, and focus restoration on close.
        </li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>Reach for a TabbedModal when a dialog holds several distinct groups of settings; use a plain Modal for a single form.</li>
        <li>Keep the rail to a handful of short section labels; long lists belong in a full settings page, not a dialog.</li>
        <li>The rail stays fixed while the pane scrolls, so put long-form content inside the section, not the rail.</li>
      </ul>
    </>
  );
}
