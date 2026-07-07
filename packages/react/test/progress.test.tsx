import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { ProgressBar, Spinner } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

describe('ProgressBar', () => {
  it('exposes progressbar semantics with a clamped value', () => {
    render(<ProgressBar aria-label="Upload" value={140} />);
    const bar = screen.getByRole('progressbar', { name: 'Upload' });
    expect(bar).toHaveAttribute('aria-valuenow', '100');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('supports a custom max and sets the fill width', () => {
    const { container } = render(<ProgressBar aria-label="Steps" value={3} max={4} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '3');
    const fill = container.querySelector('[class*="fill"]') as HTMLElement;
    expect(fill.style.width).toBe('75%');
  });

  it('omits aria-valuenow when indeterminate', () => {
    render(<ProgressBar aria-label="Working" indeterminate />);
    expect(screen.getByRole('progressbar')).not.toHaveAttribute('aria-valuenow');
  });

  it('has no axe violations', async () => {
    const { container } = render(<ProgressBar aria-label="Upload" value={40} />);
    expect((await axe.run(container, { rules: AXE_RULES })).violations).toEqual([]);
  });
});

describe('Spinner', () => {
  it('announces as status with a default label', () => {
    render(<Spinner />);
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
  });

  it('hides from assistive tech when the label is empty', () => {
    const { container } = render(<Spinner aria-label="" />);
    const spinner = container.querySelector('[class*="spinner"]');
    expect(spinner).toHaveAttribute('aria-hidden', 'true');
  });

  it('has no axe violations', async () => {
    const { container } = render(<Spinner aria-label="Loading course" />);
    expect((await axe.run(container, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
