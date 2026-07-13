import { useId, type ReactNode } from 'react';
import { View, Text, Pressable, type ViewProps } from 'react-native';
import { tabsSpec, tabsSprings } from '@glacier/spec';
import { useControlled } from '@glacier/commons';
import { t } from './tokens.ts';
import { paintFor, dimensionsFor } from './resolve.ts';
import { Skeleton } from './Skeleton.tsx';

// Derived from the spec so the spring union cannot drift from the web kit.
export type TabsSpring = (typeof tabsSprings)[number];

export interface TabItem {
  value: string;
  label: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabsProps extends Omit<ViewProps, 'children' | 'style'> {
  tabs: TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /**
   * Spring preset for the underline indicator. Accepted for prop parity with the
   * web kit but inert here: this binding renders the resting underline under the
   * selected tab with no animation runtime, so nothing springs between tabs.
   */
  spring?: TabsSpring;
  /** Stretches the tabs to fill the list width. */
  fullWidth?: boolean;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Accessible name for the tab list. */
  'aria-label'?: string;
  /** Web-only escape hatch; accepted for parity and ignored on native. */
  className?: string;
}

// Size-independent box metrics (gap, tab padding, radius, hairline, underline
// thickness) read once from the spec.
const BOX = dimensionsFor(tabsSpec);

/**
 * A resolved measurement value. `dimensionsFor` returns token names (e.g.
 * `space-1`) for tokenized values and raw CSS lengths for the rest (the
 * underline's `2px` thickness is declared inline in the spec, not as a token). A
 * token name is wrapped in its custom property; a raw length — anything starting
 * with a digit or dot — passes straight through so it never becomes
 * `var(--glacier-2px)`.
 */
function metric(value: string | undefined, fallback: string): string {
  const v = value ?? fallback;
  return /^[.\d]/.test(v) ? v : t(v);
}

/**
 * The Glacier Tabs, rendered with React Native primitives. Paint and geometry are
 * read from the tabs spec through the shared resolvers, so it is visually
 * identical to @glacier/react's Tabs and cannot drift from it.
 *
 * The tablist is a flex-row View underlined by a bottom hairline; each tab is a
 * Pressable whose label lifts from the muted resting color to full text color
 * when selected, and the selected tab mounts the accent underline as an
 * absolutely-positioned View sitting on the list hairline. Selection is
 * controlled/uncontrolled through the shared `useControlled` hook (the same
 * behavior the web kit uses), and the active tab's content renders in a padded
 * panel View below.
 *
 * Resting visuals only: the web springs the underline between tabs as a shared
 * framer-motion layout element and cross-fades the panel on change; this binding
 * has no animation runtime, so it paints the static underline under the selected
 * tab and shows the active panel directly (the `spring` prop is inert). Arrow-key
 * roving and the reduced-motion branch are likewise web concerns; taps switch
 * tabs here.
 */
export function Tabs({
  tabs,
  value,
  defaultValue,
  onValueChange,
  spring: _spring,
  fullWidth = false,
  skeleton = false,
  className: _className,
  'aria-label': ariaLabel,
  ...rest
}: TabsProps) {
  const id = useId();
  const fallback = defaultValue ?? tabs.find((tab) => !tab.disabled)?.value ?? '';
  const [selected, setSelected] = useControlled({ value, defaultValue: fallback, onChange: onValueChange });

  // Geometry read from the spec.
  const gap = metric(BOX.gap, 'space-1');
  const padBlock = metric(BOX.paddingBlock, 'space-3');
  const padInline = metric(BOX.paddingInline, 'space-4');
  const tabRadius = metric(BOX.radius, 'radius-md');
  const hairline = metric(BOX.border, 'hairline');
  const indicatorH = metric(BOX.indicatorThickness, '2px');

  // Paint read from the spec: the list hairline (top-level paint), the selected
  // tab's full text color + accent underline, the disabled dim, and the muted
  // resting label color (the web `.tab` default, not exposed as a state role).
  const listBorder = t((tabsSpec.paint?.border ?? '$border-subtle').replace(/^\$/, ''));
  const selectedPaint = paintFor(tabsSpec, 'states', 'selected');
  const disabledPaint = paintFor(tabsSpec, 'states', 'disabled');
  const selectedColor = t(selectedPaint.text ?? 'text');
  const indicatorColor = t(selectedPaint.indicator ?? 'accent-solid');
  const disabledColor = t(disabledPaint.text ?? 'text-disabled');
  const mutedColor = t('text-muted');

  if (skeleton) {
    return (
      <View {...rest}>
        <View style={{ flexDirection: 'row', columnGap: gap, borderBottomWidth: hairline, borderBottomColor: listBorder, borderStyle: 'solid' }}>
          {[0, 1, 2].map((line) => (
            <View
              key={line}
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                flex: fullWidth ? 1 : undefined,
                paddingVertical: padBlock,
                paddingHorizontal: padInline,
              }}
            >
              <Skeleton variant="text" width="4rem" />
            </View>
          ))}
        </View>
        <View style={{ paddingTop: t('space-5'), rowGap: t('space-2') }}>
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="70%" />
        </View>
      </View>
    );
  }

  const activeIndex = tabs.findIndex((tab) => tab.value === selected);
  const active = activeIndex >= 0 ? tabs[activeIndex] : undefined;

  return (
    <View {...rest}>
      <View
        accessibilityRole="tablist"
        aria-label={ariaLabel}
        style={{ flexDirection: 'row', columnGap: gap, borderBottomWidth: hairline, borderBottomColor: listBorder, borderStyle: 'solid' }}
      >
        {tabs.map((tab, index) => {
          const isSelected = tab.value === selected;
          const color = tab.disabled ? disabledColor : isSelected ? selectedColor : mutedColor;
          return (
            <Pressable
              key={tab.value}
              accessibilityRole="tab"
              nativeID={`${id}-tab-${index}`}
              aria-label={typeof tab.label === 'string' ? tab.label : undefined}
              accessibilityState={{ selected: isSelected, disabled: tab.disabled }}
              disabled={tab.disabled}
              onPress={() => {
                setSelected(tab.value);
              }}
              style={{
                position: 'relative',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                columnGap: t('space-2'),
                flex: fullWidth ? 1 : undefined,
                paddingVertical: padBlock,
                paddingHorizontal: padInline,
                borderTopLeftRadius: tabRadius,
                borderTopRightRadius: tabRadius,
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  color,
                  fontSize: t('font-size-sm'),
                  // line-height:1, matching the web `.tab` rule.
                  lineHeight: t('font-size-sm') as never,
                  fontFamily: t('font-sans'),
                  fontWeight: t('font-weight-medium') as never,
                }}
              >
                {tab.label}
              </Text>
              {isSelected && (
                // The accent underline sits on the list hairline (inset-inline by
                // space-2, pulled a hairline below the tab's edge), radius-full.
                <View
                  aria-hidden={true}
                  style={{
                    position: 'absolute',
                    left: t('space-2'),
                    right: t('space-2'),
                    bottom: `calc(${hairline} * -1)`,
                    height: indicatorH,
                    borderRadius: t('radius-full'),
                    backgroundColor: indicatorColor,
                  }}
                />
              )}
            </Pressable>
          );
        })}
      </View>
      {active && (
        <View
          accessibilityRole="tabpanel"
          nativeID={`${id}-panel-${activeIndex}`}
          style={{ paddingTop: t('space-5') }}
        >
          {active.content}
        </View>
      )}
    </View>
  );
}
