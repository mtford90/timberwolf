import { useCallback, useState } from "react";

/**
 * Provides state management for unseen elements
 */
export function useUnseen<T>() {
  const [items, setItems] = useState<T[]>([]);

  const add = useCallback((rowId: T) => {
    setItems((rs) => [...rs, rowId]);
  }, []);

  const clear = useCallback((toRowId?: T) => {
    if (toRowId) {
      setItems((rs) => rs.filter((r) => r > toRowId));
    } else {
      setItems([]);
    }
  }, []);

  return { items, add, clear };
}
