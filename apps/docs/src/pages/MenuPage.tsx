import { Button, Menu, MenuItem, MenuSeparator, MenuLabel, Kbd } from '@perfect/react';
import { Example, PropsTable } from '../docs-ui.tsx';

const editIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11.5 2.5l2 2L6 12l-2.5.5L4 10z" />
  </svg>
);
const copyIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
    <path d="M3 10.5V4a1.5 1.5 0 0 1 1.5-1.5H11" />
  </svg>
);
const trashIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 4h10M6.5 4V2.75h3V4M4.5 4l.5 9h6l.5-9" />
  </svg>
);

export function MenuPage() {
  return (
    <>
      <h1>Menu</h1>
      <p className="lede">
        A dropdown list of actions anchored to a trigger. It rides the same anchored overlay as
        Popover — portalled, flipping and clamping on screen, dismiss-on-outside — with menu
        semantics: arrow-key roving focus and select-to-close.
      </p>

      <h2>Examples</h2>

      <Example
        title="Basic"
        description="A trigger and a list of actions. Choosing an item runs its onSelect and closes the menu."
        code={`import { Button, Menu, MenuItem } from '@perfect/react';

<Menu trigger={<Button>Actions</Button>}>
  <MenuItem onSelect={() => rename()}>Rename</MenuItem>
  <MenuItem onSelect={() => duplicate()}>Duplicate</MenuItem>
  <MenuItem onSelect={() => archive()}>Archive</MenuItem>
</Menu>`}
      >
        <Menu trigger={<Button>Actions</Button>}>
          <MenuItem onSelect={() => {}}>Rename</MenuItem>
          <MenuItem onSelect={() => {}}>Duplicate</MenuItem>
          <MenuItem onSelect={() => {}}>Archive</MenuItem>
        </Menu>
      </Example>

      <Example
        title="Icons and shortcuts"
        description="Items take a leading icon and a trailing shortcut hint — a Kbd reads well there."
        code={`<Menu trigger={<Button>Edit</Button>}>
  <MenuItem icon={editIcon} shortcut={<Kbd>⌘E</Kbd>} onSelect={edit}>Edit</MenuItem>
  <MenuItem icon={copyIcon} shortcut={<Kbd>⌘C</Kbd>} onSelect={copy}>Copy</MenuItem>
</Menu>`}
      >
        <Menu trigger={<Button>Edit</Button>}>
          <MenuItem icon={editIcon} shortcut={<Kbd>⌘E</Kbd>} onSelect={() => {}}>
            Edit
          </MenuItem>
          <MenuItem icon={copyIcon} shortcut={<Kbd>⌘C</Kbd>} onSelect={() => {}}>
            Copy
          </MenuItem>
        </Menu>
      </Example>

      <Example
        title="Sections, separators, and danger"
        description="Group items with a MenuLabel heading and a MenuSeparator; mark destructive actions with danger."
        code={`<Menu trigger={<Button>Options</Button>}>
  <MenuLabel>Edit</MenuLabel>
  <MenuItem icon={editIcon} onSelect={rename}>Rename</MenuItem>
  <MenuItem icon={copyIcon} onSelect={duplicate}>Duplicate</MenuItem>
  <MenuSeparator />
  <MenuItem icon={trashIcon} danger onSelect={remove}>Delete</MenuItem>
</Menu>`}
      >
        <Menu trigger={<Button>Options</Button>}>
          <MenuLabel>Edit</MenuLabel>
          <MenuItem icon={editIcon} onSelect={() => {}}>
            Rename
          </MenuItem>
          <MenuItem icon={copyIcon} onSelect={() => {}}>
            Duplicate
          </MenuItem>
          <MenuSeparator />
          <MenuItem icon={trashIcon} danger onSelect={() => {}}>
            Delete
          </MenuItem>
        </Menu>
      </Example>

      <Example
        title="Disabled item"
        description="A disabled item stays visible for discoverability but is skipped by pointer and arrow navigation."
        code={`<Menu trigger={<Button>More</Button>}>
  <MenuItem onSelect={share}>Share</MenuItem>
  <MenuItem disabled>Export (Pro)</MenuItem>
</Menu>`}
      >
        <Menu trigger={<Button>More</Button>}>
          <MenuItem onSelect={() => {}}>Share</MenuItem>
          <MenuItem disabled>Export (Pro)</MenuItem>
        </Menu>
      </Example>

      <h2>Props</h2>
      <PropsTable
        props={[
          { name: 'trigger', type: 'ReactElement', description: 'Required. Element that opens the menu; its ref and click are wired up.' },
          { name: 'placement', type: 'Placement', default: "'bottom-start'", description: 'Menu position relative to the trigger; flips when it would overflow.' },
          { name: 'open', type: 'boolean', description: 'Controlled open state.' },
          { name: 'defaultOpen', type: 'boolean', default: 'false', description: 'Initial open state when uncontrolled.' },
          { name: 'onOpenChange', type: '(open: boolean) => void', description: 'Called with the next open state.' },
          { name: 'aria-label', type: 'string', description: 'Accessible name for the menu.' },
        ]}
      />
      <h3>MenuItem</h3>
      <PropsTable
        props={[
          { name: 'onSelect', type: '() => void', description: 'Runs when the item is chosen; the menu then closes.' },
          { name: 'icon', type: 'ReactNode', description: 'Leading glyph.' },
          { name: 'shortcut', type: 'ReactNode', description: 'Trailing shortcut hint, e.g. a Kbd.' },
          { name: 'danger', type: 'boolean', default: 'false', description: 'Paints the row in the danger tone.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Dims the row and skips it in navigation.' },
        ]}
      />

      <h2>Accessibility</h2>
      <ul>
        <li>
          The trigger gains <code>aria-haspopup="menu"</code> and <code>aria-expanded</code>; the panel
          is a <code>role="menu"</code> of <code>role="menuitem"</code> rows.
        </li>
        <li>The first enabled item is focused on open. Arrow Up/Down move between items and wrap; Home and End jump to the ends.</li>
        <li>Enter or Space activates the focused item; Escape closes and returns focus to the trigger.</li>
      </ul>

      <h2>Usage</h2>
      <ul>
        <li>Use a Menu for a short list of actions on an object; reach for a Select when the control sets a value.</li>
        <li>Keep labels to a verb or short phrase, and put the most common action first.</li>
        <li>Group with a MenuLabel and separate destructive actions with a MenuSeparator; mark them danger.</li>
      </ul>
    </>
  );
}
