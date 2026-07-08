import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axe from 'axe-core';
import { TabbedModal } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

const sections = [
  { id: 'account', label: 'Account', content: <p>Account settings</p> },
  { id: 'notifications', label: 'Notifications', content: <p>Notification settings</p> },
  { id: 'privacy', label: 'Privacy', content: <p>Privacy settings</p> },
];

describe('TabbedModal', () => {
  it('renders nothing while closed', () => {
    render(<TabbedModal open={false} onClose={() => {}} title="Settings" sections={sections} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens as a dialog with a vertical tablist and a tabpanel', async () => {
    render(<TabbedModal open onClose={() => {}} title="Settings" sections={sections} />);
    const dialog = await screen.findByRole('dialog', { name: 'Settings' });
    expect(dialog).toBeInTheDocument();

    const tablist = screen.getByRole('tablist');
    expect(tablist).toHaveAttribute('aria-orientation', 'vertical');
    expect(screen.getAllByRole('tab')).toHaveLength(3);

    // first section is active by default
    expect(screen.getByRole('tab', { name: 'Account' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Account settings');
  });

  it('switches the pane when a rail item is clicked', async () => {
    render(<TabbedModal open onClose={() => {}} title="Settings" sections={sections} />);
    await screen.findByRole('dialog');
    fireEvent.click(screen.getByRole('tab', { name: 'Privacy' }));
    expect(screen.getByRole('tab', { name: 'Privacy' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Privacy settings');
  });

  it('opens to defaultValue and honours a controlled value', async () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <TabbedModal open onClose={() => {}} title="Settings" sections={sections} value="notifications" onValueChange={onValueChange} />,
    );
    await screen.findByRole('dialog');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Notification settings');

    // controlled: clicking reports the change but does not move on its own
    fireEvent.click(screen.getByRole('tab', { name: 'Privacy' }));
    expect(onValueChange).toHaveBeenCalledWith('privacy');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Notification settings');

    // parent applies the new value
    rerender(
      <TabbedModal open onClose={() => {}} title="Settings" sections={sections} value="privacy" onValueChange={onValueChange} />,
    );
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Privacy settings');
  });

  it('moves and activates with the arrow keys, wrapping and skipping disabled', async () => {
    const withDisabled = [
      sections[0]!,
      { id: 'locked', label: 'Locked', content: <p>Locked</p>, disabled: true },
      sections[2]!,
    ];
    render(<TabbedModal open onClose={() => {}} title="Settings" sections={withDisabled} />);
    const tablist = await screen.findByRole('tablist');
    const account = screen.getByRole('tab', { name: 'Account' });
    const privacy = screen.getByRole('tab', { name: 'Privacy' });

    account.focus();
    fireEvent.keyDown(tablist, { key: 'ArrowDown' });
    expect(privacy).toHaveFocus(); // disabled 'Locked' is skipped
    expect(privacy).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(tablist, { key: 'ArrowDown' });
    expect(account).toHaveFocus(); // wraps to the start

    fireEvent.keyDown(tablist, { key: 'End' });
    expect(privacy).toHaveFocus();
  });

  it('uses a roving tabindex so only the selected tab is tabbable', async () => {
    render(<TabbedModal open onClose={() => {}} title="Settings" sections={sections} />);
    await screen.findByRole('dialog');
    expect(screen.getByRole('tab', { name: 'Account' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: 'Notifications' })).toHaveAttribute('tabindex', '-1');
  });

  it('closes on Escape', async () => {
    const onClose = vi.fn();
    render(<TabbedModal open onClose={onClose} title="Settings" sections={sections} />);
    await screen.findByRole('dialog');
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it('has no axe violations when open', async () => {
    render(<TabbedModal open onClose={() => {}} title="Settings" sections={sections} />);
    await screen.findByRole('dialog');
    expect((await axe.run(document.body, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
