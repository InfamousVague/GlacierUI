import {
  activeMarks,
  markForShortcut,
  toggleBlock,
  toggleMark,
  useControlled,
  type MarkdownBlock,
  type MarkdownMark,
  type TextSelection,
} from '@glacier/logic';
import { useLayoutEffect, useRef, useState, type ComponentProps, type KeyboardEvent } from 'react';
import { cx } from '../../internal/cx.ts';
import { useT } from '../../i18n/LocaleProvider.tsx';
import { kitMessages } from '../../i18n/messages.ts';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import styles from './RichTextEditor.module.css';

export type { MarkdownMark, MarkdownBlock } from '@glacier/logic';

export interface RichTextEditorProps extends Omit<ComponentProps<'div'>, 'onChange' | 'defaultValue'> {
  /** Controlled markdown text. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  /** Which inline controls to offer. Defaults to all four. */
  marks?: MarkdownMark[];
  /** Which block controls to offer. Defaults to all four. */
  blocks?: MarkdownBlock[];
  rows?: number;
  maxLength?: number;
  disabled?: boolean;
  skeleton?: boolean;
}

const ALL_MARKS: MarkdownMark[] = ['bold', 'italic', 'code', 'strike'];
const ALL_BLOCKS: MarkdownBlock[] = ['heading', 'quote', 'bullet', 'number'];

/** The glyph each control shows. Text, not icons: these are typographic marks. */
const MARK_GLYPH: Record<MarkdownMark, string> = { bold: 'B', italic: 'I', code: '</>', strike: 'S' };
const BLOCK_GLYPH: Record<MarkdownBlock, string> = { heading: 'H', quote: '❝', bullet: '•', number: '1.' };

/**
 * A markdown editor with a formatting toolbar — the writable counterpart to
 * `CodeBlock`.
 *
 * Markdown over `contenteditable`, deliberately. A contenteditable surface is a
 * DOM-only construct with no React Native equivalent, so an editor built on one
 * could never have a native binding; and it means reimplementing selection,
 * undo, spellcheck, and dictation, all of which a plain `<textarea>` already
 * does properly. The value here is a string, and every transform is pure string
 * arithmetic living in @glacier/logic — so Bold does exactly the same thing
 * in the native editor.
 *
 * The toolbar reads the document as well as writing to it: a control is pressed
 * when its mark already surrounds the caret, which is what lets you tell "this
 * is bold" from "make this bold".
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
  className,
  // The accessible name belongs on the textarea, not on the wrapper: a label
  // spread onto the outer div leaves the field itself unnamed, which is a
  // failure a screen reader hits and axe catches.
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  ...rest
}: RichTextEditorProps) {
  const t = useT();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useControlled({ value: valueProp, defaultValue, onChange: onValueChange });
  const [selection, setSelection] = useState<TextSelection>({ start: 0, end: 0 });

  // After a transform the text and the selection change together. Restoring the
  // range in a layout effect puts the caret back before the browser paints, so
  // it never visibly jumps to the end of the field first.
  const pending = useRef<TextSelection | null>(null);
  useLayoutEffect(() => {
    const next = pending.current;
    const el = textareaRef.current;
    if (!next || !el) return;
    pending.current = null;
    el.focus();
    el.setSelectionRange(next.start, next.end);
    setSelection(next);
  }, [value]);

  const readSelection = () => {
    const el = textareaRef.current;
    if (el) setSelection({ start: el.selectionStart, end: el.selectionEnd });
  };

  const apply = (result: { text: string; selection: TextSelection }) => {
    if (maxLength !== undefined && result.text.length > maxLength) return;
    pending.current = result.selection;
    setValue(result.text);
  };

  const active = activeMarks(value, selection);

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    const mark = markForShortcut(event);
    if (!mark || disabled) return;
    event.preventDefault();
    apply(toggleMark(value, { start: event.currentTarget.selectionStart, end: event.currentTarget.selectionEnd }, mark));
  };

  if (skeleton) {
    return (
      <div className={cx(styles.root, className)} {...rest}>
        <div className={styles.toolbar}>
          {[...marks, ...blocks].map((key) => (
            <Skeleton key={key} width="1.75rem" height="1.75rem" radius="var(--glacier-radius-md)" />
          ))}
        </div>
        <Skeleton width="100%" height={`${rows * 1.5}rem`} radius="0" />
      </div>
    );
  }

  return (
    <div className={cx(styles.root, className)} data-disabled={disabled || undefined} {...rest}>
      {/* A labelled group, so someone who just wants to type can skip it rather
          than Tab through eight buttons first. */}
      <div className={styles.toolbar} role="group" aria-label={t(kitMessages.editorToolbar)}>
        {marks.map((mark) => (
          <button
            key={mark}
            type="button"
            className={cx(styles.control, mark === 'italic' && styles.italic, mark === 'code' && styles.mono)}
            // Pressed state is what makes the toolbar readable rather than
            // merely operable.
            aria-pressed={active.includes(mark)}
            aria-label={t(kitMessages[`editor${mark[0]!.toUpperCase()}${mark.slice(1)}` as 'editorBold'])}
            disabled={disabled}
            // mousedown, not click: click fires after the textarea has already
            // lost focus and thrown away the selection being formatted.
            onMouseDown={(event) => {
              event.preventDefault();
              apply(toggleMark(value, selection, mark));
            }}
          >
            {MARK_GLYPH[mark]}
          </button>
        ))}

        {blocks.length > 0 && marks.length > 0 && <span className={styles.divider} aria-hidden="true" />}

        {blocks.map((block) => (
          <button
            key={block}
            type="button"
            className={styles.control}
            aria-label={t(kitMessages[`editor${block[0]!.toUpperCase()}${block.slice(1)}` as 'editorHeading'])}
            disabled={disabled}
            onMouseDown={(event) => {
              event.preventDefault();
              apply(toggleBlock(value, selection, block));
            }}
          >
            {BLOCK_GLYPH[block]}
          </button>
        ))}
      </div>

      <textarea
        ref={textareaRef}
        id={id}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        className={styles.editor}
        value={value}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        disabled={disabled}
        spellCheck
        onChange={(event) => setValue(event.target.value)}
        onSelect={readSelection}
        onKeyUp={readSelection}
        onClick={readSelection}
        onKeyDown={onKeyDown}
      />

      {maxLength !== undefined && (
        <div className={styles.counter} aria-hidden="true">
          {value.length} / {maxLength}
        </div>
      )}
    </div>
  );
}
