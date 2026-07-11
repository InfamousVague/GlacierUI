import { describe, expect, it, vi } from 'vitest';
import { act, render, screen, fireEvent } from '@testing-library/react';
import axe from 'axe-core';
import { HapticsProvider, ResizableSplitPane } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

// jsdom does not implement PointerEvent, so fireEvent.pointer* delivers a bare
// Event with no coordinates. A MouseEvent named as the pointer type carries
// clientX/button and reaches the pointer listeners the drag uses; act() flushes
// the state updates those native listeners trigger.
function pointer(
  type: 'pointerdown' | 'pointermove' | 'pointerup',
  target: EventTarget,
  init: { clientX?: number; clientY?: number; button?: number } = {},
) {
  act(() => {
    target.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, ...init }));
  });
}

describe('ResizableSplitPane', () => {
  it('renders two panes and a separator with value semantics', () => {
    render(
      <ResizableSplitPane aria-label="Resize" defaultRatio={0.4}>
        <div>Start</div>
        <div>End</div>
      </ResizableSplitPane>,
    );
    expect(screen.getByText('Start')).toBeInTheDocument();
    expect(screen.getByText('End')).toBeInTheDocument();
    const divider = screen.getByRole('separator', { name: 'Resize' });
    expect(divider).toHaveAttribute('aria-orientation', 'vertical');
    expect(divider).toHaveAttribute('aria-valuenow', '40');
    expect(divider).toHaveAttribute('aria-valuemin', '10');
    expect(divider).toHaveAttribute('aria-valuemax', '90');
  });

  it('reports horizontal orientation for a vertical split', () => {
    render(
      <ResizableSplitPane orientation="vertical" aria-label="Resize">
        <div>Top</div>
        <div>Bottom</div>
      </ResizableSplitPane>,
    );
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('nudges the ratio with the arrow keys and calls onRatioChange', () => {
    const onRatioChange = vi.fn();
    render(
      <ResizableSplitPane aria-label="Resize" defaultRatio={0.5} step={0.1} onRatioChange={onRatioChange}>
        <div>Start</div>
        <div>End</div>
      </ResizableSplitPane>,
    );
    const divider = screen.getByRole('separator');
    fireEvent.keyDown(divider, { key: 'ArrowRight' });
    expect(divider).toHaveAttribute('aria-valuenow', '60');
    expect(onRatioChange).toHaveBeenLastCalledWith(0.6);
    fireEvent.keyDown(divider, { key: 'ArrowLeft' });
    expect(divider).toHaveAttribute('aria-valuenow', '50');
  });

  it('clamps to min and max on Home and End', () => {
    render(
      <ResizableSplitPane aria-label="Resize" min={0.2} max={0.7} defaultRatio={0.5}>
        <div>Start</div>
        <div>End</div>
      </ResizableSplitPane>,
    );
    const divider = screen.getByRole('separator');
    fireEvent.keyDown(divider, { key: 'End' });
    expect(divider).toHaveAttribute('aria-valuenow', '70');
    fireEvent.keyDown(divider, { key: 'Home' });
    expect(divider).toHaveAttribute('aria-valuenow', '20');
    // arrows past the clamp stay clamped
    fireEvent.keyDown(divider, { key: 'ArrowLeft' });
    expect(divider).toHaveAttribute('aria-valuenow', '20');
  });

  it('resets to resetRatio on double-click', () => {
    const onRatioChange = vi.fn();
    render(
      <ResizableSplitPane aria-label="Resize" defaultRatio={0.5} resetRatio={0.3} onRatioChange={onRatioChange}>
        <div>Start</div>
        <div>End</div>
      </ResizableSplitPane>,
    );
    const divider = screen.getByRole('separator');
    fireEvent.keyDown(divider, { key: 'ArrowRight' });
    fireEvent.doubleClick(divider);
    expect(divider).toHaveAttribute('aria-valuenow', '30');
    expect(onRatioChange).toHaveBeenLastCalledWith(0.3);
  });

  it('respects a controlled ratio and does not self-update', () => {
    const onRatioChange = vi.fn();
    render(
      <ResizableSplitPane aria-label="Resize" ratio={0.5} onRatioChange={onRatioChange}>
        <div>Start</div>
        <div>End</div>
      </ResizableSplitPane>,
    );
    const divider = screen.getByRole('separator');
    fireEvent.keyDown(divider, { key: 'ArrowRight' });
    // stays at the controlled value until the parent re-renders it
    expect(divider).toHaveAttribute('aria-valuenow', '50');
    expect(onRatioChange).toHaveBeenCalledWith(0.52);
  });

  it('has no axe violations', async () => {
    render(
      <ResizableSplitPane aria-label="Resize panes" defaultRatio={0.4}>
        <div>Start</div>
        <div>End</div>
      </ResizableSplitPane>,
    );
    await screen.findByRole('separator');
    expect((await axe.run(document.body, { rules: AXE_RULES })).violations).toEqual([]);
  });

  /** Drag plumbing jsdom lacks: pointer capture stubs plus a fixed root box. */
  function stubDragBox(divider: HTMLElement) {
    divider.setPointerCapture = vi.fn();
    divider.releasePointerCapture = vi.fn();
    const root = divider.parentElement as HTMLElement;
    root.getBoundingClientRect = () =>
      ({ left: 0, right: 400, top: 0, bottom: 300, width: 400, height: 300, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect;
    return divider;
  }

  it('sizes the start pane from the pointer offset while dragging', () => {
    render(
      <ResizableSplitPane aria-label="Resize" defaultRatio={0.5}>
        <div>Start</div>
        <div>End</div>
      </ResizableSplitPane>,
    );
    const divider = stubDragBox(screen.getByRole('separator'));
    pointer('pointerdown', divider, { button: 0 });
    pointer('pointermove', divider, { clientX: 100 });
    expect(divider).toHaveAttribute('aria-valuenow', '25');
    pointer('pointerup', divider);
  });

  describe('clamp haptics', () => {
    // min 0.1 and max 0.9 of the 400px stub box sit at clientX 40 and 360.
    it('fires one medium tick per arrival at a clamp, re-arming off the bound', () => {
      const fire = vi.fn();
      render(
        <HapticsProvider enabled impl={fire}>
          <ResizableSplitPane aria-label="Resize" defaultRatio={0.5}>
            <div>Start</div>
            <div>End</div>
          </ResizableSplitPane>
        </HapticsProvider>,
      );
      const divider = stubDragBox(screen.getByRole('separator'));
      pointer('pointerdown', divider, { button: 0 });
      pointer('pointermove', divider, { clientX: 20 }); // hits min
      expect(fire).toHaveBeenCalledTimes(1);
      expect(fire).toHaveBeenLastCalledWith('medium');
      pointer('pointermove', divider, { clientX: 10 }); // rides the min clamp
      expect(fire).toHaveBeenCalledTimes(1);
      pointer('pointermove', divider, { clientX: 200 }); // leaves the bound
      expect(fire).toHaveBeenCalledTimes(1);
      pointer('pointermove', divider, { clientX: 390 }); // hits max
      expect(fire).toHaveBeenCalledTimes(2);
      pointer('pointermove', divider, { clientX: 30 }); // re-armed: min again
      expect(fire).toHaveBeenCalledTimes(3);
      pointer('pointerup', divider);
    });

    it('stays silent when the drag starts on a bound and remains there', () => {
      const fire = vi.fn();
      render(
        <HapticsProvider enabled impl={fire}>
          <ResizableSplitPane aria-label="Resize" defaultRatio={0.1}>
            <div>Start</div>
            <div>End</div>
          </ResizableSplitPane>
        </HapticsProvider>,
      );
      const divider = stubDragBox(screen.getByRole('separator'));
      pointer('pointerdown', divider, { button: 0 });
      pointer('pointermove', divider, { clientX: 0 });
      expect(fire).not.toHaveBeenCalled();
      pointer('pointerup', divider);
    });

    it('respects data-haptic="none" on the pane', () => {
      const fire = vi.fn();
      render(
        <HapticsProvider enabled impl={fire}>
          <ResizableSplitPane aria-label="Resize" defaultRatio={0.5} data-haptic="none">
            <div>Start</div>
            <div>End</div>
          </ResizableSplitPane>
        </HapticsProvider>,
      );
      const divider = stubDragBox(screen.getByRole('separator'));
      pointer('pointerdown', divider, { button: 0 });
      pointer('pointermove', divider, { clientX: 0 }); // hits min, opted out
      expect(fire).not.toHaveBeenCalled();
      pointer('pointerup', divider);
    });
  });

  describe('in RTL', () => {
    it('inverts the horizontal arrows so ArrowLeft grows the start pane', () => {
      const onRatioChange = vi.fn();
      render(
        <div dir="rtl">
          <ResizableSplitPane aria-label="Resize" defaultRatio={0.5} step={0.1} onRatioChange={onRatioChange}>
            <div>Start</div>
            <div>End</div>
          </ResizableSplitPane>
        </div>,
      );
      const divider = screen.getByRole('separator');
      // the start pane sits at the right edge; ArrowLeft moves the divider away
      // from it, growing the ratio
      fireEvent.keyDown(divider, { key: 'ArrowLeft' });
      expect(divider).toHaveAttribute('aria-valuenow', '60');
      expect(onRatioChange).toHaveBeenLastCalledWith(0.6);
      fireEvent.keyDown(divider, { key: 'ArrowRight' });
      expect(divider).toHaveAttribute('aria-valuenow', '50');
      // Home and End keep their meaning: min and max
      fireEvent.keyDown(divider, { key: 'Home' });
      expect(divider).toHaveAttribute('aria-valuenow', '10');
      fireEvent.keyDown(divider, { key: 'End' });
      expect(divider).toHaveAttribute('aria-valuenow', '90');
    });

    it('does not invert the vertical arrows for a vertical split', () => {
      render(
        <div dir="rtl">
          <ResizableSplitPane orientation="vertical" aria-label="Resize" defaultRatio={0.5} step={0.1}>
            <div>Top</div>
            <div>Bottom</div>
          </ResizableSplitPane>
        </div>,
      );
      const divider = screen.getByRole('separator');
      fireEvent.keyDown(divider, { key: 'ArrowUp' });
      expect(divider).toHaveAttribute('aria-valuenow', '40');
      fireEvent.keyDown(divider, { key: 'ArrowDown' });
      expect(divider).toHaveAttribute('aria-valuenow', '50');
    });

    it('measures the drag from the right edge, where the start pane sits', () => {
      render(
        <div dir="rtl">
          <ResizableSplitPane aria-label="Resize" defaultRatio={0.5}>
            <div>Start</div>
            <div>End</div>
          </ResizableSplitPane>
        </div>,
      );
      const divider = stubDragBox(screen.getByRole('separator'));
      pointer('pointerdown', divider, { button: 0 });
      // 100px from the left of a 400px box is 300px from the right edge
      pointer('pointermove', divider, { clientX: 100 });
      expect(divider).toHaveAttribute('aria-valuenow', '75');
      pointer('pointerup', divider);
    });
  });
});
