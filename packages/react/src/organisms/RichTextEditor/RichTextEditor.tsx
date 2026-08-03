import {
  activeMarks,
  activeBlock,
  tokenizeMarkdown,
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
 * A markdown editor with a formatting toolbar - the writable counterpart to
 * `CodeBlock`.
 *
 * Markdown over `contenteditable`, deliberately. A contenteditable surface is a
 * DOM-only construct with no React Native equivalent, so an editor built on one
 * could never have a native binding; and it means reimplementing selection,
 * undo, spellcheck, and dictation, all of which a plain `<textarea>` already
 * does properly. The value here is a string, and every transform is pure string
 * arithmetic living in @glacier/logic - so Bold does exactly the same thing
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
  const highlightRef = useRef<HTMLDivElement>(null);

  // The layer does not scroll itself - it is offset to follow the textarea, so
  // a long document stays aligned once the textarea starts scrolling.
  const syncScroll = () => {
    const layer = highlightRef.current;
    const field = textareaRef.current;
    if (!layer || !field) return;
    layer.scrollTop = field.scrollTop;
    layer.scrollLeft = field.scrollLeft;
  };
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

    // Written through the browser's own editing pipeline rather than by setting
    // state, so the edit joins the native undo stack and Ctrl/Cmd+Z steps back
    // through toolbar work the same as through typing. Assigning `value` from
    // React replaces the field's contents outright, which discards that history.
    //
    // Only the changed span is rewritten - the common prefix and suffix are left
    // alone - so undo returns the document a step at a time instead of swapping
    // the whole thing.
    const el = textareaRef.current;
    if (el && typeof document.execCommand === 'function') {
      const before = el.value;
      let head = 0;
      while (head < before.length && head < result.text.length && before[head] === result.text[head]) head++;
      let tail = 0;
      while (
        tail < before.length - head &&
        tail < result.text.length - head &&
        before[before.length - 1 - tail] === result.text[result.text.length - 1 - tail]
      ) {
        tail++;
      }

      el.focus();
      el.setSelectionRange(head, before.length - tail);
      // Returns false where the command is unsupported; the state write below
      // is then the fallback, and undo is simply unavailable rather than broken.
      if (document.execCommand('insertText', false, result.text.slice(head, result.text.length - tail))) return;
    }

    setValue(result.text);
  };

  const active = activeMarks(value, selection);
  const activeBlockForm = activeBlock(value, selection);
  const tokens = tokenizeMarkdown(value);

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
            // Reads the document as well as writing to it, like the mark
            // controls: a form the caret already sits in shows as pressed.
            aria-pressed={activeBlockForm === block}
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

      {/* The highlight and the textarea are one stacked box. The textarea keeps
          its own caret and selection but paints no glyphs; the layer beneath
          draws the same string as styled runs. Every metric that affects
          wrapping is shared through `.editorText`, because a single pixel of
          difference slides the highlight out from under the caret. */}
      <div className={styles.editorStack}>
        <div ref={highlightRef} className={cx(styles.editorText, styles.highlight)} aria-hidden="true">
          {tokens.map((token, i) => (
            <span
              key={i}
              className={styles.run}
              data-kind={token.kind}
              data-marks={token.marks.join(' ') || undefined}
              data-block={token.block}
            >
              {value.slice(token.start, token.end)}
            </span>
          ))}
          {/* A trailing newline leaves no run to give the last line height, so
              the layer would be shorter than the textarea and stop scrolling
              with it. */}
          {'\n'}
        </div>

      <textarea
        ref={textareaRef}
        id={id}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        className={cx(styles.editorText, styles.editor)}
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
        onScroll={syncScroll}
      />
      </div>

      {maxLength !== undefined && (
        <div className={styles.counter} aria-hidden="true">
          {value.length} / {maxLength}
        </div>
      )}
    </div>
  );
}
