import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { useState } from 'react';
import { CommandPalette, type CommandDescriptor } from '../src/index.ts';

const commands: CommandDescriptor[] = [
  { id: 'new', label: 'New file', group: 'File', shortcut: '⌘N' },
  { id: 'open', label: 'Open project', group: 'File', keywords: 'load import' },
  { id: 'save', label: 'Save', group: 'File', disabled: true },
  { id: 'theme', label: 'Toggle theme', group: 'View', keywords: 'dark light' },
  { id: 'zen', label: 'Zen mode', group: 'View' },
];

function setup(props: Partial<React.ComponentProps<typeof CommandPalette>> = {}) {
  const onRun = vi.fn();
  const onOpenChange = vi.fn();
  render(<CommandPalette open onOpenChange={onOpenChange} commands={commands} onRun={onRun} {...props} />);
  return { onRun, onOpenChange, field: screen.getByRole('combobox') };
}

const options = () => screen.getAllByRole('option');
const activeLabel = () => options().find((o) => o.getAttribute('aria-selected') === 'true')?.textContent;

describe('CommandPalette', () => {
  it('renders nothing while closed', () => {
    render(<CommandPalette open={false} onOpenChange={vi.fn()} commands={commands} onRun={vi.fn()} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('lists every command under its group when the query is empty', () => {
    setup();
    expect(options()).toHaveLength(5);
    expect(screen.getByText('File')).toBeTruthy();
    expect(screen.getByText('View')).toBeTruthy();
  });

  it('narrows the list as the user types', () => {
    const { field } = setup();
    fireEvent.change(field, { target: { value: 'zen' } });
    expect(options()).toHaveLength(1);
    expect(options()[0]?.textContent).toContain('Zen mode');
  });

  it('surfaces the matched keyword when the query missed the label', () => {
    const { field } = setup();
    fireEvent.change(field, { target: { value: 'dark' } });
    // The row leads with the word the user typed, then the real label as
    // context, so it does not look like an unrelated result.
    expect(options()[0]?.textContent).toContain('dark');
    expect(options()[0]?.textContent).toContain('Toggle theme');
  });

  it('shows an empty message rather than an empty panel', () => {
    const { field } = setup();
    fireEvent.change(field, { target: { value: 'xyzzy' } });
    expect(screen.queryAllByRole('option')).toHaveLength(0);
    expect(screen.getByText('No matching commands')).toBeTruthy();
  });

  it('accepts a custom empty message', () => {
    const { field } = setup({ emptyLabel: 'Nothing here' });
    fireEvent.change(field, { target: { value: 'xyzzy' } });
    expect(screen.getByText('Nothing here')).toBeTruthy();
  });

  it('starts with the cursor on the first command', () => {
    setup();
    expect(activeLabel()).toContain('New file');
  });

  it('moves the cursor with the arrow keys', () => {
    const { field } = setup();
    fireEvent.keyDown(field, { key: 'ArrowDown' });
    expect(activeLabel()).toContain('Open project');
  });

  it('steps over a disabled command', () => {
    const { field } = setup();
    fireEvent.keyDown(field, { key: 'ArrowDown' });
    fireEvent.keyDown(field, { key: 'ArrowDown' });
    // 'Save' sits between and is disabled, so the cursor lands past it.
    expect(activeLabel()).toContain('Toggle theme');
  });

  it('wraps from the last command back to the first', () => {
    const { field } = setup();
    fireEvent.keyDown(field, { key: 'End' });
    fireEvent.keyDown(field, { key: 'ArrowDown' });
    expect(activeLabel()).toContain('New file');
  });

  it('jumps to the last command with End', () => {
    const { field } = setup();
    fireEvent.keyDown(field, { key: 'End' });
    expect(activeLabel()).toContain('Zen mode');
  });

  it('jumps back to the first with Home', () => {
    const { field } = setup();
    fireEvent.keyDown(field, { key: 'End' });
    fireEvent.keyDown(field, { key: 'Home' });
    expect(activeLabel()).toContain('New file');
  });

  it('re-seats the cursor on the new top row after typing', () => {
    // Otherwise the cursor keeps an index that now addresses a different
    // command, and Enter runs something the user never looked at.
    const { field, onRun } = setup();
    fireEvent.keyDown(field, { key: 'End' });
    fireEvent.change(field, { target: { value: 'file' } });
    fireEvent.keyDown(field, { key: 'Enter' });
    expect(onRun).toHaveBeenCalledWith('new');
  });

  it('runs the command under the cursor on Enter', () => {
    const { field, onRun } = setup();
    fireEvent.keyDown(field, { key: 'ArrowDown' });
    fireEvent.keyDown(field, { key: 'Enter' });
    expect(onRun).toHaveBeenCalledWith('open');
  });

  it('closes before it reports the command', () => {
    // A command that opens a dialog of its own should not race this overlay's
    // teardown for the focus.
    const order: string[] = [];
    render(
      <CommandPalette
        open
        onOpenChange={() => order.push('close')}
        commands={commands}
        onRun={() => order.push('run')}
      />,
    );
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' });
    expect(order).toEqual(['close', 'run']);
  });

  it('runs a command on press', () => {
    const { onRun } = setup();
    fireEvent.mouseDown(screen.getByText('Zen mode'));
    expect(onRun).toHaveBeenCalledWith('zen');
  });

  it('does not run a disabled command on press', () => {
    const { onRun } = setup();
    fireEvent.mouseDown(screen.getByText('Save'));
    expect(onRun).not.toHaveBeenCalled();
  });

  it('does not run a disabled command with Enter either', () => {
    const { field, onRun } = setup();
    fireEvent.change(field, { target: { value: 'save' } });
    fireEvent.keyDown(field, { key: 'Enter' });
    expect(onRun).not.toHaveBeenCalled();
  });

  it('moves the cursor to the row under the pointer', () => {
    setup();
    fireEvent.mouseMove(screen.getByText('Zen mode'));
    expect(activeLabel()).toContain('Zen mode');
  });

  it('leaves the cursor alone when the pointer is over a disabled row', () => {
    setup();
    fireEvent.mouseMove(screen.getByText('Save'));
    expect(activeLabel()).toContain('New file');
  });

  it('closes on the overlay press', () => {
    const { onOpenChange } = setup();
    fireEvent.click(screen.getByRole('dialog').parentElement!);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('does not close when the panel itself is pressed', () => {
    const { onOpenChange } = setup();
    fireEvent.click(screen.getByRole('dialog'));
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('closes on Escape', () => {
    const { onOpenChange } = setup();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('opens on Cmd+K', () => {
    const onOpenChange = vi.fn();
    render(<CommandPalette open={false} onOpenChange={onOpenChange} commands={commands} onRun={vi.fn()} />);
    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('opens on Ctrl+K too', () => {
    const onOpenChange = vi.fn();
    render(<CommandPalette open={false} onOpenChange={onOpenChange} commands={commands} onRun={vi.fn()} />);
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('leaves the chord alone when the shortcut is off', () => {
    const onOpenChange = vi.fn();
    render(
      <CommandPalette open={false} shortcut={false} onOpenChange={onOpenChange} commands={commands} onRun={vi.fn()} />,
    );
    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('shows a command shortcut hint', () => {
    setup();
    expect(screen.getByText('⌘N')).toBeTruthy();
  });

  it('renders the key-hint footer, and drops it when asked', () => {
    const { field } = setup();
    expect(field).toBeTruthy();
    expect(screen.getByText(/to navigate/)).toBeTruthy();

    render(
      <CommandPalette open footer={null} onOpenChange={vi.fn()} commands={commands} onRun={vi.fn()} />,
    );
    expect(screen.queryAllByText(/to navigate/)).toHaveLength(1);
  });

  it('reports the query as the user types', () => {
    const onQueryChange = vi.fn();
    const { field } = setup({ onQueryChange });
    fireEvent.change(field, { target: { value: 'ze' } });
    expect(onQueryChange).toHaveBeenCalledWith('ze');
  });

  it('honours a controlled query', () => {
    setup({ query: 'zen' });
    expect(options()).toHaveLength(1);
  });

  it('clears an uncontrolled query when it reopens', () => {
    // A stale search would hide most of the list behind a query the user has
    // already forgotten typing.
    function Harness() {
      const [open, setOpen] = useState(true);
      return (
        <>
          <button onClick={() => setOpen((o) => !o)}>toggle</button>
          <CommandPalette open={open} onOpenChange={setOpen} commands={commands} onRun={vi.fn()} />
        </>
      );
    }
    render(<Harness />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'zen' } });
    expect(screen.getAllByRole('option')).toHaveLength(1);

    fireEvent.click(screen.getByText('toggle'));
    fireEvent.click(screen.getByText('toggle'));
    expect(screen.getAllByRole('option')).toHaveLength(5);
  });

  it('names the active row through aria-activedescendant', () => {
    // The row is pointed at rather than focused, which is what lets one field
    // drive the whole list.
    const { field } = setup();
    const active = options().find((o) => o.getAttribute('aria-selected') === 'true');
    expect(field.getAttribute('aria-activedescendant')).toBe(active?.id);
  });

  it('marks a disabled command as such rather than hiding it', () => {
    setup();
    const save = options().find((o) => o.textContent?.includes('Save'));
    expect(save?.getAttribute('aria-disabled')).toBe('true');
  });

  it('marks the characters that matched, in the accent', () => {
    const { field } = setup();
    fireEvent.change(field, { target: { value: 'zen' } });
    const marks = [...document.querySelectorAll('[role=option] mark')];
    expect(marks.map((m) => m.textContent)).toEqual(['Zen']);
  });

  it('marks each term of a multi-term query', () => {
    render(
      <CommandPalette
        open
        onOpenChange={vi.fn()}
        onRun={vi.fn()}
        commands={[{ id: 'rte', label: 'Rich Text Editor' }]}
        query="rich editor"
      />,
    );
    const marks = [...document.querySelectorAll('[role=option] mark')];
    expect(marks.map((m) => m.textContent)).toEqual(['Rich', 'Editor']);
  });

  it('leaves the label intact when nothing is marked', () => {
    const { field } = setup();
    expect(field).toBeTruthy();
    expect(document.querySelectorAll('[role=option] mark')).toHaveLength(0);
    expect(screen.getByText('Zen mode')).toBeTruthy();
  });

  // Regression: groups are built from ADJACENT runs, so one name can head
  // several groups in an interleaved list. Keying the group by its name handed
  // React duplicate keys, and reconciliation then left whole stale runs mounted
  // when a query narrowed the list — the palette went on showing rows that no
  // longer matched.
  it('drops every non-matching row when groups repeat a name', () => {
    const interleaved: CommandDescriptor[] = [
      { id: 'a', label: 'Alpha', group: 'One' },
      { id: 'b', label: 'Bravo', group: 'Two' },
      { id: 'c', label: 'Charlie', group: 'One' },
      { id: 'd', label: 'Delta', group: 'Two' },
      { id: 'e', label: 'Zulu', group: 'One' },
    ];
    const { field } = setup({ commands: interleaved });
    expect(options()).toHaveLength(5);

    fireEvent.change(field, { target: { value: 'zulu' } });
    expect(options()).toHaveLength(1);
    expect(options()[0]?.textContent).toContain('Zulu');
  });

  it('renders one group box per adjacent run, not one per name', () => {
    const interleaved: CommandDescriptor[] = [
      { id: 'a', label: 'Alpha', group: 'One' },
      { id: 'b', label: 'Bravo', group: 'Two' },
      { id: 'c', label: 'Charlie', group: 'One' },
    ];
    setup({ commands: interleaved });
    const heads = [...document.querySelectorAll('[role=listbox] [aria-hidden=true]')];
    expect(heads.map((h) => h.textContent)).toEqual(['One', 'Two', 'One']);
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <CommandPalette open onOpenChange={vi.fn()} commands={commands} onRun={vi.fn()} />,
    );
    const results = await axe.run(container.ownerDocument.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
