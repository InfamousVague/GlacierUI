import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
// Imported from the component module directly so this suite runs before the
// kit index is wired; it exercises the same code the index re-exports.
import { NavBar, NavBarItem } from '../src/structures/NavBar/NavBar.tsx';

// region is a page-level landmark concern and these structures are tested in
// isolation, so the landmark rules do not apply here.
const AXE_RULES = {
  region: { enabled: false },
  'page-has-heading-one': { enabled: false },
};

const icon = <svg aria-hidden="true" />;

describe('NavBar', () => {
  it('renders a labelled nav landmark with items and marks the active one', () => {
    render(
      <NavBar aria-label="Primary">
        <NavBarItem icon={icon} label="Home" active />
        <NavBarItem icon={icon} label="Inbox" />
      </NavBar>,
    );
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Inbox' })).not.toHaveAttribute('aria-current');
  });

  it('horizontal: is icon-only by default and keeps labels accessible', () => {
    render(
      <NavBar aria-label="Primary">
        <NavBarItem icon={icon} label="Inbox" badge={8} />
      </NavBar>,
    );
    expect(screen.queryByText('Inbox')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Inbox' })).toBeInTheDocument();
    expect(screen.getByRole('status', { name: '8 items' })).toBeInTheDocument();
  });

  it('showLabels renders text beside horizontal icons', () => {
    render(
      <NavBar aria-label="Primary" showLabels>
        <NavBarItem icon={icon} label="Inbox" />
      </NavBar>,
    );
    expect(screen.getByText('Inbox')).toBeInTheDocument();
  });

  it('vertical: the label becomes the accessible name instead of visible text', () => {
    render(
      <NavBar aria-label="Primary" orientation="vertical">
        <NavBarItem icon={icon} label="Home" active />
        <NavBarItem icon={icon} label="Inbox" badge={3} />
      </NavBar>,
    );
    expect(screen.getByRole('button', { name: 'Home' })).toBeInTheDocument();
    expect(screen.queryByText('Home')).not.toBeInTheDocument();
    expect(screen.getByRole('status', { name: '3 items' })).toBeInTheDocument();
  });

  it('pins the end slot and supports links and disabled items', () => {
    render(
      <NavBar aria-label="Primary" end={<NavBarItem icon={icon} label="Settings" />}>
        <NavBarItem as="a" href="/docs" icon={icon} label="Docs" />
        <NavBarItem icon={icon} label="Locked" disabled />
      </NavBar>,
    );
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute('href', '/docs');
    expect(screen.getByRole('button', { name: 'Locked' })).toBeDisabled();
  });

  it('skeleton renders placeholders with the item geometry and no landmark', () => {
    const { container } = render(
      <NavBar aria-label="Primary" orientation="vertical" skeleton>
        <NavBarItem icon={icon} label="Home" />
      </NavBar>,
    );
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    const placeholders = container.querySelectorAll('[data-skeleton]');
    expect(placeholders.length).toBeGreaterThan(0);
    expect(placeholders[0]).toHaveStyle({ width: 'var(--glacier-control-height-md)' });
  });

  it('has no axe violations in either orientation', async () => {
    const { container } = render(
      <>
        <NavBar aria-label="Primary" end={<NavBarItem icon={icon} label="Settings" />}>
          <NavBarItem icon={icon} label="Home" active />
          <NavBarItem icon={icon} label="Inbox" badge={3} />
        </NavBar>
        <NavBar aria-label="Rail" orientation="vertical" end={<NavBarItem icon={icon} label="Settings" />}>
          <NavBarItem icon={icon} label="Home" active />
          <NavBarItem icon={icon} label="Inbox" badge={3} />
        </NavBar>
      </>,
    );
    expect((await axe.run(container, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
