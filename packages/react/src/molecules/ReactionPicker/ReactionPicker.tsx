import {
  defaultEmojiSet,
  frequentReactions,
  moveGridCursor,
  searchEmoji,
  REACTION_PICKER_COLUMNS,
  type EmojiEntry,
} from '@glacier/logic';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ComponentProps,
  type KeyboardEvent,
} from 'react';
import { cx } from '../../internal/cx.ts';
import { resolveDirection } from '../../internal/direction.ts';
import { useControlled } from '../../internal/useControlled.ts';
import { useT } from '../../i18n/LocaleProvider.tsx';
import { reactionMessages } from '../../i18n/reactionMessages.ts';
import { IconButton } from '../../atoms/inputs/Button/IconButton.tsx';
import { SearchField } from '../../atoms/inputs/SearchField/SearchField.tsx';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import { Text } from '../../atoms/display/Typography/Text.tsx';
import styles from './ReactionPicker.module.css';

export type { EmojiEntry };

/**
 * A roving tabindex over one group of cells.
 *
 * Local to the picker rather than shared, because the only thing worth sharing
 * is the cursor arithmetic and that already lives in `moveGridCursor`. Each
 * group gets its own instance, so the frequent row and the grid are two tab
 * stops that navigate independently instead of one 48-cell run.
 */
function useRovingCells(count: number, columns: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    setCursor((c) => (c >= count ? Math.max(0, count - 1) : c));
  }, [count]);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const rtl = resolveDirection(ref.current) === 'rtl';
      const next = moveGridCursor(cursor, event, count, { columns, rtl });
      if (next === cursor && !['Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      setCursor(next);
      ref.current?.querySelectorAll<HTMLElement>('button')[next]?.focus();
    },
    [cursor, count, columns],
  );

  return { ref, cursor, onKeyDown };
}

export interface ReactionPickerLabels {
  picker: string;
  search: string;
  frequent: string;
  all: string;
  empty: string;
}

export interface ReactionPickerProps extends Omit<ComponentProps<'div'>, 'onSelect'> {
  /**
   * The choosable set. A prop with a small default, never a bundled dataset —
   * see `defaultEmojiSet` in commons for why a design system must not own the
   * emoji table.
   */
  emojis?: readonly EmojiEntry[];
  /** The frequently-used row, as glyphs. Pass the viewer's own; defaults to the shared eight. */
  frequent?: readonly string[];
  /** Grid width, and the vertical arrow stride. */
  columns?: number;
  /** Controlled search text. */
  query?: string;
  defaultQuery?: string;
  onQueryChange?: (query: string) => void;
  /** Called with the chosen glyph. */
  onSelect?: (emoji: string) => void;
  /** Glyphs the viewer already used here; their cells report aria-pressed. */
  reacted?: readonly string[];
  /** Translated strings; merged over the catalog defaults. */
  labels?: Partial<ReactionPickerLabels>;
  /** Renders a placeholder with the panel's exact geometry. */
  skeleton?: boolean;
}

/**
 * The emoji chooser: a frequently-used row over a searchable grid.
 *
 * Scope is deliberate. The emoji SET is a prop, because a usable one is
 * localised, skin-toned, grouped, and versioned against whatever Unicode
 * release the platform's font actually shipped — an app's data, on an app's
 * update schedule. What the kit owns is the interaction: what opens first, how
 * a query narrows it, how the arrows walk a grid, and how each cell announces
 * itself.
 *
 * Cells are IconButtons rather than a bespoke square control, and every one is
 * named by its emoji NAME, never the glyph: screen readers announce unlabelled
 * emoji inconsistently, and voice control cannot say a picture — "thumbs up"
 * has to be both the label and the command.
 *
 * Three tab stops: the search field, the frequent row, the grid. Forty stops
 * inside a popover would make Escape the only usable way out.
 */
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
  skeleton = false,
  className,
  style,
  ...rest
}: ReactionPickerProps) {
  const t = useT();
  const [text, setText] = useControlled(query, defaultQuery);

  const strings: ReactionPickerLabels = {
    picker: labels?.picker ?? t(reactionMessages.reactionPicker),
    search: labels?.search ?? t(reactionMessages.reactionPickerSearch),
    frequent: labels?.frequent ?? t(reactionMessages.reactionPickerFrequent),
    all: labels?.all ?? t(reactionMessages.reactionPickerAll),
    empty: labels?.empty ?? t(reactionMessages.reactionPickerEmpty),
  };

  const results = searchEmoji(emojis, text);
  // A "frequently used" shortcut is noise the moment you have said what you
  // want, so the row goes away as soon as a query exists.
  const searching = text.trim() !== '';
  const frequentEntries: EmojiEntry[] = frequent
    .slice(0, columns)
    .map((emoji) => emojis.find((e) => e.emoji === emoji) ?? { emoji, name: emoji });

  const frequentRoving = useRovingCells(frequentEntries.length, columns);
  const gridRoving = useRovingCells(results.length, columns);

  const gridStyle = { '--reaction-columns': columns, ...style } as CSSProperties;
  const isReacted = (emoji: string) => reacted?.includes(emoji) === true;

  const cell = (entry: EmojiEntry, index: number, cursor: number) => (
    <IconButton
      key={entry.emoji}
      variant="ghost"
      aria-label={entry.name}
      aria-pressed={isReacted(entry.emoji)}
      data-emoji={entry.emoji}
      tabIndex={index === cursor ? 0 : -1}
      onClick={() => onSelect?.(entry.emoji)}
    >
      <span className={styles.cell} aria-hidden="true">
        {entry.emoji}
      </span>
    </IconButton>
  );

  if (skeleton) {
    return (
      <div className={cx(styles.picker, className)} style={gridStyle} aria-hidden="true" {...rest}>
        <SearchField skeleton />
        <div className={styles.grid}>
          {Array.from({ length: columns * 3 }, (_, i) => (
            <Skeleton key={i} width="100%" height="var(--glacier-control-height-md)" radius="var(--glacier-control-radius)" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label={strings.picker}
      className={cx(styles.picker, className)}
      style={gridStyle}
      {...rest}
    >
      <SearchField
        value={text}
        placeholder={strings.search}
        aria-label={strings.search}
        onValueChange={(next) => {
          setText(next);
          onQueryChange?.(next);
        }}
      />

      {!searching && frequentEntries.length > 0 && (
        <div className={styles.section}>
          <Text size="xs" tone="subtle" aria-hidden="true">
            {strings.frequent}
          </Text>
          <div
            ref={frequentRoving.ref}
            role="group"
            aria-label={strings.frequent}
            className={styles.grid}
            onKeyDown={frequentRoving.onKeyDown}
          >
            {frequentEntries.map((entry, index) => cell(entry, index, frequentRoving.cursor))}
          </div>
        </div>
      )}

      <div className={styles.section}>
        {!searching && (
          <Text size="xs" tone="subtle" aria-hidden="true">
            {strings.all}
          </Text>
        )}
        {results.length === 0 ? (
          // One quiet line, not an illustration: the fix is to retype, and a
          // large empty state pushes the search field off a phone screen.
          <Text size="sm" tone="subtle" className={styles.empty}>
            {strings.empty}
          </Text>
        ) : (
          <div
            ref={gridRoving.ref}
            role="group"
            aria-label={strings.all}
            className={styles.grid}
            onKeyDown={gridRoving.onKeyDown}
          >
            {results.map((entry, index) => cell(entry, index, gridRoving.cursor))}
          </div>
        )}
      </div>
    </div>
  );
}
