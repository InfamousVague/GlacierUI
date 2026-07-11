import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import axe from 'axe-core';
import { TabStrip, type TabStripItem } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

const TABS: TabStripItem[] = [
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Bravo' },
  { id: 'c', label: 'Charlie' },
];

describe('TabStrip', () => {
  it('renders a tablist of tabs with the first active by default', () => {
    render(<TabStrip aria-label="Files" tabs={TABS} />);
    expect(screen.getByRole('tablist', { name: 'Files' })).toBeInTheDocument();
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[0]).toHaveAttribute('tabindex', '0');
    expect(tabs[1]).toHaveAttribute('tabindex', '-1');
  });

  it('activates a tab on click and reports its id', () => {
    const onValueChange = vi.fn();
    render(<TabStrip aria-label="Files" tabs={TABS} onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole('tab', { name: /Bravo/ }));
    expect(onValueChange).toHaveBeenCalledWith('b');
    expect(screen.getByRole('tab', { name: /Bravo/ })).toHaveAttribute('aria-selected', 'true');
  });

  it('honors a controlled value', () => {
    const { rerender } = render(<TabStrip aria-label="Files" tabs={TABS} value="b" onValueChange={() => {}} />);
    expect(screen.getByRole('tab', { name: /Bravo/ })).toHaveAttribute('aria-selected', 'true');
    rerender(<TabStrip aria-label="Files" tabs={TABS} value="c" onValueChange={() => {}} />);
    expect(screen.getByRole('tab', { name: /Charlie/ })).toHaveAttribute('aria-selected', 'true');
    // clicking does not move a controlled selection on its own
    fireEvent.click(screen.getByRole('tab', { name: /Alpha/ }));
    expect(screen.getByRole('tab', { name: /Charlie/ })).toHaveAttribute('aria-selected', 'true');
  });

  it('moves the active tab with arrow keys, wrapping around the ends', () => {
    render(<TabStrip aria-label="Files" tabs={TABS} defaultValue="a" />);
    const tablist = screen.getByRole('tablist');
    fireEvent.keyDown(tablist, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: /Bravo/ })).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(tablist, { key: 'ArrowLeft' });
    fireEvent.keyDown(tablist, { key: 'ArrowLeft' });
    expect(screen.getByRole('tab', { name: /Charlie/ })).toHaveAttribute('aria-selected', 'true'); // wrapped past the start
    fireEvent.keyDown(tablist, { key: 'Home' });
    expect(screen.getByRole('tab', { name: /Alpha/ })).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(tablist, { key: 'End' });
    expect(screen.getByRole('tab', { name: /Charlie/ })).toHaveAttribute('aria-selected', 'true');
  });

  it('closes the focused tab on Delete', () => {
    const onClose = vi.fn();
    render(<TabStrip aria-label="Files" tabs={TABS} defaultValue="b" onClose={onClose} />);
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'Delete' });
    expect(onClose).toHaveBeenCalledWith('b');
  });

  it('closes a tab via its close button without also activating it', () => {
    const onClose = vi.fn();
    const onValueChange = vi.fn();
    render(<TabStrip aria-label="Files" tabs={TABS} onClose={onClose} onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Close Charlie' }));
    expect(onClose).toHaveBeenCalledWith('c');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('defaults each tab button to the selection haptic kind', () => {
    render(<TabStrip aria-label="Files" tabs={TABS} />);
    expect(screen.getByRole('tab', { name: /Alpha/ })).toHaveAttribute('data-haptic', 'selection');
  });

  it('has no axe violations', async () => {
    render(<TabStrip aria-label="Files" tabs={TABS} onClose={() => {}} />);
    await screen.findByRole('tablist');
    expect((await axe.run(document.body, { rules: AXE_RULES })).violations).toEqual([]);
  });

  describe('in RTL', () => {
    it('inverts the horizontal arrows, keeping Home and End at the extremes', () => {
      render(
        <div dir="rtl">
          <TabStrip aria-label="Files" tabs={TABS} defaultValue="a" />
        </div>,
      );
      const tablist = screen.getByRole('tablist');
      // ArrowLeft advances in reading order in RTL
      fireEvent.keyDown(tablist, { key: 'ArrowLeft' });
      expect(screen.getByRole('tab', { name: /Bravo/ })).toHaveAttribute('aria-selected', 'true');
      // ArrowRight steps back, wrapping past the start
      fireEvent.keyDown(tablist, { key: 'ArrowRight' });
      fireEvent.keyDown(tablist, { key: 'ArrowRight' });
      expect(screen.getByRole('tab', { name: /Charlie/ })).toHaveAttribute('aria-selected', 'true');
      // Home and End do not change meaning
      fireEvent.keyDown(tablist, { key: 'Home' });
      expect(screen.getByRole('tab', { name: /Alpha/ })).toHaveAttribute('aria-selected', 'true');
      fireEvent.keyDown(tablist, { key: 'End' });
      expect(screen.getByRole('tab', { name: /Charlie/ })).toHaveAttribute('aria-selected', 'true');
    });
  });
});
