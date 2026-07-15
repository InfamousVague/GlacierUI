import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, Text, View, type ViewProps } from 'react-native';
import { announcementTones, announcementsSpec } from '@glacier/spec';
import { dimensionsFor, paintFor, paintStyle } from './resolve.ts';
import { t } from './tokens.ts';

export type AnnouncementTone = (typeof announcementTones)[number];

export interface AnnouncementItem {
  id: string;
  label?: ReactNode;
  content: ReactNode;
}

export interface AnnouncementsProps extends Omit<ViewProps, 'children' | 'style'> {
  items: readonly AnnouncementItem[];
  tone?: AnnouncementTone;
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  autoPlay?: boolean;
  interval?: number;
  'aria-label'?: string;
}

const BOX = dimensionsFor(announcementsSpec);

function clampIndex(index: number, length: number) {
  return Math.max(0, Math.min(index, length - 1));
}

/**
 * The native Announcements strip shares the web component's spec-resolved
 * geometry and tone paint. It rotates through short updates and provides real
 * previous, next, and pause controls; the DOM-only hover/focus pause and slide
 * animation have no direct native equivalent.
 */
export function Announcements({
  items,
  tone = 'info',
  index,
  defaultIndex = 0,
  onIndexChange,
  autoPlay = true,
  interval = 7000,
  'aria-label': ariaLabel = 'Announcements',
  ...rest
}: AnnouncementsProps) {
  const [uncontrolledIndex, setUncontrolledIndex] = useState(defaultIndex);
  const [paused, setPaused] = useState(false);
  const currentIndex = clampIndex(index ?? uncontrolledIndex, items.length);
  const current = items[currentIndex];
  const canRotate = items.length > 1;
  const { color: messageColor, ...box } = paintStyle(announcementsSpec, 'tones', tone);
  const labelColor = t('text');
  const subtle = t('text-subtle');
  const controlColor = t('text-muted');
  const controlSize = t(BOX.controlSize ?? 'control-height-sm');

  function select(nextIndex: number) {
    const next = ((nextIndex % items.length) + items.length) % items.length;
    if (index == null) setUncontrolledIndex(next);
    onIndexChange?.(next);
  }

  useEffect(() => {
    if (!autoPlay || paused || !canRotate) return;
    const timer = setInterval(() => select(currentIndex + 1), interval);
    return () => clearInterval(timer);
  }, [autoPlay, paused, canRotate, currentIndex, interval]);

  if (!current) return null;

  return (
    <View
      accessibilityRole="summary"
      accessibilityLabel={ariaLabel}
      style={{
        flexDirection: 'row', alignItems: 'center', width: '100%', minHeight: t(BOX.minHeight ?? 'control-height-md'),
        columnGap: t(BOX.gap ?? 'space-3'), borderRadius: t(BOX.radius ?? 'radius-lg'),
        paddingLeft: t(BOX.paddingInlineStart ?? 'space-4'), paddingRight: t(BOX.paddingInlineEnd ?? 'space-3'),
        paddingVertical: t(BOX.paddingBlock ?? 'space-2'), ...box,
      }}
      {...rest}
    >
      <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: 'auto', minWidth: 0, flexDirection: 'row', alignItems: 'center', columnGap: t('space-2'), paddingHorizontal: t(BOX.viewportPaddingInline ?? 'space-1') }}>
        {current.label != null && (
          <Text style={{ color: labelColor, fontFamily: t('font-sans'), fontSize: t('font-size-sm'), lineHeight: t('leading-md') as never, fontWeight: t('font-weight-semibold') as never }}>
            {current.label}
          </Text>
        )}
        <Text numberOfLines={1} style={{ flexShrink: 1, color: messageColor, fontFamily: t('font-sans'), fontSize: t('font-size-sm'), lineHeight: t('leading-md') as never }}>
          {current.content}
        </Text>
      </View>
      {canRotate && (
        <View accessibilityRole="toolbar" accessibilityLabel="Announcement controls" style={{ flexDirection: 'row', alignItems: 'center', columnGap: t('space-1') }}>
          <Pressable accessibilityRole="button" accessibilityLabel="Previous announcement" onPress={() => select(currentIndex - 1)} style={{ width: controlSize, height: controlSize, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: controlColor }}>{'‹'}</Text>
          </Pressable>
          <Text aria-live="polite" style={{ minWidth: '2.75rem', textAlign: 'center', color: subtle, fontVariant: ['tabular-nums'] }}>
            {currentIndex + 1} of {items.length}
          </Text>
          <Pressable accessibilityRole="button" accessibilityLabel={paused ? 'Resume announcements' : 'Pause announcements'} accessibilityState={{ selected: paused }} onPress={() => setPaused((value) => !value)} style={{ width: controlSize, height: controlSize, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: controlColor }}>{paused ? '▶' : 'Ⅱ'}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Next announcement" onPress={() => select(currentIndex + 1)} style={{ width: controlSize, height: controlSize, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: controlColor }}>{'›'}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}