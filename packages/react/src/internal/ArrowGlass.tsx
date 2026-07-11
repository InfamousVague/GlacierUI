import { useLayoutEffect, useRef, useState } from 'react';
import type { Placement } from './useAnchoredPosition.ts';
import styles from './ArrowGlass.module.css';

/**
 * The one-piece glass surface behind an anchored panel: a rounded rectangle
 * and its trigger-facing tip drawn as a SINGLE clip-path, so one backdrop
 * sample and one tint cover both and no seam can exist between them. A
 * two-element arrow can never manage that: wherever it overlaps the panel it
 * re-samples already-blurred pixels, and wherever it does not, its tiny box
 * clamps the blur differently than the panel's.
 *
 * Layers, bottom to top: a blurred clipped underlay approximating the drop
 * shadow (filters on siblings leave backdrop sampling alone; on ancestors
 * they would break it), the glass itself, and an SVG stroking the same path
 * with the hairline. The host renders its content above.
 */

interface ArrowGlassProps {
  /** Resolved placement from useAnchoredPosition; null hides the tip. */
  placement: Placement | null | undefined;
  /** Tip protrusion depth in px. */
  tip?: number;
  /** Half the tip's base width in px. */
  tipHalf?: number;
  /** Distance of the tip center from the panel corner for -start / -end. */
  tipInset?: number;
}

type Side = 'top' | 'bottom' | 'left' | 'right';

function parse(placement: Placement): { side: Side; align: string } {
  const [side, align] = placement.split('-') as [Side, string | undefined];
  return { side, align: align ?? 'center' };
}

/**
 * Builds the union path in the coordinate space of the extended box: the
 * panel rect plus the tip strip on the side facing the trigger. The tip sits
 * on the opposite edge of the placement side (a panel placed 'top' points
 * down at its trigger).
 */
function buildPath(
  w: number,
  h: number,
  r: number,
  placement: Placement,
  tip: number,
  tipHalf: number,
  tipInset: number,
): { d: string; box: { top: number; left: number; width: number; height: number } } {
  const { side, align } = parse(placement);
  const radius = Math.max(0, Math.min(r, Math.min(w, h) / 2 - 1));

  // tip center along the tipped edge
  const tipAt = (extent: number) =>
    align === 'start' ? tipInset + tipHalf : align === 'end' ? extent - tipInset - tipHalf : extent / 2;

  if (side === 'top' || side === 'bottom') {
    const tx = tipAt(w);
    const box = side === 'top' ? { top: 0, left: 0, width: w, height: h + tip } : { top: -tip, left: 0, width: w, height: h + tip };
    // panel rect occupies y in [y0, y0+h]; tip dips beyond it
    const y0 = side === 'top' ? 0 : tip;
    const y1 = y0 + h;
    const d =
      side === 'top'
        ? // tip on the BOTTOM edge, pointing down
          `M ${radius} ${y0} H ${w - radius} A ${radius} ${radius} 0 0 1 ${w} ${y0 + radius} V ${y1 - radius} A ${radius} ${radius} 0 0 1 ${w - radius} ${y1} H ${tx + tipHalf} L ${tx} ${y1 + tip} L ${tx - tipHalf} ${y1} H ${radius} A ${radius} ${radius} 0 0 1 0 ${y1 - radius} V ${y0 + radius} A ${radius} ${radius} 0 0 1 ${radius} ${y0} Z`
        : // tip on the TOP edge, pointing up
          `M ${radius} ${y0} H ${tx - tipHalf} L ${tx} ${y0 - tip} L ${tx + tipHalf} ${y0} H ${w - radius} A ${radius} ${radius} 0 0 1 ${w} ${y0 + radius} V ${y1 - radius} A ${radius} ${radius} 0 0 1 ${w - radius} ${y1} H ${radius} A ${radius} ${radius} 0 0 1 0 ${y1 - radius} V ${y0 + radius} A ${radius} ${radius} 0 0 1 ${radius} ${y0} Z`;
    return { d, box };
  }

  const ty = tipAt(h);
  const box = side === 'left' ? { top: 0, left: 0, width: w + tip, height: h } : { top: 0, left: -tip, width: w + tip, height: h };
  const x0 = side === 'left' ? 0 : tip;
  const x1 = x0 + w;
  const d =
    side === 'left'
      ? // tip on the RIGHT edge, pointing right
        `M ${x0 + radius} 0 H ${x1 - radius} A ${radius} ${radius} 0 0 1 ${x1} ${radius} V ${ty - tipHalf} L ${x1 + tip} ${ty} L ${x1} ${ty + tipHalf} V ${h - radius} A ${radius} ${radius} 0 0 1 ${x1 - radius} ${h} H ${x0 + radius} A ${radius} ${radius} 0 0 1 ${x0} ${h - radius} V ${radius} A ${radius} ${radius} 0 0 1 ${x0 + radius} 0 Z`
      : // tip on the LEFT edge, pointing left
        `M ${x0 + radius} 0 H ${x1 - radius} A ${radius} ${radius} 0 0 1 ${x1} ${radius} V ${h - radius} A ${radius} ${radius} 0 0 1 ${x1 - radius} ${h} H ${x0 + radius} A ${radius} ${radius} 0 0 1 ${x0} ${h - radius} V ${ty + tipHalf} L ${x0 - tip} ${ty} L ${x0} ${ty - tipHalf} V ${radius} A ${radius} ${radius} 0 0 1 ${x0 + radius} 0 Z`;
  return { d, box };
}

export function ArrowGlass({ placement, tip = 6, tipHalf = 7, tipInset = 14 }: ArrowGlassProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [shape, setShape] = useState<ReturnType<typeof buildPath> | null>(null);

  useLayoutEffect(() => {
    const host = hostRef.current?.parentElement;
    if (!host || !placement) return;
    const measure = () => {
      const w = host.offsetWidth;
      const h = host.offsetHeight;
      if (!w || !h) return;
      // the sizing probe carries the panel's resolved corner radius in px
      const r = parseFloat(getComputedStyle(hostRef.current!).borderTopLeftRadius) || 0;
      setShape(buildPath(w, h, r, placement, tip, tipHalf, tipInset));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    return () => observer.disconnect();
  }, [placement, tip, tipHalf, tipInset]);

  const style = shape
    ? {
        top: shape.box.top,
        left: shape.box.left,
        width: shape.box.width,
        height: shape.box.height,
      }
    : undefined;
  const clip = shape ? { clipPath: `path('${shape.d}')` } : undefined;

  return (
    <div ref={hostRef} className={styles.host} aria-hidden="true">
      {shape && (
        <>
          <div className={styles.shadow} style={{ ...style, ...clip }} />
          <div className={styles.glass} style={{ ...style, ...clip }} />
          <svg
            className={styles.outline}
            style={style}
            width={shape.box.width}
            height={shape.box.height}
            viewBox={`0 0 ${shape.box.width} ${shape.box.height}`}
          >
            <path d={shape.d} fill="none" />
          </svg>
        </>
      )}
    </div>
  );
}
