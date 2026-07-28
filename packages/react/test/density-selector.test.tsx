import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { DensitySelector } from '../src/index.ts';

describe('DensitySelector', () => {
  it('renders every density as a localized radio card', () => {
    render(<DensitySelector aria-label="Density" value="comfortable" onValueChange={() => {}} />);

    expect(screen.getAllByRole('radio')).toHaveLength(5);
    expect(screen.getByRole('radio', { name: 'Default' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Extra Compact' })).not.toBeChecked();
  });

  it('reports clicks and follows radio keyboard navigation', () => {
    const changes: string[] = [];
    render(<DensitySelector aria-label="Density" value="comfortable" onValueChange={(value) => changes.push(value)} />);

    fireEvent.click(screen.getByRole('radio', { name: 'Compact' }));
    expect(changes.at(-1)).toBe('compact');

    const selected = screen.getByRole('radio', { name: 'Default' });
    fireEvent.keyDown(selected, { key: 'ArrowRight' });
    expect(changes.at(-1)).toBe('spacious');
    expect(screen.getByRole('radio', { name: 'Comfortable' })).toHaveFocus();
  });

  it('uses Glacier horizontal scrolling instead of widening its host', () => {
    render(<DensitySelector aria-label="Density" value="comfortable" onValueChange={() => {}} />);
    expect(screen.getByRole('radiogroup', { name: 'Density' })).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('has no axe violations', async () => {
    const { container } = render(<DensitySelector aria-label="Density" value="comfortable" onValueChange={() => {}} />);
    const results = await axe.run(container, {
      rules: { region: { enabled: false }, 'page-has-heading-one': { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});