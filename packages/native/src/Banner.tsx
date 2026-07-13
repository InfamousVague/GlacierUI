import { type ReactNode } from 'react';
import { View, Text, Pressable, type ViewProps } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { bannerTones, bannerSpec, iconButtonSpec } from '@glacier/spec';
import { press } from '@glacier/commons';
import { t } from './tokens.ts';
import { paintStyle, paintFor, sizeFor, dimensionsFor } from './resolve.ts';
import { Skeleton } from './Skeleton.tsx';

// Derived from the spec so the tone union cannot drift from the web kit.
export type BannerTone = (typeof bannerTones)[number];

export interface BannerProps extends Omit<ViewProps, 'children' | 'style'> {
  tone?: BannerTone;
  /** Leading glyph, centered with the message and tinted by the tone. */
  icon?: ReactNode;
  /** Trailing slot, typically a Button or link. */
  action?: ReactNode;
  /** When set, renders a trailing close control that calls this on press. */
  onDismiss?: () => void;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  children?: ReactNode;
}

// Size-independent box metrics (radius, gap, border, padding, dismissOffset,
// fontSize) read once from the banner spec, so the strip cannot drift from
// Banner.module.css.
const BOX = dimensionsFor(bannerSpec);

// The trailing dismiss control is a small ghost IconButton in the web kit
// (`<IconButton size={Size.Small}>`); its geometry and resting text color are
// read from the IconButton spec rather than re-transcribed here.
const DISMISS_SIZE = sizeFor(iconButtonSpec, 'sm').height ?? 'control-height-sm';
const DISMISS_RADIUS = dimensionsFor(iconButtonSpec).radius ?? 'control-radius';
const DISMISS_BORDER = dimensionsFor(iconButtonSpec).border ?? 'hairline';
const DISMISS_COLOR = t(paintFor(iconButtonSpec, 'variants', 'ghost').text ?? 'text');

// The close glyph, matching the web DismissIcon SVG. `currentColor` on the web
// resolves to the ghost IconButton's text color, so it is pinned to that token.
const DismissGlyph = (
  <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
    <Path d="M3 3l8 8M11 3l-8 8" stroke={DISMISS_COLOR} strokeWidth={1.75} strokeLinecap="round" />
  </Svg>
);

/**
 * The Glacier Banner, rendered with React Native primitives. Paint (per-tone
 * soft surface, hairline tone border, muted message text, tinted icon) and
 * geometry (radius, gap, border, padding, font size) are read from the banner
 * spec through the shared resolvers, so it is visually identical to
 * @glacier/react's Banner and cannot drift from it.
 *
 * A leading icon and the trailing action arrive as ReactNode props and are
 * rendered as-is; the icon slot sets `color` so a currentColor glyph picks up
 * the tone tint (matching the web `.icon` rule on react-native-web). The
 * message text is wrapped in <Text> since React Native cannot render a bare
 * string inside a View and text color does not inherit from a parent View.
 *
 * When onDismiss is set, a small ghost close control is drawn from the
 * IconButton spec; it is the only part of the banner that presses inward (the
 * compact tap scale), matching the web where only the dismiss IconButton has a
 * whileTap. The strip itself does not animate. The web dismiss control's
 * i18n aria-label is rendered here as the literal "Dismiss" (no LocaleProvider
 * on the native side); the tone-tinted dismiss hover is a web-only affordance
 * and is a no-op in the resting native visual.
 */
export function Banner({
  tone = 'info',
  icon,
  action,
  onDismiss,
  skeleton = false,
  children,
  ...rest
}: BannerProps) {
  if (skeleton) {
    return <Skeleton width="100%" height="3rem" radius={t('radius-lg')} {...rest} />;
  }

  // warning and danger switch the ARIA role to the assertive alert live region;
  // all other tones stay a polite status region, matching the web role logic.
  const alert = tone === 'warning' || tone === 'danger';

  // Per-tone paint: background + hairline tone border on the strip, muted text
  // color for the message (pulled onto <Text>), tone tint for the icon.
  const { color: messageColor, ...box } = paintStyle(bannerSpec, 'tones', tone);
  const iconColor = t(paintFor(bannerSpec, 'tones', tone).icon ?? 'text-muted');

  return (
    <View
      accessibilityRole={alert ? 'alert' : 'status'}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        columnGap: t(BOX.gap ?? 'space-3'),
        borderRadius: t(BOX.radius ?? 'radius-lg'),
        paddingHorizontal: t(BOX.paddingInline ?? 'space-4'),
        paddingVertical: t(BOX.paddingBlock ?? 'space-3'),
        ...box,
      }}
      {...rest}
    >
      {icon != null && (
        <View
          style={{
            flexShrink: 0,
            flexDirection: 'row',
            alignItems: 'center',
            // Tone tint for a currentColor glyph (react-native-web reads this
            // `color`), matching the web `.tone .icon` rule.
            color: iconColor,
          }}
        >
          {icon}
        </View>
      )}
      <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: 'auto', minWidth: 0 }}>
        <Text
          style={{
            color: messageColor,
            fontSize: t(BOX.fontSize ?? 'font-size-sm'),
            lineHeight: t('leading-md') as never,
            fontFamily: t('font-sans'),
          }}
        >
          {children}
        </Text>
      </View>
      {action != null && (
        <View style={{ flexShrink: 0, flexDirection: 'row', alignItems: 'center' }}>{action}</View>
      )}
      {onDismiss != null && (
        <View
          style={{
            flexShrink: 0,
            flexDirection: 'row',
            alignItems: 'center',
            // Pull the close control toward the edge, matching the web
            // `.dismiss { margin-inline-start: calc(-1 * dismissOffset) }`.
            marginLeft: `calc(${t(BOX.dismissOffset ?? 'space-1')} * -1)`,
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Dismiss"
            onPress={onDismiss}
            style={({ pressed }) => ({
              width: t(DISMISS_SIZE),
              height: t(DISMISS_SIZE),
              borderRadius: t(DISMISS_RADIUS),
              // Ghost control: transparent hairline border keeps the box size
              // identical to a filled IconButton, matching the web `.button` base.
              borderWidth: t(DISMISS_BORDER),
              borderStyle: 'solid',
              borderColor: 'transparent',
              backgroundColor: 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ scale: pressed ? press.compact : 1 }],
            })}
          >
            {DismissGlyph}
          </Pressable>
        </View>
      )}
    </View>
  );
}
