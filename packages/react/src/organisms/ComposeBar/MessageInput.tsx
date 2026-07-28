import { useEffect, useLayoutEffect, useRef, type ClipboardEvent, type KeyboardEvent, type Ref } from 'react';
import {
  autoGrowMetrics,
  composeKeyIntent,
  resolveEnterPolicy,
  type ComposeEnterPolicy,
} from '@glacier/logic';
import { cx } from '../../internal/cx.ts';
import { useControlled } from '../../internal/useControlled.ts';
import { Textarea, type TextareaProps } from '../../atoms/inputs/Textarea/Textarea.tsx';
import styles from './MessageInput.module.css';

export type { ComposeEnterPolicy };

export interface MessageInputProps
  extends Omit<TextareaProps, 'value' | 'defaultValue' | 'onChange' | 'ref' | 'rows'> {
  /** Controlled text. */
  value?: string;
  /** Initial text when uncontrolled. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Called with the current text when the key policy says send. */
  onSend?: (value: string) => void;
  /** What a bare Enter does; `auto` resolves against the pointer. */
  enterPolicy?: ComposeEnterPolicy;
  /** Rows before anything is typed. */
  minRows?: number;
  /** Rows it may grow to before it stops growing and scrolls. */
  maxRows?: number;
  /** Called with the files on the clipboard when a paste carries any. */
  onPasteFiles?: (files: File[]) => void;
  /** Called with the caret offset after every edit or selection move. */
  onCaretChange?: (caret: number) => void;
  /**
   * Overrides the coarse-pointer probe that resolves `auto`. Docs and tests need
   * to pin a platform; apps almost never should.
   */
  touch?: boolean;
  /** The textarea element, for a parent that has to place the caret itself. */
  inputRef?: Ref<HTMLTextAreaElement>;
  /** Drops the field's own border and fill, for a bar that draws them instead. */
  bare?: boolean;
}

/**
 * Is this a touch device? A coarse pointer is the honest test — not the user
 * agent, and not "has touch events", which every laptop with a touchscreen also
 * has. Read once per render rather than subscribed to, since a pointer does not
 * change mid-keystroke.
 */
function hasCoarsePointer(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(pointer: coarse)').matches;
}

/** Vertical padding + borders, so the row math measures text and not the box. */
function chromeHeight(style: CSSStyleDeclaration): number {
  if (style.boxSizing !== 'border-box') return 0;
  const px = (value: string) => Number.parseFloat(value) || 0;
  return (
    px(style.paddingTop) + px(style.paddingBottom) + px(style.borderTopWidth) + px(style.borderBottomWidth)
  );
}

/**
 * The auto-growing field of a compose bar.
 *
 * It is @glacier/react's Textarea with three behaviours added, not a second
 * multi-line field: the paint, the focus ring, the sizes, the glass material and
 * the Field wiring are all Textarea's, and this only takes off `resize` and the
 * fixed min-height that a growing field cannot have. Building a new atom would
 * have meant a second textarea to keep in step with the first.
 *
 * The three behaviours:
 *
 * 1. **It grows with the text** up to `maxRows` and then scrolls. The height is
 *    set in the same layout pass as the keystroke and never eased — an animated
 *    field leaves the caret behind its own text.
 * 2. **Enter is a policy, not a constant.** `auto` sends on a keyboard and
 *    writes a newline on a touch device, where the send button is the send
 *    affordance and a mistyped send cannot be taken back. Shift+Enter is always
 *    a newline and Cmd/Ctrl+Enter is always send, everywhere. An open IME
 *    composition owns the key outright, so a Japanese candidate is never sent
 *    half-written. The rules are in @glacier/logic; the device fact is the
 *    only thing decided here.
 * 3. **Paste attaches.** A clipboard carrying files is swallowed, so pasting a
 *    screenshot attaches the image instead of dropping its filename into the
 *    text.
 */
export function MessageInput({
  value: valueProp,
  defaultValue = '',
  onValueChange,
  onSend,
  enterPolicy = 'auto',
  minRows = 1,
  maxRows = 6,
  onPasteFiles,
  onCaretChange,
  touch,
  inputRef,
  bare = false,
  size = 'md',
  disabled = false,
  className,
  onKeyDown,
  onPaste,
  onSelect,
  ...rest
}: MessageInputProps) {
  const innerRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useControlled(valueProp, defaultValue);

  /**
   * Measure, then set. The height is dropped to `auto` first so `scrollHeight`
   * reports what the content wants rather than what the box is already holding —
   * without it a field grows and never shrinks back.
   */
  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const style = window.getComputedStyle(el);
    const lineHeight =
      Number.parseFloat(style.lineHeight) || Number.parseFloat(style.fontSize) * 1.5 || 20;
    const { height, scrolls } = autoGrowMetrics({
      contentHeight: el.scrollHeight,
      lineHeight,
      chrome: chromeHeight(style),
      minRows,
      maxRows,
    });
    el.style.height = `${height}px`;
    el.style.overflowY = scrolls ? 'auto' : 'hidden';
  }, [value, minRows, maxRows, size]);

  // The caret matters to whatever is listening for an @-token, and it moves for
  // reasons that are not edits — an arrow key, a click, a selection.
  useEffect(() => {
    if (!onCaretChange) return;
    const el = innerRef.current;
    if (el) onCaretChange(el.selectionStart ?? value.length);
  }, [value, onCaretChange]);

  const policy = resolveEnterPolicy(enterPolicy, { touch: touch ?? hasCoarsePointer() });

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // The caller goes first: a mention popup owns Enter while it is open, and it
    // says so by consuming the event.
    onKeyDown?.(event);
    if (event.defaultPrevented || disabled) return;
    // React's synthetic event exposes the IME flag on the native event only.
    const composing = (event.nativeEvent as unknown as { isComposing?: boolean }).isComposing;
    const intent = composeKeyIntent(
      {
        key: event.key,
        shiftKey: event.shiftKey,
        metaKey: event.metaKey,
        ctrlKey: event.ctrlKey,
        altKey: event.altKey,
        isComposing: composing,
      },
      policy,
    );
    if (intent !== 'send') return;
    // Swallowed even with no handler: a bare Enter that meant send must not fall
    // through and insert a newline as well.
    event.preventDefault();
    onSend?.(value);
  };

  const handlePaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    onPaste?.(event);
    if (event.defaultPrevented || disabled || !onPasteFiles) return;
    const files = Array.from(event.clipboardData?.files ?? []);
    if (files.length === 0) return;
    // A screenshot on the clipboard is an attachment, not text.
    event.preventDefault();
    onPasteFiles(files);
  };

  return (
    <Textarea
      {...rest}
      ref={(node: HTMLTextAreaElement | null) => {
        innerRef.current = node;
        if (typeof inputRef === 'function') inputRef(node);
        else if (inputRef) (inputRef as { current: HTMLTextAreaElement | null }).current = node;
      }}
      size={size}
      disabled={disabled}
      rows={minRows}
      value={value}
      className={cx(styles.input, bare && styles.bare, className)}
      onChange={(event) => {
        setValue(event.target.value);
        onValueChange?.(event.target.value);
      }}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onSelect={(event) => {
        onSelect?.(event);
        onCaretChange?.(event.currentTarget.selectionStart ?? 0);
      }}
    />
  );
}
