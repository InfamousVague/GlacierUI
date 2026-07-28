/**
 * @glacier/native — CommandPalette.
 *
 * The React Native binding of @glacier/react's CommandPalette: a ⌘K overlay
 * that searches every action in the app. Matching, grouping, and cursor
 * movement all come from @glacier/logic, so this palette answers a query with
 * the same list, in the same order, with the cursor in the same place as the
 * web one. Paint and geometry are read from the command-palette spec through
 * the shared resolvers, so the surface cannot drift either.
 *
 * It leans on the react-native <Modal> host for the overlay layer, exactly as
 * Modal does: an absolute-fill Pressable paints the scrim and closes on press,
 * and the panel sits above it as a sibling so pressing the panel does not fall
 * through. Fully controlled through `open` + `onOpenChange`.
 *
 * Web-parity notes (resting visuals and behavior):
 * - The panel is pinned near the top rather than centered, matching the web:
 *   the field should land in the same place whether one command matches or
 *   forty.
 * - Pressing a row is the primary way to run a command here. Arrow-key movement
 *   is wired through onKeyPress and Enter through onSubmitEditing, so a
 *   hardware keyboard drives the same cursor — but a touch device has no arrow
 *   keys, and the cursor is moved by the press itself instead.
 * - The global ⌘K chord is a web/desktop affordance and has no React Native
 *   equivalent; the host app opens the palette. The `shortcut` prop is accepted
 *   for prop parity and is inert here.
 * - The overlay's backdrop blur, the panel's glass blur/saturate and layered
 *   shadow, the spring entrance, focus trap, and the combobox/listbox ARIA
 *   wiring are web-only; the scrim and glass fill colors carry the look and the
 *   panel takes its accessible name from the palette label.
 */
import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from 'react';
import { View, Pressable, ScrollView, Modal as RNModal, StyleSheet, type ViewProps } from 'react-native';
import { commandPaletteSizes, commandPaletteSpec } from '@glacier/spec';
import {
  firstCommandCursor,
  groupCommands,
  matchCommands,
  moveCommandCursor,
  useControlled,
  type CommandDescriptor,
} from '@glacier/logic';
import { t } from '../tokens.ts';
import { paintFor, dimensionsFor } from '../resolve.ts';
import { SearchField } from '../atoms/inputs/SearchField.tsx';
import { Kbd } from '../atoms/display/Kbd.tsx';
import { Text } from '../atoms/display/Text.tsx';

export type { CommandDescriptor } from '@glacier/logic';

// Derived from the spec so the size union cannot drift from the web kit.
export type CommandPaletteSize = (typeof commandPaletteSizes)[number];

export interface CommandPaletteProps {
  /** Whether the palette is shown; renders nothing when false. */
  open: boolean;
  /** Called with false when the user dismisses, or runs a command. */
  onOpenChange: (open: boolean) => void;
  /** Every command the palette can run, in the order they should be offered. */
  commands: CommandDescriptor[];
  /** Called with the chosen command's id, after the palette has closed. */
  onRun: (id: string) => void;
  /** Controlled query text. */
  query?: string;
  /** Initial query when uncontrolled; the palette resets to it on each open. */
  defaultQuery?: string;
  onQueryChange?: (query: string) => void;
  placeholder?: string;
  /** Shown in place of the list when nothing matches. */
  emptyLabel?: ReactNode;
  /** Replaces the default key-hint strip. Pass null to drop it. */
  footer?: ReactNode;
  /** Panel max-width step. */
  size?: CommandPaletteSize;
  /** Accepted for prop parity with the web kit; inert on device. */
  shortcut?: boolean;
}

// Size-independent geometry read once from the spec.
const BOX = dimensionsFor(commandPaletteSpec);

// Strip a leading `$` from a paint ref exactly as the shared resolvers do.
const bare = (v?: string): string | undefined => (v?.startsWith('$') ? v.slice(1) : v);

const PANEL = (commandPaletteSpec.paint ?? {}) as { background?: string; text?: string; border?: string };
const PANEL_BG = t(bare(PANEL.background) ?? 'glass-thick');
const PANEL_BORDER = t(bare(PANEL.border) ?? 'glass-border');
const ACTIVE_BG = t(paintFor(commandPaletteSpec, 'states', 'active').background ?? 'hover');
// A disabled row is quieted to whatever token the spec names for that state,
// expressed as a Text tone rather than a hand-set color so it goes through the
// same vocabulary as the rest of the kit. The map covers the text tokens a
// state is allowed to name; anything else falls back to the resting tone.
const TEXT_TONES: Record<string, 'muted' | 'subtle'> = {
  'text-muted': 'muted',
  'text-subtle': 'subtle',
};
const DISABLED_TONE = TEXT_TONES[paintFor(commandPaletteSpec, 'states', 'disabled').text ?? ''];

