import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import {
  Button,
  EmptyState,
  Footer,
  FooterColumn,
  Link,
  PageHeader,
  Sidebar,
  SidebarItem,
  SidebarSection,
  Toolbar,
} from '../src/index.ts';

// heading-order is a page-level concern; these structures are tested in isolation
// and the composite mixes their heading levels on purpose.
const AXE_RULES = {
  region: { enabled: false },
  'page-has-heading-one': { enabled: false },
  'heading-order': { enabled: false },
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
      <Toolbar start={<span>menu</span>} end={<Button size="sm">New</Button>}>
        <span>Title</span>
      </Toolbar>,
    );
    expect(screen.getByText('menu')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'New' })).toBeInTheDocument();
  });
});

describe('PageHeader', () => {
  it('renders the title as a heading with description and actions', () => {
    render(
      <PageHeader
        title="Projects"
        description="Everything in one place"
        actions={<Button>New project</Button>}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Projects' })).toBeInTheDocument();
    expect(screen.getByText('Everything in one place')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'New project' })).toBeInTheDocument();
  });
});

describe('Footer and EmptyState', () => {
  it('Footer renders a footer landmark with columns and a bottom bar', () => {
    render(
      <Footer bottom={<span>© 2026</span>}>
        <FooterColumn title="Product">
          <Link href="#">Pricing</Link>
        </FooterColumn>
      </Footer>,
    );
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByText('Product')).toBeInTheDocument();
    expect(screen.getByText('© 2026')).toBeInTheDocument();
  });

  it('EmptyState renders a heading, description, and action', () => {
    render(
      <EmptyState title="No messages" description="You are all caught up" action={<Button>Compose</Button>} />,
    );
    expect(screen.getByRole('heading', { name: 'No messages' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Compose' })).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <>
        <PageHeader title="Projects" description="d" actions={<Button>New</Button>} />
        <EmptyState title="Empty" description="Nothing here" action={<Button>Add</Button>} />
        <Footer bottom={<span>© 2026</span>}>
          <FooterColumn title="Product">
            <Link href="#">Pricing</Link>
          </FooterColumn>
        </Footer>
      </>,
    );
    expect((await axe.run(container, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
