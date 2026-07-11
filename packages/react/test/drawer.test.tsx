import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { AlertDialog, Drawer } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

describe('Drawer', () => {
  it('follows the host layout: data-layout floating floats every drawer', () => {
    document.documentElement.setAttribute('data-layout', 'floating');
    try {
      render(
        <Drawer open onClose={() => {}} title="Filters">
          Body
        </Drawer>,
      );
      expect(screen.getByRole('dialog').className).toMatch(/floating/);
    } finally {
      document.documentElement.removeAttribute('data-layout');
    }
  });

  it('floating mode detaches the panel and pads the overlay', () => {
    render(
      <Drawer open onClose={() => {}} floating title="Filters">
        Body
      </Drawer>,
    );
    const panel = screen.getByRole('dialog');
    expect(panel.className).toMatch(/floating/);
    expect((panel.parentElement as HTMLElement).className).toMatch(/floating/);
  });

  it('locks scrolling, traps focus, dismisses, and restores the opener', () => {
    const opener = document.createElement('button');
    opener.textContent = 'Open drawer';
    document.body.append(opener);
    opener.focus();
    const onClose = vi.fn();
    const { unmount } = render(
      <Drawer open onClose={onClose} title="Filters" description="Narrow results.">
        <button type="button">Apply</button>
      </Drawer>,
    );

    const dialog = screen.getByRole('dialog', { name: 'Filters' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(document.body.style.overflow).toBe('hidden');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);

    unmount();
    expect(document.body.style.overflow).toBe('');
    expect(opener).toHaveFocus();
    opener.remove();
  });

  it('blocks accidental overlay and Escape dismissal when persistent', () => {
    const onClose = vi.fn();
    render(<Drawer open onClose={onClose} title="Required" dismissible={false}>Body</Drawer>);

    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.click(screen.getByRole('dialog').parentElement!);
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    render(<Drawer open onClose={() => {}} title="Filters">Body</Drawer>);
    expect((await axe.run(document.body, { rules: AXE_RULES })).violations).toEqual([]);
  });
});

describe('AlertDialog', () => {
  it('focuses cancel first and requires an explicit dismissal by default', () => {
    const onClose = vi.fn();
    const onAction = vi.fn();
    render(
      <AlertDialog
        open
        onClose={onClose}
        title="Delete workspace?"
        description="This cannot be undone."
        actionLabel="Delete"
        onAction={onAction}
        tone="danger"
      />,
    );

    const dialog = screen.getByRole('alertdialog', { name: 'Delete workspace?' });
    const cancel = screen.getByRole('button', { name: 'Cancel' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(cancel).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.click(dialog.parentElement!);
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onAction).toHaveBeenCalledTimes(1);
    fireEvent.click(cancel);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('allows Escape only when dismissible and has no axe violations', async () => {
    const onClose = vi.fn();
    render(<AlertDialog open onClose={onClose} title="Continue?" actionLabel="Continue" onAction={() => {}} dismissible />);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
    expect((await axe.run(document.body, { rules: AXE_RULES })).violations).toEqual([]);
  });
});