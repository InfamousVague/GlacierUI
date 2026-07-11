import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button, HapticsProvider, haptic, setHapticsEnabled, useHaptics } from '../src/index.ts';

// jsdom's synthetic pointer events drop pointerType, so dispatch a native event
// with it defined to exercise the touch vs mouse branch the way a browser does.
function pointerDown(el: Element, pointerType: 'touch' | 'mouse') {
  const event = new Event('pointerdown', { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'pointerType', { value: pointerType, configurable: true });
  el.dispatchEvent(event);
}

describe('haptics', () => {
  beforeEach(() => {
    // jsdom has no navigator.vibrate; add a spy so the engine's Android path runs
    (navigator as unknown as { vibrate: (p: number | number[]) => boolean }).vibrate = vi.fn(() => true);
  });
  afterEach(() => {
    setHapticsEnabled(false);
    vi.restoreAllMocks();
    delete (navigator as unknown as { vibrate?: unknown }).vibrate;
  });

  it('is a no-op until enabled', () => {
    const vibrate = navigator.vibrate as ReturnType<typeof vi.fn>;
    haptic('light');
    expect(vibrate).not.toHaveBeenCalled();
    setHapticsEnabled(true);
    haptic('light');
    expect(vibrate).toHaveBeenCalledTimes(1);
  });

  it('buzzes a touch press on any pressable, and not a mouse press', () => {
    const vibrate = navigator.vibrate as ReturnType<typeof vi.fn>;
    render(
      <HapticsProvider enabled>
        <Button>Go</Button>
      </HapticsProvider>,
    );
    const button = screen.getByRole('button', { name: 'Go' });
    pointerDown(button, 'mouse');
    expect(vibrate).not.toHaveBeenCalled(); // mouse has no motor
    pointerDown(button, 'touch');
    expect(vibrate).toHaveBeenCalledTimes(1);
  });

  it('does not buzz when the provider is disabled', () => {
    const vibrate = navigator.vibrate as ReturnType<typeof vi.fn>;
    render(
      <HapticsProvider enabled={false}>
        <Button>Go</Button>
      </HapticsProvider>,
    );
    pointerDown(screen.getByRole('button', { name: 'Go' }), 'touch');
    expect(vibrate).not.toHaveBeenCalled();
  });

  it('respects data-haptic="none" as an opt-out', () => {
    const vibrate = navigator.vibrate as ReturnType<typeof vi.fn>;
    render(
      <HapticsProvider enabled>
        <button type="button" data-haptic="none">
          Silent
        </button>
      </HapticsProvider>,
    );
    pointerDown(screen.getByText('Silent'), 'touch');
    expect(vibrate).not.toHaveBeenCalled();
  });

  it('useHaptics returns the engine fire function', () => {
    let fn: ReturnType<typeof useHaptics> | null = null;
    function Probe() {
      fn = useHaptics();
      return null;
    }
    render(
      <HapticsProvider enabled>
        <Probe />
      </HapticsProvider>,
    );
    const vibrate = navigator.vibrate as ReturnType<typeof vi.fn>;
    fn!('heavy');
    expect(vibrate).toHaveBeenCalledTimes(1);
  });
});
