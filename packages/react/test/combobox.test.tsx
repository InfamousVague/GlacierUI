import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { Combobox, Field } from '../src/index.ts';

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

describe('Combobox', () => {
  it('filters editable input text and commits an option', () => {
    const onValueChange = vi.fn();
    render(<Combobox aria-label="Fruit" options={OPTIONS} onValueChange={onValueChange} />);
    const input = getInput();

    fireEvent.change(input, { target: { value: 'pl' } });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Plum' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Apple' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('option', { name: 'Plum' }));
    expect(onValueChange).toHaveBeenCalledWith('plum');
    expect(input).toHaveValue('Plum');
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('keeps focus in the input while navigating and skips disabled options', () => {
    render(<Combobox aria-label="Fruit" options={OPTIONS} />);
    const input = getInput();

    input.focus();
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input).toHaveFocus();
    expect(input).toHaveAttribute('aria-activedescendant');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(input).toHaveValue('Plum');
  });

  it('supports controlled selected values and form submission', () => {
    const { container, rerender } = render(<Combobox aria-label="Fruit" name="fruit" options={OPTIONS} value="apple" />);
    expect(getInput()).toHaveValue('Apple');
    const hidden = container.querySelector('input[type="hidden"]') as HTMLInputElement;
    expect(hidden).toHaveValue('apple');

    rerender(<Combobox aria-label="Fruit" name="fruit" options={OPTIONS} value="banana" />);
    expect(getInput()).toHaveValue('Banana');
  });

  it('inherits Field id and invalid state', () => {
    render(
      <Field label="Fruit" error="Choose a fruit">
        <Combobox options={OPTIONS} />
      </Field>,
    );
    expect(screen.getByRole('combobox', { name: 'Fruit' })).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows loading and empty states', () => {
    const { rerender } = render(<Combobox aria-label="Fruit" options={OPTIONS} loading />);
    fireEvent.focus(getInput());
    expect(screen.getByText('Loading')).toBeInTheDocument();

    rerender(<Combobox aria-label="Fruit" options={OPTIONS} emptyState="No fruit found" />);
    fireEvent.change(getInput(), { target: { value: 'zzz' } });
    expect(screen.getByText('No fruit found')).toBeInTheDocument();
  });

  it('has no axe violations when open', async () => {
    render(<Combobox aria-label="Fruit" options={OPTIONS} />);
    fireEvent.focus(getInput());
    expect((await axe.run(document.body, { rules: AXE_RULES })).violations).toEqual([]);
  });
});

describe('Combobox in RTL', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('aligns the listbox to the input right edge and keeps matchWidth', () => {
    render(
      <div dir="rtl">
        <Combobox aria-label="Fruit" options={OPTIONS} />
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