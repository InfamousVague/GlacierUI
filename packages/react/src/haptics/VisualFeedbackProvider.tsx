import { useReducedMotion } from 'motion/react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../internal/cx.ts';
import { subscribeFeedback, pressedKind } from './feedback.ts';
import type { HapticKind } from './haptics.ts';
import styles from './VisualFeedback.module.css';

/** The on-screen effect a press paints. */
export type VisualFeedbackVariant = 'shockwave' | 'pulse' | 'glow' | 'nudge';

/** How far the effect carries. Subtle by default: this is background texture. */
export type VisualFeedbackIntensity = 'subtle' | 'normal' | 'strong';

/** Trigger an effect by hand, in addition to the automatic press feedback. */
export type VisualFeedbackFn = (kind?: HapticKind, origin?: { x: number; y: number }) => void;

// Each haptic kind borrows a semantic tone so the color matches the feeling:
// impacts read as accent, and success/warning/error carry their own hue.
const TONE: Record<HapticKind, 'accent' | 'success' | 'warning' | 'danger'> = {
  selection: 'accent',
  light: 'accent',
  medium: 'accent',
  heavy: 'accent',
  success: 'success',
  warning: 'warning',
  error: 'danger',
};

// Amplitude multiplier per kind: a selection barely whispers, an error lands hard.
const AMPLITUDE: Record<HapticKind, number> = {
  selection: 0.68,
  light: 0.82,
  medium: 1,
  heavy: 1.3,
  success: 1.05,
  warning: 1.12,
  error: 1.28,
};

// Intensity sets the base reach: shockwave diameter (px), starting opacity, and
// the nudge travel (px).
const BASE: Record<VisualFeedbackIntensity, { size: number; opacity: number; nudge: number }> = {
  subtle: { size: 150, opacity: 0.16, nudge: 2 },
  normal: { size: 230, opacity: 0.28, nudge: 3.5 },
  strong: { size: 340, opacity: 0.42, nudge: 6 },
};

// Bus-driven (programmatic) feedback is deduped against the press listener: an
// event this soon after a press is that same press's own component haptic,
// already shown at the press point, so it is dropped instead of doubled.
const PRESS_SUPPRESS_MS = 150;
// And rapid programmatic feedback (a drag ticking selection haptics) is capped
// so it reads as texture, not a strobe.
const BUS_THROTTLE_MS = 55;
// Effects self-remove on animationend; this backstops any missed event.
const MAX_LIFETIME_MS = 900;
const MAX_CONCURRENT = 6;

interface Effect {
  id: number;
  kind: HapticKind;
  x: number;
  y: number;
}

const VisualFeedbackContext = createContext<VisualFeedbackFn>(() => {});

/** Fire a visual effect by hand from the nearest provider (a no-op with none). */
export const useVisualFeedback = (): VisualFeedbackFn => useContext(VisualFeedbackContext);

interface VisualFeedbackProviderProps {
  /** Master switch, wired to a user preference. Off by default. */
  enabled?: boolean;
  /** The effect style. Defaults to shockwave (a ring from the press point). */
  variant?: VisualFeedbackVariant;
  /** How far the effect carries. Defaults to subtle. */
  intensity?: VisualFeedbackIntensity;
  children: ReactNode;
}

/**
 * Paints subtle on-screen feedback for every press, in lockstep with the device
 * haptics. Where HapticsProvider buzzes the motor, this draws a shockwave, a
 * tinted pulse, an edge glow, or a whole-screen nudge, colored by the press's
 * semantic kind. It works for every pointer type (so it is the desktop stand-in
 * for haptics), fires programmatic feedback through the shared bus so a
 * haptic('success') lands a matching effect, and collapses to a still color cue
 * under prefers-reduced-motion. Off by default; gate it behind a preference.
 */
