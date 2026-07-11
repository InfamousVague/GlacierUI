import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { haptic, hapticsEnabled, setHapticsEnabled } from '../src/index.ts';

/**
 * Exercises the web haptic engine's iOS path: with no navigator.vibrate the
 * engine falls back to toggling a hidden <input switch>, which is what pulses
 * the Taptic Engine on iOS Safari. jsdom has no vibrate, so this is the
 * default branch here.
 */
describe('haptics engine (iOS fallback)', () => {
  beforeEach(() => {
    delete (navigator as unknown as { vibrate?: unknown }).vibrate;
  });
  afterEach(() => {
    setHapticsEnabled(false);
    vi.restoreAllMocks();
  });

  it('reports the enabled state through hapticsEnabled()', () => {
    expect(hapticsEnabled()).toBe(false);
    setHapticsEnabled(true);
    expect(hapticsEnabled()).toBe(true);
    setHapticsEnabled(false);
    expect(hapticsEnabled()).toBe(false);
  });

  it('creates one hidden switch input and toggles it on every haptic', () => {
    setHapticsEnabled(true);
    haptic();

    const switches = document.querySelectorAll('input[switch]');
    expect(switches.length).toBe(1);
    const input = switches[0] as HTMLInputElement;
    expect(input.type).toBe('checkbox');
    expect(input.closest('label')).toHaveAttribute('aria-hidden', 'true');

    const before = input.checked;
    haptic('heavy');
    expect(input.checked).toBe(!before);
    // reused, not recreated
    expect(document.querySelectorAll('input[switch]').length).toBe(1);
  });

  it('does nothing while disabled', () => {
    const count = document.querySelectorAll('input[switch]').length;
    haptic('success');
    expect(document.querySelectorAll('input[switch]').length).toBe(count);
  });
});
