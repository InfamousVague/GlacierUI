import { cloneElement, type ReactElement } from 'react';
import { View, type ViewProps } from 'react-native';
import { t } from './tokens.ts';

type IconElement = ReactElement<{ color?: string; size?: number; fill?: string; stroke?: string; strokeWidth?: number; opacity?: number; style?: object }>;

export interface IconBackfillProps extends Omit<ViewProps, 'children'> {
  /** One outline icon. Its explicit color is reused for the backfill. */
  children: IconElement;
  /** Overrides the glyph and backfill color. Defaults to the icon's color, then text. */
  color?: string;
  /** Glyph size used to scale the surrounding backfill inset. Defaults to the child's size. */
  size?: number;
}

/** A 33%-opacity silhouette of the same icon, stacked behind its outline. */
export function IconBackfill({ children, color, size, style, ...rest }: IconBackfillProps) {
  const resolvedColor = color ?? children.props.color ?? t('text');
  const iconSize = size ?? children.props.size ?? 24;
  const glyph = cloneElement(children, { color: resolvedColor, size: iconSize });
  const backfill = cloneElement(children, {
    color: resolvedColor,
    size: iconSize,
    fill: resolvedColor,
    stroke: resolvedColor,
    strokeWidth: 4,
    opacity: 0.33,
    style: { position: 'absolute' },
  });

  return (
    <View
      {...rest}
      style={[
        {
          position: 'relative',
          width: iconSize,
          height: iconSize,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      {backfill}
      {glyph}
    </View>
  );
}