import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { CardGroup } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

describe('CardGroup', () => {
  it('defaults to the auto-fill grid mode with the min-width custom property', () => {
    render(
      <CardGroup data-testid="g">
        <div>one</div>
      </CardGroup>,
    );
    const el = screen.getByTestId('g');
    expect(el.className).toMatch(/grid/);
    expect(el.className).not.toMatch(/list/);
    expect(el.style.getPropertyValue('--card-group-min')).toBe('16rem');
  });

  it('stacks a single column in list mode', () => {
    render(
      <CardGroup mode="list" data-testid="g">
        <div>one</div>
      </CardGroup>,
    );
    const el = screen.getByTestId('g');
    expect(el.className).toMatch(/list/);
    expect(el.className).not.toMatch(/grid/);
  });

  it('exposes token-driven gap and density hooks, defaulting to md comfortable', () => {
    const { rerender } = render(
      <CardGroup data-testid="g">
        <div>one</div>
      </CardGroup>,
    );
    const el = screen.getByTestId('g');
    expect(el.getAttribute('data-gap')).toBe('md');
    expect(el.getAttribute('data-density')).toBe('comfortable');

    rerender(
      <CardGroup gap="lg" density="compact" data-testid="g">
        <div>one</div>
      </CardGroup>,
    );
    expect(el.getAttribute('data-gap')).toBe('lg');
    expect(el.getAttribute('data-density')).toBe('compact');
  });

  it('reflects a custom minItemWidth in the custom property', () => {
    render(
      <CardGroup minItemWidth="22rem" data-testid="g">
        <div>one</div>
      </CardGroup>,
    );
    expect(screen.getByTestId('g').style.getPropertyValue('--card-group-min')).toBe('22rem');
  });

  it('merges a consumer className and style with its own', () => {
    render(
      <CardGroup className="custom" style={{ marginTop: '1px' }} data-testid="g">
        <div>one</div>
      </CardGroup>,
    );
    const el = screen.getByTestId('g');
    expect(el.className).toMatch(/custom/);
    expect(el.className).toMatch(/grid/);
    expect(el.style.marginTop).toBe('1px');
    expect(el.style.getPropertyValue('--card-group-min')).toBe('16rem');
  });

  it('renders children in source order', () => {
    render(
      <CardGroup data-testid="g">
        <div>one</div>
        <div>two</div>
        <div>three</div>
      </CardGroup>,
    );
    const texts = Array.from(screen.getByTestId('g').children).map((c) => c.textContent);
    expect(texts).toEqual(['one', 'two', 'three']);
  });

  it('renders skeletonCount placeholders hidden from assistive tech instead of children', () => {
    const { container } = render(
      <CardGroup skeleton skeletonCount={4}>
        <div>real card</div>
      </CardGroup>,
    );
    const group = container.firstElementChild as HTMLElement;
    expect(group.getAttribute('aria-hidden')).toBe('true');
    expect(group.querySelectorAll('[data-skeleton]')).toHaveLength(4);
    expect(screen.queryByText('real card')).not.toBeInTheDocument();
  });

  it('defaults to six skeleton placeholders and keeps the grid geometry hooks', () => {
    const { container } = render(
      <CardGroup skeleton gap="lg" minItemWidth="20rem">
        <div>real card</div>
      </CardGroup>,
    );
    const group = container.firstElementChild as HTMLElement;
    expect(group.querySelectorAll('[data-skeleton]')).toHaveLength(6);
    expect(group.className).toMatch(/grid/);
    expect(group.getAttribute('data-gap')).toBe('lg');
    expect(group.style.getPropertyValue('--card-group-min')).toBe('20rem');
  });

  it('floors the skeleton at one placeholder', () => {
    const { container } = render(
      <CardGroup skeleton skeletonCount={0}>
        <div>real card</div>
      </CardGroup>,
    );
    const group = container.firstElementChild as HTMLElement;
    expect(group.querySelectorAll('[data-skeleton]')).toHaveLength(1);
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <CardGroup>
        <div>one</div>
        <div>two</div>
      </CardGroup>,
    );
    const results = await axe.run(container, { rules: AXE_RULES });
    expect(results.violations).toEqual([]);
  });

  it('has no axe violations as a skeleton', async () => {
    const { container } = render(<CardGroup skeleton skeletonCount={3} />);
    const results = await axe.run(container, { rules: AXE_RULES });
    expect(results.violations).toEqual([]);
  });
});
