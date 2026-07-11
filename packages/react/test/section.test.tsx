import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { Section } from '../src/index.ts';

// region is a page-level landmark concern and the section is tested in
// isolation, so the landmark rules do not apply here.
const AXE_RULES = {
  region: { enabled: false },
  'page-has-heading-one': { enabled: false },
};

describe('Section', () => {
  it('labels the section with the generated heading id', () => {
    render(<Section title="Team">Body</Section>);
    const heading = screen.getByRole('heading', { name: 'Team', level: 2 });
    const region = screen.getByRole('region', { name: 'Team' });
    expect(heading.id).not.toBe('');
    expect(region).toHaveAttribute('aria-labelledby', heading.id);
  });

  it('switches the heading level to h3', () => {
    render(
      <Section title="Billing" headingLevel={3}>
        Body
      </Section>,
    );
    expect(screen.getByRole('heading', { name: 'Billing', level: 3 })).toBeInTheDocument();
  });

  it('renders the description under the title', () => {
    render(
      <Section title="Team" description="Everyone with access to this project.">
        Body
      </Section>,
    );
    expect(screen.getByText('Everyone with access to this project.')).toBeInTheDocument();
  });

  it('renders actions end-aligned in the heading row', () => {
    render(
      <Section title="Team" actions={<button type="button">Invite</button>}>
        Body
      </Section>,
    );
    expect(screen.getByRole('button', { name: 'Invite' })).toBeInTheDocument();
  });

  it('exposes gap, density, and divider as presentation hooks', () => {
    const { container, rerender } = render(<Section title="Team">Body</Section>);
    const section = container.querySelector('section')!;
    expect(section).toHaveAttribute('data-gap', 'md');
    expect(section).toHaveAttribute('data-density', 'comfortable');
    expect(section).not.toHaveAttribute('data-divider');

    rerender(
      <Section title="Team" gap="lg" density="compact" divider>
        Body
      </Section>,
    );
    expect(section).toHaveAttribute('data-gap', 'lg');
    expect(section).toHaveAttribute('data-density', 'compact');
    expect(section).toHaveAttribute('data-divider');
  });

  it('renders without aria-labelledby when untitled', () => {
    const { container } = render(<Section aria-label="Untitled area">Body</Section>);
    const section = container.querySelector('section')!;
    expect(section).not.toHaveAttribute('aria-labelledby');
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('omits the header row entirely when title, description, and actions are all absent', () => {
    const { container } = render(<Section>Body</Section>);
    const section = container.querySelector('section')!;
    // only the content wrapper remains
    expect(section.children).toHaveLength(1);
    expect(section.firstElementChild).toHaveTextContent('Body');
  });

  it('forwards native section props to the DOM', () => {
    render(
      <Section title="Team" id="team" data-testid="probe">
        Body
      </Section>,
    );
    expect(screen.getByTestId('probe')).toHaveAttribute('id', 'team');
  });

  it('renders a skeleton placeholder hidden from assistive tech', () => {
    const { container } = render(
      <Section title="Team" skeleton>
        Body
      </Section>,
    );
    expect(container.querySelector('section[aria-hidden="true"]')).toBeInTheDocument();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.queryByText('Body')).not.toBeInTheDocument();
    // heading placeholder, description line, and content lines
    expect(container.querySelectorAll('[data-skeleton="true"]').length).toBeGreaterThanOrEqual(4);
  });

  it('keeps the gap, density, and divider hooks in skeleton mode (exact geometry)', () => {
    const { container } = render(
      <Section skeleton gap="lg" density="compact" divider>
        Body
      </Section>,
    );
    const section = container.querySelector('section')!;
    expect(section).toHaveAttribute('data-gap', 'lg');
    expect(section).toHaveAttribute('data-density', 'compact');
    expect(section).toHaveAttribute('data-divider');
  });

  it('skeleton mirrors only the provided header slots', () => {
    // untitled: no header row at all
    const bare = render(<Section aria-label="Loading" skeleton>x</Section>);
    expect(bare.container.querySelector('[class*="header"]')).toBeNull();
    bare.unmount();

    // title only: heading placeholder but no description line
    const titled = render(<Section title="Storage" skeleton>x</Section>);
    expect(titled.container.querySelector('[class*="header"]')).not.toBeNull();
    expect(titled.container.querySelector('[class*="description"]')).toBeNull();
    titled.unmount();

    // actions provided: an actions placeholder appears
    const withActions = render(
      <Section title="Storage" actions={<button type="button">Manage</button>} skeleton>x</Section>,
    );
    expect(withActions.container.querySelector('[class*="actions"]')).not.toBeNull();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <>
        <Section
          title="Team"
          description="Everyone with access to this project."
          actions={<button type="button">Invite</button>}
        >
          <p>Members</p>
        </Section>
        <Section title="Billing" headingLevel={3} divider density="compact">
          <p>Payment methods</p>
        </Section>
      </>,
    );
    const results = await axe.run(container, { rules: AXE_RULES });
    expect(results.violations).toEqual([]);
  });
});
