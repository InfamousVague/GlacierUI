import { useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { resolveDirection, type Direction } from './direction.ts';

export type PhysicalSide = 'top' | 'bottom' | 'left' | 'right';
/**
 * Writing-direction relative sides: 'inline-end' resolves to 'right' in LTR
 * and 'left' in RTL (and 'inline-start' the opposite). Use these for surfaces
 * that should lead in the reading direction - e.g. submenu flyouts - and the
 * physical 'left'/'right' for surfaces that must stay put regardless of
 * direction. Resolution happens at measure time, so a live dir flip is picked
 * up on the next update.
 */
export type Side = PhysicalSide | 'inline-start' | 'inline-end';
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
  /** Re-measure when this value changes, e.g. a virtual anchor that moved. */
  key?: unknown;
}

/**
 * The least an anchor has to be: something that can report a rect. A real
 * element qualifies, and so does a duck-typed point (a zero-size rect at the
 * pointer) - which is how ContextMenu anchors a panel to a right-click.
 */
export interface VirtualAnchor {
  getBoundingClientRect(): DOMRect;
}

interface Computed {
  style: CSSProperties;
  placement: Placement;
}

// longest first, so 'inline-start' is not mistaken for side 'inline' + align 'start'
const SIDES: readonly Side[] = ['inline-start', 'inline-end', 'bottom', 'right', 'left', 'top'];

function parse(placement: Placement): { side: Side; align: Alignment } {
  for (const side of SIDES) {
    if (placement === side) return { side, align: 'center' };
    if (placement.startsWith(`${side}-`)) return { side, align: placement.slice(side.length + 1) as Alignment };
  }
  return { side: 'bottom', align: 'start' };
}

function compute(
  trigger: DOMRect,
  floating: { width: number; height: number },
  options: Required<Pick<AnchorOptions, 'placement' | 'offset' | 'padding'>> & { direction: Direction },
): Computed {
  const { offset, padding } = options;
  const rtl = options.direction === 'rtl';
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const { side: rawSide, align } = parse(options.placement);

  // resolve the logical sides to physical ones for this measurement
  let side: PhysicalSide =
    rawSide === 'inline-start' ? (rtl ? 'right' : 'left')
    : rawSide === 'inline-end' ? (rtl ? 'left' : 'right')
    : rawSide;

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
    // 'start' and 'end' are logical: start hugs the trigger's inline-start
    // edge, which is the right edge under RTL.
    if (align === 'center') left = trigger.left + trigger.width / 2 - floating.width / 2;
    else if ((align === 'start') !== rtl) left = trigger.left;
    else left = trigger.right - floating.width;
    left = Math.max(padding, Math.min(left, vw - floating.width - padding));
  } else {
    if (align === 'start') top = trigger.top;
    else if (align === 'end') top = trigger.bottom - floating.height;
    else top = trigger.top + trigger.height / 2 - floating.height / 2;
    top = Math.max(padding, Math.min(top, vh - floating.height - padding));
  }

  const transformOrigin = side === 'bottom' ? 'top' : side === 'top' ? 'bottom' : side === 'right' ? 'left' : 'right';

  return {
    // reports the RESOLVED physical side (post logical resolution and flip),
    // so arrows and data-placement can point at real screen geometry
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
  triggerRef: RefObject<HTMLElement | VirtualAnchor | null>,
  floatingRef: RefObject<HTMLElement | null>,
  options: AnchorOptions = {},
): { style: CSSProperties; placement: Placement } | null {
  // React state carries only the side-dependent bits (transform origin +
  // placement for arrows / data-placement). The scroll-tracked geometry -
  // top/left/min-width - is written straight to the node so it never has to
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
      const anchor = triggerRef.current;
      const trigger = anchor?.getBoundingClientRect();
      const floatingEl = floatingRef.current;
      if (!trigger || !floatingEl) return;
      const size = { width: floatingEl.offsetWidth, height: floatingEl.offsetHeight };
      // Direction is a live read at measure time - a dir flip is picked up by
      // the next update without a re-render. Virtual anchors (a ContextMenu
      // pointer rect) have no DOM node, so the floating panel stands in; it
      // carries the resolved dir attribute stamped by its owner.
      const direction = resolveDirection(anchor instanceof Element ? anchor : floatingEl);
      const next = compute(trigger, size, { placement, offset, padding, direction });

      // Write the position straight to the DOM so a fixed panel tracks its
      // anchor in the same scroll frame. Routing this through React state left
      // the panel one commit behind the trigger - the scroll lag. top/left are
      // deliberately NOT in the React style below, so a re-render never reverts
      // to a stale position.
      floatingEl.style.position = 'fixed';
      floatingEl.style.top = `${next.style.top as number}px`;
      floatingEl.style.left = `${next.style.left as number}px`;
      floatingEl.style.zIndex = '200';
      floatingEl.style.transformOrigin = String(next.style.transformOrigin);
      if (matchWidth) floatingEl.style.minWidth = `${Math.round(trigger.width)}px`;

      // Re-render only when the resolved side flips, so arrows / data-placement
      // can follow - not on every scroll frame.
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
  }, [open, placement, offset, padding, matchWidth, options.key]);

  return result;
}
