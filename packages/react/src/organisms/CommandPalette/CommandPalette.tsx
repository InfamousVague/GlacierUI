import { motion, useReducedMotion } from 'motion/react';
import { Spring, springTransition } from '@glacier/motion';
import { Size, TextTone } from '@glacier/spec';
import {
  firstCommandCursor,
  groupCommands,
  highlightSegments,
  isCommandShortcut,
  matchCommands,
  moveCommandCursor,
  useControlled,
  type CommandDescriptor,
} from '@glacier/logic';
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../internal/cx.ts';
import { useDialogLayer } from '../../internal/useDialogLayer.ts';
import { useT } from '../../i18n/LocaleProvider.tsx';
import { kitMessages } from '../../i18n/messages.ts';
import { SearchField } from '../../atoms/inputs/SearchField/SearchField.tsx';
import { Kbd } from '../../atoms/display/Typography/Kbd.tsx';
import { Text } from '../../atoms/display/Typography/Text.tsx';
import styles from './CommandPalette.module.css';

export type { CommandDescriptor } from '@glacier/logic';

export interface CommandPaletteProps {
  open: boolean;
  /** Called with false when the user dismisses, or runs a command. */
  onOpenChange: (open: boolean) => void;
  /**
   * Every command the palette can run, in the order they should be offered.
   * Priority is the caller's to decide - the palette filters and groups but
   * never reorders.
   */
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
  size?: 'sm' | 'md' | 'lg';
  /** Binds ⌘K / Ctrl+K globally. Turn it off to own the chord yourself. */
  shortcut?: boolean;
}


/**
 * Marks the characters that answered the query. The split itself is shared with
 * the native palette so both mark the same runs; this only paints them.
 */
function Highlight({ text, query }: { text: string; query: string }) {
  const segments = highlightSegments(text, query);
  return (
    <>
      {segments.map((segment, i) =>
        segment.match ? (
          <mark key={i} className={styles.mark}>
            {segment.text}
          </mark>
        ) : (
          <span key={i}>{segment.text}</span>
        ),
      )}
    </>
  );
}

