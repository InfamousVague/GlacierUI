import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { useRef, useState } from 'react';
import { useDialogLayer } from '../src/internal/useDialogLayer.ts';

/**
 * Exercises the shared modal-layer hook directly through a bare harness, the
 * same way the anchored-position engine is tested: the hook owns scroll lock,
 * the Tab trap, Escape dismissal, and opener restore for every overlay.
 */
function Layer({
  open = true,
  onClose = () => {},
  dismissible,
  useInitialFocus = false,
  buttons = 2,
}: {
  open?: boolean;
  onClose?: () => void;
  dismissible?: boolean;
  useInitialFocus?: boolean;
  buttons?: number;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const initialFocusRef = useRef<HTMLButtonElement>(null);
  useDialogLayer({
    open,
    onClose,
    dialogRef,
    initialFocusRef: useInitialFocus ? initialFocusRef : undefined,
    dismissible,
  });
  if (!open) return null;
  return (
    <div ref={dialogRef} role="dialog" aria-label="Layer" tabIndex={-1}>
      {buttons > 0 && (
        <button type="button" ref={initialFocusRef}>
          first
        </button>
      )}
      {buttons > 1 && <button type="button">last</button>}
    </div>
  );
}

const byText = (text: string) => {
  const el = [...document.querySelectorAll('button')].find((b) => b.textContent === text);
  expect(el).toBeDefined();
  return el!;
};

describe('useDialogLayer', () => {
  it('focuses the dialog itself when no initial focus ref is given', () => {
    const { getByRole } = render(<Layer />);
    expect(getByRole('dialog')).toHaveFocus();
  });

  it('keeps focus inside on re-render, even when onClose is a fresh function each render', () => {
    // Mirrors the common call site: an inline `onClose` arrow, plus local state
    // (a text field) whose updates re-render the dialog on every keystroke.
    function Harness() {
      const [text, setText] = useState('');
      const dialogRef = useRef<HTMLDivElement>(null);
      useDialogLayer({ open: true, onClose: () => {}, dialogRef });
      return (
        <div ref={dialogRef} role="dialog" aria-label="Layer" tabIndex={-1}>
          <input aria-label="name" value={text} onChange={(e) => setText(e.target.value)} />
        </div>
      );
    }
    const { getByLabelText } = render(<Harness />);
    const input = getByLabelText('name') as HTMLInputElement;
    input.focus();
    expect(input).toHaveFocus();
    // Each change re-renders with a brand-new onClose identity; the layer must
    // not tear down and re-focus the dialog, or typing would drop focus.
    fireEvent.change(input, { target: { value: 'a' } });
    expect(input).toHaveFocus();
    fireEvent.change(input, { target: { value: 'ab' } });
    expect(input).toHaveFocus();
  });

  it('focuses the initial focus ref when given', () => {
    render(<Layer useInitialFocus />);
    expect(byText('first')).toHaveFocus();
  });

  it('wraps Tab from the last focusable back to the first', () => {
    render(<Layer />);
    byText('last').focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(byText('first')).toHaveFocus();
  });

  it('pulls focus back inside when Tab is pressed with focus outside the dialog', () => {
    render(<Layer />);
    const outside = document.createElement('button');
    document.body.append(outside);
    outside.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(byText('first')).toHaveFocus();
    outside.remove();
  });

  it('wraps Shift+Tab from the first focusable to the last', () => {
    render(<Layer useInitialFocus />);
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(byText('last')).toHaveFocus();
  });

  it('wraps Shift+Tab from the dialog itself to the last focusable', () => {
    const { getByRole } = render(<Layer />);
    getByRole('dialog').focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(byText('last')).toHaveFocus();
  });

  it('keeps focus on the dialog when it holds nothing focusable', () => {
    const { getByRole } = render(<Layer buttons={0} />);
    const dialog = getByRole('dialog');
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(dialog).toHaveFocus();
  });

  it('closes on Escape when dismissible and ignores other keys', () => {
    const onClose = vi.fn();
    render(<Layer onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('swallows Escape when not dismissible', () => {
    const onClose = vi.fn();
    render(<Layer onClose={onClose} dismissible={false} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('does nothing while closed', () => {
    const onClose = vi.fn();
    render(<Layer open={false} onClose={onClose} />);
    expect(document.body.style.overflow).toBe('');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('ref-counts the scroll lock across stacked layers and restores the opener', () => {
    document.body.style.overflow = 'auto';
    const opener = document.createElement('button');
    document.body.append(opener);
    opener.focus();

    const first = render(<Layer />);
    const second = render(<Layer useInitialFocus />);
    expect(document.body.style.overflow).toBe('hidden');

    second.unmount();
    expect(document.body.style.overflow).toBe('hidden');

    first.unmount();
    expect(document.body.style.overflow).toBe('auto');
    expect(opener).toHaveFocus();

    opener.remove();
    document.body.style.overflow = '';
  });
});
