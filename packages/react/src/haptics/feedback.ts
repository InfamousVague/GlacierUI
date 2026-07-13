import type { HapticKind } from './haptics.ts';

/**
 * The shared feedback bus.
 *
 * Feedback in the kit is one intent - "a control was pressed" or "something
 * semantic just happened" - that two independent consumers can react to: the
 * haptic engine buzzes the device, and the visual-feedback layer paints a
 * subtle on-screen effect. Routing programmatic feedback through this bus is
 * what lets the two fire in lockstep: a single haptic('success') call reaches
 * both, so the shockwave lands on the same frame as the taptic.
 *
 * Pointer presses do NOT go through the bus. Each consumer installs its own
 * delegated listener so it can apply its own rules (haptics is touch-only and
 * needs no coordinates; visual feedback fires for every pointer type and wants
 * the press point for spatial effects). The bus carries only the programmatic
 * path, keeping the two press listeners from double-firing each other.
 */
export interface FeedbackEvent {
  /** The semantic kind, reused from the haptic vocabulary. */
  kind: HapticKind;
  /** Viewport origin for spatial effects. Absent for programmatic feedback, which centers. */
  x?: number;
  y?: number;
}

type Listener = (event: FeedbackEvent) => void;

const listeners = new Set<Listener>();

/** Subscribe to programmatic feedback. Returns an unsubscribe function. */
export function subscribeFeedback(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Notify every subscriber. Cheap no-op when nothing is listening. */
export function emitFeedback(event: FeedbackEvent): void {
  for (const listener of listeners) listener(event);
}

/**
 * The interactive elements a press should give feedback on. Text-like inputs
 * are excluded so typing stays quiet; opt a control out with data-haptic="none"
 * or change its kind with data-haptic="heavy". Shared by the haptics and
 * visual-feedback delegated listeners so both agree on what a press is.
 */
export const PRESSABLE =
  'button, [role="button"], a[href], summary, [role="switch"], [role="checkbox"], [role="radio"], [role="tab"], [role="menuitem"], [role="option"], [data-haptic]';

/**
 * Resolve the feedback kind for a pressed target: the nearest pressable's
 * data-haptic kind (default 'light'), or null when the target is not a
 * pressable, is disabled, or opts out with data-haptic="none".
 */
export function pressedKind(target: EventTarget | null): HapticKind | null {
  const el = (target as Element | null)?.closest<HTMLElement>(PRESSABLE);
  if (!el) return null;
  if (el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true') return null;
  const kind = el.dataset.haptic as HapticKind | 'none' | undefined;
  if (kind === 'none') return null;
  return kind || 'light';
}
