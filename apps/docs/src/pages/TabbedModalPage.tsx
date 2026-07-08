import { useState } from 'react';
import { Button, TabbedModal } from '@perfect/react';
import { Example, PropsTable } from '../docs-ui.tsx';

const accountIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="6" r="3" />
    <path d="M3.5 15a5.5 5.5 0 0 1 11 0" />
  </svg>
);
const bellIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 7a4.5 4.5 0 0 1 9 0c0 3.5 1.5 4.5 1.5 4.5H3s1.5-1 1.5-4.5Z" />
    <path d="M7.5 14a1.5 1.5 0 0 0 3 0" />
  </svg>
);
const shieldIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 2.5 3.5 4.5v4C3.5 12 6 14.5 9 15.5c3-1 5.5-3.5 5.5-7v-4Z" />
  </svg>
);

const sections = [
  {
    id: 'account',
    label: 'Account',
    icon: accountIcon,
    content: (
      <div>
        <h3 style={{ marginTop: 0 }}>Account</h3>
        <p>Your profile, email, and display name. This pane scrolls when its content overflows.</p>
      </div>
    ),
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: bellIcon,
    content: (
      <div>
        <h3 style={{ marginTop: 0 }}>Notifications</h3>
        <p>Choose which events send you an email or a push.</p>
      </div>
    ),
  },
  {
    id: 'privacy',
    label: 'Privacy',
    icon: shieldIcon,
    content: (
      <div>
        <h3 style={{ marginTop: 0 }}>Privacy</h3>
        <p>Control who can see your activity and how your data is used.</p>
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
      <h1>TabbedModal</h1>
      <p className="lede">
        A settings-style dialog. It composes the kit&rsquo;s Modal — inheriting its portal, focus
        trap, scroll lock, and dismiss behaviour — and lays a fixed left nav rail of sections beside
        a scrollable right pane that shows the active one.
      </p>

      <h2>Examples</h2>

      <Example
        title="Basic"
        description="A rail of sections and a scrollable pane. Click a section, or use the arrow keys, to switch panes."
        code={`import { Button, TabbedModal } from '@perfect/react';

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

      <h2>Props</h2>
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
      <h3>TabbedModalSection</h3>
      <PropsTable
        props={[
          { name: 'id', type: 'string', description: 'Stable identifier, matched against value.' },
          { name: 'label', type: 'ReactNode', description: 'Nav-rail label.' },
          { name: 'icon', type: 'ReactNode', description: 'Optional leading glyph in the rail.' },
          { name: 'content', type: 'ReactNode', description: 'Body shown in the scrollable pane when active.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Dims the rail entry and skips it in navigation.' },
        ]}
      />

      <h2>Accessibility</h2>
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

      <h2>Usage</h2>
      <ul>
        <li>Reach for a TabbedModal when a dialog holds several distinct groups of settings; use a plain Modal for a single form.</li>
        <li>Keep the rail to a handful of short section labels; long lists belong in a full settings page, not a dialog.</li>
        <li>The rail stays fixed while the pane scrolls, so put long-form content inside the section, not the rail.</li>
      </ul>
    </>
  );
}
