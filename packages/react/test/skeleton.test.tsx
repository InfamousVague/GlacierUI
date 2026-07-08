import { describe, expect, it } from 'vitest';
import { Size, SkeletonVariant } from '@glacier/react';
import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { Button, IconButton, Skeleton } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

describe('Skeleton primitive', () => {
  it('renders a decorative shape with the given geometry', () => {
    const { container } = render(<Skeleton variant={SkeletonVariant.Circle} width="2rem" />);
    const skeleton = container.querySelector('[data-skeleton]') as HTMLElement;
    expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    expect(skeleton.style.width).toBe('2rem');
    // circles default height to their width
    expect(skeleton.style.height).toBe('2rem');
  });

  it('applies a radius override inline', () => {
    const { container } = render(<Skeleton width="6rem" height="2rem" radius="9999px" />);
    const skeleton = container.querySelector('[data-skeleton]') as HTMLElement;
    expect(skeleton.style.borderRadius).toBe('9999px');
  });
});

describe('component skeleton states', () => {
  it('Button skeleton replaces the button with a silent placeholder of the same height', () => {
    const { container } = render(<Button skeleton size={Size.Large} />);
    expect(screen.queryByRole('button')).toBeNull();
    const skeleton = container.querySelector('[data-skeleton]') as HTMLElement;
    expect(skeleton.style.height).toBe('var(--glacier-control-height-lg)');
    expect(skeleton.style.borderRadius).toBe('var(--glacier-control-radius)');
  });

  it('Button skeleton stretches with fullWidth', () => {
    const { container } = render(<Button skeleton fullWidth />);
    const skeleton = container.querySelector('[data-skeleton]') as HTMLElement;
    expect(skeleton.style.width).toBe('100%');
  });

  it('IconButton skeleton is square at the control size', () => {
    const { container } = render(<IconButton skeleton aria-label="Add" size={Size.Small} />);
    const skeleton = container.querySelector('[data-skeleton]') as HTMLElement;
    expect(skeleton.style.width).toBe('var(--glacier-control-height-sm)');
    expect(skeleton.style.width).toBe(skeleton.style.height);
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <>
        <Skeleton variant={SkeletonVariant.Text} width="12ch" />
        <Button skeleton />
        <IconButton skeleton aria-label="Add" />
      </>,
    );
    expect((await axe.run(container, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
