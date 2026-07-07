import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { Sparkline } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

describe('Sparkline', () => {
  it('renders an img-role element with the aria-label', () => {
    render(<Sparkline aria-label="Weekly revenue" data={[1, 4, 2, 8, 5]} />);
    expect(screen.getByRole('img', { name: 'Weekly revenue' })).toBeInTheDocument();
  });

  it('draws a polyline for the line variant', () => {
    const { container } = render(<Sparkline aria-label="Trend" data={[1, 2, 3]} variant="line" />);
    expect(container.querySelector('polyline')).not.toBeNull();
  });

  it('draws a rect per point for the bar variant', () => {
    const { container } = render(<Sparkline aria-label="Bars" data={[1, 2, 3]} variant="bar" />);
    expect(container.querySelectorAll('rect')).toHaveLength(3);
  });

  it('does not crash on empty data', () => {
    const { container } = render(<Sparkline aria-label="Empty" data={[]} />);
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('does not crash on single-point data', () => {
    const { container } = render(<Sparkline aria-label="One" data={[7]} />);
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('renders a skeleton placeholder', () => {
    const { container } = render(<Sparkline aria-label="Loading" data={[1, 2, 3]} skeleton />);
    expect(container.querySelector('[data-skeleton]')).not.toBeNull();
  });

  it('has no axe violations', async () => {
    const { container } = render(<Sparkline aria-label="Weekly revenue" data={[1, 4, 2, 8, 5]} />);
    expect((await axe.run(container, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
