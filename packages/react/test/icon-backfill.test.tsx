import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { SVGProps } from 'react';
import axe from 'axe-core';
import { IconBackfill } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

function Glyph({ color, size = 20, ...rest }: SVGProps<SVGSVGElement> & { size?: number }) {
  return <svg {...rest} data-testid="glyph" color={color} width={size} height={size} />;
}

describe('IconBackfill', () => {
  it('reuses the explicit glyph color instead of assuming an accent', () => {
    render(
      <IconBackfill data-testid="backfill">
        <Glyph color="var(--glacier-amber-9)" />
      </IconBackfill>,
    );

    expect(screen.getByTestId('backfill')).toHaveStyle({ color: 'var(--glacier-amber-9)' });
  });

  it('allows a caller to set one matching color for the plane and glyph', () => {
    render(
      <IconBackfill data-testid="backfill" color="var(--glacier-danger-solid)">
        <Glyph />
      </IconBackfill>,
    );

    expect(screen.getByTestId('backfill')).toHaveStyle({ color: 'var(--glacier-danger-solid)' });
    for (const glyph of screen.getAllByTestId('glyph')) {
      expect(glyph).toHaveAttribute('color', 'var(--glacier-danger-solid)');
    }
  });

  it('uses a second copy of the glyph as the backfill instead of a generic container shape', () => {
    const { container } = render(
      <IconBackfill>
        <Glyph />
      </IconBackfill>,
    );

    expect(container.querySelectorAll('svg')).toHaveLength(2);
    expect(container.querySelector('[data-icon-backfill]')).toBeInTheDocument();
    expect(container.querySelector('span')).not.toHaveAttribute('data-icon-backfill');
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <IconBackfill>
        <Glyph />
      </IconBackfill>,
    );

    expect((await axe.run(container, { rules: AXE_RULES })).violations).toEqual([]);
  });
});