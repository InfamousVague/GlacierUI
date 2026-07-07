import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import axe from 'axe-core';
import { NumberInput } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

describe('NumberInput', () => {
  it('increments and decrements via the buttons and reports changes', () => {
    let latest: number | null = null;
    render(<NumberInput aria-label="Quantity" defaultValue={5} onValueChange={(v) => (latest = v)} />);
    fireEvent.click(screen.getByRole('button', { name: 'Increase' }));
    expect(latest).toBe(6);
    fireEvent.click(screen.getByRole('button', { name: 'Decrease' }));
    expect(latest).toBe(5);
  });

  it('clamps to max and disables the increase button at the bound', () => {
    let latest: number | null = null;
    render(
      <NumberInput aria-label="Quantity" defaultValue={9} max={10} onValueChange={(v) => (latest = v)} />,
    );
    const increase = screen.getByRole('button', { name: 'Increase' });
    fireEvent.click(increase);
    expect(latest).toBe(10);
    expect(increase).toBeDisabled();
  });

  it('supports controlled usage', () => {
    const { rerender } = render(<NumberInput aria-label="Count" value={2} />);
    const input = screen.getByRole('spinbutton', { name: 'Count' });
    expect(input).toHaveValue(2);
    fireEvent.click(screen.getByRole('button', { name: 'Increase' }));
    expect(input).toHaveValue(2);
    rerender(<NumberInput aria-label="Count" value={4} />);
    expect(input).toHaveValue(4);
  });

  it('renders a skeleton with no interactive control', () => {
    const { container } = render(<NumberInput aria-label="Quantity" defaultValue={5} skeleton />);
    expect(container.querySelector('[data-skeleton]')).not.toBeNull();
    expect(screen.queryByRole('spinbutton')).toBeNull();
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('has no axe violations', async () => {
    const { container } = render(<NumberInput aria-label="Quantity" defaultValue={3} />);
    expect((await axe.run(container, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
