import { View, type ViewProps } from 'react-native';

/**
 * The Glacier Spacer, rendered with React Native primitives.
 *
 * A layout primitive (no spec): a flexible gap that pushes siblings apart
 * inside a Row or Stack. The web kit renders `<div aria-hidden>` styled with
 * `flex: 1 1 0%; align-self: stretch;` (`.spacer` in Layout.module.css). React
 * Native has no `flex` shorthand, so it is expanded to the equivalent
 * longhands: flexGrow 1 (take all free space), flexShrink 1, flexBasis 0. The
 * `align-self: stretch` maps 1:1 so the spacer fills the cross axis. There is no
 * paint or geometry to read from a spec — the whole component is flex behaviour.
 *
 * `className` is web-only (styling escape hatch) and is accepted-but-noop on
 * native; it is dropped rather than forwarded to the View.
 */
export interface SpacerProps extends Omit<ViewProps, 'style' | 'children'> {
  /** Web-only styling escape hatch. Accepted for a 1:1 prop contract; noop on native. */
  className?: string;
}

export function Spacer({ className: _className, ...rest }: SpacerProps) {
  return (
    <View
      aria-hidden
      // `.spacer { flex: 1 1 0%; align-self: stretch }` expanded to RN longhands.
      style={{ flexGrow: 1, flexShrink: 1, flexBasis: 0, alignSelf: 'stretch' }}
      {...rest}
    />
  );
}
