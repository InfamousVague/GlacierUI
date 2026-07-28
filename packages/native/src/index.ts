/**
 * @glacier/native — the React Native binding of the Glacier kit.
 *
 * Components render View/Text/Pressable/Image, painted and sized from
 * @glacier/spec + @glacier/tokens through the shared @glacier/logic resolvers,
 * so an Expo app matches the DOM kit pixel-for-pixel and cannot drift. On web
 * the docs alias `react-native` to `react-native-web`, so these same components
 * render in the browser for the Web/Native comparison toggle.
 *
 * Sources are organised into folders (atoms/{display,inputs,feedback}, layout,
 * molecules, organisms, structures, chat/*) each with its own barrel; this file
 * re-exports those barrels plus the spec-derived style seam.
 */

// The spec-derived style seam, re-exported so app code can build its own
// spec-driven native components the same way the kit does.
export { paintStyle, sizeFor, dimensionsFor, tv, type NativeStyle } from './resolve.ts';
export { t } from './tokens.ts';

export * from './atoms/index.ts';
export * from './layout/index.ts';
export * from './molecules/index.ts';
export * from './organisms/index.ts';
export * from './structures/index.ts';
export * from './chat/index.ts';
