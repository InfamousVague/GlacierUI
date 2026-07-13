import { type ReactNode } from 'react';
import { Text, type TextProps } from 'react-native';
import { labelSpec } from '@glacier/spec';
import { t } from './tokens.ts';
import { dimensionsFor } from './resolve.ts';
import { Skeleton } from './Skeleton.tsx';

export interface LabelProps extends Omit<TextProps, 'children' | 'style'> {
  /** Appends a required marker after the label text. */
  required?: boolean;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  children?: ReactNode;
}

// Geometry read once from the spec (font-size-sm / leading-sm).
const DIMS = dimensionsFor(labelSpec);
// Base text color from the spec's paint role ($text -> text).
const TEXT_TOKEN = (labelSpec.paint?.text ?? '$text').replace(/^\$/, '');

/**
 * The Glacier form Label, rendered with React Native's <Text>. Font size,
 * line-height and color are read from the label spec through the shared
 * resolvers, and the medium weight / sans family reuse the same token names the
 * web CSS applies, so it stays pixel-identical to @glacier/react's Label and
 * cannot drift from it. The required marker is a nested <Text> painted with the
 * danger-text token (the spec lists it under `tokens`, so it is referenced by
 * name) and hidden from assistive tech, matching the web's aria-hidden asterisk;
 * convey requiredness on the paired control itself. React Native has no <label>
 * element, so there is no htmlFor equivalent — associate the field at the app
 * level. The `skeleton` prop renders through the native Skeleton at the label's
 * exact font-size, exactly as the web Label does.
 */
export function Label({ required = false, skeleton = false, children, ...rest }: LabelProps) {
  const fontSize = t(DIMS.fontSize ?? 'font-size-sm');

  if (skeleton) {
    // Mirrors the web Label: a text-variant placeholder 6ch wide, sized to the
    // label's font-size (the web sets fontSize so the Skeleton's 1em line
    // resolves to font-size-sm; on native we set the height directly).
    return <Skeleton variant="text" width="6ch" height={fontSize} />;
  }

  return (
    <Text
      style={{
        color: t(TEXT_TOKEN),
        fontSize,
        lineHeight: t(DIMS.lineHeight ?? 'leading-sm') as never,
        fontFamily: t('font-sans'),
        fontWeight: t('font-weight-medium') as never,
      }}
      {...rest}
    >
      {children}
      {required && (
        <Text aria-hidden={true} style={{ color: t('danger-text') }}>
          {' *'}
        </Text>
      )}
    </Text>
  );
}
