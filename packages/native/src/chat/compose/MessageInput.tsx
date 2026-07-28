/**
 * @glacier/native — MessageInput.
 *
 * The React Native binding of @glacier/react's MessageInput: the auto-growing
 * multi-line field of a compose bar. The row math (`autoGrowMetrics`) and the
 * Enter-key policy (`resolveEnterPolicy`, `composeKeyIntent`) come from
 * @glacier/logic — the same functions the DOM kit calls — and the paint and
 * geometry are read from the message-input spec through the shared resolvers,
 * so neither the behaviour nor the box can drift from the web kit.
 *
 * KEY HANDLING DIVERGES SHARPLY, and pretending otherwise would be a lie the
 * next device bug collects on:
 *
 * - **There is no keydown.** React Native's TextInput reports `onKeyPress` with
 *   a key name and NO modifier flags at all: no shiftKey, no metaKey, no
 *   ctrlKey. Shift+Enter and Cmd/Ctrl+Enter — both load-bearing on the web —
 *   are simply not expressible here. A hardware keyboard attached to a tablet
 *   can send them; the runtime does not tell us.
 * - So the policy resolves ONCE, to `newline`, via `resolveEnterPolicy(policy,
 *   { touch: true })`. On a device the return key is under the thumb and must
 *   insert a line; the SendButton is the send affordance, which is exactly why
 *   it is never hidden. An explicit `enterPolicy="send"` is still honoured
 *   through `onSubmitEditing` with `blurOnSubmit={false}`, for a tablet build
 *   that wants it.
 * - **There is no IME `isComposing` flag** either. The suppression the web
 *   binding does for Japanese and Chinese candidates is unnecessary here only
 *   because the default policy never sends on return; under `enterPolicy="send"`
 *   on a device with an IME, the platform's own commit behaviour is what applies.
 * - **Paste carries no files.** There is no clipboard file API, so
 *   `onPasteFiles` is accepted-but-inert; a device build attaches through the
 *   document picker instead.
 *
 * Growth is measured from `onContentSizeChange` rather than `scrollHeight`, then
 * clamped by the same `autoGrowMetrics` the DOM path uses, so a six-row cap is
 * six rows on both.
 */

import { useState, type ComponentType } from 'react';
import { TextInput, type TextInputProps } from 'react-native';
import { useControlled } from '@glacier/logic';
import { autoGrowMetrics, composeKeyIntent, resolveEnterPolicy } from '@glacier/logic';
// TODO(integration): switch to '@glacier/spec' once the compose specs are registered.
import {
  messageInputSizes,
  messageInputSpec,
} from '../../../../spec/src/components/message-input.ts';
import type { composeEnterPolicies } from '../../../../spec/src/components/message-input.ts';
import { t } from '../../tokens.ts';
import { sizeFor, dimensionsFor } from '../../resolve.ts';

// Derived from the spec so the unions cannot drift from the web kit.
export type MessageInputSize = (typeof messageInputSizes)[number];
export type ComposeEnterPolicy = (typeof composeEnterPolicies)[number];

export interface MessageInputProps
  extends Omit<TextInputProps, 'value' | 'defaultValue' | 'onChange' | 'style' | 'multiline'> {
  /** Controlled text. */
  value?: string;
  /** Initial text when uncontrolled. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Called with the current text when the policy says send. */
  onSend?: (value: string) => void;
  /** What the return key does. Resolves to `newline` on a device — see the header. */
  enterPolicy?: ComposeEnterPolicy;
  minRows?: number;
  maxRows?: number;
  /** Accepted-but-inert natively: there is no clipboard file API. */
  onPasteFiles?: (files: unknown[]) => void;
  /** Called with the caret offset as the selection moves. */
  onCaretChange?: (caret: number) => void;
  size?: MessageInputSize;
  disabled?: boolean;
  /** Drops the field's own border and fill, for a bar that draws them instead. */
  bare?: boolean;
}

