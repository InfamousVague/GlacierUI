import type { ComponentProps } from 'react';
import { groupCommands, type CommandMatch } from '@glacier/logic';
import { useMemo, type ReactNode } from 'react';
// TODO(integration): switch to '@glacier/spec' once the compose specs are registered.
import { mentionTriggers } from '../../../../spec/src/components/mention-autocomplete.ts';
import { mentionMatches, type MentionCandidate, type MentionTrigger } from '@glacier/logic';
import { cx } from '../../internal/cx.ts';
import { useT } from '../../i18n/LocaleProvider.tsx';
import { Text } from '../../atoms/display/Typography/Text.tsx';
import { composeMessages } from './messages.ts';
import styles from './MentionAutocomplete.module.css';

export type { MentionCandidate, MentionTrigger };
export { mentionTriggers };

export interface MentionAutocompleteProps extends Omit<ComponentProps<'div'>, 'size' | 'onChange' | 'children'> {
  /** Whether the popup is showing; driven by a token being found at the caret. */
  open: boolean;
  /** The text after the trigger character. */
  query?: string;
  /** Which token opened it. */
  trigger?: MentionTrigger;
  /** Everyone (or everything) completable, in the caller's priority order. */
  candidates: readonly MentionCandidate[];
  /** Index of the highlighted row in the flat match order. */
  cursor: number;
  onCursorChange?: (index: number) => void;
  /** Called with the chosen candidate's id. */
  onChoose: (id: string) => void;
  /** Replaces the default no-matches line. */
  emptyLabel?: ReactNode;
  /** Id for the listbox, so the input can point aria-controls at it. */
  listId?: string;
  className?: string;
}

/**
 * The popup that completes an @-mention, a #-channel, or a /-command.
 *
 * The matching is the command palette's, reached through `mentionMatches` in
 * @glacier/logic — the same substring rule, the same keyword fallback, the
 * same flat indices the arrow keys address — with the handle folded into the
 * searched text and prefix hits lifted above mid-word ones. Nothing about
 * filtering a list of people is different enough from filtering a list of
 * commands to justify a second matcher that would quietly disagree with the
 * first.
 *
 * Focus never leaves the input. This is a listbox the INPUT owns, named through
 * `aria-controls` and `aria-activedescendant`, because moving focus into a popup
 * on a phone dismisses the software keyboard in the middle of typing a name.
 * The bar's key handler moves the cursor and chooses; the popup only draws and
 * accepts the pointer.
 */
export function MentionAutocomplete({
  open,
  query = '',
  trigger = '@',
  candidates,
  cursor,
  onCursorChange,
  onChoose,
  emptyLabel,
  listId,
  className,
  ...rest
}: MentionAutocompleteProps) {
  const t = useT();
  // The same pure call the bar makes with the same inputs, so the row the bar's
  // cursor addresses is always the row drawn here.
  const matches = useMemo(() => mentionMatches(candidates, query), [candidates, query]);
  const groups = useMemo(() => groupCommands(matches), [matches]);

  if (!open) return null;

  const label = t(trigger === '/' ? composeMessages.commandList : composeMessages.mentionList);

  return (
    <div className={cx(styles.popup, className)} data-trigger={trigger} {...rest}>
      {matches.length === 0 ? (
        // The popup stays open on no matches rather than blinking out: a user
        // mid-name should be able to fix a typo, not lose the surface.
        <div className={styles.empty}>
          <Text size="sm" tone="subtle">
            {emptyLabel ?? t(composeMessages.mentionEmpty)}
          </Text>
        </div>
      ) : (
        <ul className={styles.list} id={listId} role="listbox" aria-label={label}>
          {groups.map((group) => (
            <li key={group.group ?? ' ungrouped'} role="presentation">
              {group.group && (
                <div className={styles.group} aria-hidden="true">
                  {group.group}
                </div>
              )}
              <ul role="presentation" className={styles.groupList}>
                {group.matches.map((match) => (
                  <li key={match.item.id} role="presentation">
                    <Row
                      match={match}
                      active={match.index === cursor}
                      id={listId ? `${listId}-${match.index}` : undefined}
                      onHover={() => !match.item.disabled && onCursorChange?.(match.index)}
                      onChoose={() => !match.item.disabled && onChoose(match.item.id)}
                    />
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Row({
  match,
  active,
  id,
  onHover,
  onChoose,
}: {
  match: CommandMatch<MentionCandidate>;
  active: boolean;
  id?: string;
  onHover: () => void;
  onChoose: () => void;
}) {
  const handle = match.item.handle;
  return (
    <div
      id={id}
      role="option"
      aria-selected={active}
      aria-disabled={match.item.disabled || undefined}
      className={styles.option}
      data-active={active || undefined}
      data-disabled={match.item.disabled || undefined}
      // Hover moves the cursor instead of adding a second highlight, so there
      // is only ever one row that Enter and a click agree on.
      onMouseMove={onHover}
      // mousedown, not click: click fires after blur, and the field losing focus
      // mid-press would close the popup before the completion ran.
      onMouseDown={(event) => {
        event.preventDefault();
        onChoose();
      }}
    >
      <span className={styles.label}>{match.item.label}</span>
      {handle && <span className={styles.handle}>{handle}</span>}
    </div>
  );
}
