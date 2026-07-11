import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { useAnchoredPosition, type Placement } from '../src/internal/useAnchoredPosition.ts';

/**
 * Exercises the positioning engine directly through a bare harness. The jsdom
 * layout is all zeros, so each test stubs the trigger rect and the floating
 * element's offset size, then nudges the engine with a resize event (the same
 * path a real viewport change takes) and reads the styles it wrote to the DOM.
 */

function Anchored({ placement, dir, matchWidth }: { placement: Placement; dir?: 'ltr' | 'rtl'; matchWidth?: boolean }) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const floatingRef = useRef<HTMLDivElement>(null);
  const position = useAnchoredPosition(true, triggerRef, floatingRef, { placement, matchWidth });
  return (
    <div dir={dir}>
      <button ref={triggerRef} data-testid="trigger" type="button" />
      <div ref={floatingRef} data-testid="floating" data-placement={position?.placement} />
    </div>
  );
}

// trigger: left 100, top 10, 100x20 (so right 200, bottom 30) unless overridden
function stubTriggerRect(rect: Partial<DOMRect> = {}) {
  const base = { left: 100, top: 10, width: 100, height: 20, ...rect };
  const full = {
    ...base,
    right: base.left + base.width,
    bottom: base.top + base.height,
    x: base.left,
    y: base.top,
    toJSON: () => ({}),
  } as DOMRect;
  vi.spyOn(screen.getByTestId('trigger'), 'getBoundingClientRect').mockReturnValue(full);
}

// floating panel: 120x80
function stubFloatingSize(width = 120, height = 80) {
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(width);
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(height);
}

function remeasure() {
  act(() => {
    window.dispatchEvent(new Event('resize'));
  });
}

const floating = () => screen.getByTestId('floating');

describe('useAnchoredPosition direction awareness', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('bottom-start aligns to the trigger left edge in LTR', () => {
    render(<Anchored placement="bottom-start" dir="ltr" />);
    stubTriggerRect();
    stubFloatingSize();
    remeasure();
    expect(floating().style.left).toBe('100px');
    expect(floating().style.top).toBe('38px'); // trigger bottom 30 + offset 8
  });

  it('bottom-start aligns to the trigger RIGHT edge in RTL (start = inline start)', () => {
    render(<Anchored placement="bottom-start" dir="rtl" />);
    stubTriggerRect();
    stubFloatingSize();
    remeasure();
    expect(floating().style.left).toBe('80px'); // trigger right 200 - width 120
    expect(floating().style.top).toBe('38px');
  });

  it('bottom-end mirrors to the trigger left edge in RTL', () => {
    render(<Anchored placement="bottom-end" dir="rtl" />);
    stubTriggerRect();
    stubFloatingSize();
    remeasure();
    expect(floating().style.left).toBe('100px'); // end = inline end = left edge
  });

  it('center alignment is direction-neutral', () => {
    render(<Anchored placement="bottom" dir="rtl" />);
    stubTriggerRect();
    stubFloatingSize();
    remeasure();
    expect(floating().style.left).toBe('90px'); // 100 + 50 - 60
  });

  it('inline-end resolves to the right side in LTR', () => {
    render(<Anchored placement="inline-end-start" dir="ltr" />);
    stubTriggerRect({ left: 400 });
    stubFloatingSize();
    remeasure();
    expect(floating().style.left).toBe('508px'); // trigger right 500 + offset 8
    expect(floating().style.top).toBe('10px'); // start on a horizontal side stays block-axis
    expect(floating().dataset.placement).toBe('right-start'); // reports resolved physical side
  });

  it('inline-end resolves to the left side in RTL', () => {
    render(<Anchored placement="inline-end-start" dir="rtl" />);
    stubTriggerRect({ left: 400 });
    stubFloatingSize();
    remeasure();
    expect(floating().style.left).toBe('272px'); // trigger left 400 - offset 8 - width 120
    expect(floating().dataset.placement).toBe('left-start');
  });

  it('inline-end flips back to the physical right at the RTL viewport edge', () => {
    render(<Anchored placement="inline-end-start" dir="rtl" />);
    stubTriggerRect({ left: 100 }); // 100 - 8 - 120 would poke past the padding
    stubFloatingSize();
    remeasure();
    expect(floating().style.left).toBe('208px'); // trigger right 200 + offset 8
    expect(floating().dataset.placement).toBe('right-start');
  });

  it('inline-start resolves to the right side in RTL', () => {
    render(<Anchored placement="inline-start" dir="rtl" />);
    stubTriggerRect({ left: 400 });
    stubFloatingSize();
    remeasure();
    expect(floating().style.left).toBe('508px');
  });

  it('physical left/right placements ignore direction', () => {
    render(<Anchored placement="right-start" dir="rtl" />);
    stubTriggerRect({ left: 400 });
    stubFloatingSize();
    remeasure();
    expect(floating().style.left).toBe('508px'); // still physically right of the trigger
  });

  it('matchWidth still mirrors the trigger width under RTL', () => {
    render(<Anchored placement="bottom-start" dir="rtl" matchWidth />);
    stubTriggerRect();
    stubFloatingSize();
    remeasure();
    expect(floating().style.minWidth).toBe('100px');
    expect(floating().style.left).toBe('80px');
  });

  it('re-resolves direction live on the next measure after a dir flip', () => {
    render(<Anchored placement="bottom-start" dir="ltr" />);
    stubTriggerRect();
    stubFloatingSize();
    remeasure();
    expect(floating().style.left).toBe('100px');

    screen.getByTestId('trigger').parentElement!.setAttribute('dir', 'rtl');
    remeasure();
    expect(floating().style.left).toBe('80px');
  });
});
