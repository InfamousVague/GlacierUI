import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import axe from 'axe-core';
import { FilterChip } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

describe('FilterChip', () => {
  it('renders as a button with aria-pressed reflecting selection', () => {
    render(<FilterChip>Open</FilterChip>);
    const chip = screen.getByRole('button', { name: 'Open' });
    expect(chip).toHaveAttribute('type', 'button');
    expect(chip).toHaveAttribute('aria-pressed', 'false');
  });

  it('starts selected when defaultSelected is set', () => {
    render(<FilterChip defaultSelected>Open</FilterChip>);
    expect(screen.getByRole('button', { name: 'Open' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('toggles its own state and reports the next value when uncontrolled', () => {
    const onSelectedChange = vi.fn();
    render(<FilterChip onSelectedChange={onSelectedChange}>Open</FilterChip>);
    const chip = screen.getByRole('button', { name: 'Open' });
    fireEvent.click(chip);
    expect(chip).toHaveAttribute('aria-pressed', 'true');
    expect(onSelectedChange).toHaveBeenCalledWith(true);
    fireEvent.click(chip);
    expect(chip).toHaveAttribute('aria-pressed', 'false');
    expect(onSelectedChange).toHaveBeenLastCalledWith(false);
  });

  it('does not update its own state when controlled', () => {
    const onSelectedChange = vi.fn();
    render(
      <FilterChip selected={false} onSelectedChange={onSelectedChange}>
        Open
      </FilterChip>,
    );
    const chip = screen.getByRole('button', { name: 'Open' });
    fireEvent.click(chip);
    // Controlled: stays false until the parent updates the prop.
    expect(chip).toHaveAttribute('aria-pressed', 'false');
    expect(onSelectedChange).toHaveBeenCalledWith(true);
  });

  it('renders a trailing count via CounterBadge and hides it when 0', () => {
    const { rerender } = render(<FilterChip count={5}>Open</FilterChip>);
    expect(screen.getByRole('status', { name: '5 items' })).toBeInTheDocument();
    rerender(<FilterChip count={0}>Open</FilterChip>);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('does not toggle when disabled', () => {
    const onSelectedChange = vi.fn();
    render(
      <FilterChip disabled onSelectedChange={onSelectedChange}>
        Open
      </FilterChip>,
    );
    const chip = screen.getByRole('button', { name: 'Open' });
    expect(chip).toBeDisabled();
    fireEvent.click(chip);
    expect(onSelectedChange).not.toHaveBeenCalled();
    expect(chip).toHaveAttribute('aria-pressed', 'false');
  });

  it('defaults to the selection haptic kind', () => {
    render(<FilterChip>Open</FilterChip>);
    expect(screen.getByRole('button', { name: 'Open' })).toHaveAttribute('data-haptic', 'selection');
  });

  it('has no axe violations', async () => {
    render(
      <FilterChip defaultSelected count={7}>
        Featured
      </FilterChip>,
    );
    expect((await axe.run(document.body, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
