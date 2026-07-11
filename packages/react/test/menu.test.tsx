import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';
import axe from 'axe-core';
import { Button, ContextMenu, Menu, MenuItem, MenuLabel, MenuSeparator, MenuSub } from '../src/index.ts';

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

// jsdom does not implement PointerEvent, so fireEvent.pointer* would deliver a
// bare Event with no coordinates. A MouseEvent named as the pointer type carries
// clientX/clientY and reaches React's pointer handlers; pointerType is stamped
// on so the long-press touch guard sees it.
function firePointer(
  type: 'pointerdown' | 'pointermove' | 'pointerup' | 'pointerover' | 'pointerout',
  target: EventTarget,
  init: { clientX?: number; clientY?: number; pointerType?: string } = {},
) {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: init.clientX, clientY: init.clientY });
  Object.assign(event, { pointerType: init.pointerType ?? 'touch' });
  act(() => {
    target.dispatchEvent(event);
  });
}

describe('ContextMenu', () => {
  const items = (
    <>
      <MenuItem>Copy</MenuItem>
      <MenuItem>Paste</MenuItem>
    </>
  );

  it('opens at the pointer coordinates on contextmenu and prevents the default', () => {
    render(
      <ContextMenu aria-label="Canvas" content={items}>
        <div data-testid="zone">Zone</div>
      </ContextMenu>,
    );
    const notPrevented = fireEvent.contextMenu(screen.getByTestId('zone'), { clientX: 120, clientY: 80 });
    expect(notPrevented).toBe(false); // preventDefault ran, so the native menu never shows

    const menu = screen.getByRole('menu', { name: 'Canvas' });
    expect(menu.style.left).toBe('120px'); // at the pointer x
    expect(menu.style.top).toBe('82px'); // pointer y plus the 2px offset
  });

  it('repositions when reopened at new coordinates while already open', () => {
    render(
      <ContextMenu aria-label="Canvas" content={items}>
        <div data-testid="zone">Zone</div>
      </ContextMenu>,
    );
    const zone = screen.getByTestId('zone');
    fireEvent.contextMenu(zone, { clientX: 120, clientY: 80 });
    fireEvent.contextMenu(zone, { clientX: 300, clientY: 200 });
    const menu = screen.getByRole('menu', { name: 'Canvas' });
    expect(menu.style.left).toBe('300px');
    expect(menu.style.top).toBe('202px');
  });

  it('focuses the first item on open and restores focus on Escape', async () => {
    render(
      <>
        <button type="button" data-testid="before">
          Before
        </button>
        <ContextMenu aria-label="Canvas" content={items}>
          <div data-testid="zone">Zone</div>
        </ContextMenu>
      </>,
    );
    const before = screen.getByTestId('before');
    before.focus();
    fireEvent.contextMenu(screen.getByTestId('zone'), { clientX: 10, clientY: 10 });
    const copy = screen.getByRole('menuitem', { name: 'Copy' });
    await waitFor(() => expect(copy).toHaveFocus());

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });
    expect(before).toHaveFocus();
  });

  it('opens after a ~500ms long-press at the press coordinates', () => {
    vi.useFakeTimers();
    try {
      render(
        <ContextMenu aria-label="Canvas" content={items}>
          <div data-testid="zone">Zone</div>
        </ContextMenu>,
      );
      const zone = screen.getByTestId('zone');
      firePointer('pointerdown', zone, { clientX: 40, clientY: 50, pointerType: 'touch' });
      expect(screen.queryByRole('menu')).toBeNull(); // not yet - it needs the hold
      act(() => {
        vi.advanceTimersByTime(500);
      });
      const menu = screen.getByRole('menu', { name: 'Canvas' });
      expect(menu.style.left).toBe('40px');
      expect(menu.style.top).toBe('52px');
    } finally {
      vi.useRealTimers();
    }
  });

  it('cancels the long-press when the pointer lifts or strays past the tolerance', () => {
    vi.useFakeTimers();
    try {
      render(
        <ContextMenu aria-label="Canvas" content={items}>
          <div data-testid="zone">Zone</div>
        </ContextMenu>,
      );
      const zone = screen.getByTestId('zone');

      firePointer('pointerdown', zone, { clientX: 40, clientY: 50, pointerType: 'touch' });
      firePointer('pointermove', zone, { clientX: 60, clientY: 50, pointerType: 'touch' }); // 20px > 8px
      act(() => {
        vi.advanceTimersByTime(600);
      });
      expect(screen.queryByRole('menu')).toBeNull();

      firePointer('pointerdown', zone, { clientX: 40, clientY: 50, pointerType: 'touch' });
      firePointer('pointerup', zone, { clientX: 40, clientY: 50, pointerType: 'touch' });
      act(() => {
        vi.advanceTimersByTime(600);
      });
      expect(screen.queryByRole('menu')).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it('dismisses on outside press and on scrolling away', () => {
    const onOpenChange = vi.fn();
    render(
      <ContextMenu aria-label="Canvas" content={items} onOpenChange={onOpenChange}>
        <div data-testid="zone">Zone</div>
      </ContextMenu>,
    );
    const zone = screen.getByTestId('zone');

    fireEvent.contextMenu(zone, { clientX: 10, clientY: 10 });
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    fireEvent.pointerDown(document.body);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);

    fireEvent.contextMenu(zone, { clientX: 10, clientY: 10 });
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    fireEvent.scroll(document);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('has no axe violations when open', async () => {
    render(
      <ContextMenu aria-label="Canvas" content={items}>
        <div data-testid="zone">Zone</div>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByTestId('zone'), { clientX: 10, clientY: 10 });
    await screen.findByRole('menu', { name: 'Canvas' });
    expect((await axe.run(document.body, { rules: AXE_RULES })).violations).toEqual([]);
  });
});

describe('MenuSub', () => {
  function renderWithSub() {
    return render(
      <Menu aria-label="Actions" defaultOpen trigger={<Button>Actions</Button>}>
        <MenuItem>Rename</MenuItem>
        <MenuSub label="Share">
          <MenuItem>Email</MenuItem>
          <MenuItem>Copy link</MenuItem>
        </MenuSub>
      </Menu>,
    );
  }

  it('renders as a menuitem row with submenu semantics', async () => {
    renderWithSub();
    const row = await screen.findByRole('menuitem', { name: 'Share' });
    expect(row).toHaveAttribute('aria-haspopup', 'menu');
    expect(row).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('menu', { name: 'Share' })).toBeNull();
  });

  it('opens with ArrowRight, focuses the first child, and steps back with ArrowLeft', async () => {
    renderWithSub();
    const row = await screen.findByRole('menuitem', { name: 'Share' });

    fireEvent.keyDown(row, { key: 'ArrowRight' });
    expect(row).toHaveAttribute('aria-expanded', 'true');
    const email = await screen.findByRole('menuitem', { name: 'Email' });
    await waitFor(() => expect(email).toHaveFocus());

    // arrows rove inside the flyout without leaking into the parent panel
    fireEvent.keyDown(email, { key: 'ArrowDown' });
    expect(screen.getByRole('menuitem', { name: 'Copy link' })).toHaveFocus();

    fireEvent.keyDown(screen.getByRole('menuitem', { name: 'Copy link' }), { key: 'ArrowLeft' });
    expect(row).toHaveAttribute('aria-expanded', 'false');
    expect(row).toHaveFocus();
  });

  it('nests at least two levels deep', async () => {
    render(
      <Menu aria-label="Actions" defaultOpen trigger={<Button>Actions</Button>}>
        <MenuSub label="Share">
          <MenuItem>Email</MenuItem>
          <MenuSub label="Social">
            <MenuItem>Mastodon</MenuItem>
          </MenuSub>
        </MenuSub>
      </Menu>,
    );
    fireEvent.keyDown(await screen.findByRole('menuitem', { name: 'Share' }), { key: 'ArrowRight' });
    const social = await screen.findByRole('menuitem', { name: 'Social' });
    fireEvent.keyDown(social, { key: 'ArrowRight' });
    expect(await screen.findByRole('menuitem', { name: 'Mastodon' })).toBeInTheDocument();
    expect(screen.getAllByRole('menu')).toHaveLength(3);
  });

  it('Escape from a nested flyout closes the whole stack and refocuses the trigger', async () => {
    render(
      <Menu aria-label="Actions" defaultOpen trigger={<Button>Actions</Button>}>
        <MenuSub label="Share">
          <MenuItem>Email</MenuItem>
          <MenuSub label="Social">
            <MenuItem>Mastodon</MenuItem>
          </MenuSub>
        </MenuSub>
      </Menu>,
    );
    const share = await screen.findByRole('menuitem', { name: 'Share' });
    fireEvent.keyDown(share, { key: 'ArrowRight' });
    const social = await screen.findByRole('menuitem', { name: 'Social' });
    fireEvent.keyDown(social, { key: 'ArrowRight' });
    const deepest = await screen.findByRole('menuitem', { name: 'Mastodon' });

    fireEvent.keyDown(deepest, { key: 'Escape' });
    const trigger = screen.getByRole('button', { name: 'Actions' });
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
    expect(share).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });

  it('opens on hover after the intent delay and survives diagonal travel into the flyout', async () => {
    vi.useFakeTimers();
    try {
      renderWithSub();
      const row = screen.getByRole('menuitem', { name: 'Share' });

      firePointer('pointerover', row, { pointerType: 'mouse' });
      expect(row).toHaveAttribute('aria-expanded', 'false'); // intent delay pending
      act(() => {
        vi.advanceTimersByTime(120);
      });
      expect(row).toHaveAttribute('aria-expanded', 'true');

      // leaving the row toward the flyout does not close it: the close delay is
      // cancelled the moment the pointer arrives on the panel
      firePointer('pointerout', row, { pointerType: 'mouse' });
      firePointer('pointerover', screen.getByRole('menu', { name: 'Share' }), { pointerType: 'mouse' });
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(row).toHaveAttribute('aria-expanded', 'true');

      // leaving the panel for good closes after the delay
      firePointer('pointerout', screen.getByRole('menu', { name: 'Share' }), { pointerType: 'mouse' });
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(row).toHaveAttribute('aria-expanded', 'false');
    } finally {
      vi.useRealTimers();
    }
  });

  it('has no axe violations with a flyout open', async () => {
    renderWithSub();
    fireEvent.keyDown(await screen.findByRole('menuitem', { name: 'Share' }), { key: 'ArrowRight' });
    await screen.findByRole('menu', { name: 'Share' });
    expect((await axe.run(document.body, { rules: AXE_RULES })).violations).toEqual([]);
  });
});

// ---- RTL -----------------------------------------------------------------------

// jsdom has no layout, so alignment tests stub the trigger rect and the
// floating panel's offset size before the panel opens and measures itself.
function stubRect(el: Element, rect: { left: number; top: number; width: number; height: number }) {
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
    ...rect,
    right: rect.left + rect.width,
    bottom: rect.top + rect.height,
    x: rect.left,
    y: rect.top,
    toJSON: () => ({}),
  } as DOMRect);
}

