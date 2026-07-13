import { View, type ViewProps } from 'react-native';
import { dividerOrientations, dividerSpec } from '@glacier/spec';
import { t } from './tokens.ts';
import { dimensionsFor } from './resolve.ts';

// Derived from the spec so the orientation union cannot drift from the web kit.
export type DividerOrientation = (typeof dividerOrientations)[number];

export interface DividerProps extends Omit<ViewProps, 'style' | 'children'> {
  orientation?: DividerOrientation;
}

// The hairline thickness, read once from the spec (thickness/gap).
const DIMS = dimensionsFor(dividerSpec);
// The rule fill: the spec's top-level rest paint (bare token name).
const FILL = (dividerSpec.paint?.background ?? '$border-subtle').replace(/^\$/, '');

/**
 * The Glacier Divider, rendered with React Native primitives. A hairline rule
 * whose thickness and fill are read from the divider spec through the shared
 * resolvers, so it is visually identical to @glacier/react's Divider and cannot
 * drift from it. Horizontal (default) is a full-width rule of `hairline` height;
 * vertical swaps to a `hairline`-wide rule that stretches to its container's
 * height. (The web kit's labelled and skeleton variants are a follow-up.)
 */
export function Divider({ orientation = 'horizontal', ...rest }: DividerProps) {
  const thickness = t(DIMS.thickness ?? 'hairline');
  const vertical = orientation === 'vertical';
  return (
    <View
      accessibilityRole="separator"
      // Vertical stretches to its container's height (like the web
      // `.vertical { align-self: stretch }`); horizontal fills its width
      // (like `.horizontal { width: 100% }`).
      aria-orientation={vertical ? 'vertical' : undefined}
      style={{
        backgroundColor: t(FILL),
        ...(vertical
          ? { alignSelf: 'stretch', width: thickness }
          : { width: '100%', height: thickness }),
      }}
      {...rest}
    />
  );
}
