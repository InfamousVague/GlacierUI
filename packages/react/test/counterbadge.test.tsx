import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { CounterBadge } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

describe('CounterBadge', () => {
  it('renders the count', () => {
    render(<CounterBadge count={7} />);
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('renders `99+` past the max', () => {
    render(<CounterBadge count={128} />);
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('respects a custom max', () => {
    render(<CounterBadge count={12} max={9} />);
    expect(screen.getByText('9+')).toBeInTheDocument();
  });

  it('returns null for a zero count when not a dot', () => {
    const { container } = render(<CounterBadge count={0} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders a skeleton', () => {
    const { container } = render(<CounterBadge count={3} skeleton />);
    expect(container.querySelector('[data-skeleton]')).not.toBeNull();
  });

  it('has no axe violations', async () => {
    const { container } = render(<CounterBadge count={5} aria-label="5 unread" />);
    expect((await axe.run(container, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
