import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { StatTile } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

const icon = (
  <svg data-testid="glyph" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
    <circle cx="8" cy="8" r="6" />
  </svg>
);

describe('StatTile', () => {
  it('renders the value and label', () => {
    render(<StatTile value="12,480" label="Total users" />);
    expect(screen.getByText('12,480')).toBeInTheDocument();
    expect(screen.getByText('Total users')).toBeInTheDocument();
  });

  it('renders a decorative, aria-hidden icon disc when an icon is passed', () => {
    const { container } = render(<StatTile icon={icon} value="42" label="Sessions" />);
    const glyph = screen.getByTestId('glyph');
    // the disc wrapper is hidden from assistive tech
    expect(glyph.parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy();
  });

  it('omits the icon disc when no icon is passed', () => {
    render(<StatTile value="42" label="Sessions" />);
    expect(screen.queryByTestId('glyph')).not.toBeInTheDocument();
  });

  it('renders a trailing hint alongside the value', () => {
    render(<StatTile value="$48.2k" label="Revenue" hint={<span>+12%</span>} />);
    expect(screen.getByText('+12%')).toBeInTheDocument();
    expect(screen.getByText('$48.2k')).toBeInTheDocument();
  });

  it('forwards arbitrary props to the container', () => {
    render(<StatTile value="7" label="Alerts" data-testid="tile" role="group" aria-label="Alerts stat" />);
    const tile = screen.getByTestId('tile');
    expect(tile).toHaveAttribute('role', 'group');
    expect(tile).toHaveAttribute('aria-label', 'Alerts stat');
  });

  it('renders a placeholder in skeleton mode without the value text', () => {
    render(<StatTile skeleton value="12,480" label="Total users" />);
    expect(screen.queryByText('12,480')).not.toBeInTheDocument();
    expect(screen.queryByText('Total users')).not.toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    render(<StatTile icon={icon} value="$48.2k" label="Revenue this month" hint={<span>+12%</span>} />);
    expect((await axe.run(document.body, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
