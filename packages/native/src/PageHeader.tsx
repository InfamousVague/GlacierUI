import { type ReactNode } from 'react';
import { View, Text, type ViewProps } from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import { pageHeaderSpec } from '@glacier/spec';
import { t } from './tokens.ts';
import { dimensionsFor } from './resolve.ts';
import { Skeleton } from './Skeleton.tsx';
import { IconButton } from './IconButton.tsx';

/**
 * The Glacier PageHeader, rendered with React Native primitives.
 *
 * This is a `compose` structure: it lays out breadcrumbs, an h1/h2-equivalent
 * title, a muted description, an inline meta row, an end-aligned actions cluster
 * and an overflow trigger, using plain <View>s for the row/column layout and the
 * native Skeleton + IconButton siblings for the composed atoms. Every gap and
 * padding is read from `pageHeaderSpec.dimensions` through `dimensionsFor` (so it
 * cannot drift from PageHeader.module.css); the title/description font roles reuse
 * the exact token names the web CSS applies (font-size-2xl / leading-2xl /
 * tracking-2xl / font-weight-semibold, font-size-md / leading-md). Text color and
 * font size live on each <Text>, never on a parent View (RN does not inherit
 * them). The base text color comes from the spec's `paint.text` role.
 *
 * Web-parity notes / deliberate reductions:
 * - The web `.row` uses `flex-wrap` so the actions drop below the title block on
 *   narrow widths with no JS measurement; that is reproduced with flexWrap +
 *   flexBasis (`wrapBasis`, 20rem) exactly like the CSS.
 * - `secondaryActions` render only their RESTING trigger: the localized ellipsis
 *   IconButton. The overflow dropdown itself is a portal/overlay Menu that is
 *   closed at rest; React Native has no Modal/overlay here, so the popup (and thus
 *   `onSelect` firing) is a device follow-up. The trigger and the data are still
 *   accepted so the docs compare 1:1.
 * - `headingLevel` is accepted; the title always renders `accessibilityRole="header"`
 *   (RN has no distinct h1/h2 elements) and the visual size is fixed at the 2xl
 *   step, matching the spec note "the visual size stays the same; only the
 *   semantics change".
 * - The web `<header>` banner landmark and the localized "More actions" string are
 *   DOM/i18n concerns; the container carries no landmark role and the trigger uses
 *   a plain "More actions" label.
 * - Resting visuals only: the web hover/focus motion is not run.
 */

// Every size-independent measurement read once from the spec. Token names
// (space-6, space-3, ...) get wrapped by t(); the raw `wrapBasis` length (20rem)
// passes straight through so it never becomes `var(--glacier-20rem)`.
const DIMS = dimensionsFor(pageHeaderSpec);

// The base text color read once from the spec's paint role ($text -> text).
const TEXT_COLOR = t((pageHeaderSpec.paint?.text ?? '$text').replace(/^\$/, ''));

/**
 * A resolved measurement value. `dimensionsFor` hands back bare token names
 * alongside raw CSS lengths; wrap the token names in the custom property and let
 * a raw length — anything that starts with a digit or dot — pass through.
 */
function metric(value: string | undefined, fallback: string): string {
  const v = value ?? fallback;
  return /^[.\d]/.test(v) ? v : t(v);
}

/** One row of the overflow menu behind the ellipsis button. */
export interface PageHeaderAction {
  /** Stable identity for the row. */
  id: string;
  /** The row's label. */
  label: ReactNode;
  /** Called when the row is chosen; the menu then closes. */
  onSelect?: () => void;
  /** Dims the row and ignores selection. */
  disabled?: boolean;
}

export interface PageHeaderProps extends Omit<ViewProps, 'style' | 'children'> {
  /** The page title, rendered as an h1 or h2 per headingLevel. */
  title: ReactNode;
  /** Muted supporting copy under the title. */
  description?: ReactNode;
  /** Slot above the title; compose the kit Breadcrumbs. */
  breadcrumbs?: ReactNode;
  /** Inline metadata row under the title and description: pills, status dots, counts. */
  meta?: ReactNode;
  /** Primary actions, end-aligned on wide layouts. */
  actions?: ReactNode;
  /**
   * Secondary actions collected into an overflow Menu behind a localized
   * ellipsis button. The button is omitted entirely when the list is empty.
   */
  secondaryActions?: PageHeaderAction[];
  /** The heading element used for the title. */
  headingLevel?: 1 | 2;
  /** Compact trims the vertical padding and stack gap for dense screens. */
  density?: 'comfortable' | 'compact';
  /** Renders a placeholder with the header's exact geometry. */
  skeleton?: boolean;
}

// The three-dot overflow glyph, matching the web's inline SVG. `currentColor`
// picks up the IconButton icon-slot color (ghost variant text) on
// react-native-web, matching the DOM trigger.
const ellipsisIcon = (
  <Svg width={16} height={16} viewBox="0 0 16 16" fill="currentColor" aria-hidden={true}>
    <Circle cx={3.25} cy={8} r={1.25} />
    <Circle cx={8} cy={8} r={1.25} />
    <Circle cx={12.75} cy={8} r={1.25} />
  </Svg>
);

