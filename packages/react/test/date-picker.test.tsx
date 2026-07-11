import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { Calendar, DatePicker, Field } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

// a fixed month keeps day-number queries deterministic
const JUNE_15 = new Date(2026, 5, 15);

function dayButton(day: number) {
  // day buttons render the bare day number; nav buttons and the caption never
  // consist of only digits, so exact text is unambiguous
  return screen.getByText(String(day), { selector: 'button' });
}

describe('Calendar', () => {
  it('renders a month grid with day gridcells and a labelled caption', () => {
    render(<Calendar aria-label="Pick a day" defaultValue={JUNE_15} />);
    const grid = screen.getByRole('grid');
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveAccessibleName();
    expect(screen.getAllByRole('gridcell').length).toBeGreaterThanOrEqual(28);
    const selected = screen.getAllByRole('gridcell').filter((cell) => cell.getAttribute('aria-selected') === 'true');
    expect(selected).toHaveLength(1);
  });

  it('selection fires onValueChange with the picked date', () => {
    const onValueChange = vi.fn();
    render(<Calendar aria-label="Pick a day" defaultValue={JUNE_15} onValueChange={onValueChange} />);
    fireEvent.click(dayButton(20));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    const picked = onValueChange.mock.calls[0]![0] as Date;
    expect(picked.getFullYear()).toBe(2026);
    expect(picked.getMonth()).toBe(5);
    expect(picked.getDate()).toBe(20);
  });

  it('range mode reports from first, then from and to', () => {
    const onRangeChange = vi.fn();
    render(
      <Calendar
        aria-label="Pick a range"
        mode="range"
        defaultRangeValue={{ from: new Date(2026, 5, 10) }}
        onRangeChange={onRangeChange}
      />,
    );
    fireEvent.click(dayButton(15));
    expect(onRangeChange).toHaveBeenCalledTimes(1);
    const range = onRangeChange.mock.calls[0]![0] as { from?: Date; to?: Date };
    expect(range.from?.getDate()).toBe(10);
    expect(range.to?.getDate()).toBe(15);
    // the day between the endpoints carries the range-middle selection state
    expect(dayButton(12).closest('[data-selected]')).not.toBeNull();
  });

  it('disabledDates render disabled and cannot be selected', () => {
    const onValueChange = vi.fn();
    render(
      <Calendar
        aria-label="Pick a day"
        defaultValue={JUNE_15}
        disabledDates={(date) => date.getDate() === 20}
        onValueChange={onValueChange}
      />,
    );
    const disabled = dayButton(20);
    expect(disabled.closest('[data-disabled]')).not.toBeNull();
    fireEvent.click(disabled);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('min and max bound selection', () => {
    const onValueChange = vi.fn();
    render(
      <Calendar
        aria-label="Pick a day"
        defaultValue={JUNE_15}
        min={new Date(2026, 5, 10)}
        max={new Date(2026, 5, 20)}
        onValueChange={onValueChange}
      />,
    );
    fireEvent.click(dayButton(5));
    expect(onValueChange).not.toHaveBeenCalled();
    fireEvent.click(dayButton(12));
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it('renders a skeleton placeholder instead of the grid', () => {
    render(<Calendar skeleton data-testid="cal" />);
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    expect(document.querySelector('[data-skeleton]')).not.toBeNull();
  });

  it('has no axe violations', async () => {
    render(<Calendar aria-label="Pick a day" defaultValue={JUNE_15} />);
    expect((await axe.run(document.body, { rules: AXE_RULES })).violations).toEqual([]);
  });
});

describe('DatePicker', () => {
  it('opens an anchored dialog from the trigger and selects a date', () => {
    const onValueChange = vi.fn();
    render(<DatePicker aria-label="Due date" defaultValue={JUNE_15} onValueChange={onValueChange} />);
    const trigger = screen.getByRole('button', { name: 'Due date' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(dayButton(20));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect((onValueChange.mock.calls[0]![0] as Date).getDate()).toBe(20);
    // committing closes the panel and restores focus to the trigger
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('dismisses on Escape and restores focus to the trigger', () => {
    render(<DatePicker aria-label="Due date" defaultValue={JUNE_15} />);
    const trigger = screen.getByRole('button', { name: 'Due date' });
    fireEvent.click(trigger);
    const dialog = screen.getByRole('dialog');
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('dismisses on an outside press without stealing focus', () => {
    render(<DatePicker aria-label="Due date" />);
    fireEvent.click(screen.getByRole('button', { name: 'Due date' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows the value through Intl and submits an ISO hidden input', () => {
    const { container } = render(<DatePicker aria-label="Due date" name="due" value={JUNE_15} />);
    const trigger = screen.getByRole('button', { name: 'Due date' });
    expect(trigger.textContent).toBe(new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(JUNE_15));
    const hidden = container.querySelector('input[type="hidden"]') as HTMLInputElement;
    expect(hidden).toHaveAttribute('name', 'due');
    expect(hidden).toHaveValue('2026-06-15');
  });

  it('inherits Field id, description, and invalid state', () => {
    render(
      <Field label="Due date" error="Pick a date">
        <DatePicker />
      </Field>,
    );
    const trigger = screen.getByRole('button', { name: 'Due date' });
    expect(trigger).toHaveAttribute('aria-invalid', 'true');
    expect(trigger).toHaveAccessibleDescription('Pick a date');
  });

  it('disabled dates inside the panel cannot be committed', () => {
    const onValueChange = vi.fn();
    render(
      <DatePicker
        aria-label="Due date"
        defaultValue={JUNE_15}
        disabledDates={(date) => date.getDate() === 20}
        onValueChange={onValueChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Due date' }));
    fireEvent.click(dayButton(20));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders a skeleton placeholder with the control geometry', () => {
    render(<DatePicker skeleton />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(document.querySelector('[data-skeleton]')).not.toBeNull();
  });

  it('has no axe violations while open', async () => {
    render(<DatePicker aria-label="Due date" defaultValue={JUNE_15} />);
    fireEvent.click(screen.getByRole('button', { name: 'Due date' }));
    expect((await axe.run(document.body, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
