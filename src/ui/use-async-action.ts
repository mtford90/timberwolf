import { useCallback } from "react";
import { useSafeState } from "./use-safe-state";

export function useAsyncAction<T>(
  asyncOperation: () => Promise<T>,
  deps: unknown[] = []
) {
  const [loading, setLoading] = useSafeState(false);
  const [error, setError] = useSafeState<Error | null>(null);
  const [value, setValue] = useSafeState<T | null>(null);

  const action = useCallback(() => {
    if (!loading) {
      setError(null);
      setLoading(true);
      asyncOperation()
        .then((newValue) => {
          setValue(newValue);
        })
        .catch((err) => {
          setError(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [loading, ...deps]);

  return { loading, action, error, value };
}
