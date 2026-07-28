/**
 * @glacier/native — ReactionPicker.
 *
 * The React Native binding of @glacier/react's ReactionPicker: a
 * frequently-used row over a searchable grid. The emoji set, the default
 * frequent eight, the column count, and the search itself all come from
 * @glacier/logic, so a native picker narrows a query and orders its results
 * identically to a DOM one. Geometry (the panel gap and padding, the cell size,
 * radius, and gap) is read from the reaction-picker spec through the shared
 * resolvers.
 *
 * Web-parity notes (resting visuals only):
 * - **No hover, no focus ring, no arrow keys.** The web's roving-tabindex grid,
 *   its `hover` wash, and its `focus-visible` ring have no touch equivalent and
 *   are not painted; the press dip is the feedback. Cells still carry their
 *   accessible NAME rather than the glyph, which is the part that matters most
 *   here — VoiceOver and TalkBack both read an unlabelled emoji unpredictably.
 * - The grid is laid out with `flexWrap` and a percentage basis rather than CSS
 *   grid, which React Native does not have; the column count is the same shared
 *   constant, so both bindings break at the same place.
 * - The web panel is transparent because a Popover paints under it; the same
 *   holds here, where the host is a sheet or the native Popover.
 */
import { View, Text as RNText, Pressable } from 'react-native';
import { useControlled, press } from '@glacier/logic';
import {
  defaultEmojiSet,
  frequentReactions,
  searchEmoji,
  defaultReactionLabels,
  REACTION_PICKER_COLUMNS,
  type EmojiEntry,
  type ReactionLabels,
} from '@glacier/logic';
// TODO(integration): switch to '@glacier/spec' once reaction-picker.ts is
// registered in packages/spec/src/index.ts.
import { reactionPickerSpec } from '../../../../spec/src/components/reaction-picker.ts';
import { t } from '../../tokens.ts';
import { paintFor, dimensionsFor } from '../../resolve.ts';
import { SearchField } from '../../atoms/inputs/SearchField.tsx';
import { Text } from '../../atoms/display/Text.tsx';

export interface ReactionPickerProps {
  emojis?: readonly EmojiEntry[];
  frequent?: readonly string[];
  columns?: number;
  query?: string;
  defaultQuery?: string;
  onQueryChange?: (query: string) => void;
  onSelect?: (emoji: string) => void;
  reacted?: readonly string[];
  labels?: Partial<ReactionLabels>;
}

const BOX = dimensionsFor(reactionPickerSpec);
const REACTED = paintFor(reactionPickerSpec, 'states', 'reacted');

function metric(value: string | undefined, fallback: string): string {
  const v = value ?? fallback;
  return /^[.\d]/.test(v) ? v : t(v);
}

export function ReactionPicker({
  emojis = defaultEmojiSet,
  frequent = frequentReactions,
  columns = REACTION_PICKER_COLUMNS,
  query,
  defaultQuery = '',
  onQueryChange,
  onSelect,
  reacted,
  labels,
}: ReactionPickerProps) {
  const strings = { ...defaultReactionLabels, ...labels };
  const [text, setText] = useControlled({ value: query, defaultValue: defaultQuery, onChange: onQueryChange });

  const results = searchEmoji(emojis, text);
  // A "frequently used" shortcut is noise the moment you have said what you
  // want, so the row goes away as soon as a query exists.
  const searching = text.trim() !== '';
  const frequentEntries: EmojiEntry[] = frequent
    .slice(0, columns)
    .map((emoji) => emojis.find((e) => e.emoji === emoji) ?? { emoji, name: emoji });

  const cellSize = metric(BOX.cellSize, 'control-height-md');
  const cellGap = metric(BOX.cellGap, 'space-1');

  const cell = (entry: EmojiEntry) => {
    const isReacted = reacted?.includes(entry.emoji) === true;
    return (
      <Pressable
        key={entry.emoji}
        accessibilityRole="button"
        // Named by the emoji NAME, never the glyph: a screen reader cannot read
        // a picture and voice control cannot say one.
        aria-label={entry.name}
        accessibilityState={{ selected: isReacted }}
        onPress={() => onSelect?.(entry.emoji)}
        style={({ pressed }) => [
          {
            width: cellSize,
            height: cellSize,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: metric(BOX.cellRadius, 'control-radius'),
            // The web's `hover` wash has no touch equivalent; the same token
            // paints the pressed cell instead, so the feedback is the kit's.
            backgroundColor: isReacted
              ? t(REACTED.background ?? 'accent-soft')
              : pressed
                ? t('hover')
                : 'transparent',
            transform: [{ scale: pressed ? press.compact : 1 }],
          },
        ]}
      >
        <RNText style={{ fontSize: t('font-size-lg') as never }}>{entry.emoji}</RNText>
      </Pressable>
    );
  };

  // React Native has no CSS grid, so the rows are a wrapping flex row whose
  // cells are fixed-size; the shared column count still decides where it breaks
  // because the panel is sized to hold exactly that many.
  const grid = (entries: readonly EmojiEntry[], label: string) => (
    <View
      accessibilityRole="none"
      aria-label={label}
      style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: cellGap, rowGap: cellGap }}
    >
      {entries.map(cell)}
    </View>
  );

  return (
    <View
      accessibilityRole="none"
      aria-label={strings.picker}
      style={{
        gap: metric(BOX.gap, 'space-2'),
        padding: metric(BOX.padding, 'space-2'),
      }}
    >
      <SearchField value={text} placeholder={strings.pickerSearch} aria-label={strings.pickerSearch} onValueChange={setText} />

      {!searching && frequentEntries.length > 0 && (
        <View style={{ gap: cellGap }}>
          <Text size="xs" tone="subtle">
            {strings.pickerFrequent}
          </Text>
          {grid(frequentEntries, strings.pickerFrequent)}
        </View>
      )}

      <View style={{ gap: cellGap }}>
        {!searching && (
          <Text size="xs" tone="subtle">
            {strings.pickerAll}
          </Text>
        )}
        {results.length === 0 ? (
          <Text size="sm" tone="subtle">
            {strings.pickerEmpty}
          </Text>
        ) : (
          grid(results, strings.pickerAll)
        )}
      </View>
    </View>
  );
}
