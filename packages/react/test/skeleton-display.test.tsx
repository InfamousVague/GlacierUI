import { describe, expect, it } from 'vitest';
import { Size } from '@glacier/react';
import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { Card, ProgressBar, Slider, Spinner, Surface } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

describe('display skeleton states', () => {
  it('ProgressBar skeleton replaces the bar with a silent full-width track', () => {
    const { container } = render(<ProgressBar skeleton />);
    expect(screen.queryByRole('progressbar')).toBeNull();
    const skeleton = container.querySelector('[data-skeleton]') as HTMLElement;
    expect(skeleton.style.width).toBe('100%');
    expect(skeleton.style.height).toBe('0.625rem');
    expect(skeleton.style.borderRadius).toBe('var(--glacier-radius-full)');
  });

  it('ProgressBar skeleton follows the sm track height', () => {
    const { container } = render(<ProgressBar skeleton size={Size.Small} />);
    const skeleton = container.querySelector('[data-skeleton]') as HTMLElement;
    expect(skeleton.style.height).toBe('0.375rem');
  });

  it('Spinner skeleton is a silent circle at each size', () => {
    const sizes = [
      ['sm', '1em'],
      ['md', '1.25rem'],
      ['lg', '1.875rem'],
    ] as const;
    for (const [size, dimension] of sizes) {
      const { container, unmount } = render(<Spinner skeleton size={size} />);
      expect(screen.queryByRole('status')).toBeNull();
      const skeleton = container.querySelector('[data-skeleton]') as HTMLElement;
      expect(skeleton.style.width).toBe(dimension);
      expect(skeleton.style.height).toBe(dimension);
      unmount();
    }
  });

  it('Slider skeleton replaces the input with a silent full-width track', () => {
    const { container } = render(<Slider skeleton aria-label="Volume" />);
    expect(screen.queryByRole('slider')).toBeNull();
    const skeleton = container.querySelector('[data-skeleton]') as HTMLElement;
    expect(skeleton.style.width).toBe('100%');
    expect(skeleton.style.height).toBe('0.375rem');
    expect(skeleton.style.borderRadius).toBe('var(--glacier-radius-full)');
  });

  it('Card skeleton keeps the card chrome and stacks three text lines', () => {
    const { container } = render(<Card skeleton elevation={2} />);
    const card = container.querySelector('[data-elevation="2"]') as HTMLElement;
    expect(card).not.toBeNull();
    const lines = card.querySelectorAll('[data-skeleton]');
    expect(lines).toHaveLength(3);
    const widths = Array.from(lines, (line) => (line as HTMLElement).style.width);
    expect(widths).toEqual(['40%', '100%', '85%']);
    for (const line of lines) {
      expect(line).toHaveAttribute('aria-hidden', 'true');
    }
  });

  it('Surface skeleton is a silent block at the documented geometry', () => {
    const { container } = render(<Surface skeleton level={2} />);
    const skeleton = container.querySelector('[data-skeleton]') as HTMLElement;
    expect(skeleton.style.width).toBe('100%');
    expect(skeleton.style.height).toBe('6rem');
    expect(skeleton.style.borderRadius).toBe('var(--glacier-radius-lg)');
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <>
        <ProgressBar skeleton />
        <Spinner skeleton />
        <Slider skeleton />
        <Card skeleton />
        <Surface skeleton />
      </>,
    );
    expect((await axe.run(container, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
