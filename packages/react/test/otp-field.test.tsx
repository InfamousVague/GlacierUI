import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { OtpField } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

const input = () => screen.getByRole('textbox') as HTMLInputElement;

describe('OtpField', () => {
  it('renders the declared number of cells and one real input', () => {
    const { container } = render(<OtpField length={4} />);
    expect(container.querySelectorAll('[data-cell]')).toHaveLength(4);
    expect(input().maxLength).toBe(4);
    expect(input()).toHaveAttribute('autocomplete', 'one-time-code');
  });

  it('distributes typed characters into the cells', () => {
    const { container } = render(<OtpField />);
    fireEvent.change(input(), { target: { value: '42' } });
    const cells = container.querySelectorAll('[data-cell]');
    expect(cells[0]).toHaveTextContent('4');
    expect(cells[1]).toHaveTextContent('2');
    expect(container.querySelectorAll('[data-filled]')).toHaveLength(2);
  });

  it('strips characters outside the numeric set and truncates to length', () => {
    const onValueChange = vi.fn();
    render(<OtpField length={4} onValueChange={onValueChange} />);
    fireEvent.change(input(), { target: { value: '1a2b3c4d5' } });
    expect(onValueChange).toHaveBeenCalledWith('1234');
  });

  it('accepts letters in alphanumeric mode', () => {
    const onValueChange = vi.fn();
    render(<OtpField type="alphanumeric" onValueChange={onValueChange} />);
    fireEvent.change(input(), { target: { value: 'A7-b2' } });
    expect(onValueChange).toHaveBeenCalledWith('A7b2');
  });

  it('fires onComplete once when the last cell fills', () => {
    const onComplete = vi.fn();
    render(<OtpField length={4} onComplete={onComplete} />);
    fireEvent.change(input(), { target: { value: '123' } });
    expect(onComplete).not.toHaveBeenCalled();
    fireEvent.change(input(), { target: { value: '1234' } });
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith('1234');
  });

  it('supports the controlled form', () => {
    const onValueChange = vi.fn();
    const { container, rerender } = render(<OtpField value="12" onValueChange={onValueChange} />);
    expect(container.querySelectorAll('[data-filled]')).toHaveLength(2);
    fireEvent.change(input(), { target: { value: '123' } });
    expect(onValueChange).toHaveBeenCalledWith('123');
    // display follows the prop, not the internal edit
    expect(container.querySelectorAll('[data-filled]')).toHaveLength(2);
    rerender(<OtpField value="123" onValueChange={onValueChange} />);
    expect(container.querySelectorAll('[data-filled]')).toHaveLength(3);
  });

  it('masks the entered characters when masked', () => {
    const { container } = render(<OtpField masked defaultValue="42" />);
    const cells = container.querySelectorAll('[data-cell]');
    expect(cells[0]).toHaveTextContent('•');
    expect(cells[0]).not.toHaveTextContent('4');
  });

  it('draws separators between groups', () => {
    const { container } = render(<OtpField length={6} groupSize={3} />);
    expect(container.querySelectorAll('[data-separator]')).toHaveLength(1);
    const { container: quads } = render(<OtpField length={8} groupSize={2} />);
    expect(quads.querySelectorAll('[data-separator]')).toHaveLength(3);
  });

  it('disables input and marks the root when disabled', () => {
    const { container } = render(<OtpField disabled />);
    expect(input()).toBeDisabled();
    expect(container.firstChild).toHaveAttribute('data-disabled');
  });

  it('mirrors error into aria-invalid', () => {
    const { container } = render(<OtpField error />);
    expect(input()).toHaveAttribute('aria-invalid', 'true');
    expect(container.firstChild).toHaveAttribute('data-error');
  });

  it('names the input with the localized default label', () => {
    render(<OtpField />);
    expect(screen.getByRole('textbox', { name: 'One-time code' })).toBeInTheDocument();
  });

  it('pins the cell row left-to-right', () => {
    const { container } = render(
      <div dir="rtl">
        <OtpField />
      </div>,
    );
    expect(container.querySelector('[data-cell]')?.parentElement).toHaveAttribute('dir', 'ltr');
  });

  it('renders a skeleton with one placeholder per cell', () => {
    const { container } = render(<OtpField skeleton length={5} />);
    expect(container.querySelectorAll('[data-skeleton]')).toHaveLength(5);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('forwards data-testid to the root', () => {
    render(<OtpField data-testid="otp" />);
    expect(screen.getByTestId('otp')).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    render(
      <div>
        <OtpField defaultValue="12" />
        <OtpField error defaultValue="9" length={4} />
        <OtpField disabled length={4} />
      </div>,
    );
    expect((await axe.run(document.body, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
