import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axe from 'axe-core';
import { Button, Popover, Text } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

describe('Popover', () => {
  it('opens on trigger click and wires aria to the trigger', async () => {
    render(
      <Popover aria-label="Details" trigger={<Button>Open</Button>}>
        <Text>Panel content</Text>
      </Popover>,
    );
    const trigger = screen.getByRole('button', { name: 'Open' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(trigger);
    const dialog = await screen.findByRole('dialog', { name: 'Details' });
    expect(dialog).toHaveTextContent('Panel content');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes on Escape', async () => {
    render(
      <Popover aria-label="Details" trigger={<Button>Open</Button>}>
        <Text>Panel content</Text>
      </Popover>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    await screen.findByRole('dialog');
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Open' })).toHaveAttribute('aria-expanded', 'false'),
    );
  });

  it('closes on an outside pointer press', async () => {
    render(
      <>
        <span data-testid="outside">outside</span>
        <Popover aria-label="Details" trigger={<Button>Open</Button>}>
          <Text>Panel content</Text>
        </Popover>
      </>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    await screen.findByRole('dialog');
    fireEvent.pointerDown(screen.getByTestId('outside'));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Open' })).toHaveAttribute('aria-expanded', 'false'),
    );
  });

  it('supports controlled open state', async () => {
    const { rerender } = render(
      <Popover aria-label="Details" open={false} trigger={<Button>Open</Button>}>
        <Text>Panel content</Text>
      </Popover>,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    rerender(
      <Popover aria-label="Details" open trigger={<Button>Open</Button>}>
        <Text>Panel content</Text>
      </Popover>,
    );
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('has no axe violations when open', async () => {
    render(
      <Popover aria-label="Details" defaultOpen trigger={<Button>Open</Button>}>
        <Text>Panel content</Text>
      </Popover>,
    );
    await screen.findByRole('dialog');
    expect((await axe.run(document.body, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
