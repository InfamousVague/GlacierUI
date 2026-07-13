import { useId, type ReactNode } from 'react';
import { View, Text, Pressable, type ViewProps } from 'react-native';
import { useControlled } from '@glacier/commons';
import { t } from './tokens.ts';
import { CounterBadge } from './CounterBadge.tsx';

/**
 * The Glacier TabbedPanel, rendered with React Native primitives. A framed
 * panel with a header row of tabs over a bounded content body that switches per
 * active tab. This organism has no ComponentSpec, so — like the web
 * TabbedPanel.module.css it mirrors — paint and geometry are read straight from
 * the same `--glacier-*` tokens (wrapped by `t()`), keeping it visually
 * identical to @glacier/react's TabbedPanel.
 *
 * Structure mirrors the web: a `surface-raised` panel (hairline border,
 * radius-xl, shadow-1, clipped) wraps a `surface` header — a tab row plus an
 * optional trailing actions slot — over a padded body. Each tab is a Pressable
 * that selects on press (controlled or uncontrolled via commons useControlled);
 * the resting label colors are text-muted (idle), text (selected) and
 * text-disabled (disabled), and the selected tab carries the accent-solid
 * underline indicator. A tab's optional count renders as a CounterBadge (accent
 * tone when selected, neutral otherwise).
 *
 * Resting visuals only. Several web features have no native runtime and are
 * accepted-but-noop: the framer-motion underline `layoutId` slide and the body
 * fade/rise on tab change (the resting selected indicator and body are painted
 * directly); the tablist's horizontal overflow scrolling (rendered as a plain
 * row — Tier A ships no ScrollView); and the WAI-ARIA arrow/Home/End keyboard
 * navigation and hover/focus-ring states, which are DOM-only (the RN primitive
 * shim exposes no onKeyDown). `className` and any DOM rest props are web-only
 * and ignored. Tab switching remains fully functional via press.
 */

export interface TabbedPanelTab {
  id: string;
  label: ReactNode;
  /** Optional count rendered as a CounterBadge on the tab. */
  count?: number;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabbedPanelProps extends Omit<ViewProps, 'style' | 'children'> {
  tabs: TabbedPanelTab[];
  /** Controlled active tab id. */
  value?: string;
  /** Initial active tab id when uncontrolled. */
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  /** Actions rendered at the end of the header row, e.g. a Button or Menu. */
  actions?: ReactNode;
  /** Accessible name for the tab list. */
  'aria-label'?: string;
  /** Web-only escape hatch; accepted for prop parity but has no effect on native. */
  className?: string;
}

export function TabbedPanel({
  tabs,
  value,
  defaultValue,
  onValueChange,
  actions,
  className: _className,
  'aria-label': ariaLabel,
  ...rest
}: TabbedPanelProps) {
  const id = useId();
  const fallback = defaultValue ?? tabs.find((tab) => !tab.disabled)?.id ?? '';
  const [selected, setSelected] = useControlled({
    value,
    defaultValue: fallback,
    onChange: onValueChange,
  });

  const activeIndex = tabs.findIndex((tab) => tab.id === selected);
  const active = activeIndex >= 0 ? tabs[activeIndex] : undefined;

  return (
    <View
      style={{
        flexDirection: 'column',
        minWidth: 0,
        borderWidth: t('hairline'),
        borderColor: t('border-subtle'),
        borderStyle: 'solid',
        borderRadius: t('radius-xl'),
        backgroundColor: t('surface-raised'),
        boxShadow: t('shadow-1'),
        overflow: 'hidden',
      }}
      {...rest}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'stretch',
          columnGap: t('space-2'),
          paddingHorizontal: t('space-2'),
          borderBottomWidth: t('hairline'),
          borderColor: t('border-subtle'),
          borderStyle: 'solid',
          backgroundColor: t('surface'),
        }}
      >
        <View
          accessibilityRole="tablist"
          aria-label={ariaLabel}
          style={{
            flexDirection: 'row',
            flexGrow: 1,
            flexShrink: 1,
            flexBasis: 'auto',
            minWidth: 0,
            columnGap: t('space-1'),
          }}
        >
          {tabs.map((tab) => {
            const isSelected = tab.id === selected;
            // The idle label is muted; the selected tab reads at full text
            // color; a disabled tab drops to text-disabled (matching the web's
            // `.tab` / `[aria-selected]` / `:disabled` rules).
            const color = tab.disabled
              ? t('text-disabled')
              : isSelected
                ? t('text')
                : t('text-muted');
            return (
              <Pressable
                key={tab.id}
                accessibilityRole="tab"
                nativeID={`${id}-tab-${tab.id}`}
                accessibilityState={{ selected: isSelected, disabled: tab.disabled }}
                disabled={tab.disabled}
                onPress={() => setSelected(tab.id)}
                style={{
                  position: 'relative',
                  flexDirection: 'row',
                  alignItems: 'center',
                  columnGap: t('space-2'),
                  paddingVertical: t('space-3'),
                  paddingHorizontal: t('space-4'),
                  borderTopLeftRadius: t('radius-md'),
                  borderTopRightRadius: t('radius-md'),
                  backgroundColor: 'transparent',
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    color,
                    fontSize: t('font-size-sm'),
                    // line-height:1 matches the web `.tab` rule so the tab height
                    // is set only by its vertical padding.
                    lineHeight: t('font-size-sm') as never,
                    fontFamily: t('font-sans'),
                    fontWeight: t('font-weight-medium') as never,
                  }}
                >
                  {tab.label}
                </Text>
                {tab.count !== undefined && tab.count > 0 && (
                  <CounterBadge
                    count={tab.count}
                    tone={isSelected ? 'accent' : 'neutral'}
                    size="sm"
                  />
                )}
                {isSelected && (
                  <View
                    aria-hidden={true}
                    style={{
                      position: 'absolute',
                      left: t('space-2'),
                      right: t('space-2'),
                      // Sits on the header's bottom hairline (web `.indicator`
                      // uses bottom: calc(-1 * hairline)).
                      bottom: `calc(-1 * ${t('hairline')})`,
                      height: 2,
                      borderRadius: t('radius-full'),
                      backgroundColor: t('accent-solid'),
                    }}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
        {actions != null && (
          <View
            style={{
              flexDirection: 'row',
              flexShrink: 0,
              alignItems: 'center',
              columnGap: t('space-2'),
              paddingVertical: t('space-2'),
            }}
          >
            {actions}
          </View>
        )}
      </View>
      {active && (
        <View
          accessibilityRole="tabpanel"
          nativeID={`${id}-panel-${activeIndex}`}
          style={{ padding: t('space-5'), minWidth: 0 }}
        >
          {active.content}
        </View>
      )}
    </View>
  );
}
