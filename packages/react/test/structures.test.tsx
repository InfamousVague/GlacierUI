import { describe, expect, it } from 'vitest';
import { Size } from '@glacier/react';
import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { Button, Sidebar, SidebarItem, SidebarSection, Toolbar } from '../src/index.ts';

// region is a page-level landmark concern and these structures are tested in
// isolation, so the landmark rules do not apply here.
const AXE_RULES = {
  region: { enabled: false },
  'page-has-heading-one': { enabled: false },
};

describe('Sidebar', () => {
  it('renders header, sections, items, and footer', () => {
    render(
      <Sidebar header={<div>Brand</div>} footer={<div>Profile</div>}>
        <SidebarSection title="Main">
          <SidebarItem active>Home</SidebarItem>
          <SidebarItem trailing={<span>3</span>}>Inbox</SidebarItem>
        </SidebarSection>
      </Sidebar>,
    );
    expect(screen.getByText('Brand')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    const home = screen.getByRole('button', { name: 'Home' });
    expect(home).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: /Inbox/ })).toBeInTheDocument();
  });

  it('SidebarItem renders as a link and reflects disabled', () => {
    render(
      <Sidebar>
        <SidebarItem as="a" href="/docs">
          Docs
        </SidebarItem>
        <SidebarItem disabled>Locked</SidebarItem>
      </Sidebar>,
    );
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute('href', '/docs');
    expect(screen.getByRole('button', { name: 'Locked' })).toBeDisabled();
  });
});

describe('Toolbar', () => {
  it('renders start, middle, and end regions', () => {
    render(
      <Toolbar start={<span>menu</span>} end={<Button size={Size.Small}>New</Button>}>
        <span>Title</span>
      </Toolbar>,
    );
    expect(screen.getByText('menu')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'New' })).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <>
        <Sidebar header={<div>Brand</div>}>
          <SidebarSection title="Main">
            <SidebarItem active>Home</SidebarItem>
            <SidebarItem>Inbox</SidebarItem>
          </SidebarSection>
        </Sidebar>
        <Toolbar start={<span>menu</span>} end={<Button size={Size.Small}>New</Button>}>
          <span>Title</span>
        </Toolbar>
      </>,
    );
    expect((await axe.run(container, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
