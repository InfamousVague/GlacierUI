import { describe, expect, it, vi } from 'vitest';
import { act, render, screen, fireEvent } from '@testing-library/react';
import { AppShell } from '../src/index.ts';

// jsdom does not implement PointerEvent, so fireEvent.pointer* delivers a bare
// Event with no coordinates. A MouseEvent named as the pointer type carries
// clientX/button and reaches the pointer listeners the drag uses; act() flushes
// any state updates those native listeners trigger.
function pointer(
  type: 'pointerdown' | 'pointermove' | 'pointerup',
  target: EventTarget,
  init: { clientX?: number; button?: number } = {},
) {
  act(() => {
    target.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, ...init }));
  });
}

/** Give the sidebar a fixed box so the resize math has real geometry. */
function stubSidebarBox(left = 0, width = 300) {
  const aside = screen.getByLabelText('Navigation');
  aside.getBoundingClientRect = () =>
    ({
      left,
      right: left + width,
      top: 0,
      bottom: 800,
      width,
      height: 800,
      x: left,
      y: 0,
      toJSON: () => ({}),
    }) as DOMRect;
  return aside;
}

function divider() {
  const handle = screen.getByRole('separator', { name: 'Resize sidebar' });
  handle.setPointerCapture = vi.fn();
  handle.releasePointerCapture = vi.fn();
  return handle;
}

const shell = (onSidebarWidthChange: (width: string) => void, dir?: 'rtl') => {
  const app = (
    <AppShell sidebar={<nav>Links</nav>} resizable onSidebarWidthChange={onSidebarWidthChange}>
      <p>Content</p>
    </AppShell>
  );
  return dir ? <div dir={dir}>{app}</div> : app;
};

describe('AppShell resizer', () => {
  it('grows with ArrowRight and shrinks with ArrowLeft in LTR', () => {
    const onWidth = vi.fn();
    render(shell(onWidth));
    stubSidebarBox();
    const handle = divider();
    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    expect(onWidth).toHaveBeenLastCalledWith('316px');
    fireEvent.keyDown(handle, { key: 'ArrowLeft' });
    expect(onWidth).toHaveBeenLastCalledWith('284px');
  });

  it('clamps to the min and max on Home and End', () => {
    const onWidth = vi.fn();
    render(shell(onWidth));
    stubSidebarBox();
    const handle = divider();
    fireEvent.keyDown(handle, { key: 'Home' });
    expect(onWidth).toHaveBeenLastCalledWith('200px');
    fireEvent.keyDown(handle, { key: 'End' });
    expect(onWidth).toHaveBeenLastCalledWith('460px');
  });

  it('sizes the sidebar to the pointer distance from its left edge in LTR', () => {
    const onWidth = vi.fn();
    render(shell(onWidth));
    stubSidebarBox(0, 300);
    const handle = divider();
    pointer('pointerdown', handle, { button: 0 });
    pointer('pointermove', handle, { clientX: 250 });
    expect(onWidth).toHaveBeenLastCalledWith('250px');
    pointer('pointerup', handle);
  });

  describe('in RTL', () => {
    it('inverts the arrows: ArrowLeft widens the right-hand sidebar', () => {
      const onWidth = vi.fn();
      render(shell(onWidth, 'rtl'));
      stubSidebarBox();
      const handle = divider();
      // the divider sits on the sidebar's left edge; ArrowLeft moves it further
      // left, widening the sidebar
      fireEvent.keyDown(handle, { key: 'ArrowLeft' });
      expect(onWidth).toHaveBeenLastCalledWith('316px');
      fireEvent.keyDown(handle, { key: 'ArrowRight' });
      expect(onWidth).toHaveBeenLastCalledWith('284px');
      // Home and End keep their meaning: min and max width
      fireEvent.keyDown(handle, { key: 'Home' });
      expect(onWidth).toHaveBeenLastCalledWith('200px');
      fireEvent.keyDown(handle, { key: 'End' });
      expect(onWidth).toHaveBeenLastCalledWith('460px');
    });

    it('sizes the sidebar from its right edge while dragging', () => {
      const onWidth = vi.fn();
      render(shell(onWidth, 'rtl'));
      // sidebar occupies 500..800; dragging to x=550 leaves 250px of sidebar
      stubSidebarBox(500, 300);
      const handle = divider();
      pointer('pointerdown', handle, { button: 0 });
      pointer('pointermove', handle, { clientX: 550 });
      expect(onWidth).toHaveBeenLastCalledWith('250px');
      pointer('pointerup', handle);
    });
  });
});
