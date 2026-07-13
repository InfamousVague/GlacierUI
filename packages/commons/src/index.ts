/**
 * @glacier/commons — the renderer-agnostic layer.
 *
 * Everything here is pure React or plain TypeScript: no `document`, no DOM
 * elements, no `react-native` imports. It is the shared brain that both the DOM
 * kit (@glacier/react) and the React Native kit (@glacier/native) consume, so a
 * behavior is written and tested once and cannot drift between platforms. Paint
 * and geometry live in @glacier/spec; this holds the LOGIC.
 */

import { useCallback, useRef, useState } from 'react';

// Spec-derived style resolvers, the shared seam that keeps the DOM and native
// bindings reading one paint/geometry contract instead of hand-transcribing it.
export { paintFor, sizeFor, dimensionsFor, type TokenMap, type StyleGroup } from './spec.ts';

/**
 * Controlled/uncontrolled state in one hook. Pass `value` to control it, or
 * `defaultValue` to let the hook own it. Returns the resolved value and a
 * setter that always calls `onChange` and only updates internal state while
 * uncontrolled, so a controlled parent stays the single source of truth. This
 * is the same contract every toggle, slider, and field in both kits needs.
 */
export function useControlled<T>(options: {
  value?: T;
  defaultValue: T;
  onChange?: (next: T) => void;
}): [T, (next: T) => void] {
  const { value, defaultValue, onChange } = options;
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<T>(defaultValue);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const resolved = isControlled ? (value as T) : internal;

  const set = useCallback(
    (next: T) => {
      if (!isControlled) setInternal(next);
      onChangeRef.current?.(next);
    },
    [isControlled],
  );

  return [resolved, set];
}

/**
 * The press-feedback scale for tappable controls, shared so a Button dips by
 * the same amount whether it is a DOM `whileTap` or a React Native pressed
 * transform. Kept as plain numbers, not a motion runtime, so each platform
 * animates it with its own engine (framer-motion on web, Reanimated native).
 */
export const press = {
  /** Full-size controls (buttons, cards): a gentle dip. */
  control: 0.97,
  /** Small controls (chips, icon buttons): a slightly firmer dip. */
  compact: 0.94,
} as const;

export type PressScale = keyof typeof press;
