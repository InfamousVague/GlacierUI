import { describe, expect, it } from 'vitest';
import { Size } from '@glacier/react';
import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { Divider, Heading, Kbd, Label, Link, Pill, Text } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

describe('typography skeleton states', () => {
  it('Text skeleton is a text line at the size font-size', () => {
    const { container } = render(<Text skeleton />);
    const skeleton = container.querySelector('[data-skeleton]') as HTMLElement;
    expect(skeleton).not.toBeNull();
    expect(skeleton.style.width).toBe('14ch');
    expect(skeleton.style.fontSize).toBe('var(--glacier-font-size-md)');
  });

  it('Text skeleton scales with the size prop', () => {
    const { container } = render(<Text skeleton size={Size.Large} />);
    const skeleton = container.querySelector('[data-skeleton]') as HTMLElement;
    expect(skeleton.style.fontSize).toBe('var(--glacier-font-size-lg)');
  });

  it('Heading skeleton renders no heading role and sizes from the level', () => {
    const { container } = render(<Heading skeleton level={1} />);
    expect(screen.queryByRole('heading')).toBeNull();
    const skeleton = container.querySelector('[data-skeleton]') as HTMLElement;
    expect(skeleton.style.width).toBe('10ch');
    expect(skeleton.style.fontSize).toBe('var(--glacier-font-size-3xl)');
  });

  it('Heading skeleton follows visualLevel over level', () => {
    const { container } = render(<Heading skeleton level={3} visualLevel={6} />);
    const skeleton = container.querySelector('[data-skeleton]') as HTMLElement;
    expect(skeleton.style.fontSize).toBe('var(--glacier-font-size-sm)');
  });

  it('Label skeleton is a short sm text line', () => {
    const { container } = render(<Label skeleton required />);
    const skeleton = container.querySelector('[data-skeleton]') as HTMLElement;
    expect(skeleton).not.toBeNull();
    expect(skeleton.style.width).toBe('6ch');
    expect(skeleton.style.fontSize).toBe('var(--glacier-font-size-sm)');
  });

  it('Link skeleton renders no link role', () => {
    const { container } = render(<Link skeleton href="#" />);
    expect(screen.queryByRole('link')).toBeNull();
    const skeleton = container.querySelector('[data-skeleton]') as HTMLElement;
    expect(skeleton.style.width).toBe('8ch');
  });

  it('Kbd skeleton is a small key cap block', () => {
    const { container } = render(<Kbd skeleton />);
    const skeleton = container.querySelector('[data-skeleton]') as HTMLElement;
    expect(skeleton).not.toBeNull();
    expect(skeleton.style.width).toBe('2.25rem');
    expect(skeleton.style.height).toBe('1.375rem');
    expect(skeleton.style.borderRadius).toBe('var(--glacier-radius-sm)');
  });

  it('Pill skeleton matches the md pill geometry', () => {
    const { container } = render(<Pill skeleton />);
    const skeleton = container.querySelector('[data-skeleton]') as HTMLElement;
    expect(skeleton.style.width).toBe('4.5rem');
    expect(skeleton.style.height).toBe('1.75rem');
    expect(skeleton.style.borderRadius).toBe('var(--glacier-radius-full)');
  });

  it('Pill skeleton matches the sm pill geometry', () => {
    const { container } = render(<Pill skeleton size={Size.Small} />);
    const skeleton = container.querySelector('[data-skeleton]') as HTMLElement;
    expect(skeleton.style.width).toBe('3.5rem');
    expect(skeleton.style.height).toBe('1.375rem');
  });

  it('Divider skeleton keeps the horizontal hairline and drops the separator role', () => {
    const { container } = render(<Divider skeleton />);
    expect(screen.queryByRole('separator')).toBeNull();
    const skeleton = container.querySelector('[data-skeleton]') as HTMLElement;
    expect(skeleton.style.width).toBe('100%');
    expect(skeleton.style.height).toBe('var(--glacier-hairline)');
  });

  it('Divider skeleton keeps the vertical hairline', () => {
    const { container } = render(<Divider skeleton orientation="vertical" />);
    expect(screen.queryByRole('separator')).toBeNull();
    const skeleton = container.querySelector('[data-skeleton]') as HTMLElement;
    expect(skeleton.style.width).toBe('var(--glacier-hairline)');
    expect(skeleton.style.height).toBe('1.5rem');
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <>
        <Heading skeleton level={2} />
        <Text skeleton />
        <Label skeleton />
        <Link skeleton />
        <Kbd skeleton />
        <Pill skeleton />
        <Divider skeleton />
      </>,
    );
    expect((await axe.run(container, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
