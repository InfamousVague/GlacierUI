// The Glacier CallControlBar, rendered with React Native primitives: the row of
// controls in an active call. Spacing and the surface under the controls are
// read from the call-control-bar spec through the shared resolvers, so the row
// measures the same here as in @glacier/react and cannot drift from it.
//
// Web-parity notes:
// - Layout only: the controls are children, exactly as on the web.
// - The glass variant's backdrop blur and shadow have no React Native
//   equivalent; it paints the glass fill and border and drops the blur.
// - The bar itself does not animate on either platform, so there is nothing to
//   port: a control row that slid while you reached for hangup would be a
//   mis-tap waiting to happen.

import { type ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';
import { t } from '../../tokens.ts';
import { paintStyle, sizeFor, dimensionsFor } from '../../resolve.ts';
// TODO(integration): switch to '@glacier/spec' once the call-controls specs are
// registered in packages/spec/src/index.ts.
import {
  callControlBarSpec,
  callControlBarAligns,
  callControlBarVariants,
} from '../../../../spec/src/components/call-control-bar.ts';
import type { CallControlSize } from '@glacier/logic';

// Derived from the spec so the unions cannot drift from the web kit.
export type CallControlBarAlign = (typeof callControlBarAligns)[number];
export type CallControlBarVariant = (typeof callControlBarVariants)[number];
export { callControlBarAligns, callControlBarVariants };

export interface CallControlBarProps extends Omit<ViewProps, 'children' | 'style'> {
  /** The controls, in reading order. The destructive leave control goes last. */
  children?: ReactNode;
  variant?: CallControlBarVariant;
  /** Spacing step. Match it to the size given to the controls. */
  size?: CallControlSize;
  align?: CallControlBarAlign;
  /** Lets the row wrap rather than squeezing controls under the hit-target floor. */
  wrap?: boolean;
  /** Accessible name for the group. */
  label?: string;
}

/** RN has no `justify-content: start/end` keywords; map to the flex ones. */
const JUSTIFY: Record<CallControlBarAlign, 'center' | 'flex-start' | 'flex-end' | 'space-between'> = {
  center: 'center',
  start: 'flex-start',
  end: 'flex-end',
  between: 'space-between',
};

// Size-independent box metrics (radius, border) read once from the spec.
const BOX = dimensionsFor(callControlBarSpec);

export function CallControlBar({
  children,
  variant = 'bare',
  size = 'md',
  align = 'center',
  wrap = true,
  label,
  ...rest
}: CallControlBarProps) {
  const dims = sizeFor(callControlBarSpec, size);
  const paint = paintStyle(callControlBarSpec, 'variants', variant);

  return (
    <View
      accessibilityRole="group"
      accessibilityLabel={label}
      aria-label={label}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: JUSTIFY[align],
        // Wrapping beats shrinking: a control that drops under the 48px floor is
        // worse than a second line.
        flexWrap: wrap ? 'wrap' : 'nowrap',
        columnGap: t(dims.gap ?? 'space-3'),
        rowGap: t('space-3'),
        paddingHorizontal: t(dims.paddingInline ?? 'space-4'),
        paddingVertical: t(dims.paddingBlock ?? 'space-3'),
        // Bare paints nothing, so the radius would be invisible anyway; it is
        // still applied so swapping variants never changes the box.
        borderRadius: t(BOX.radius ?? 'radius-2xl'),
        ...paint,
      }}
      {...rest}
    >
      {children}
    </View>
  );
}
