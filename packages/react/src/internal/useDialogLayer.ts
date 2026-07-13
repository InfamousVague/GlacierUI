import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

let scrollLockCount = 0;
let previousOverflow = '';

function focusableElements(dialog: HTMLElement): HTMLElement[] {
  return [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((element) => !element.hasAttribute('disabled'));
}

export interface DialogLayerOptions {
  open: boolean;
  onClose: () => void;
  dialogRef: RefObject<HTMLElement | null>;
  initialFocusRef?: RefObject<HTMLElement | null>;
  dismissible?: boolean;
}

/**
 * Shared modal-layer behavior for overlays that block the surrounding page.
 * It locks scrolling, traps Tab focus, restores the opening element on close,
 * and optionally allows Escape dismissal.
 */
export function useDialogLayer({
  open,
  onClose,
  dialogRef,
  initialFocusRef,
  dismissible = true,
}: DialogLayerOptions) {
  // Keep the latest callback and options in a ref so the setup below runs once
  // per open, not on every render. Callers routinely pass a fresh inline
  // onClose each render; if the effect depended on it, it would re-run and
  // re-focus the dialog on every keystroke, yanking focus out of an input.
  const latest = useRef({ onClose, dismissible, initialFocusRef });
  latest.current = { onClose, dismissible, initialFocusRef };

  useEffect(() => {
    if (!open) return;

    const opener = document.activeElement as HTMLElement | null;
    if (scrollLockCount === 0) previousOverflow = document.body.style.overflow;
    scrollLockCount += 1;
    document.body.style.overflow = 'hidden';

    const dialog = dialogRef.current;
    (latest.current.initialFocusRef?.current ?? dialog)?.focus();

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (latest.current.dismissible) {
          event.preventDefault();
          latest.current.onClose();
        }
        return;
      }
      if (event.key !== 'Tab') return;

      const currentDialog = dialogRef.current;
      if (!currentDialog) return;
      const focusable = focusableElements(currentDialog);
      if (focusable.length === 0) {
        event.preventDefault();
        currentDialog.focus();
        return;
      }

      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (event.shiftKey && (document.activeElement === first || document.activeElement === currentDialog)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !currentDialog.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      scrollLockCount = Math.max(0, scrollLockCount - 1);
      if (scrollLockCount === 0) document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      opener?.focus();
    };
    // Set up once per open. onClose/dismissible/initialFocusRef are read live
    // from the ref above, so their identity changing between renders must not
    // tear down and rebuild this layer (which would steal focus).
  }, [dialogRef, open]);
}