/**
 * Icon — the native binding's icon surface.
 *
 * Icons live in @glacier/icons, the one place both kits pull glyphs from. On a
 * device build that package resolves to lucide-react-native (drawn through
 * react-native-svg); in the web docs it resolves to lucide-react. Either way the
 * generic `Icon` and every named glyph share the web kit's `size`/`color`/
 * `strokeWidth` API, so icon code is written once and reaches parity on both
 * platforms. Re-exported here so `@glacier/native` presents the icon atom
 * alongside its other components.
 */
export { Icon } from '@glacier/icons';
export type { IconProps } from '@glacier/icons';
