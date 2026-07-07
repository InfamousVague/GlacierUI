import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import axe from 'axe-core';
import { SegmentedControl } from '../src/index.ts';

const OPTIONS = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

describe('SegmentedControl', () => {
  it('selects the first option by default and switches on click', () => {
    render(<SegmentedControl aria-label="Range" options={OPTIONS} />);
    const day = screen.getByRole('radio', { name: 'Day' });
    const week = screen.getByRole('radio', { name: 'Week' });
    expect(day).toBeChecked();
    fireEvent.click(week);
    expect(week).toBeChecked();
    expect(day).not.toBeChecked();
  });

  it('respects defaultValue and reports changes', () => {
    let latest: string | null = null;
    render(
      <SegmentedControl
        aria-label="Range"
        options={OPTIONS}
        defaultValue="week"
        onValueChange={(v) => (latest = v)}
      />,
    );
    expect(screen.getByRole('radio', { name: 'Week' })).toBeChecked();
    fireEvent.click(screen.getByRole('radio', { name: 'Month' }));
    expect(latest).toBe('month');
  });

  it('supports controlled usage', () => {
    const { rerender } = render(
      <SegmentedControl aria-label="Range" options={OPTIONS} value="day" />,
    );
    fireEvent.click(screen.getByRole('radio', { name: 'Month' }));
    // controlled: stays on the prop value until the owner updates it
    expect(screen.getByRole('radio', { name: 'Day' })).toBeChecked();
    rerender(<SegmentedControl aria-label="Range" options={OPTIONS} value="month" />);
    expect(screen.getByRole('radio', { name: 'Month' })).toBeChecked();
  });

  it('disables individual options', () => {
    render(
      <SegmentedControl
        aria-label="Range"
        options={[...OPTIONS.slice(0, 2), { value: 'month', label: 'Month', disabled: true }]}
      />,
    );
    expect(screen.getByRole('radio', { name: 'Month' })).toBeDisabled();
  });

  it('has no axe violations', async () => {
    const { container } = render(<SegmentedControl aria-label="Range" options={OPTIONS} />);
    const results = await axe.run(container, {
      rules: { region: { enabled: false }, 'page-has-heading-one': { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
