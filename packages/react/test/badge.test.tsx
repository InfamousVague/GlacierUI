import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { Badge } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

describe('Badge', () => {
  it('renders its label', () => {
    render(<Badge>Live</Badge>);
    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  it('applies tone, variant, and size classes', () => {
    const { container } = render(
      <Badge tone="success" variant="solid" size="sm">
        Live
      </Badge>,
    );
    const badge = container.firstElementChild as HTMLElement;
    expect(badge.className).toMatch(/success/);
    expect(badge.className).toMatch(/solid/);
    expect(badge.className).toMatch(/sm/);
  });

  it('defaults to the neutral soft md badge', () => {
    const { container } = render(<Badge>Draft</Badge>);
    const badge = container.firstElementChild as HTMLElement;
    expect(badge.className).toMatch(/neutral/);
    expect(badge.className).toMatch(/soft/);
    expect(badge.className).toMatch(/md/);
  });

  it('forwards arbitrary span props like aria-label and className', () => {
    render(
      <Badge aria-label="Status: live" className="custom" tone="success">
        Live
      </Badge>,
    );
    const badge = screen.getByLabelText('Status: live');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toMatch(/custom/);
  });

  it('has no axe violations', async () => {
    render(
      <div>
        <Badge>Draft</Badge>
        <Badge tone="accent" variant="solid">
          New
        </Badge>
        <Badge tone="danger" size="sm">
          Failed
        </Badge>
      </div>,
    );
    expect((await axe.run(document.body, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
