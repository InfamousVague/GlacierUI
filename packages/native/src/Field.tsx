import { type ReactNode } from 'react';
import { View, Text, type ViewProps } from 'react-native';
import { fieldSpec } from '@glacier/spec';
import { t } from './tokens.ts';
import { dimensionsFor, paintFor } from './resolve.ts';
import { Skeleton } from './Skeleton.tsx';

/**
 * Field — the @glacier/native binding of the web Field (a form-control wrapper
 * that stacks a label, the wrapped control, and a reserved meta line holding a
 * hint or an error).
 *
 * Geometry and paint are read from fieldSpec through the shared resolvers so
 * this cannot drift from @glacier/react's Field:
 * - `dimensions.gap` gives the vertical stack gap (space-2).
 * - the `invalid` state's `text` token colors the error; the `required` state's
 *   `marker` token colors the asterisk (both danger-text).
 * - the label/meta type tokens (font-size-sm/xs, leading-sm/xs, weight-medium,
 *   text/text-muted) are the bare token names the CSS applies, wrapped with t().
 *
 * Every text color + fontSize rides on its own <Text> (React Native has no
 * inheritance, so the web's `font-sans` on the wrapper is re-applied per label /
 * hint / error). textAlign is left-to-right stacking only.
 *
 * Resting visuals only: the web fades the hint in and shakes the error in via a
 * motion runtime; here the meta line renders the error when present, else the
 * hint, with no animation. The meta line still reserves one xs line of height so
 * the hint-to-error swap does not jump the layout.
 *
 * Web-only wiring dropped: the DOM Field generates an id and provides a
 * FieldContext (id / describedBy / invalid) so the wrapped control picks up
 * htmlFor + aria-describedby + aria-invalid. There is no FieldContext in the
 * native kit — the native Input/Textarea surface `invalid` as a direct prop — so
 * the children render as-is and the caller passes `invalid` to the control. The
 * error still carries accessibilityRole="alert" so it is announced on arrival.
 * `className` (and other DOM-only attrs) are accepted-but-noop.
 */

export interface FieldProps extends Omit<ViewProps, 'style' | 'children'> {
  label?: ReactNode;
  hint?: ReactNode;
  /** When set, replaces the hint and marks the field invalid. */
  error?: ReactNode;
  required?: boolean;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** DOM parity only; ignored on native. */
  className?: string;
  children: ReactNode;
}

// Size-independent metrics + state paints read once from the spec.
const DIMS = dimensionsFor(fieldSpec); //                    { gap: space-2 }
const INVALID = paintFor(fieldSpec, 'states', 'invalid'); // { text: danger-text }
const REQUIRED = paintFor(fieldSpec, 'states', 'required'); // { marker: danger-text }

export function Field({
  label,
  hint,
  error,
  required,
  skeleton = false,
  className: _className,
  children,
  ...rest
}: FieldProps) {
  const invalid = Boolean(error);

  // The vertical stack (flex column, gap space-2). font-sans lives per-Text.
  const fieldStyle = {
    flexDirection: 'column' as const,
    rowGap: t(DIMS.gap ?? 'space-2'),
  };

  // The reserved meta line: one xs line tall so a hint→error swap never jumps.
  const metaStyle = {
    minHeight: `calc(${t('font-size-xs')} * ${t('leading-xs')})`,
  };

  if (skeleton) {
    return (
      <View style={fieldStyle} {...rest}>
        {label != null && <Skeleton variant="text" width="5rem" />}
        {children}
        <View style={metaStyle}>{hint != null && <Skeleton variant="text" width="9rem" />}</View>
      </View>
    );
  }

  return (
    <View style={fieldStyle} {...rest}>
      {label != null && (
        <Text
          style={{
            color: t('text'),
            fontSize: t('font-size-sm'),
            lineHeight: t('leading-sm') as never,
            fontFamily: t('font-sans'),
            fontWeight: t('font-weight-medium') as never,
          }}
        >
          {label}
          {required && (
            <Text aria-hidden={true} style={{ color: t(REQUIRED.marker ?? 'danger-text') }}>
              {' '}
              *
            </Text>
          )}
        </Text>
      )}
      {children}
      <View style={metaStyle}>
        {error != null ? (
          <Text
            accessibilityRole="alert"
            style={{
              color: t(INVALID.text ?? 'danger-text'),
              fontSize: t('font-size-xs'),
              lineHeight: t('leading-xs') as never,
              fontFamily: t('font-sans'),
              fontWeight: t('font-weight-medium') as never,
            }}
          >
            {error}
          </Text>
        ) : hint != null ? (
          <Text
            style={{
              color: t('text-muted'),
              fontSize: t('font-size-xs'),
              lineHeight: t('leading-xs') as never,
              fontFamily: t('font-sans'),
            }}
          >
            {hint}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
