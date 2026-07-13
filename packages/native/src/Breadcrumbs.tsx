import { type ComponentProps, type ReactNode } from 'react';
import { View, Text, type ViewProps } from 'react-native';
import { breadcrumbsSpec } from '@glacier/spec';
import { t } from './tokens.ts';

/**
 * The Glacier Breadcrumbs, rendered with React Native primitives.
 *
 * This is a `compose` binding: the nav landmark, the `<ol>` list, and the
 * per-crumb `<li>` are plain <View>s (flexDirection: 'row'), and each crumb
 * label / separator is a <Text> (React Native cannot render a bare string inside
 * a View, and text color does not inherit through a parent View — hard rule 4).
 *
 * Paint + geometry (from Breadcrumbs.module.css; breadcrumbsSpec.paint is
 * intentionally empty — the CSS module owns the crumb/link/separator paint as
 * bare tokens, which are wrapped by t() here so they cannot drift from the DOM
 * kit):
 * - `.list`  gap: space-2, flex-wrap: wrap, align-items: center.
 * - `.item`  gap: space-2, align-items: center, color: text-subtle.
 * - `.link`  color: inherit (text-subtle at rest); text-decoration: none. The
 *   web anchor is a raw `<a class=".link">`, NOT the accent-colored Link kit
 *   component, so it maps to a <Text accessibilityRole="link"> in the subtle
 *   color — not the native Link sibling. `href` is DOM-only (no-op on device;
 *   wire navigation through the surrounding view). Its :hover -> text color is a
 *   hover affordance the native binding does not run (resting visuals only).
 * - `.current`  color: text; font-weight: 600 (font-weight-semibold token).
 * - `.text`  color: text-subtle (a non-linked, non-current crumb).
 * - `.separator`  color: text-subtle. The `[dir='rtl'] scaleX(-1)` mirroring is
 *   an RTL/DOM-only transform and is not applied here (resting LTR).
 *
 * No font-size is set: the web declares none on breadcrumbs, so crumbs inherit
 * the surrounding text size (nested RN <Text> inherits its parent size), exactly
 * like the DOM. Hard rule 2 — the spec/CSS declare no size, so none is invented.
 *
 * `className` is accepted for 1:1 prop parity with the web nav but is DOM-only
 * and has no effect on device (no-op).
 */

// The default separator glyph, read from the spec so it cannot drift.
const DEFAULT_SEPARATOR = (breadcrumbsSpec.defaults?.separator as ReactNode) ?? '/';

export interface BreadcrumbItem {
  label: ReactNode;
  /**
   * Anchor href. DOM-only; accepted for prop parity with the web crumb but has
   * no effect on native — wire navigation through the surrounding view. (No-op.)
   */
  href?: string;
  current?: boolean;
}

export interface BreadcrumbsProps extends Omit<ViewProps, 'children' | 'style'> {
  items: BreadcrumbItem[];
  separator?: ReactNode;
  /** DOM class name. Accepted for prop parity with the web nav; no effect on native. (No-op.) */
  className?: ComponentProps<'nav'>['className'];
}

export function Breadcrumbs({ items, separator = DEFAULT_SEPARATOR, className: _className, ...rest }: BreadcrumbsProps) {
  const visibleItems = items.filter((item) => item !== undefined);
  return (
    // .root — the nav landmark (matching the web `<nav aria-label="Breadcrumb">`;
    // React Native has no "navigation" role, so the label carries the landmark).
    <View accessibilityLabel="Breadcrumb" style={{ flexDirection: 'row', alignItems: 'center' }} {...rest}>
      {/* .list — the ordered trail. */}
      <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', columnGap: t('space-2'), rowGap: t('space-2') }}>
        {visibleItems.map((item, index) => {
          const isCurrent = item.current ?? index === visibleItems.length - 1;
          const showSeparator = index < visibleItems.length - 1;
          return (
            // .item — one crumb plus its trailing separator.
            <View key={`${String(item.label)}-${index}`} style={{ flexDirection: 'row', alignItems: 'center', columnGap: t('space-2') }}>
              {isCurrent ? (
                // .current
                <Text style={{ color: t('text'), fontFamily: t('font-sans'), fontWeight: t('font-weight-semibold') as never }}>
                  {item.label}
                </Text>
              ) : item.href ? (
                // .link — subtle inline anchor (raw `<a>`, not the accent Link kit).
                <Text accessibilityRole="link" style={{ color: t('text-subtle'), fontFamily: t('font-sans'), textDecorationLine: 'none' }}>
                  {item.label}
                </Text>
              ) : (
                // .text — a plain, non-linked crumb.
                <Text style={{ color: t('text-subtle'), fontFamily: t('font-sans') }}>{item.label}</Text>
              )}
              {showSeparator && (
                // .separator — hidden from assistive tech (web `aria-hidden="true"`).
                <Text aria-hidden style={{ color: t('text-subtle'), fontFamily: t('font-sans') }}>
                  {separator}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}
