import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { List, ListItem } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

describe('List', () => {
  it('renders semantic rows with slots and separators', () => {
    render(
      <List aria-label="Projects" divided>
        <ListItem leading={<span>1</span>} title="GlacierUI" description="Design system" trailing="Updated today" selected />
        <ListItem title="Archive" disabled />
      </List>,
    );

    expect(screen.getByRole('list', { name: 'Projects' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('Design system')).toBeInTheDocument();
    expect(screen.getByText('Updated today')).toBeInTheDocument();
  });

  it('uses native actionable elements and blocks disabled buttons', () => {
    const onClick = vi.fn();
    render(
      <List>
        <ListItem title="Open project" onClick={onClick} />
        <ListItem title="Documentation" href="#docs" selected />
        <ListItem title="Locked" onClick={onClick} disabled />
      </List>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open project' }));
    fireEvent.click(screen.getByRole('button', { name: 'Locked' }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('link', { name: 'Documentation' })).toHaveAttribute('aria-current', 'page');
  });

  it('has no axe violations', async () => {
    render(
      <List aria-label="Projects">
        <ListItem title="GlacierUI" onClick={() => {}} />
        <ListItem title="Documentation" href="#docs" />
      </List>,
    );
    expect((await axe.run(document.body, { rules: AXE_RULES })).violations).toEqual([]);
  });
});