import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axe from 'axe-core';
import { Button, Menu, MenuItem, MenuLabel, MenuSeparator } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

const openMenu = () => fireEvent.click(screen.getByRole('button', { name: 'Actions' }));

describe('Menu', () => {
  it('opens on trigger click with menu semantics', async () => {
    render(
      <Menu aria-label="Actions" trigger={<Button>Actions</Button>}>
        <MenuItem>Rename</MenuItem>
        <MenuItem>Delete</MenuItem>
      </Menu>,
    );
    const trigger = screen.getByRole('button', { name: 'Actions' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(trigger);
    const menu = await screen.findByRole('menu', { name: 'Actions' });
    expect(menu).toBeInTheDocument();
    expect(screen.getAllByRole('menuitem')).toHaveLength(2);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('runs onSelect and closes when an item is chosen', async () => {
    const onSelect = vi.fn();
    render(
      <Menu aria-label="Actions" trigger={<Button>Actions</Button>}>
        <MenuItem onSelect={onSelect}>Rename</MenuItem>
      </Menu>,
    );
    openMenu();
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Rename' }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Actions' })).toHaveAttribute('aria-expanded', 'false'),
    );
  });

  it('skips a disabled item', async () => {
    const onSelect = vi.fn();
    render(
      <Menu aria-label="Actions" trigger={<Button>Actions</Button>}>
        <MenuItem disabled onSelect={onSelect}>
          Export
        </MenuItem>
      </Menu>,
    );
    openMenu();
    const item = await screen.findByRole('menuitem', { name: 'Export' });
    expect(item).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(item);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('moves focus with the arrow keys, wrapping and skipping disabled', async () => {
    render(
      <Menu aria-label="Actions" trigger={<Button>Actions</Button>}>
        <MenuItem>Rename</MenuItem>
        <MenuItem disabled>Locked</MenuItem>
        <MenuItem>Duplicate</MenuItem>
      </Menu>,
    );
    openMenu();
    const menu = await screen.findByRole('menu');
    const rename = screen.getByRole('menuitem', { name: 'Rename' });
    const duplicate = screen.getByRole('menuitem', { name: 'Duplicate' });
    rename.focus();
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(duplicate).toHaveFocus(); // disabled 'Locked' is skipped
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(rename).toHaveFocus(); // wraps to the start
    fireEvent.keyDown(menu, { key: 'End' });
    expect(duplicate).toHaveFocus();
  });

  it('closes on Escape', async () => {
    render(
      <Menu aria-label="Actions" trigger={<Button>Actions</Button>}>
        <MenuItem>Rename</MenuItem>
      </Menu>,
    );
    openMenu();
    const menu = await screen.findByRole('menu');
    fireEvent.keyDown(menu, { key: 'Escape' });
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Actions' })).toHaveAttribute('aria-expanded', 'false'),
    );
  });

  it('has no axe violations when open', async () => {
    render(
      <Menu aria-label="Actions" defaultOpen trigger={<Button>Actions</Button>}>
        <MenuLabel>Edit</MenuLabel>
        <MenuItem>Rename</MenuItem>
        <MenuSeparator />
        <MenuItem danger>Delete</MenuItem>
      </Menu>,
    );
    await screen.findByRole('menu');
    expect((await axe.run(document.body, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
