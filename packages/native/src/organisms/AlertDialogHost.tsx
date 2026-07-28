import { type ReactNode } from 'react';
import { Modal } from 'react-native';

export interface AlertDialogHostProps {
  onRequestClose: () => void;
  children: ReactNode;
}

export function AlertDialogHost({ onRequestClose, children }: AlertDialogHostProps) {
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onRequestClose}>
      {children}
    </Modal>
  );
}