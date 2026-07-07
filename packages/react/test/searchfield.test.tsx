import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import axe from 'axe-core';
import { SearchField } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

describe('SearchField', () => {
  it('reports typing via onValueChange', () => {
    let latest: string | null = null;
    render(<SearchField aria-label="Search" onValueChange={(v) => (latest = v)} />);
    const searchbox = screen.getByRole('searchbox', { name: 'Search' });
    fireEvent.change(searchbox, { target: { value: 'query' } });
    expect(latest).toBe('query');
    expect(searchbox).toHaveValue('query');
  });

  it('shows a clear button when there is a value and clears it', () => {
    let latest: string | null = null;
    render(
      <SearchField aria-label="Search" defaultValue="term" onValueChange={(v) => (latest = v)} />,
    );
    const clear = screen.getByRole('button', { name: 'Clear search' });
    fireEvent.click(clear);
    expect(latest).toBe('');
    expect(screen.getByRole('searchbox', { name: 'Search' })).toHaveValue('');
    expect(screen.queryByRole('button', { name: 'Clear search' })).toBeNull();
  });

  it('renders a skeleton with no searchbox', () => {
    const { container } = render(<SearchField aria-label="Search" skeleton />);
    expect(container.querySelector('[data-skeleton]')).not.toBeNull();
    expect(screen.queryByRole('searchbox')).toBeNull();
  });

  it('has no axe violations', async () => {
    const { container } = render(<SearchField aria-label="Search" />);
    expect((await axe.run(container, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