function stubPanelSize(width = 120, height = 80) {
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(width);
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(height);
}

describe('Menu in RTL', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('drops the panel from the trigger right edge (start = inline start) and stamps dir', async () => {
    render(
      <div dir="rtl">
        <Menu aria-label="Actions" trigger={<Button>Actions</Button>}>
          <MenuItem>Rename</MenuItem>
        </Menu>
      </div>,
    );
    stubRect(screen.getByRole('button', { name: 'Actions' }), { left: 100, top: 10, width: 100, height: 20 });
    stubPanelSize();
    openMenu();
    const menu = await screen.findByRole('menu', { name: 'Actions' });
    expect(menu.style.left).toBe('80px'); // trigger right 200 - panel width 120
    expect(menu.style.top).toBe('38px'); // trigger bottom 30 + offset 8
    // the portalled panel carries the trigger's direction past the body portal
    expect(menu).toHaveAttribute('dir', 'rtl');
  });

  it('opens submenus with ArrowLeft and closes with ArrowRight (APG inversion)', async () => {
    render(
      <div dir="rtl">
        <Menu aria-label="Actions" defaultOpen trigger={<Button>Actions</Button>}>
          <MenuItem>Rename</MenuItem>
          <MenuSub label="Share">
            <MenuItem>Email</MenuItem>
          </MenuSub>
        </Menu>
      </div>,
    );
    const row = await screen.findByRole('menuitem', { name: 'Share' });

    // ArrowRight points AWAY from an inline-end flyout in RTL: it must not open
    fireEvent.keyDown(row, { key: 'ArrowRight' });
    expect(row).toHaveAttribute('aria-expanded', 'false');

    fireEvent.keyDown(row, { key: 'ArrowLeft' });
    expect(row).toHaveAttribute('aria-expanded', 'true');
    const email = await screen.findByRole('menuitem', { name: 'Email' });
    await waitFor(() => expect(email).toHaveFocus());

    // and the arrow pointing back at the row closes the flyout
    fireEvent.keyDown(email, { key: 'ArrowRight' });
    expect(row).toHaveAttribute('aria-expanded', 'false');
    expect(row).toHaveFocus();
  });

  it('opens the flyout toward inline-end (physical left) of the row', async () => {
    render(
      <div dir="rtl">
        <Menu aria-label="Actions" defaultOpen trigger={<Button>Actions</Button>}>
          <MenuSub label="Share">
            <MenuItem>Email</MenuItem>
          </MenuSub>
        </Menu>
      </div>,
    );
    const row = await screen.findByRole('menuitem', { name: 'Share' });
    stubRect(row, { left: 300, top: 50, width: 200, height: 20 });
    stubPanelSize();
    fireEvent.keyDown(row, { key: 'ArrowLeft' });
    const flyout = await screen.findByRole('menu', { name: 'Share' });
    expect(flyout.style.left).toBe('178px'); // row left 300 - offset 2 - width 120
    expect(flyout.style.top).toBe('50px'); // start-aligned to the row top
  });

  it('flips the flyout back to the physical right at the viewport edge', async () => {
    render(
      <div dir="rtl">
        <Menu aria-label="Actions" defaultOpen trigger={<Button>Actions</Button>}>
          <MenuSub label="Share">
            <MenuItem>Email</MenuItem>
          </MenuSub>
        </Menu>
      </div>,
    );
    const row = await screen.findByRole('menuitem', { name: 'Share' });
    stubRect(row, { left: 50, top: 50, width: 200, height: 20 }); // no room on the left
    stubPanelSize();
    fireEvent.keyDown(row, { key: 'ArrowLeft' });
    const flyout = await screen.findByRole('menu', { name: 'Share' });
    expect(flyout.style.left).toBe('252px'); // row right 250 + offset 2
  });

  it('anchors a ContextMenu to the pointer with the panel hanging toward inline-start', () => {
    render(
      <div dir="rtl">
        <ContextMenu aria-label="Canvas" content={<MenuItem>Copy</MenuItem>}>
          <div data-testid="zone">Zone</div>
        </ContextMenu>
      </div>,
    );
    stubPanelSize();
    fireEvent.contextMenu(screen.getByTestId('zone'), { clientX: 300, clientY: 100 });
    const menu = screen.getByRole('menu', { name: 'Canvas' });
    expect(menu).toHaveAttribute('dir', 'rtl');
    expect(menu.style.left).toBe('180px'); // right edge at the pointer x: 300 - width 120
    expect(menu.style.top).toBe('102px'); // pointer y plus the 2px offset
  });
});
