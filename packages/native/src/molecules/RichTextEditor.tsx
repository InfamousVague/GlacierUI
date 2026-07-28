/**
 * @glacier/native — RichTextEditor.
 *
 * The React Native binding of @glacier/react's RichTextEditor: a markdown
 * editor with a formatting toolbar. Every transform — what Bold does to a
 * selection, which marks are active at the caret, how a block prefix toggles
 * across lines — comes from @glacier/logic, so a press of Bold produces
 * byte-identical text on both platforms.
 *
 * This is the payoff of choosing markdown over contenteditable: the value is a
 * string and the selection is a range, both of which a React Native TextInput
 * provides natively. A contenteditable editor could not have existed here at
 * all.
 *
 * Web-parity notes:
 * - Selection is tracked through onSelectionChange, the RN equivalent of the
 *   web's onSelect.
 * - Restoring the caret after a transform is done with the TextInput's
 *   controlled `selection` prop rather than an imperative setSelectionRange.
 * - The ⌘B / ⌘I / ⌘E shortcuts are a hardware-keyboard affordance; on a touch
 *   device the toolbar is the whole interface, and it is identical.
 */
import { useState, type ReactNode } from 'react';
import { View, Pressable, TextInput, Text as RNText } from 'react-native';
import { richTextEditorSpec } from '@glacier/spec';
import {
  activeMarks,
  tokenizeMarkdown,
  type MarkdownToken,
  toggleBlock,
  toggleMark,
  useControlled,
  type MarkdownBlock,
  type MarkdownMark,
  type TextSelection,
} from '@glacier/logic';
import { t } from '../tokens.ts';
import { paintFor, dimensionsFor } from '../resolve.ts';
import { Text } from '../atoms/display/Text.tsx';
import { Skeleton } from '../atoms/feedback/Skeleton.tsx';

export type { MarkdownMark, MarkdownBlock } from '@glacier/logic';

export interface RichTextEditorProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  marks?: MarkdownMark[];
  blocks?: MarkdownBlock[];
  rows?: number;
  maxLength?: number;
  disabled?: boolean;
  skeleton?: boolean;
  emptyLabel?: ReactNode;
  /** Web-only escape hatch; accepted for parity and ignored here. */
  className?: string;
}

const BOX = dimensionsFor(richTextEditorSpec);
const bare = (v?: string): string | undefined => (v?.startsWith('$') ? v.slice(1) : v);
const ACTIVE = paintFor(richTextEditorSpec, 'states', 'active');

const ALL_MARKS: MarkdownMark[] = ['bold', 'italic', 'code', 'strike'];
const ALL_BLOCKS: MarkdownBlock[] = ['heading', 'quote', 'bullet', 'number'];

/** The glyph each control shows, matching the web kit exactly. */
const MARK_GLYPH: Record<MarkdownMark, string> = { bold: 'B', italic: 'I', code: '</>', strike: 'S' };
const BLOCK_GLYPH: Record<MarkdownBlock, string> = { heading: 'H', quote: '❝', bullet: '•', number: '1.' };

/** The labels the web kit routes through kitMessages; mirrored here. */
const LABELS: Record<string, string> = {
  toolbar: 'Formatting',
  bold: 'Bold',
  italic: 'Italic',
  code: 'Inline code',
  strike: 'Strikethrough',
  heading: 'Heading',
  quote: 'Quote',
  bullet: 'Bulleted list',
  number: 'Numbered list',
};

/** One line of text at the editor's line height, for sizing the input. */
const LINE_HEIGHT = 21;

/**
 * How a run is painted, mirroring the web's `.run[data-...]` rules.
 *
 * Markers keep their place in the text but are spoken quietly, so the document
 * still reads as markdown while the content takes the styling it describes.
 */
function runStyle(token: MarkdownToken): Record<string, unknown> {
  if (token.kind === 'marker') return { color: t('text-subtle') };

  // Inside a fence, mirroring the web stylesheet rule for rule.
  if (token.kind === 'code-block') return { color: t('text-muted') };
  if (token.kind === 'code-lang') return { color: t('accent-text') };
  if (token.kind === 'code-keyword') return { color: t('accent-text'), fontWeight: t('font-weight-medium') };
  if (token.kind === 'code-string') return { color: t('success-text') };
  if (token.kind === 'code-number') return { color: t('warning-text') };
  if (token.kind === 'code-comment') return { color: t('text-subtle'), fontStyle: 'italic' };

  const style: Record<string, unknown> = {};
  if (token.marks.includes('bold')) style.fontWeight = t('font-weight-bold');
  if (token.marks.includes('italic')) style.fontStyle = 'italic';
  if (token.marks.includes('strike')) style.textDecorationLine = 'line-through';
  if (token.marks.includes('code')) style.color = t('accent-text');

  if (token.kind === 'link-text') {
    style.color = t('accent-text');
    style.textDecorationLine = 'underline';
  }
  if (token.kind === 'link-url') style.color = t('text-muted');

  if (token.block === 'heading') style.fontWeight = t('font-weight-bold');
  if (token.block === 'quote') {
    style.color = t('text-muted');
    style.fontStyle = 'italic';
  }
  return style;
}

/**
 * The Glacier RichTextEditor, rendered with React Native primitives. See the
 * file header for the parity contract.
 */
