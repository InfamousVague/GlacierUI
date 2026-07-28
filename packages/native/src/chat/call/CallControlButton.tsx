// The Glacier CallControlButton, rendered with React Native primitives: the
// round control in a call. Paint (idle / engaged / danger) and geometry (the
// touch-first size steps) are read from the call-control-button spec through the
// shared resolvers, so it is pixel-identical to @glacier/react's control and
// cannot drift from it.
//
// Web-parity notes:
// - The Pressable is a COLUMN, not the disc: with a caption under the glyph the
//   element box is taller than the circle, so the paint and the hit target
//   belong to the inner disc View, exactly as in the web stylesheet.
// - The disc is a circle: width = height = the size's `diameter` (size-3xl /
//   size-4xl), with a transparent hairline border so every state shares one
//   outer box, matching the web `.disc` rule.
// - Press feedback dips to `press.compact` (0.94), matching the web
//   `pressTap('compact')`.
// - The glyph is a caller-supplied slot, wrapped in a centering View carrying
//   the state's text color, so a currentColor SVG inherits it on
//   react-native-web.
//
// Resting visuals only — the web's hover/active color ease and the focus-ring
// bloom are motion this binding does not run.

import { type ReactNode } from 'react';
import { Pressable, View, type PressableProps } from 'react-native';
import { press } from '@glacier/logic';
import { t } from '../../tokens.ts';
import { paintStyle, sizeFor, dimensionsFor } from '../../resolve.ts';
import { Skeleton } from '../../atoms/feedback/Skeleton.tsx';
import { Text } from '../../atoms/display/Text.tsx';
// TODO(integration): switch to '@glacier/spec' once the call-controls specs are
// registered in packages/spec/src/index.ts.
import {
  callControlButtonSpec,
  callControlSizes,
  callControlStates,
} from '../../../../spec/src/components/call-control-button.ts';
import type { CallControlSize, CallControlState } from '@glacier/logic';

// Derived from the spec so the unions cannot drift from the web kit.
export type { CallControlState, CallControlSize };
export { callControlSizes, callControlStates };

export interface CallControlButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  /** Required: the glyph carries no name, and the caption is hidden. */
  'aria-label': string;
  /**
   * The three-way visual state. `danger` is not only hangup — a muted mic or a
   * stopped camera is danger too. Use `callControlState()` from
   * @glacier/logic rather than deciding per call site.
   */
  state?: CallControlState;
  size?: CallControlSize;
  /** Toggle state, reported to the accessibility layer. Separate from `state` by design. */
  pressed?: boolean;
  /** A short word under the glyph. Decorative — `aria-label` is the name. */
  caption?: ReactNode;
  /** Renders a placeholder with the control's exact geometry. */
  skeleton?: boolean;
  /** Painted behind the glyph, inside the disc. MicToggle puts its level ring here. */
  ring?: ReactNode;
  /** The icon glyph. */
  children?: ReactNode;
}

// Size-independent box metrics (radius, gap, border) read once from the spec.
const BOX = dimensionsFor(callControlButtonSpec);

export function CallControlButton({
  state = 'idle',
  size = 'md',
  pressed,
  caption,
  skeleton = false,
  ring,
  disabled = false,
  children,
  'aria-label': ariaLabel,
  ...rest
}: CallControlButtonProps) {
  const dims = sizeFor(callControlButtonSpec, size);
  const diameter = t(dims.diameter ?? 'size-3xl');
  const radius = t(BOX.radius ?? 'radius-full');

  if (skeleton) {
    // The circle only, at the exact diameter — a caption placeholder would claim
    // a word we do not know yet. The web kit renders <Skeleton> here too.
    return <Skeleton variant="circle" width={diameter} height={diameter} radius={radius} />;
  }

  const paint = paintStyle(callControlButtonSpec, 'variants', state);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={ariaLabel}
      aria-label={ariaLabel}
      // A toggle reports its pressed state; an action (hangup) passes nothing,
      // so it is never announced as a switch.
      accessibilityState={pressed === undefined ? undefined : { selected: pressed, disabled }}
      disabled={disabled}
      style={({ pressed: isPressing }) => [
        {
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: t(BOX.gap ?? 'space-1'),
          padding: 0,
          backgroundColor: 'transparent',
          opacity: disabled ? 0.5 : 1,
          transform: [{ scale: isPressing && !disabled ? press.compact : 1 }],
        },
      ]}
      {...rest}
    >
      <View
        style={{
          position: 'relative',
          alignItems: 'center',
          justifyContent: 'center',
          width: diameter,
          height: t(dims.height ?? 'size-3xl'),
          borderRadius: radius,
          // Transparent hairline base so every state shares one outer box size.
          borderWidth: t(BOX.border ?? 'hairline'),
          borderStyle: 'solid',
          borderColor: 'transparent',
          ...paint,
        }}
      >
        {ring}
        <View
          style={{
            // The glyph sits above the ring and inherits the state's text color,
            // so a currentColor SVG picks it up on react-native-web.
            zIndex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            color: (paint.color as string) ?? t('text'),
            fontSize: t(dims.fontSize ?? 'font-size-xs'),
          }}
        >
          {children}
        </View>
      </View>
      {/* Decorative: a caption reading "Mute" must never fight a label reading
          "Unmute", so it stays out of the accessibility tree. */}
      {caption != null && (
        <View aria-hidden={true}>
          <Text size={size === 'lg' ? 'sm' : 'xs'} tone="muted" weight="medium">
            {caption}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
