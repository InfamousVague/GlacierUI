/**
 * FormSection — the native binding of @glacier/react's molecules/Fieldset/FormSection.
 *
 * The web component is a page-level grouping: a titled, labelled <section> whose
 * body is often one or more Fieldsets. It composes the kit's Heading (the title),
 * an optional muted description line, an optional title-row actions cluster, and
 * an optional hairline Divider above the whole section for stacking. React Native
 * has no <section>/aria-labelledby, so this rebuilds the RESTING layout with plain
 * Views/Text plus the native Heading + Divider siblings:
 *
 *   - root View                 <- .section
 *     - [Divider wrapper View]   <- .divider   (space-6 bottom margin, when divider)
 *     - header <View>            <- .header     (row, flex-start, space-between, headerGap)
 *       - headerText <View>      <- .headerText (column, shrinks like min-width:0)
 *         - <Heading noMargin>   <- the title (skeleton swaps to a placeholder block)
 *         - description <Text>   <- .description (space-1 top / font-size-sm / muted)
 *       - actions <View>         <- .sectionActions (row, center, space-2 gap, no shrink)
 *     - content <View>           <- .sectionContent (column, gap, contentOffset top)
 *
 * Geometry is read from `formSectionSpec.dimensions` through the shared resolver
 * (`dimensionsFor`) and every bare token name is wrapped with `t()`, so the layout
 * cannot drift from Fieldset.module.css. `level` reuses the Heading spec's level
 * union. `className` and other DOM-only section attributes (plus the web's
 * aria-labelledby id wiring) are web-only and accepted-but-noop here.
 */

import { type ReactNode } from 'react';
import { View, Text, type ViewProps } from 'react-native';
import { formSectionSpec } from '@glacier/spec';
import { t } from './tokens.ts';
import { dimensionsFor } from './resolve.ts';
import { Divider } from './Divider.tsx';
import { Heading, type HeadingLevel } from './Heading.tsx';
import { Skeleton } from './Skeleton.tsx';

export interface FormSectionProps extends Omit<ViewProps, 'children' | 'style'> {
  /** The section title, rendered as a Heading that labels the section. */
  title: ReactNode;
  /** Semantic heading level for the title. */
  level?: HeadingLevel;
  /** Muted supporting line under the title. */
  description?: ReactNode;
  /** Right-aligned actions on the title row. */
  actions?: ReactNode;
  /** Draws a hairline divider above the section, for stacking sections. */
  divider?: boolean;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Web-only escape hatch; accepted for prop parity but not applied natively. */
  className?: string;
  children?: ReactNode;
}

// Size-independent layout metrics read once from the spec (all $token refs, so
// each is wrapped with t(); fallbacks mirror the spec defaults).
const DIMS = dimensionsFor(formSectionSpec);
const CONTENT_GAP = t(DIMS.gap ?? 'space-5'); // content row gap
const CONTENT_OFFSET = t(DIMS.contentOffset ?? 'space-5'); // content top margin
const HEADER_GAP = t(DIMS.headerGap ?? 'space-4'); // title/actions row gap
const DIVIDER_OFFSET = t(DIMS.dividerOffset ?? 'space-6'); // divider bottom margin

// The muted supporting line under the title (matches .description).
const descriptionStyle = {
  marginTop: t('space-1'),
  fontSize: t('font-size-sm'),
  lineHeight: t('leading-sm') as never,
  color: t('text-muted'),
  fontFamily: t('font-sans'),
};

/**
 * The Glacier FormSection, rendered with React Native primitives. Same public
 * prop contract as the web component so the docs compare 1:1; `className` and the
 * DOM-only aria-labelledby id wiring are web-only and ignored here.
 */
export function FormSection({
  title,
  level = 3,
  description,
  actions,
  divider = false,
  skeleton = false,
  className: _className,
  children,
  ...rest
}: FormSectionProps) {
  return (
    <View accessibilityRole="summary" style={{ flexDirection: 'column' }} {...rest}>
      {divider && (
        <View style={{ marginBottom: DIVIDER_OFFSET }}>
          <Divider />
        </View>
      )}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          columnGap: HEADER_GAP,
        }}
      >
        {/* headerText: column that can shrink below its content (web min-width:0). */}
        <View style={{ flexDirection: 'column', flexShrink: 1 }}>
          {skeleton ? (
            <Heading level={level} noMargin skeleton />
          ) : (
            <Heading level={level} noMargin>
              {title}
            </Heading>
          )}
          {description != null &&
            (skeleton ? (
              <View style={{ marginTop: t('space-1') }}>
                <Skeleton variant="text" width="16rem" />
              </View>
            ) : (
              <Text style={descriptionStyle}>{description}</Text>
            ))}
        </View>

        {/* Actions never render in the skeleton (matches the web branch). */}
        {!skeleton && actions != null && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              columnGap: t('space-2'),
              flexShrink: 0,
            }}
          >
            {actions}
          </View>
        )}
      </View>

      <View style={{ flexDirection: 'column', rowGap: CONTENT_GAP, marginTop: CONTENT_OFFSET }}>
        {children}
      </View>
    </View>
  );
}
