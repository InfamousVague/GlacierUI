import type { CSSProperties } from 'react';
import styles from './fx.module.css';

export type { ShapeName } from './ShapeLayer.tsx';

/**
 * The kit's light-animation utilities: class names you drop on any element.
 *
 * - `riseIn` - the staggerable entrance. Pair with staggerVars(i) on each item.
 * - `shimmer` - a highlight travelling across the element, looping.
 * - `glowPulse` - the accent halo breathing, looping.
 *
 * Every one of them rests on its FINISHED frame, and the two loops only run
 * under prefers-reduced-motion: no-preference. See fx.module.css for the full
 * reduced-motion policy.
 */
export const fx = {
  riseIn: styles.riseIn,
  shimmer: styles.shimmer,
  glowPulse: styles.glowPulse,
} as const;

export type FxName = keyof typeof fx;

/**
 * The per-item stagger index, as an inline style. The delay itself is
 * `index x --glacier-stagger-step`, so the whole cascade retunes from one token
 * and collapses with it under reduced motion.
 *
 * ```tsx
 * items.map((item, i) => <Card key={item.id} className={fx.riseIn} style={staggerVars(i)} />)
 * ```
 */
export function staggerVars(index: number): CSSProperties {
  return { '--glacier-stagger-i': index } as CSSProperties;
}
