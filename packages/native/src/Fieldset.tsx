/**
 * Fieldset — the native binding of @glacier/react's molecules/Fieldset.
 *
 * The web component leans on the real <fieldset>/<legend> pair: the legend names
 * the group for assistive tech and the NATIVE `disabled` attribute cascades to
 * every nested control for free. React Native has no fieldset element and no such
 * cascade, so this composition rebuilds the RESTING visual with plain Views/Text:
 *
 *   - root View            <- .fieldset (relative box; bordered = hairline + pad)
 *     - legend  <Text>     <- .legend   (font-size-md / semibold / text)
 *     - description <Text> <- .description (space-1 top / font-size-sm / muted)
 *     - actions <View>     <- .actions  (absolutely pinned to the legend line)
 *     - content <View>     <- .content  (column, space-5 gap, space-4 top offset)
 *
 * Geometry is read from `fieldsetSpec.dimensions` through the shared resolver
 * (`dimensionsFor`) and every bare token name is wrapped with `t()`, so the box
 * cannot drift from Fieldset.module.css. `disabled` only dims the group's own
 * legend/description here (opacity 0.5, matching `.fieldset:disabled`); the
 * browser's cascade to nested controls is web-only and cannot be reproduced.
 * `skeleton` swaps the legend/description for the native Skeleton sibling.
 */

import { type ReactNode } from 'react';
import { View, Text, type ViewProps } from 'react-native';
import { fieldsetSpec } from '@glacier/spec';
import { t } from './tokens.ts';
import { dimensionsFor } from './resolve.ts';
import { Skeleton } from './Skeleton.tsx';

export interface FieldsetProps extends Omit<ViewProps, 'children' | 'style'> {
  /** The group label, rendered as the legend line. */
  legend: ReactNode;
  /** Muted supporting line under the legend. */
  description?: ReactNode;
  /** Right-aligned actions on the legend row. */
  actions?: ReactNode;
  /**
   * Dims the group's own legend/description. On the web this is the native
   * fieldset `disabled` attribute, which the browser cascades to every nested
   * control; React Native has no such cascade, so nested controls must be
   * disabled individually — only the resting dim is reproduced here.
   */
  disabled?: boolean;
  /** Draws the classic hairline box with the legend at the top of the box. */
  bordered?: boolean;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Web-only escape hatch; accepted for prop parity but not applied natively. */
  className?: string;
  children?: ReactNode;
}

// Size-independent box metrics read once from the spec (all $token refs, so each
// is wrapped with t(); fallbacks mirror the spec defaults).
const DIMS = dimensionsFor(fieldsetSpec);
const GAP = t(DIMS.gap ?? 'space-5'); // content row gap
const CONTENT_OFFSET = t(DIMS.contentOffset ?? 'space-4'); // content top margin
const BORDER = t(DIMS.border ?? 'hairline');
const RADIUS = t(DIMS.radius ?? 'radius-lg');
const PAD = t(DIMS.padding ?? 'space-5');

/**
 * The Glacier Fieldset, rendered with React Native primitives. Same public prop
 * contract as the web component so the docs compare 1:1; `className` and other
 * DOM-only fieldset attributes are web-only and ignored here.
 */
export function Fieldset({
  legend,
  description,
  actions,
  disabled = false,
  bordered = false,
  skeleton = false,
  className: _className,
  children,
  ...rest
}: FieldsetProps) {
  // The bordered box: hairline border + rounded corners + inset padding.
  const boxStyle = bordered
    ? {
        position: 'relative' as const,
        borderWidth: BORDER,
        borderStyle: 'solid' as const,
        borderColor: 'transparent',
        borderRadius: RADIUS,
        padding: PAD,
      }
    : { position: 'relative' as const };

  // Legend text paint (dims with the group when disabled).
  const legendStyle = {
    fontSize: t('font-size-md'),
    fontWeight: t('font-weight-semibold') as never,
    lineHeight: t('leading-sm') as never,
    color: t('text'),
    fontFamily: t('font-sans'),
    // On the border the legend floats with side padding pulled back into the line.
    ...(bordered
      ? {
          paddingHorizontal: t('space-2'),
          marginLeft: 'calc(var(--glacier-space-2) * -1)',
          backgroundColor: t('surface-sunken'),
          transform: [{ translateY: `calc(${PAD} * -1)` }],
          alignSelf: 'flex-start',
        }
      : null),
    ...(disabled ? { opacity: 0.5 } : null),
  };

  const descriptionStyle = {
    marginTop: t('space-1'),
    fontSize: t('font-size-sm'),
    lineHeight: t('leading-sm') as never,
    color: t('text-muted'),
    fontFamily: t('font-sans'),
    ...(disabled ? { opacity: 0.5 } : null),
  };

  const borderFrame = bordered ? (
    <View
      aria-hidden={true}
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: `calc(${t('font-size-md')} * ${t('leading-sm')} / 2)`,
        right: 0,
        bottom: 0,
        left: 0,
        borderWidth: BORDER,
        borderStyle: 'solid',
        borderColor: t('border'),
        borderRadius: RADIUS,
      }}
    />
  ) : null;

  if (skeleton) {
    // The legend/description swap to placeholder lines; nested controls render
    // their own skeletons. Skeleton is a View, so it is wrapped in a View (never
    // a Text) to stay valid on-device; the bordered legend offset is preserved.
    return (
      <View style={boxStyle} {...rest}>
        {borderFrame}
        <View style={bordered ? { paddingHorizontal: t('space-2'), marginLeft: 'calc(var(--glacier-space-2) * -1)' } : null}>
          <Skeleton variant="text" width="8rem" />
        </View>
        {description != null && (
          <View style={{ marginTop: t('space-1') }}>
            <Skeleton variant="text" width="16rem" />
          </View>
        )}
        <View style={{ flexDirection: 'column', rowGap: GAP, marginTop: CONTENT_OFFSET }}>{children}</View>
      </View>
    );
  }

  return (
    <View
      accessibilityRole="none"
      accessibilityState={{ disabled }}
      style={boxStyle}
      {...rest}
    >
      {borderFrame}
      <Text style={legendStyle}>{legend}</Text>
      {description != null && <Text style={descriptionStyle}>{description}</Text>}
      {actions != null && (
        <View
          style={{
            position: 'absolute',
            // Anchored to the legend line; pinned to the top-end corner (inside
            // the border padding when bordered), matching the web `.actions` rule.
            top: bordered ? t('space-4') : 0,
            right: bordered ? t('space-5') : 0,
            flexDirection: 'row',
            alignItems: 'center',
            columnGap: t('space-2'),
          }}
        >
          {actions}
        </View>
      )}
      <View style={{ flexDirection: 'column', rowGap: GAP, marginTop: CONTENT_OFFSET }}>{children}</View>
    </View>
  );
}
