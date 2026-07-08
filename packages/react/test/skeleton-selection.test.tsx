import { describe, expect, it } from 'vitest';
import { Size } from '@glacier/react';
import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { Checkbox, Meter, Radio, Switch, Toggle } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

describe('selection skeleton states', () => {
  it('Checkbox skeleton replaces the control with a box and a label line', () => {
    const { container } = render(<Checkbox skeleton label="Email me release notes" />);
    expect(screen.queryByRole('checkbox')).toBeNull();
    const skeletons = container.querySelectorAll('[data-skeleton]');
    expect(skeletons).toHaveLength(2);
    const box = skeletons[0] as HTMLElement;
    expect(box.style.width).toBe('1.375rem');
    expect(box.style.height).toBe('1.375rem');
    expect(box.style.borderRadius).toBe('var(--glacier-radius-sm)');
    const line = skeletons[1] as HTMLElement;
    expect(line.style.width).toBe('6rem');
  });

  it('Checkbox skeleton without a label renders only the box', () => {
    const { container } = render(<Checkbox skeleton />);
    expect(container.querySelectorAll('[data-skeleton]')).toHaveLength(1);
  });

  it('Radio skeleton is a silent 1.375rem circle', () => {
    const { container } = render(<Radio skeleton label="Hobby" />);
    expect(screen.queryByRole('radio')).toBeNull();
    const skeletons = container.querySelectorAll('[data-skeleton]');
    expect(skeletons).toHaveLength(2);
    const dot = skeletons[0] as HTMLElement;
    expect(dot.style.width).toBe('1.375rem');
    // circles default height to their width
    expect(dot.style.height).toBe('1.375rem');
  });

  it('Switch skeleton matches the md track geometry', () => {
    const { container } = render(<Switch skeleton />);
    expect(screen.queryByRole('switch')).toBeNull();
    const track = container.querySelector('[data-skeleton]') as HTMLElement;
    expect(track.style.width).toBe('2.75rem');
    expect(track.style.height).toBe('1.625rem');
    expect(track.style.borderRadius).toBe('var(--glacier-radius-full)');
  });

  it('Switch skeleton shrinks to the sm track and adds a label line', () => {
    const { container } = render(<Switch skeleton size={Size.Small} label="Wi-Fi" />);
    const skeletons = container.querySelectorAll('[data-skeleton]');
    expect(skeletons).toHaveLength(2);
    const track = skeletons[0] as HTMLElement;
    expect(track.style.width).toBe('2.25rem');
    expect(track.style.height).toBe('1.25rem');
  });

  it('Toggle skeleton mirrors the control height per size', () => {
    const { container } = render(<Toggle skeleton size={Size.Large} />);
    expect(screen.queryByRole('button')).toBeNull();
    const bar = container.querySelector('[data-skeleton]') as HTMLElement;
    expect(bar.style.width).toBe('6.5rem');
    expect(bar.style.height).toBe('var(--glacier-control-height-lg)');
    expect(bar.style.borderRadius).toBe('var(--glacier-control-radius)');
  });

  it('Toggle skeleton is square when iconOnly', () => {
    const { container } = render(<Toggle skeleton iconOnly size={Size.Small} aria-label="Grid view" />);
    expect(screen.queryByRole('button')).toBeNull();
    const square = container.querySelector('[data-skeleton]') as HTMLElement;
    expect(square.style.width).toBe('var(--glacier-control-height-sm)');
    expect(square.style.width).toBe(square.style.height);
  });

  it('Meter skeleton renders one pip per segment with no meter role', () => {
    const { container } = render(<Meter skeleton value={0} segments={6} size={Size.Small} />);
    expect(screen.queryByRole('meter')).toBeNull();
    const pips = container.querySelectorAll('[data-skeleton]');
    expect(pips).toHaveLength(6);
    const pip = pips[0] as HTMLElement;
    expect(pip.style.height).toBe('0.25rem');
    expect(pip.style.borderRadius).toBe('var(--glacier-radius-full)');
    expect(pip.style.flexGrow).toBe('1');
  });

  it('Meter skeleton pips use the md height by default', () => {
    const { container } = render(<Meter skeleton value={0} />);
    const pips = container.querySelectorAll('[data-skeleton]');
    expect(pips).toHaveLength(4);
    expect((pips[0] as HTMLElement).style.height).toBe('0.375rem');
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <>
        <Checkbox skeleton label="Email me release notes" />
        <Radio skeleton label="Hobby" />
        <Switch skeleton label="Wi-Fi" />
        <Toggle skeleton />
        <Toggle skeleton iconOnly />
        <Meter skeleton value={0} />
      </>,
    );
    expect((await axe.run(container, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
