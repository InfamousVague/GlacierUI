/**
 * @glacier/native — Popover.
 *
 * The React Native binding of @glacier/react's Popover: a floating glass panel
 * anchored to a trigger. Paint (the glass-thick surface + glass-border hairline
 * from the open state) and geometry (radius-lg, space-3 padding, the min/max
 * width, and the 12px anchor offset) are read from the popover spec through the
 * shared resolvers, so the resting OPEN panel stays pixel-identical to the web
 * kit and cannot drift from it. The Placement union is derived from the same
 * spec list the web kit uses.
 *
 * Anchoring approximation (React Native has no floating-ui, no portal, and no
 * document-level listeners):
 * - The trigger and panel live inside one relatively-positioned wrapper View.
 *   The panel is an absolutely-positioned View placed on the requested side of
 *   the trigger (below/above/beside) with the spec's 12px gap. This is NOT
 *   collision-aware: it never flips or clamps to stay on screen, and there is
 *   no portal, so an overflow-clipping ancestor can still clip the panel. A
 *   true collision-aware placement + portal is a device follow-up.
 * - Horizontal (top/bottom) and vertical (left/right) alignment is honored for
 *   `start`/`end`; `center` is approximated to `start` because the panel width
 *   is not measured here. Logical inline-start/inline-end resolve to left/right
 *   under an LTR assumption (the web carries the trigger's resolved direction
 *   through the portal; RTL is a device follow-up).
 * - The one-piece ArrowGlass surface (the seamless glass rect + trigger-facing
 *   arrow tip, a runtime-measured SVG clip-path) and its ambient drop shadow and
 *   backdrop blur/saturate have no React Native equivalent and are dropped; the
 *   panel paints the glass-thick fill + glass-border hairline directly, so the
 *   arrow anatomy is not reproduced.
 * - Outside-press and Escape close, focus management, and the fade/scale
 *   entrance are web/device follow-ups (no document or global key listeners on
 *   RN). Tapping the trigger toggles the panel; a controlled parent drives the
 *   rest through open/onOpenChange. `className` is web-only and ignored.
 */
import { cloneElement, useId, type ReactElement, type ReactNode } from 'react';
import { View, type Style } from 'react-native';
import { popoverSpec, popoverPlacements } from '@glacier/spec';
import { useControlled } from '@glacier/commons';
import { t } from './tokens.ts';
import { paintFor, dimensionsFor } from './resolve.ts';

// Derived from the spec so the placement union cannot drift from the web kit.
export type Placement = (typeof popoverPlacements)[number];

export interface PopoverProps {
  /** The element that toggles the popover. Its press is wired up. */
  trigger: ReactElement;
  /** Where to place the panel relative to the trigger (no flip/clamp here). */
  placement?: Placement;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Accessible label for the panel when it has no heading. */
  'aria-label'?: string;
  /** Web-only escape hatch; accepted for parity and ignored on native. */
  className?: string;
  children?: ReactNode;
}

// Size-independent panel metrics (padding, radius, hairline border, the min/max
// width, and the anchor offset) read once from the spec.
const BOX = dimensionsFor(popoverSpec);

// Surface paint from the open state: the glass-thick fill + glass-border
// hairline the one-piece ArrowGlass layer wears on the web. Read straight from
// the spec so it stays pixel-identical to the web kit.
const OPEN = paintFor(popoverSpec, 'states', 'open');
const PANEL_BG = t(OPEN.background ?? 'glass-thick');
const PANEL_BORDER = t(OPEN.border ?? 'glass-border');

/**
 * A resolved measurement value. `dimensionsFor` returns bare token names (e.g.
 * `space-3`) for tokenized values and raw CSS lengths for the rest (the panel's
 * `12rem` min-width and `12px` offset are declared inline, not as tokens). A
 * token name is wrapped in its custom property; a raw length — anything starting
 * with a digit or dot — passes straight through so it never becomes
 * `var(--glacier-12rem)`.
 */
function metric(value: string | undefined, fallback: string): string {
  const v = value ?? fallback;
  return /^[.\d]/.test(v) ? v : t(v);
}

