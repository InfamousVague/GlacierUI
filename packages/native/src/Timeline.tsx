import { type ReactNode } from 'react';
import { View, Text, type ViewProps } from 'react-native';
import { timelineSpec, tones } from '@glacier/spec';
import { t } from './tokens.ts';
import { paintFor, dimensionsFor } from './resolve.ts';
import { Skeleton } from './Skeleton.tsx';

/**
 * Timeline — the @glacier/native binding of the web Timeline (a vertical
 * activity feed: an ordered list of events, each with a tone-colored marker on
 * a connector rail and a content column of actor, title, timestamp, description,
 * media, and actions).
 *
 * Paint + geometry are read from `timelineSpec` through the shared resolvers so
 * this cannot drift from Timeline.module.css:
 *   - per-tone marker paint via `paintFor(timelineSpec, 'tones', tone)` —
 *     `background` fills the dot/disc, `text` is the glyph color drawn on it
 *     (neutral fills with text-subtle so the surface glyph keeps contrast).
 *   - all box metrics via `dimensionsFor` (markerSize=size-lg, dotSize=size-xs,
 *     connectorWidth=hairline, railGap=space-3 item gap, headerGap=space-2,
 *     item/compactPaddingBlock, mediaRadius, and the content-column offsets).
 * The one gap the spec does not expose — the rail's internal marker↔connector
 * space (CSS `.rail { gap: space-1 }`) — is referenced as t('space-1') directly.
 *
 * Layout: each item is a plain <View> row (rail column + content column) rather
 * than depending on the native Stack/Row. The rail stretches to the item height
 * (flexbox align-items: stretch) so its flex-grow connector spans the gap the
 * content column's paddingBottom opens beneath each event — exactly like the web.
 *
 * Text color/fontSize live on <Text> (RN has no CSS inheritance, and a bare
 * string cannot sit in a View): the web root's font-size-sm / text color are
 * restated on the title (medium weight), description (text-muted), and timestamp
 * (font-size-xs / text-subtle / tabular-nums) Text nodes. The marker sets `color`
 * on its container so a currentColor icon inherits the tone glyph color on
 * react-native-web (matching Pill's icon slot); on device that color is a noop.
 *
 * Resting visuals only, and no focus/interaction: the feed itself takes no tab
 * order (matching the web) — any interactive content lives inside the consumer's
 * `actions`/`actor` nodes and keeps its own semantics. The skeleton branch mirrors
 * the web's exact rail geometry with the Skeleton atom (a static tinted block on
 * this binding — no shimmer runtime). The web-only `className` / `style` escape
 * hatches are not part of ViewProps and are accepted-but-noop.
 */

/** The semantic color family a marker can wear. Derived from the spec tones. */
export type TimelineTone = (typeof tones)[number];

export interface TimelineItem {
  /** Stable identity (string or number) for the event. */
  id: string | number;
  /** The event headline. */
  title: ReactNode;
  /** Body copy under the header row. */
  description?: ReactNode;
  /** Muted time slot at the end of the header row. */
  timestamp?: ReactNode;
  /** Avatar or name slot composed by the consumer, leading the header row. */
  actor?: ReactNode;
  /** Glyph inside the marker dot; falls back to a plain dot. */
  icon?: ReactNode;
  /** Colors the marker. Defaults to neutral. */
  tone?: TimelineTone;
  /** Optional media or preview block under the description. */
  media?: ReactNode;
  /** Optional action row of small buttons or links. */
  actions?: ReactNode;
}

export interface TimelineProps extends Omit<ViewProps, 'children' | 'style'> {
  /** The events, in reading order: the array order is the chronology you choose. */
  items: TimelineItem[];
  /** Accessible name for the feed. Required: a feed without a name is just a list. */
  'aria-label': string;
  /** Vertical rhythm; compact trims the space between events. */
  density?: 'comfortable' | 'compact';
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** How many placeholder rows the skeleton draws. */
  skeletonCount?: number;
}

/** Title line widths for the skeleton, cycled so the placeholder reads organically. */
const SKELETON_TITLE_WIDTHS = ['45%', '60%', '50%', '70%'];

// Size-independent box metrics read once from the spec.
const DIMS = dimensionsFor(timelineSpec);

/**
 * A resolved measurement value. `dimensionsFor` returns bare token names (e.g.
 * `space-3`); they get wrapped in the custom property, while a raw length — one
 * that starts with a digit or dot — passes straight through so it never becomes
 * `var(--glacier-0.5rem)`. (Timeline declares only tokens, but the guard keeps
 * this identical to the other bindings.)
 */
function metric(value: string | undefined, fallback: string): string {
  const v = value ?? fallback;
  return /^[.\d]/.test(v) ? v : t(v);
}

/**
 * The Glacier Timeline, rendered with React Native primitives. Visually
 * identical to @glacier/react's Timeline and unable to drift from it: every
 * color and measurement is read from the timeline spec through the shared
 * resolvers.
 */
