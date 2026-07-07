import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { SegmentedBar } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

describe('SegmentedBar', () => {
  it('renders one slice per non-zero segment', () => {
    const { container } = render(
      <SegmentedBar
        aria-label="Storage"
        data={[{ value: 40 }, { value: 30, tone: 'success' }, { value: 30, tone: 'warning' }]}
      />,
    );
    const bar = screen.getByRole('img', { name: 'Storage' });
    expect(bar.children).toHaveLength(3);
    expect(container.querySelector('svg')).toBeNull();
  });

  it('omits zero-value slices', () => {
    render(
      <SegmentedBar aria-label="Split" data={[{ value: 50 }, { value: 0 }, { value: 50 }]} />,
    );
    expect(screen.getByRole('img', { name: 'Split' }).children).toHaveLength(2);
  });

  it('summarizes the breakdown when no aria-label is given', () => {
    render(
      <SegmentedBar
        data={[
          { value: 75, label: 'Used' },
          { value: 25, label: 'Free' },
        ]}
      />,
    );
    expect(screen.getByRole('img', { name: 'Used 75%, Free 25%' })).toBeInTheDocument();
  });

  it('renders a skeleton placeholder', () => {
    const { container } = render(
      <SegmentedBar aria-label="Loading" data={[{ value: 1 }]} skeleton />,
    );
    expect(container.querySelector('[data-skeleton]')).not.toBeNull();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <SegmentedBar aria-label="Storage" data={[{ value: 60 }, { value: 40, tone: 'neutral' }]} />,
    );
    expect((await axe.run(container, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
