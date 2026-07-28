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
import { View, Pressable, TextInput } from 'react-native';
import { richTextEditorSpec } from '@glacier/spec';
import {
  activeMarks,
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
  const border = t(bare(BOX.border) ?? 'hairline');

  const active = activeMarks(value, selection);

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
          padding,
          color: t('text'),
          // Monospace, because the value IS markdown: the markers should read
          // as syntax rather than as stray punctuation.
          fontFamily: t('font-mono'),
          fontSize: t('font-size-sm'),
          lineHeight: LINE_HEIGHT,
          minHeight: rows * LINE_HEIGHT,
          textAlignVertical: 'top',
        }}
      />

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
