import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import axe from 'axe-core';
// Imported from the source file until the kit index exports PageHeader.
import { PageHeader } from '../src/index.ts';

// region is a page-level landmark concern and the structure is tested in
// isolation, so the landmark rules do not apply here.
const AXE_RULES = {
  region: { enabled: false },
  'page-has-heading-one': { enabled: false },
};

const SECONDARY = (onSelect?: () => void) => [
  { id: 'archive', label: 'Archive project', onSelect },
  { id: 'delete', label: 'Delete project', disabled: true },
];

describe('PageHeader', () => {
  it('renders the title, description, breadcrumbs, meta, and actions slots', () => {
    const { container } = render(
      <PageHeader
        title="Deployments"
        description="Everything shipped to production."
        breadcrumbs={<nav aria-label="Breadcrumb">Platform</nav>}
        meta={<span>12 environments</span>}
        actions={<button type="button">New deployment</button>}
      />,
    );
    expect(container.querySelector('header')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Deployments' })).toBeInTheDocument();
    expect(screen.getByText('Everything shipped to production.')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    expect(screen.getByText('12 environments')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'New deployment' })).toBeInTheDocument();
  });

  it('renders the breadcrumbs before the title in reading order', () => {
    const { container } = render(
      <PageHeader title="Deployments" breadcrumbs={<nav aria-label="Breadcrumb">Platform</nav>} />,
    );
    const header = container.querySelector('header') as HTMLElement;
    const crumbs = screen.getByRole('navigation', { name: 'Breadcrumb' });
    const heading = screen.getByRole('heading', { level: 1 });
    expect(
      crumbs.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(header).toContainElement(crumbs);
  });

  it('switches the title element with headingLevel', () => {
    const { rerender } = render(<PageHeader title="Notes" />);
    expect(screen.getByRole('heading', { level: 1, name: 'Notes' }).tagName).toBe('H1');

    rerender(<PageHeader title="Notes" headingLevel={2} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Notes' }).tagName).toBe('H2');
    expect(screen.queryByRole('heading', { level: 1 })).toBeNull();
  });

  it('opens the overflow menu from the labeled ellipsis button and fires onSelect', async () => {
    const onSelect = vi.fn();
    render(<PageHeader title="Notes" secondaryActions={SECONDARY(onSelect)} />);

    const trigger = screen.getByRole('button', { name: 'More actions' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(trigger);
    const archive = await screen.findByRole('menuitem', { name: 'Archive project' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getAllByRole('menuitem')).toHaveLength(2);

    fireEvent.click(archive);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('keeps a disabled secondary action inert', async () => {
    render(<PageHeader title="Notes" secondaryActions={SECONDARY()} />);
    fireEvent.click(screen.getByRole('button', { name: 'More actions' }));
    const item = await screen.findByRole('menuitem', { name: 'Delete project' });
    expect(item).toHaveAttribute('aria-disabled', 'true');
  });

  it('omits the overflow button when secondaryActions is empty or undefined', () => {
    const { rerender } = render(<PageHeader title="Notes" secondaryActions={[]} />);
    expect(screen.queryByRole('button', { name: 'More actions' })).toBeNull();

    rerender(<PageHeader title="Notes" />);
    expect(screen.queryByRole('button', { name: 'More actions' })).toBeNull();
  });

  it('stamps the density on the host', () => {
    const { container, rerender } = render(<PageHeader title="Notes" />);
    const header = container.querySelector('header') as HTMLElement;
    expect(header).toHaveAttribute('data-density', 'comfortable');

    rerender(<PageHeader title="Notes" density="compact" />);
    expect(header).toHaveAttribute('data-density', 'compact');
  });

  it('skeleton renders silent placeholders for the provided slots and hides content', () => {
    const { container } = render(
      <PageHeader
        skeleton
        title="Deployments"
        description="Everything shipped to production."
        breadcrumbs={<nav aria-label="Breadcrumb">Platform</nav>}
        meta={<span>12 environments</span>}
        actions={<button type="button">New deployment</button>}
        secondaryActions={SECONDARY()}
      />,
    );
    const header = container.querySelector('header') as HTMLElement;
    expect(header).toHaveAttribute('aria-hidden', 'true');
    // breadcrumbs + title + description + meta lines, plus one actions block
    expect(container.querySelectorAll('[data-skeleton]')).toHaveLength(5);
    // geometry attributes survive so the placeholder occupies the same box
    expect(header).toHaveAttribute('data-density', 'comfortable');
    // the real content never mounts
    expect(screen.queryByRole('heading')).toBeNull();
    expect(screen.queryByText('Deployments')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByRole('navigation')).toBeNull();
  });

  it('skeleton skips placeholders for slots that were not provided', () => {
    const { container } = render(<PageHeader skeleton title="Notes" />);
    // just the title line: no breadcrumbs, description, meta, or actions
    expect(container.querySelectorAll('[data-skeleton]')).toHaveLength(1);
  });

  it('forwards native props to the header element', () => {
    render(<PageHeader title="Notes" data-testid="probe" id="masthead" />);
    expect(screen.getByTestId('probe')).toHaveAttribute('id', 'masthead');
  });

  it('skeleton ignores falsy-but-defined slots, matching what the live header renders', () => {
    const { container } = render(
      <PageHeader
        skeleton
        title="Projects"
        description={null}
        meta={''}
        actions={false}
      />,
    );
    const header = container.querySelector('header') as HTMLElement;
    // only the title placeholder: no description, meta, or actions blocks
    expect(header.querySelectorAll('[class*="description"], [class*="meta"], [class*="actions"]')).toHaveLength(0);
  });

  it('live header renders no actions container for actions={false}', () => {
    const { container } = render(<PageHeader title="Projects" actions={false} />);
    expect(container.querySelector('[class*="actions"]')).toBeNull();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <>
        <PageHeader
          title="Deployments"
          description="Everything shipped to production."
          breadcrumbs={<nav aria-label="Breadcrumb">Platform</nav>}
          meta={<span>12 environments</span>}
          actions={<button type="button">New deployment</button>}
          secondaryActions={SECONDARY()}
        />
        <PageHeader skeleton title="Notes" description="Loading" headingLevel={2} />
      </>,
    );
    expect((await axe.run(container, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
