/**
 * @glacier/native — CharacterCounter.
 *
 * The React Native binding of @glacier/react's counter: the countdown that only
 * appears near the limit. When it appears, how far it has to go, and which of
 * the four levels it is at are all decided by `characterCounterState` in
 * @glacier/logic — the identical call the DOM kit makes — and the per-level
 * paint is read from the character-counter spec through the shared resolvers.
 *
 * As on the web, this is NOT a Meter: a countdown that can go negative and that
 * is absent for most of a message is not a level indicator with a fixed set of
 * pips.
 *
 * Divergences:
 * - No `role="status"`. `accessibilityLiveRegion="polite"` is the Android
 *   equivalent; on iOS the value is read on focus instead of on change.
 * - The colour step between levels cross-fades on the web; here it switches, as
 *   this binding runs no animations.
 */

import { type ComponentType } from 'react';
import { Text as RNText, type TextProps } from 'react-native';
import { characterCounterState } from '@glacier/logic';
// TODO(integration): switch to '@glacier/spec' once the compose specs are registered.
import {
  characterCounterLevels,
  characterCounterSpec,
} from '../../../../spec/src/components/character-counter.ts';
import { t } from '../../tokens.ts';
import { paintFor } from '../../resolve.ts';
import { Skeleton } from '../../atoms/feedback/Skeleton.tsx';

// Derived from the spec so the level union cannot drift from the web kit.
export type CharacterCounterLevel = (typeof characterCounterLevels)[number];

// The permissive react-native d.ts declares no accessibilityLiveRegion (the
// platform's nearest thing to the web role=status), so the readout is typed
// through a narrow local alias.
type LiveText = ComponentType<TextProps & { accessibilityLiveRegion?: 'none' | 'polite' | 'assertive' }>;
const Live = RNText as unknown as LiveText;

export interface CharacterCounterProps {
  /** Characters used; count them with countCharacters, not String.length. */
  length: number;
  /** The cap. Zero or less turns the counter off entirely. */
  limit: number;
  threshold?: number;
  showAlways?: boolean;
  skeleton?: boolean;
}

export function CharacterCounter({
  length,
  limit,
  threshold,
  showAlways = false,
  skeleton = false,
}: CharacterCounterProps) {
  const { level, remaining, visible } = characterCounterState(length, limit, { threshold, showAlways });

  if (skeleton) return <Skeleton variant="text" width={40} />;
  // Not an empty box: no box.
  if (!visible) return null;

  const paint = paintFor(characterCounterSpec, 'states', level);
  const label =
    remaining < 0 ? `${-remaining} characters over the limit` : `${remaining} characters left`;

  return (
    <Live
      accessibilityLiveRegion="polite"
      aria-label={label}
      style={{
        color: t(paint.text ?? 'text-muted'),
        fontFamily: t('font-mono'),
        fontSize: t('font-size-xs'),
        fontVariant: ['tabular-nums'],
      }}
    >
      {remaining}
    </Live>
  );
}
