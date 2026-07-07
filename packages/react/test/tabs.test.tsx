import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import axe from 'axe-core';
import { Tabs } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

const TABS = [
  { value: 'overview', label: 'Overview', content: 'Overview content' },
  { value: 'activity', label: 'Activity', content: 'Activity content' },
  { value: 'settings', label: 'Settings', content: 'Settings content' },
];

describe('Tabs', () => {
  it('selects the first tab by default and switches on click', () => {
    render(<Tabs aria-label="Sections" tabs={TABS} />);
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Overview content');

    fireEvent.click(screen.getByRole('tab', { name: 'Activity' }));
    expect(screen.getByRole('tab', { name: 'Activity' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Activity content');
  });

  it('wires tab and panel ids per the tabs pattern with roving tabindex', () => {
    render(<Tabs aria-label="Sections" tabs={TABS} defaultValue="activity" />);
    const activity = screen.getByRole('tab', { name: 'Activity' });
    const panel = screen.getByRole('tabpanel');
    expect(activity.getAttribute('aria-controls')).toBe(panel.id);
    expect(panel.getAttribute('aria-labelledby')).toBe(activity.id);
    expect(activity).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('tabindex', '-1');
  });

  it('activates with arrow keys, wrapping and skipping disabled tabs', () => {
    render(
      <Tabs
        aria-label="Sections"
        tabs={[TABS[0]!, { ...TABS[1]!, disabled: true }, TABS[2]!]}
      />,
    );
    const overview = screen.getByRole('tab', { name: 'Overview' });
    fireEvent.keyDown(overview, { key: 'ArrowRight' });
    // skips the disabled Activity tab
    expect(screen.getByRole('tab', { name: 'Settings' })).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Settings' }), { key: 'ArrowRight' });
    // wraps back to the start
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(overview, { key: 'End' });
    expect(screen.getByRole('tab', { name: 'Settings' })).toHaveAttribute('aria-selected', 'true');
  });

  it('supports controlled usage', () => {
    const { rerender } = render(<Tabs aria-label="Sections" tabs={TABS} value="overview" />);
    fireEvent.click(screen.getByRole('tab', { name: 'Settings' }));
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Overview content');
    rerender(<Tabs aria-label="Sections" tabs={TABS} value="settings" />);
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Settings content');
  });

  it('has no axe violations', async () => {
    const { container } = render(<Tabs aria-label="Sections" tabs={TABS} />);
    expect((await axe.run(container, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