export function RichTextEditor({
  value: valueProp,
  defaultValue = '',
  onValueChange,
  placeholder,
  marks = ALL_MARKS,
  blocks = ALL_BLOCKS,
  rows = 8,
  maxLength,
  disabled = false,
  skeleton = false,
}: RichTextEditorProps) {
  const [value, setValue] = useControlled({ value: valueProp, defaultValue, onChange: onValueChange });
  const [selection, setSelection] = useState<TextSelection>({ start: 0, end: 0 });

  const radius = t(bare(BOX.radius) ?? 'radius-lg');
  const padding = t(bare(BOX.padding) ?? 'space-3');
  // Every property that decides where a character lands. Shared by the input
  // and the layer beneath it rather than repeated, so the two cannot be edited
  // apart and drift mid-line.
  const METRICS = {
    padding,
    fontFamily: t('font-mono'),
    fontSize: t('font-size-sm'),
    lineHeight: LINE_HEIGHT,
    textAlignVertical: 'top' as const,
  };
  const border = t(bare(BOX.border) ?? 'hairline');

  const active = activeMarks(value, selection);
  const tokens = tokenizeMarkdown(value);

  const apply = (result: { text: string; selection: TextSelection }) => {
    if (maxLength !== undefined && result.text.length > maxLength) return;
    setValue(result.text);
    // The controlled `selection` prop is how a caret is restored here; there is
    // no imperative setSelectionRange to call.
    setSelection(result.selection);
  };

  const control = (key: string, glyph: string, isActive: boolean, onPress: () => void) => (
    <Pressable
      key={key}
      accessibilityRole="button"
      accessibilityLabel={LABELS[key] ?? key}
      accessibilityState={{ disabled, selected: isActive }}
      disabled={disabled}
      onPress={onPress}
      style={{
        minWidth: 28,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: t('space-1'),
        borderRadius: t('radius-md'),
        backgroundColor: isActive ? t(ACTIVE.background ?? 'accent-soft') : 'transparent',
      }}
    >
      <Text size="sm" weight="semibold" tone={isActive ? undefined : 'muted'}>
        {glyph}
      </Text>
    </Pressable>
  );

  const frame = {
    width: '100%' as const,
    borderWidth: border,
    borderStyle: 'solid' as const,
    borderColor: t('border'),
    borderRadius: radius,
    backgroundColor: t('surface'),
    overflow: 'hidden' as const,
    opacity: disabled ? 0.5 : 1,
  };

  if (skeleton) {
    return (
      <View style={frame}>
        <View style={{ flexDirection: 'row', columnGap: t('space-1'), padding: t('space-2') }}>
          {[...marks, ...blocks].map((key) => (
            <Skeleton key={key} width={28} height={28} radius={t('radius-md')} />
          ))}
        </View>
        <Skeleton width="100%" height={rows * LINE_HEIGHT} radius="0" />
      </View>
    );
  }

  return (
    <View style={frame}>
      <View
        accessibilityRole="toolbar"
        accessibilityLabel={LABELS.toolbar}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          columnGap: t('space-1'),
          paddingVertical: t('space-1'),
          paddingHorizontal: t('space-2'),
          borderBottomWidth: border,
          borderBottomColor: t('border'),
          borderStyle: 'solid',
          backgroundColor: t('surface-raised'),
        }}
      >
        {marks.map((mark) =>
          control(mark, MARK_GLYPH[mark], active.includes(mark), () => apply(toggleMark(value, selection, mark))),
        )}
        {blocks.length > 0 && marks.length > 0 && (
          <View style={{ width: border, height: 16, marginHorizontal: t('space-1'), backgroundColor: t('border') }} />
        )}
        {blocks.map((block) =>
          control(block, BLOCK_GLYPH[block], false, () => apply(toggleBlock(value, selection, block))),
        )}
      </View>

      {/* The highlight and the input are one stacked box, as on web. The input
          keeps its caret and selection but paints no glyphs; the layer beneath
          draws the same string as styled runs. Every metric that decides where
          a character lands is shared through METRICS, because a difference of
          one pixel slides the highlight out from under the caret.

          Not TextInput children, which render styled text on a device but not
          through react-native-web — the docs would then show a highlight the
          native pane could not actually be demonstrating. */}
      <View style={{ position: 'relative' }}>
        <RNText
          style={{ ...METRICS, color: t('text'), position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          pointerEvents="none"
        >
          {tokens.map((token, i) => (
            <RNText key={i} style={runStyle(token)}>
              {value.slice(token.start, token.end)}
            </RNText>
          ))}
        </RNText>

      <TextInput
        value={value}
        onChangeText={setValue}
        selection={selection}
        onSelectionChange={(event: { nativeEvent: { selection: TextSelection } }) =>
          setSelection(event.nativeEvent.selection)
        }
        placeholder={placeholder}
        placeholderTextColor={t('text-subtle')}
        editable={!disabled}
        multiline
        maxLength={maxLength}
        style={{
          ...METRICS,
          // The glyphs come from the layer beneath; the input contributes only
          // its caret and selection. Hiding it outright would take the caret
          // with it.
          color: 'transparent',
          // Transparent text takes the caret with it. `caretColor` restores it
          // under react-native-web; `selectionColor` below is the same job on a
          // device, where the style property does not exist.
          caretColor: t('text'),
          minHeight: rows * LINE_HEIGHT,
        }}
        selectionColor={t('text')}
      />
      </View>

      {maxLength !== undefined && (
        <View
          style={{
            paddingVertical: t('space-1'),
            paddingHorizontal: t('space-3'),
            borderTopWidth: border,
            borderTopColor: t('border'),
            borderStyle: 'solid',
            alignItems: 'flex-end',
          }}
        >
          <Text size="xs" tone="subtle">
            {`${value.length} / ${maxLength}`}
          </Text>
        </View>
      )}
    </View>
  );
}
