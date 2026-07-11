import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { Field, MultiSelect } from '../src/index.ts';

const OPTIONS = [
  { value: 'apple', label: 'Apple', description: 'Crisp fruit' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry', disabled: true },
  { value: 'plum', label: 'Plum' },
];

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

function getInput() {
  return screen.getByRole('combobox', { name: 'Fruit' });
}

describe('MultiSelect', () => {
  it('toggles multiple options, renders removable tags, and submits repeated form values', () => {
    const onValueChange = vi.fn();
    const { container } = render(<MultiSelect aria-label="Fruit" name="fruit" options={OPTIONS} onValueChange={onValueChange} />);
    const input = getInput();

    fireEvent.focus(input);
    const listbox = screen.getByRole('listbox');
    expect(listbox).toHaveAttribute('aria-multiselectable', 'true');
    fireEvent.click(screen.getByRole('option', { name: 'Apple Crisp fruit' }));
    fireEvent.click(screen.getByRole('option', { name: 'Banana' }));

    expect(onValueChange).toHaveBeenLastCalledWith(['apple', 'banana']);
    expect(screen.getByRole('button', { name: 'Dismiss Apple' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dismiss Banana' })).toBeInTheDocument();
    expect(Array.from(container.querySelectorAll('input[type="hidden"]')).map((input) => (input as HTMLInputElement).value)).toEqual(['apple', 'banana']);
    expect(screen.getByRole('option', { name: 'Apple Crisp fruit' })).toHaveAttribute('aria-selected', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss Apple' }));
    expect(onValueChange).toHaveBeenLastCalledWith(['banana']);
  });

  it('keeps focus in the input, skips disabled options, and removes the last tag with Backspace', () => {
    render(<MultiSelect aria-label="Fruit" options={OPTIONS} />);
    const input = getInput();

    input.focus();
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(input).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Dismiss Apple' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dismiss Banana' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dismiss Plum' })).toBeInTheDocument();

    fireEvent.keyDown(input, { key: 'Backspace' });
    expect(screen.queryByRole('button', { name: 'Dismiss Plum' })).not.toBeInTheDocument();
  });

  it('supports controlled values and Field invalid state', () => {
    const { rerender } = render(<MultiSelect aria-label="Fruit" options={OPTIONS} value={['apple']} />);
    expect(screen.getByRole('button', { name: 'Dismiss Apple' })).toBeInTheDocument();

    rerender(
      <Field label="Fruit" error="Choose fruit">
        <MultiSelect options={OPTIONS} value={['plum']} />
      </Field>,
    );
    expect(screen.getByRole('combobox', { name: 'Fruit' })).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('button', { name: 'Dismiss Plum' })).toBeInTheDocument();
  });

  it('shows loading and empty states', () => {
    const { rerender } = render(<MultiSelect aria-label="Fruit" options={OPTIONS} loading />);
    fireEvent.focus(getInput());
    expect(screen.getByText('Loading')).toBeInTheDocument();

    rerender(<MultiSelect aria-label="Fruit" options={OPTIONS} emptyState="No fruit found" />);
    fireEvent.change(getInput(), { target: { value: 'zzz' } });
    expect(screen.getByText('No fruit found')).toBeInTheDocument();
  });

  it('has no axe violations when open', async () => {
    render(<MultiSelect aria-label="Fruit" options={OPTIONS} />);
    fireEvent.focus(getInput());
    expect((await axe.run(document.body, { rules: AXE_RULES })).violations).toEqual([]);
  });
});

describe('MultiSelect in RTL', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('aligns the listbox to the input right edge and keeps matchWidth', () => {
    render(
      <div dir="rtl">
        <MultiSelect aria-label="Fruit" options={OPTIONS} />
      </div>,
    );
    // jsdom has no layout: stub the input rect (left 100, right 300) and let
    // the listbox measure wider (260) than the input so the alignment shows
    vi.spyOn(getInput(), 'getBoundingClientRect').mockReturnValue({
      left: 100, top: 10, width: 200, height: 32, right: 300, bottom: 42, x: 100, y: 10, toJSON: () => ({}),
    } as DOMRect);
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(260);
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(80);

    fireEvent.focus(getInput());
    const listbox = screen.getByRole('listbox');
    expect(listbox.style.left).toBe('40px'); // input right 300 - menu width 260
    expect(listbox.style.top).toBe('50px'); // input bottom 42 + offset 8
    expect(listbox.style.minWidth).toBe('200px'); // matchWidth unaffected by direction
    expect(listbox).toHaveAttribute('dir', 'rtl'); // carried past the body portal
  });
});