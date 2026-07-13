/**
 * Section — the native binding of @glacier/react's structures/Section.
 *
 * A `compose` structure: a titled page region built from a heading row (title +
 * muted description stacked at the start, end-aligned actions), a token-driven
 * rhythm gap before the content, and an optional hairline top rule for stacking
 * sections down a page. React Native has no <section> landmark, so this rebuilds
 * the RESTING layout with plain Views/Text plus the native Heading + Skeleton
 * siblings:
 *
 *   - root View                <- .section    (column; rowGap = the gap step;
 *                                              divider adds a hairline top border
 *                                              + leading padding)
 *     - header <View>          <- .header      (wrapping row: headerText grows,
 *                                              actions hug the end and drop below
 *                                              on narrow widths)
 *       - headerText <View>    <- .headerText  (column, headerTextGap, min-width:0)
 *         - <Heading noMargin> <- the title
 *         - description <Text> <- .description (font-size-sm / leading-sm / muted)
 *       - actions <View>       <- .actions     (row, center, actionsGap, no shrink)
 *     - content <View>         <- .content     (the section body)
 *
 * Geometry (the gap steps per density, the header/text/actions gaps, the divider
 * rule + offset) is read from `sectionSpec.dimensions` through `dimensionsFor`
 * and the divider colour from the spec's `divider` state paint, so the layout
 * cannot drift from Section.module.css. The base text colour is the spec's
 * `paint.text` role; per the RN rule, colour/fontSize live on <Text>, never a
 * parent View. `headingLevel` (2 | 3) is passed straight to the native Heading.
 *
 * Web-parity notes / deliberate reductions:
 * - The web `<section>` region landmark and its aria-labelledby wiring to the
 *   generated heading id are DOM/a11y concerns with no RN equivalent; the
 *   container carries no landmark role and no id is threaded. Pass an
 *   accessibilityLabel through `...rest` if the region needs a name.
 * - `className` is accepted for prop parity but not applied natively.
 * - Resting visuals only: the web hover/focus motion and the Skeleton shimmer
 *   are not run (the static tinted blocks still hold the exact geometry).
 */

import { type ComponentProps, type ReactNode } from 'react';
import { View, Text, type ViewProps } from 'react-native';
import { sectionSpec } from '@glacier/spec';
import { t } from './tokens.ts';
import { paintFor, dimensionsFor } from './resolve.ts';
import { Heading } from './Heading.tsx';
import { Skeleton } from './Skeleton.tsx';

export type SectionGap = 'sm' | 'md' | 'lg';
export type SectionDensity = 'comfortable' | 'compact';
export type SectionHeadingLevel = 2 | 3;

export interface SectionProps extends Omit<ViewProps, 'style' | 'children'> {
  /** Section heading; when present it labels the section (web aria-labelledby). */
  title?: ReactNode;
  /** Muted supporting line under the title. */
  description?: ReactNode;
  /** End-aligned content on the heading row, such as actions. */
  actions?: ReactNode;
  /** Semantic heading level for the title. */
  headingLevel?: SectionHeadingLevel;
  /** Vertical rhythm between the header block and the content. */
  gap?: SectionGap;
  /** Draw a hairline top rule so stacked sections separate cleanly. */
  divider?: boolean;
  /** Section rhythm; compact trims every gap one step down the scale. */
  density?: SectionDensity;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Web-only escape hatch; accepted for prop parity but not applied natively. */
  className?: ComponentProps<'section'>['className'];
  /** The section content. */
  children?: ReactNode;
}

// Size-independent layout metrics read once from the spec (all $token refs, so
// each is wrapped with t(); fallbacks mirror the spec defaults).
const DIMS = dimensionsFor(sectionSpec);

// The gap prop steps, keyed by density then gap (comfortable reads gap*, compact
// reads compactGap*), exactly like the `.section[data-density][data-gap]` rules.
const GAP: Record<SectionDensity, Record<SectionGap, string>> = {
  comfortable: {
    sm: t(DIMS.gapSm ?? 'space-3'),
    md: t(DIMS.gapMd ?? 'space-5'),
    lg: t(DIMS.gapLg ?? 'space-8'),
  },
  compact: {
    sm: t(DIMS.compactGapSm ?? 'space-2'),
    md: t(DIMS.compactGapMd ?? 'space-3'),
    lg: t(DIMS.compactGapLg ?? 'space-5'),
  },
};

