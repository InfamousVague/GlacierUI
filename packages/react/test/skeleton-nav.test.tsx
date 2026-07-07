import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { SegmentedControl, Tabs } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

const OPTIONS = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
];

const TABS = [
  { value: 'overview', label: 'Overview', content: 'The project at a glance.' },
  { value: 'files', label: 'Files', content: 'Everything checked in.' },
];

describe('SegmentedControl skeleton', () => {
  it('replaces the radiogroup with a silent capsule at the control height', () => {
    const { container } = render(
      <SegmentedControl skeleton aria-label="Range" size="lg" options={OPTIONS} />,
    );
    expect(screen.queryByRole('radiogroup')).toBeNull();
    expect(screen.queryByRole('radio')).toBeNull();
    const skeleton = container.querySelector('[data-skeleton]') as HTMLElement;
    expect(skeleton.style.width).toBe('16rem');
    expect(skeleton.style.height).toBe('var(--perfect-control-height-lg)');
    expect(skeleton.style.borderRadius).toBe('var(--perfect-control-radius)');
  });

  it('stretches with fullWidth', () => {
    const { container } = render(
      <SegmentedControl skeleton fullWidth aria-label="Range" options={OPTIONS} />,
    );
    const skeleton = container.querySelector('[data-skeleton]') as HTMLElement;
    expect(skeleton.style.width).toBe('100%');
    expect(skeleton.style.height).toBe('var(--perfect-control-height-md)');
  });
});

describe('Tabs skeleton', () => {
  it('replaces the tablist and panel with silent text lines', () => {
    const { container } = render(<Tabs skeleton aria-label="Sections" tabs={TABS} />);
    expect(screen.queryByRole('tablist')).toBeNull();
    expect(screen.queryByRole('tab')).toBeNull();
    expect(screen.queryByRole('tabpanel')).toBeNull();
    expect(screen.queryByText('Overview')).toBeNull();
    const skeletons = Array.from(
      container.querySelectorAll('[data-skeleton]'),
    ) as HTMLElement[];
    // three tab lines plus two panel lines
    expect(skeletons).toHaveLength(5);
    expect(skeletons[0]?.style.width).toBe('4rem');
    expect(skeletons[1]?.style.width).toBe('4rem');
    expect(skeletons[2]?.style.width).toBe('4rem');
    expect(skeletons[3]?.style.width).toBe('100%');
    expect(skeletons[4]?.style.width).toBe('70%');
  });

  it('keeps the tab padding rhythm around each list line', () => {
    const { container } = render(<Tabs skeleton tabs={TABS} />);
    const line = container.querySelector('[data-skeleton]')?.parentElement as HTMLElement;
    expect(line.style.padding).toBe('var(--perfect-space-3) var(--perfect-space-4)');
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <>
        <SegmentedControl skeleton aria-label="Range" options={OPTIONS} />
        <Tabs skeleton aria-label="Sections" tabs={TABS} />
      </>,
    );
    expect((await axe.run(container, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
