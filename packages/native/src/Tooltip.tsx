import { cloneElement, useState, type ReactElement, type ReactNode } from 'react';
import { View, Text } from 'react-native';
import { tooltipPlacements, tooltipSpec } from '@glacier/spec';
import { t } from './tokens.ts';
import { dimensionsFor } from './resolve.ts';

// Derived from the spec so the placement union cannot drift from the web kit.
export type TooltipPlacement = (typeof tooltipPlacements)[number];

export interface TooltipProps {
  /** The bubble content: a short label, shortcut, or hint. */
  content: ReactNode;
  /** The single element the tooltip describes. It is cloned so its long-press
   *  handler is wired up, preserving any the caller already passed. */
  children: ReactElement;
  /** Preferred side and alignment of the bubble relative to the trigger. */
  placement?: TooltipPlacement;
  /**
   * Milliseconds of hover intent before the bubble opens on the web. Accepted
   * for prop parity but inert here: React Native has no hover pointer, so this
   * binding reveals the bubble on long-press with no intent timer.
   */
  delay?: number;
  /** Suppresses the tooltip entirely; the child renders untouched with no wiring. */
  disabled?: boolean;
  /** Returns the child untouched so its own geometry stands in while loading. */
  skeleton?: boolean;
  /** Web-only escape hatch; accepted for parity and ignored on native. */
  className?: string;
}

/**
 * Tooltip — the @glacier/native binding of the web Tooltip (a hover/focus glass
 * bubble that points at the trigger it describes).
 *
 * Paint and geometry are read from tooltipSpec through the shared resolvers so
 * the resting bubble stays pixel-identical to @glacier/react's Tooltip and
 * cannot drift: the top-level `paint` gives the glass fill (glass-regular),
 * hairline (glass-border), and text color, and `dimensions` give the padding,
 * radius, hairline, xs type, and the 10px trigger offset. Text color/size live
 * on <Text> (a bare string cannot sit in a View and color does not inherit).
 *
 * ANCHORED-OVERLAY APPROXIMATION (documented, all web-only bits reported):
 * - No portal. React Native has no floating-ui/createPortal, so the bubble
 *   renders as an absolutely-positioned View inside a relatively-positioned
 *   wrapper that hugs the trigger (alignSelf: flex-start). It is placed on the
 *   chosen side (top/bottom/left/right) a 10px gap from the trigger, and the
 *   cross-axis alignment (start/center/end) is approximated with flex
 *   alignment relative to the trigger box. Because it is not portalled it can
 *   be clipped by an `overflow: hidden` ancestor, and there is no
 *   collision-aware flip/clamp — a true portal + measured, viewport-clamped
 *   placement is a device follow-up.
 * - No hover/focus. There is no hover pointer and no shared document focus
 *   model, so the bubble toggles on long-press of the trigger (the child's
 *   own tap still fires its own onPress). `delay` (hover intent) has no native
 *   equivalent and is inert.
 * - The arrow is a simplified rotated-square poking out of the trigger-facing
 *   edge wearing the glass fill + hairline, centered on the bubble. The web's
 *   one-piece clip-path arrow, its per-alignment corner offset, and the soft
 *   drop shadow are web-only and dropped; the `backdrop-filter` blur has no
 *   on-device equivalent and is dropped too, so glass renders as its resting
 *   tint (like Card/StatTile).
 * - `maxWidth` keeps the web `min()/calc()/vw` expression, which resolves on
 *   react-native-web (the docs comparison surface) but needs a concrete width
 *   on a device build.
 * - Escape-to-close, role="tooltip", and the aria-describedby linkage are web
 *   concerns; the content is simply rendered visibly beside the trigger.
 * - `className` is web-only and ignored.
 */

// Size-independent bubble metrics read once from the spec: padding, radius,
// hairline, xs font size + line height, and the trigger offset — token names
// plus raw lengths (the 10px offset and the min()/calc maxWidth).
const DIMS = dimensionsFor(tooltipSpec);

// The glass surface lives on the spec's top-level paint (there is no
// variant/tone group to resolve), so read it straight off and strip the `$`.
const BASE = (tooltipSpec.paint ?? {}) as { background?: string; text?: string; border?: string };
const strip = (value: string | undefined, fallback: string): string =>
  (value ?? `$${fallback}`).replace(/^\$/, '');
const BUBBLE_BG = strip(BASE.background, 'glass-regular');
const BUBBLE_BORDER = strip(BASE.border, 'glass-border');
const BUBBLE_TEXT = strip(BASE.text, 'text');

/**
 * A resolved measurement value. `dimensionsFor` hands back token names alongside
 * raw CSS lengths; wrap the token names in the custom property and let a raw
 * length — anything that starts with a digit or dot — pass straight through so a
 * `10px` offset never becomes `var(--glacier-10px)`.
 */
function metric(value: string | undefined, fallback: string): string {
  const v = value ?? fallback;
  return /^[.\d]/.test(v) ? v : t(v);
}

const PAD_BLOCK = metric(DIMS.paddingBlock, 'space-2');
const PAD_INLINE = metric(DIMS.paddingInline, 'space-3');
const RADIUS = metric(DIMS.radius, 'radius-md');
const BORDER = metric(DIMS.border, 'hairline');
const FONT_SIZE = metric(DIMS.fontSize, 'font-size-xs');
const LINE_HEIGHT = metric(DIMS.lineHeight, 'leading-xs');
const OFFSET = metric(DIMS.offset, '10px');
// The web bubble clamps with min()/calc(100vw): a raw CSS expression that
// react-native-web resolves as-is (not a token, so it must NOT go through
// metric, which would wrap it in var()). A device build needs a concrete width.
const MAX_WIDTH = DIMS.maxWidth ?? 'min(18rem, calc(100vw - 2rem))';