// The web's max-width steps, kept here because they are panel chrome rather
// than a spec dimension; the same rem values the stylesheet uses.
const MAX_WIDTH: Record<CommandPaletteSize, number> = { sm: 384, md: 512, lg: 640 };

/**
 * The placement values, read from the spec so the two bindings cannot drift.
 *
 * The web writes them as CSS lengths (`12vh`, `min(28rem, 70vh)`); here they
 * have to become numbers, because a percentage padding in Yoga — exactly as in
 * CSS — resolves against the parent's WIDTH. `paddingTop: '12%'` therefore
 * offset the panel by a fraction of the window's width, which on a wide desktop
 * pushed it far lower than the web and on a narrow phone far higher. Measuring
 * the overlay and multiplying its height is the only way to mean "12% down".
 */
const vhRatio = (value: string | undefined, fallback: number): number => {
  const match = /^([\d.]+)vh$/.exec(value ?? '');
  return match ? Number(match[1]) / 100 : fallback;
};
const remPx = (value: string | undefined, fallback: number): number => {
  const match = /^([\d.]+)rem$/.exec(value ?? '');
  return match ? Number(match[1]) * 16 : fallback;
};

const TOP_RATIO = vhRatio(BOX.topOffset, 0.12);
const MAX_HEIGHT_RATIO = vhRatio(BOX.maxHeightRatio, 0.7);
const MAX_HEIGHT_CAP = remPx(BOX.maxHeightCap, 448);

/** The overlay measures itself; the shim leaves onLayout off ViewProps. */
type LayoutEvent = { nativeEvent: { layout: { height: number } } };
const Overlay = View as unknown as ComponentType<ViewProps & { onLayout?: (event: LayoutEvent) => void }>;

/** The palette's own labels, mirroring the web kit's kitMessages defaults. */
const DEFAULT_PLACEHOLDER = 'Type a command or search…';
const DEFAULT_EMPTY = 'No matching commands';
const DEFAULT_HINT = '↑↓ to navigate · ↵ to run · esc to close';
const LABEL = 'Command palette';

/**
 * The Glacier CommandPalette, rendered with React Native primitives. See the
 * file header for the parity contract.
 */
