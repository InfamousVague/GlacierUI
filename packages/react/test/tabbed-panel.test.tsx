import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import axe from 'axe-core';
import { TabbedPanel } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

const tabs = [
  { id: 'overview', label: 'Overview', content: <p>Overview body</p> },
  { id: 'activity', label: 'Activity', count: 5, content: <p>Activity body</p> },
  { id: 'settings', label: 'Settings', content: <p>Settings body</p> },
];

describe('TabbedPanel', () => {
  it('renders a tablist with the first enabled tab active by default', () => {
    render(<TabbedPanel aria-label="Report" tabs={tabs} />);
    const tablist = screen.getByRole('tablist', { name: 'Report' });
    expect(tablist).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(3);
    expect(screen.getByRole('tab', { name: /Overview/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Overview body');
  });

  it('links each tab to its panel with aria-controls and aria-labelledby', () => {
    render(<TabbedPanel aria-label="Report" tabs={tabs} />);
    const tab = screen.getByRole('tab', { name: /Overview/ });
    const panel = screen.getByRole('tabpanel');
    expect(tab).toHaveAttribute('aria-controls', panel.id);
    expect(panel).toHaveAttribute('aria-labelledby', tab.id);
  });

  it('switches the body and runs onValueChange when a tab is clicked', () => {
    const onValueChange = vi.fn();
    render(<TabbedPanel aria-label="Report" tabs={tabs} onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole('tab', { name: /Activity/ }));
    expect(onValueChange).toHaveBeenCalledWith('activity');
    expect(screen.getByRole('tab', { name: /Activity/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Activity body');
  });

  it('renders a count as a badge on the tab', () => {
    render(<TabbedPanel aria-label="Report" tabs={tabs} />);
    expect(screen.getByRole('tab', { name: /Activity/ })).toHaveTextContent('5');
  });

  it('moves and activates tabs with the arrow keys, wrapping and skipping disabled', () => {
    const withDisabled = [
      { id: 'a', label: 'A', content: <p>A body</p> },
      { id: 'b', label: 'B', disabled: true, content: <p>B body</p> },
      { id: 'c', label: 'C', content: <p>C body</p> },
    ];
    render(<TabbedPanel aria-label="Letters" tabs={withDisabled} />);
    const tablist = screen.getByRole('tablist');
    fireEvent.keyDown(tablist, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'C' })).toHaveAttribute('aria-selected', 'true'); // skips disabled B
    fireEvent.keyDown(tablist, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'A' })).toHaveAttribute('aria-selected', 'true'); // wraps to start
    fireEvent.keyDown(tablist, { key: 'End' });
    expect(screen.getByRole('tab', { name: 'C' })).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(tablist, { key: 'Home' });
    expect(screen.getByRole('tab', { name: 'A' })).toHaveAttribute('aria-selected', 'true');
  });

  it('marks a disabled tab and keeps only the active tab in the tab order', () => {
    const withDisabled = [
      { id: 'a', label: 'A', content: <p>A body</p> },
      { id: 'b', label: 'B', disabled: true, content: <p>B body</p> },
    ];
    render(<TabbedPanel aria-label="Letters" tabs={withDisabled} />);
    expect(screen.getByRole('tab', { name: 'B' })).toBeDisabled();
    expect(screen.getByRole('tab', { name: 'A' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: 'B' })).toHaveAttribute('tabindex', '-1');
  });

  it('respects a controlled value and does not self-update', () => {
    const { rerender } = render(<TabbedPanel aria-label="Report" tabs={tabs} value="overview" />);
    fireEvent.click(screen.getByRole('tab', { name: /Settings/ }));
    // controlled: stays on overview until the parent updates value
    expect(screen.getByRole('tab', { name: /Overview/ })).toHaveAttribute('aria-selected', 'true');
    rerender(<TabbedPanel aria-label="Report" tabs={tabs} value="settings" />);
    expect(screen.getByRole('tab', { name: /Settings/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Settings body');
  });

  it('renders actions in the header slot', () => {
    render(
      <TabbedPanel aria-label="Report" tabs={tabs} actions={<button type="button">Refresh</button>} />,
    );
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    render(
      <TabbedPanel
        aria-label="Report"
        tabs={tabs}
        actions={<button type="button">Refresh</button>}
      />,
    );
    await screen.findByRole('tabpanel');
    expect((await axe.run(document.body, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