export function VisualFeedbackProvider({
  enabled = false,
  variant = 'shockwave',
  intensity = 'subtle',
  children,
}: VisualFeedbackProviderProps) {
  const reduce = useReducedMotion();
  // A nudge is pure movement; under reduced motion it becomes a still edge glow.
  const effectiveVariant: VisualFeedbackVariant = reduce && variant === 'nudge' ? 'glow' : variant;

  const [effects, setEffects] = useState<Effect[]>([]);
  const hostRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);
  // Seeded so nothing counts as "recent" before the first real press.
  const lastPressRef = useRef(-Infinity);
  const lastBusRef = useRef(-Infinity);
  // The most recent pointer position, used as the origin for programmatic
  // (bus-driven) feedback that carries no coordinates of its own — so a haptic
  // fired by a control the user is pressing (a NumberInput stepper, a slider
  // drag) radiates from that control, not the middle of the screen.
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);
  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  const remove = useCallback((id: number) => {
    setEffects((list) => list.filter((e) => e.id !== id));
  }, []);

  // Kick the whole app on the physical axis, then spring back. Imperative so
  // rapid nudges restart cleanly, and skipped when the browser cannot animate.
  const nudge = useCallback((kind: HapticKind) => {
    const host = hostRef.current;
    if (!host || typeof host.animate !== 'function') return;
    const travel = BASE[intensity].nudge * AMPLITUDE[kind];
    host.animate(
      [
        { transform: 'translateY(0)' },
        { transform: `translateY(-${travel}px)`, offset: 0.35 },
        { transform: 'translateY(0)' },
      ],
      { duration: 300, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    );
  }, [intensity]);

  const fire = useCallback<VisualFeedbackFn>(
    (kind = 'light', origin) => {
      if (effectiveVariant === 'nudge') {
        nudge(kind);
        return;
      }
      // Prefer an explicit origin, then the last pointer position (where the
      // user is actually touching), and only fall back to screen center when
      // there has been no pointer at all (e.g. a keyboard-only session).
      const x = origin?.x ?? lastPointerRef.current?.x ?? window.innerWidth / 2;
      const y = origin?.y ?? lastPointerRef.current?.y ?? window.innerHeight / 2;
      const id = ++idRef.current;
      setEffects((list) => {
        const next = [...list, { id, kind, x, y }];
        return next.length > MAX_CONCURRENT ? next.slice(next.length - MAX_CONCURRENT) : next;
      });
      const timer = setTimeout(() => {
        remove(id);
        timersRef.current.delete(timer);
      }, MAX_LIFETIME_MS);
      timersRef.current.add(timer);
    },
    [effectiveVariant, nudge, remove],
  );

  // Delegated press listener: the primary driver. Fires for every pointer type
  // at the press point, so it is the desktop equivalent of a taptic.
  useEffect(() => {
    if (!enabled) return;
    // Track the pointer everywhere so programmatic feedback can borrow it. This
    // runs before the pressedKind gate below, so it updates even for controls
    // that opt out of the press haptic (data-haptic="none", e.g. steppers).
    const trackPointer = (event: PointerEvent) => {
      lastPointerRef.current = { x: event.clientX, y: event.clientY };
    };
    const onPointerDown = (event: PointerEvent) => {
      trackPointer(event);
      const kind = pressedKind(event.target);
      if (kind === null) return;
      // Same clock the bus dedupe reads, so the two compare correctly.
      lastPressRef.current = performance.now();
      fire(kind, { x: event.clientX, y: event.clientY });
    };
    document.addEventListener('pointerdown', onPointerDown, { capture: true, passive: true });
    document.addEventListener('pointermove', trackPointer, { capture: true, passive: true });
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, { capture: true });
      document.removeEventListener('pointermove', trackPointer, { capture: true });
    };
  }, [enabled, fire]);

  // Programmatic feedback from the bus (a component's haptic during a drag, a
  // success toast). Deduped against the press listener and throttled.
  useEffect(() => {
    if (!enabled) return;
    return subscribeFeedback((event) => {
      const now = performance.now();
      if (now - lastPressRef.current < PRESS_SUPPRESS_MS) return;
      if (now - lastBusRef.current < BUS_THROTTLE_MS) return;
      lastBusRef.current = now;
      fire(event.kind, event.x != null && event.y != null ? { x: event.x, y: event.y } : undefined);
    });
  }, [enabled, fire]);

  // Clear pending removal timers on unmount.
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const timer of timers) clearTimeout(timer);
      timers.clear();
    };
  }, []);

  const overlay =
    enabled && effectiveVariant !== 'nudge' && effects.length > 0 && typeof document !== 'undefined'
      ? createPortal(
          <div className={styles.overlay} aria-hidden="true">
            {effects.map((effect) => (
              <span
                key={effect.id}
                className={styles[effectiveVariant]}
                data-kind={effect.kind}
                style={effectStyle(effect, effectiveVariant, intensity)}
                onAnimationEnd={() => remove(effect.id)}
              />
            ))}
          </div>,
          document.body,
        )
      : null;

  return (
    <VisualFeedbackContext.Provider value={fire}>
      <div ref={hostRef} className={cx(effectiveVariant === 'nudge' && styles.nudgeHost)}>
        {children}
      </div>
      {overlay}
    </VisualFeedbackContext.Provider>
  );
}

function effectStyle(effect: Effect, variant: VisualFeedbackVariant, intensity: VisualFeedbackIntensity): CSSProperties {
  const amp = AMPLITUDE[effect.kind];
  const base = BASE[intensity];
  const vars: Record<string, string> = {
    '--fb-color': `var(--glacier-${TONE[effect.kind]}-solid)`,
    '--fb-size': `${Math.round(base.size * amp)}px`,
    '--fb-opacity': `${Math.min(base.opacity * amp, 0.9)}`,
    '--fb-x': `${effect.x}px`,
    '--fb-y': `${effect.y}px`,
  };
  if (variant === 'shockwave') {
    vars.left = `${effect.x}px`;
    vars.top = `${effect.y}px`;
  }
  return vars as CSSProperties;
}