export function CommandPalette({
  open,
  onOpenChange,
  commands,
  onRun,
  query: queryProp,
  defaultQuery = '',
  onQueryChange,
  placeholder,
  emptyLabel,
  footer,
  size = 'md',
  shortcut: _shortcut = true,
}: CommandPaletteProps) {
  const [query, setQuery] = useControlled({
    value: queryProp,
    defaultValue: defaultQuery,
    onChange: onQueryChange,
  });

  const matches = useMemo(() => matchCommands(commands, query), [commands, query]);
  const groups = useMemo(() => groupCommands(matches), [matches]);

  const [cursor, setCursor] = useState(0);
  // Drives the top offset and the height cap, both of which are fractions of
  // the overlay's height rather than its width.
  const [overlayHeight, setOverlayHeight] = useState(0);

  // Every keystroke rebuilds the list, so the cursor is re-seated on the new top
  // row rather than keeping an index that now points at a different command.
  useEffect(() => setCursor(firstCommandCursor(matches)), [matches]);

  // Opening is the palette's reset point, so a stale query cannot hide the list
  // behind a search the user has already forgotten.
  useEffect(() => {
    if (open && queryProp === undefined) setQuery(defaultQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open is the trigger
  }, [open]);

  const run = (index: number) => {
    const match = matches[index];
    if (!match || match.item.disabled) return;
    // Close first, so a command that opens a dialog of its own is not racing
    // this overlay's teardown.
    onOpenChange(false);
    onRun(match.item.id);
  };

  const gap = t(bare(BOX.gap) ?? 'space-1');
  const padding = t(bare(BOX.padding) ?? 'space-2');
  const radius = t(bare(BOX.radius) ?? 'radius-2xl');

  // The Modal is always mounted and driven by `visible`, rather than
  // conditionally mounted with `visible` pinned true. On react-native-web the
  // overlay's enter path keys off a false→true transition of `visible`; a Modal
  // that mounts already-visible never sees that edge and its portal stays empty,
  // so the palette "opened" in state but nothing appeared. Driving `visible`
  // fixes the web docs and is the same contract native RN expects.
  return (
    <RNModal visible={open} transparent animationType="fade" onRequestClose={() => onOpenChange(false)}>
      <Overlay
        onLayout={(event) => setOverlayHeight(event.nativeEvent.layout.height)}
        style={{
          flex: 1,
          alignItems: 'center',
          paddingTop: overlayHeight * TOP_RATIO,
          paddingHorizontal: t('space-6'),
        }}
      >
        {/* Scrim: pressing it closes the palette. */}
        <Pressable
          onPress={() => onOpenChange(false)}
          style={[StyleSheet.absoluteFill, { backgroundColor: t('overlay') }]}
        />
        {/* Panel: a sibling above the scrim, so pressing it does not dismiss. */}
        <View
          accessibilityLabel={LABEL}
          aria-label={LABEL}
          style={{
            width: '100%',
            maxWidth: MAX_WIDTH[size] ?? MAX_WIDTH.md,
            // The web's `min(28rem, 70vh)`, computed. Before the overlay has
            // measured, the absolute cap alone is the safe answer: it can only
            // ever be too small, never taller than the screen.
            maxHeight: overlayHeight > 0 ? Math.min(MAX_HEIGHT_CAP, overlayHeight * MAX_HEIGHT_RATIO) : MAX_HEIGHT_CAP,
            rowGap: t('space-2'),
            padding,
            borderWidth: t('hairline'),
            borderStyle: 'solid',
            borderColor: PANEL_BORDER,
            borderRadius: radius,
            backgroundColor: PANEL_BG,
          }}
        >
          <SearchField
            value={query}
            onValueChange={setQuery}
            placeholder={placeholder ?? DEFAULT_PLACEHOLDER}
            autoFocus
            // Enter runs what the cursor is on. onSubmitEditing is the RN way to
            // hear the return key; onKeyPress carries the arrows where a
            // hardware keyboard delivers them.
            onSubmitEditing={() => run(cursor)}
            onKeyPress={(event) => {
              const key = event.nativeEvent.key;
              if (key === 'ArrowDown') setCursor((c) => moveCommandCursor(matches, c, 1));
              else if (key === 'ArrowUp') setCursor((c) => moveCommandCursor(matches, c, -1));
            }}
          />

          {matches.length === 0 ? (
            <View style={{ paddingVertical: t('space-6'), paddingHorizontal: t('space-3'), alignItems: 'center' }}>
              <Text tone="subtle" size="sm">
                {emptyLabel ?? DEFAULT_EMPTY}
              </Text>
            </View>
          ) : (
            <ScrollView style={{ flexShrink: 1 }} keyboardShouldPersistTaps="always">
              {groups.map((group) => (
                <View key={group.group ?? ' ungrouped'}>
                  {group.group != null && (
                    <View
                      style={{
                        paddingTop: t('space-2'),
                        paddingBottom: t('space-1'),
                        paddingHorizontal: t('space-3'),
                      }}
                    >
                      <Text tone="subtle" size="xs">
                        {group.group.toUpperCase()}
                      </Text>
                    </View>
                  )}
                  {group.matches.map((match) => (
                    <Pressable
                      key={match.item.id}
                      accessibilityRole="button"
                      accessibilityState={{ disabled: match.item.disabled, selected: match.index === cursor }}
                      disabled={match.item.disabled}
                      // The press moves the cursor as well as running the
                      // command, so the highlight and the action never disagree.
                      onPress={() => {
                        setCursor(match.index);
                        run(match.index);
                      }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        columnGap: t('space-3'),
                        paddingVertical: t('space-2'),
                        paddingHorizontal: t('space-3'),
                        borderRadius: t(bare(BOX.rowRadius) ?? 'radius-md'),
                        backgroundColor: match.index === cursor ? ACTIVE_BG : 'transparent',
                      }}
                    >
                      <View style={{ flexShrink: 1, flexGrow: 1, flexDirection: 'row' }}>
                        <Text size="sm" numberOfLines={1} tone={match.item.disabled ? DISABLED_TONE : undefined}>
                          {match.matchedKeyword ?? match.item.label}
                        </Text>
                        {/* When the query hit a keyword, the keyword leads and
                            the label trails as context. */}
                        {match.matchedKeyword != null && (
                          <Text tone="subtle" size="sm" numberOfLines={1}>
                            {` · ${match.item.label}`}
                          </Text>
                        )}
                      </View>
                      {match.item.shortcut != null && <Kbd>{match.item.shortcut}</Kbd>}
                    </Pressable>
                  ))}
                </View>
              ))}
              <View style={{ height: gap }} />
            </ScrollView>
          )}

          {footer !== null && (
            <View
              style={{
                paddingTop: t('space-2'),
                paddingBottom: t('space-1'),
                paddingHorizontal: t('space-3'),
                borderTopWidth: t('hairline'),
                borderTopColor: t('border'),
                borderStyle: 'solid',
              }}
            >
              {footer ?? (
                <Text tone="subtle" size="xs">
                  {DEFAULT_HINT}
                </Text>
              )}
            </View>
          )}
        </View>
      </Overlay>
    </RNModal>
  );
}
