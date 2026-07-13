import { type ReactNode } from 'react';
import { View, Text, type ViewProps } from 'react-native';
import { emptyStateSpec } from '@glacier/spec';
import { t } from './tokens.ts';
import { dimensionsFor } from './resolve.ts';
import { Skeleton } from './Skeleton.tsx';

export interface EmptyStateProps extends Omit<ViewProps, 'style' | 'children'> {
  /** Glyph rendered inside the leading disc. Decorative. */
  icon?: ReactNode;
  /** Heading naming what is empty or missing. */
  title: ReactNode;
  /** Muted supporting sentence, centered and width-capped. */
  description?: ReactNode;
  /** Call-to-action node, e.g. a Button, below the text. */
  action?: ReactNode;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  children?: ReactNode;
}

// Every measurement read once from the spec: gap, disc size/radius, padding,
// the title/description font sizes, and the action's gap + offset. Token names
// (space-4) get wrapped by t(); raw lengths the spec declares inline (the disc's
// 4rem, the description's 28rem cap) pass straight through.
const DIMS = dimensionsFor(emptyStateSpec);

/**
 * A resolved measurement value. `dimensionsFor` hands back token names alongside
 * raw CSS lengths; wrap the token names in the custom property and let a raw
 * length — anything that starts with a digit or dot — pass through so it never
 * becomes `var(--glacier-4rem)`.
 */
function metric(value: string | undefined, fallback: string): string {
  const v = value ?? fallback;
  return /^[.\d]/.test(v) ? v : t(v);
}

// The centered column shared by the resting and skeleton renders. Matches the
// web `.emptyState` rule: column, centered on both axes, gap space-4, and
// asymmetric block/inline padding. The container's `color: text-muted` is a
// text-inheritance default on the DOM; in React Native each <Text> carries its
// own color instead, so it is not set on this View.
const container = {
  flexDirection: 'column' as const,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  rowGap: metric(DIMS.gap, 'space-4'),
  paddingVertical: metric(DIMS.paddingBlock, 'space-8'),
  paddingHorizontal: metric(DIMS.paddingInline, 'space-6'),
};

/**
 * The Glacier EmptyState, rendered with React Native primitives. Geometry (the
 * disc size, paddings, the title/description font sizes and the action offset)
 * is read from the empty-state spec through the shared resolvers, so it stays
 * identical to @glacier/react's EmptyState and cannot drift from it.
 *
 * The disc, title, description and action stack in a centered column. Icons
 * arrive as decorative ReactNode props and inherit the disc's `color` (a
 * currentColor SVG picks it up on react-native-web), matching Pill's icon slot;
 * we never render our own glyph. Text color + font size live on each <Text>
 * (they do not inherit from a parent View in React Native). This is the resting
 * visual only — the component itself does not animate; in skeleton mode the
 * placeholders inherit Skeleton's own static wash (its shimmer is a device
 * follow-up).
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  skeleton = false,
  children,
  ...rest
}: EmptyStateProps) {
  if (skeleton) {
    // Placeholder at the exact geometry: a disc-sized circle plus two text
    // lines sized to the title (lg) and description (sm). The character-count
    // widths (12ch / 24ch) are declared inline by the web component, not as
    // tokens, so they are mirrored verbatim.
    return (
      <View style={container} {...rest}>
        <Skeleton variant="circle" width={metric(DIMS.discSize, '4rem')} />
        <Skeleton variant="text" width="12ch" height={metric(DIMS.titleFontSize, 'font-size-lg')} />
        <Skeleton variant="text" width="24ch" height={metric(DIMS.descriptionFontSize, 'font-size-sm')} />
      </View>
    );
  }

  return (
    <View style={container} {...rest}>
      {icon != null && (
        <View
          // Decorative, hidden from assistive tech (web `aria-hidden`). The
          // sunken disc frames the glyph; `color` is set here so a currentColor
          // icon inherits it, matching Pill's icon slot.
          aria-hidden={true}
          style={{
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'center',
            width: metric(DIMS.discSize, '4rem'),
            height: metric(DIMS.discSize, '4rem'),
            borderRadius: metric(DIMS.discRadius, 'radius-full'),
            backgroundColor: t('surface-sunken'),
            color: t('text-muted'),
          }}
        >
          {icon}
        </View>
      )}
      <Text
        accessibilityRole="header"
        style={{
          color: t('text'),
          fontSize: metric(DIMS.titleFontSize, 'font-size-lg'),
          lineHeight: t('leading-md') as unknown as number,
          fontFamily: t('font-sans'),
          fontWeight: t('font-weight-semibold') as never,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      {description != null && (
        <Text
          style={{
            color: t('text-muted'),
            fontSize: metric(DIMS.descriptionFontSize, 'font-size-sm'),
            lineHeight: t('leading-md') as unknown as number,
            fontFamily: t('font-sans'),
            maxWidth: metric(DIMS.descriptionMaxWidth, '28rem'),
            textAlign: 'center',
          }}
        >
          {description}
        </Text>
      )}
      {action != null && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            columnGap: metric(DIMS.actionGap, 'space-3'),
            marginTop: metric(DIMS.actionOffset, 'space-2'),
          }}
        >
          {action}
        </View>
      )}
      {children}
    </View>
  );
}
