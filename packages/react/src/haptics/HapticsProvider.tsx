import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { haptic as webHaptic, setHapticsEnabled, type HapticFn, type HapticKind } from './haptics.ts';

const HapticsContext = createContext<HapticFn>(webHaptic);

/** The haptic fire function from the nearest provider, else the web engine. */
export const useHaptics = (): HapticFn => useContext(HapticsContext);

// The interactive elements a touch should buzz. Text-like inputs are excluded
// so typing does not vibrate; opt a control out with data-haptic="none", or
// change its intensity with data-haptic="heavy".
const PRESSABLE =
  'button, [role="button"], a[href], summary, [role="switch"], [role="checkbox"], [role="radio"], [role="tab"], [role="menuitem"], [role="option"], [data-haptic]';

interface HapticsProviderProps {
  /** Master switch, wired to a user preference. Off by default. */
  enabled?: boolean;
  /**
   * Replaces the web engine, e.g. a native shell passing its own haptics so the
   * kit fires real impact feedback instead of navigator.vibrate.
   */
  impl?: HapticFn;
  children: ReactNode;
}

/**
 * Enables haptic feedback for every touch press under it via one delegated
 * pointerdown listener, so no component needs wiring. Mouse and pen are ignored
 * (no motor), and it is a clean no-op where the platform cannot vibrate.
 */
export function HapticsProvider({ enabled = false, impl, children }: HapticsProviderProps) {
  const fire = impl ?? webHaptic;

  useEffect(() => {
    setHapticsEnabled(enabled);
    if (!enabled) return;

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') return;
      const target = event.target as Element | null;
      const el = target?.closest<HTMLElement>(PRESSABLE);
      if (!el) return;
      if (el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true') return;
      const kind = el.dataset.haptic as HapticKind | 'none' | undefined;
      if (kind === 'none') return;
      fire(kind || 'light');
    };

    document.addEventListener('pointerdown', onPointerDown, { capture: true, passive: true });
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, { capture: true });
      setHapticsEnabled(false);
    };
  }, [enabled, fire]);

  return <HapticsContext.Provider value={fire}>{children}</HapticsContext.Provider>;
}