export function PageHeader({
  title,
  description,
  breadcrumbs,
  meta,
  actions,
  secondaryActions,
  headingLevel: _headingLevel = 1,
  density = 'comfortable',
  skeleton = false,
  ...rest
}: PageHeaderProps) {
  const overflow = secondaryActions ?? [];
  const hasOverflow = overflow.length > 0;
  // One presence predicate shared by the skeleton and live branches, so the
  // placeholder mirrors exactly what will render.
  const has = (slot: ReactNode) => Boolean(slot);
  const hasActions = has(actions);
  const compact = density === 'compact';

  // Outer column: section gap + block padding trim under compact density,
  // matching the `.header[data-density='compact']` rule.
  const header = {
    flexDirection: 'column' as const,
    rowGap: t(compact ? (DIMS.compactSectionGap ?? 'space-2') : (DIMS.sectionGap ?? 'space-3')),
    paddingVertical: t(compact ? (DIMS.compactPaddingBlock ?? 'space-4') : (DIMS.paddingBlock ?? 'space-6')),
  };

  // The shared wrapping row: the title block grows to `wrapBasis`, so the actions
  // hug the trailing edge on wide layouts and drop to their own line on narrow
  // widths — flex-wrap does all the work, no JS measurement.
  const row = {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    alignItems: 'flex-start' as const,
    rowGap: t(DIMS.rowGapBlock ?? 'space-3'),
    columnGap: t(DIMS.rowGapInline ?? 'space-4'),
  };

  const titleBlock = {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: metric(DIMS.wrapBasis, '20rem'),
    minWidth: 0,
    flexDirection: 'column' as const,
    rowGap: t(DIMS.titleGap ?? 'space-2'),
  };

  // Stays end-aligned even after wrapping onto its own line (web
  // `margin-inline-start: auto`).
  const actionsRow = {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    alignItems: 'center' as const,
    columnGap: t(DIMS.actionsGap ?? 'space-2'),
    rowGap: t(DIMS.actionsGap ?? 'space-2'),
    marginStart: 'auto' as const,
  };

  if (skeleton) {
    // Mirror the provided slots with Skeleton lines in the same containers, so
    // the placeholder keeps the live header's exact geometry. Decorative, so
    // aria-hidden. The character/length widths (10rem, 12rem, ...) are declared
    // inline by the web component, not as tokens, so they are mirrored verbatim.
    return (
      <View aria-hidden={true} style={header} {...rest}>
        {has(breadcrumbs) && (
          <View style={{ flexDirection: 'row' }}>
            <Skeleton variant="text" width="10rem" />
          </View>
        )}
        <View style={row}>
          <View style={titleBlock}>
            {/* Explicit heights so each placeholder matches its live text size
                (title 2xl, description md, meta sm) — `1em` alone would resolve
                to the inherited base size and shift layout on content arrival. */}
            <Skeleton variant="text" width="12rem" height={t('font-size-2xl')} />
            {has(description) && <Skeleton variant="text" width="18rem" height={t('font-size-md')} />}
            {has(meta) && <Skeleton variant="text" width="8rem" height={t('font-size-sm')} />}
          </View>
          {(hasActions || hasOverflow) && (
            <View style={actionsRow}>
              <Skeleton width="6rem" height={t('control-height-md')} radius={t('control-radius')} />
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={header} {...rest}>
      {breadcrumbs != null && breadcrumbs !== false && (
        <View style={{ flexDirection: 'row' }}>{breadcrumbs}</View>
      )}
      <View style={row}>
        <View style={titleBlock}>
          <Text
            accessibilityRole="header"
            style={{
              color: TEXT_COLOR,
              fontSize: t('font-size-2xl'),
              lineHeight: t('leading-2xl') as unknown as number,
              letterSpacing: t('tracking-2xl') as unknown as number,
              fontWeight: t('font-weight-semibold') as never,
              fontFamily: t('font-sans'),
            }}
          >
            {title}
          </Text>
          {description != null && description !== false && (
            <Text
              style={{
                color: t('text-muted'),
                fontSize: t('font-size-md'),
                lineHeight: t('leading-md') as unknown as number,
                fontFamily: t('font-sans'),
              }}
            >
              {description}
            </Text>
          )}
          {meta != null && meta !== false && (
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                alignItems: 'center',
                columnGap: t(DIMS.metaGap ?? 'space-2'),
                rowGap: t(DIMS.metaGap ?? 'space-2'),
              }}
            >
              {meta}
            </View>
          )}
        </View>
        {(hasActions || hasOverflow) && (
          <View style={actionsRow}>
            {actions}
            {hasOverflow && (
              // Resting trigger only: the overflow dropdown is a portal/overlay
              // Menu that is closed at rest and has no React Native equivalent
              // here, so only the ellipsis IconButton renders.
              <IconButton aria-label="More actions">{ellipsisIcon}</IconButton>
            )}
          </View>
        )}
      </View>
    </View>
  );
}
