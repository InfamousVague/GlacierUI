import { useCallback, useState } from 'react';

/** Controlled-or-uncontrolled state, the standard pattern for form controls. */
export function useControlled<T>(
  controlled: T | undefined,
  defaultValue: T,
): [T, (next: T) => void] {
  const [internal, setInternal] = useState(defaultValue);
  const isControlled = controlled !== undefined;
  const value = isControlled ? controlled : internal;
  const set = useCallback(
    (next: T) => {
      if (!isControlled) setInternal(next);
    },
    [isControlled],
  );
  return [value, set];
}
