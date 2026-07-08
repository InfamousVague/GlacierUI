import { Button, Menu, MenuItem, MenuSeparator, MenuLabel, Kbd, Heading, Text, Size, TextTone } from '@glacier/react';
import { Pencil, Copy, Trash2 } from '@glacier/icons';
import { Example, PropsTable } from '../../docs-ui.tsx';

const editIcon = <Pencil size={16} />;
const copyIcon = <Copy size={16} />;
const trashIcon = <Trash2 size={16} />;

export function MenuPage() {
  return (
    <>
      <Heading level={1}>Menu</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        A dropdown list of actions anchored to a trigger. It rides the same anchored overlay as
        Popover - portalled, flipping and clamping on screen, dismiss-on-outside - with menu
        semantics: arrow-key roving focus and select-to-close.
      </Text>

      <Heading level={2}>Examples</Heading>

      <Example
        title="Basic"
        description="A trigger and a list of actions. Choosing an item runs its onSelect and closes the menu."
        code={`import { Button, Menu, MenuItem } from '@glacier/react';

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
        description="Items take a leading icon and a trailing shortcut hint - a Kbd reads well there."
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

      <Heading level={2}>Props</Heading>
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
      <Heading level={3}>MenuItem</Heading>
      <PropsTable
        props={[
          { name: 'onSelect', type: '() => void', description: 'Runs when the item is chosen; the menu then closes.' },
          { name: 'icon', type: 'ReactNode', description: 'Leading glyph.' },
          { name: 'shortcut', type: 'ReactNode', description: 'Trailing shortcut hint, e.g. a Kbd.' },
          { name: 'danger', type: 'boolean', default: 'false', description: 'Paints the row in the danger tone.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Dims the row and skips it in navigation.' },
        ]}
      />

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>
          The trigger gains <code>aria-haspopup="menu"</code> and <code>aria-expanded</code>; the panel
          is a <code>role="menu"</code> of <code>role="menuitem"</code> rows.
        </li>
        <li>The first enabled item is focused on open. Arrow Up/Down move between items and wrap; Home and End jump to the ends.</li>
        <li>Enter or Space activates the focused item; Escape closes and returns focus to the trigger.</li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>Use a Menu for a short list of actions on an object; reach for a Select when the control sets a value.</li>
        <li>Keep labels to a verb or short phrase, and put the most common action first.</li>
        <li>Group with a MenuLabel and separate destructive actions with a MenuSeparator; mark them danger.</li>
      </ul>
    </>
  );
}
