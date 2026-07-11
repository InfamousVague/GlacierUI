import { Button, Card, ContextMenu, Menu, MenuItem, MenuSeparator, MenuLabel, MenuSub, Kbd, Heading, Text, Size, TextTone } from '@glacier/react';
import { Pencil, Copy, Trash2, Share2, Mail, Link } from '@glacier/icons';
import { Example, PropsTable } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';

const editIcon = <Pencil size={16} />;
const copyIcon = <Copy size={16} />;
const trashIcon = <Trash2 size={16} />;
const shareIcon = <Share2 size={16} />;
const mailIcon = <Mail size={16} />;
const linkIcon = <Link size={16} />;

export function MenuPage() {
  return (
    <>
      <Heading level={1}>Menu</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        A dropdown list of actions anchored to a trigger. It rides the same anchored overlay as
        Popover - portalled, flipping and clamping on screen, dismiss-on-outside - with menu
        semantics: arrow-key roving focus and select-to-close.
      </Text>

      <Heading level={2}>Anatomy</Heading>
      <Text tone={TextTone.Muted}>A schematic of the anatomy with the exact spec measurements labelled.</Text>
      <ComponentBlueprint specId="menu" />

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

      <Example
        title="Context menu"
        description="Wrap any surface in a ContextMenu. Right-click - or long-press on touch - opens the same panel at the pointer; Escape, an outside press, or scrolling away dismisses it."
        code={`import { ContextMenu, MenuItem, MenuSeparator } from '@glacier/react';

<ContextMenu
  aria-label="Canvas actions"
  content={
    <>
      <MenuItem icon={copyIcon} onSelect={copy}>Copy</MenuItem>
      <MenuItem icon={editIcon} onSelect={rename}>Rename</MenuItem>
      <MenuSeparator />
      <MenuItem icon={trashIcon} danger onSelect={remove}>Delete</MenuItem>
    </>
  }
>
  <Card>Right-click or long-press this area</Card>
</ContextMenu>`}
      >
        <ContextMenu
          aria-label="Canvas actions"
          content={
            <>
              <MenuItem icon={copyIcon} onSelect={() => {}}>
                Copy
              </MenuItem>
              <MenuItem icon={editIcon} onSelect={() => {}}>
                Rename
              </MenuItem>
              <MenuSeparator />
              <MenuItem icon={trashIcon} danger onSelect={() => {}}>
                Delete
              </MenuItem>
            </>
          }
        >
          <Card>Right-click or long-press this area</Card>
        </ContextMenu>
      </Example>

      <Example
        title="Flyout submenu"
        description="A MenuSub row opens its child panel beside the row - on hover with an intent delay, or with ArrowRight/Enter. ArrowLeft steps back to the row."
        code={`import { Menu, MenuItem, MenuSub } from '@glacier/react';

<Menu trigger={<Button>Actions</Button>}>
  <MenuItem icon={editIcon} onSelect={rename}>Rename</MenuItem>
  <MenuSub label="Share" icon={shareIcon}>
    <MenuItem icon={mailIcon} onSelect={email}>Email</MenuItem>
    <MenuItem icon={linkIcon} onSelect={copyLink}>Copy link</MenuItem>
  </MenuSub>
</Menu>`}
      >
        <Menu trigger={<Button>Actions</Button>}>
          <MenuItem icon={editIcon} onSelect={() => {}}>
            Rename
          </MenuItem>
          <MenuSub label="Share" icon={shareIcon}>
            <MenuItem icon={mailIcon} onSelect={() => {}}>
              Email
            </MenuItem>
            <MenuItem icon={linkIcon} onSelect={() => {}}>
              Copy link
            </MenuItem>
          </MenuSub>
        </Menu>
      </Example>

      <Example
        title="Nested flyouts"
        description="Submenus nest: each level flies out beside its row and flips to the other side near the viewport edge. Escape closes the whole stack."
        code={`<Menu trigger={<Button>Export</Button>}>
  <MenuSub label="Export as">
    <MenuItem onSelect={pdf}>PDF</MenuItem>
    <MenuSub label="Image">
      <MenuItem onSelect={png}>PNG</MenuItem>
      <MenuItem onSelect={jpeg}>JPEG</MenuItem>
    </MenuSub>
  </MenuSub>
</Menu>`}
      >
        <Menu trigger={<Button>Export</Button>}>
          <MenuSub label="Export as">
            <MenuItem onSelect={() => {}}>PDF</MenuItem>
            <MenuSub label="Image">
              <MenuItem onSelect={() => {}}>PNG</MenuItem>
              <MenuItem onSelect={() => {}}>JPEG</MenuItem>
            </MenuSub>
          </MenuSub>
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
      <Heading level={3}>ContextMenu</Heading>
      <PropsTable
        props={[
          { name: 'content', type: 'ReactNode', description: 'Required. The menu content: MenuItem, MenuSub, MenuSeparator, MenuLabel rows.' },
          { name: 'children', type: 'ReactNode', description: 'The target the menu is summoned over; the wrapper adds no box of its own.' },
          { name: 'onOpenChange', type: '(open: boolean) => void', description: 'Called with the next open state.' },
          { name: 'aria-label', type: 'string', description: 'Accessible name for the menu panel.' },
          { name: 'menuClassName', type: 'string', description: 'Class for the portalled panel; className styles the target wrapper.' },
        ]}
      />
      <Heading level={3}>MenuSub</Heading>
      <PropsTable
        props={[
          { name: 'label', type: 'ReactNode', description: 'Required. The row label.' },
          { name: 'icon', type: 'ReactNode', description: 'Leading glyph.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Dims the row and keeps the flyout shut.' },
          { name: 'children', type: 'ReactNode', description: 'The flyout content: MenuItem rows, separators, or deeper MenuSubs.' },
          { name: 'menuClassName', type: 'string', description: 'Class for the flyout panel; className styles the row.' },
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
        <li>
          A MenuSub row carries <code>aria-haspopup="menu"</code> and <code>aria-expanded</code>.
          ArrowRight or Enter opens its flyout and focuses the first child item; ArrowLeft closes it
          and returns focus to the row; Escape closes the whole stack.
        </li>
        <li>
          A ContextMenu focuses its first item on open and restores focus to the previously focused
          element on close. On touch, a ~500ms long-press opens it; moving the pointer more than a
          few pixels cancels.
        </li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>Use a Menu for a short list of actions on an object; reach for a Select when the control sets a value.</li>
        <li>Keep labels to a verb or short phrase, and put the most common action first.</li>
        <li>Group with a MenuLabel and separate destructive actions with a MenuSeparator; mark them danger.</li>
        <li>Every action in a ContextMenu should also be reachable somewhere visible; a right-click menu is a shortcut, not the only path.</li>
        <li>Prefer one level of flyout; go to two only when the grouping genuinely earns it.</li>
      </ul>
    </>
  );
}
