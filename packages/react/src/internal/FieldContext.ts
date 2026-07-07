import { createContext, useContext } from 'react';

/**
 * Shared between the Field molecule (provider) and form-control atoms
 * (consumers), so atoms never import upward from molecules.
 */
export interface FieldContextValue {
  id: string;
  describedBy: string | undefined;
  invalid: boolean;
}

export const FieldContext = createContext<FieldContextValue | null>(null);

/** Form controls read their id / aria wiring from the surrounding Field, if any. */
export const useField = (): FieldContextValue | null => useContext(FieldContext);
