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
import { useEffect, useMemo, useState, type ComponentProps, type ReactNode } from 'react';
import { View, Pressable, ScrollView, Modal as RNModal, StyleSheet } from 'react-native';
import { commandPaletteSizes, commandPaletteSpec } from '@glacier/spec';
import {
  firstCommandCursor,
  groupCommands,
  highlightSegments,
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

/** Which dimension holds each size step's panel width. */
const WIDTH_KEY: Record<CommandPaletteSize, string> = {
  sm: 'widthSm',
  md: 'widthMd',
  lg: 'widthLg',
};

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
/**
 * A resolved measurement. The spec mixes tokenized dimensions (`space-2`) with
 * raw CSS lengths (`12vh`, `min(28rem, 70vh)`, the per-size `32rem` widths).
 * A token name is wrapped in its custom property; anything starting with a
 * digit, a dot, or a CSS function passes straight through, so both bindings use
 * the identical string.
 *
 * This is why the widths are not numbers: the stylesheet writes them in rem, so
 * they follow the reader's text-size preference. A pixel constant here matched
 * only at the default scale — which is exactly how the native panel ended up
 * wider than the web one.
 */
function metric(value: string | undefined, fallback: string): string {
  const v = value ?? fallback;
  return /^[.\d]|^(min|max|calc|clamp)\(/.test(v) ? v : t(v);
}

/** The palette's own labels, mirroring the web kit's kitMessages defaults. */
const DEFAULT_PLACEHOLDER = 'Type a command or search…';
const DEFAULT_EMPTY = 'No matching commands';
const DEFAULT_HINT = '↑↓ to navigate · ↵ to run · esc to close';
const LABEL = 'Command palette';


/**
 * Marks the characters that answered the query. The split comes from
 * @glacier/logic, the same call the DOM palette makes, so both bindings mark the
 * same runs; only the paint differs. The mark rides Text's own `accent` tone and
 * `semibold` weight rather than a hand-set colour, so it stays in the kit's
 * vocabulary and re-themes with everything else.
 *
 * Nested <Text> is React Native's way to carry a run of differing style inside
 * one line, and it keeps the whole label a single line box so `numberOfLines`
 * still truncates it as one string.
 */
function Highlight({
  text,
  query,
  tone,
}: {
  text: string;
  query: string;
  tone?: ComponentProps<typeof Text>['tone'];
}) {
  const segments = highlightSegments(text, query);
  return (
    <Text size="sm" numberOfLines={1} tone={tone}>
      {segments.map((segment, i) =>
        segment.match ? (
          // A disabled row is quiet by definition, so the mark there carries
          // weight only — a bright accent inside it would read as actionable.
          <Text key={i} size="sm" tone={tone === undefined ? 'accent' : tone} weight="semibold">
            {segment.text}
          </Text>
        ) : (
          segment.text
        ),
      )}
    </Text>
  );
}

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
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          paddingTop: metric(BOX.topOffset, '12vh'),
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
            maxWidth: metric(BOX[WIDTH_KEY[size] ?? 'widthMd'], '32rem'),
            maxHeight: metric(BOX.maxHeight, 'min(28rem, 70vh)'),
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
                // Keyed by the flat index of its first row, not the group name.
                // `groupCommands` builds groups from ADJACENT runs, so one name can
                // legitimately head several groups in an interleaved list. Keying by name
                // then hands React duplicate keys, and its reconciliation leaves whole
                // stale runs mounted when a query narrows the list — the palette keeps
                // showing rows that no longer match. The first index is unique.
                <View key={group.matches[0]?.index ?? -1}>
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
                        <Highlight
                          text={match.matchedKeyword ?? match.item.label}
                          query={query}
                          tone={match.item.disabled ? DISABLED_TONE : undefined}
                        />
                        {/* When the query hit a keyword, the keyword leads and
                            the label trails as context. */}
                        {match.matchedKeyword != null && (
                          <Highlight text={` · ${match.item.label}`} query={query} tone="subtle" />
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
      </View>
    </RNModal>
  );
}
