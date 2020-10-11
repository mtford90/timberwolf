// https://usehooks.com/useLocalStorage/

import { useCallback, useState } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prevState: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prevState: T) => T)) => {
      setStoredValue((prevStoredValue) => {
        const valueToStore =
          value instanceof Function ? value(prevStoredValue) : value;

        try {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
          console.log(error);
        }

        return valueToStore;
      });
    },
    [key]
  );

  return [storedValue, setValue];
}
