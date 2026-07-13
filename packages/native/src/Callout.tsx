import { type ReactNode } from 'react';
import { View, Text, type ViewProps } from 'react-native';
import { calloutSpec, calloutTones } from '@glacier/spec';
import { t } from './tokens.ts';
import { paintFor, dimensionsFor } from './resolve.ts';
import { Skeleton } from './Skeleton.tsx';

/**
 * Callout — the @glacier/native binding of the web Callout (a bordered message
 * block in five tones with an optional leading icon and bold title).
 *
 * Paint and geometry are read from calloutSpec through the shared resolvers, so
 * this stays pixel-identical to @glacier/react's Callout and cannot drift:
 * - the tone `paint` gives background/border/body-text; the tone's extra
 *   `tokens` give the title and icon colors (the color the web puts on
 *   `.tone .title` / `.tone .icon`). Body text stays text-muted in every tone.
 * - `dimensions` give the radius, gap, padding, body gap and font size.
 *
 * Text color + fontSize live on <Text> (a bare string cannot sit in a View and
 * color does not inherit across a View). The optional icon arrives as a
 * ReactNode and is wrapped in a top-aligned View carrying the tone's icon color
 * so a currentColor SVG picks it up on react-native-web, matching the web
 * `.icon` rule.
 *
 * Resting visuals only. `glass` renders the frosted tint (glass-regular fill +
 * glass-border hairline, body text lifted to full-strength `text`); the web's
 * backdrop blur and inset highlight shadow are material effects with no
 * on-device equivalent, so they are dropped (accepted-but-noop). role maps to
 * accessibilityRole — `alert` for warning/danger, `note` otherwise — matching
 * the web semantics.
 */

// Derived from the spec so the tone union cannot drift from the web kit.
export type CalloutTone = (typeof calloutTones)[number];

export interface CalloutProps extends Omit<ViewProps, 'style' | 'children'> {
  tone?: CalloutTone;
  title?: ReactNode;
  icon?: ReactNode;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Renders the frosted glass material instead of a solid surface. */
  glass?: boolean;
  children?: ReactNode;
}

// Size-independent box + type metrics read once from the spec (radius, gap,
// border, paddingInline/Block, bodyGap, fontSize) — all bare token names.
const DIMS = dimensionsFor(calloutSpec);

/**
 * The resolved paint for one tone. `background`/`border`/`text` come from the
 * tone's structured paint; `title`/`icon` are the extra per-tone token roles.
 * `glass` overrides the surface with the frosted tint and lifts the body text to
 * full-strength `text` (matching `.callout.glass`), while the title and icon
 * keep their tone colors (the `.tone .title` selectors still win over `.glass`).
 */
function calloutPaint(tone: CalloutTone, glass: boolean) {
  const p = paintFor(calloutSpec, 'tones', tone);
  return {
    backgroundColor: glass ? t('glass-regular') : t(p.background ?? 'surface-sunken'),
    borderColor: glass ? t('glass-border') : t(p.border ?? 'border-subtle'),
    bodyColor: glass ? t('text') : t(p.text ?? 'text-muted'),
    titleColor: t(p.title ?? 'text'),
    iconColor: t(p.icon ?? 'text-muted'),
  };
}

export function Callout({
  tone = 'note',
  title,
  icon,
  skeleton = false,
  glass = false,
  children,
  ...rest
}: CalloutProps) {
  if (skeleton) {
    // Same geometry as the web skeleton branch: a full-width, 4rem-tall block
    // with the callout's large radius. ("4rem" is the raw length the web
    // hardcodes; radius reads the token.)
    return <Skeleton width="100%" height="4rem" radius={t('radius-lg')} {...rest} />;
  }

  const paint = calloutPaint(tone, glass);
  const alert = tone === 'warning' || tone === 'danger';

  return (
    <View
      accessibilityRole={alert ? 'alert' : 'note'}
      style={{
        flexDirection: 'row',
        columnGap: t(DIMS.gap ?? 'space-3'),
        borderWidth: t(DIMS.border ?? 'hairline'),
        borderStyle: 'solid',
        borderColor: paint.borderColor,
        borderRadius: t(DIMS.radius ?? 'radius-lg'),
        paddingHorizontal: t(DIMS.paddingInline ?? 'space-5'),
        paddingVertical: t(DIMS.paddingBlock ?? 'space-4'),
        backgroundColor: paint.backgroundColor,
      }}
      {...rest}
    >
      {icon != null && (
        <View
          style={{
            // flex: none — the glyph never shrinks; align it to the top so it
            // sits with the first line, matching the web `.icon` rule. `color`
            // is the currentColor source for an SVG glyph on react-native-web.
            flexShrink: 0,
            alignItems: 'flex-start',
            color: paint.iconColor,
          }}
        >
          {icon}
        </View>
      )}
      <View
        style={{
          flexDirection: 'column',
          // min-width:0 + shrink lets the body wrap instead of overflowing,
          // matching the web `.body { min-width: 0 }` (default flex-shrink).
          flexShrink: 1,
          minWidth: 0,
          rowGap: t(DIMS.bodyGap ?? 'space-1'),
        }}
      >
        {title != null && (
          <Text
            style={{
              color: paint.titleColor,
              fontSize: t(DIMS.fontSize ?? 'font-size-sm'),
              lineHeight: t('leading-md') as never,
              fontFamily: t('font-sans'),
              fontWeight: t('font-weight-semibold') as never,
            }}
          >
            {title}
          </Text>
        )}
        {children != null && (
          <Text
            style={{
              color: paint.bodyColor,
              fontSize: t(DIMS.fontSize ?? 'font-size-sm'),
              lineHeight: t('leading-md') as never,
              fontFamily: t('font-sans'),
            }}
          >
            {children}
          </Text>
        )}
      </View>
    </View>
  );
}
