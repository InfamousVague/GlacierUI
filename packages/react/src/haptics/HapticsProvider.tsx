import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { fireMotor, setHapticsEnabled, type HapticFn } from './haptics.ts';
import { emitFeedback, pressedKind } from './feedback.ts';

const HapticsContext = createContext<HapticFn>(fireMotor);

/** The haptic fire function from the nearest provider, else the web engine. */
export const useHaptics = (): HapticFn => useContext(HapticsContext);

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
 *
 * The hook it exposes (useHaptics) also announces each fire on the shared
 * feedback bus, so a VisualFeedbackProvider can paint a matching effect in the
 * same frame. Delegated presses stay off the bus - the visual layer watches
 * presses through its own listener - so the two never double up.
 */
export function HapticsProvider({ enabled = false, impl, children }: HapticsProviderProps) {
  const motor = impl ?? fireMotor;
  // What components get from useHaptics: buzz plus a bus announcement, so a
  // programmatic haptic('success') reaches the visual layer too.
  const fire = useMemo<HapticFn>(
    () => (kind) => {
      motor(kind);
      emitFeedback({ kind: kind ?? 'light' });
    },
    [motor],
  );

  useEffect(() => {
    setHapticsEnabled(enabled);
    if (!enabled) return;

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') return; // mouse and pen have no motor
      const kind = pressedKind(event.target);
      if (kind === null) return;
      motor(kind); // motor only; the visual layer handles the same press itself
    };

    document.addEventListener('pointerdown', onPointerDown, { capture: true, passive: true });
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, { capture: true });
      setHapticsEnabled(false);
    };
  }, [enabled, motor]);

  return <HapticsContext.Provider value={fire}>{children}</HapticsContext.Provider>;
}