/**
 * The permissive react-native d.ts stops at the single-line TextInput props, so
 * the growing field is typed through a narrow local alias — the same pattern
 * SeekBar uses for the responder props the shim does not declare. These are all
 * real TextInput props; only the shim is behind.
 */
const Field = TextInput as unknown as ComponentType<
  TextInputProps & {
    scrollEnabled?: boolean;
    blurOnSubmit?: boolean;
    returnKeyType?: 'default' | 'send';
    onSelectionChange?: (event: { nativeEvent: { selection: { start: number; end: number } } }) => void;
    onContentSizeChange?: (event: { nativeEvent: { contentSize: { width: number; height: number } } }) => void;
  }
>;

// Size-independent metrics read once from the spec.
const DIMS = dimensionsFor(messageInputSpec);

/** A token name becomes a custom property; a raw CSS length passes through. */
function metric(value: string | undefined, fallback: string): string {
  const v = value ?? fallback;
  return /^[.\d]/.test(v) ? v : t(v);
}

/**
 * The line box the row math measures in. React Native has no computed-style
 * read, so the leading token is resolved to the same 1.5 the web `leading-md`
 * carries and multiplied by the size's font size, which keeps a row here the
 * same height as a row there.
 */
const LINE_HEIGHT: Record<MessageInputSize, number> = { sm: 18, md: 21, lg: 24 };

/** Vertical padding + hairline borders per size, matching the spec's sizes. */
const CHROME: Record<MessageInputSize, number> = { sm: 18, md: 18, lg: 26 };

export function MessageInput({
  value: valueProp,
  defaultValue = '',
  onValueChange,
  onSend,
  enterPolicy = 'auto',
  minRows = 1,
  maxRows = 6,
  onPasteFiles: _onPasteFiles,
  onCaretChange,
  size = 'md',
  disabled = false,
  bare = false,
  ...rest
}: MessageInputProps) {
  const [value, setValue] = useControlled({ value: valueProp, defaultValue, onChange: onValueChange });
  const [contentHeight, setContentHeight] = useState<number | undefined>(undefined);

  const dims = sizeFor(messageInputSpec, size);
  // Touch is a fact about the runtime, not a guess: this binding only ever runs
  // on one.
  const policy = resolveEnterPolicy(enterPolicy, { touch: true });
  const { height, scrolls } = autoGrowMetrics({
    contentHeight,
    lineHeight: LINE_HEIGHT[size],
    chrome: CHROME[size],
    minRows,
    maxRows,
  });

  return (
    <Field
      multiline
      editable={!disabled}
      scrollEnabled={scrolls}
      value={value}
      onChangeText={setValue}
      // The only send route the runtime can express; `blurOnSubmit={false}`
      // keeps the keyboard up, which is the whole point of a chat composer.
      blurOnSubmit={false}
      returnKeyType={policy === 'send' ? 'send' : 'default'}
      onSubmitEditing={() => {
        if (composeKeyIntent({ key: 'Enter' }, policy) === 'send') onSend?.(value);
      }}
      onSelectionChange={(event) => onCaretChange?.(event.nativeEvent.selection.start)}
      onContentSizeChange={(event) => setContentHeight(event.nativeEvent.contentSize.height)}
      placeholderTextColor={t('text-subtle')}
      style={{
        height,
        width: '100%',
        color: t('text'),
        fontSize: metric(dims.fontSize, 'font-size-sm'),
        paddingVertical: metric(dims.paddingBlock, 'space-2'),
        paddingHorizontal: metric(dims.paddingInline, bare ? 'space-1' : 'space-3'),
        borderRadius: metric(DIMS.radius, 'radius-lg'),
        borderWidth: bare ? 0 : t('hairline'),
        borderColor: bare ? 'transparent' : t('border'),
        backgroundColor: bare ? 'transparent' : t('surface'),
        opacity: disabled ? 0.5 : 1,
      }}
      {...rest}
    />
  );
}
