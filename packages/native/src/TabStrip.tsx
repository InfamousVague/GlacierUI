import { type ReactNode } from 'react';
import { View, Text, Pressable, type ViewProps } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { tabStripSpec } from '@glacier/spec';
import { useControlled } from '@glacier/commons';
import { t } from './tokens.ts';
import { paintFor, dimensionsFor } from './resolve.ts';

/**
 * TabStrip — the @glacier/native binding of the web organism.
 *
 * KIND: compose. This composes native primitives (View / Pressable / Text +
 * react-native-svg) into the same role="tablist" of role="tab" buttons the DOM
 * kit renders. Paint and geometry are read from `tabStripSpec` through the
 * shared resolvers so the strip cannot drift from TabStrip.module.css:
 *   - dimensions  → radius-md tab corners, space-1 strip gap, space-3 inline /
 *                   space-2 block tab padding.
 *   - paint.border→ the strip's border-subtle baseline hairline.
 *   - states.selected → active tab text (text), lifted icon (text-muted), and
 *                   the accent-solid underline indicator token.
 * The resting tab text (text-muted), resting icon/close (text-subtle) and the
 * tab-internal gap / trailing padding are base values carried verbatim from the
 * web `.tab`/`.icon`/`.close` rules (the spec collapses the asymmetric
 * padding-inline to a single paddingInline and declares no base tab paint role).
 *
 * Interactivity is controlled state (useControlled): tapping a tab selects it
 * (reporting via onValueChange), the nested close Pressable reports onClose. The
 * active tab renders its underline as a RESTING absolute element — no motion
 * runtime on this binding, so the `spring` preset is accepted for prop parity
 * but has no animated effect (the web springs the shared layout element).
 *
 * Web-only, accepted-but-noop on native (reported in the wave notes):
 *   - spring          — no framer-motion layout animation here (resting underline).
 *   - showScrollbar   — horizontal overflow scrolling needs a ScrollView, which
 *                       is not on this tier; the strip lays its tabs out at their
 *                       intrinsic width (flexShrink 0), matching the resting look.
 *   - className        — DOM escape hatch, ignored.
 *   - keyboard nav (Arrow/Home/End/Delete) and roving tabindex/focus — DOM-only.
 */

export interface TabStripItem {
  /** Stable identity of the tab; also the value reported by onValueChange. */
  id: string;
  /** Visible label. */
  label: ReactNode;
  /** Optional leading glyph. */
  icon?: ReactNode;
}

/** Spring presets, matching the spec's `spring` enum values (parity-only here). */
export type TabStripSpring = 'snappy' | 'smooth' | 'bouncy' | 'gentle';

export interface TabStripProps extends Omit<ViewProps, 'children' | 'style'> {
  tabs: TabStripItem[];
  /** Controlled active tab id. */
  value?: string;
  /** Initial active tab id when uncontrolled; defaults to the first tab. */
  defaultValue?: string;
  /** Called with the id of the tab that becomes active. */
  onValueChange?: (id: string) => void;
  /** Called with the id of the tab whose close button is pressed. */
  onClose?: (id: string) => void;
  /** Spring preset for the active indicator. Accepted for parity; no motion runtime on this binding. */
  spring?: TabStripSpring;
  /** Web-only: shows the horizontal scrollbar beneath overflowing tabs. No-op here (needs a ScrollView). */
  showScrollbar?: boolean;
  /** Accessible name for the strip. */
  'aria-label'?: string;
  /** Web-only escape hatch; accepted but ignored. */
  className?: string;
}

/**
 * A resolved measurement value. The resolvers return token names (e.g.
 * `space-3`) for tokenized values and raw CSS lengths for the rest (the close
 * control's `1.25rem` box and the label's `12rem` cap are declared inline, not
 * as tokens). A token name is wrapped in its custom property; a raw length —
 * anything starting with a digit or dot — passes straight through so it never
 * becomes `var(--glacier-1.25rem)`.
 */
function metric(value: string | undefined, fallback: string): string {
  const v = value ?? fallback;
  return /^[.\d]/.test(v) ? v : t(v);
}

/** Strip the leading `$` from a raw spec ref, exactly as the shared resolvers do. */
function bare(v: string | undefined): string | undefined {
  return v?.startsWith('$') ? v.slice(1) : v;
}

// Size-independent geometry read once from the spec.
const BOX = dimensionsFor(tabStripSpec);
// The active tab's paint: text (full color), icon (lifted to text-muted), and
// indicator (accent-solid underline). Merged paint + tokens from the resolver.
const SELECTED = paintFor(tabStripSpec, 'states', 'selected');
// The strip's baseline hairline color (spec top-level paint).
const STRIP_BORDER = bare((tabStripSpec.paint as { border?: string } | undefined)?.border) ?? 'border-subtle';

