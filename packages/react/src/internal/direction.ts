import { useLayoutEffect, useState, type RefObject } from 'react';

export type Direction = 'ltr' | 'rtl';

/**
 * The writing direction in effect at a node. The nearest dir attribute wins
 * (matching how the attribute cascades), then the computed style, then the
 * document element, defaulting to ltr. Call it at event or measure time - a
 * live read can never go stale, unlike a render-time snapshot.
 */
export function resolveDirection(node: Element | null | undefined): Direction {
  if (node) {
    const scoped = node.closest('[dir]');
    if (scoped) {
      const dir = scoped.getAttribute('dir')?.toLowerCase();
      if (dir === 'rtl' || dir === 'ltr') return dir;
    }
    if (typeof getComputedStyle !== 'undefined') {
      const computed = getComputedStyle(node).direction;
      if (computed === 'rtl' || computed === 'ltr') return computed;
    }
  }
  if (typeof document !== 'undefined' && document.documentElement.dir.toLowerCase() === 'rtl') return 'rtl';
  return 'ltr';
}

/**
 * Render-time direction for a ref, kept in sync with dir flips on the document
 * element (the docs preference toggles it live). Prefer resolveDirection inside
 * event handlers; reach for this only when the render output itself must
 * differ, e.g. choosing which chevron glyph to draw.
 */
export function useDirection(ref: RefObject<Element | null>): Direction {
  const [direction, setDirection] = useState<Direction>('ltr');
  useLayoutEffect(() => {
    const update = () => setDirection(resolveDirection(ref.current));
    update();
    if (typeof MutationObserver === 'undefined') return;
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['dir'] });
    return () => observer.disconnect();
  }, [ref]);
  return direction;
}
