import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { StatusDot } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

describe('StatusDot', () => {
  it('exposes a status role and accessible name when labeled', () => {
    render(<StatusDot tone="success" label="Online" />);
    expect(screen.getByRole('status', { name: 'Online' })).toBeInTheDocument();
  });

  it('renders a skeleton placeholder', () => {
    const { container } = render(<StatusDot skeleton />);
    expect(container.querySelector('[data-skeleton]')).not.toBeNull();
  });

  it('has no axe violations', async () => {
    const { container } = render(<StatusDot tone="success" label="Online" />);
    expect((await axe.run(container, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