/** The × close glyph (react-native-svg so it matches the DOM <svg> and renders on
 *  device). RN does not inherit currentColor, so the close color is passed as stroke. */
function CloseGlyph({ color }: { color: string }) {
  return (
    <Svg width={12} height={12} viewBox="0 0 12 12" fill="none" aria-hidden={true}>
      <Path d="M3 3l6 6M9 3l-6 6" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

/**
 * The Glacier TabStrip, rendered with React Native primitives. The strip is a
 * flex-row View with the border-subtle baseline hairline; each tab is a
 * Pressable that selects on tap and carries an optional leading icon, an
 * ellipsized label, a nested close Pressable, and — when active — the resting
 * accent-solid underline. Paint and geometry come from the tab-strip spec so it
 * stays pixel-identical to @glacier/react's TabStrip.
 */
export function TabStrip({
  tabs,
  value,
  defaultValue,
  onValueChange,
  onClose,
  spring: _spring,
  showScrollbar: _showScrollbar,
  className: _className,
  'aria-label': ariaLabel,
  ...rest
}: TabStripProps) {
  const fallback = defaultValue ?? tabs[0]?.id ?? '';
  const [active, setActive] = useControlled({ value, defaultValue: fallback, onChange: onValueChange });

  // Geometry (all tokenized in the spec; metric() guards raw lengths anyway).
  const stripGap = metric(BOX.gap, 'space-1');
  const tabRadius = metric(BOX.radius, 'radius-md');
  const padBlock = metric(BOX.paddingBlock, 'space-2');
  const padStart = metric(BOX.paddingInline, 'space-3');
  // The web `.tab` uses padding-inline: space-3 space-2 and gap: space-2; the
  // spec collapses inline padding to one value, so the trailing pad and the
  // tab-internal gap are the web base values.
  const padEnd = t('space-2');
  const tabGap = t('space-2');
  const iconSize = t('font-size-sm');

  // Resting/active paint. Non-selected tab text is the web `.tab` base
  // (text-muted); icon/close rest at text-subtle.
  const activeText = t(SELECTED.text ?? 'text');
  const restText = t('text-muted');
  const activeIcon = t(SELECTED.icon ?? 'text-muted');
  const restIcon = t('text-subtle');
  const closeColor = t('text-subtle');
  const indicatorColor = t(SELECTED.indicator ?? 'accent-solid');

  return (
    <View
      accessibilityRole="tablist"
      aria-orientation="horizontal"
      aria-label={ariaLabel}
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        columnGap: stripGap,
        borderBottomWidth: t('hairline'),
        borderBottomColor: t(STRIP_BORDER),
        borderStyle: 'solid',
      }}
      {...rest}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        const name = typeof tab.label === 'string' ? tab.label : 'tab';
        return (
          <Pressable
            key={tab.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => setActive(tab.id)}
            style={{
              position: 'relative',
              flexDirection: 'row',
              flexShrink: 0,
              alignItems: 'center',
              columnGap: tabGap,
              paddingVertical: padBlock,
              paddingStart: padStart,
              paddingEnd: padEnd,
              borderTopLeftRadius: tabRadius,
              borderTopRightRadius: tabRadius,
              backgroundColor: 'transparent',
            }}
          >
            {tab.icon != null && (
              <View
                aria-hidden={true}
                style={{
                  width: iconSize,
                  height: iconSize,
                  flexShrink: 0,
                  alignItems: 'center',
                  justifyContent: 'center',
                  // A currentColor SVG picks up this color on react-native-web,
                  // matching the web `.icon` rule (text-subtle, text-muted active).
                  color: isActive ? activeIcon : restIcon,
                }}
              >
                {tab.icon}
              </View>
            )}
            <Text
              numberOfLines={1}
              style={{
                maxWidth: '12rem',
                color: isActive ? activeText : restText,
                fontSize: t('font-size-sm'),
                lineHeight: t('font-size-sm') as never,
                fontFamily: t('font-sans'),
                fontWeight: t('font-weight-medium') as never,
              }}
            >
              {tab.label}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Close ${name}`}
              onPress={() => onClose?.(tab.id)}
              style={{
                width: '1.25rem',
                height: '1.25rem',
                flexShrink: 0,
                alignItems: 'center',
                justifyContent: 'center',
                marginStart: t('space-1'),
                borderRadius: t('radius-sm'),
                backgroundColor: 'transparent',
              }}
            >
              <CloseGlyph color={closeColor} />
            </Pressable>
            {isActive && (
              <View
                aria-hidden={true}
                style={{
                  position: 'absolute',
                  left: t('space-2'),
                  right: t('space-2'),
                  bottom: 'calc(-1 * var(--glacier-hairline))',
                  height: '2px',
                  borderRadius: t('radius-full'),
                  backgroundColor: indicatorColor,
                }}
              />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
