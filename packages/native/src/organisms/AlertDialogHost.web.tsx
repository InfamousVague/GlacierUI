import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { View } from 'react-native';

export interface AlertDialogHostProps {
  onRequestClose: () => void;
  children: ReactNode;
}

export function AlertDialogHost({ onRequestClose, children }: AlertDialogHostProps) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onRequestClose();
    };
    document.addEventListener('keydown', closeOnEscape, true);
    return () => document.removeEventListener('keydown', closeOnEscape, true);
  }, [onRequestClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <View
      style={{
        position: 'fixed' as never,
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 9999,
      }}
    >
      {children}
    </View>,
    document.body,
  );
}