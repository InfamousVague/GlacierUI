/**
 * @glacier/native — MentionAutocomplete.
 *
 * The React Native binding of @glacier/react's @-popup. The matching is the
 * command palette's, reached through `mentionMatches` in @glacier/logic — the
 * same substring rule, the same keyword fallback, the same flat indices — so a
 * query narrows the same list in the same order on both platforms. Paint and
 * geometry come from the mention-autocomplete spec through the shared
 * resolvers.
 *
 * KEY HANDLING DIVERGES SHARPLY. On the web the popup is driven entirely from
 * the input: ArrowUp/ArrowDown move a cursor, Enter or Tab completes, Escape
 * closes, and focus never moves — the list is named by
 * `aria-activedescendant`. React Native's TextInput reports no arrow keys and
 * has no active-descendant concept at all, so:
 *
 * - **The cursor is a pointer affordance here.** Rows are pressed; the
 *   `cursor` / `onCursorChange` props are still honoured so a host with a
 *   hardware keyboard can drive them, but the runtime supplies no key events to
 *   drive them from.
 * - The popup floats above the input (`bottom: 100%`) exactly as on the web, so
 *   it never covers the token being typed or the software keyboard.
 * - The web's fade-and-lift entrance is a device follow-up; this renders the
 *   resting open popup.
 */

import { type ComponentType, type ReactNode } from 'react';
import { ScrollView, View, Text as RNText, Pressable, type PressableProps } from 'react-native';
import { groupCommands } from '@glacier/logic';
import { mentionMatches, type MentionCandidate, type MentionTrigger } from '@glacier/logic';
// TODO(integration): switch to '@glacier/spec' once the compose specs are registered.
import { mentionAutocompleteSpec } from '../../../../spec/src/components/mention-autocomplete.ts';
import { t } from '../../tokens.ts';
import { paintFor, dimensionsFor } from '../../resolve.ts';

export type { MentionCandidate, MentionTrigger };

export interface MentionAutocompleteProps {
  open: boolean;
  query?: string;
  trigger?: MentionTrigger;
  candidates: readonly MentionCandidate[];
  cursor: number;
  onCursorChange?: (index: number) => void;
  onChoose: (id: string) => void;
  emptyLabel?: ReactNode;
}

// The permissive react-native d.ts declares no onPressIn, and a row has to move
// the cursor on touch-down rather than on release, so it is typed through a
// narrow local alias.
const Row = Pressable as unknown as ComponentType<PressableProps & { onPressIn?: () => void }>;

const DIMS = dimensionsFor(mentionAutocompleteSpec);

function metric(value: string | undefined, fallback: string): string {
  const v = value ?? fallback;
  return /^[.\d]/.test(v) ? v : t(v);
}

export function MentionAutocomplete({
  open,
  query = '',
  trigger = '@',
  candidates,
  cursor,
  onCursorChange,
  onChoose,
  emptyLabel,
}: MentionAutocompleteProps) {
  if (!open) return null;

  const matches = mentionMatches(candidates, query);
  const groups = groupCommands(matches);
  const active = paintFor(mentionAutocompleteSpec, 'states', 'active');

  return (
    <View
      accessibilityRole="list"
      aria-label={trigger === '/' ? 'Command suggestions' : 'Mention suggestions'}
      style={{
        position: 'absolute',
        // Above the input, never below it: a popup under the field sits behind
        // the software keyboard.
        bottom: '100%',
        start: 0,
        marginBottom: t('space-2'),
        zIndex: 1,
        minWidth: 224,
        maxWidth: 352,
        maxHeight: 256,
        padding: metric(DIMS.padding, 'space-1'),
        borderWidth: t('hairline'),
        borderColor: t('border'),
        borderRadius: metric(DIMS.radius, 'radius-lg'),
        backgroundColor: t('surface-raised'),
      }}
    >
      {matches.length === 0 ? (
        // Stays open on no matches rather than blinking out mid-name.
        <RNText style={{ padding: t('space-2'), color: t('text-subtle'), fontSize: t('font-size-sm') }}>
          {emptyLabel ?? 'No matches'}
        </RNText>
      ) : (
        <ScrollView>
          {groups.map((group) => (
            <View key={group.group ?? ' ungrouped'}>
              {group.group && (
                <RNText
                  style={{
                    paddingVertical: t('space-1'),
                    paddingHorizontal: t('space-2'),
                    color: t('text-subtle'),
                    fontSize: t('font-size-xs'),
                  }}
                >
                  {group.group}
                </RNText>
              )}
              {group.matches.map((match) => {
                const isActive = match.index === cursor;
                return (
                  <Row
                    key={match.item.id}
                    accessibilityRole="menuitem"
                    accessibilityState={{ selected: isActive, disabled: match.item.disabled }}
                    disabled={match.item.disabled}
                    onPressIn={() => onCursorChange?.(match.index)}
                    onPress={() => onChoose(match.item.id)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: t('space-2'),
                      paddingVertical: metric(DIMS.optionPaddingBlock, 'space-2'),
                      paddingHorizontal: metric(DIMS.optionPaddingInline, 'space-2'),
                      borderRadius: metric(DIMS.optionRadius, 'radius-md'),
                      backgroundColor: isActive ? t(active.background ?? 'accent-soft') : 'transparent',
                    }}
                  >
                    <RNText
                      numberOfLines={1}
                      style={{
                        flex: 1,
                        color: match.item.disabled
                          ? t('text-subtle')
                          : isActive
                            ? t(active.text ?? 'accent-text')
                            : t('text'),
                        fontSize: t('font-size-sm'),
                      }}
                    >
                      {match.item.label}
                    </RNText>
                    {match.item.handle && (
                      <RNText style={{ color: t('text-muted'), fontSize: t('font-size-xs') }}>
                        {match.item.handle}
                      </RNText>
                    )}
                  </Row>
                );
              })}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