// The block/inline sides, longest first so `inline-start` matches before
// `left`/`right` when parsing a placement (inline sides carry a hyphen).
const SIDES = ['inline-start', 'inline-end', 'top', 'bottom', 'left', 'right'] as const;

function parsePlacement(placement: Placement): { side: string; align: string } {
  const side = SIDES.find((s) => placement === s || placement.startsWith(`${s}-`)) ?? 'bottom';
  const align = placement.length > side.length ? placement.slice(side.length + 1) : 'center';
  return { side, align };
}

/**
 * The absolute-position style that pins the panel to the requested side of the
 * trigger with the spec's gap. Approximate: no flip/clamp, `center` aligns to
 * `start`, and logical inline sides resolve LTR. See the file header.
 */
function anchorStyle(placement: Placement, gap: string): Style {
  const { side, align } = parsePlacement(placement);
  const physical = side === 'inline-start' ? 'left' : side === 'inline-end' ? 'right' : side;
  const style: Style = { position: 'absolute' };

  if (physical === 'top' || physical === 'bottom') {
    // Placed above/below; align along the horizontal edge.
    if (physical === 'bottom') {
      style.top = '100%';
      style.marginTop = gap;
    } else {
      style.bottom = '100%';
      style.marginBottom = gap;
    }
    if (align === 'end') style.right = 0;
    else style.left = 0; // start + center approximation
  } else {
    // Placed beside; align along the vertical edge.
    if (physical === 'right') {
      style.left = '100%';
      style.marginLeft = gap;
    } else {
      style.right = '100%';
      style.marginRight = gap;
    }
    if (align === 'end') style.bottom = 0;
    else style.top = 0; // start + center approximation
  }
  return style;
}

/**
 * The Glacier Popover, rendered with React Native primitives. See the file
 * header for the anchoring/parity contract; the resting OPEN panel is visually
 * identical to @glacier/react's Popover surface and unable to drift from it.
 *
 * The trigger is cloned to wire its press to the open toggle (composing any
 * existing onPress) and to carry aria-haspopup/aria-expanded, exactly like the
 * web cloneElement. Open state is controlled/uncontrolled through the shared
 * `useControlled` hook — the same contract the web kit uses.
 */
export function Popover({
  trigger,
  placement = 'bottom-start',
  open,
  defaultOpen = false,
  onOpenChange,
  className: _className,
  children,
  'aria-label': ariaLabel,
}: PopoverProps) {
  const panelId = useId();
  const [isOpen, setOpen] = useControlled({ value: open, defaultValue: defaultOpen, onChange: onOpenChange });

  const gap = metric(BOX.offset, '12px');
  const minWidth = metric(BOX.minWidth, '12rem');
  // min()/calc()/vw are CSS functions react-native-web resolves; a concrete
  // device cap is a follow-up. Passed through verbatim (never token-wrapped).
  const maxWidth = BOX.maxWidth ?? 'min(24rem, calc(100vw - 2rem))';

  const triggerEl = cloneElement(trigger as ReactElement<Record<string, unknown>>, {
    'aria-haspopup': 'dialog',
    'aria-expanded': isOpen,
    'aria-controls': isOpen ? panelId : undefined,
    onPress: (event: unknown) => {
      (trigger.props as { onPress?: (event: unknown) => void }).onPress?.(event);
      setOpen(!isOpen);
    },
  });

  return (
    <View style={{ position: 'relative', alignSelf: 'flex-start' }}>
      {triggerEl}
      {isOpen && (
        <View
          nativeID={panelId}
          accessibilityRole="dialog"
          aria-label={ariaLabel}
          style={[
            anchorStyle(placement, gap),
            {
              minWidth,
              maxWidth,
              padding: metric(BOX.padding, 'space-3'),
              borderRadius: metric(BOX.radius, 'radius-lg'),
              borderWidth: metric(BOX.border, 'hairline'),
              borderStyle: 'solid',
              borderColor: PANEL_BORDER,
              backgroundColor: PANEL_BG,
              // Keep the panel above later siblings in its stacking context.
              zIndex: 1,
            },
          ]}
        >
          {children}
        </View>
      )}
    </View>
  );
}
