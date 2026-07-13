/**
 * Ambient types for the slice of `react-native-svg` the Glacier native kit uses.
 *
 * react-native-svg ships its own types, but they pull in the full React Native
 * type tree (which we deliberately do not install — the web docs only need
 * react-native-web). This shim declares just the SVG primitives the kit's
 * vector atoms (ProgressRing, Spinner, Sparkline, Meter arcs) render, kept
 * intentionally permissive: every SVG attribute is accepted as an unknown-typed
 * prop, and on react-native-web these components resolve to a real DOM <svg>
 * (react-native-svg ships a `.web.js` build that our bundler prefers). A device
 * build swaps in react-native-svg's own types.
 */
declare module 'react-native-svg' {
  import type { ComponentType, ReactNode } from 'react';

  // Permissive: SVG elements take many attributes (d, cx, points, stroke, fill,
  // strokeWidth, strokeDasharray, transform, gradientUnits, ...). Declaring each
  // exactly is noise for a shim, so props are an open record plus the few fields
  // the kit relies on structurally.
  interface SvgElementProps {
    children?: ReactNode;
    style?: unknown;
    [attr: string]: unknown;
  }

  export const Svg: ComponentType<SvgElementProps>;
  export const Path: ComponentType<SvgElementProps>;
  export const Circle: ComponentType<SvgElementProps>;
  export const Rect: ComponentType<SvgElementProps>;
  export const Line: ComponentType<SvgElementProps>;
  export const Polyline: ComponentType<SvgElementProps>;
  export const Polygon: ComponentType<SvgElementProps>;
  export const G: ComponentType<SvgElementProps>;
  export const Defs: ComponentType<SvgElementProps>;
  export const LinearGradient: ComponentType<SvgElementProps>;
  export const RadialGradient: ComponentType<SvgElementProps>;
  export const Stop: ComponentType<SvgElementProps>;
  export const ClipPath: ComponentType<SvgElementProps>;

  export default Svg;
}
