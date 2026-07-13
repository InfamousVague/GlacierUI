import { type ReactNode } from 'react';
import { View, Text, Pressable, ScrollView, type ViewProps, type StyleProp } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { treeViewSpec } from '@glacier/spec';
import { useControlled, paintFor, dimensionsFor } from '@glacier/commons';
import { t } from './tokens.ts';
import { Skeleton } from './Skeleton.tsx';

/**
 * TreeView — the @glacier/native binding of the web TreeView (a hierarchical list
 * of expandable rows: chevron slot, optional icon, label, optional trailing slot,
 * indented by depth, with animated branches and single selection).
 *
 * Paint and geometry are read from `treeViewSpec` through the shared resolvers, so
 * this cannot drift from @glacier/react: the tree text color (text-muted), the
 * selected row's accent-soft tint + accent-text (the `selected` state), and the
 * box metrics (radius-md rows, space-2 gap, space-1/space-3 padding, space-4
 * indent step) all come from the spec. The chevron is the same SVG path the web
 * draws, rotated 90deg when expanded; the base indent constant (space-2) and the
 * chevron/icon slot sizes (1rem / 1.125rem) are the raw lengths the CSS declares
 * and pass through verbatim. The scrollable region is a vertical ScrollView with
 * the tree padding on `contentContainerStyle`.
 *
 * Expansion and selection are controlled/uncontrolled through the shared
 * `useControlled` hook (its setter fires onExpandedChange / onSelect), matching
 * the web's state contract. The same `items` / `TreeItem` data shape is kept so
 * the docs compare 1:1.
 *
 * Resting visuals only. WAI-ARIA roving-tabindex keyboard navigation (arrow
 * walk / expand / collapse / Home / End), the height + opacity branch animation,
 * the hover wash, the frosted-glass backdrop-filter blur, and RTL chevron/indent
 * mirroring are web/device concerns with no animation or focus runtime here —
 * tapping a row selects it (and toggles a parent), and the glass surface keeps its
 * material fill/border/radius without the live blur. `className` is a web-only
 * escape hatch, accepted-but-noop.
 */

export interface TreeItem {
  id: string;
  label: ReactNode;
  /** Leading glyph, hidden from assistive tech. */
  icon?: ReactNode;
  /** Trailing content such as a CounterBadge or Pill. */
  trailing?: ReactNode;
  /** Skipped by arrow navigation and unselectable. */
  disabled?: boolean;
  /** Child items; their presence makes the row an expandable parent. */
  children?: TreeItem[];
}

export interface TreeViewProps extends Omit<ViewProps, 'children' | 'style' | 'aria-label'> {
  items: TreeItem[];
  /** Controlled list of expanded parent ids. */
  expandedIds?: string[];
  /** Initially expanded parent ids when uncontrolled. */
  defaultExpandedIds?: string[];
  onExpandedChange?: (expandedIds: string[]) => void;
  /** Controlled selected row id (single-select). */
  selectedId?: string;
  /** Initially selected row id when uncontrolled. */
  defaultSelectedId?: string;
  onSelect?: (id: string) => void;
  /** Accessible name for the tree. Required: a tree without a name is a maze. */
  'aria-label': string;
  /** Renders the frosted glass material behind the tree. */
  glass?: boolean;
  /** Renders a placeholder with the component's exact geometry. */
  skeleton?: boolean;
  /** Web-only escape hatch; accepted for parity and ignored on native. */
  className?: string;
  /** Merged over the scroll container's own style (never clobbers its paint). */
  style?: StyleProp;
}

// Size-independent geometry read once from the spec: radius, gap, paddingInline,
// paddingBlock, indent — all token names.
const DIM = dimensionsFor(treeViewSpec);

/**
 * A resolved measurement. `dimensionsFor` hands back bare token names; a name is
 * wrapped in its custom property, while a raw length — anything starting with a
 * digit or dot — passes straight through so it never becomes `var(--glacier-1rem)`.
 */
function metric(value: string | undefined, fallback: string): string {
  const v = value ?? fallback;
  return /^[.\d]/.test(v) ? v : t(v);
}

// Strip a leading `$` from a base-paint ref exactly as the shared resolvers do.
const bare = (v?: string): string | undefined => (v?.startsWith('$') ? v.slice(1) : v);

// The tree's resting text color (top-level paint) and the selected-row paint
// (accent-soft tint + accent-text + medium weight) from the `selected` state.
const MUTED = t(bare(treeViewSpec.paint?.text) ?? 'text-muted');
const SUBTLE = t('text-subtle');
const SELECTED = paintFor(treeViewSpec, 'states', 'selected');
const SELECTED_BG = t(SELECTED.background ?? 'accent-soft');
const SELECTED_TEXT = t(SELECTED.text ?? 'accent-text');
const SELECTED_WEIGHT = t(SELECTED.weight ?? 'font-weight-medium');

// Box metrics.
const ROW_RADIUS = metric(DIM.radius, 'radius-md');
const GAP = metric(DIM.gap, 'space-2');
const PAD_INLINE_END = metric(DIM.paddingInline, 'space-3');
const PAD_BLOCK = metric(DIM.paddingBlock, 'space-1');
const INDENT = metric(DIM.indent, 'space-4');

/** Row widths for the skeleton, one entry per placeholder row (mirrors the web). */
const SKELETON_ROWS: { depth: number; width: string }[] = [
  { depth: 1, width: '7rem' },
  { depth: 2, width: '9rem' },
  { depth: 2, width: '6rem' },
  { depth: 1, width: '8rem' },
  { depth: 2, width: '7rem' },
];

