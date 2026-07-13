/**
 * Web haptics, best-effort and gracefully degrading.
 *
 * The web platform has no rich haptic API. What exists:
 *   - Android (Chrome, Firefox): navigator.vibrate() buzzes the device motor.
 *     There is no light/medium/heavy taptic, so intensity is approximated with
 *     short durations and patterns.
 *   - iOS Safari 17.4+: no navigator.vibrate, but toggling a hidden
 *     <input switch> pulses the Taptic Engine. A single fixed tap, no intensity.
 *   - Everywhere else (desktop): a no-op.
 *
 * Rich impact haptics only exist in a native shell (React Native, Capacitor, a
 * Tauri plugin). HapticsProvider accepts an `impl` so such a shell can replace
 * this web engine with real haptics without any call site changing.
 */

import { emitFeedback } from './feedback.ts';

export type HapticKind = 'selection' | 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

/** Vibration API durations / patterns (ms) per kind. iOS ignores these. */
const PATTERNS: Record<HapticKind, number | number[]> = {
  selection: 8,
  light: 10,
  medium: 18,
  heavy: 26,
  success: [12, 40, 14],
  warning: [16, 60, 16],
  error: [22, 40, 22, 40, 22],
};

let enabled = false;

/** Turn the web haptic engine on or off. HapticsProvider drives this. */
export function setHapticsEnabled(next: boolean): void {
  enabled = next;
}

export function hapticsEnabled(): boolean {
  return enabled;
}

const canVibrate = (): boolean =>
  typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';

// iOS Safari has no vibrate; a hidden switch input pulses the Taptic Engine when
// toggled. Created lazily on first use, reused after, and inert off iOS.
let iosSwitch: HTMLInputElement | null = null;
function iosTaptic(): void {
  if (typeof document === 'undefined') return;
  if (!iosSwitch) {
    const label = document.createElement('label');
    label.setAttribute('aria-hidden', 'true');
    label.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;opacity:0;pointer-events:none;';
    iosSwitch = document.createElement('input');
    iosSwitch.type = 'checkbox';
    iosSwitch.setAttribute('switch', ''); // the iOS-only attribute that makes it haptic
    label.appendChild(iosSwitch);
    document.body.appendChild(label);
  }
  // toggling the switch is what fires the pulse; the checked state is irrelevant
  iosSwitch.checked = !iosSwitch.checked;
}

/**
 * Buzz the device motor for the given kind, if haptics are enabled and the
 * platform can. Motor only: it drives no on-screen effect, so the delegated
 * press listener uses it (the visual layer watches presses itself and would
 * otherwise double up). A no-op when disabled or unsupported.
 */
export function fireMotor(kind: HapticKind = 'light'): void {
  if (!enabled) return;
  if (canVibrate()) {
    navigator.vibrate(PATTERNS[kind]);
    return;
  }
  iosTaptic();
}

/**
 * Fire feedback of the given kind: buzz the motor (when haptics are enabled)
 * and announce it on the shared bus so the visual-feedback layer can react in
 * the same frame. This is the programmatic entry point - what useHaptics()
 * returns and what components call directly - so a single call keeps taptic and
 * shockwave in lockstep. Safe to call anywhere.
 */
export function haptic(kind: HapticKind = 'light'): void {
  fireMotor(kind);
  emitFeedback({ kind });
}

export type HapticFn = (kind?: HapticKind) => void;
