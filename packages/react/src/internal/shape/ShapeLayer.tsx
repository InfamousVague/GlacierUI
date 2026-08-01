import { shapes } from '@glacier/spec';
import type { ReactElement } from 'react';
import { cx } from '../cx.ts';
import styles from './ShapeLayer.module.css';

/**
 * The silhouette vocabulary, derived from the spec so the React kit cannot
 * drift from the contract. See @glacier/spec vocab.ts.
 */
export type ShapeName = (typeof shapes)[number];

export interface ShapeOptions {
  /** Plate silhouette. `rect` is the untouched default. */
  shape?: ShapeName;
  /** Paints the accent leading-edge stripe along the inline-start edge. */
  edgeAccent?: boolean;
  /** Slides the accent sweep in from the leading edge on hover and focus. */
  sweep?: boolean;
  /**
   * INTERNAL. Whether this host responds to a pointer at all. Only a lifting
   * host gets the hover/focus depth, the widening accent edge and the sweep -
   * a static shaped card must not glow under the cursor. Adopters pass their
   * own notion of interactive (always true for a Button, `interactive` for a
   * Card, never for a Pill or a StatTile); it is not a public prop.
   */
  lift?: boolean;
}

/**
 * The zero-regression case: a plain rectangle with no accents asks nothing of
 * the engine, so it gets nothing - no class, no attribute, no extra element.
 * `<Button>` and `<Button shape="rect">` render byte-identical DOM.
 */
function isPlain({ shape, edgeAccent, sweep }: ShapeOptions): boolean {
  return (shape === undefined || shape === 'rect') && !edgeAccent && !sweep;
}

/**
 * The props an adopting component spreads onto its host element. The host keeps
 * its own box: this only marks it as shaped (for the engine's paint hand-off)
 * and gives it a positioned, isolated stacking context for the layer.
 *
 * Returns an empty object in the plain case, so the attribute is absent rather
 * than present-and-default.
 */
export function shapeHostProps(options: ShapeOptions): {
  className?: string;
  'data-shape'?: ShapeName;
  'data-shape-lift'?: true;
} {
  if (isPlain(options)) return {};
  return {
    className: styles.host,
    'data-shape': options.shape ?? 'rect',
    ...(options.lift ? { 'data-shape-lift': true as const } : {}),
  };
}

/**
 * The plate. Renders as the host's first child, under the content: one
 * aria-hidden span that carries the silhouette, the variant paint, the optional
 * accent edge and the optional hover sweep. Null in the plain case.
 */
export function ShapeLayer(options: ShapeOptions): ReactElement | null {
  if (isPlain(options)) return null;
  const { shape = 'rect', edgeAccent, sweep } = options;
  return (
    <span
      aria-hidden="true"
      className={cx(styles.layer, styles[shape], edgeAccent && styles.edgeAccent, sweep && styles.sweep)}
    />
  );
}
