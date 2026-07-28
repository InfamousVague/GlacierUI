import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { useState } from 'react';
import { SortableList } from '../src/index.ts';

interface Row {
  id: string;
  name: string;
}

const rows: Row[] = [
  { id: 'a', name: 'Alpha' },
  { id: 'b', name: 'Bravo' },
  { id: 'c', name: 'Charlie' },
  { id: 'd', name: 'Delta' },
];

function setup(props: Partial<React.ComponentProps<typeof SortableList<Row>>> = {}) {
  const onReorder = vi.fn();
  render(
    <SortableList
      items={rows}
      onReorder={onReorder}
      renderItem={(item) => item.name}
      getLabel={(item) => item.name}
      {...props}
    />,
  );
  return { onReorder };
}

const handles = () => screen.getAllByRole('button');
const order = (call: Row[]) => call.map((r) => r.id);
const live = () => screen.getByRole('status').textContent;

describe('SortableList', () => {
  it('renders a row per item, in order', () => {
    setup();
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      'Alpha',
      'Bravo',
      'Charlie',
      'Delta',
    ]);
  });

  it('gives every row a named handle', () => {
    // A grip with no name is unreachable and undescribable.
    setup();
    expect(screen.getByLabelText('Reorder Alpha')).toBeTruthy();
    expect(handles()).toHaveLength(4);
  });

  describe('keyboard reordering', () => {
    it('lifts a row with Space', () => {
      setup();
      fireEvent.keyDown(handles()[0]!, { key: ' ' });
      expect(handles()[0]!.getAttribute('aria-pressed')).toBe('true');
    });

    it('announces the lift', () => {
      setup();
      fireEvent.keyDown(handles()[0]!, { key: ' ' });
      expect(live()).toContain('Alpha');
      expect(live()).toContain('lifted');
    });

    it('moves a lifted row down and commits on drop', () => {
      const { onReorder } = setup();
      const handle = handles()[0]!;
      fireEvent.keyDown(handle, { key: ' ' });
      fireEvent.keyDown(handle, { key: 'ArrowDown' });
      fireEvent.keyDown(handle, { key: ' ' });
      expect(order(onReorder.mock.calls[0]![0])).toEqual(['b', 'a', 'c', 'd']);
    });

    it('moves a lifted row up', () => {
      const { onReorder } = setup();
      const handle = handles()[3]!;
      fireEvent.keyDown(handle, { key: ' ' });
      fireEvent.keyDown(handle, { key: 'ArrowUp' });
      fireEvent.keyDown(handle, { key: ' ' });
      expect(order(onReorder.mock.calls[0]![0])).toEqual(['a', 'b', 'd', 'c']);
    });

    it('moves several slots', () => {
      const { onReorder } = setup();
      const handle = handles()[0]!;
      fireEvent.keyDown(handle, { key: ' ' });
      fireEvent.keyDown(handle, { key: 'ArrowDown' });
      fireEvent.keyDown(handle, { key: 'ArrowDown' });
      fireEvent.keyDown(handle, { key: ' ' });
      expect(order(onReorder.mock.calls[0]![0])).toEqual(['b', 'c', 'a', 'd']);
    });

    it('sends a row to the top with Home', () => {
      const { onReorder } = setup();
      const handle = handles()[2]!;
      fireEvent.keyDown(handle, { key: ' ' });
      fireEvent.keyDown(handle, { key: 'Home' });
      fireEvent.keyDown(handle, { key: ' ' });
      expect(order(onReorder.mock.calls[0]![0])).toEqual(['c', 'a', 'b', 'd']);
    });

    it('sends a row to the bottom with End', () => {
      const { onReorder } = setup();
      const handle = handles()[0]!;
      fireEvent.keyDown(handle, { key: ' ' });
      fireEvent.keyDown(handle, { key: 'End' });
      fireEvent.keyDown(handle, { key: ' ' });
      expect(order(onReorder.mock.calls[0]![0])).toEqual(['b', 'c', 'd', 'a']);
    });

    it('clamps at the top rather than wrapping to the bottom', () => {
      const { onReorder } = setup();
      const handle = handles()[0]!;
      fireEvent.keyDown(handle, { key: ' ' });
      fireEvent.keyDown(handle, { key: 'ArrowUp' });
      fireEvent.keyDown(handle, { key: ' ' });
      // Nothing moved, so nothing is reported.
      expect(onReorder).not.toHaveBeenCalled();
    });

    it('announces each move with its new position', () => {
      setup();
      const handle = handles()[0]!;
      fireEvent.keyDown(handle, { key: ' ' });
      fireEvent.keyDown(handle, { key: 'ArrowDown' });
      expect(live()).toContain('2');
      expect(live()).toContain('4');
    });

    it('cancels on Escape without reporting a change', () => {
      const { onReorder } = setup();
      const handle = handles()[0]!;
      fireEvent.keyDown(handle, { key: ' ' });
      fireEvent.keyDown(handle, { key: 'ArrowDown' });
      fireEvent.keyDown(handle, { key: 'Escape' });
      expect(onReorder).not.toHaveBeenCalled();
      expect(handle.getAttribute('aria-pressed')).toBeNull();
    });

    it('says so when a lift is cancelled', () => {
      setup();
      const handle = handles()[0]!;
      fireEvent.keyDown(handle, { key: ' ' });
      fireEvent.keyDown(handle, { key: 'Escape' });
      expect(live()).toContain('original position');
    });

    it('does not report a drop that returns a row to where it started', () => {
      // Firing a change here would mark a form dirty for a gesture the user
      // visibly undid.
      const { onReorder } = setup();
      const handle = handles()[1]!;
      fireEvent.keyDown(handle, { key: ' ' });
      fireEvent.keyDown(handle, { key: 'ArrowDown' });
      fireEvent.keyDown(handle, { key: 'ArrowUp' });
      fireEvent.keyDown(handle, { key: ' ' });
      expect(onReorder).not.toHaveBeenCalled();
    });

    it('ignores the arrows when nothing is lifted', () => {
      const { onReorder } = setup();
      fireEvent.keyDown(handles()[0]!, { key: 'ArrowDown' });
      expect(onReorder).not.toHaveBeenCalled();
      expect(live()).toBe('');
    });

    it('lifts with Enter as well as Space', () => {
      setup();
      fireEvent.keyDown(handles()[0]!, { key: 'Enter' });
      expect(handles()[0]!.getAttribute('aria-pressed')).toBe('true');
    });

    it('marks the lifted row so the state is visible without a pointer', () => {
      setup();
      fireEvent.keyDown(handles()[0]!, { key: ' ' });
      expect(screen.getAllByRole('listitem')[0]!.getAttribute('data-lifted')).toBe('');
    });

    it('actually reorders when the caller applies the result', () => {
      // The list is controlled, so the visible order only changes if the caller
      // takes the array. This proves the round trip, not just the callback.
      function Harness() {
        const [items, setItems] = useState(rows);
        return (
          <SortableList items={items} onReorder={setItems} renderItem={(i) => i.name} getLabel={(i) => i.name} />
        );
      }
      render(<Harness />);
      const handle = screen.getAllByRole('button')[0]!;
      fireEvent.keyDown(handle, { key: ' ' });
      fireEvent.keyDown(handle, { key: 'ArrowDown' });
      fireEvent.keyDown(handle, { key: ' ' });
      expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual([
        'Bravo',
        'Alpha',
        'Charlie',
        'Delta',
      ]);
    });
  });

  describe('disabled', () => {
    it('drops handles from the tab order rather than leaving them focusable and inert', () => {
      setup({ disabled: true });
      for (const handle of handles()) expect((handle as HTMLButtonElement).disabled).toBe(true);
    });

    it('ignores a lift', () => {
      const { onReorder } = setup({ disabled: true });
      const handle = handles()[0]!;
      fireEvent.keyDown(handle, { key: ' ' });
      fireEvent.keyDown(handle, { key: 'ArrowDown' });
      fireEvent.keyDown(handle, { key: ' ' });
      expect(onReorder).not.toHaveBeenCalled();
    });
  });

  it('renders placeholder rows while loading', () => {
    setup({ skeleton: true, skeletonRows: 3 });
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    // No handles: there is nothing to reorder yet.
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('falls back to the id when no label is given', () => {
    render(<SortableList items={rows} onReorder={vi.fn()} renderItem={(i) => i.name} />);
    expect(screen.getByLabelText('Reorder a')).toBeTruthy();
  });

  it('announces politely, not assertively', () => {
    // A reorder is a running commentary; interrupting on every arrow press
    // would be unusable.
    setup();
    expect(screen.getByRole('status').getAttribute('aria-live')).toBe('polite');
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <SortableList items={rows} onReorder={vi.fn()} renderItem={(i) => i.name} getLabel={(i) => i.name} />,
    );
    const results = await axe.run(container, { rules: { region: { enabled: false } } });
    expect(results.violations).toEqual([]);
  });
});
