import { type ReactNode } from 'react';
import { Text, View, type TextProps, type ViewProps } from 'react-native';
import { headingLevels, headingSpec } from '@glacier/spec';
import { t } from './tokens.ts';
import { sizeFor } from './resolve.ts';

// Derived from the spec so the level union cannot drift from the web kit.
export type HeadingLevel = (typeof headingLevels)[number];
export type HeadingAlign = 'start' | 'center' | 'end' | 'justify';

export interface HeadingProps extends Omit<TextProps, 'children' | 'style'> {
  /** Semantic heading level, h1 through h6. Also sets the visual size. */
  level?: HeadingLevel;
  /** Visual size override when semantics and looks need to differ. */
  visualLevel?: HeadingLevel;
  /** Text alignment; inherits when unset. */
  align?: HeadingAlign;
  /** Removes the heading's outer margin so it can fit inside compact layouts. */
  noMargin?: boolean;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  children?: ReactNode;
}

// The base text color read once from the spec's paint role ($text -> text).
const TEXT_TOKEN = (headingSpec.paint?.text ?? '$text').replace(/^\$/, '');
const TEXT_COLOR = t(TEXT_TOKEN);

// Per-level roles the CSS applies on top of the spec's font-size step. The
// spec's `sizes` only declare fontSize, so the leading / tracking / weight the
// web kit layers on come straight from the same token names it uses (see
// Typography.module.css): h1 is bold, h1-h3 are tracked, h6 is uppercased and
// painted subtle. Values are token names, never transcribed literals.
const LEADING: Record<HeadingLevel, string> = {
  1: 'leading-3xl',
  2: 'leading-2xl',
  3: 'leading-xl',
  4: 'leading-lg',
  5: 'leading-md',
  6: 'leading-sm',
};
const TRACKING: Partial<Record<HeadingLevel, string>> = {
  1: 'tracking-3xl',
  2: 'tracking-2xl',
  3: 'tracking-xl',
};

const RN_ALIGN: Record<HeadingAlign, 'left' | 'center' | 'right' | 'justify'> = {
  start: 'left',
  center: 'center',
  end: 'right',
  justify: 'justify',
};

/**
 * The Glacier Heading, rendered with React Native primitives. Font size is read
 * from the heading spec's size step (`h1`-`h6`) and the base color from its
 * paint, so it stays identical to @glacier/react's Heading; the per-level
 * weight, leading, tracking and the h6 uppercase/subtle treatment reuse the
 * exact token names the web CSS applies. `accessibilityRole="header"` gives the
 * heading semantics on device (RN has no distinct h1-h6 elements).
 */
export function Heading({
  level = 2,
  visualLevel,
  align,
  noMargin: _noMargin = false,
  skeleton = false,
  children,
  ...rest
}: HeadingProps) {
  const vl = visualLevel ?? level;
  const dims = sizeFor(headingSpec, `h${vl}`);
  const fontSize = t(dims.fontSize ?? 'font-size-2xl');
  const isH6 = vl === 6;

  if (skeleton) {
    // Resting visual only: a static tinted block at the heading's line-height.
    // The web Skeleton's shimmer is a device follow-up (no animation runtime).
    return (
      <View
        accessibilityRole="header"
        style={{
          height: t(LEADING[vl]),
          width: t('space-24'),
          borderRadius: t('radius-sm'),
          backgroundColor: t('surface-sunken'),
        }}
        {...(rest as ViewProps)}
      />
    );
  }

  return (
    <Text
      accessibilityRole="header"
      style={{
        color: isH6 ? t('text-subtle') : TEXT_COLOR,
        fontSize,
        lineHeight: t(LEADING[vl]) as unknown as number,
        fontFamily: t('font-sans'),
        fontWeight: t(vl === 1 ? 'font-weight-bold' : 'font-weight-semibold') as never,
        ...(TRACKING[vl] ? { letterSpacing: t(TRACKING[vl]!) as unknown as number } : null),
        ...(isH6 ? { textTransform: 'uppercase' as const, letterSpacing: '0.05em' as unknown as number } : null),
        ...(align ? { textAlign: RN_ALIGN[align] } : null),
      }}
      {...rest}
    >
      {children}
    </Text>
  );
}
