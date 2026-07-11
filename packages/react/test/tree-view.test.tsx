import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axe from 'axe-core';
import { TreeView, type TreeItem } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

const ITEMS: TreeItem[] = [
  {
    id: 'src',
    label: 'src',
    children: [
      {
        id: 'components',
        label: 'components',
        children: [{ id: 'button', label: 'Button.tsx' }],
      },
      { id: 'main', label: 'main.tsx' },
    ],
  },
  { id: 'locked', label: 'locked', disabled: true },
  { id: 'readme', label: 'README.md' },
];

const item = (name: string) => screen.getByRole('treeitem', { name });

describe('TreeView', () => {
  it('renders a named tree of treeitems with level, setsize, and posinset', () => {
    render(<TreeView aria-label="Files" items={ITEMS} defaultExpandedIds={['src']} />);
    expect(screen.getByRole('tree', { name: 'Files' })).toBeInTheDocument();

    const src = item('src');
    expect(src).toHaveAttribute('aria-expanded', 'true');
    expect(src).toHaveAttribute('aria-level', '1');
    expect(src).toHaveAttribute('aria-setsize', '3');
    expect(src).toHaveAttribute('aria-posinset', '1');

    const main = item('main.tsx');
    expect(main).toHaveAttribute('aria-level', '2');
    expect(main).toHaveAttribute('aria-setsize', '2');
    expect(main).toHaveAttribute('aria-posinset', '2');
    expect(main).not.toHaveAttribute('aria-expanded'); // leaves do not claim expandability

    expect(screen.getByRole('group')).toBeInTheDocument();
    expect(screen.queryByRole('treeitem', { name: /Button\.tsx/ })).not.toBeInTheDocument();
  });

  it('forwards rest props like data-testid to the root', () => {
    render(<TreeView aria-label="Files" items={ITEMS} data-testid="tree" />);
    expect(screen.getByTestId('tree')).toHaveRole('tree');
  });

  it('expands and selects a parent on click, and collapses on a second click', async () => {
    const onSelect = vi.fn();
    const onExpandedChange = vi.fn();
    render(
      <TreeView aria-label="Files" items={ITEMS} onSelect={onSelect} onExpandedChange={onExpandedChange} />,
    );
    fireEvent.click(screen.getByText('src'));
    expect(onExpandedChange).toHaveBeenCalledWith(['src']);
    expect(onSelect).toHaveBeenCalledWith('src');
    expect(item('src')).toHaveAttribute('aria-expanded', 'true');
    expect(item('src')).toHaveAttribute('aria-selected', 'true');
    expect(item('main.tsx')).toBeInTheDocument();

    fireEvent.click(screen.getByText('src'));
    expect(onExpandedChange).toHaveBeenLastCalledWith([]);
    expect(item('src')).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() =>
      expect(screen.queryByRole('treeitem', { name: /main\.tsx/ })).not.toBeInTheDocument(),
    );
  });

  it('selects a leaf on click without touching expansion', () => {
    const onSelect = vi.fn();
    const onExpandedChange = vi.fn();
    render(
      <TreeView aria-label="Files" items={ITEMS} onSelect={onSelect} onExpandedChange={onExpandedChange} />,
    );
    fireEvent.click(screen.getByText('README.md'));
    expect(onSelect).toHaveBeenCalledWith('readme');
    expect(onExpandedChange).not.toHaveBeenCalled();
    expect(item('README.md')).toHaveAttribute('aria-selected', 'true');
  });

  it('honors controlled expansion and selection', () => {
    const { rerender } = render(
      <TreeView aria-label="Files" items={ITEMS} expandedIds={[]} selectedId="readme" onExpandedChange={() => {}} onSelect={() => {}} />,
    );
    expect(screen.queryByRole('treeitem', { name: /main\.tsx/ })).not.toBeInTheDocument();
    expect(item('README.md')).toHaveAttribute('aria-selected', 'true');

    // clicking does not move a controlled tree on its own
    fireEvent.click(screen.getByText('src'));
    expect(item('src')).toHaveAttribute('aria-expanded', 'false');
    expect(item('src')).toHaveAttribute('aria-selected', 'false');

    rerender(
      <TreeView aria-label="Files" items={ITEMS} expandedIds={['src']} selectedId="main" onExpandedChange={() => {}} onSelect={() => {}} />,
    );
    expect(item('src')).toHaveAttribute('aria-expanded', 'true');
    expect(item('main.tsx')).toHaveAttribute('aria-selected', 'true');
  });

  it('keeps exactly one visible row in the tab order (roving tabindex)', () => {
    render(<TreeView aria-label="Files" items={ITEMS} defaultExpandedIds={['src']} />);
    const rows = screen.getAllByRole('treeitem');
    expect(rows.filter((row) => row.getAttribute('tabindex') === '0')).toHaveLength(1);
    expect(item('src')).toHaveAttribute('tabindex', '0'); // first enabled row by default

    fireEvent.keyDown(item('src'), { key: 'ArrowDown' });
    expect(item('components')).toHaveAttribute('tabindex', '0');
    expect(item('components')).toHaveFocus();
    expect(item('src')).toHaveAttribute('tabindex', '-1');
    expect(
      screen.getAllByRole('treeitem').filter((row) => row.getAttribute('tabindex') === '0'),
    ).toHaveLength(1);
  });

  it('starts the tab order at the selected row', () => {
    render(<TreeView aria-label="Files" items={ITEMS} defaultSelectedId="readme" />);
    expect(item('README.md')).toHaveAttribute('tabindex', '0');
    expect(item('src')).toHaveAttribute('tabindex', '-1');
  });

  it('moves through visible rows with ArrowDown and ArrowUp, skipping disabled rows', () => {
    render(<TreeView aria-label="Files" items={ITEMS} defaultExpandedIds={['src']} />);
    fireEvent.keyDown(item('src'), { key: 'ArrowDown' });
    expect(item('components')).toHaveFocus();
    fireEvent.keyDown(item('components'), { key: 'ArrowDown' });
    expect(item('main.tsx')).toHaveFocus(); // components is collapsed, Button.tsx not visible
    fireEvent.keyDown(item('main.tsx'), { key: 'ArrowDown' });
    expect(item('README.md')).toHaveFocus(); // skipped the disabled row
    fireEvent.keyDown(item('README.md'), { key: 'ArrowDown' });
    expect(item('README.md')).toHaveFocus(); // no wrap past the end
    fireEvent.keyDown(item('README.md'), { key: 'ArrowUp' });
    expect(item('main.tsx')).toHaveFocus();
  });

  it('expands with ArrowRight, then descends into the branch', () => {
    render(<TreeView aria-label="Files" items={ITEMS} />);
    const src = item('src');
    src.focus();
    fireEvent.keyDown(src, { key: 'ArrowRight' });
    expect(src).toHaveAttribute('aria-expanded', 'true');
    expect(src).toHaveFocus(); // first press only expands
    fireEvent.keyDown(src, { key: 'ArrowRight' });
    expect(item('components')).toHaveFocus(); // second press moves to the first child
    fireEvent.keyDown(item('main.tsx'), { key: 'ArrowRight' }); // a leaf ignores ArrowRight
    expect(item('main.tsx')).not.toHaveAttribute('aria-expanded');
  });

  it('collapses with ArrowLeft, then ascends to the parent', () => {
    render(<TreeView aria-label="Files" items={ITEMS} defaultExpandedIds={['src', 'components']} />);
    const button = item('Button.tsx');
    fireEvent.keyDown(button, { key: 'ArrowLeft' });
    expect(item('components')).toHaveFocus(); // a leaf ascends
    fireEvent.keyDown(item('components'), { key: 'ArrowLeft' });
    expect(item('components')).toHaveAttribute('aria-expanded', 'false'); // an open parent collapses
    expect(item('components')).toHaveFocus();
    fireEvent.keyDown(item('components'), { key: 'ArrowLeft' });
    expect(item('src')).toHaveFocus(); // a closed parent ascends
  });

  it('jumps to the extremes with Home and End', () => {
    render(<TreeView aria-label="Files" items={ITEMS} defaultExpandedIds={['src']} />);
    fireEvent.keyDown(item('src'), { key: 'End' });
    expect(item('README.md')).toHaveFocus(); // the disabled row is not a stop
    fireEvent.keyDown(item('README.md'), { key: 'Home' });
    expect(item('src')).toHaveFocus();
  });

  it('selects with Enter and Space, toggling parents', () => {
    const onSelect = vi.fn();
    render(<TreeView aria-label="Files" items={ITEMS} defaultExpandedIds={['src']} onSelect={onSelect} />);
    fireEvent.keyDown(item('main.tsx'), { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith('main');
    expect(item('main.tsx')).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(item('src'), { key: ' ' });
    expect(onSelect).toHaveBeenCalledWith('src');
    expect(item('src')).toHaveAttribute('aria-expanded', 'false'); // Space also collapsed the parent
  });

  it('leaves disabled rows dimmed, unselectable, and out of the tab order', () => {
    const onSelect = vi.fn();
    render(<TreeView aria-label="Files" items={ITEMS} onSelect={onSelect} />);
    const locked = item('locked');
    expect(locked).toHaveAttribute('aria-disabled', 'true');
    expect(locked).toHaveAttribute('tabindex', '-1');
    expect(locked).not.toHaveAttribute('aria-selected');
    fireEvent.click(screen.getByText('locked'));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('renders a skeleton placeholder instead of a tree', () => {
    render(<TreeView aria-label="Files" items={[]} skeleton data-testid="tree" />);
    expect(screen.queryByRole('tree')).not.toBeInTheDocument();
    expect(screen.getByTestId('tree')).toHaveAttribute('aria-hidden', 'true');
  });

  it('has no axe violations', async () => {
    render(<TreeView aria-label="Files" items={ITEMS} defaultExpandedIds={['src']} defaultSelectedId="main" />);
    await screen.findByRole('tree');
    expect((await axe.run(document.body, { rules: AXE_RULES })).violations).toEqual([]);
  });

  describe('in RTL', () => {
    it('expands with ArrowLeft, then descends into the branch', () => {
      render(
        <div dir="rtl">
          <TreeView aria-label="Files" items={ITEMS} />
        </div>,
      );
      const src = item('src');
      src.focus();
      fireEvent.keyDown(src, { key: 'ArrowLeft' });
      expect(src).toHaveAttribute('aria-expanded', 'true');
      expect(src).toHaveFocus(); // first press only expands
      fireEvent.keyDown(src, { key: 'ArrowLeft' });
      expect(item('components')).toHaveFocus(); // second press moves to the first child
    });

    it('collapses with ArrowRight, then ascends to the parent', () => {
      render(
        <div dir="rtl">
          <TreeView aria-label="Files" items={ITEMS} defaultExpandedIds={['src', 'components']} />
        </div>,
      );
      fireEvent.keyDown(item('Button.tsx'), { key: 'ArrowRight' });
      expect(item('components')).toHaveFocus(); // a leaf ascends
      fireEvent.keyDown(item('components'), { key: 'ArrowRight' });
      expect(item('components')).toHaveAttribute('aria-expanded', 'false'); // an open parent collapses
      fireEvent.keyDown(item('components'), { key: 'ArrowRight' });
      expect(item('src')).toHaveFocus(); // a closed parent ascends
    });

    it('leaves ArrowDown, ArrowUp, Home, and End untouched', () => {
      render(
        <div dir="rtl">
          <TreeView aria-label="Files" items={ITEMS} defaultExpandedIds={['src']} />
        </div>,
      );
      fireEvent.keyDown(item('src'), { key: 'ArrowDown' });
      expect(item('components')).toHaveFocus();
      fireEvent.keyDown(item('components'), { key: 'End' });
      expect(item('README.md')).toHaveFocus();
      fireEvent.keyDown(item('README.md'), { key: 'Home' });
      expect(item('src')).toHaveFocus();
    });
  });
});