/**
 * A ⌘K overlay that searches every action in the app.
 *
 * One text field drives the whole surface: typing narrows the list, the arrow
 * keys move a cursor through it, and Enter runs what the cursor is on. Focus
 * never leaves the field - the active row is named by `aria-activedescendant`
 * rather than focused, which is what lets a single input control a list.
 *
 * Matching, grouping, and cursor movement all live in @glacier/logic, so this
 * component is only the surface: the native palette answers the same query with
 * the same list in the same order.
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
  shortcut = true,
}: CommandPaletteProps) {
  const t = useT();
  const [query, setQuery] = useControlled({
    value: queryProp,
    defaultValue: defaultQuery,
    onChange: onQueryChange,
  });
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const reduce = useReducedMotion();

  const matches = useMemo(() => matchCommands(commands, query), [commands, query]);
  const groups = useMemo(() => groupCommands(matches), [matches]);

  const [cursor, setCursor] = useState(0);

  // Every keystroke rebuilds the list, so the cursor has to be re-seated on the
  // new top row - otherwise it keeps an index that now points at a different
  // command, and Enter runs something the user never looked at.
  useEffect(() => setCursor(firstCommandCursor(matches)), [matches]);

  // Opening is the palette's reset point: a stale query from last time would
  // hide most of the list behind a search the user has already forgotten.
  useEffect(() => {
    if (open && queryProp === undefined) setQuery(defaultQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open is the trigger; re-running on query would fight the user's typing
  }, [open]);

  useDialogLayer({ open, onClose: () => onOpenChange(false), dialogRef: panelRef, initialFocusRef: inputRef });

  // ⌘K from anywhere. Bound whenever the palette is mounted rather than only
  // while closed, so the chord is a no-op on an open palette instead of the
  // browser's own find-in-page.
  useEffect(() => {
    if (!shortcut) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (!isCommandShortcut(event)) return;
      event.preventDefault();
      onOpenChange(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [shortcut, onOpenChange]);

  const run = (index: number) => {
    const match = matches[index];
    if (!match || match.item.disabled) return;
    // Close first: a command that opens a dialog of its own should not have to
    // race this overlay's teardown for the focus.
    onOpenChange(false);
    onRun(match.item.id);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setCursor((current) => moveCommandCursor(matches, current, event.key === 'ArrowDown' ? 1 : -1));
    } else if (event.key === 'Home') {
      event.preventDefault();
      setCursor(firstCommandCursor(matches));
    } else if (event.key === 'End') {
      event.preventDefault();
      // step backwards from the top to land on the last runnable row
      setCursor(moveCommandCursor(matches, 0, -1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      run(cursor);
    }
    // Escape is left to useDialogLayer, so the palette closes on the same key
    // path as every other dialog in the kit.
  };

  if (!open) return null;

  const activeId = matches[cursor] ? `${listId}-${cursor}` : undefined;

  return createPortal(
    <motion.div
      className={styles.overlay}
      onClick={() => onOpenChange(false)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={reduce ? { duration: 0 } : { duration: 0.15 }}
    >
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t(kitMessages.commandPaletteLabel)}
        className={cx(styles.panel, styles[size])}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={reduce ? { duration: 0 } : springTransition(Spring.Snappy)}
      >
        <SearchField
          ref={inputRef}
          className={styles.query}
          value={query}
          onValueChange={setQuery}
          onKeyDown={onKeyDown}
          placeholder={placeholder ?? t(kitMessages.commandPalettePlaceholder)}
          role="combobox"
          aria-expanded
          aria-controls={listId}
          aria-activedescendant={activeId}
          aria-label={t(kitMessages.commandPaletteLabel)}
        />

        {matches.length === 0 ? (
          <div className={styles.empty}>
            <Text tone={TextTone.Subtle} size={Size.Small}>
              {emptyLabel ?? t(kitMessages.commandPaletteEmpty)}
            </Text>
          </div>
        ) : (
          <ul className={styles.list} id={listId} role="listbox" aria-label={t(kitMessages.commandPaletteLabel)}>
            {groups.map((group) => (
              // Keyed by the flat index of its first row, not the group name.
              // `groupCommands` builds groups from ADJACENT runs, so one name can
              // legitimately head several groups in an interleaved list. Keying by name
              // then hands React duplicate keys, and its reconciliation leaves whole
              // stale runs mounted when a query narrows the list - the palette keeps
              // showing rows that no longer match. The first index is unique.
              <li key={group.matches[0]?.index ?? -1} role="presentation">
                {/* Presentational: the option order already carries the
                    grouping for anyone reading top to bottom. */}
                {group.group && (
                  <div className={styles.group} aria-hidden="true">
                    {group.group}
                  </div>
                )}
                <ul role="presentation" className={styles.groupList}>
                  {group.matches.map((match) => (
                    <li key={match.item.id} role="presentation">
                      <div
                        id={`${listId}-${match.index}`}
                        role="option"
                        aria-selected={match.index === cursor}
                        aria-disabled={match.item.disabled || undefined}
                        className={styles.option}
                        data-active={match.index === cursor || undefined}
                        data-disabled={match.item.disabled || undefined}
                        // Hover moves the cursor rather than adding a second
                        // highlight, so there is only ever one row that Enter
                        // and a click agree on.
                        onMouseMove={() => !match.item.disabled && setCursor(match.index)}
                        // mousedown, not click: click fires after blur, and the
                        // field losing focus mid-press would tear the overlay
                        // down before the command ran.
                        onMouseDown={(event) => {
                          event.preventDefault();
                          run(match.index);
                        }}
                      >
                        <span className={styles.label}>
                          <Highlight text={match.matchedKeyword ?? match.item.label} query={query} />
                          {match.matchedKeyword && (
                            <span className={styles.context}>
                              {' · '}
                              <Highlight text={match.item.label} query={query} />
                            </span>
                          )}
                        </span>
                        {match.item.shortcut && (
                          <Kbd className={styles.shortcut}>
                            {match.item.shortcut}
                          </Kbd>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}

        {footer !== null && (
          <div className={styles.footer}>
            {footer ?? (
              <Text tone={TextTone.Subtle} size={Size.XSmall}>
                {t(kitMessages.commandPaletteHint)}
              </Text>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>,
    document.body,
  );
}