// The hairline top rule and its leading offset (trimmed under compact density),
// with the border colour from the spec's `divider` state paint.
const DIVIDER_BORDER = t(paintFor(sectionSpec, 'states', 'divider').border ?? 'border-subtle');
const DIVIDER_WIDTH = t(DIMS.border ?? 'hairline');
const DIVIDER_OFFSET = t(DIMS.dividerOffset ?? 'space-6');
const COMPACT_DIVIDER_OFFSET = t(DIMS.compactDividerOffset ?? 'space-4');

// The base text colour read once from the spec's paint role ($text -> text).
const TEXT_COLOR = t((sectionSpec.paint?.text ?? '$text').replace(/^\$/, ''));

// The heading row: title block grows, actions hug the end; flex-wrap lets the
// actions drop below on narrow widths with no JS measurement (space-2 row gap /
// space-4 column gap).
const headerStyle = {
  flexDirection: 'row' as const,
  flexWrap: 'wrap' as const,
  alignItems: 'flex-start' as const,
  justifyContent: 'space-between' as const,
  rowGap: t(DIMS.headerGapBlock ?? 'space-2'),
  columnGap: t(DIMS.headerGap ?? 'space-4'),
};

// The title/description column: grows to fill and shrinks below its content
// (web `flex: 1; min-width: 0`).
const headerTextStyle = {
  flexGrow: 1,
  flexShrink: 1,
  minWidth: 0,
  flexDirection: 'column' as const,
  rowGap: t(DIMS.headerTextGap ?? 'space-1'),
};

// The actions cluster: never shrinks (web `flex: none`), centred, actionsGap.
const actionsStyle = {
  flexDirection: 'row' as const,
  flexShrink: 0,
  alignItems: 'center' as const,
  columnGap: t(DIMS.actionsGap ?? 'space-2'),
};

// The muted supporting line under the title (matches .description).
const descriptionStyle = {
  color: t('text-muted'),
  fontSize: t('font-size-sm'),
  lineHeight: t('leading-sm') as unknown as number,
  fontFamily: t('font-sans'),
};

/**
 * The Glacier Section, rendered with React Native primitives. Same public prop
 * contract as the web component so the docs compare 1:1; the region landmark,
 * aria-labelledby id wiring and `className` are web-only and ignored here.
 */
export function Section({
  title,
  description,
  actions,
  headingLevel = 2,
  gap = 'md',
  divider = false,
  density = 'comfortable',
  skeleton = false,
  className: _className,
  children,
  ...rest
}: SectionProps) {
  const hasHeader = Boolean(title || description || actions);

  // Outer column: the rhythm gap between the header and content, plus the
  // hairline top rule + leading padding when `divider` is set.
  const rootStyle = {
    flexDirection: 'column' as const,
    rowGap: GAP[density][gap],
    ...(divider
      ? {
          borderTopWidth: DIVIDER_WIDTH,
          borderTopColor: DIVIDER_BORDER,
          borderStyle: 'solid' as const,
          paddingTop: density === 'compact' ? COMPACT_DIVIDER_OFFSET : DIVIDER_OFFSET,
        }
      : null),
  };

  if (skeleton) {
    // Mirror only the provided slots so the placeholder keeps the live section's
    // exact geometry and nothing shifts when content arrives. Decorative, so the
    // whole placeholder is hidden from the accessibility tree.
    return (
      <View aria-hidden={true} style={rootStyle} {...rest}>
        {hasHeader && (
          <View style={headerStyle}>
            {(title || description) && (
              <View style={headerTextStyle}>
                {title && <Heading level={headingLevel} noMargin skeleton />}
                {description && <Skeleton variant="text" width="18rem" />}
              </View>
            )}
            {actions && (
              <View style={actionsStyle}>
                <Skeleton width="6rem" height={t('control-height-md')} radius={t('control-radius')} />
              </View>
            )}
          </View>
        )}
        {/* content + skeletonLines: text lines stacked at reading rhythm. */}
        <View style={{ minWidth: 0, rowGap: t('space-2') }}>
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="92%" />
          <Skeleton variant="text" width="61%" />
        </View>
      </View>
    );
  }

  return (
    <View style={rootStyle} {...rest}>
      {hasHeader && (
        <View style={headerStyle}>
          {(title || description) && (
            <View style={headerTextStyle}>
              {title && (
                <Heading level={headingLevel} noMargin>
                  {title}
                </Heading>
              )}
              {description != null && description !== false && (
                <Text style={descriptionStyle}>{description}</Text>
              )}
            </View>
          )}
          {actions != null && actions !== false && <View style={actionsStyle}>{actions}</View>}
        </View>
      )}
      <View style={{ minWidth: 0 }}>{children}</View>
    </View>
  );
}
