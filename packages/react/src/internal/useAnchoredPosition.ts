import { useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';

export type Side = 'top' | 'bottom' | 'left' | 'right';
export type Alignment = 'start' | 'center' | 'end';
export type Placement = Side | `${Side}-${Alignment}`;

export interface AnchorOptions {
  placement?: Placement;
  /** Gap between the trigger and the floating element, in pixels. */
  offset?: number;
  /** Viewport inset kept clear when clamping, in pixels. */
  padding?: number;
  /** Give the floating element at least the trigger's width. */
  matchWidth?: boolean;
}

interface Computed {
  style: CSSProperties;
  placement: Placement;
}

function parse(placement: Placement): { side: Side; align: Alignment } {
  const [side, align] = placement.split('-') as [Side, Alignment | undefined];
  return { side, align: align ?? 'center' };
}

function compute(
  trigger: DOMRect,
  floating: { width: number; height: number },
  options: Required<Omit<AnchorOptions, 'matchWidth'>>,
): Computed {
  const { offset, padding } = options;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let { side, align } = parse(options.placement);

  // flip the primary side when there is not enough room and the opposite fits
  if (side === 'bottom' && trigger.bottom + offset + floating.height > vh - padding) {
    if (trigger.top - offset - floating.height > padding) side = 'top';
  } else if (side === 'top' && trigger.top - offset - floating.height < padding) {
    if (trigger.bottom + offset + floating.height < vh - padding) side = 'bottom';
  } else if (side === 'right' && trigger.right + offset + floating.width > vw - padding) {
    if (trigger.left - offset - floating.width > padding) side = 'left';
  } else if (side === 'left' && trigger.left - offset - floating.width < padding) {
    if (trigger.right + offset + floating.width < vw - padding) side = 'right';
  }

  let top = 0;
  let left = 0;
  const vertical = side === 'top' || side === 'bottom';

  if (side === 'bottom') top = trigger.bottom + offset;
  else if (side === 'top') top = trigger.top - offset - floating.height;
  else if (side === 'right') left = trigger.right + offset;
  else left = trigger.left - offset - floating.width;

  if (vertical) {
    if (align === 'start') left = trigger.left;
    else if (align === 'end') left = trigger.right - floating.width;
    else left = trigger.left + trigger.width / 2 - floating.width / 2;
    left = Math.max(padding, Math.min(left, vw - floating.width - padding));
  } else {
    if (align === 'start') top = trigger.top;
    else if (align === 'end') top = trigger.bottom - floating.height;
    else top = trigger.top + trigger.height / 2 - floating.height / 2;
    top = Math.max(padding, Math.min(top, vh - floating.height - padding));
  }

  const transformOrigin = side === 'bottom' ? 'top' : side === 'top' ? 'bottom' : side === 'right' ? 'left' : 'right';

  return {
    placement: (align === 'center' ? side : `${side}-${align}`) as Placement,
    style: {
      position: 'fixed',
      top: Math.round(top),
      left: Math.round(left),
      transformOrigin,
      zIndex: 200,
    },
  };
}

/**
 * Positions a floating element against a trigger. Fixed to the viewport so it
 * escapes overflow-clipping ancestors, flips to the opposite side when it
 * would overflow, clamps to the viewport, and tracks scroll and resize. This
 * is the shared engine under Select, Popover, and any anchored surface.
 */
export function useAnchoredPosition(
  open: boolean,
  triggerRef: RefObject<HTMLElement | null>,
  floatingRef: RefObject<HTMLElement | null>,
  options: AnchorOptions = {},
): { style: CSSProperties; placement: Placement } | null {
  // React state carries only the side-dependent bits (transform origin +
  // placement for arrows / data-placement). The scroll-tracked geometry —
  // top/left/min-width — is written straight to the node so it never has to
  // wait for a React commit.
  const [result, setResult] = useState<{ style: CSSProperties; placement: Placement } | null>(null);
  const placement = options.placement ?? 'bottom-start';
  const offset = options.offset ?? 8;
  const padding = options.padding ?? 8;
  const matchWidth = options.matchWidth ?? false;
  const lastPlacement = useRef<Placement | null>(null);

  useLayoutEffect(() => {
    if (!open) {
      setResult(null);
      lastPlacement.current = null;
      return;
    }
    lastPlacement.current = null; // force a fresh commit on (re)open

    const update = () => {
      const trigger = triggerRef.current?.getBoundingClientRect();
      const floatingEl = floatingRef.current;
      if (!trigger || !floatingEl) return;
      const size = { width: floatingEl.offsetWidth, height: floatingEl.offsetHeight };
      const next = compute(trigger, size, { placement, offset, padding });

      // Write the position straight to the DOM so a fixed panel tracks its
      // anchor in the same scroll frame. Routing this through React state left
      // the panel one commit behind the trigger — the scroll lag. top/left are
      // deliberately NOT in the React style below, so a re-render never reverts
      // to a stale position.
      floatingEl.style.position = 'fixed';
      floatingEl.style.top = `${next.style.top as number}px`;
      floatingEl.style.left = `${next.style.left as number}px`;
      floatingEl.style.zIndex = '200';
      floatingEl.style.transformOrigin = String(next.style.transformOrigin);
      if (matchWidth) floatingEl.style.minWidth = `${Math.round(trigger.width)}px`;

      // Re-render only when the resolved side flips, so arrows / data-placement
      // can follow — not on every scroll frame.
      if (next.placement !== lastPlacement.current) {
        lastPlacement.current = next.placement;
        setResult({
          placement: next.placement,
          style: { position: 'fixed', zIndex: 200, transformOrigin: next.style.transformOrigin },
        });
      }
    };

    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    const observer =
      typeof ResizeObserver !== 'undefined' && floatingRef.current
        ? new ResizeObserver(update)
        : null;
    if (observer && floatingRef.current) observer.observe(floatingRef.current);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
      observer?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, placement, offset, padding, matchWidth]);

  return result;
}
