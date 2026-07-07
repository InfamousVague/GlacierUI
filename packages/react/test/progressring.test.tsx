import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { ProgressRing } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

describe('ProgressRing', () => {
  it('exposes progressbar semantics with a clamped value', () => {
    render(<ProgressRing aria-label="Download" value={140} />);
    const ring = screen.getByRole('progressbar', { name: 'Download' });
    expect(ring).toHaveAttribute('aria-valuenow', '100');
    expect(ring).toHaveAttribute('aria-valuemin', '0');
    expect(ring).toHaveAttribute('aria-valuemax', '100');
  });

  it('supports a custom max', () => {
    render(<ProgressRing aria-label="Steps" value={3} max={4} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '3');
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '4');
  });

  it('clamps negative values to zero', () => {
    render(<ProgressRing aria-label="Idle" value={-20} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('renders a skeleton placeholder with no progressbar role', () => {
    const { container } = render(<ProgressRing aria-label="Loading" value={40} skeleton />);
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(container.querySelector('[data-skeleton]')).not.toBeNull();
  });

  it('has no axe violations', async () => {
    const { container } = render(<ProgressRing aria-label="Download" value={40} showValue />);
    expect((await axe.run(container, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