// The simplified arrow: a small rotated square whose center rides the
// trigger-facing edge, so half tucks under the bubble (painted after it) and
// half protrudes into the offset gap, pointing at the trigger.
const ARROW = 10;
const ARROW_HALF = ARROW / 2;

type Side = 'top' | 'bottom' | 'left' | 'right';

function parsePlacement(placement: TooltipPlacement): { side: Side; align: 'start' | 'center' | 'end' } {
  const [side, align] = placement.split('-') as [Side, 'start' | 'center' | 'end' | undefined];
  return { side, align: align ?? 'center' };
}

const flexAlign = (align: 'start' | 'center' | 'end'): 'flex-start' | 'center' | 'flex-end' =>
  align === 'start' ? 'flex-start' : align === 'end' ? 'flex-end' : 'center';

/** The absolute overlay container, anchored to a trigger edge and cross-aligned. */
function containerStyle(side: Side, align: 'start' | 'center' | 'end'): Record<string, unknown> {
  const cross = flexAlign(align);
  if (side === 'top') return { position: 'absolute', bottom: '100%', left: 0, right: 0, alignItems: cross };
  if (side === 'bottom') return { position: 'absolute', top: '100%', left: 0, right: 0, alignItems: cross };
  if (side === 'left') return { position: 'absolute', right: '100%', top: 0, bottom: 0, alignItems: 'flex-start', justifyContent: cross };
  return { position: 'absolute', left: '100%', top: 0, bottom: 0, alignItems: 'flex-start', justifyContent: cross };
}

/** The trigger-facing gap (the web's 10px offset), applied to the bubble wrapper. */
function gapStyle(side: Side): Record<string, unknown> {
  if (side === 'top') return { marginBottom: OFFSET };
  if (side === 'bottom') return { marginTop: OFFSET };
  if (side === 'left') return { marginRight: OFFSET };
  return { marginLeft: OFFSET };
}

/** The rotated-square arrow, centered on the trigger-facing edge of the bubble. */
function arrowStyle(side: Side): Record<string, unknown> {
  const box = {
    position: 'absolute',
    width: ARROW,
    height: ARROW,
    backgroundColor: t(BUBBLE_BG),
    borderColor: t(BUBBLE_BORDER),
    borderWidth: BORDER,
    borderStyle: 'solid',
    transform: [{ rotate: '45deg' }],
  };
  if (side === 'top') return { ...box, bottom: -ARROW_HALF, left: '50%', marginLeft: -ARROW_HALF };
  if (side === 'bottom') return { ...box, top: -ARROW_HALF, left: '50%', marginLeft: -ARROW_HALF };
  if (side === 'left') return { ...box, right: -ARROW_HALF, top: '50%', marginTop: -ARROW_HALF };
  return { ...box, left: -ARROW_HALF, top: '50%', marginTop: -ARROW_HALF };
}

export function Tooltip({
  content,
  children,
  placement = 'top',
  delay: _delay,
  disabled = false,
  skeleton = false,
  className: _className,
}: TooltipProps) {
  const [open, setOpen] = useState(false);

  // A tooltip has no standing footprint of its own: when disabled or loading
  // the child is returned untouched, keeping its exact layout and dropping the
  // reveal wiring so nothing can open — matching the web.
  if (skeleton || disabled) {
    return children;
  }

  const { side, align } = parsePlacement(placement);

  // Clone the trigger to add the long-press reveal, preserving any onLongPress
  // the caller already put on the child (the web clones to merge handlers too).
  const child = children as ReactElement<{ onLongPress?: () => void }>;
  const childOnLongPress = child.props.onLongPress;
  const triggerEl = cloneElement(child, {
    onLongPress: () => {
      childOnLongPress?.();
      setOpen((prev) => !prev);
    },
  });

  return (
    // Relatively-positioned wrapper hugging the trigger, so the absolute bubble
    // anchors to the trigger's box in place of a portal.
    <View style={{ position: 'relative', alignSelf: 'flex-start' }}>
      {triggerEl}
      {open && (
        <View style={containerStyle(side, align)} pointerEvents="none">
          {/* Inner wrapper carries the trigger-facing gap and sizes to the
              bubble, so the arrow can anchor to the bubble's edge. */}
          <View style={{ position: 'relative', ...gapStyle(side) }}>
            {/* Painted BEFORE the bubble so the bubble covers the arrow's inner
                half, leaving only the protruding point (the classic CSS arrow). */}
            <View aria-hidden={true} style={arrowStyle(side)} />
            <View
              accessibilityRole="text"
              style={{
                position: 'relative',
                maxWidth: MAX_WIDTH,
                paddingVertical: PAD_BLOCK,
                paddingHorizontal: PAD_INLINE,
                borderRadius: RADIUS,
                borderWidth: BORDER,
                borderStyle: 'solid',
                borderColor: t(BUBBLE_BORDER),
                backgroundColor: t(BUBBLE_BG),
              }}
            >
              <Text
                style={{
                  color: t(BUBBLE_TEXT),
                  fontSize: FONT_SIZE,
                  lineHeight: LINE_HEIGHT as never,
                  fontFamily: t('font-sans'),
                }}
              >
                {content}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