export function Timeline({
  items,
  'aria-label': ariaLabel,
  density = 'comfortable',
  skeleton = false,
  skeletonCount = 4,
  ...rest
}: TimelineProps) {
  // Geometry read from the spec (bare token names, wrapped by t()).
  const markerSize = metric(DIMS.markerSize, 'size-lg');
  const dotSize = metric(DIMS.dotSize, 'size-xs');
  const connectorWidth = metric(DIMS.connectorWidth, 'hairline');
  const connectorMinHeight = metric(DIMS.connectorMinHeight, 'space-3');
  const itemGap = metric(DIMS.railGap, 'space-3'); // .item gap (rail ↔ content)
  const railInnerGap = t('space-1'); // .rail gap (marker ↔ connector), not a spec dimension
  const headerGap = metric(DIMS.headerGap, 'space-2');
  const mediaRadius = metric(DIMS.mediaRadius, 'radius-md');
  const descriptionGap = metric(DIMS.descriptionGap, 'space-1');
  const mediaGap = metric(DIMS.mediaGap, 'space-2');
  const actionsGap = metric(DIMS.actionsGap, 'space-2');
  const actionsItemGap = metric(DIMS.actionsItemGap, 'space-2');
  const actorGap = t('space-2'); // .actor internal gap, not a spec dimension
  // Vertical rhythm between events; the last item closes it out (padding 0).
  const padBlock = metric(
    density === 'compact' ? DIMS.compactPaddingBlock : DIMS.itemPaddingBlock,
    density === 'compact' ? 'space-3' : 'space-5',
  );

  if (skeleton) {
    const rows = Math.max(1, skeletonCount);
    // The whole feed is decorative here, matching the web aria-hidden branch.
    return (
      <View aria-hidden={true} style={{ flexDirection: 'column' }} {...rest}>
        {Array.from({ length: rows }, (_, i) => {
          const last = i === rows - 1;
          return (
            <View key={i} style={{ flexDirection: 'row', columnGap: itemGap }}>
              <View style={{ alignItems: 'center', rowGap: railInnerGap, width: markerSize }}>
                <Skeleton variant="circle" width={markerSize} />
                {!last && (
                  <View
                    style={{
                      flexGrow: 1,
                      minHeight: connectorMinHeight,
                      width: `calc(${t('hairline')} * 2)`,
                    }}
                  >
                    <Skeleton width="100%" height="100%" radius={t('radius-full')} />
                  </View>
                )}
              </View>
              <View style={{ flex: 1, paddingBottom: last ? 0 : padBlock }}>
                <View style={{ minHeight: markerSize, justifyContent: 'center' }}>
                  <Skeleton variant="text" width={SKELETON_TITLE_WIDTHS[i % SKELETON_TITLE_WIDTHS.length]} />
                </View>
                <View style={{ marginTop: descriptionGap }}>
                  <Skeleton variant="text" width="80%" />
                </View>
              </View>
            </View>
          );
        })}
      </View>
    );
  }

  return (
    <View accessibilityRole="list" aria-label={ariaLabel} style={{ flexDirection: 'column' }} {...rest}>
      {items.map((item, i) => {
        const last = i === items.length - 1;
        const tone = item.tone ?? 'neutral';
        const paint = paintFor(timelineSpec, 'tones', tone);
        const fill = t(paint.background ?? 'text-subtle'); // marker dot/disc fill
        const glyph = t(paint.text ?? 'surface'); // glyph color drawn on the disc
        const hasIcon = item.icon != null;
        return (
          <View key={item.id} accessibilityRole="listitem" style={{ flexDirection: 'row', columnGap: itemGap }}>
            {/* rail — decorative marker + connector column */}
            <View aria-hidden={true} style={{ alignItems: 'center', rowGap: railInnerGap, width: markerSize }}>
              <View
                style={{
                  width: markerSize,
                  height: markerSize,
                  borderRadius: t('radius-full'),
                  alignItems: 'center',
                  justifyContent: 'center',
                  // With an icon the whole marker becomes a filled disc; `color`
                  // feeds a currentColor icon on react-native-web (noop on device).
                  ...(hasIcon ? { backgroundColor: fill, color: glyph } : null),
                }}
              >
                {hasIcon ? (
                  item.icon
                ) : (
                  <View style={{ width: dotSize, height: dotSize, borderRadius: t('radius-full'), backgroundColor: fill }} />
                )}
              </View>
              {!last && (
                <View
                  style={{
                    flexGrow: 1,
                    width: connectorWidth,
                    minHeight: connectorMinHeight,
                    backgroundColor: t('border'),
                  }}
                />
              )}
            </View>
            {/* content column */}
            <View style={{ flex: 1, paddingBottom: last ? 0 : padBlock }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  columnGap: headerGap,
                  rowGap: headerGap,
                  minHeight: markerSize, // centers a one-line header on the marker
                }}
              >
                {item.actor != null && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: actorGap }}>{item.actor}</View>
                )}
                <Text
                  style={{
                    flexShrink: 1,
                    color: t('text'),
                    fontSize: t('font-size-sm'),
                    lineHeight: t('leading-sm') as never,
                    fontFamily: t('font-sans'),
                    fontWeight: t('font-weight-medium') as never,
                  }}
                >
                  {item.title}
                </Text>
                {item.timestamp != null && (
                  <Text
                    style={{
                      // margin-inline-start: auto — hug the end of the header row.
                      marginLeft: 'auto',
                      color: t('text-subtle'),
                      fontSize: t('font-size-xs'),
                      lineHeight: t('leading-xs') as never,
                      fontFamily: t('font-sans'),
                      fontVariant: ['tabular-nums'],
                    }}
                  >
                    {item.timestamp}
                  </Text>
                )}
              </View>
              {item.description != null && (
                <Text
                  style={{
                    marginTop: descriptionGap,
                    color: t('text-muted'),
                    fontSize: t('font-size-sm'),
                    lineHeight: t('leading-sm') as never,
                    fontFamily: t('font-sans'),
                  }}
                >
                  {item.description}
                </Text>
              )}
              {item.media != null && (
                <View style={{ marginTop: mediaGap, borderRadius: mediaRadius, overflow: 'hidden' }}>{item.media}</View>
              )}
              {item.actions != null && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    columnGap: actionsItemGap,
                    rowGap: actionsItemGap,
                    marginTop: actionsGap,
                  }}
                >
                  {item.actions}
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}
