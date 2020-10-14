import { useCallback, useEffect, useRef } from "react";

/**
 * Ensures that all registered promises are cancelled when the component unmounts
 */
export function usePromiseCancellation() {
  const promisesRef = useRef<Set<Promise<unknown>>>(new Set());

  const register = useCallback(<T>(promise: Promise<T>) => {
    promisesRef.current.add(promise);

    promise
      .catch((err) => {
        // TODO.ERROR: Display error to user or something?
        console.error(err);
      })
      .finally(() => {
        promisesRef.current.delete(promise);
      });
  }, []);

  useEffect(() => {
    const set = promisesRef.current;

    return () => {
      set.forEach((p) => {
        p.cancel();
      });
    };
  }, []);

  return { register };
}
