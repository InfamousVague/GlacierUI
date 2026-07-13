import { type ReactNode } from 'react';
import { Text, type TextProps as RNTextProps } from 'react-native';
import { linkSpec } from '@glacier/spec';
import { t } from './tokens.ts';
import { dimensionsFor } from './resolve.ts';
import { Skeleton } from './Skeleton.tsx';

/**
 * The Glacier Link, rendered with React Native's <Text>. An inline anchor in the
 * accent color, driven by the link spec so it stays identical to
 * @glacier/react's Link and cannot drift from it. Because the link is inline
 * text (not a block control), it renders as a <Text> with
 * `accessibilityRole="link"`; wire navigation through `onPress` on device.
 *
 * Web-parity notes (from `.link` in Typography.module.css + linkSpec):
 * - Color is the spec's top-level `paint.text` ($accent-text) and the weight is
 *   the web `.link` `font-weight-medium`; both live on the <Text>, never a
 *   parent View. Token names only — no transcribed literals.
 * - `borderRadius` comes from the spec's `dimensions.radius` (radius-xs); on the
 *   web it rounds the focus-ring corner.
 * - No font-size: the web `.link` declares none, so the link inherits the
 *   surrounding text size just like the DOM `<a>` (nested RN <Text> inherits its
 *   parent's font size). Hard rule 2 — the spec declares no size, so none is
 *   invented here.
 * - Resting `text-decoration: none`. The hover underline (+0.2em offset), the
 *   color-ease transition and the focus-ring bloom are hover/motion the native
 *   binding does not run. There is no active/tap scale on the web `.link`, so
 *   there is no press feedback here.
 * - `skeleton` mirrors the web exactly: an 8ch text-variant Skeleton.
 *
 * `href` / `target` / `rel` are accepted for 1:1 prop parity with the web Link
 * but are DOM-only and have no effect on device (no-ops) — see LinkProps.
 */

// Size-independent box metrics (radius) read once from the spec.
const BOX = dimensionsFor(linkSpec);

// The link color read once from the spec's top-level paint role
// ($accent-text -> accent-text), matching the web `.link` rule.
const TEXT_TOKEN = (linkSpec.paint?.text ?? '$accent-text').replace(/^\$/, '');
const TEXT_COLOR = t(TEXT_TOKEN);

export interface LinkProps extends Omit<RNTextProps, 'children' | 'style'> {
  /** Renders an 8ch text placeholder in place of the link. */
  skeleton?: boolean;
  /**
   * Anchor href. DOM-only; accepted for prop parity with the web Link but has no
   * effect on native — wire navigation through `onPress` instead. (No-op.)
   */
  href?: string;
  /** DOM anchor target. Accepted for prop parity; no effect on native. (No-op.) */
  target?: string;
  /** DOM anchor rel. Accepted for prop parity; no effect on native. (No-op.) */
  rel?: string;
  children?: ReactNode;
}

export function Link({ skeleton = false, href: _href, target: _target, rel: _rel, children, ...rest }: LinkProps) {
  if (skeleton) {
    // Resting placeholder, mirroring the web `<Skeleton variant="text" width="8ch" />`.
    return <Skeleton variant="text" width="8ch" />;
  }
  return (
    <Text
      accessibilityRole="link"
      style={{
        color: TEXT_COLOR,
        fontFamily: t('font-sans'),
        fontWeight: t('font-weight-medium') as never,
        // Resting decoration is none; the underline is a hover affordance.
        textDecorationLine: 'none',
        borderRadius: t(BOX.radius ?? 'radius-xs') as unknown as number,
      }}
      {...rest}
    >
      {children}
    </Text>
  );
}
