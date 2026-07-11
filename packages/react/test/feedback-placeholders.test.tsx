import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { Banner, EmptyState } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

describe('EmptyState', () => {
  it('stacks the icon disc, title, description, action, and children', () => {
    render(
      <EmptyState
        icon={<span data-testid="glyph" />}
        title="No results"
        description="Try a broader search."
        action={<button type="button">Clear filters</button>}
      >
        <span>extra</span>
      </EmptyState>,
    );
    expect(screen.getByTestId('glyph')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'No results' })).toBeInTheDocument();
    expect(screen.getByText('Try a broader search.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear filters' })).toBeInTheDocument();
    expect(screen.getByText('extra')).toBeInTheDocument();
  });

  it('omits the optional slots when not given', () => {
    const { container } = render(<EmptyState title="Empty" />);
    expect(screen.getByRole('heading', { name: 'Empty' })).toBeInTheDocument();
    expect(container.querySelector('span[aria-hidden]')).toBeNull();
    expect(container.querySelector('p')).toBeNull();
  });

  it('renders a skeleton placeholder', () => {
    const { container } = render(<EmptyState title="ignored" skeleton />);
    expect(container.querySelectorAll('[data-skeleton]').length).toBeGreaterThan(0);
    expect(screen.queryByRole('heading')).toBeNull();
  });

  it('has no axe violations', async () => {
    const { container } = render(<EmptyState title="Nothing here" description="Add an item to begin." />);
    expect((await axe.run(container, { rules: AXE_RULES })).violations).toEqual([]);
  });
});

describe('Banner', () => {
  it('announces info as a status and danger as an alert', () => {
    const first = render(<Banner>Heads up</Banner>);
    expect(screen.getByRole('status')).toHaveTextContent('Heads up');
    first.unmount();
    render(<Banner tone="danger">Something broke</Banner>);
    expect(screen.getByRole('alert')).toHaveTextContent('Something broke');
  });

  it('renders the icon and action slots', () => {
    render(
      <Banner icon={<span data-testid="glyph" />} action={<button type="button">Undo</button>}>
        Saved
      </Banner>,
    );
    expect(screen.getByTestId('glyph')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument();
  });

  it('shows a dismiss control only when onDismiss is given, and wires it up', () => {
    const onDismiss = vi.fn();
    const { unmount } = render(<Banner onDismiss={onDismiss}>Closable</Banner>);
    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
    unmount();
    render(<Banner>Fixed</Banner>);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('renders a skeleton placeholder', () => {
    const { container } = render(<Banner skeleton>ignored</Banner>);
    expect(container.querySelector('[data-skeleton]')).not.toBeNull();
  });

  it('has no axe violations', async () => {
    const { container } = render(<Banner tone="success">All good.</Banner>);
    expect((await axe.run(container, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
