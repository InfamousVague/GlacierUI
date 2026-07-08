import { describe, expect, it, vi } from 'vitest';
import { act, render, screen, fireEvent } from '@testing-library/react';
import axe from 'axe-core';
import { FloatingPanel } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

// jsdom does not implement PointerEvent, so fireEvent.pointer* delivers a bare
// Event with no coordinates. A MouseEvent named as the pointer type carries
// clientX/clientY/button and reaches the native pointer listeners the drag uses.
// The drag updates state from a native (non-React) listener, so the dispatch is
// wrapped in act() to flush the resulting render before we assert.
function pointer(
  type: 'pointerdown' | 'pointermove' | 'pointerup',
  target: EventTarget,
  init: { clientX?: number; clientY?: number; button?: number } = {},
) {
  act(() => {
    target.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, ...init }));
  });
}

describe('FloatingPanel', () => {
  it('renders a labelled dialog only when open', () => {
    const { rerender } = render(
      <FloatingPanel open={false} title="Notes" onClose={() => {}}>
        Body
      </FloatingPanel>,
    );
    expect(screen.queryByRole('dialog')).toBeNull();

    rerender(
      <FloatingPanel open title="Notes" onClose={() => {}}>
        Body
      </FloatingPanel>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Notes' });
    expect(dialog).toBeInTheDocument();
    // non-modal: no aria-modal
    expect(dialog).not.toHaveAttribute('aria-modal');
  });

  it('positions at defaultPosition', () => {
    render(
      <FloatingPanel open title="Notes" defaultPosition={{ x: 120, y: 80 }} onClose={() => {}}>
        Body
      </FloatingPanel>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveStyle({ top: '80px', left: '120px' });
  });

  it('closes via the close button', () => {
    const onClose = vi.fn();
    render(
      <FloatingPanel open title="Notes" onClose={onClose}>
        Body
      </FloatingPanel>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape', () => {
    const onClose = vi.fn();
    render(
      <FloatingPanel open title="Notes" onClose={onClose}>
        Body
      </FloatingPanel>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close on Escape while closed', () => {
    const onClose = vi.fn();
    render(
      <FloatingPanel open={false} title="Notes" onClose={onClose}>
        Body
      </FloatingPanel>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('moves when the handle is dragged', () => {
    render(
      <FloatingPanel open title="Notes" defaultPosition={{ x: 100, y: 100 }} onClose={() => {}}>
        Body
      </FloatingPanel>,
    );
    const dialog = screen.getByRole('dialog');
    const handle = dialog.querySelector('[data-glacier-drag-handle]') as HTMLElement;
    expect(dialog).toHaveStyle({ left: '100px', top: '100px' });
    // jsdom reports 0-size rects, so grabbing at (40,30) gives a grab offset of
    // (40,30); moving the pointer to (200,160) lands the top-left at (160,130).
    pointer('pointerdown', handle, { button: 0, clientX: 40, clientY: 30 });
    pointer('pointermove', document, { clientX: 200, clientY: 160 });
    expect(dialog).toHaveStyle({ left: '160px', top: '130px' });
    pointer('pointerup', document);
  });

  it('stops moving after the drag ends', () => {
    render(
      <FloatingPanel open title="Notes" defaultPosition={{ x: 100, y: 100 }} onClose={() => {}}>
        Body
      </FloatingPanel>,
    );
    const dialog = screen.getByRole('dialog');
    const handle = dialog.querySelector('[data-glacier-drag-handle]') as HTMLElement;
    // grab at (0,0): jsdom rect.left/top are 0, so the grab offset is 0 and the
    // panel top-left tracks the pointer directly.
    pointer('pointerdown', handle, { button: 0, clientX: 0, clientY: 0 });
    pointer('pointermove', document, { clientX: 130, clientY: 120 });
    expect(dialog).toHaveStyle({ left: '130px', top: '120px' });
    pointer('pointerup', document);
    // a move after release is ignored
    pointer('pointermove', document, { clientX: 300, clientY: 300 });
    expect(dialog).toHaveStyle({ left: '130px', top: '120px' });
  });

  it('does not start a drag from the close button', () => {
    const onClose = vi.fn();
    render(
      <FloatingPanel open title="Notes" defaultPosition={{ x: 100, y: 100 }} onClose={onClose}>
        Body
      </FloatingPanel>,
    );
    const dialog = screen.getByRole('dialog');
    const closeBtn = screen.getByRole('button', { name: 'Close' });
    pointer('pointerdown', closeBtn, { button: 0, clientX: 200, clientY: 100 });
    pointer('pointermove', document, { clientX: 400, clientY: 400 });
    // position unchanged: the drag never armed
    expect(dialog).toHaveStyle({ left: '100px', top: '100px' });
  });

  it('has no axe violations when open', async () => {
    render(
      <FloatingPanel open title="Notes" onClose={() => {}}>
        Panel body content.
      </FloatingPanel>,
    );
    await screen.findByRole('dialog');
    expect((await axe.run(document.body, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
