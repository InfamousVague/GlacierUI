import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import axe from 'axe-core';
import { DataGrid, type DataGridColumn, type DataGridRow } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

interface Person extends DataGridRow {
  id: number;
  name: string;
  age: number;
}

const COLUMNS: DataGridColumn[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'age', header: 'Age', align: 'end', sortable: true },
];

const DATA: Person[] = [
  { id: 1, name: 'Charlie', age: 30 },
  { id: 2, name: 'Alice', age: 25 },
  { id: 3, name: 'Bob', age: 40 },
];

/** The text of the first (name) cell of every data row, top to bottom. */
function nameColumn(): string[] {
  return screen
    .getAllByRole('gridcell')
    .filter((_, i) => i % 2 === 0)
    .map((c) => c.textContent ?? '');
}

describe('DataGrid', () => {
  it('renders a named grid of columnheaders and gridcells with counts', () => {
    render(<DataGrid aria-label="People" columns={COLUMNS} data={DATA} />);
    const grid = screen.getByRole('grid', { name: 'People' });
    expect(grid).toHaveAttribute('aria-rowcount', '4'); // header + 3 rows
    expect(grid).toHaveAttribute('aria-colcount', '2');
    expect(screen.getAllByRole('columnheader')).toHaveLength(2);
    expect(screen.getAllByRole('gridcell')).toHaveLength(6);
  });

  it('sorts client-side through ascending, descending, then unsorted on header click', () => {
    render(<DataGrid aria-label="People" columns={COLUMNS} data={DATA} />);
    const nameHeader = screen.getByRole('columnheader', { name: 'Name' });
    expect(nameHeader).toHaveAttribute('aria-sort', 'none');

    fireEvent.click(nameHeader);
    expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
    expect(nameColumn()).toEqual(['Alice', 'Bob', 'Charlie']);

    fireEvent.click(nameHeader);
    expect(nameHeader).toHaveAttribute('aria-sort', 'descending');
    expect(nameColumn()).toEqual(['Charlie', 'Bob', 'Alice']);

    fireEvent.click(nameHeader);
    expect(nameHeader).toHaveAttribute('aria-sort', 'none');
    expect(nameColumn()).toEqual(['Charlie', 'Alice', 'Bob']); // original order
  });

  it('sorts numeric columns numerically, not lexically', () => {
    render(<DataGrid aria-label="People" columns={COLUMNS} data={DATA} defaultSort={{ columnKey: 'age', direction: 'asc' }} />);
    expect(nameColumn()).toEqual(['Alice', 'Charlie', 'Bob']); // 25, 30, 40
  });

  it('reports sort changes and, with manualSort, leaves row order untouched', () => {
    const onSortChange = vi.fn();
    render(<DataGrid aria-label="People" columns={COLUMNS} data={DATA} manualSort onSortChange={onSortChange} />);
    fireEvent.click(screen.getByRole('columnheader', { name: 'Name' }));
    expect(onSortChange).toHaveBeenCalledWith({ columnKey: 'name', direction: 'asc' });
    expect(nameColumn()).toEqual(['Charlie', 'Alice', 'Bob']); // unchanged
  });

  it('does not sort a non-sortable column', () => {
    const cols: DataGridColumn[] = [{ key: 'name', header: 'Name' }, { key: 'age', header: 'Age' }];
    render(<DataGrid aria-label="People" columns={cols} data={DATA} />);
    const header = screen.getByRole('columnheader', { name: 'Name' });
    expect(header).not.toHaveAttribute('aria-sort');
    fireEvent.click(header);
    expect(nameColumn()).toEqual(['Charlie', 'Alice', 'Bob']);
  });

  it('selects a single row and reports the next selection', () => {
    const onSelectionChange = vi.fn();
    render(<DataGrid aria-label="People" columns={COLUMNS} data={DATA} selectable onSelectionChange={onSelectionChange} />);
    const [firstRow] = screen.getAllByLabelText('Select row');
    fireEvent.click(firstRow!);
    expect(onSelectionChange).toHaveBeenCalledWith([1]);
  });

  it('selects and clears all rows from the header checkbox', () => {
    const onSelectionChange = vi.fn();
    render(<DataGrid aria-label="People" columns={COLUMNS} data={DATA} selectable defaultSelectedIds={[]} onSelectionChange={onSelectionChange} />);
    const selectAll = screen.getByLabelText('Select all rows');
    fireEvent.click(selectAll);
    expect(onSelectionChange).toHaveBeenLastCalledWith([1, 2, 3]);
  });

  it('drives the select-all checkbox indeterminate on a partial selection', () => {
    render(<DataGrid aria-label="People" columns={COLUMNS} data={DATA} selectable selectedIds={[1]} />);
    const selectAll = screen.getByLabelText('Select all rows') as HTMLInputElement;
    expect(selectAll.indeterminate).toBe(true);
    expect(selectAll.checked).toBe(false);
  });

  it('marks the selected row aria-selected', () => {
    render(<DataGrid aria-label="People" columns={COLUMNS} data={DATA} selectable selectedIds={[2]} />);
    const rows = screen.getAllByRole('row').filter((r) => r.hasAttribute('aria-selected'));
    expect(rows.filter((r) => r.getAttribute('aria-selected') === 'true')).toHaveLength(1);
  });

  it('shows the empty state when there are no rows', () => {
    render(<DataGrid aria-label="People" columns={COLUMNS} data={[]} emptyState="Nobody here" />);
    expect(screen.getByText('Nobody here')).toBeInTheDocument();
  });

  it('falls back to a default empty message', () => {
    render(<DataGrid aria-label="People" columns={COLUMNS} data={[]} />);
    expect(screen.getByText('No results')).toBeInTheDocument();
  });

  it('marks the grid busy and hides data while loading', () => {
    render(<DataGrid aria-label="People" columns={COLUMNS} data={DATA} loading loadingRows={3} />);
    expect(screen.getByRole('grid')).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText('Charlie')).not.toBeInTheDocument();
  });

  it('moves cell focus with the arrow keys (roving tabindex)', () => {
    render(<DataGrid aria-label="People" columns={COLUMNS} data={DATA} />);
    const grid = screen.getByRole('grid');
    const cell = (r: number, c: number) => grid.querySelector(`[data-r="${r}"][data-c="${c}"]`);

    (cell(0, 0) as HTMLElement).focus();
    fireEvent.keyDown(grid, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(cell(0, 1));
    fireEvent.keyDown(grid, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(cell(1, 1));
    fireEvent.keyDown(grid, { key: 'Home' });
    expect(document.activeElement).toBe(cell(1, 0));
  });

  it('sorts a header from the keyboard with Enter', () => {
    render(<DataGrid aria-label="People" columns={COLUMNS} data={DATA} />);
    const nameHeader = screen.getByRole('columnheader', { name: 'Name' });
    fireEvent.keyDown(nameHeader, { key: 'Enter' });
    expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
    expect(nameColumn()).toEqual(['Alice', 'Bob', 'Charlie']);
  });

  it('toggles a row selection from the keyboard with Space', () => {
    const onSelectionChange = vi.fn();
    render(<DataGrid aria-label="People" columns={COLUMNS} data={DATA} selectable onSelectionChange={onSelectionChange} />);
    const grid = screen.getByRole('grid');
    const selectCell = grid.querySelector('[data-r="1"][data-c="0"]') as HTMLElement;
    fireEvent.keyDown(selectCell, { key: ' ' });
    expect(onSelectionChange).toHaveBeenCalledWith([1]);
  });

  it('renders custom cell content through a column render function', () => {
    const cols: DataGridColumn[] = [
      { key: 'name', header: 'Name' },
      { key: 'age', header: 'Age', render: (row) => `${row.age as number}y` },
    ];
    render(<DataGrid aria-label="People" columns={cols} data={DATA} />);
    expect(screen.getByText('30y')).toBeInTheDocument();
  });

  it('renders a skeleton placeholder hidden from assistive tech', () => {
    const { container } = render(<DataGrid aria-label="People" columns={COLUMNS} data={[]} skeleton />);
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('keeps exactly one tab stop after the focused row is filtered away', () => {
    const { rerender } = render(<DataGrid aria-label="People" columns={COLUMNS} data={DATA} />);
    const grid = screen.getByRole('grid');
    (grid.querySelector('[data-r="0"][data-c="0"]') as HTMLElement).focus();
    fireEvent.keyDown(grid, { key: 'ArrowDown' });
    fireEvent.keyDown(grid, { key: 'ArrowDown' }); // focus is now on a body cell
    rerender(<DataGrid aria-label="People" columns={COLUMNS} data={[]} />);
    // the grid must not drop out of the tab order: one cell still holds tabIndex 0
    expect(grid.querySelectorAll('[data-r][data-c][tabindex="0"]')).toHaveLength(1);
  });

  it('syncs the roving cell to the clicked cell so the next arrow is relative', () => {
    render(<DataGrid aria-label="People" columns={COLUMNS} data={DATA} />);
    const grid = screen.getByRole('grid');
    const cell = (r: number, c: number) => grid.querySelector(`[data-r="${r}"][data-c="${c}"]`);
    act(() => (cell(2, 1) as HTMLElement).focus()); // click-focus a non-roving cell
    fireEvent.keyDown(grid, { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(cell(2, 0)); // moved within row 2, not up to the header
  });

  it('select-all unions visible ids while preserving off-page selections', () => {
    const onSelectionChange = vi.fn();
    render(<DataGrid aria-label="People" columns={COLUMNS} data={DATA} selectable selectedIds={[99]} onSelectionChange={onSelectionChange} />);
    fireEvent.click(screen.getByLabelText('Select all rows'));
    expect(onSelectionChange).toHaveBeenLastCalledWith([99, 1, 2, 3]);
  });

  it('select-all clear removes only visible ids, keeping off-page selections', () => {
    const onSelectionChange = vi.fn();
    render(<DataGrid aria-label="People" columns={COLUMNS} data={DATA} selectable selectedIds={[1, 2, 3, 99]} onSelectionChange={onSelectionChange} />);
    fireEvent.click(screen.getByLabelText('Select all rows'));
    expect(onSelectionChange).toHaveBeenLastCalledWith([99]);
  });

  it('advertises the rendered row count including skeleton rows while loading', () => {
    render(<DataGrid aria-label="People" columns={COLUMNS} data={[]} loading loadingRows={4} />);
    expect(screen.getByRole('grid')).toHaveAttribute('aria-rowcount', '5'); // header + 4 skeletons
  });

  it('declares aria-multiselectable only when selectable', () => {
    const { rerender } = render(<DataGrid aria-label="People" columns={COLUMNS} data={DATA} selectable />);
    expect(screen.getByRole('grid')).toHaveAttribute('aria-multiselectable', 'true');
    rerender(<DataGrid aria-label="People" columns={COLUMNS} data={DATA} />);
    expect(screen.getByRole('grid')).not.toHaveAttribute('aria-multiselectable');
  });

  it('has no axe violations', async () => {
    const { container } = render(<DataGrid aria-label="People" columns={COLUMNS} data={DATA} selectable defaultSelectedIds={[1]} />);
    const results = await axe.run(container, { rules: AXE_RULES });
    expect(results.violations).toEqual([]);
  });
});