// padding-inline-start: calc(space-2 + (depth - 1) * space-4). The base inset
// (space-2) is a raw CSS constant in the web `.row` rule, not a spec dimension.
const rowPaddingLeft = (depth: number): string =>
  `calc(${t('space-2')} + (${depth} - 1) * ${INDENT})`;

const chevronGlyph = (color: string): ReactNode => (
  <Svg width={10} height={10} viewBox="0 0 10 10" fill="none">
    <Path
      d="M3 1.5 7 5 3 8.5"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export function TreeView({
  items,
  expandedIds,
  defaultExpandedIds,
  onExpandedChange,
  selectedId,
  defaultSelectedId,
  onSelect,
  glass = false,
  skeleton = false,
  className: _className,
  'aria-label': ariaLabel,
  style,
  ...rest
}: TreeViewProps) {
  const [expanded, setExpanded] = useControlled<string[]>({
    value: expandedIds,
    defaultValue: defaultExpandedIds ?? [],
    onChange: onExpandedChange,
  });
  const [selected, setSelected] = useControlled<string>({
    value: selectedId,
    defaultValue: defaultSelectedId ?? '',
    onChange: onSelect,
  });

  // The scroll container's own box: transparent base, frosted-glass surface when
  // `glass` (the backdrop blur is a device follow-up; the fill/border/radius are
  // painted). Padding rides on contentContainerStyle so it scrolls with content.
  const containerStyle = glass
    ? {
        backgroundColor: t('glass-regular'),
        borderWidth: t('hairline'),
        borderStyle: 'solid' as const,
        borderColor: t('glass-border'),
        borderRadius: t('radius-lg'),
      }
    : {};
  const contentStyle = { padding: glass ? t('space-2') : t('space-1') };

  if (skeleton) {
    return (
      <ScrollView
        aria-hidden={true}
        {...rest}
        style={[containerStyle, style as never]}
        contentContainerStyle={contentStyle}
      >
        {SKELETON_ROWS.map((row, index) => (
          <View
            key={index}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              columnGap: GAP,
              paddingVertical: PAD_BLOCK,
              paddingRight: PAD_INLINE_END,
              paddingLeft: rowPaddingLeft(row.depth),
            }}
          >
            <View style={{ width: '1rem', height: '1rem' }} />
            <Skeleton variant="text" width={row.width} />
          </View>
        ))}
      </ScrollView>
    );
  }

  const toggleExpanded = (id: string) => {
    setExpanded(expanded.includes(id) ? expanded.filter((value) => value !== id) : [...expanded, id]);
  };

  const select = (item: TreeItem) => {
    if (item.disabled) return;
    setSelected(item.id);
  };

  const activate = (item: TreeItem, hasChildren: boolean) => {
    if (hasChildren) toggleExpanded(item.id);
    select(item);
  };

  const renderNode = (item: TreeItem, level: number): ReactNode => {
    const children = item.children ?? [];
    const hasChildren = children.length > 0;
    const isExpanded = hasChildren && expanded.includes(item.id);
    const isSelected = !item.disabled && item.id === selected;
    const rowColor = isSelected ? SELECTED_TEXT : MUTED;
    const chevronColor = isSelected ? SELECTED_TEXT : SUBTLE;

    return (
      <View key={item.id}>
        <Pressable
          accessibilityRole="treeitem"
          accessibilityLabel={typeof item.label === 'string' ? item.label : undefined}
          accessibilityState={{
            selected: item.disabled ? undefined : isSelected,
            disabled: item.disabled,
            expanded: hasChildren ? isExpanded : undefined,
          }}
          disabled={item.disabled}
          onPress={() => activate(item, hasChildren)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            columnGap: GAP,
            paddingVertical: PAD_BLOCK,
            paddingRight: PAD_INLINE_END,
            paddingLeft: rowPaddingLeft(level),
            borderRadius: ROW_RADIUS,
            backgroundColor: isSelected ? SELECTED_BG : undefined,
            opacity: item.disabled ? 0.5 : 1,
          }}
        >
          {/* Chevron slot: leaf rows keep the empty 1rem box so labels align. */}
          <View
            aria-hidden={true}
            style={{
              width: '1rem',
              height: '1rem',
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ rotate: isExpanded ? '90deg' : '0deg' }],
            }}
          >
            {hasChildren && chevronGlyph(chevronColor)}
          </View>
          {item.icon != null && (
            <View
              // A currentColor glyph picks up this `color` on react-native-web,
              // matching the web `.icon` inheriting the row color.
              aria-hidden={true}
              style={{
                width: '1.125rem',
                height: '1.125rem',
                alignItems: 'center',
                justifyContent: 'center',
                color: rowColor,
              }}
            >
              {item.icon}
            </View>
          )}
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              minWidth: 0,
              color: rowColor,
              fontSize: t('font-size-sm'),
              fontFamily: t('font-sans'),
              fontWeight: (isSelected ? SELECTED_WEIGHT : t('font-weight-regular')) as never,
              lineHeight: 1.4 as never,
            }}
          >
            {item.label}
          </Text>
          {item.trailing != null && (
            <View style={{ alignItems: 'center', justifyContent: 'center', color: SUBTLE }}>
              {item.trailing}
            </View>
          )}
        </Pressable>
        {hasChildren && isExpanded && (
          <View accessibilityRole="group">
            {children.map((child) => renderNode(child, level + 1))}
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView
      accessibilityRole="tree"
      aria-label={ariaLabel}
      {...rest}
      style={[containerStyle, style as never]}
      contentContainerStyle={contentStyle}
    >
      {(items ?? []).map((item) => renderNode(item, 1))}
    </ScrollView>
  );
}
