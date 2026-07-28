import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { RichTextEditor } from '../src/index.ts';

const setup = (props: Partial<React.ComponentProps<typeof RichTextEditor>> = {}) => {
  const onValueChange = vi.fn();
  render(<RichTextEditor onValueChange={onValueChange} {...props} />);
  const editor = screen.getByRole('textbox') as HTMLTextAreaElement;
  return { onValueChange, editor };
};

/** Selects a range in the textarea and tells the component about it. */
function select(editor: HTMLTextAreaElement, start: number, end: number) {
  editor.setSelectionRange(start, end);
  fireEvent.select(editor);
}

const press = (name: string) => fireEvent.mouseDown(screen.getByLabelText(name));

describe('RichTextEditor', () => {
  it('is a real textarea, not a contenteditable', () => {
    // So it inherits the platform's editing, selection, spellcheck, dictation,
    // and undo rather than reimplementing them badly.
    const { editor } = setup();
    expect(editor.tagName).toBe('TEXTAREA');
  });

  it('offers the formatting controls', () => {
    setup();
    for (const label of ['Bold', 'Italic', 'Inline code', 'Strikethrough']) {
      expect(screen.getByLabelText(label)).toBeTruthy();
    }
  });

  it('bolds the selection', () => {
    const { editor, onValueChange } = setup({ defaultValue: 'hello world' });
    select(editor, 0, 5);
    press('Bold');
    expect(onValueChange).toHaveBeenCalledWith('**hello** world');
  });

  it('unbolds a selection that is already bold', () => {
    const { editor, onValueChange } = setup({ defaultValue: '**hello** world' });
    select(editor, 2, 7);
    press('Bold');
    expect(onValueChange).toHaveBeenCalledWith('hello world');
  });

  it('italicises, codes, and strikes', () => {
    for (const [label, expected] of [
      ['Italic', '_hi_'],
      ['Inline code', '`hi`'],
      ['Strikethrough', '~~hi~~'],
    ] as const) {
      const { editor, onValueChange } = setup({ defaultValue: 'hi' });
      select(editor, 0, 2);
      press(label);
      expect(onValueChange).toHaveBeenCalledWith(expected);
      screen.getByRole('textbox').remove();
      document.body.innerHTML = '';
    }
  });

  it('shows a control as pressed when its mark surrounds the caret', () => {
    // This is what lets you tell "this is bold" from "make this bold".
    const { editor } = setup({ defaultValue: '**hello** world' });
    select(editor, 2, 7);
    expect(screen.getByLabelText('Bold').getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByLabelText('Italic').getAttribute('aria-pressed')).toBe('false');
  });

  it('keeps the formatted words selected', () => {
    const { editor } = setup({ defaultValue: 'hello world' });
    select(editor, 0, 5);
    press('Bold');
    expect(editor.value.slice(editor.selectionStart, editor.selectionEnd)).toBe('hello');
  });

  it('returns focus to the editor after a toolbar press', () => {
    // Otherwise the user has to click back into the field to keep typing.
    const { editor } = setup({ defaultValue: 'hello' });
    select(editor, 0, 5);
    press('Bold');
    expect(document.activeElement).toBe(editor);
  });

  it('quotes the line the caret is on', () => {
    const { editor, onValueChange } = setup({ defaultValue: 'hello' });
    select(editor, 2, 2);
    press('Quote');
    expect(onValueChange).toHaveBeenCalledWith('> hello');
  });

  it('bullets every line the selection touches', () => {
    const { editor, onValueChange } = setup({ defaultValue: 'one\ntwo' });
    select(editor, 0, 7);
    press('Bulleted list');
    expect(onValueChange).toHaveBeenCalledWith('- one\n- two');
  });

  it('numbers a list as it goes', () => {
    const { editor, onValueChange } = setup({ defaultValue: 'one\ntwo\nthree' });
    select(editor, 0, 13);
    press('Numbered list');
    expect(onValueChange).toHaveBeenCalledWith('1. one\n2. two\n3. three');
  });

  it('applies a heading', () => {
    const { editor, onValueChange } = setup({ defaultValue: 'Title' });
    select(editor, 0, 5);
    press('Heading');
    expect(onValueChange).toHaveBeenCalledWith('# Title');
  });

  describe('keyboard shortcuts', () => {
    it('bolds on Cmd+B', () => {
      const { editor, onValueChange } = setup({ defaultValue: 'hello' });
      select(editor, 0, 5);
      fireEvent.keyDown(editor, { key: 'b', metaKey: true });
      expect(onValueChange).toHaveBeenCalledWith('**hello**');
    });

    it('italicises on Ctrl+I', () => {
      const { editor, onValueChange } = setup({ defaultValue: 'hello' });
      select(editor, 0, 5);
      fireEvent.keyDown(editor, { key: 'i', ctrlKey: true });
      expect(onValueChange).toHaveBeenCalledWith('_hello_');
    });

    it('leaves an unmodified letter alone', () => {
      const { editor, onValueChange } = setup({ defaultValue: 'hello' });
      select(editor, 0, 5);
      fireEvent.keyDown(editor, { key: 'b' });
      expect(onValueChange).not.toHaveBeenCalled();
    });
  });

  it('types normally', () => {
    const { editor, onValueChange } = setup();
    fireEvent.change(editor, { target: { value: 'typed' } });
    expect(onValueChange).toHaveBeenCalledWith('typed');
  });

  it('honours a controlled value', () => {
    setup({ value: 'controlled' });
    expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('controlled');
  });

  it('shows a counter when a limit is set', () => {
    setup({ defaultValue: 'abc', maxLength: 10 });
    expect(screen.getByText('3 / 10')).toBeTruthy();
  });

  it('refuses a transform that would exceed the limit', () => {
    // Bolding adds four characters; at the limit that would silently truncate.
    const { editor, onValueChange } = setup({ defaultValue: 'hello', maxLength: 6 });
    select(editor, 0, 5);
    press('Bold');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('offers only the controls asked for', () => {
    setup({ marks: ['bold'], blocks: [] });
    expect(screen.getByLabelText('Bold')).toBeTruthy();
    expect(screen.queryByLabelText('Italic')).toBeNull();
    expect(screen.queryByLabelText('Quote')).toBeNull();
  });

  it('labels the toolbar as a group so it can be skipped', () => {
    // Someone who wants to type should not Tab through eight buttons first.
    setup();
    expect(screen.getByRole('group', { name: 'Formatting' })).toBeTruthy();
  });

  it('freezes when disabled', () => {
    const { editor, onValueChange } = setup({ defaultValue: 'hello', disabled: true });
    expect(editor.disabled).toBe(true);
    expect((screen.getByLabelText('Bold') as HTMLButtonElement).disabled).toBe(true);
    select(editor, 0, 5);
    fireEvent.keyDown(editor, { key: 'b', metaKey: true });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('keeps its geometry while loading', () => {
    const { container } = render(<RichTextEditor skeleton rows={4} />);
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(container.querySelectorAll('[class*="toolbar"]')).toHaveLength(1);
  });

  it('has no axe violations', async () => {
    const { container } = render(<RichTextEditor defaultValue="hello" aria-label="Notes" />);
    const results = await axe.run(container, { rules: { region: { enabled: false } } });
    expect(results.violations).toEqual([]);
  });
});
